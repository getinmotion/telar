"""
Semantic Search Service.

Responsibilities:
  - Generate embeddings from plain text (delegates to EmbeddingService)
  - Persist embeddings to shop.product_embeddings / shop.store_embeddings
  - Execute cosine-similarity searches against those tables
  - Batch-index all products (or a subset) from shop.products_core

Database backend: asyncpg pool pointing at CATALOG_DB_URL (Lightsail PostgreSQL).
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any

from src.database.pg_client import get_pool
from src.services.embedding_service import embedding_service
from src.utils.enhanced_logger import create_enhanced_logger

logger = create_enhanced_logger(__name__)

# ---------------------------------------------------------------------------
# SQL: full semantic text query (products_core + taxonomy joins)
# Returns one row per product with product_id and full_semantic_text.
# ---------------------------------------------------------------------------
_PRODUCT_SEMANTIC_TEXT_SQL = """
SELECT
    pc.id                          AS product_id,
    pc.name                        AS product_name,
    pc.short_description,
    pc.history,
    tc.name                        AS craft_name,
    tt_primary.name                AS primary_technique,
    tt_secondary.name              AS secondary_technique,
    tcc.name                       AS curatorial_category,
    pai.piece_type::TEXT           AS piece_type,
    pai.style::TEXT                AS style,
    pai.process_type::TEXT         AS process_type,
    pai.estimated_elaboration_time,
    COALESCE(mat.materials_list, '') AS materials,
    CONCAT_WS(' | ',
        pc.name,
        pc.short_description,
        pc.history,
        'Oficio: '             || tc.name,
        'Tecnica Principal: '  || tt_primary.name,
        'Tecnica Secundaria: ' || tt_secondary.name,
        'Cat. Curatorial: '    || tcc.name,
        'Tipo de pieza: '      || pai.piece_type::TEXT,
        'Estilo: '             || pai.style::TEXT,
        'Proceso: '            || pai.process_type::TEXT,
        'Materiales: '         || mat.materials_list
    ) AS full_semantic_text
FROM shop.products_core pc
LEFT JOIN shop.product_artisanal_identity pai
    ON pc.id = pai.product_id
LEFT JOIN taxonomy.crafts tc
    ON pai.primary_craft_id = tc.id
LEFT JOIN taxonomy.techniques tt_primary
    ON pai.primary_technique_id = tt_primary.id
LEFT JOIN taxonomy.techniques tt_secondary
    ON pai.secondary_technique_id = tt_secondary.id
LEFT JOIN taxonomy.curatorial_categories tcc
    ON pai.curatorial_category_id = tcc.id
LEFT JOIN (
    SELECT pml.product_id,
           STRING_AGG(tm.name, ', ' ORDER BY tm.name) AS materials_list
    FROM shop.product_materials_link pml
    JOIN taxonomy.materials tm ON pml.material_id = tm.id
    GROUP BY pml.product_id
) mat ON pc.id = mat.product_id
WHERE pc.deleted_at IS NULL
"""

_PRODUCT_SEMANTIC_TEXT_BY_ID_SQL = _PRODUCT_SEMANTIC_TEXT_SQL + "  AND pc.id = $1"

_PRODUCT_SEMANTIC_TEXT_BULK_SQL = _PRODUCT_SEMANTIC_TEXT_SQL + "  AND pc.id = ANY($1::uuid[])"

# ---------------------------------------------------------------------------
# SQL: vector search
# ---------------------------------------------------------------------------
_PRODUCT_SEARCH_SQL = """
SELECT
    pc.id                                                    AS product_id,
    pc.name                                                  AS product_name,
    pc.short_description,
    pc.history,
    pe.semantic_text,
    pe.model,
    pe.generated_at,
    1 - (pe.embedding <=> $1::vector)                        AS similarity,
    tc.name                                                  AS craft_name,
    pai.piece_type::TEXT                                     AS piece_type,
    pai.style::TEXT                                          AS style,
    pai.process_type::TEXT                                   AS process_type,
    COALESCE(mat.materials_list, '')                         AS materials,
    sc.name                                                  AS store_name,
    sc.id                                                    AS store_id,
    cat.name                                                 AS category_name
FROM shop.product_embeddings pe
JOIN shop.products_core pc
    ON pe.product_id = pc.id
LEFT JOIN shop.stores sc
    ON pc.store_id = sc.id
LEFT JOIN shop.product_artisanal_identity pai
    ON pc.id = pai.product_id
LEFT JOIN taxonomy.crafts tc
    ON pai.primary_craft_id = tc.id
LEFT JOIN taxonomy.categories cat
    ON pc.category_id = cat.id
LEFT JOIN (
    SELECT pml.product_id,
           STRING_AGG(tm.name, ', ' ORDER BY tm.name) AS materials_list
    FROM shop.product_materials_link pml
    JOIN taxonomy.materials tm ON pml.material_id = tm.id
    GROUP BY pml.product_id
) mat ON pc.id = mat.product_id
WHERE pc.deleted_at IS NULL
  AND pc.status IN ('approved', 'approved_with_edits')
  AND 1 - (pe.embedding <=> $1::vector) >= $2
ORDER BY pe.embedding <=> $1::vector
LIMIT $3
"""

# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class ProductSearchResult:
    product_id: str
    product_name: str
    short_description: str | None
    history: str | None
    similarity: float
    craft_name: str | None
    piece_type: str | None
    style: str | None
    process_type: str | None
    materials: str
    store_name: str | None
    store_id: str | None
    category_name: str | None
    semantic_text: str
    model: str
    generated_at: Any


@dataclass
class IndexingStatus:
    running: bool = False
    total: int = 0
    indexed: int = 0
    failed: int = 0
    started_at: float | None = None
    finished_at: float | None = None
    errors: list[str] = field(default_factory=list)

    @property
    def elapsed_seconds(self) -> float | None:
        if self.started_at is None:
            return None
        end = self.finished_at or time.time()
        return round(end - self.started_at, 1)

    def to_dict(self) -> dict:
        return {
            "running": self.running,
            "total": self.total,
            "indexed": self.indexed,
            "failed": self.failed,
            "elapsed_seconds": self.elapsed_seconds,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "errors": self.errors[-20:],  # last 20 errors only
        }


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class SemanticSearchService:
    """
    Core service for embedding generation, vector search and batch indexing.

    All heavy I/O (DB reads/writes, OpenAI calls) is async.
    """

    # Batch size when calling OpenAI embeddings API in parallel
    _EMBED_BATCH_SIZE = 20

    # Current embedding schema version; bump this to trigger re-indexing
    _EMBEDDING_VERSION = 1

    def __init__(self) -> None:
        self._indexing_status = IndexingStatus()
        self._indexing_lock = asyncio.Lock()

    # ------------------------------------------------------------------
    # Public: single embedding generation
    # ------------------------------------------------------------------

    async def generate_embedding(self, text: str) -> list[float]:
        """Generate a single embedding vector from arbitrary text."""
        return await embedding_service.generate_embedding(text)

    # ------------------------------------------------------------------
    # Public: upsert a single product embedding (called by NestJS flow)
    # ------------------------------------------------------------------

    async def upsert_product_embedding(
        self,
        product_id: str,
        text: str,
        model: str,
        vector: list[float],
    ) -> None:
        """
        Persist (insert or update) one product embedding.

        NestJS calls /embeddings/generate to get the vector, then calls
        this via /index/products/single to save it without re-generating.
        """
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO shop.product_embeddings
                    (product_id, embedding, model, semantic_text, version, generated_at)
                VALUES ($1, $2::vector, $3, $4, $5, now())
                ON CONFLICT (product_id) DO UPDATE SET
                    embedding     = EXCLUDED.embedding,
                    model         = EXCLUDED.model,
                    semantic_text = EXCLUDED.semantic_text,
                    version       = EXCLUDED.version,
                    generated_at  = now()
                """,
                product_id,
                _encode_vector(vector),
                model,
                text,
                self._EMBEDDING_VERSION,
            )

    # ------------------------------------------------------------------
    # Public: semantic search
    # ------------------------------------------------------------------

    async def search_products(
        self,
        query: str,
        top_k: int = 10,
        min_similarity: float = 0.45,
    ) -> list[ProductSearchResult]:
        """
        Search published products by semantic similarity.

        Args:
            query:          Natural-language search query from the user.
            top_k:          Maximum number of results to return.
            min_similarity: Minimum cosine similarity threshold (0-1).

        Returns:
            List of ProductSearchResult ordered by descending similarity.
        """
        query_vector = await embedding_service.generate_embedding(query)
        vector_str = _encode_vector(query_vector)

        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                _PRODUCT_SEARCH_SQL,
                vector_str,
                min_similarity,
                top_k,
            )

        return [
            ProductSearchResult(
                product_id=str(r["product_id"]),
                product_name=r["product_name"],
                short_description=r["short_description"],
                history=r["history"],
                similarity=round(float(r["similarity"]), 4),
                craft_name=r["craft_name"],
                piece_type=r["piece_type"],
                style=r["style"],
                process_type=r["process_type"],
                materials=r["materials"],
                store_name=r["store_name"],
                store_id=str(r["store_id"]) if r["store_id"] else None,
                category_name=r["category_name"],
                semantic_text=r["semantic_text"],
                model=r["model"],
                generated_at=r["generated_at"],
            )
            for r in rows
        ]

    # ------------------------------------------------------------------
    # Public: batch indexing
    # ------------------------------------------------------------------

    async def index_products(
        self,
        product_ids: list[str] | None = None,
        force_reindex: bool = False,
    ) -> None:
        """
        Background task: generate and persist embeddings for products.

        If product_ids is None, indexes all products.
        If force_reindex is False, skips products already at current version.
        """
        async with self._indexing_lock:
            if self._indexing_status.running:
                logger.warning("Indexing already in progress, skipping new request")
                return

            self._indexing_status = IndexingStatus(
                running=True, started_at=time.time()
            )

        try:
            await self._run_indexing(product_ids, force_reindex)
        except Exception as exc:
            logger.error(f"Indexing job failed: {exc}", exc_info=True)
            self._indexing_status.errors.append(str(exc))
        finally:
            self._indexing_status.running = False
            self._indexing_status.finished_at = time.time()
            logger.info(
                f"Indexing finished: {self._indexing_status.indexed} ok, "
                f"{self._indexing_status.failed} failed in "
                f"{self._indexing_status.elapsed_seconds}s"
            )

    async def _run_indexing(
        self,
        product_ids: list[str] | None,
        force_reindex: bool,
    ) -> None:
        pool = await get_pool()

        # Fetch rows to index
        async with pool.acquire() as conn:
            if product_ids:
                rows = await conn.fetch(
                    _PRODUCT_SEMANTIC_TEXT_BULK_SQL, product_ids
                )
            else:
                rows = await conn.fetch(_PRODUCT_SEMANTIC_TEXT_SQL)

            # If not forcing reindex, skip products already at current version
            if not force_reindex:
                already_indexed = await conn.fetch(
                    """
                    SELECT product_id FROM shop.product_embeddings
                    WHERE version = $1
                    """,
                    self._EMBEDDING_VERSION,
                )
                skip_ids = {str(r["product_id"]) for r in already_indexed}
                rows = [r for r in rows if str(r["product_id"]) not in skip_ids]

        self._indexing_status.total = len(rows)
        logger.info(f"Indexing {len(rows)} products")

        if not rows:
            return

        # Process in batches to respect OpenAI rate limits
        for batch_start in range(0, len(rows), self._EMBED_BATCH_SIZE):
            batch = rows[batch_start : batch_start + self._EMBED_BATCH_SIZE]
            texts = [r["full_semantic_text"] or r["product_name"] for r in batch]

            try:
                vectors = await embedding_service.generate_embeddings(texts)
            except Exception as exc:
                logger.error(f"OpenAI batch failed at offset {batch_start}: {exc}")
                self._indexing_status.failed += len(batch)
                self._indexing_status.errors.append(
                    f"batch@{batch_start}: {exc}"
                )
                continue

            # Bulk upsert this batch
            records = [
                (
                    str(row["product_id"]),
                    _encode_vector(vec),
                    "text-embedding-3-small",
                    text,
                    self._EMBEDDING_VERSION,
                )
                for row, vec, text in zip(batch, vectors, texts)
            ]

            async with pool.acquire() as conn:
                await conn.executemany(
                    """
                    INSERT INTO shop.product_embeddings
                        (product_id, embedding, model, semantic_text, version, generated_at)
                    VALUES ($1, $2::vector, $3, $4, $5, now())
                    ON CONFLICT (product_id) DO UPDATE SET
                        embedding     = EXCLUDED.embedding,
                        model         = EXCLUDED.model,
                        semantic_text = EXCLUDED.semantic_text,
                        version       = EXCLUDED.version,
                        generated_at  = now()
                    """,
                    records,
                )

            self._indexing_status.indexed += len(batch)
            logger.info(
                f"Indexed {self._indexing_status.indexed}/{self._indexing_status.total}"
            )

    # ------------------------------------------------------------------
    # Public: indexing status
    # ------------------------------------------------------------------

    def get_indexing_status(self) -> dict:
        return self._indexing_status.to_dict()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _encode_vector(value: list[float]) -> str:
    """Encode a Python list of floats to pgvector text '[x,y,...]'."""
    return "[" + ",".join(str(v) for v in value) + "]"


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

semantic_search_service = SemanticSearchService()

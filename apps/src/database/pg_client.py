"""
Direct asyncpg connection pool for the catalog database (Lightsail PostgreSQL).

This client is used exclusively for:
  - Reading shop.products_core + taxonomy joins to build semantic text
  - Writing/upserting embeddings into shop.product_embeddings and shop.store_embeddings
  - Executing vector similarity searches

It is intentionally separate from the Supabase client, which handles
agent memory, knowledge base, and conversation storage.
"""

from __future__ import annotations

import asyncpg
from asyncpg import Pool
from src.api.config import settings
from src.utils.enhanced_logger import create_enhanced_logger

logger = create_enhanced_logger(__name__)

_pool: Pool | None = None


async def get_pool() -> Pool:
    """Return the singleton asyncpg connection pool, creating it if needed."""
    global _pool
    if _pool is None:
        if not settings.catalog_db_url:
            raise ValueError(
                "CATALOG_DB_URL is not configured. "
                "Set it to the PostgreSQL connection string for the catalog database."
            )
        _pool = await asyncpg.create_pool(
            dsn=settings.catalog_db_url,
            min_size=2,
            max_size=10,
            command_timeout=60,
            # pgvector codec: register vector type as text so asyncpg handles it
            init=_init_connection,
        )
        logger.info("Catalog DB connection pool created")
    return _pool


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Register pgvector codec on each new connection."""
    await conn.execute("SET search_path TO public, shop, taxonomy")

    # Find which schema the vector type lives in (may be 'public', 'extensions', etc.)
    vector_schema: str | None = await conn.fetchval(
        """
        SELECT n.nspname
        FROM pg_catalog.pg_type t
        JOIN pg_catalog.pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'vector'
        LIMIT 1
        """
    )

    if vector_schema:
        await conn.set_type_codec(
            "vector",
            encoder=_encode_vector,
            decoder=_decode_vector,
            schema=vector_schema,
            format="text",
        )
    else:
        logger.warning(
            "pgvector extension not found in database — "
            "vector operations will fail. Run: CREATE EXTENSION vector;"
        )


def _encode_vector(value: list[float]) -> str:
    """Encode a Python list of floats to pgvector text format '[1.0,2.0,...]'."""
    return "[" + ",".join(str(v) for v in value) + "]"


def _decode_vector(value: str) -> list[float]:
    """Decode pgvector text format '[1.0,2.0,...]' to a Python list."""
    return [float(v) for v in value.strip("[]").split(",")]


async def close_pool() -> None:
    """Gracefully close the connection pool (call on app shutdown)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        logger.info("Catalog DB connection pool closed")

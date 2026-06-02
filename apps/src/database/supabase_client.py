"""
Agents DB client — asyncpg-backed, targets the 'agents' schema on Lightsail PostgreSQL.

Connection: configure AGENTS_DB_URL in the environment.
  Local dev (SSH tunnel on port 5433):
    ssh -i ~/Downloads/LightsailDefaultKey-us-east-1.pem -L 5433:localhost:5432 ubuntu@52.7.98.126 -N -f
    AGENTS_DB_URL=postgresql://postgres:<password>@localhost:5433/getinmotion
"""

import asyncpg
import json
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from src.api.config import settings

logger = logging.getLogger(__name__)


def _vec_to_pg(embedding: List[float]) -> str:
    """Serialize a float list to the Postgres vector literal '[1,2,3,...]'."""
    return "[" + ",".join(str(v) for v in embedding) + "]"


class AgentsDbClient:
    """
    Async database client for the 'agents' schema on Lightsail PostgreSQL.
    Uses a lazily-initialised asyncpg connection pool.
    """

    _pool: Optional[asyncpg.Pool] = None

    # ------------------------------------------------------------------
    # Pool lifecycle
    # ------------------------------------------------------------------

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            if not settings.agents_db_url:
                raise ValueError(
                    "AGENTS_DB_URL is not configured. "
                    "Set it to postgresql://user:pass@host:port/dbname"
                )
            self._pool = await asyncpg.create_pool(
                dsn=settings.agents_db_url,
                min_size=1,
                max_size=10,
                command_timeout=60,
            )
            logger.info("AgentsDbClient: asyncpg pool created")
        return self._pool

    async def close(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None

    # ------------------------------------------------------------------
    # Memory entries  (agents.agent_knowledge_embeddings)
    # ------------------------------------------------------------------

    async def save_memory_entry(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a memory entry into agent_knowledge_embeddings.
        `entry` is the serialised MemoryEntry (model_dump with by_alias=True).
        The alias 'content' → 'chunk_text' is handled here.
        """
        pool = await self._get_pool()
        chunk_text = entry.get("chunk_text") or entry.get("content", "")
        embedding = entry.get("embedding")
        embedding_val = _vec_to_pg(embedding) if embedding else None

        sql = """
            INSERT INTO agents.agent_knowledge_embeddings
                (chunk_text, memory_type, agent_type, artisan_id, session_id,
                 summary, importance_score, knowledge_category, embedding, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector, $10::jsonb)
            RETURNING id::text
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                sql,
                chunk_text,
                entry.get("memory_type"),
                entry.get("agent_type"),
                str(entry["artisan_id"]) if entry.get("artisan_id") else None,
                entry.get("session_id"),
                entry.get("summary"),
                entry.get("importance_score", 0.5),
                entry.get("knowledge_category", "general"),
                embedding_val,
                json.dumps(entry.get("metadata") or {}),
            )
        return dict(row)

    async def search_memories(
        self,
        query_embedding: List[float],
        match_count: int = 10,
        filter_memory_type: Optional[str] = None,
        filter_agent_type: Optional[str] = None,
        filter_artisan_id: Optional[UUID] = None,
        filter_session_id: Optional[str] = None,
        min_importance: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Semantic search over memory entries using agents.search_agent_memory()."""
        pool = await self._get_pool()
        sql = """
            SELECT * FROM agents.search_agent_memory(
                $1::vector, $2, $3, $4, $5::uuid, $6, $7
            )
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                sql,
                _vec_to_pg(query_embedding),
                match_count,
                filter_memory_type,
                filter_agent_type,
                str(filter_artisan_id) if filter_artisan_id else None,
                filter_session_id,
                min_importance,
            )
        return [dict(r) for r in rows]

    async def get_session_memories(
        self,
        session_id: str,
        artisan_id: Optional[UUID] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Fetch recent conversational memories for a session (no vector search)."""
        pool = await self._get_pool()
        sql = """
            SELECT id, chunk_text, memory_type, agent_type, artisan_id,
                   session_id, summary, importance_score, knowledge_category, created_at
            FROM agents.agent_knowledge_embeddings
            WHERE session_id = $1
              AND ($2::uuid IS NULL OR artisan_id = $2::uuid)
              AND memory_type = 'conversational'
            ORDER BY created_at DESC
            LIMIT $3
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                sql,
                session_id,
                str(artisan_id) if artisan_id else None,
                limit,
            )
        return [dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Artisan global profiles  (agents.artisan_global_profiles)
    # ------------------------------------------------------------------

    async def get_artisan_profile(self, artisan_id: UUID) -> Optional[Dict[str, Any]]:
        pool = await self._get_pool()
        sql = """
            SELECT id::text, artisan_id::text, profile_summary,
                   key_insights, interaction_count, last_interaction_at,
                   maturity_snapshot, embedding::text, created_at, updated_at
            FROM agents.artisan_global_profiles
            WHERE artisan_id = $1::uuid
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(sql, str(artisan_id))
        if row is None:
            return None
        result = dict(row)
        # asyncpg returns JSONB as dicts already; keep consistent
        for field in ("key_insights", "maturity_snapshot"):
            if isinstance(result.get(field), str):
                result[field] = json.loads(result[field])
        return result

    async def save_artisan_profile(
        self,
        artisan_id: UUID,
        profile_summary: str,
        key_insights: Dict[str, Any],
        maturity_snapshot: Dict[str, Any],
        embedding: List[float],
        increment_interaction: bool = True,
    ) -> Dict[str, Any]:
        pool = await self._get_pool()
        embedding_val = _vec_to_pg(embedding) if embedding else None
        interaction_delta = 1 if increment_interaction else 0
        sql = """
            INSERT INTO agents.artisan_global_profiles
                (artisan_id, profile_summary, key_insights, maturity_snapshot,
                 embedding, interaction_count, last_interaction_at)
            VALUES ($1::uuid, $2, $3::jsonb, $4::jsonb, $5::vector, $6, NOW())
            ON CONFLICT (artisan_id) DO UPDATE SET
                profile_summary     = EXCLUDED.profile_summary,
                key_insights        = EXCLUDED.key_insights,
                maturity_snapshot   = EXCLUDED.maturity_snapshot,
                embedding           = EXCLUDED.embedding,
                interaction_count   = artisan_global_profiles.interaction_count + $6,
                last_interaction_at = NOW(),
                updated_at          = NOW()
            RETURNING id::text, artisan_id::text, interaction_count
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                sql,
                str(artisan_id),
                profile_summary,
                json.dumps(key_insights),
                json.dumps(maturity_snapshot),
                embedding_val,
                interaction_delta,
            )
        return dict(row)

    # ------------------------------------------------------------------
    # Conversations  (agents.agent_conversations)
    # ------------------------------------------------------------------

    async def save_conversation(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        pool = await self._get_pool()
        sql = """
            INSERT INTO agents.agent_conversations
                (session_id, user_id, agent_type, user_input, agent_output,
                 context, metadata, selected_agent, routing_confidence,
                 routing_reasoning, execution_time_ms)
            VALUES ($1, $2::uuid, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb,
                    $8, $9, $10, $11)
            RETURNING id::text, created_at
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                sql,
                conversation.get("session_id"),
                str(conversation["user_id"]) if conversation.get("user_id") else None,
                conversation.get("agent_type"),
                conversation.get("user_input"),
                json.dumps(conversation.get("agent_output")),
                json.dumps(conversation.get("context") or {}),
                json.dumps(conversation.get("metadata") or {}),
                conversation.get("selected_agent"),
                conversation.get("routing_confidence"),
                conversation.get("routing_reasoning"),
                conversation.get("execution_time_ms"),
            )
        return dict(row)

    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        pool = await self._get_pool()
        sql = """
            SELECT id::text, session_id, user_id::text, agent_type,
                   user_input, agent_output, created_at
            FROM agents.agent_conversations
            WHERE session_id = $1
            ORDER BY created_at ASC
            LIMIT $2
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(sql, session_id, limit)
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get("agent_output"), str):
                try:
                    d["agent_output"] = json.loads(d["agent_output"])
                except Exception:
                    pass
            result.append(d)
        return result

    # ------------------------------------------------------------------
    # Knowledge documents  (agents.agent_knowledge_documents)
    # ------------------------------------------------------------------

    async def save_knowledge_document(self, document: Any) -> Dict[str, Any]:
        """Accept either a KnowledgeDocument Pydantic model or a plain dict."""
        pool = await self._get_pool()
        if hasattr(document, "model_dump"):
            doc = document.model_dump(mode="json")
        else:
            doc = dict(document)
        sql = """
            INSERT INTO agents.agent_knowledge_documents
                (filename, file_type, content, knowledge_category, tags,
                 uploaded_by, metadata, processing_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
            RETURNING id::text, created_at
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                sql,
                doc.get("filename", "unknown"),
                doc.get("file_type", "text/plain"),
                doc.get("content"),
                doc.get("knowledge_category", "general"),
                doc.get("tags") or [],
                doc.get("uploaded_by", "system"),
                json.dumps(doc.get("metadata") or {}),
                doc.get("processing_status", "pending"),
            )
        return dict(row)

    async def update_document_status(
        self,
        document_id: UUID,
        status: str,
        chunk_count: Optional[int] = None,
    ) -> None:
        pool = await self._get_pool()
        if chunk_count is not None:
            sql = """
                UPDATE agents.agent_knowledge_documents
                SET processing_status = $2, chunk_count = $3, updated_at = NOW()
                WHERE id = $1::uuid
            """
            async with pool.acquire() as conn:
                await conn.execute(sql, str(document_id), status, chunk_count)
        else:
            sql = """
                UPDATE agents.agent_knowledge_documents
                SET processing_status = $2, updated_at = NOW()
                WHERE id = $1::uuid
            """
            async with pool.acquire() as conn:
                await conn.execute(sql, str(document_id), status)

    # ------------------------------------------------------------------
    # Knowledge embeddings / RAG  (agents.agent_knowledge_embeddings)
    # ------------------------------------------------------------------

    async def save_knowledge_embeddings(
        self, records: List[Dict[str, Any]]
    ) -> None:
        """Batch-insert embedding records for RAG documents."""
        if not records:
            return
        pool = await self._get_pool()
        sql = """
            INSERT INTO agents.agent_knowledge_embeddings
                (document_id, chunk_index, chunk_text, knowledge_category,
                 embedding, metadata)
            VALUES ($1::uuid, $2, $3, $4, $5::vector, $6::jsonb)
        """
        rows = [
            (
                str(r["document_id"]),
                r.get("chunk_index", 0),
                r["chunk_text"],
                r.get("knowledge_category", "general"),
                _vec_to_pg(r["embedding"]) if r.get("embedding") else None,
                json.dumps(r.get("metadata") or {}),
            )
            for r in records
        ]
        async with pool.acquire() as conn:
            await conn.executemany(sql, rows)

    async def search_knowledge(
        self,
        query_embedding: List[float],
        match_count: int = 5,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Semantic search over the knowledge base using agents.search_agent_knowledge()."""
        pool = await self._get_pool()
        sql = """
            SELECT e.id::text, e.chunk_text, e.knowledge_category,
                   1 - (e.embedding <=> $1::vector) AS similarity,
                   e.document_id::text,
                   e.chunk_index,
                   d.filename AS document_filename,
                   d.metadata AS document_metadata
            FROM agents.agent_knowledge_embeddings e
            JOIN agents.agent_knowledge_documents d ON d.id = e.document_id
            WHERE ($2::text IS NULL OR e.knowledge_category = $2)
              AND (e.memory_type = 'knowledge' OR e.memory_type IS NULL)
              AND e.document_id IS NOT NULL
              AND e.embedding IS NOT NULL
            ORDER BY e.embedding <=> $1::vector
            LIMIT $3
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                sql,
                _vec_to_pg(query_embedding),
                category,
                match_count,
            )
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get("document_metadata"), str):
                try:
                    d["document_metadata"] = json.loads(d["document_metadata"])
                except Exception:
                    d["document_metadata"] = {}
            result.append(d)
        return result

    # ------------------------------------------------------------------
    # Onboarding profiles  (agents.user_onboarding_profiles)
    # ------------------------------------------------------------------

    async def save_onboarding_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        pool = await self._get_pool()
        sql = """
            INSERT INTO agents.user_onboarding_profiles
                (user_id, session_id, nombre, ubicacion, tipo_artesania,
                 madurez_identidad_artesanal, madurez_identidad_artesanal_razon,
                 madurez_identidad_artesanal_tareas,
                 madurez_realidad_comercial, madurez_realidad_comercial_razon,
                 madurez_realidad_comercial_tareas,
                 madurez_clientes_y_mercado, madurez_clientes_y_mercado_razon,
                 madurez_clientes_y_mercado_tareas,
                 madurez_operacion_y_crecimiento, madurez_operacion_y_crecimiento_razon,
                 madurez_operacion_y_crecimiento_tareas,
                 madurez_general, resumen, raw_responses, metadata)
            VALUES ($1::uuid, $2, $3, $4, $5,
                    $6, $7, $8::jsonb,
                    $9, $10, $11::jsonb,
                    $12, $13, $14::jsonb,
                    $15, $16, $17::jsonb,
                    $18, $19, $20::jsonb, $21::jsonb)
            ON CONFLICT DO NOTHING
            RETURNING id::text, created_at
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                sql,
                str(profile["user_id"]) if profile.get("user_id") else None,
                profile.get("session_id"),
                profile.get("nombre"),
                profile.get("ubicacion"),
                profile.get("tipo_artesania"),
                profile.get("madurez_identidad_artesanal"),
                profile.get("madurez_identidad_artesanal_razon"),
                json.dumps(profile.get("madurez_identidad_artesanal_tareas") or []),
                profile.get("madurez_realidad_comercial"),
                profile.get("madurez_realidad_comercial_razon"),
                json.dumps(profile.get("madurez_realidad_comercial_tareas") or []),
                profile.get("madurez_clientes_y_mercado"),
                profile.get("madurez_clientes_y_mercado_razon"),
                json.dumps(profile.get("madurez_clientes_y_mercado_tareas") or []),
                profile.get("madurez_operacion_y_crecimiento"),
                profile.get("madurez_operacion_y_crecimiento_razon"),
                json.dumps(profile.get("madurez_operacion_y_crecimiento_tareas") or []),
                profile.get("madurez_general"),
                profile.get("resumen"),
                json.dumps(profile.get("raw_responses") or {}),
                json.dumps(profile.get("metadata") or {}),
            )
        return dict(row) if row else {}


# ---------------------------------------------------------------------------
# Singleton — drop-in replacement for the old `db = SupabaseClient.get_client()`
# ---------------------------------------------------------------------------
db = AgentsDbClient()

"""
asyncpg connection pool for the joyitas database (stage only — temporary, for testing).

This client is a hardcoded copy of pg_client.py pointing at the joyitas DB on the
stage Lightsail server. It will be deleted once testing is complete.

NOTE: host.docker.internal resolves to the Docker host via extra_hosts in docker-compose.yml.
"""

from __future__ import annotations

import asyncpg
from asyncpg import Pool
from src.utils.enhanced_logger import create_enhanced_logger

logger = create_enhanced_logger(__name__)

# Hardcoded — testing only. host.docker.internal reaches the Lightsail host's postgres.
_JOYITAS_DSN = "postgresql://postgres:Getinmotion2025*@host.docker.internal:5432/joyitas"

_joyitas_pool: Pool | None = None


async def get_joyitas_pool() -> Pool:
    """Return the singleton asyncpg pool for joyitas, creating it if needed."""
    global _joyitas_pool
    if _joyitas_pool is None:
        _joyitas_pool = await asyncpg.create_pool(
            dsn=_JOYITAS_DSN,
            min_size=2,
            max_size=10,
            command_timeout=60,
            init=_init_connection,
        )
        logger.info("Joyitas DB connection pool created")
    return _joyitas_pool


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Register pgvector codec on each new connection."""
    await conn.execute("SET search_path TO public, shop, taxonomy")

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
            "pgvector extension not found in joyitas database — "
            "vector operations will fail. Run: CREATE EXTENSION vector;"
        )


def _encode_vector(value: list[float]) -> str:
    return "[" + ",".join(str(v) for v in value) + "]"


def _decode_vector(value: str) -> list[float]:
    return [float(v) for v in value.strip("[]").split(",")]


async def close_joyitas_pool() -> None:
    """Gracefully close the joyitas connection pool."""
    global _joyitas_pool
    if _joyitas_pool is not None:
        await _joyitas_pool.close()
        _joyitas_pool = None
        logger.info("Joyitas DB connection pool closed")

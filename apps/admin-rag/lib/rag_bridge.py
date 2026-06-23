"""Sync wrappers around the async RAG service and DB client, for use in Streamlit."""

import asyncio
from typing import Any, Dict, List, Optional
from uuid import UUID

from openai import AsyncOpenAI

from agents.core.state import KnowledgeDocument
from agents.tools.vector_search import rag_service
from src.api.config import settings
from src.database.supabase_client import db
from src.services.embedding_service import embedding_service


def run_async(coro):
    """Run a coroutine to completion on a fresh event loop.

    Streamlit reruns scripts on a thread pool, so cached resources bound to a
    previous event loop (asyncpg pool, OpenAI's httpx client) become invalid
    between reruns. We discard the stale asyncpg pool and recreate the OpenAI
    clients, then always run on a brand-new loop.
    """
    if db._pool is not None:
        try:
            current_loop = asyncio.get_event_loop()
        except RuntimeError:
            current_loop = None
        if db._pool._loop is not current_loop or (current_loop is not None and current_loop.is_closed()):
            db._pool = None

    rag_service.client = AsyncOpenAI(api_key=settings.openai_api_key)
    embedding_service.client = AsyncOpenAI(api_key=settings.openai_api_key)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        if db._pool is not None and db._pool._loop is loop:
            loop.run_until_complete(db._pool.close())
            db._pool = None
        loop.close()


def process_document_sync(document: KnowledgeDocument) -> UUID:
    """Chunk, embed, and store a document in the knowledge base."""
    return run_async(rag_service.process_document(document))


def generate_rag_response_sync(
    query: str,
    category: Optional[str],
    system_prompt: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Run a RAG query + LLM generation for the chat tab."""
    return run_async(
        rag_service.generate_rag_response(
            query=query,
            category=category,
            system_prompt=system_prompt,
            conversation_history=conversation_history,
        )
    )


def list_documents_sync(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """List knowledge documents, optionally filtered by category."""
    return run_async(db.list_knowledge_documents(category=category))


def delete_document_sync(document_id: UUID) -> None:
    """Delete a knowledge document (embeddings cascade)."""
    return run_async(db.delete_knowledge_document(document_id))


def list_categories_sync() -> List[Dict[str, Any]]:
    """Aggregate document/chunk counts per knowledge category."""
    return run_async(db.list_knowledge_categories())

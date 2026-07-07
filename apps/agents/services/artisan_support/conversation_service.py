"""
Conversation memory + persistence for the Artisan Support (Copiloto) bot.

Short-term context reuses the same in-memory ConversationMemory pattern as
the sales bot (last 5 turns / 30-minute TTL). Each turn is additionally
persisted to agents.agent_conversations via db.save_conversation() so the
team can review what students are asking over time.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from agents.services.whatsapp.conversation_memory import ConversationMemory
from src.database.supabase_client import db

logger = logging.getLogger(__name__)

_AGENT_TYPE = "artisan_support"

# Separate instance from the sales bot's conversation_memory singleton —
# different phone numbers, different conversational context.
conversation_memory = ConversationMemory()


async def persist_turn(
    phone: str,
    user_input: str,
    answer: str,
    sources: Optional[list[str]] = None,
    confidence: Optional[str] = None,
    retrieved_chunks: Optional[int] = None,
) -> None:
    """Persist a Q&A turn to agents.agent_conversations (best-effort)."""
    try:
        agent_output: dict[str, Any] = {"answer": answer}
        if sources is not None:
            agent_output["sources"] = sources
        if confidence is not None:
            agent_output["confidence"] = confidence
        if retrieved_chunks is not None:
            agent_output["retrieved_chunks"] = retrieved_chunks

        await db.save_conversation({
            "session_id": phone,
            "agent_type": _AGENT_TYPE,
            "user_input": user_input,
            "agent_output": agent_output,
            "metadata": {"channel": "whatsapp", "phone": phone},
        })
    except Exception as exc:
        logger.error("Failed to persist conversation turn for %s...: %s", phone[:10], exc)

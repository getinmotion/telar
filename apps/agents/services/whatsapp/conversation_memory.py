"""
In-memory per-user conversation history for the WhatsApp bot.

Keeps the last 5 turns per phone number with a 30-minute idle TTL.
This is intentionally simple (no persistence) — the process restart
clears all history, which is acceptable for a stateless container.
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

_MAX_TURNS = 5
_TTL_MINUTES = 30


class ConversationMemory:
    """Thread-safe (asyncio single-threaded) in-memory conversation store."""

    def __init__(self, max_turns: int = _MAX_TURNS, ttl_minutes: int = _TTL_MINUTES) -> None:
        self._max_turns = max_turns
        self._ttl = timedelta(minutes=ttl_minutes)
        self._history: dict[str, deque] = defaultdict(lambda: deque(maxlen=self._max_turns))
        self._last_activity: dict[str, datetime] = {}

    def add(self, phone: str, role: str, content: str) -> None:
        """Append a turn to the conversation history for *phone*."""
        self._history[phone].append({"role": role, "content": content})
        self._last_activity[phone] = datetime.now()
        logger.debug("Memory updated for %s... (%d turns)", phone[:10], len(self._history[phone]))

    def get_context(self, phone: str) -> str:
        """
        Return recent conversation history as a formatted string.

        Clears and returns empty string if the session has been idle
        longer than the TTL.
        """
        last = self._last_activity.get(phone)
        if last and datetime.now() - last > self._ttl:
            self._history.pop(phone, None)
            self._last_activity.pop(phone, None)
            logger.debug("Cleared stale memory for %s...", phone[:10])
            return ""

        turns = list(self._history.get(phone, []))
        if not turns:
            return ""

        lines = ["CONVERSACIÓN PREVIA:"]
        for turn in turns:
            lines.append(f"{turn['role'].upper()}: {turn['content']}")
        return "\n".join(lines)

    def clear(self, phone: str) -> None:
        """Explicitly clear history for a phone number."""
        self._history.pop(phone, None)
        self._last_activity.pop(phone, None)


# Module-level singleton
conversation_memory = ConversationMemory()

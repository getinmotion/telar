"""
LRU in-memory cache for OpenAI embedding vectors.
Avoids redundant API calls for repeated or similar queries.
"""

import hashlib
import os
import logging
from typing import Callable, Awaitable, List

logger = logging.getLogger(__name__)


class EmbeddingCache:
    """
    Simple LRU-style in-memory cache for embedding vectors.
    Keyed by SHA-256 of the input text, so identical texts always hit cache.
    Thread-safe for asyncio workloads (single-threaded event loop).
    """

    def __init__(self, maxsize: int = 1000):
        self._cache: dict[str, List[float]] = {}
        self._order: list[str] = []  # tracks insertion order for LRU eviction
        self._maxsize = maxsize
        self._hits = 0
        self._misses = 0

    def _key(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    async def get_or_generate(
        self,
        text: str,
        generate_fn: Callable[[str], Awaitable[List[float]]],
    ) -> List[float]:
        """
        Return cached embedding for text, or call generate_fn and cache the result.

        Args:
            text: Input text to embed
            generate_fn: Async callable that takes text and returns embedding vector

        Returns:
            Embedding vector (list of floats)
        """
        key = self._key(text)

        if key in self._cache:
            self._hits += 1
            # Move to end (most recently used)
            self._order.remove(key)
            self._order.append(key)
            logger.debug(f"Embedding cache HIT (hits={self._hits}, misses={self._misses})")
            return self._cache[key]

        # Cache miss — generate and store
        self._misses += 1
        embedding = await generate_fn(text)

        if len(self._cache) >= self._maxsize:
            # Evict least recently used
            oldest_key = self._order.pop(0)
            del self._cache[oldest_key]

        self._cache[key] = embedding
        self._order.append(key)

        logger.debug(
            f"Embedding cache MISS — stored new entry "
            f"(size={len(self._cache)}/{self._maxsize}, "
            f"hits={self._hits}, misses={self._misses})"
        )
        return embedding

    @property
    def stats(self) -> dict:
        total = self._hits + self._misses
        hit_rate = self._hits / total if total > 0 else 0.0
        return {
            "size": len(self._cache),
            "maxsize": self._maxsize,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(hit_rate, 3),
        }

    def clear(self) -> None:
        self._cache.clear()
        self._order.clear()
        self._hits = 0
        self._misses = 0


# Global singleton — size configurable via env var
embedding_cache = EmbeddingCache(
    maxsize=int(os.getenv("EMBEDDING_CACHE_SIZE", "1000"))
)

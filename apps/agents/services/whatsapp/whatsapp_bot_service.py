"""
WhatsApp bot orchestration service.

Ties together: webhook parsing, audio transcription, intent classification,
semantic product search, price filtering, response formatting, and reply sending.
"""

from __future__ import annotations

import asyncio
import logging

from agents.services.semantic_search_service import semantic_search_service
from agents.services.whatsapp.conversation_memory import conversation_memory
from agents.services.whatsapp.intent_classifier import intent_classifier
from agents.services.whatsapp.response_formatter import (
    format_no_results,
    format_products,
    format_welcome,
)
from agents.services.whatsapp.transcription_service import transcription_service
from agents.services.whatsapp.webhook_handler import IncomingMessage
from agents.services.whatsapp.whatsapp_client import whatsapp_client

logger = logging.getLogger(__name__)

_GREETINGS = {"hola", "hello", "hi", "buenos dias", "buenas tardes", "buenas noches", "ayuda", "help"}
_MAX_GREETING_LEN = 25
_SEARCH_TOP_K = 10
_SEARCH_MIN_SIMILARITY = 0.4
_MAX_RESULTS = 5


async def process_message(msg: IncomingMessage) -> None:
    """
    Full bot processing pipeline for a single incoming message.

    This is always called as a background task so the webhook returns
    200 OK immediately while processing happens asynchronously.

    Pipeline:
      1. Audio → transcribe (or error and abort)
      2. Send "processing" indicator (fire-and-forget)
      3. Greeting check → welcome message
      4. Classify intent → extract price filters
      5. Semantic search
      6. Price filter
      7. Format + send response
      8. Update conversation memory
    """
    phone = msg.phone_number

    try:
        # ── Step 1: Handle audio messages ────────────────────────────
        if msg.message_type == "audio":
            logger.info("Processing voice message from %s...", phone[:10])
            await whatsapp_client.send_text_message(phone, "🎤 _Escuchando tu mensaje de voz..._")

            audio_bytes = await whatsapp_client.download_audio(msg.audio_id)
            if not audio_bytes:
                await whatsapp_client.send_text_message(
                    phone,
                    "❌ No pude descargar tu audio. Por favor intenta enviarlo como texto.",
                )
                return

            try:
                text = await transcription_service.transcribe(
                    audio_bytes, mime_type=msg.mime_type or "audio/ogg"
                )
            except Exception as exc:
                logger.error("Transcription failed for %s...: %s", phone[:10], exc)
                await whatsapp_client.send_text_message(
                    phone,
                    "❌ No pude transcribir tu audio. Por favor envía tu consulta como texto.",
                )
                return

            if not text or not text.strip():
                await whatsapp_client.send_text_message(
                    phone,
                    "❌ El audio no tenía texto reconocible. Por favor intenta de nuevo.",
                )
                return

            msg.text = text
            logger.info("Voice transcribed: '%s...'", text[:80])

        # ── Step 2: Processing indicator ─────────────────────────────
        asyncio.create_task(whatsapp_client.send_processing_indicator(phone))

        query = (msg.text or "").strip()
        if not query:
            return

        logger.info("Processing query from %s...: '%s...'", phone[:10], query[:60])

        # ── Step 3: Greeting detection ───────────────────────────────
        if _is_greeting(query):
            welcome = format_welcome()
            await whatsapp_client.send_text_message(phone, welcome)
            conversation_memory.add(phone, "user", query)
            conversation_memory.add(phone, "bot", "Welcome message sent")
            return

        # ── Step 4: Intent classification ────────────────────────────
        context = conversation_memory.get_context(phone)
        intent = await intent_classifier.classify(query, context)

        # Save user turn before search
        conversation_memory.add(phone, "user", query)

        # ── Step 5: Semantic search ───────────────────────────────────
        results = await semantic_search_service.search_products(
            query=query,
            top_k=_SEARCH_TOP_K,
            min_similarity=_SEARCH_MIN_SIMILARITY,
        )
        logger.info("Semantic search returned %d results for '%s...'", len(results), query[:50])

        # ── Step 6: Price filter ──────────────────────────────────────
        if intent.price_min is not None or intent.price_max is not None:
            results = _apply_price_filter(results, intent.price_min, intent.price_max)
            logger.info(
                "After price filter [%s, %s]: %d results",
                intent.price_min,
                intent.price_max,
                len(results),
            )

        results = results[:_MAX_RESULTS]

        # ── Step 7: Format + send ─────────────────────────────────────
        if results:
            reply = format_products(results, query)
        else:
            reply = format_no_results()

        await whatsapp_client.send_text_message(phone, reply)

        # ── Step 8: Update memory ─────────────────────────────────────
        conversation_memory.add(phone, "bot", reply[:200])

        logger.info("Response sent to %s... (%d products)", phone[:10], len(results))

    except Exception as exc:
        logger.error("Unhandled error processing message from %s...: %s", phone[:10], exc, exc_info=True)
        try:
            await whatsapp_client.send_text_message(
                phone,
                "😅 Lo siento, ocurrió un error inesperado. Por favor intenta de otra manera.",
            )
        except Exception:
            pass


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _is_greeting(text: str) -> bool:
    if len(text) > _MAX_GREETING_LEN:
        return False
    lower = text.lower().strip()
    return any(g in lower for g in _GREETINGS)


def _apply_price_filter(results, price_min_cop, price_max_cop):
    """
    Filter results by price range.

    prices in ProductSearchResult are in minor units (centavos).
    User-provided prices are in COP pesos, so multiply by 100.
    """
    min_minor = price_min_cop * 100 if price_min_cop is not None else None
    max_minor = price_max_cop * 100 if price_max_cop is not None else None

    filtered = []
    for r in results:
        if r.price is None:
            continue
        if min_minor is not None and r.price < min_minor:
            continue
        if max_minor is not None and r.price > max_minor:
            continue
        filtered.append(r)
    return filtered

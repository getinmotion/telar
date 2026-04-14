"""
WhatsApp bot orchestration service.

Ties together: webhook parsing, audio transcription, intent classification,
semantic product search, price filtering, response formatting, and reply sending.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from agents.services.semantic_search_service import semantic_search_service
from agents.services.whatsapp.conversation_memory import conversation_memory
from agents.services.whatsapp.intent_classifier import intent_classifier
from agents.services.whatsapp.response_formatter import (
    format_materials,
    format_no_results,
    format_products,
    format_regions,
    format_stores,
    format_welcome,
)
from agents.services.whatsapp.transcription_service import transcription_service
from agents.services.whatsapp.webhook_handler import IncomingMessage
from agents.services.whatsapp.whatsapp_client import whatsapp_client
from src.database.pg_client import get_pool

logger = logging.getLogger(__name__)

_GREETINGS = {"hola", "hello", "hi", "buenos dias", "buenas tardes", "buenas noches", "ayuda", "help"}
_MAX_GREETING_LEN = 25
_SEARCH_TOP_K = 10
_SEARCH_MIN_SIMILARITY = 0.4
_MAX_RESULTS = 5


async def process_message(msg: IncomingMessage) -> None:
    """
    Full bot processing pipeline for a single incoming message.

    Pipeline:
      1. Audio → transcribe (or error and abort)
      2. Send "processing" indicator (fire-and-forget)
      3. Greeting check → welcome message
      4. Classify intent (+ empathetic intro + price filters)
      5. Route by intent:
         - ask_regions   → query DB for unique store locations
         - ask_materials → query DB for unique craft types
         - ask_stores    → derive unique stores from semantic search
         - search_products → semantic search + price filter + format
      6. Send response + update conversation memory
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

        # Save user turn
        conversation_memory.add(phone, "user", query)

        # ── Step 5: Route by intent ───────────────────────────────────

        if intent.intent_type == "ask_regions":
            reply = await _handle_ask_regions(intent.empathetic_intro)

        elif intent.intent_type == "ask_materials":
            reply = await _handle_ask_materials(intent.empathetic_intro)

        elif intent.intent_type == "ask_stores":
            reply = await _handle_ask_stores(query, intent.empathetic_intro)

        else:
            # Default: semantic product search
            reply = await _handle_product_search(query, intent)

        # ── Step 6: Send + update memory ─────────────────────────────
        await whatsapp_client.send_text_message(phone, reply)
        conversation_memory.add(phone, "bot", reply[:200])
        logger.info("Response sent to %s...", phone[:10])

    except Exception as exc:
        logger.error("Unhandled error processing message from %s...: %s", phone[:10], exc, exc_info=True)
        try:
            await whatsapp_client.send_text_message(
                phone,
                "😅 Lo siento, ocurrió un error inesperado. Por favor intenta de otra manera.",
            )
        except Exception:
            pass


# ─────────────────────────────────────────────
# Intent handlers
# ─────────────────────────────────────────────

async def _handle_ask_regions(intro: str) -> str:
    """Return a deduplicated, sorted list of artisan store locations."""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # artisan_shops is in the public schema and has a region column
            rows = await conn.fetch(
                """
                SELECT DISTINCT region
                FROM public.artisan_shops
                WHERE region IS NOT NULL AND region != '' AND active = true
                ORDER BY region
                """
            )
        regions = [r["region"] for r in rows]
        logger.info("ask_regions: found %d raw locations", len(regions))
        return format_regions(regions, intro)
    except Exception as exc:
        logger.error("ask_regions DB query failed: %s", exc)
        return (
            (f"{intro}\n\n") if intro else ""
        ) + "😅 No pude obtener la lista de regiones en este momento. Intenta buscar un producto y te mostraré la ubicación de cada artesano."


async def _handle_ask_materials(intro: str) -> str:
    """Return a list of unique craft types from the taxonomy."""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT DISTINCT tc.name
                FROM taxonomy.crafts tc
                JOIN shop.product_artisanal_identity pai ON pai.primary_craft_id = tc.id
                JOIN shop.products_core pc ON pc.id = pai.product_id
                WHERE pc.deleted_at IS NULL AND tc.name IS NOT NULL
                ORDER BY tc.name
                """
            )
        materials = [r["name"] for r in rows]
        logger.info("ask_materials: found %d craft types", len(materials))
        return format_materials(materials, intro)
    except Exception as exc:
        logger.error("ask_materials DB query failed: %s", exc)
        return (
            (f"{intro}\n\n") if intro else ""
        ) + "😅 No pude obtener los materiales en este momento. Puedes buscar directamente, por ejemplo: _\"productos de madera\"_ o _\"artesanías en cerámica\"_."


async def _handle_ask_stores(query: str, intro: str) -> str:
    """Derive unique stores from a broad semantic search."""
    try:
        results = await semantic_search_service.search_products(
            query=query, top_k=30, min_similarity=0.3
        )

        seen: dict[str, dict] = {}
        for r in results:
            if r.store_id and r.store_id not in seen:
                seen[r.store_id] = {
                    "name": r.store_name or "Tienda",
                    "craft_name": r.craft_name,
                    "location": _extract_location(r.store_name),
                    "product_count": 0,
                }
            if r.store_id and r.store_id in seen:
                seen[r.store_id]["product_count"] += 1

        stores = list(seen.values())[:10]
        logger.info("ask_stores: found %d unique stores", len(stores))

        if not stores:
            return "😅 No encontré tiendas en este momento. Prueba buscando un tipo de producto específico."

        return format_stores(stores, intro)
    except Exception as exc:
        logger.error("ask_stores failed: %s", exc)
        return "😅 No pude obtener la lista de tiendas. Prueba buscando un producto específico."


async def _handle_product_search(query: str, intent) -> str:
    """Semantic search + price filter + format."""
    results = await semantic_search_service.search_products(
        query=query,
        top_k=_SEARCH_TOP_K,
        min_similarity=_SEARCH_MIN_SIMILARITY,
    )
    logger.info("Semantic search: %d results for '%s...'", len(results), query[:50])

    if intent.price_min is not None or intent.price_max is not None:
        results = _apply_price_filter(results, intent.price_min, intent.price_max)
        logger.info(
            "After price filter [%s, %s]: %d results",
            intent.price_min, intent.price_max, len(results),
        )

    results = results[:_MAX_RESULTS]

    if results:
        return format_products(results, query, empathetic_intro=intent.empathetic_intro)
    return format_no_results(query)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _is_greeting(text: str) -> bool:
    if len(text) > _MAX_GREETING_LEN:
        return False
    lower = text.lower().strip()
    return any(g in lower for g in _GREETINGS)


def _extract_location(store_name: Optional[str]) -> str:
    """
    Some store names include location in parens: "Vision rustica (FLORENCIA, CAQUETÁ)".
    Extract just the location part if present.
    """
    if not store_name:
        return ""
    if "(" in store_name and store_name.endswith(")"):
        return store_name[store_name.index("(") + 1:-1].strip()
    return ""


def _apply_price_filter(results, price_min_cop, price_max_cop):
    """
    Filter results by price range.

    Prices in ProductSearchResult are in minor units (centavos).
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



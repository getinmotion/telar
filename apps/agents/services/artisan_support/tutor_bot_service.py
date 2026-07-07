"""
Artisan Support (Copiloto) bot orchestration service.

Ties together: webhook parsing, audio transcription, RAG retrieval over the
'capacitaciones' knowledge base, response generation, and reply sending.

Unlike the sales bot, there is no intent classification or product search —
every query is answered via rag_service.generate_rag_response() using the
artisan tutor system prompt.
"""

from __future__ import annotations

import asyncio
import logging

from agents.prompts import get_artisan_tutor_prompt
from agents.services.artisan_support.conversation_service import (
    conversation_memory,
    persist_turn,
)
from agents.services.artisan_support.whatsapp_client import artisan_whatsapp_client
from agents.services.whatsapp.transcription_service import transcription_service
from agents.services.whatsapp.webhook_handler import IncomingMessage
from agents.tools.vector_search import rag_service

logger = logging.getLogger(__name__)

_KNOWLEDGE_CATEGORY = "capacitaciones"
_GREETINGS = {"hola", "hello", "hi", "buenos dias", "buenas tardes", "buenas noches", "ayuda", "help"}
_MAX_GREETING_LEN = 25

_WELCOME_MESSAGE = (
    "👋 *¡Hola! Soy el Copiloto de Capacitaciones de Telar*\n\n"
    "Estoy aquí para apoyarte con dudas sobre los temas que vemos en nuestras "
    "capacitaciones (marketing, finanzas, legal, fotografía, presencia digital y más).\n\n"
    "✨ *¿Sobre qué tema tienes una duda?*\n\n"
    "Ejemplo: _\"¿Cómo calculo el precio de mi producto?\"_ o "
    "_\"¿Qué documentos necesito para formalizar mi negocio?\"_"
)


async def process_message(msg: IncomingMessage) -> None:
    """
    Full bot processing pipeline for a single incoming message.

    Pipeline:
      1. Audio → transcribe (or error and abort)
      2. Send "processing" indicator (fire-and-forget)
      3. Greeting check → welcome message
      4. RAG: retrieve relevant training material + generate answer
      5. Send response + update conversation memory + persist to DB
    """
    phone = msg.phone_number

    try:
        # ── Step 1: Handle audio messages ────────────────────────────
        if msg.message_type == "audio":
            logger.info("Processing voice message from %s...", phone[:10])
            await artisan_whatsapp_client.send_text_message(phone, "🎤 _Escuchando tu mensaje de voz..._")

            audio_bytes = await artisan_whatsapp_client.download_audio(msg.audio_id)
            if not audio_bytes:
                await artisan_whatsapp_client.send_text_message(
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
                await artisan_whatsapp_client.send_text_message(
                    phone,
                    "❌ No pude transcribir tu audio. Por favor envía tu consulta como texto.",
                )
                return

            if not text or not text.strip():
                await artisan_whatsapp_client.send_text_message(
                    phone,
                    "❌ El audio no tenía texto reconocible. Por favor intenta de nuevo.",
                )
                return

            msg.text = text
            logger.info("Voice transcribed: '%s...'", text[:80])

        # ── Step 2: Processing indicator ─────────────────────────────
        asyncio.create_task(artisan_whatsapp_client.send_processing_indicator(phone))

        query = (msg.text or "").strip()
        if not query:
            return

        logger.info("Processing query from %s...: '%s...'", phone[:10], query[:60])

        # ── Step 3: Greeting detection ───────────────────────────────
        if _is_greeting(query):
            await artisan_whatsapp_client.send_text_message(phone, _WELCOME_MESSAGE)
            conversation_memory.add(phone, "user", query)
            conversation_memory.add(phone, "bot", "Welcome message sent")
            return

        # ── Step 4: RAG retrieval + generation ───────────────────────
        history = _get_conversation_history(phone)

        result = await rag_service.generate_rag_response(
            query=query,
            category=_KNOWLEDGE_CATEGORY,
            system_prompt=get_artisan_tutor_prompt(),
            conversation_history=history,
        )

        reply = result["answer"]

        # ── Step 5: Send + update memory + persist ────────────────────
        await artisan_whatsapp_client.send_text_message(phone, reply)

        conversation_memory.add(phone, "user", query)
        conversation_memory.add(phone, "bot", reply[:200])

        await persist_turn(
            phone=phone,
            user_input=query,
            answer=reply,
            sources=result.get("sources"),
            confidence=result.get("confidence"),
            retrieved_chunks=result.get("retrieved_chunks"),
        )

        logger.info("Response sent to %s...", phone[:10])

    except Exception as exc:
        logger.error("Unhandled error processing message from %s...: %s", phone[:10], exc, exc_info=True)
        try:
            await artisan_whatsapp_client.send_text_message(
                phone,
                "😅 Lo siento, ocurrió un error inesperado. Por favor intenta de nuevo en un momento.",
            )
        except Exception:
            pass


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _is_greeting(text: str) -> bool:
    if len(text) > _MAX_GREETING_LEN:
        return False
    lower = text.lower().strip()
    return any(g in lower for g in _GREETINGS)


def _get_conversation_history(phone: str) -> list[dict]:
    """Convert ConversationMemory turns into the role/content dicts rag_service expects."""
    context = conversation_memory.get_context(phone)
    if not context:
        return []

    history: list[dict] = []
    for line in context.splitlines():
        if line.startswith("USER: "):
            history.append({"role": "user", "content": line[len("USER: "):]})
        elif line.startswith("BOT: "):
            history.append({"role": "assistant", "content": line[len("BOT: "):]})
    return history

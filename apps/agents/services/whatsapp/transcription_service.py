"""
Audio transcription via OpenAI Whisper API.

Converts raw audio bytes (e.g. WhatsApp OGG voice notes) to text.
"""

from __future__ import annotations

import io
import logging

import openai

from src.api.config import settings

logger = logging.getLogger(__name__)

_WHISPER_MODEL = "whisper-1"
_DEFAULT_LANGUAGE = "es"


class TranscriptionService:
    """Async wrapper around the OpenAI Whisper transcription API."""

    def __init__(self) -> None:
        if settings.openai_api_key:
            self._client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        else:
            self._client = None
            logger.warning("OpenAI API key not configured — audio transcription unavailable")

    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/ogg") -> str:
        """
        Transcribe audio bytes to text.

        Args:
            audio_bytes: Raw audio file content.
            mime_type:   MIME type string from WhatsApp (e.g. "audio/ogg; codecs=opus").

        Returns:
            Transcribed text string.

        Raises:
            RuntimeError: If OpenAI client is not configured.
            Exception:    If the Whisper API call fails.
        """
        if not self._client:
            raise RuntimeError("Transcription service is not configured (missing OpenAI API key)")

        audio_format = _format_from_mime(mime_type)
        logger.info("Transcribing %d bytes of audio (format=%s)", len(audio_bytes), audio_format)

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = f"audio.{audio_format}"

        transcript = await self._client.audio.transcriptions.create(
            model=_WHISPER_MODEL,
            file=audio_file,
            language=_DEFAULT_LANGUAGE,
            response_format="text",
        )

        text = transcript if isinstance(transcript, str) else transcript.text
        logger.info("Transcription complete: '%s...'", text[:80])
        return text


def _format_from_mime(mime_type: str) -> str:
    """Map a MIME type string to a file extension for Whisper."""
    mime_lower = mime_type.lower()
    if "ogg" in mime_lower:
        return "ogg"
    if "mp3" in mime_lower or "mpeg" in mime_lower:
        return "mp3"
    if "wav" in mime_lower:
        return "wav"
    if "mp4" in mime_lower or "m4a" in mime_lower:
        return "mp4"
    return "ogg"  # WhatsApp default


# Module-level singleton
transcription_service = TranscriptionService()

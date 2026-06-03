"""
Async WhatsApp Business API client.

Wraps the Meta Graph API with retry logic and exponential backoff.
Uses httpx.AsyncClient (non-blocking, consistent with the FastAPI async stack).
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

import httpx

from src.api.config import settings

logger = logging.getLogger(__name__)

_RETRY_ATTEMPTS = 3
_TIMEOUT_SEND = 10.0
_TIMEOUT_DOWNLOAD = 30.0


class WhatsAppClient:
    """Async client for sending messages and downloading media via WhatsApp Business API."""

    def __init__(self) -> None:
        self._access_token = settings.whatsapp_access_token
        self._phone_number_id = settings.whatsapp_phone_number_id
        self._api_url = settings.whatsapp_api_url
        self._messages_url = f"{self._api_url}/{self._phone_number_id}/messages"

        if not self._access_token or not self._phone_number_id:
            logger.warning("WhatsApp credentials not fully configured — messages will not be sent")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def send_text_message(
        self,
        phone: str,
        text: str,
        message_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Send a text message to a phone number.

        Args:
            phone: Recipient in E.164 format (e.g. +573001234567).
            text:  Message body (max 4096 chars — truncated if longer).
            message_id: Optional ID of the message to reply to.

        Returns:
            WhatsApp message ID on success, None on failure.
        """
        if len(text) > 4096:
            logger.warning("Message too long (%d chars) — truncating to 4096", len(text))
            text = text[:4093] + "..."

        payload: dict = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {"preview_url": False, "body": text},
        }
        if message_id:
            payload["context"] = {"message_id": message_id}

        logger.info("Sending text message to %s...", phone[:10])
        response = await self._post(self._messages_url, payload)

        if response and "messages" in response:
            wa_id = response["messages"][0]["id"]
            logger.info("Message sent — WhatsApp ID: %s", wa_id)
            return wa_id

        logger.error("Failed to send text message to %s...", phone[:10])
        return None

    async def send_processing_indicator(self, phone: str) -> None:
        """Send a brief 'processing' message (best-effort, errors are non-fatal)."""
        try:
            await self.send_text_message(phone, "⏳ _Procesando tu consulta..._")
        except Exception as exc:
            logger.debug("Processing indicator failed (non-critical): %s", exc)

    async def download_audio(self, audio_id: str) -> Optional[bytes]:
        """
        Download an audio file from WhatsApp (2-step process).

        Step 1: GET /{audio_id} → retrieve the temporary download URL.
        Step 2: GET {download_url} → download raw audio bytes.

        Returns:
            Raw audio bytes on success, None on failure.
        """
        logger.info("Downloading audio (ID: %s...)", audio_id[:15])

        # Step 1: get download URL
        media_url = f"{self._api_url}/{audio_id}"
        headers = {"Authorization": f"Bearer {self._access_token}"}

        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT_SEND) as client:
                resp = await client.get(media_url, headers=headers)

            if resp.status_code != 200:
                logger.error("Failed to get media URL: %d — %s", resp.status_code, resp.text[:200])
                return None

            download_url = resp.json().get("url")
            if not download_url:
                logger.error("Media metadata response missing 'url' field")
                return None

        except Exception as exc:
            logger.error("Error fetching media URL: %s", exc)
            return None

        # Step 2: download audio bytes
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT_DOWNLOAD) as client:
                resp = await client.get(download_url, headers=headers)

            if resp.status_code == 200:
                audio_bytes = resp.content
                logger.info("Audio downloaded successfully (%d bytes)", len(audio_bytes))
                return audio_bytes

            logger.error("Failed to download audio: %d", resp.status_code)
            return None

        except Exception as exc:
            logger.error("Error downloading audio: %s", exc)
            return None

    # ------------------------------------------------------------------
    # Internal HTTP with retry
    # ------------------------------------------------------------------

    async def _post(self, url: str, data: dict) -> Optional[dict]:
        """POST with up to _RETRY_ATTEMPTS attempts and exponential backoff."""
        headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
        }

        for attempt in range(_RETRY_ATTEMPTS):
            try:
                async with httpx.AsyncClient(timeout=_TIMEOUT_SEND) as client:
                    resp = await client.post(url, headers=headers, json=data)

                if resp.status_code == 429:
                    retry_after = int(resp.headers.get("Retry-After", 60))
                    logger.warning("Rate limited — retrying after %ds", retry_after)
                    await asyncio.sleep(retry_after)
                    continue

                if resp.status_code in (200, 201):
                    return resp.json()

                error_msg = resp.json().get("error", {}).get("message", resp.text) if resp.content else "empty response"
                logger.error("API error %d: %s", resp.status_code, error_msg)

                # Don't retry on 4xx (except 429 handled above)
                if 400 <= resp.status_code < 500:
                    return None

                # Retry on 5xx
                if attempt < _RETRY_ATTEMPTS - 1:
                    wait = 2 ** attempt
                    logger.info("Retrying in %ds (attempt %d/%d)...", wait, attempt + 1, _RETRY_ATTEMPTS)
                    await asyncio.sleep(wait)

            except httpx.RequestError as exc:
                logger.error("HTTP request error: %s", exc)
                if attempt < _RETRY_ATTEMPTS - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    return None

        return None


# Module-level singleton
whatsapp_client = WhatsAppClient()

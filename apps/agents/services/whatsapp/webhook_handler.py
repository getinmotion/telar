"""
WhatsApp webhook handler.

Responsibilities:
  - Validate HMAC-SHA256 signature from Meta
  - Parse incoming webhook payloads
  - Extract text and audio messages into IncomingMessage objects
  - Handle Meta webhook challenge-response for setup
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class IncomingMessage:
    phone_number: str
    message_id: str
    message_type: str          # "text" | "audio"
    text: Optional[str]        # populated for text; filled after transcription for audio
    audio_id: Optional[str]    # populated for audio messages
    mime_type: Optional[str]   # e.g. "audio/ogg; codecs=opus"


class WebhookHandler:
    """Handles WhatsApp Business API webhooks from Meta."""

    def __init__(self, webhook_secret: str, verify_token: str) -> None:
        self._secret = webhook_secret.encode() if webhook_secret else b""
        self._verify_token = verify_token

    # ------------------------------------------------------------------
    # Signature validation + payload parsing
    # ------------------------------------------------------------------

    def parse_and_validate(self, body: bytes, signature: Optional[str]) -> dict:
        """
        Validate HMAC-SHA256 signature and parse the payload.

        If no webhook secret is configured the signature check is skipped
        (useful for local development/testing).

        Raises:
            ValueError: If signature is present but invalid.
            ValueError: If body is not valid JSON.
        """
        if self._secret and signature:
            self._verify_signature(body, signature)
        elif self._secret and not signature:
            logger.warning("Webhook secret configured but no signature header received — skipping validation")

        try:
            return json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON payload: {exc}") from exc

    def _verify_signature(self, body: bytes, signature: str) -> None:
        expected = "sha256=" + hmac.new(self._secret, body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise ValueError("Invalid webhook signature")

    # ------------------------------------------------------------------
    # Message extraction
    # ------------------------------------------------------------------

    def extract_messages(self, payload: dict) -> list[IncomingMessage]:
        """
        Extract text and audio messages from a webhook payload.

        Status updates (sent/delivered/read) and unsupported message types
        are silently ignored.
        """
        messages: list[IncomingMessage] = []

        if payload.get("object") != "whatsapp_business_account":
            logger.debug("Ignoring non-WhatsApp webhook object: %s", payload.get("object"))
            return messages

        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                for msg in value.get("messages", []):
                    parsed = self._parse_message(msg)
                    if parsed:
                        messages.append(parsed)

        return messages

    def _parse_message(self, msg: dict) -> Optional[IncomingMessage]:
        msg_type = msg.get("type")
        phone = msg.get("from")
        msg_id = msg.get("id", "")

        if not phone:
            return None

        if msg_type == "text":
            body = msg.get("text", {}).get("body", "").strip()
            if not body:
                return None
            logger.info("Extracted text message from %s...", phone[:10])
            return IncomingMessage(
                phone_number=phone,
                message_id=msg_id,
                message_type="text",
                text=body,
                audio_id=None,
                mime_type=None,
            )

        if msg_type == "audio":
            audio = msg.get("audio", {})
            audio_id = audio.get("id")
            mime_type = audio.get("mime_type", "audio/ogg")
            if not audio_id:
                return None
            logger.info("Extracted audio message from %s... (audio_id=%s...)", phone[:10], audio_id[:15])
            return IncomingMessage(
                phone_number=phone,
                message_id=msg_id,
                message_type="audio",
                text=None,
                audio_id=audio_id,
                mime_type=mime_type,
            )

        logger.debug("Ignoring unsupported message type: %s", msg_type)
        return None

    # ------------------------------------------------------------------
    # Webhook verification challenge
    # ------------------------------------------------------------------

    def verify_challenge(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """
        Handle Meta's GET-based webhook verification handshake.

        Returns the challenge string on success, None on failure.
        """
        if mode == "subscribe" and token == self._verify_token:
            logger.info("Webhook verification successful")
            return challenge
        logger.warning("Webhook verification failed: mode=%s token_match=%s", mode, token == self._verify_token)
        return None

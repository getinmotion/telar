"""
Artisan Support (Copiloto) WhatsApp webhook router.

Separate webhook from the sales bot (whatsapp_api.py) — different WhatsApp
number/credentials (ARTISAN_WHATSAPP_*), different bot logic (RAG tutor over
training materials instead of product search).

Endpoints:
  GET  /artisan-support/whatsapp/webhook  — Meta challenge-response verification
  POST /artisan-support/whatsapp/webhook  — Receive incoming messages and status updates

The POST handler returns 200 OK immediately and processes the message
as a background asyncio task so Meta doesn't time out the webhook.
"""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse

from agents.services.artisan_support.tutor_bot_service import process_message
from agents.services.whatsapp.webhook_handler import WebhookHandler
from src.api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/artisan-support/whatsapp", tags=["Artisan Support WhatsApp"])

# Single shared handler instance (reads config at import time)
_webhook_handler = WebhookHandler(
    webhook_secret=settings.artisan_whatsapp_webhook_secret,
    verify_token=settings.artisan_whatsapp_webhook_verify_token,
)


# ============================================================
# GET /webhook — Meta challenge-response for webhook setup
# ============================================================

@router.get("/webhook", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge"),
):
    """
    Webhook verification endpoint required by Meta during initial setup.

    Meta sends a GET with hub.mode="subscribe", the verify_token we configured,
    and a random challenge string. We must return the challenge to confirm ownership.
    """
    challenge = _webhook_handler.verify_challenge(hub_mode, hub_token, hub_challenge)
    if challenge:
        return PlainTextResponse(content=challenge)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Webhook verification failed — check ARTISAN_WHATSAPP_WEBHOOK_VERIFY_TOKEN",
    )


# ============================================================
# POST /webhook — Receive incoming messages
# ============================================================

@router.post("/webhook")
async def receive_webhook(request: Request):
    """
    Receive and acknowledge incoming WhatsApp events from Meta.

    Returns 200 OK immediately. Message processing runs as a background
    asyncio task to prevent Meta from retrying due to slow responses.
    """
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")

    try:
        payload = _webhook_handler.parse_and_validate(body, signature)
    except ValueError as exc:
        logger.error("Webhook validation error: %s", exc)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except Exception as exc:
        logger.error("Webhook parse error: %s", exc)
        return JSONResponse(content={"status": "error", "message": str(exc)})

    messages = _webhook_handler.extract_messages(payload)

    if not messages:
        # Status updates (delivered/read), unsupported types — acknowledge and ignore
        return JSONResponse(content={"status": "ok"})

    for msg in messages:
        asyncio.create_task(process_message(msg))

    return JSONResponse(content={"status": "ok"})

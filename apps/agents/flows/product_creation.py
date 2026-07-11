"""
Product creation flow handler.
Orchestrates the 6-step product creation wizard.

AI steps  : 1 (Captura) and 3 (Proceso)
Save-only : 2 (Identidad confirmada) and 4 (Precio/Logística confirmado)
No-IA     : 5 (Preview) and 6 (Publicar) — handled by the frontend
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Dict, Optional

from agents.agents.product import ProductoAgent
from agents.agents.pricing import PricingAgent
from agents.core.memory import memory_service
from agents.helpers import format_timestamp
from src.database.supabase_client import db

if TYPE_CHECKING:
    from agents.api import AgentRequest

logger = logging.getLogger(__name__)

# Lazy-initialised agent instances (shared across requests, stateless)
_product_agent: ProductoAgent | None = None
_pricing_agent: PricingAgent | None = None


def _get_product_agent() -> ProductoAgent:
    global _product_agent
    if _product_agent is None:
        _product_agent = ProductoAgent()
    return _product_agent


def _get_pricing_agent() -> PricingAgent:
    global _pricing_agent
    if _pricing_agent is None:
        _pricing_agent = PricingAgent()
    return _pricing_agent


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def process_product_creation_flow(request: "AgentRequest") -> Dict[str, Any]:
    """
    Dispatch to the appropriate step handler based on request.step.

    Steps implemented:
        step_1_initial_capture          → AI: producto agent
        step_2_artisan_identity_confirm → save-only
        step_3_process_registration     → AI: producto + pricing agents
        step_4_pricing_logistics_confirm → save-only
    """
    step = (request.step or "").strip()
    handlers = {
        "step_1_initial_capture": _step1,
        "step_2_artisan_identity_confirm": _step2,
        "step_3_process_registration": _step3,
        "step_4_pricing_logistics_confirm": _step4,
    }
    handler = handlers.get(step)
    if handler is None:
        raise ValueError(
            f"Unknown product_creation step: '{step}'. "
            f"Valid steps: {list(handlers)}"
        )
    return await handler(request)


# ---------------------------------------------------------------------------
# Step helpers
# ---------------------------------------------------------------------------

async def _load_artisan_context(user_id: Optional[str]) -> Dict[str, Any]:
    """Load artisan profile from memory service for prompt injection."""
    if not user_id:
        return {}
    try:
        from uuid import UUID
        profile = await memory_service.get_artisan_profile(UUID(user_id))
        if not profile:
            return {}
        key_insights = profile.key_insights or {}
        return {
            "artisan_name": key_insights.get("nombre"),
            "maturity_level": (profile.maturity_snapshot or {}).get("general"),
            "tipo_artesania": key_insights.get("tipo_artesania"),
            "region": key_insights.get("region"),
        }
    except Exception as e:
        logger.warning(f"Could not load artisan context for {user_id}: {e}")
        return {}


# ---------------------------------------------------------------------------
# Step 1 — Captura inicial (AI: producto)
# ---------------------------------------------------------------------------

async def _step1(request: "AgentRequest") -> Dict[str, Any]:
    payload = request.payload or {}
    product_name = payload.get("product_name", "")
    short_description = payload.get("short_description", "")
    history_context = payload.get("history_context", "")
    photos: Dict[str, Optional[str]] = payload.get("photos") or {}

    if not product_name:
        raise ValueError("payload.product_name is required for step_1_initial_capture")

    artisan_context = await _load_artisan_context(request.user_id)

    agent_result = await _get_product_agent().process_creation_step1(
        product_name=product_name,
        short_description=short_description,
        history_context=history_context,
        photos=photos,
        artisan_context=artisan_context,
    )

    # Create the product draft in DB
    initial_snapshot: Dict[str, Any] = {
        "step1_input": {
            "product_name": product_name,
            "short_description": short_description,
            "history_context": history_context,
            "photos": photos,
        },
        "step1_ai_output": agent_result,
    }
    try:
        product_draft_id = await db.create_product_draft(
            user_id=request.user_id,
            session_id=request.session_id,
            initial_snapshot=initial_snapshot,
        )
    except Exception as e:
        logger.error(f"Failed to create product draft: {e}")
        # Generate a temporary UUID so the flow can continue even if DB is unavailable
        import uuid
        product_draft_id = str(uuid.uuid4())

    return {
        "product_draft_id": product_draft_id,
        "step": "step_1_initial_capture",
        "status": {
            "code": "success",
            "agent_used": "producto",
        },
        "content_improvements": agent_result.get("content_improvements") or {},
        "identity_suggestions": agent_result.get("identity_suggestions") or {},
        "variant_suggestions": agent_result.get("variant_suggestions") or {"has_variants": False, "axes": []},
        "oraculo": agent_result.get("oraculo") or {
            "title": "¡Buena base!",
            "body": "Tu producto ha sido analizado. Revisa las sugerencias y confirma las mejoras.",
            "next_step_hint": "Revisa las mejoras de texto y la categoría sugerida antes de continuar.",
        },
    }


# ---------------------------------------------------------------------------
# Step 2 — Confirmar identidad (save-only)
# ---------------------------------------------------------------------------

async def _step2(request: "AgentRequest") -> Dict[str, Any]:
    payload = request.payload or {}
    product_draft_id = request.product_draft_id

    if not product_draft_id:
        raise ValueError("product_draft_id is required for step_2_artisan_identity_confirm")

    confirmed_content = payload.get("confirmed_content") or {}
    confirmed_identity = payload.get("confirmed_identity") or {}

    step_snapshot: Dict[str, Any] = {
        "step2": {
            "confirmed_content": confirmed_content,
            "confirmed_identity": confirmed_identity,
        }
    }

    try:
        await db.update_product_draft(
            product_draft_id=product_draft_id,
            current_step="step_2_artisan_identity_confirm",
            step_snapshot=step_snapshot,
        )
    except Exception as e:
        logger.error(f"Failed to update product draft (step 2): {e}")

    return {
        "product_draft_id": product_draft_id,
        "step": "step_2_artisan_identity_confirm",
        "status": {
            "code": "success",
            "saved": True,
        },
        "oraculo": {
            "title": "Identidad confirmada",
            "body": (
                f"Tu pieza está categorizada como {_label(confirmed_identity, 'category')} "
                f"con técnica de {_label(confirmed_identity, 'oficio')}."
            ),
            "next_step_hint": "Sube fotos del proceso para que detectemos fases y herramientas utilizadas.",
        },
    }


# ---------------------------------------------------------------------------
# Step 3 — Registro de proceso (AI: producto + pricing)
# ---------------------------------------------------------------------------

async def _step3(request: "AgentRequest") -> Dict[str, Any]:
    payload = request.payload or {}
    product_draft_id = request.product_draft_id

    if not product_draft_id:
        raise ValueError("product_draft_id is required for step_3_process_registration")

    process_description = payload.get("process_description", "")
    process_photos: Dict[str, Optional[str]] = payload.get("process_photos") or {}

    # Load accumulated snapshot to pass product context (category, oficio, materials)
    product_context: Dict[str, Any] = {}
    try:
        draft = await db.get_product_draft(product_draft_id)
        if draft:
            snap = draft.get("accumulated_snapshot") or {}
            step1_input = snap.get("step1_input") or {}
            step2 = snap.get("step2") or {}
            confirmed_id = step2.get("confirmed_identity") or {}
            product_context = {
                "product_name": step1_input.get("product_name", ""),
                "category": (confirmed_id.get("category") or {}).get("value", ""),
                "oficio": (confirmed_id.get("oficio") or {}).get("value", ""),
                "materials": [
                    m.get("value", "") for m in (confirmed_id.get("materials") or [])
                ],
            }
    except Exception as e:
        logger.warning(f"Could not load draft context for step 3: {e}")

    artisan_context = await _load_artisan_context(request.user_id)

    # Producto agent: analyse process
    process_result = await _get_product_agent().process_creation_step3_process(
        process_description=process_description,
        process_photos=process_photos,
        product_context=product_context,
        artisan_context=artisan_context,
    )
    process_analysis = process_result.get("process_analysis") or {}

    # Pricing agent: suggest price based on process analysis
    pricing_result = await _get_pricing_agent().suggest_product_price(
        process_analysis=process_analysis,
        product_context=product_context,
        artisan_context=artisan_context,
    )
    pricing_suggestions = pricing_result.get("pricing_suggestions") or {}

    step_snapshot: Dict[str, Any] = {
        "step3": {
            "process_description": process_description,
            "process_analysis": process_analysis,
            "pricing_suggestions": pricing_suggestions,
        }
    }

    try:
        await db.update_product_draft(
            product_draft_id=product_draft_id,
            current_step="step_3_process_registration",
            step_snapshot=step_snapshot,
        )
    except Exception as e:
        logger.error(f"Failed to update product draft (step 3): {e}")

    oraculo = process_result.get("oraculo") or {}
    phases = (process_analysis.get("structured_process") or {}).get("phases") or []
    elab_time = (process_analysis.get("elaboration_time") or {}).get("value", "")
    price_val = (pricing_suggestions.get("suggested_price") or {}).get("value")
    price_str = f"COP {price_val:,}" if isinstance(price_val, (int, float)) else ""

    return {
        "product_draft_id": product_draft_id,
        "step": "step_3_process_registration",
        "status": {
            "code": "success",
            "agents_used": ["producto", "pricing"],
        },
        "process_analysis": process_analysis,
        "pricing_suggestions": pricing_suggestions,
        "oraculo": {
            "title": oraculo.get("title") or "Proceso documentado",
            "body": oraculo.get("body") or (
                f"Detecté {len(phases)} fase(s) en tu proceso de elaboración"
                + (f" y estimé {elab_time} de producción." if elab_time else ".")
            ),
            "next_step_hint": oraculo.get("next_step_hint") or (
                f"En el paso 4 encontrarás el precio sugerido"
                + (f" ({price_str})" if price_str else "")
                + " y la guía de dimensiones."
            ),
        },
    }


# ---------------------------------------------------------------------------
# Step 4 — Confirmar precio y logística (save-only)
# ---------------------------------------------------------------------------

async def _step4(request: "AgentRequest") -> Dict[str, Any]:
    payload = request.payload or {}
    product_draft_id = request.product_draft_id

    if not product_draft_id:
        raise ValueError("product_draft_id is required for step_4_pricing_logistics_confirm")

    confirmed_process = payload.get("confirmed_process") or {}
    confirmed_pricing = payload.get("confirmed_pricing") or {}
    confirmed_logistics = payload.get("confirmed_logistics") or {}
    availability = payload.get("availability") or {}
    confirmed_variants = payload.get("confirmed_variants") or {}

    step_snapshot: Dict[str, Any] = {
        "step4": {
            "confirmed_process": confirmed_process,
            "confirmed_pricing": confirmed_pricing,
            "confirmed_logistics": confirmed_logistics,
            "availability": availability,
            "confirmed_variants": confirmed_variants,
        }
    }

    try:
        await db.update_product_draft(
            product_draft_id=product_draft_id,
            current_step="step_4_pricing_logistics_confirm",
            step_snapshot=step_snapshot,
        )
    except Exception as e:
        logger.error(f"Failed to update product draft (step 4): {e}")

    price = confirmed_pricing.get("price")
    avail_type = availability.get("type", "")
    avail_label = {
        "disponible_ahora": "disponible ahora",
        "bajo_pedido": "bajo pedido",
        "edicion_limitada": "edición limitada",
    }.get(avail_type, avail_type)

    return {
        "product_draft_id": product_draft_id,
        "step": "step_4_pricing_logistics_confirm",
        "status": {
            "code": "success",
            "saved": True,
        },
        "oraculo": {
            "title": "¡Casi listo!",
            "body": (
                f"Tu pieza tiene precio definido"
                + (f" (COP {price:,})" if isinstance(price, (int, float)) else "")
                + ", logística configurada"
                + (f" y disponibilidad: {avail_label}" if avail_label else "")
                + "."
            ),
            "next_step_hint": "Revisa cómo se verá tu pieza en la tienda antes de publicarla.",
        },
    }


# ---------------------------------------------------------------------------
# Utils
# ---------------------------------------------------------------------------

def _label(identity: Dict[str, Any], key: str) -> str:
    """Safely extract a label from a confirmed identity field."""
    field = identity.get(key) or {}
    if isinstance(field, dict):
        return field.get("value") or field.get("label") or key
    return str(field) or key

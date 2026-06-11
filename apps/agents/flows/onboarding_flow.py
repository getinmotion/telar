"""
Onboarding structured flow handler.
Processes payload.onboarding_identity and returns the new streamlined response format.
"""

from agents.agents.onboarding import OnboardingAgent
from typing import TYPE_CHECKING, Dict, Any
import logging

if TYPE_CHECKING:
    from agents.api import AgentRequest

logger = logging.getLogger(__name__)

_onboarding_agent: OnboardingAgent | None = None


def _get_agent() -> OnboardingAgent:
    global _onboarding_agent
    if _onboarding_agent is None:
        _onboarding_agent = OnboardingAgent()
    return _onboarding_agent


async def process_onboarding_flow(request: "AgentRequest") -> Dict[str, Any]:
    """
    Handle flow='onboarding' requests.

    Expects request.payload to contain:
        onboarding_identity: {
            metadata: { artisan_id, submitted_at, form_version },
            blocks: { identity, commercial_reality, clients_market, operations_growth }
        }

    Returns the new onboarding_response format per API spec.
    """
    payload = request.payload or {}
    onboarding_identity = payload.get("onboarding_identity") or {}

    if not onboarding_identity:
        raise ValueError("payload.onboarding_identity is required for flow='onboarding'")

    meta = onboarding_identity.get("metadata") or {}
    artisan_name = meta.get("artisan_name") or meta.get("nombre")

    # Resolve user_id: prefer explicit request.user_id, fallback to payload metadata
    user_id = request.user_id or meta.get("artisan_id")

    context = {
        "session_id": request.session_id,
        "user_id": user_id,
    }

    agent = _get_agent()
    return await agent.process_structured(
        onboarding_identity=onboarding_identity,
        artisan_name=artisan_name,
        context=context,
    )

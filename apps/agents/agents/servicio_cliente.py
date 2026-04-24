"""
Customer Service Agent — handles return policies, PQRS, shipping support.
Includes a step-by-step Return Policy Wizard.
"""

from agents.agents.base import BaseAgent
from agents.prompts import get_servicio_cliente_prompt
from agents.tools.vector_search import rag_service
from agents.services.wizard_service import return_policy_wizard
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Keywords that trigger each intent
_RETURN_POLICY_KEYWORDS = [
    "política de devolución", "politica de devolucion", "política de devoluciones",
    "crear política", "cómo hago devoluciones", "como hago devoluciones",
    "redactar política", "generar política", "escribir política",
    "devolución", "devolucion", "devolver",
]
_PQRS_KEYWORDS = [
    "pqrs", "petición", "peticion", "queja", "reclamo", "sugerencia",
    "cliente insatisfecho", "reclamación", "reclamacion",
]
_SHIPPING_KEYWORDS = [
    "envío", "envio", "paquete", "pedido no llegó", "pedido no llego",
    "seguimiento", "tracking", "courier", "transportadora", "domicilio",
    "despacho", "delivery",
]


def _detect_intent(user_input: str) -> str:
    """Detect the customer service intent from user input."""
    text = user_input.lower()

    # Wizard continuation: if the message is short and seems like a wizard answer
    # (intent detection is skipped — caller handles wizard state)

    for kw in _RETURN_POLICY_KEYWORDS:
        if kw in text:
            return "return_policy"

    for kw in _PQRS_KEYWORDS:
        if kw in text:
            return "pqrs"

    for kw in _SHIPPING_KEYWORDS:
        if kw in text:
            return "shipping"

    return "general_cs"


class ServicioClienteAgent(BaseAgent):
    """
    Specialized agent for customer service topics.
    Handles return policy creation (wizard), PQRS guidance, and shipping support.
    """

    def __init__(self):
        super().__init__(agent_type="servicio_cliente")

    def get_system_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        return get_servicio_cliente_prompt(context)

    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        context = context or {}
        conversation_history = context.get("conversation_history", [])

        # ── Wizard continuation ──────────────────────────────────────────────
        wizard_data = context.get("wizard_data")
        if wizard_data is not None:
            artisan_name = (
                context.get("artisan_profile", {})
                .get("key_insights", {})
                .get("nombre", "")
            )
            bulk_answers = context.get("wizard_answers")
            if bulk_answers:
                result = return_policy_wizard.build_response_bulk(
                    wizard_data=wizard_data,
                    answers=bulk_answers,
                    artisan_name=artisan_name,
                )
            else:
                result = return_policy_wizard.build_response(
                    wizard_data=wizard_data,
                    user_answer=user_input,
                    artisan_name=artisan_name,
                )

            # Store memory if wizard completed
            if result.get("wizard_complete") and result.get("policy_document"):
                await self._store_agent_memory(
                    content=f"Política de devoluciones generada:\n{result['policy_document']}",
                    memory_type="strategy",
                    context=context,
                    importance_score=0.85,
                )

            return {
                "agent_type": self.agent_type,
                **result,
                "sources": [],
            }

        # ── First interaction: detect intent ─────────────────────────────────
        intent = _detect_intent(user_input)
        logger.info(f"ServicioCliente intent detected: {intent}")

        if intent == "return_policy":
            artisan_name = (
                context.get("artisan_profile", {})
                .get("key_insights", {})
                .get("nombre", "")
            )
            bulk_answers = context.get("wizard_answers")
            if bulk_answers:
                result = return_policy_wizard.build_response_bulk(
                    wizard_data={},
                    answers=bulk_answers,
                    artisan_name=artisan_name,
                )
            else:
                result = return_policy_wizard.build_response(
                    wizard_data={},
                    user_answer=None,
                )
            return {
                "agent_type": self.agent_type,
                **result,
                "sources": [],
            }

        # ── RAG-based response for PQRS, shipping, general ───────────────────
        system_prompt = self.get_system_prompt(context)

        try:
            rag_result = await rag_service.generate_rag_response(
                query=user_input,
                category="servicio_cliente",
                system_prompt=system_prompt,
                context=context,
                conversation_history=conversation_history,
            )
            answer = rag_result.get("answer", "")
            sources = rag_result.get("sources", [])
            confidence = rag_result.get("confidence", "medium")
        except Exception as e:
            logger.warning(f"RAG failed, falling back to LLM only: {e}")
            answer = await self._call_llm(
                user_message=user_input,
                system_prompt=system_prompt,
                temperature=0.4,
            )
            sources = []
            confidence = "low"

        # Append WhatsApp redirect hint for shipping/PQRS when number is configured
        whatsapp_number = context.get("whatsapp_redirect_number") or (
            context.get("artisan_profile", {})
            .get("key_insights", {})
            .get("whatsapp_number")
        )
        if intent in ("pqrs", "shipping") and whatsapp_number:
            answer += (
                f"\n\n📱 *Para casos urgentes, también puedes atender directamente a tu cliente "
                f"por WhatsApp: {whatsapp_number}*"
            )

        # Store conversational memory
        await self._store_agent_memory(
            content=f"Consulta: {user_input}\nRespuesta: {answer}",
            memory_type="conversational",
            context=context,
        )

        return {
            "agent_type": self.agent_type,
            "answer": answer,
            "intent": intent,
            "wizard_active": False,
            "wizard_complete": False,
            "wizard_data": None,
            "policy_document": None,
            "sources": sources,
            "confidence": confidence,
        }

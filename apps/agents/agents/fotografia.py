"""
Photography Agent — analyzes product photos and gives improvement tips.
Supports GPT-4o vision (multimodal) when an image URL is provided.
"""

from agents.agents.base import BaseAgent
from agents.prompts import get_fotografia_prompt
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

_PHOTO_KEYWORDS = [
    "foto", "fotografía", "fotografia", "imagen", "photo", "picture",
    "tomar fotos", "mejorar fotos", "cámara", "camara", "encuadre",
    "iluminación", "iluminacion", "fondo", "composición", "composicion",
    "cómo fotografío", "como fotografio",
]


def _has_photo_keywords(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in _PHOTO_KEYWORDS)


class FotografiaAgent(BaseAgent):
    """
    Specialized agent for product photography.
    Uses GPT-4o vision when context contains an image_url.
    Falls back to text-only advice when no image is provided.
    """

    def __init__(self):
        super().__init__(agent_type="fotografia")

    def get_system_prompt(self, context: Optional[Dict[str, Any]] = None) -> str:
        return get_fotografia_prompt(context)

    async def _call_vision_llm(
        self,
        user_message: str,
        image_url: str,
        system_prompt: str,
        conversation_history: Optional[List[Dict]] = None,
        temperature: float = 0.4,
        max_tokens: int = 1500,
    ) -> str:
        """
        Call GPT-4o with a text + image input (multimodal).

        Args:
            user_message: Text instruction from the user
            image_url: Publicly accessible URL of the product image
            system_prompt: System prompt for the agent
            conversation_history: Optional prior conversation
            temperature: Sampling temperature
            max_tokens: Max tokens in response

        Returns:
            LLM response text
        """
        messages = [{"role": "system", "content": system_prompt}]

        # Add recent conversation history (excluding current turn)
        if conversation_history:
            for msg in conversation_history[-4:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })

        # Multimodal user message
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": user_message},
                {
                    "type": "image_url",
                    "image_url": {"url": image_url, "detail": "high"},
                },
            ],
        })

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        context = context or {}
        system_prompt = self.get_system_prompt(context)
        conversation_history = context.get("conversation_history", [])

        image_url: Optional[str] = context.get("image_url")

        # ── Mode 1: Vision analysis ──────────────────────────────────────────
        if image_url:
            logger.info(f"FotografiaAgent: analyzing image {image_url[:80]}...")
            try:
                analysis_prompt = (
                    user_input
                    if _has_photo_keywords(user_input)
                    else f"Analiza esta foto de mi producto artesanal y dame recomendaciones para mejorarla. {user_input}"
                )
                answer = await self._call_vision_llm(
                    user_message=analysis_prompt,
                    image_url=image_url,
                    system_prompt=system_prompt,
                    conversation_history=conversation_history,
                )
                mode = "vision_analysis"
            except Exception as e:
                logger.error(f"Vision LLM call failed: {e}")
                # Fall back to text-only advice
                answer = await self._call_llm(
                    user_message=(
                        f"No pude analizar la imagen directamente. "
                        f"Dame consejos generales de fotografía para este tipo de producto. "
                        f"Consulta del artesano: {user_input}"
                    ),
                    system_prompt=system_prompt,
                    temperature=0.4,
                )
                image_url = None
                mode = "text_fallback"

        # ── Mode 2: Text-only advice ─────────────────────────────────────────
        else:
            logger.info("FotografiaAgent: no image provided, giving text advice")
            craft_type = (
                context.get("artisan_profile", {})
                .get("key_insights", {})
                .get("tipo_artesania", "")
            )
            text_prompt = user_input
            if craft_type:
                text_prompt = (
                    f"Soy artesano de {craft_type}. {user_input}"
                    if user_input
                    else f"Dame consejos de fotografía para productos de {craft_type}."
                )

            messages_with_history = [{"role": "system", "content": system_prompt}]
            if conversation_history:
                for msg in conversation_history[-4:]:
                    messages_with_history.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", ""),
                    })
            messages_with_history.append({"role": "user", "content": text_prompt})

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages_with_history,
                temperature=0.4,
                max_tokens=1200,
            )
            answer = response.choices[0].message.content
            mode = "text_advice"

        # Store strategy memory
        await self._store_agent_memory(
            content=f"Consulta fotografía: {user_input[:200]}\nConsejo: {answer[:300]}",
            memory_type="strategy",
            context=context,
            importance_score=0.6,
        )

        return {
            "agent_type": self.agent_type,
            "answer": answer,
            "mode": mode,
            "image_analyzed": bool(image_url),
            "image_url": image_url,
            "sources": [],
        }

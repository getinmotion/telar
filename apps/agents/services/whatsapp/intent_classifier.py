"""
User intent classification for the WhatsApp marketplace bot.

Uses GPT-4o-mini to extract:
  - intent_type: "greeting" | "search_products"
  - price_min / price_max: optional price range in COP pesos

Shop/region listing intents from the old Supabase-based bot are dropped
because the equivalent Lightsail PostgreSQL tables don't exist. All
non-greeting intents fall through to semantic product search.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Optional

import openai

from src.api.config import settings

logger = logging.getLogger(__name__)

_MODEL = "gpt-4o-mini"

_SYSTEM_PROMPT = """\
Eres un clasificador de intenciones para un bot de artesanías colombianas.

ANALIZA el mensaje (y el contexto de conversación previo si lo hay) y responde en JSON:

{
  "intent_type": "greeting" | "search_products",
  "price_min": number | null,
  "price_max": number | null
}

REGLAS:
- intent_type = "greeting" SOLO si el mensaje es un saludo sin consulta de producto \
(hola, buenos días, help, ayuda, etc.) y tiene menos de 20 caracteres.
- intent_type = "search_products" para cualquier búsqueda de productos, tiendas, materiales, \
regiones, precios, etc.
- price_min / price_max: extrae el rango de precio en pesos colombianos (entero).
  * "250 mil", "250k", "250.000" → 250000
  * "hasta 500 mil" → price_max = 500000
  * "entre 100k y 300k" → price_min = 100000, price_max = 300000
  * Si no se menciona precio → null

Responde SOLO con el JSON, sin texto adicional.
"""


@dataclass
class IntentResult:
    intent_type: str               # "greeting" | "search_products"
    price_min: Optional[int]       # COP pesos
    price_max: Optional[int]       # COP pesos


class IntentClassifier:
    """Classifies user intent using GPT-4o-mini."""

    def __init__(self) -> None:
        self._client = openai.AsyncOpenAI(api_key=settings.openai_api_key)

    async def classify(self, query: str, context: str = "") -> IntentResult:
        """
        Classify user intent from a message and optional conversation context.

        Falls back to "search_products" on any API error.
        """
        user_content = query
        if context:
            user_content = f"{context}\n\nMENSAJE ACTUAL: {query}"

        try:
            resp = await self._client.chat.completions.create(
                model=_MODEL,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.1,
                max_tokens=100,
                response_format={"type": "json_object"},
            )

            result = json.loads(resp.choices[0].message.content)
            intent = IntentResult(
                intent_type=result.get("intent_type", "search_products"),
                price_min=_to_int(result.get("price_min")),
                price_max=_to_int(result.get("price_max")),
            )
            logger.info(
                "Intent classified: type=%s price=[%s, %s]",
                intent.intent_type,
                intent.price_min,
                intent.price_max,
            )
            return intent

        except Exception as exc:
            logger.error("Intent classification failed: %s — defaulting to search_products", exc)
            return IntentResult(intent_type="search_products", price_min=None, price_max=None)


def _to_int(value) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# Module-level singleton
intent_classifier = IntentClassifier()

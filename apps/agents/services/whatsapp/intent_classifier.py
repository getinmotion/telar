"""
User intent classification for the WhatsApp marketplace bot.

Uses GPT-4o-mini to classify the intent and extract metadata in a single call:
  - intent_type: what the user wants
  - empathetic_intro: a short warm sentence acknowledging the user's goal
  - price_min / price_max: optional price range in COP pesos
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
Eres el asistente de Telar.co, un marketplace de artesanías colombianas. \
Analiza el mensaje del usuario (y el contexto previo si lo hay) y responde ÚNICAMENTE con este JSON:

{
  "intent_type": string,
  "empathetic_intro": string,
  "price_min": number | null,
  "price_max": number | null
}

═══ INTENT_TYPE — elige UNO: ═══

"greeting"        → Saludo puro sin consulta (hola, buenos días, ayuda). Máx 20 caracteres.
"search_products" → Busca productos artesanales específicos.
"ask_regions"     → Pregunta POR las regiones/ubicaciones/departamentos/ciudades de los artesanos.
                    Ejemplos: "¿de dónde son los artesanos?", "¿qué regiones tienen?",
                    "¿de qué partes de Colombia son las artesanías?", "ubicaciones"
"ask_materials"   → Pregunta POR los materiales/tipos de artesanía disponibles.
                    Ejemplos: "¿qué materiales tienen?", "¿en qué materiales trabajan?"
"ask_stores"      → Pregunta POR las tiendas/artesanos disponibles (sin buscar producto).
                    Ejemplos: "¿qué tiendas tienen?", "¿quiénes son los artesanos?"
"ask_knowledge"   → Pregunta SOBRE qué es un material, técnica o tipo de artesanía.
                    Ejemplos: "¿qué es la alfarería?", "¿qué es el macramé?",
                    "cuéntame sobre el tejido wayuu", "¿cómo se hace la cerámica?"

═══ EMPATHETIC_INTRO ═══
2-3 oraciones cálidas y empáticas (máx 60 palabras) que reconozcan profundamente la INTENCIÓN del usuario.
La intro debe: (1) reconocer la intención con calidez, (2) añadir un dato cultural interesante o contexto
emocional relevante, (3) conectar con el resultado que viene.

- Para "greeting": "" (vacío)
- Para "ask_knowledge": algo breve como "¡Qué pregunta tan interesante! 🎨"
- Para "ask_regions": "¡Con gusto! Colombia es un país increíblemente diverso — nuestros artesanos vienen de montañas, costas y selvas 🗺️"
- Para "ask_materials": "¡Tenemos una gran variedad! Cada material cuenta una historia diferente de Colombia 🎨"
- Para "ask_stores": "¡Claro! Trabajamos con artesanos apasionados de todo el país 🏪"
- Para "search_products": intro rica según el contexto. Ejemplos:
  * "regalo de madera para mamá" → "¡Qué gesto tan especial! La madera es símbolo de fortaleza y amor eterno — un regalo que durará toda la vida. Aquí encontré algunas piezas únicas hechas a mano por artesanos colombianos: 🪵"
  * "cerámica decorativa" → "¡Excelente elección! La cerámica artesanal colombiana tiene siglos de historia — cada pieza lleva el alma del artesano que la moldeó. Aquí algunas opciones hermosas: 🏺"
  * "textiles wayuu" → "¡Maravilloso! Los textiles Wayuu son patrimonio cultural de Colombia — tejidos a mano con técnicas que se transmiten de generación en generación. Aquí algunas piezas disponibles: 🧶"
  * precio mencionado → incluir algo como: "...todo dentro de tu presupuesto de hasta $X COP."

Si el usuario menciona un PRECIO, el intro debe reflejar ese presupuesto de forma positiva.

═══ PRECIO — MUY IMPORTANTE: notación española ═══
En español, el PUNTO (.) es separador de miles, NO decimal.
- "50.000" = cincuenta mil = 50000 (NO 50 millones)
- "250.000" = doscientos cincuenta mil = 250000
- "1.000.000" = un millón = 1000000
- "250 mil", "250k" → 250000
- "50 lucas", "50 mil pesos" → 50000
- "hasta 500 mil" → price_max=500000
- "entre 100k y 300k" → price_min=100000, price_max=300000
- "no mayor a 50.000" → price_max=50000
- Sin precio mencionado → null

Responde SOLO con el JSON. Sin texto adicional.
"""


@dataclass
class IntentResult:
    intent_type: str               # "greeting" | "search_products" | "ask_regions" | "ask_materials" | "ask_stores" | "ask_knowledge"
    empathetic_intro: str          # 2-3 warm sentences, empty for greetings
    price_min: Optional[int]       # COP pesos
    price_max: Optional[int]       # COP pesos


class IntentClassifier:
    """Classifies user intent and generates an empathetic intro using GPT-4o-mini."""

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
                temperature=0.4,
                max_tokens=350,
                response_format={"type": "json_object"},
            )

            result = json.loads(resp.choices[0].message.content)
            intent = IntentResult(
                intent_type=result.get("intent_type", "search_products"),
                empathetic_intro=result.get("empathetic_intro", ""),
                price_min=_to_int(result.get("price_min")),
                price_max=_to_int(result.get("price_max")),
            )
            logger.info(
                "Intent: type=%s intro='%s' price=[%s, %s]",
                intent.intent_type,
                intent.empathetic_intro[:40] if intent.empathetic_intro else "",
                intent.price_min,
                intent.price_max,
            )
            return intent

        except Exception as exc:
            logger.error("Intent classification failed: %s — defaulting to search_products", exc)
            return IntentResult(
                intent_type="search_products",
                empathetic_intro="",
                price_min=None,
                price_max=None,
            )


def _to_int(value) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# Module-level singleton
intent_classifier = IntentClassifier()

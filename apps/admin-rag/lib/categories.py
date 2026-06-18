"""Registry of known agent knowledge categories."""

from agents.prompts import (
    get_legal_prompt,
    get_faq_prompt,
    get_pricing_prompt,
    get_presencia_digital_prompt,
    get_servicio_cliente_prompt,
    get_fotografia_prompt,
    get_product_prompt,
    get_artisan_tutor_prompt,
)

AGENT_CATEGORIES = {
    "legal": {
        "label": "Legal",
        "icon": "⚖️",
        "prompt_fn": get_legal_prompt,
    },
    "faq": {
        "label": "FAQ General",
        "icon": "❓",
        "prompt_fn": get_faq_prompt,
    },
    "pricing": {
        "label": "Precios",
        "icon": "💰",
        "prompt_fn": get_pricing_prompt,
    },
    "presencia_digital": {
        "label": "Presencia Digital",
        "icon": "🌐",
        "prompt_fn": get_presencia_digital_prompt,
    },
    "servicio_cliente": {
        "label": "Servicio al Cliente",
        "icon": "🤝",
        "prompt_fn": get_servicio_cliente_prompt,
    },
    "fotografia": {
        "label": "Fotografía",
        "icon": "📷",
        "prompt_fn": get_fotografia_prompt,
    },
    "producto": {
        "label": "Producto",
        "icon": "🛍️",
        "prompt_fn": get_product_prompt,
    },
    "capacitaciones": {
        "label": "Capacitaciones (Copiloto Artesanos)",
        "icon": "🎓",
        "prompt_fn": get_artisan_tutor_prompt,
    },
}


def get_label(category: str) -> str:
    """Return a friendly label for a category, falling back to the raw name."""
    entry = AGENT_CATEGORIES.get(category)
    return entry["label"] if entry else category


def get_icon(category: str) -> str:
    """Return an icon for a category, falling back to a generic document icon."""
    entry = AGENT_CATEGORIES.get(category)
    return entry["icon"] if entry else "📄"


def get_display_label(category: str) -> str:
    """Return 'icon Label' for use in selectors and tables."""
    return f"{get_icon(category)} {get_label(category)}"


def get_prompt_for_category(category: str) -> str:
    """Return the system prompt for a category, or a generic fallback."""
    entry = AGENT_CATEGORIES.get(category)
    if entry:
        return entry["prompt_fn"]()
    return (
        "Eres un asistente de Telar. Responde preguntas usando únicamente la "
        "información recuperada de la base de conocimiento. Si no encuentras "
        "información relevante, dilo honestamente sin inventar datos."
    )


def all_category_keys() -> list[str]:
    """Known category keys, used to seed the selector even if empty in DB."""
    return list(AGENT_CATEGORIES.keys())

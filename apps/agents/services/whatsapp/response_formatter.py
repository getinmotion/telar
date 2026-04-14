"""
WhatsApp message formatting for the marketplace bot.

All functions are pure (no I/O) and return WhatsApp-safe strings
(plain text + WhatsApp markdown: *bold*, _italic_).
"""

from __future__ import annotations

from typing import Optional

from agents.services.semantic_search_service import ProductSearchResult

_PRODUCT_BASE_URL = "https://telar.co/product/"
_MAX_DESCRIPTION_CHARS = 120


def format_welcome() -> str:
    return (
        "👋 *¡Hola! Bienvenido a Telar.co*\n\n"
        "Soy tu asistente de productos artesanales. Puedo ayudarte a encontrar:\n\n"
        "🎨 Artesanías únicas\n"
        "🪵 Productos de madera\n"
        "🏺 Cerámica tradicional\n"
        "🧶 Textiles artesanales\n"
        "💍 Joyería hecha a mano\n\n"
        "✨ *¿Qué estás buscando?*\n\n"
        "Ejemplos:\n"
        "• \"Busco un regalo de madera para mi mamá\"\n"
        "• \"Quiero cerámica decorativa\"\n"
        "• \"Artesanías colombianas baratas\"\n\n"
        "¡Pregúntame lo que necesites! 😊"
    )


def format_no_results() -> str:
    return (
        "🤔 *No encontré productos que coincidan exactamente.*\n\n"
        "💡 *Sugerencias:*\n"
        "• Describe el material: \"madera\", \"cerámica\", \"textiles\"\n"
        "• Menciona el uso: \"decoración\", \"regalo\", \"joyería\"\n"
        "• Di para quién: \"para mi mamá\", \"para el hogar\"\n\n"
        "📋 *Ejemplos que funcionan bien:*\n"
        "• \"Productos de madera para decoración\"\n"
        "• \"Artesanías en cerámica\"\n"
        "• \"Regalos artesanales colombianos\"\n\n"
        "🌟 ¿Qué tipo de producto artesanal estás buscando?"
    )


def format_products(results: list[ProductSearchResult], query: str) -> str:
    """Format a list of ProductSearchResult objects into a WhatsApp message."""
    message = f"🔍 *Encontré {len(results)} producto{'s' if len(results) != 1 else ''}:*\n\n"

    for i, r in enumerate(results, 1):
        emoji = get_emoji(r.craft_name, r.category_name)
        message += f"{emoji} *{i}. {r.product_name}*\n"

        if r.short_description:
            desc = r.short_description.strip()
            if len(desc) > _MAX_DESCRIPTION_CHARS:
                desc = desc[:_MAX_DESCRIPTION_CHARS].rstrip() + "..."
            message += f"📝 {desc}\n"

        if r.price is not None:
            price_display = r.price / 100
            message += f"💰 ${price_display:,.0f} COP\n"

        if r.category_name:
            message += f"🏷️ {r.category_name}\n"

        if r.store_name:
            message += f"🏪 {r.store_name}\n"

        if r.similarity >= 0.75:
            message += "⭐ Muy relevante para tu búsqueda\n"

        message += f"🔗 {_PRODUCT_BASE_URL}{r.product_id}\n"
        message += "\n"

    message += "✨ _¿Necesitas más opciones? Pregúntame lo que quieras_ 😊"
    return message


def get_emoji(craft_name: Optional[str], category_name: Optional[str]) -> str:
    """Return an appropriate emoji based on craft type or product category."""
    craft = (craft_name or "").lower()
    category = (category_name or "").lower()

    if "madera" in craft or "wood" in craft or "ebanistería" in craft:
        return "🪵"
    if "cerámica" in craft or "ceramic" in craft or "barro" in craft:
        return "🏺"
    if "textil" in craft or "textile" in craft or "tejido" in craft or "mochila" in craft:
        return "🧶"
    if "joyería" in craft or "jewelry" in craft or "orfebrería" in craft:
        return "💍"
    if "cuero" in craft or "leather" in craft:
        return "👜"
    if "metal" in craft or "forja" in craft:
        return "⚙️"
    if "vidrio" in craft or "glass" in craft:
        return "🫙"

    if "decoración" in category or "decoration" in category:
        return "🎨"
    if "joyería" in category or "jewelry" in category:
        return "💍"
    if "textil" in category:
        return "🧶"
    if "hogar" in category or "home" in category:
        return "🏠"

    return "✨"

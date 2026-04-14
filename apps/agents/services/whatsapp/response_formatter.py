"""
WhatsApp message formatting for the marketplace bot.

All functions are pure (no I/O) and return WhatsApp-safe strings
(plain text + WhatsApp markdown: *bold*, _italic_).
"""

from __future__ import annotations

import unicodedata
from typing import Optional

from agents.services.semantic_search_service import ProductSearchResult

_PRODUCT_BASE_URL = "https://telar.co/product/"
_MAX_DESCRIPTION_CHARS = 120


# ─────────────────────────────────────────────
# Static messages
# ─────────────────────────────────────────────

def format_welcome() -> str:
    return (
        "👋 *¡Hola! Bienvenido a Telar.co*\n\n"
        "Soy tu asistente de productos artesanales colombianos. Puedo ayudarte a:\n\n"
        "🔍 Buscar productos artesanales\n"
        "💰 Filtrar por precio\n"
        "🗺️ Conocer las regiones de nuestros artesanos\n"
        "🏪 Descubrir tiendas y artesanos\n"
        "🎤 Enviar mensajes de voz\n\n"
        "✨ *¿Qué estás buscando?*\n\n"
        "Ejemplos:\n"
        "• _\"Busco un regalo de madera para mi mamá\"_\n"
        "• _\"Cerámica decorativa hasta 200 mil pesos\"_\n"
        "• _\"¿De qué regiones son los artesanos?\"_\n"
        "• _\"¿Qué tiendas tienen?\"_\n\n"
        "¡Pregúntame lo que necesites! 😊"
    )


def format_no_results(query: str = "") -> str:
    return (
        "🤔 *No encontré productos que coincidan exactamente.*\n\n"
        "💡 *Sugerencias:*\n"
        "• Describe el material: _\"madera\"_, _\"cerámica\"_, _\"textiles\"_\n"
        "• Menciona el uso: _\"decoración\"_, _\"regalo\"_, _\"joyería\"_\n"
        "• Di para quién: _\"para mi mamá\"_, _\"para el hogar\"_\n"
        "• Ajusta el precio: _\"hasta 100 mil pesos\"_\n\n"
        "🌟 ¿Qué tipo de artesanía colombiana estás buscando?"
    )


# ─────────────────────────────────────────────
# Product listing
# ─────────────────────────────────────────────

def format_products(results: list[ProductSearchResult], query: str, empathetic_intro: str = "") -> str:
    """Format product results into a WhatsApp message with optional empathetic intro."""
    parts = []

    if empathetic_intro:
        parts.append(empathetic_intro)

    parts.append(f"🔍 *Encontré {len(results)} producto{'s' if len(results) != 1 else ''}:*")
    parts.append("")

    for i, r in enumerate(results, 1):
        emoji = get_emoji(r.craft_name, r.category_name)
        block = [f"{emoji} *{i}. {r.product_name}*"]

        if r.short_description:
            desc = r.short_description.strip()
            if len(desc) > _MAX_DESCRIPTION_CHARS:
                desc = desc[:_MAX_DESCRIPTION_CHARS].rstrip() + "..."
            block.append(f"📝 {desc}")

        if r.price is not None:
            price_display = r.price / 100
            block.append(f"💰 ${price_display:,.0f} COP")

        if r.category_name:
            block.append(f"🏷️ {r.category_name}")

        # Store + location on one line
        store_line = _format_store_line(r)
        if store_line:
            block.append(store_line)

        block.append(f"🔗 {_PRODUCT_BASE_URL}{r.product_id}")
        parts.append("\n".join(block))

    parts.append("✨ _¿Necesitas más opciones o quieres filtrar por precio? Pregúntame_ 😊")
    return "\n\n".join(parts)


def _format_store_line(r: ProductSearchResult) -> str:
    """Build '🏪 Tienda (Ciudad, Región)' line from available fields."""
    store = r.store_name or ""
    # store_name sometimes already includes location in parens — use as-is
    if store:
        return f"🏪 {store}"
    return ""


# ─────────────────────────────────────────────
# Informational responses
# ─────────────────────────────────────────────

def format_regions(regions: list[str], intro: str = "") -> str:
    """Format a deduplicated, sorted list of artisan regions."""
    cleaned = _deduplicate_regions(regions)

    parts = []
    if intro:
        parts.append(intro)

    parts.append(f"🗺️ *Nuestros artesanos vienen de {len(cleaned)} regiones de Colombia:*\n")
    parts.append("\n".join(f"📍 {r}" for r in cleaned))
    parts.append("\n💬 _¿Quieres ver productos de alguna región específica? Solo dímelo_ 😊")
    return "\n".join(parts)


def format_materials(materials: list[str], intro: str = "") -> str:
    """Format a list of available craft materials/types."""
    cleaned = sorted(set(m.strip().capitalize() for m in materials if m and m.strip()))

    parts = []
    if intro:
        parts.append(intro)

    parts.append(f"🎨 *Trabajamos con {len(cleaned)} tipos de artesanía:*\n")
    parts.append("\n".join(f"{get_emoji(m, '')} {m}" for m in cleaned))
    parts.append("\n💬 _¿En qué material te gustaría buscar?_ 😊")
    return "\n".join(parts)


def format_stores(stores: list[dict], intro: str = "") -> str:
    """
    Format a list of unique stores.
    Each store dict: {name, location, craft_name, product_count}
    """
    parts = []
    if intro:
        parts.append(intro)

    parts.append(f"🏪 *Tenemos {len(stores)} tiendas de artesanos:*\n")

    for i, s in enumerate(stores, 1):
        block = [f"*{i}. {s['name']}*"]
        if s.get("craft_name"):
            block.append(f"   🎨 {s['craft_name'].capitalize()}")
        if s.get("location"):
            block.append(f"   📍 {s['location']}")
        if s.get("product_count"):
            block.append(f"   📦 {s['product_count']} producto{'s' if s['product_count'] != 1 else ''}")
        parts.append("\n".join(block))

    parts.append("💬 _¿Quieres ver productos de alguna tienda? Solo dime su nombre_ 😊")
    return "\n\n".join(parts)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def get_emoji(craft_name: Optional[str], category_name: Optional[str]) -> str:
    """Return an appropriate emoji based on craft type or product category."""
    craft = _normalize(craft_name or "")
    category = _normalize(category_name or "")

    if any(w in craft for w in ["madera", "wood", "ebanisteria", "talla"]):
        return "🪵"
    if any(w in craft for w in ["ceramica", "ceramic", "barro", "alfareria"]):
        return "🏺"
    if any(w in craft for w in ["textil", "textile", "tejido", "mochila", "fibra"]):
        return "🧶"
    if any(w in craft for w in ["joyeria", "jewelry", "orfebreria", "bisuteria"]):
        return "💍"
    if any(w in craft for w in ["cuero", "leather"]):
        return "👜"
    if any(w in craft for w in ["metal", "forja", "hierro"]):
        return "⚙️"
    if any(w in craft for w in ["vidrio", "glass"]):
        return "🫙"
    if any(w in craft for w in ["mimbre", "cesteria", "werregue", "palma"]):
        return "🧺"

    if any(w in category for w in ["decoracion", "decoration", "arte"]):
        return "🎨"
    if any(w in category for w in ["joyeria", "jewelry", "accesorio"]):
        return "💍"
    if any(w in category for w in ["textil", "bolso", "cartera"]):
        return "🧶"
    if any(w in category for w in ["hogar", "home", "cocina"]):
        return "🏠"
    if any(w in category for w in ["juguete", "nino", "infantil"]):
        return "🧸"

    return "✨"


def _normalize(text: str) -> str:
    """Lowercase + remove accents for fuzzy matching."""
    return "".join(
        c for c in unicodedata.normalize("NFD", text.lower())
        if unicodedata.category(c) != "Mn"
    )


def _deduplicate_regions(regions: list[str]) -> list[str]:
    """
    Deduplicate and clean region strings.

    The DB has inconsistent values: "Bogotá", "Bogota, Colombia",
    "BOGOTÁ D.C., BOGOTÁ D.C.", "Bogotá, Colombia", etc.
    Strategy: normalize → group → pick the shortest/cleanest representative.
    """
    # Group by normalized key
    groups: dict[str, list[str]] = {}
    for r in regions:
        if not r or not r.strip():
            continue
        key = _normalize(r.strip())
        # Strip trailing ", colombia" and ", colombia." for grouping
        key = key.replace(", colombia", "").replace(",colombia", "").strip(" ,.")
        groups.setdefault(key, []).append(r.strip())

    # From each group, pick the value that looks cleanest:
    # prefer title-case, prefer shorter, avoid ALL CAPS
    result = []
    for variants in groups.values():
        # filter out ALL CAPS strings unless that's the only option
        normal = [v for v in variants if not v.isupper()]
        pool = normal if normal else variants
        # pick shortest (less redundant info)
        best = min(pool, key=lambda v: len(v))
        result.append(best)

    return sorted(result, key=lambda v: _normalize(v))

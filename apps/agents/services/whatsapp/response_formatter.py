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
_MAX_DESCRIPTION_CHARS = 150

# Short Spanish descriptions for each craft type shown in format_materials
_CRAFT_DESCRIPTIONS: dict[str, str] = {
    "alfarería y cerámica": "Moldeado y cocción de arcilla para crear vasijas, platos y figuras decorativas.",
    "ebanistería y talla en madera": "Trabajo artístico de la madera para crear muebles, esculturas y objetos del hogar.",
    "talla en madera": "Escultura manual en madera para figuras, relieves y objetos decorativos únicos.",
    "joyería y orfebrería": "Creación de joyas y ornamentos en metales preciosos con técnicas ancestrales.",
    "bisutería": "Elaboración de accesorios y joyería con materiales alternativos como resinas, semillas y metales no preciosos.",
    "tejeduría en telar": "Tejido de telas y tapetes en telares manuales con hilos de colores naturales.",
    "tejido en crochet": "Elaboración de prendas, accesorios y textiles con gancho y hilo.",
    "bordado y costura": "Decoración de telas con hilos de colores para crear diseños y patrones únicos.",
    "cestería y mimbre": "Tejido de fibras naturales como palma, bambú y bejuco para crear cestas y objetos utilitarios.",
    "macramé": "Arte del nudo decorativo con cuerdas para crear bolsos, colgantes y decoraciones.",
    "cuero y marroquinería": "Trabajo artesanal del cuero para bolsos, cinturones, carteras y accesorios.",
    "vidrio soplado": "Creación de objetos únicos mediante el soplado y moldeado del vidrio fundido.",
    "metalistería y forja": "Trabajo del metal con técnicas de forja para crear esculturas, herrajes y objetos decorativos.",
    "pintura artesanal": "Expresión artística sobre distintos soportes con técnicas y materiales variados.",
    "muñequería": "Elaboración de muñecos y figuras artesanales que representan personajes y tradiciones.",
    "papel y cartón": "Creación de objetos decorativos y utilitarios con papel maché, origami y técnicas mixtas.",
    "velas y aromaterapia": "Elaboración artesanal de velas, jabones y productos aromáticos naturales.",
    "madera": "Trabajo artístico de la madera para crear objetos decorativos y del hogar.",
    "cerámica": "Moldeado y cocción de arcilla para crear piezas decorativas y utilitarias.",
    "textil": "Creación de telas, prendas y accesorios con técnicas de tejido ancestrales.",
    "joyería": "Diseño y elaboración de joyas y accesorios con materiales preciosos y alternativos.",
    "cuero": "Trabajo manual del cuero para crear accesorios y objetos duraderos.",
    "metal": "Escultura y forja de metales para objetos decorativos y funcionales.",
    "vidrio": "Creación de piezas únicas en vidrio soplado o emplomado.",
    "mimbre": "Tejido de fibras naturales para cestas, muebles y objetos utilitarios.",
    "werregue": "Tejido tradicional chocoano con la fibra de la palma de werregue.",
    "fique": "Elaboración de textiles y accesorios con la fibra natural del fique colombiano.",
    "chaquira": "Bordado y tejido decorativo con pequeñas cuentas de vidrio o plástico.",
}


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
        name = r.product_name or "Producto artesanal"
        block = [f"{emoji} *{i}. {name}*"]

        if r.short_description:
            desc = r.short_description.strip()
            if len(desc) > _MAX_DESCRIPTION_CHARS:
                desc = desc[:_MAX_DESCRIPTION_CHARS].rstrip() + "..."
            block.append(f"📝 _{desc}_")

        if r.price is not None:
            price_display = r.price / 100
            block.append(f"💰 *${price_display:,.0f} COP*")

        if r.craft_name:
            block.append(f"🎨 {r.craft_name.capitalize()}")
        elif r.category_name:
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
    """Format a list of available craft materials/types with descriptions."""
    cleaned = sorted(set(m.strip() for m in materials if m and m.strip()))

    parts = []
    if intro:
        parts.append(intro)

    parts.append(f"🎨 *Trabajamos con {len(cleaned)} tipos de artesanía colombiana:*\n")

    lines = []
    for m in cleaned:
        emoji = get_emoji(m, "")
        label = m.capitalize()
        desc = _get_craft_description(m)
        if desc:
            lines.append(f"{emoji} *{label}*\n   _{desc}_")
        else:
            lines.append(f"{emoji} *{label}*")
    parts.append("\n\n".join(lines))
    parts.append("💬 _¿En qué tipo de artesanía te gustaría buscar?_ 😊")
    return "\n\n".join(parts)


def _get_craft_description(craft_name: str) -> str:
    """Look up a short description for a craft type."""
    key = _normalize(craft_name)
    # exact match first
    for k, v in _CRAFT_DESCRIPTIONS.items():
        if _normalize(k) == key:
            return v
    # partial match
    for k, v in _CRAFT_DESCRIPTIONS.items():
        if _normalize(k) in key or key in _normalize(k):
            return v
    return ""


def format_stores(stores: list[dict], intro: str = "") -> str:
    """
    Format a list of unique stores.
    Each store dict: {name, location, craft_name, product_count}
    """
    parts = []
    if intro:
        parts.append(intro)

    parts.append(f"🏪 *Encontré {len(stores)} tiendas de artesanos colombianos:*\n")

    for i, s in enumerate(stores, 1):
        # Strip location from name if it's in parens to show cleaner name
        raw_name = s["name"] or "Tienda"
        display_name = raw_name.split("(")[0].strip() if "(" in raw_name else raw_name
        block = [f"*{i}. {display_name}*"]
        if s.get("craft_name"):
            block.append(f"   🎨 _{s['craft_name'].capitalize()}_")
        location = s.get("location", "")
        if not location and "(" in raw_name and raw_name.endswith(")"):
            location = raw_name[raw_name.index("(") + 1:-1].strip()
            location = location.replace(", Colombia", "").replace(",Colombia", "").strip(", ")
        if location:
            block.append(f"   📍 {location.title()}")
        count = s.get("product_count", 0)
        if count:
            block.append(f"   📦 {count} producto{'s' if count != 1 else ''} disponible{'s' if count != 1 else ''}")
        parts.append("\n".join(block))

    parts.append("💬 _¿Quieres ver los productos de alguna de estas tiendas? Solo dime su nombre_ 😊")
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

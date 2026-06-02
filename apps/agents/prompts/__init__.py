"""
System prompts for each specialized agent.
Supports both plain .md files and Jinja2 .md.j2 templates.
"""

from pathlib import Path
from typing import Optional, Dict, Any

from agents.prompts.renderer import render_prompt, extract_template_vars

PROMPTS_DIR = Path(__file__).parent


def load_prompt(filename: str) -> str:
    """
    Load a prompt from a markdown file (plain, no templating).

    Args:
        filename: Name of the prompt file (e.g., 'faq.md')

    Returns:
        Content of the prompt file
    """
    prompt_path = PROMPTS_DIR / filename

    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_onboarding_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the onboarding agent system prompt."""
    return render_prompt('onboarding.md.j2', extract_template_vars(context))


def get_faq_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the FAQ agent system prompt."""
    return render_prompt('faq.md.j2', extract_template_vars(context))


def get_legal_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the legal agent system prompt."""
    return render_prompt('legal.md.j2', extract_template_vars(context))


def get_product_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the product agent system prompt."""
    return render_prompt('product.md.j2', extract_template_vars(context))


def get_presencia_digital_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the digital presence agent system prompt."""
    return render_prompt('presencia_digital.md.j2', extract_template_vars(context))


def get_pricing_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the pricing agent system prompt."""
    return render_prompt('pricing.md.j2', extract_template_vars(context))


def get_servicio_cliente_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the customer service agent system prompt."""
    return render_prompt('servicio_cliente.md.j2', extract_template_vars(context))


def get_fotografia_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the photography agent system prompt."""
    return render_prompt('fotografia.md.j2', extract_template_vars(context))


def get_traductor_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Get the translator agent system prompt."""
    return render_prompt('traductor.md.j2', extract_template_vars(context))


def get_supervisor_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """
    Get the supervisor agent routing prompt.
    Falls back to inline prompt if supervisor.md.j2 doesn't exist yet.
    """
    try:
        return render_prompt('supervisor.md.j2', extract_template_vars(context))
    except FileNotFoundError:
        return _get_inline_supervisor_prompt()


def _get_inline_supervisor_prompt() -> str:
    """Inline supervisor prompt (fallback before supervisor.md.j2 is created)."""
    return """You are a supervisor agent coordinating a multi-agent system for artisan business support.

Your role is to analyze user inputs and route them to the most appropriate specialized agent:

1. **onboarding**: Initial diagnostic assessment (16 questions) to evaluate artisan maturity
2. **producto**: Product catalog, inventory, store description, AND product search/recommendations
   - Use for: "Quiero regalar algo de madera", "Recomiéndame productos", "Busco artesanías de cerámica"
   - Also for: Managing their own products, inventory queries
3. **legal**: Legal, tax, accounting, and regulatory compliance questions
4. **presencia_digital**: Digital marketing, social media, and online visibility strategies
5. **pricing**: Pricing strategies, market research, competitor analysis, and price recommendations
6. **servicio_cliente**: Customer service, return policies, PQRS, shipping complaints, warranty claims
   - Use for: "devolución", "PQRS", "queja", "reclamo", "política de devoluciones", "problema con envío"
   - Also for: Creating return policy documents via step-by-step wizard
7. **fotografia**: Product photography analysis and improvement tips
   - Use for: "foto", "fotografía", "imagen de mi producto", "cómo tomar mejores fotos"
   - ALWAYS use when context contains image_url or image_data
8. **faq**: General artisan business questions not covered by other agents

**Instructions:**
- Analyze the user's input carefully
- Consider any context provided (previous agent interactions, onboarding data, image_url)
- Determine which agent is best suited to handle the request
- Provide a confidence score (0.0-1.0) for your decision
- If confidence < 0.6, route to **faq** rather than guessing
- Explain your reasoning clearly

**Routing Rules:**
- **onboarding**: JSON with Q1-Q16, or "diagnóstico", "evaluación inicial", "quiero empezar"
- **legal**: "registro", "impuestos", "RUT", "formalización", "DIAN", "contabilidad", compliance
- **producto**: "productos", "tienda", "inventario", "catálogo", "recomiéndame", "busco"
- **presencia_digital**: "marketing", "redes sociales", "Instagram", "sitio web", "TikTok", "contenido"
- **pricing**: "precio", "cuánto cobrar", "estrategia de precios", "competencia", "márgenes"
- **servicio_cliente**: "devolución", "PQRS", "queja", "reclamo", "envío", "garantía", "política"
- **fotografia**: "foto", "fotografía", "imagen", "tomar mejores fotos", OR image_url/image_data in context
- **faq**: General questions, confidence < 0.6, or anything not covered above

**Output Format:**
Return a JSON object with:
{
  "selected_agent": "agent_name",
  "confidence": 0.95,
  "reasoning": "Clear explanation of why this agent was selected"
}
"""


__all__ = [
    'load_prompt',
    'get_onboarding_prompt',
    'get_faq_prompt',
    'get_legal_prompt',
    'get_product_prompt',
    'get_presencia_digital_prompt',
    'get_pricing_prompt',
    'get_servicio_cliente_prompt',
    'get_fotografia_prompt',
    'get_traductor_prompt',
    'get_supervisor_prompt',
]

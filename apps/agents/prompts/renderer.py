"""
Jinja2 prompt renderer for the multi-agent system.
Loads .md.j2 templates and renders them with artisan context variables.
"""

from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from pathlib import Path
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

_PROMPTS_DIR = Path(__file__).parent

_env = Environment(
    loader=FileSystemLoader(str(_PROMPTS_DIR)),
    trim_blocks=True,
    lstrip_blocks=True,
    keep_trailing_newline=True,
)


def render_prompt(filename: str, variables: Optional[Dict[str, Any]] = None) -> str:
    """
    Load a .md.j2 Jinja2 template and render it with the given variables.
    Falls back to plain .md file if .md.j2 is not found.

    Args:
        filename: Template filename (e.g., 'legal.md.j2' or 'legal.md')
        variables: Dictionary of template variables

    Returns:
        Rendered prompt string
    """
    vars_to_render = variables or {}

    # Try .md.j2 first, then plain .md
    candidates = [filename]
    if not filename.endswith(".j2"):
        candidates.insert(0, filename + ".j2")

    for candidate in candidates:
        try:
            template = _env.get_template(candidate)
            rendered = template.render(**vars_to_render)
            logger.debug(f"Rendered prompt from '{candidate}' with {len(vars_to_render)} vars")
            return rendered
        except TemplateNotFound:
            continue

    raise FileNotFoundError(
        f"Prompt template not found: {filename} (searched in {_PROMPTS_DIR})"
    )


def extract_template_vars(context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract standard artisan template variables from the agent context dict.

    Args:
        context: Agent context dictionary (from AgentState)

    Returns:
        Flat dict of variables suitable for Jinja2 template rendering
    """
    if not context:
        return {}

    profile = context.get("artisan_profile", {})
    key_insights = profile.get("key_insights", {}) if isinstance(profile, dict) else {}
    maturity = profile.get("maturity_snapshot", {}) if isinstance(profile, dict) else {}

    return {
        # Artisan identity
        "artisan_name": key_insights.get("nombre", ""),
        "craft_type": key_insights.get("tipo_artesania", ""),
        "location": key_insights.get("ubicacion", "Colombia"),
        # Maturity
        "maturity_level": maturity.get("general", "Inicial"),
        "maturity_snapshot": maturity,
        # Interaction history
        "interaction_count": profile.get("interaction_count", 0) if isinstance(profile, dict) else 0,
        # Full profile object for advanced templates
        "artisan_profile": profile,
        # Convenience flags
        "has_profile": bool(profile),
        "is_first_interaction": profile.get("interaction_count", 0) == 0 if isinstance(profile, dict) else True,
    }

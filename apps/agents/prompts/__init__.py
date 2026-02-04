"""
System prompts for each specialized agent.
"""

from pathlib import Path


PROMPTS_DIR = Path(__file__).parent


def load_prompt(filename: str) -> str:
    """
    Load a prompt from a markdown file.
    
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


def get_onboarding_prompt() -> str:
    """Get the onboarding agent system prompt."""
    return load_prompt('onboarding.md')


def get_faq_prompt() -> str:
    """Get the FAQ agent system prompt."""
    return load_prompt('faq.md')


def get_legal_prompt() -> str:
    """Get the legal agent system prompt."""
    return load_prompt('legal.md')


def get_product_prompt() -> str:
    """Get the product agent system prompt."""
    return load_prompt('product.md')


def get_presencia_digital_prompt() -> str:
    """Get the digital presence agent system prompt."""
    return load_prompt('presencia_digital.md')


def get_pricing_prompt() -> str:
    """Get the pricing agent system prompt."""
    return load_prompt('pricing.md')


def get_supervisor_prompt() -> str:
    """
    Get the supervisor agent system prompt.
    
    Returns:
        Supervisor routing prompt
    """
    return """You are a supervisor agent coordinating a multi-agent system for artisan business support.

Your role is to analyze user inputs and route them to the most appropriate specialized agent:

1. **onboarding**: Initial diagnostic assessment (16 questions) to evaluate artisan maturity
2. **producto**: Product catalog, inventory, store description, AND product search/recommendations
   - Use for: "Quiero regalar algo de madera", "Recomiéndame productos", "Busco artesanías de cerámica"
   - Also for: Managing their own products, inventory queries
3. **legal**: Legal, tax, accounting, and regulatory compliance questions
4. **presencia_digital**: Digital marketing, social media, and online visibility strategies
5. **pricing**: Pricing strategies, market research, competitor analysis, and price recommendations
6. **faq**: General artisan business questions not covered by other agents

**Instructions:**
- Analyze the user's input carefully
- Consider any context provided (previous agent interactions, onboarding data)
- Determine which agent is best suited to handle the request
- Provide a confidence score (0.0-1.0) for your decision
- Explain your reasoning clearly

**Routing Rules:**
- **onboarding**: If the user:
  * Explicitly mentions "diagnóstico", "onboarding", "evaluación inicial", "assessment"
  * Provides a JSON with questions Q1-Q16
  * Asks to start the diagnostic process
  * Wants to evaluate their business maturity
- **legal**: If keywords suggest legal/tax/compliance matters (registro, impuestos, RUT, formalización, etc.)
- **producto**: If focused on products/catalog/inventory (productos, tienda, inventario, catálogo)
- **presencia_digital**: If about marketing/social media/online presence (marketing, redes sociales, Instagram, sitio web)
- **pricing**: If about pricing strategies, costs, market prices, or competitor pricing (precio, cuánto cobran, estrategia de precios)
- **faq**: For general business questions not covered by other agents

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
    'get_supervisor_prompt',
]

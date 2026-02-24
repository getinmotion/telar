"""
Helper utilities for the multi-agent system.
"""

from datetime import datetime
from typing import Dict, Any, List
import json
import re


def format_timestamp(dt: datetime = None) -> str:
    """
    Format a datetime object to ISO 8601 string.
    
    Args:
        dt: Datetime object (defaults to now if None)
        
    Returns:
        ISO 8601 formatted timestamp string
    """
    if dt is None:
        dt = datetime.utcnow()
    return dt.isoformat() + 'Z'


def calculate_maturity_level(scores: Dict[str, str]) -> str:
    """
    Calculate overall maturity level from category scores.
    
    Args:
        scores: Dictionary with maturity scores per category
                e.g., {'identidad': 'Avanzado', 'comercial': 'Intermedio', ...}
        
    Returns:
        Overall maturity level: 'Inicial', 'Intermedio', or 'Avanzado'
    """
    # Map levels to numeric values
    level_values = {
        'Inicial': 1,
        'Intermedio': 2,
        'Avanzado': 3
    }
    
    # Calculate average
    values = [level_values.get(score, 1) for score in scores.values()]
    avg = sum(values) / len(values) if values else 1
    
    # Round to nearest level
    if avg < 1.5:
        return 'Inicial'
    elif avg < 2.5:
        return 'Intermedio'
    else:
        return 'Avanzado'


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Text to chunk
        chunk_size: Maximum size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at a sentence or paragraph boundary
        if end < len(text):
            # Look for paragraph break
            last_para = text.rfind('\n\n', start, end)
            if last_para > start + (chunk_size // 2):
                end = last_para + 2
            else:
                # Look for sentence break
                last_period = text.rfind('. ', start, end)
                if last_period > start + (chunk_size // 2):
                    end = last_period + 2
        
        chunks.append(text[start:end].strip())
        start = end - chunk_overlap if end < len(text) else end
    
    return chunks


def extract_context_summary(context: Dict[str, Any]) -> str:
    """
    Extract a text summary from context dictionary for use in prompts.
    
    Args:
        context: Context dictionary with onboarding data, previous interactions, etc.
        
    Returns:
        Human-readable context summary
    """
    summary_parts = []
    
    # Extract artisan profile (from hierarchical memory system)
    if 'artisan_profile' in context:
        profile = context['artisan_profile']
        if isinstance(profile, dict):
            # Add profile summary
            if 'summary' in profile:
                summary_parts.append(f"Perfil del artesano: {profile['summary']}")
            
            # Add maturity snapshot if available
            if 'maturity_snapshot' in profile and isinstance(profile['maturity_snapshot'], dict):
                maturity = profile['maturity_snapshot']
                if 'general' in maturity:
                    summary_parts.append(f"Nivel de madurez general: {maturity['general']}")
                
                # Add specific maturity areas
                for key, value in maturity.items():
                    if key != 'general' and value:
                        area_name = key.replace('madurez_', '').replace('_', ' ').title()
                        summary_parts.append(f"{area_name}: {value}")
            
            # Add key insights
            if 'key_insights' in profile and isinstance(profile['key_insights'], dict):
                insights = profile['key_insights']
                if 'tipo_artesania' in insights:
                    summary_parts.append(f"Tipo de artesanía: {insights['tipo_artesania']}")
                if 'ubicacion' in insights:
                    summary_parts.append(f"Ubicación: {insights['ubicacion']}")
                if 'experiencia' in insights:
                    summary_parts.append(f"Experiencia: {insights['experiencia']}")
    
    # FALLBACK: Extract onboarding summary if present (old format)
    if not summary_parts and 'onboarding_summary' in context:
        onboarding = context['onboarding_summary']
        if 'madurez_general' in onboarding:
            summary_parts.append(f"Nivel de madurez: {onboarding['madurez_general']}")
        
        # Add specific maturity areas if available
        for key in ['madurez_identidad_artesanal', 'madurez_realidad_comercial', 
                    'madurez_clientes_y_mercado', 'madurez_operacion_y_crecimiento']:
            if key in onboarding:
                area_name = key.replace('madurez_', '').replace('_', ' ').title()
                summary_parts.append(f"{area_name}: {onboarding[key]}")
    
    # Extract user profile if present in metadata
    if not summary_parts and 'user_profile' in context:
        profile = context['user_profile']
        if 'tipo_artesania' in profile:
            summary_parts.append(f"Tipo de artesanía: {profile['tipo_artesania']}")
        if 'ubicacion' in profile:
            summary_parts.append(f"Ubicación: {profile['ubicacion']}")
    
    # Extract previous agent info
    if 'previous_agent' in context:
        summary_parts.append(f"Agente anterior: {context['previous_agent']}")
    
    # Extract conversation history if available (for better context)
    if 'conversation_history' in context and isinstance(context['conversation_history'], list):
        history = context['conversation_history'][-3:]  # Last 3 messages
        if history:
            summary_parts.append(f"\nÚltimas {len(history)} interacciones de la conversación:")
            for msg in history:
                role = msg.get('role', 'unknown')
                content = msg.get('content', '')[:100]  # Truncate
                summary_parts.append(f"  - {role}: {content}...")
    
    return '\n'.join(summary_parts) if summary_parts else 'No hay contexto previo disponible.'


def validate_onboarding_responses(responses: Dict[str, Any]) -> bool:
    """
    Validate that onboarding responses contain all required questions.
    
    Args:
        responses: Dictionary of question responses
        
    Returns:
        True if valid, False otherwise
    """
    # Check for required questions Q1-Q16
    required_questions = [f"Q{i}" for i in range(1, 17)]
    
    for q in required_questions:
        if q not in responses:
            return False
    
    return True


def parse_json_response(text: str) -> Dict[str, Any]:
    """
    Parse JSON from LLM response, handling markdown code blocks.
    
    Args:
        text: Text potentially containing JSON
        
    Returns:
        Parsed JSON object
    """
    import json
    import re
    
    # Try to extract JSON from code blocks
    json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    match = re.search(json_pattern, text, re.DOTALL)
    
    if match:
        json_str = match.group(1)
    else:
        # Try to find raw JSON
        json_pattern = r'\{.*\}'
        match = re.search(json_pattern, text, re.DOTALL)
        if match:
            json_str = match.group(0)
        else:
            json_str = text
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {e}")


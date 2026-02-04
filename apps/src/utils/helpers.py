"""
General utility helper functions.
"""

from typing import Dict, Any, Optional, List
import re


def extract_context_summary(context: Dict[str, Any]) -> str:
    """
    Extract a summary from context dictionary.
    
    Args:
        context: Dictionary containing context information
        
    Returns:
        String summary of the context
    """
    if not context:
        return "No context available"
    
    summary_parts = []
    
    # Extract key information
    if "user_profile" in context:
        profile = context["user_profile"]
        if isinstance(profile, dict):
            name = profile.get("name", "Unknown")
            summary_parts.append(f"User: {name}")
    
    if "onboarding" in context:
        summary_parts.append("Onboarding context available")
    
    if "previous_agent" in context:
        summary_parts.append(f"Previous agent: {context['previous_agent']}")
    
    return " | ".join(summary_parts) if summary_parts else str(context)


def sanitize_text(text: str) -> str:
    """
    Sanitize text by removing special characters and extra whitespace.
    
    Args:
        text: Input text to sanitize
        
    Returns:
        Sanitized text
    """
    # Remove extra whitespace
    text = " ".join(text.split())
    
    # Remove control characters
    text = "".join(char for char in text if char.isprintable() or char in "\n\t")
    
    return text.strip()


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """
    Truncate text to maximum length.
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to add when truncating
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

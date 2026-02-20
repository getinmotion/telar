"""
LangSmith integration for tracing and monitoring.
"""

import os
import sys
from pathlib import Path

# Add backend to path if not already there
backend_path = str(Path(__file__).parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from src.api.config import settings
import logging

logger = logging.getLogger(__name__)


def init_langsmith() -> None:
    """
    Initialize LangSmith tracing.
    Sets environment variables for automatic tracing.
    """
    if not settings.langsmith_api_key or not settings.langsmith_tracing:
        logger.info("LangSmith tracing is disabled")
        return
    
    try:
        # Set environment variables for LangSmith
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
        os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        
        logger.info(f"LangSmith tracing initialized for project: {settings.langsmith_project}")
        
    except Exception as e:
        logger.error(f"Failed to initialize LangSmith: {str(e)}")
        # Don't raise - tracing is optional


def get_run_metadata(
    session_id: str,
    agent_type: str,
    user_id: str = None,
    maturity_level: str = None
) -> dict:
    """
    Build metadata dictionary for LangSmith run tagging.
    
    Args:
        session_id: Session identifier
        agent_type: Type of agent handling the request
        user_id: Optional user ID
        maturity_level: Optional user maturity level from onboarding
        
    Returns:
        Metadata dictionary
    """
    metadata = {
        "session_id": session_id,
        "agent_type": agent_type,
    }
    
    if user_id:
        metadata["user_id"] = user_id
    
    if maturity_level:
        metadata["maturity_level"] = maturity_level
    
    return metadata


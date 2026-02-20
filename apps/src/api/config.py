"""
Configuration settings for GetInMotion services.
Loads environment variables and provides typed configuration.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    embedding_dimensions: int = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))
    
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_db_url: str = os.getenv("SUPABASE_DB_URL", "")
    
    # API Security
    api_secret_key: str = os.getenv("API_SECRET_KEY", "")
    
    # Server Configuration
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    log_level: str = os.getenv("LOG_LEVEL", "info")
    
    # LangSmith Configuration
    langsmith_api_key: Optional[str] = os.getenv("LANGSMITH_API_KEY")
    langsmith_project: str = os.getenv("LANGSMITH_PROJECT", "artisan-agents")
    langsmith_tracing: bool = os.getenv("LANGSMITH_TRACING", "true").lower() == "true"
    
    # Tavily Web Search
    tavily_api_key: Optional[str] = os.getenv("TAVILY_API_KEY")
    
    # Agent Configuration
    max_retries: int = int(os.getenv("MAX_RETRIES", "3"))
    request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "60"))
    rag_top_k: int = int(os.getenv("RAG_TOP_K", "5"))
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "1000"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    max_batch_size: int = int(os.getenv("MAX_BATCH_SIZE", "100"))
    
    # Memory Configuration
    memory_retrieval_limit: int = int(os.getenv("MEMORY_RETRIEVAL_LIMIT", "10"))
    memory_importance_threshold: float = float(os.getenv("MEMORY_IMPORTANCE_THRESHOLD", "0.5"))
    profile_update_interval: int = int(os.getenv("PROFILE_UPDATE_INTERVAL", "5"))
    conversation_summary_interval: int = int(os.getenv("CONVERSATION_SUMMARY_INTERVAL", "10"))

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables not defined in the model


# Global settings instance
settings = Settings()

"""
Agent state and data models for the multi-agent system.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, TypedDict, List
from datetime import datetime
from uuid import UUID


# ============================================================
# AGENT STATE (for LangGraph)
# ============================================================

class AgentState(TypedDict):
    """State object for LangGraph workflow."""
    
    # Input
    session_id: str
    user_input: str
    context: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    user_id: Optional[str]
    
    # Supervisor decision
    selected_agent: Optional[str]
    routing_confidence: Optional[float]
    routing_reasoning: Optional[str]
    
    # Agent execution
    agent_input: Optional[Dict[str, Any]]
    agent_output: Optional[Dict[str, Any]]
    
    # Conversation history
    messages: Optional[list]
    
    # Execution metadata
    start_time: Optional[float]
    execution_time_ms: Optional[int]
    error: Optional[str]


# ============================================================
# MEMORY MODELS
# ============================================================

class MemoryEntry(BaseModel):
    """Model for hierarchical memory entries."""
    
    memory_type: str  # conversational, profile, strategy, knowledge
    agent_type: str  # onboarding, legal, producto, pricing, etc.
    artisan_id: Optional[UUID] = None
    session_id: Optional[str] = None
    content: str = Field(..., serialization_alias='chunk_text')  # Maps to DB column 'chunk_text'
    chunk_index: int = 0  # Required by DB; 0 for non-document memories
    document_id: Optional[UUID] = None  # Only set for document-based memories
    summary: Optional[str] = None
    importance_score: float = 0.5  # 0.0 to 1.0
    embedding: list[float]
    knowledge_category: str  # legal, producto, pricing, etc.
    metadata: Dict[str, Any] = {}
    
    model_config = {
        'populate_by_name': True  # Allow both 'content' and 'chunk_text' when reading
    }


class ArtisanProfile(BaseModel):
    """Model for global artisan profile maintained by supervisor."""
    
    artisan_id: UUID
    profile_summary: str
    key_insights: Dict[str, Any]
    interaction_count: int
    maturity_snapshot: Dict[str, Any]
    embedding: list[float]
    last_interaction_at: Optional[datetime] = None


class MemorySearchResult(BaseModel):
    """Model for memory search results."""
    
    id: UUID
    memory_type: str
    agent_type: Optional[str]
    artisan_id: Optional[UUID]
    session_id: Optional[str]
    chunk_text: str  # Database column name
    summary: Optional[str]
    importance_score: float
    similarity: float
    knowledge_category: str
    metadata: Dict[str, Any]
    created_at: datetime
    
    # Convenience property to access chunk_text as 'content' for consistency
    @property
    def content(self) -> str:
        """Alias for chunk_text to maintain consistent API."""
        return self.chunk_text


# ============================================================
# KNOWLEDGE BASE MODELS
# ============================================================

class KnowledgeDocument(BaseModel):
    """Model for knowledge base documents."""
    
    filename: str
    file_type: str
    file_size: int
    content: str
    knowledge_category: str
    tags: Optional[list[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    processing_status: str = "pending"
    chunk_count: int = 0


class KnowledgeSearchResult(BaseModel):
    """Model for RAG search results."""
    
    chunk_text: str
    similarity: float
    document_filename: str
    knowledge_category: str
    document_metadata: Optional[Dict[str, Any]] = None


# ============================================================
# ONBOARDING MODELS
# ============================================================

class OnboardingProfile(BaseModel):
    """Model for onboarding profile data."""
    
    session_id: str
    user_id: Optional[UUID] = None
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    tipo_artesania: Optional[str] = None
    
    madurez_identidad_artesanal: str
    madurez_identidad_artesanal_razon: str
    madurez_identidad_artesanal_tareas: list[str]
    
    madurez_realidad_comercial: str
    madurez_realidad_comercial_razon: str
    madurez_realidad_comercial_tareas: list[str]
    
    madurez_clientes_y_mercado: str
    madurez_clientes_y_mercado_razon: str
    madurez_clientes_y_mercado_tareas: list[str]
    
    madurez_operacion_y_crecimiento: str
    madurez_operacion_y_crecimiento_razon: str
    madurez_operacion_y_crecimiento_tareas: list[str]
    
    madurez_general: str
    resumen: str
    raw_responses: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None


class ConversationRecord(BaseModel):
    """Model for storing conversation records in database."""
    
    session_id: str
    user_id: Optional[UUID] = None
    agent_type: str
    user_input: str
    agent_output: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    selected_agent: Optional[str] = None
    routing_confidence: Optional[float] = None
    routing_reasoning: Optional[str] = None
    execution_time_ms: Optional[int] = None

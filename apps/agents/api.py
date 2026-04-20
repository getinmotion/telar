"""
FastAPI router for agents system.
Exposes all agent endpoints with proper request/response models.
"""

from fastapi import APIRouter, HTTPException, status, Body, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime
import sys
from pathlib import Path
import time

# Add backend to path
backend_path = str(Path(__file__).parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from agents.core.orchestrator import get_supervisor
from agents.core.memory import memory_service
from agents.core.embedding_cache import embedding_cache
from agents.core.state import ConversationRecord, KnowledgeDocument
from agents.tools.vector_search import rag_service
from agents.tools.storage import upload_image_to_storage
from agents.helpers import format_timestamp
from src.database.supabase_client import db

# Create router
router = APIRouter(prefix="/agents", tags=["Agents System"])


# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class AgentRequest(BaseModel):
    """Request model for agent processing."""
    
    session_id: str = Field(..., description="Unique session identifier", example="session-12345")
    user_input: str = Field(..., description="User's input message or query", min_length=1)
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Contextual information (previous agent data, onboarding, etc.)"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata (language, user profile, etc.)"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user ID for authenticated requests"
    )


class AgentResponse(BaseModel):
    """Response model for agent processing."""
    
    supervisor: Dict[str, Any] = Field(..., description="Supervisor routing decision")
    request: Dict[str, Any] = Field(..., description="Request dispatched to agent")
    response: Dict[str, Any] = Field(..., description="Agent's response")
    session_id: str = Field(..., description="Session identifier")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    execution_time_ms: Optional[int] = Field(None, description="Execution time in milliseconds")


class MemoryQuery(BaseModel):
    """Request model for memory queries."""
    
    query: str = Field(..., description="Search query text", example="pricing strategies")
    memory_type: Optional[str] = Field(None, description="Filter by type: conversational, profile, strategy")
    agent_type: Optional[str] = Field(None, description="Filter by agent: legal, producto, pricing, etc.")
    session_id: Optional[str] = Field(None, description="Filter by session ID")
    limit: int = Field(default=10, description="Maximum results to return", ge=1, le=50)


class MemoryResult(BaseModel):
    """Response model for memory queries."""
    
    count: int
    query: str
    memories: List[Dict[str, Any]]


class HealthCheck(BaseModel):
    """Health check response for agents service."""
    
    status: str
    version: str
    agents: Dict[str, bool]
    services: Dict[str, bool]
    timestamp: str


# ============================================================
# AGENT ENDPOINTS
# ============================================================

@router.post("/process", response_model=AgentResponse, status_code=status.HTTP_200_OK)
async def process_agent_request(request: AgentRequest):
    """
    Main agent processing endpoint. Routes user requests to specialized agents.
    
    This endpoint:
    1. Analyzes the user's input using the supervisor
    2. Routes to the appropriate specialized agent (legal, pricing, product, etc.)
    3. Returns the agent's response with routing metadata
    4. Stores the conversation in hierarchical memory
    
    **Available Agents:**
    - `onboarding`: Maturity assessment (16 questions)
    - `legal`: Legal, tax, and accounting guidance
    - `producto`: Product catalog and inventory management
    - `pricing`: Pricing strategies and market research
    - `presencia_digital`: Digital marketing and social media
    - `faq`: General business questions
    
    **Example Request:**
    ```json
    {
        "session_id": "user-123",
        "user_input": "¿Qué impuestos debo pagar?",
        "user_id": "artisan-456",
        "context": {
            "ubicacion": "Bogotá",
            "tipo_artesania": "Cerámica"
        }
    }
    ```
    """
    start_time = time.time()
    
    try:
        # Get supervisor instance
        supervisor = get_supervisor()
        
        # Process through supervisor
        result = await supervisor.process(
            session_id=request.session_id,
            user_input=request.user_input,
            context=request.context,
            metadata=request.metadata,
            user_id=request.user_id
        )
        
        # Build response
        response = AgentResponse(
            supervisor=result['supervisor_agent'],
            request=result['dispatched_request'],
            response=result['agent_response'],
            session_id=result['session_id'],
            timestamp=format_timestamp(),
            execution_time_ms=result.get('execution_time_ms')
        )
        
        # Save conversation to database (async, don't block response)
        try:
            user_id_uuid = UUID(request.user_id) if request.user_id else None
            conversation = ConversationRecord(
                session_id=request.session_id,
                user_id=user_id_uuid,
                agent_type="supervisor",
                user_input=request.user_input,
                agent_output=result['agent_response'],
                context=request.context,
                metadata=request.metadata,
                selected_agent=result['supervisor_agent']['selected_agent'],
                routing_confidence=result['supervisor_agent']['confidence'],
                routing_reasoning=result['supervisor_agent']['reasoning'],
                execution_time_ms=result.get('execution_time_ms')
            )
            await db.save_conversation(conversation.model_dump(mode='json'))
        except Exception:
            # Don't fail the request if DB save fails
            pass
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process request: {str(e)}"
        )


@router.get("/history/{session_id}", status_code=status.HTTP_200_OK)
async def get_conversation_history(session_id: str, limit: int = 10):
    """
    Retrieve conversation history for a session.
    
    Returns the conversation history including:
    - User inputs
    - Agent responses
    - Routing decisions
    - Timestamps
    
    **Parameters:**
    - `session_id`: The session identifier
    - `limit`: Maximum number of records (default: 10, max: 50)
    """
    try:
        if limit > 50:
            limit = 50
            
        history = await db.get_conversation_history(
            session_id=session_id,
            limit=limit
        )
        
        return {
            "session_id": session_id,
            "count": len(history),
            "conversations": history
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )


# ============================================================
# MEMORY ENDPOINTS
# ============================================================

@router.post("/memory/search", response_model=MemoryResult, status_code=status.HTTP_200_OK)
async def search_memories(query: MemoryQuery):
    """
    Semantic search across stored memories.
    
    Search through conversational, profile, strategy, and knowledge memories
    using semantic similarity.
    
    **Memory Types:**
    - `conversational`: User-agent conversation history
    - `profile`: Artisan profile data and maturity levels
    - `strategy`: Recommendations and strategic guidance
    - `knowledge`: Processed documents and knowledge base
    
    **Example Request:**
    ```json
    {
        "query": "pricing strategies for ceramics",
        "memory_type": "strategy",
        "agent_type": "pricing",
        "limit": 5
    }
    ```
    """
    try:
        memories = await memory_service.read_memory(
            query=query.query,
            memory_type=query.memory_type,
            agent_type=query.agent_type,
            session_id=query.session_id,
            limit=query.limit
        )
        
        # Convert to dict for response
        memory_list = [
            {
                "id": str(mem.id),
                "content": mem.chunk_text,
                "memory_type": mem.memory_type,
                "agent_type": mem.agent_type,
                "importance": mem.importance_score,
                "similarity": mem.similarity,
                "created_at": mem.created_at.isoformat()
            }
            for mem in memories
        ]
        
        return MemoryResult(
            count=len(memory_list),
            query=query.query,
            memories=memory_list
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search memories: {str(e)}"
        )


@router.get("/memory/profile/{user_id}", status_code=status.HTTP_200_OK)
async def get_artisan_profile(user_id: str):
    """
    Retrieve artisan's global profile.
    
    Returns the consolidated profile maintained by the supervisor including:
    - Profile summary
    - Key insights
    - Interaction count
    - Maturity snapshot
    - Last interaction timestamp
    """
    try:
        user_uuid = UUID(user_id)
        profile = await memory_service.get_artisan_profile(user_uuid)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile not found for user {user_id}"
            )
        
        return {
            "artisan_id": str(profile.artisan_id),
            "profile_summary": profile.profile_summary,
            "key_insights": profile.key_insights,
            "interaction_count": profile.interaction_count,
            "maturity_snapshot": profile.maturity_snapshot,
            "last_interaction_at": profile.last_interaction_at.isoformat() if profile.last_interaction_at else None
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format (must be UUID)"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )


@router.get("/memory/session/{session_id}", status_code=status.HTTP_200_OK)
async def get_session_memories(session_id: str, user_id: Optional[str] = None, limit: int = 10):
    """
    Retrieve recent memories for a specific session.
    
    Returns conversation memories for the session, useful for:
    - Context reconstruction
    - Conversation history
    - Session analytics
    """
    try:
        user_uuid = UUID(user_id) if user_id else None
        
        memories = await memory_service.get_conversation_context(
            session_id=session_id,
            artisan_id=user_uuid,
            limit=limit
        )
        
        # Convert to dict for response
        memory_list = [
            {
                "content": mem.get('chunk_text', mem.get('content', '')),
                "agent_type": mem.get('agent_type', 'unknown'),
                "importance": mem.get('importance_score', 0.5),
                "created_at": mem.get('created_at', '')
            }
            for mem in memories
        ]
        
        return {
            "session_id": session_id,
            "count": len(memory_list),
            "memories": memory_list
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve session memories: {str(e)}"
        )


# ============================================================
# HEALTH & INFO ENDPOINTS
# ============================================================

@router.get("/health", response_model=HealthCheck, status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint for the agents system.

    Returns:
    - Service status
    - Available agents
    - Service availability (memory, RAG, tools)
    """
    return HealthCheck(
        status="healthy",
        version="1.1.0",
        agents={
            "onboarding": True,
            "legal": True,
            "producto": True,
            "pricing": True,
            "presencia_digital": True,
            "faq": True,
            "servicio_cliente": True,
            "fotografia": True,
        },
        services={
            "supervisor": True,
            "memory": True,
            "rag": True,
            "web_search": True,
            "database": True,
            "embedding_cache": True,
        },
        timestamp=format_timestamp()
    )


# ============================================================
# KNOWLEDGE BASE ENDPOINTS
# ============================================================

class KnowledgeUploadResponse(BaseModel):
    status: str
    filename: str
    knowledge_category: str
    chunk_count: int
    document_id: str


@router.post(
    "/knowledge/upload",
    response_model=KnowledgeUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_knowledge_document(
    file: UploadFile = File(..., description="Document file (.txt, .md, .pdf text)"),
    knowledge_category: str = Form(
        ...,
        description="Category: legal, faq, pricing, presencia_digital, producto, servicio_cliente, fotografia, general",
    ),
    uploaded_by: str = Form(default="admin", description="User or system uploading the document"),
):
    """
    Upload a document to the RAG knowledge base.

    The document will be:
    1. Chunked into smaller pieces
    2. Embedded with OpenAI text-embedding-3-small
    3. Stored in Supabase pgvector for semantic retrieval

    **Supported categories:** legal, faq, pricing, presencia_digital, producto,
    servicio_cliente, fotografia, general

    **Supported formats:** Plain text (.txt), Markdown (.md). For PDFs, extract
    text first and upload as .txt.
    """
    try:
        content_bytes = await file.read()
        try:
            text_content = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text_content = content_bytes.decode("latin-1")

        if not text_content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty or could not be decoded as text.",
            )

        document = KnowledgeDocument(
            filename=file.filename or "upload.txt",
            file_type=file.content_type or "text/plain",
            content=text_content,
            knowledge_category=knowledge_category,
            uploaded_by=uploaded_by,
        )

        document_id = await rag_service.process_document(document)

        # Get chunk count from the processed document (estimate from text length)
        from agents.helpers import chunk_text
        from src.api.config import settings as app_settings
        chunks = chunk_text(text_content, app_settings.chunk_size, app_settings.chunk_overlap)

        return KnowledgeUploadResponse(
            status="processed",
            filename=document.filename,
            knowledge_category=knowledge_category,
            chunk_count=len(chunks),
            document_id=str(document_id),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}",
        )


@router.get("/knowledge/cache/stats", status_code=status.HTTP_200_OK)
async def get_cache_stats():
    """
    Get embedding cache statistics.
    Useful for monitoring cache hit rate and memory usage.
    """
    return {
        "embedding_cache": embedding_cache.stats,
        "timestamp": format_timestamp(),
    }


# ============================================================
# FOTOGRAFÍA ENDPOINT (multimodal)
# ============================================================

@router.post("/fotografia/analyze", status_code=status.HTTP_200_OK)
async def analyze_product_photo(
    session_id: str = Form(..., description="Session identifier"),
    user_id: Optional[str] = Form(default=None, description="Artisan user ID (UUID)"),
    user_input: str = Form(
        default="Analiza esta foto de mi producto y dime cómo mejorarla.",
        description="Optional instruction for the analysis",
    ),
    image: Optional[UploadFile] = File(default=None, description="Product photo file"),
    image_url: Optional[str] = Form(default=None, description="Public URL of the product photo"),
    wizard_data_json: Optional[str] = Form(default=None, description="JSON string of wizard state (for wizard continuation)"),
):
    """
    Analyze a product photo using GPT-4o vision and return improvement tips.

    Accepts either:
    - An uploaded image file (multipart/form-data)
    - A public image URL

    The image is uploaded to Supabase Storage (if file provided), then passed to the
    Photography agent for GPT-4o vision analysis.

    **Returns:** Composition analysis, lighting feedback, and 3-5 actionable tips.
    """
    # Resolve the final image URL
    final_image_url: Optional[str] = image_url

    if image and image.filename:
        try:
            final_image_url = await upload_image_to_storage(image)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    if not final_image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either 'image' (file upload) or 'image_url' (public URL).",
        )

    # Parse optional wizard_data
    context: Dict[str, Any] = {"image_url": final_image_url}
    if wizard_data_json:
        import json as _json
        try:
            context["wizard_data"] = _json.loads(wizard_data_json)
        except Exception:
            pass  # Ignore malformed wizard data

    request = AgentRequest(
        session_id=session_id,
        user_input=user_input,
        context=context,
        user_id=user_id,
    )

    return await process_agent_request(request)


@router.get("/info", status_code=status.HTTP_200_OK)
async def get_agents_info():
    """
    Get information about available agents and their capabilities.
    
    Returns detailed information about:
    - Each agent's purpose
    - Agent capabilities
    - Tools available to each agent
    """
    return {
        "version": "1.0.0",
        "agents": {
            "onboarding": {
                "name": "Onboarding Agent",
                "description": "Evaluates artisan business maturity across 4 categories (16 questions)",
                "categories": [
                    "Identidad Artesanal",
                    "Realidad Comercial",
                    "Clientes y Mercado",
                    "Operación y Crecimiento"
                ],
                "tools": []
            },
            "legal": {
                "name": "Legal Agent",
                "description": "Legal, tax, and accounting guidance for artisan businesses",
                "domains": ["taxation", "business_registration", "compliance", "accounting"],
                "tools": ["rag", "memory"]
            },
            "producto": {
                "name": "Product Agent",
                "description": "Product catalog, inventory management, and store descriptions",
                "domains": ["catalog", "inventory", "descriptions", "product_search"],
                "tools": ["rag", "database", "product_recommendations", "memory"]
            },
            "pricing": {
                "name": "Pricing Agent",
                "description": "Pricing strategies, market research, and competitor analysis",
                "domains": ["pricing_strategy", "market_research", "competitor_analysis", "cost_calculation"],
                "tools": ["web_search", "rag", "memory"]
            },
            "presencia_digital": {
                "name": "Digital Presence Agent",
                "description": "Digital marketing, social media, and online visibility strategies",
                "domains": ["social_media", "content_strategy", "digital_marketing", "e-commerce"],
                "tools": ["rag", "memory"]
            },
            "faq": {
                "name": "FAQ Agent",
                "description": "General artisan business questions and guidance",
                "domains": ["general_business", "operations", "best_practices"],
                "tools": ["rag", "memory"]
            }
        },
        "tools": {
            "rag": "Retrieval Augmented Generation for knowledge base search",
            "memory": "Hierarchical memory system (conversational, profile, strategy)",
            "web_search": "Real-time web search via Tavily API",
            "database": "Shop data queries (products, sales, inventory)",
            "product_recommendations": "AI-powered product recommendations"
        },
        "features": {
            "supervisor_routing": "Intelligent routing to specialized agents",
            "memory_system": "Persistent conversation and profile memory",
            "context_awareness": "Agents have access to user context and history",
            "langsmith_tracing": "Optional LangSmith integration for monitoring"
        }
    }

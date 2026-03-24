"""
Standalone FastAPI application for the Agents Service.
Can be run independently or integrated into a larger application.
"""

import sys
import os
from pathlib import Path
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend to path
backend_path = str(Path(__file__).parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import after path setup
from agents.api import router as agents_router
from agents.search_api import router as search_router
from agents.tracing import init_langsmith
from src.api.config import settings
from src.database.pg_client import get_pool, close_pool

# Configure logging
logging.basicConfig(
    level=settings.log_level.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("Starting GetInMotion Agents Service")
    logger.info(f"📊 Version: 1.0.0")
    logger.info(f"🤖 OpenAI Model: {settings.openai_model}")
    logger.info(f"📦 Embedding Model: {settings.embedding_model}")
    logger.info(f"🗄️  Supabase URL: {settings.supabase_url}")
    logger.info(f"🔧 Available Agents: 6 (Onboarding, Legal, Product, Pricing, Digital Presence, FAQ)")
    
    # Initialize LangSmith tracing
    init_langsmith()
    if settings.langsmith_api_key and settings.langsmith_tracing:
        logger.info(f"📈 LangSmith Tracing: Enabled (Project: {settings.langsmith_project})")
    else:
        logger.info("📈 LangSmith Tracing: Disabled")
    
    # Check Tavily API for pricing agent
    if settings.tavily_api_key:
        logger.info("🌐 Tavily Web Search: Enabled (Pricing Agent)")
    else:
        logger.warning("⚠️  Tavily Web Search: Disabled (Pricing Agent will have limited capabilities)")
    
    # Warm up catalog DB connection pool
    if settings.catalog_db_url:
        try:
            await get_pool()
            logger.info("Catalog DB pool ready")
        except Exception as exc:
            logger.warning(f"Catalog DB pool could not be created at startup: {exc}")
    else:
        logger.warning("CATALOG_DB_URL not set - semantic search will be unavailable")

    logger.info("Agents Service Ready")

    yield

    # Shutdown
    await close_pool()
    logger.info("Shutting down GetInMotion Agents Service")


# Create FastAPI app
app = FastAPI(
    title="GetInMotion Agents API",
    description="""
    Multi-agent system for Colombian artisan business support.
    
    ## Features
    - **6 Specialized Agents**: Legal, Product, Pricing, Digital Presence, FAQ, Onboarding
    - **Intelligent Routing**: Supervisor agent automatically routes to the right specialist
    - **Hierarchical Memory**: Persistent conversation and profile memory
    - **RAG Knowledge Base**: Retrieval-augmented generation for accurate answers
    - **Web Search**: Real-time market data for pricing strategies
    - **Context Awareness**: Agents maintain conversation context and user profiles
    
    ## Available Agents
    1. **Onboarding Agent**: Maturity assessment (16 questions across 4 categories)
    2. **Legal Agent**: Legal, tax, and accounting guidance
    3. **Product Agent**: Catalog management and product recommendations
    4. **Pricing Agent**: Pricing strategies and market research
    5. **Digital Presence Agent**: Social media and marketing strategies
    6. **FAQ Agent**: General business questions
    
    ## Quick Start
    1. POST `/api/agents/process` - Process a user request (supervisor routes automatically)
    2. GET `/api/agents/history/{session_id}` - Retrieve conversation history
    3. POST `/api/agents/memory/search` - Search across memories
    4. GET `/api/agents/info` - Get detailed agent information
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Agents System",
            "description": "Multi-agent system endpoints for processing user requests",
        },
        {
            "name": "Semantic Search",
            "description": "Embedding generation, semantic search and batch indexing for the marketplace catalog",
        },
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router, prefix="/api")
app.include_router(search_router, prefix="/api")


@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    """Root endpoint with service information."""
    return {
        "service": "GetInMotion Agents API",
        "version": "1.0.0",
        "status": "operational",
        "description": "Multi-agent system for artisan business support",
        "agents": {
            "count": 6,
            "types": [
                "onboarding",
                "legal",
                "producto",
                "pricing",
                "presencia_digital",
                "faq"
            ]
        },
        "endpoints": {
            "process": "/api/agents/process",
            "history": "/api/agents/history/{session_id}",
            "memory_search": "/api/agents/memory/search",
            "profile": "/api/agents/memory/profile/{user_id}",
            "info": "/api/agents/info",
            "health": "/api/agents/health",
            "search_products": "/api/search/products",
            "generate_embedding": "/api/search/embeddings/generate",
            "save_embedding": "/api/search/embeddings/save",
            "index_products": "/api/search/index/products",
            "index_status": "/api/search/index/products/status",
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "features": [
            "Intelligent supervisor routing",
            "Hierarchical memory system",
            "RAG knowledge base",
            "Web search integration",
            "Context-aware conversations",
            "LangSmith tracing (optional)"
        ]
    }


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Global health check endpoint."""
    return {
        "status": "healthy",
        "service": "agents",
        "version": "1.0.0",
        "checks": {
            "openai": bool(settings.openai_api_key),
            "supabase": bool(settings.supabase_url and settings.supabase_service_role_key),
            "langsmith": bool(settings.langsmith_api_key),
            "tavily": bool(settings.tavily_api_key)
        },
        "agents": {
            "onboarding": True,
            "legal": True,
            "producto": True,
            "pricing": True,
            "presencia_digital": True,
            "faq": True
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unexpected errors."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "An unexpected error occurred",
            "error": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level
    )

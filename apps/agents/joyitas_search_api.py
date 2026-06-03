"""
Semantic Search & Embedding API router for the joyitas database.
Stage-only, temporary — will be deleted after testing.

Prefix: /api/joyitas-search

Mirrors search_api.py exactly, backed by the joyitas DB instead of the main catalog DB.
"""

from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, Field

from agents.services.joyitas_semantic_search_service import joyitas_semantic_search_service
from src.api.config import settings

router = APIRouter(prefix="/joyitas-search", tags=["Joyitas Semantic Search (test)"])


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class GenerateEmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1)


class GenerateEmbeddingResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    model: str
    text_preview: str


class SaveProductEmbeddingRequest(BaseModel):
    product_id: str
    text: str = Field(..., min_length=1)


class SaveProductEmbeddingResponse(BaseModel):
    product_id: str
    dimensions: int
    model: str
    text_preview: str


class ProductSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=10, ge=1, le=50)
    min_similarity: float = Field(default=0.45, ge=0.0, le=1.0)


class ProductSearchResult(BaseModel):
    product_id: str
    product_name: str
    short_description: Optional[str]
    history: Optional[str]
    similarity: float
    craft_name: Optional[str]
    piece_type: Optional[str]
    style: Optional[str]
    process_type: Optional[str]
    materials: str
    store_name: Optional[str]
    store_id: Optional[str]
    category_name: Optional[str]
    price: Optional[int] = Field(None, description="Minimum variant price in minor units")
    currency: Optional[str]
    stock: int = Field(0)
    images: list[dict] = Field(default_factory=list)


class ProductSearchResponse(BaseModel):
    query: str
    count: int
    min_similarity_used: float
    results: list[ProductSearchResult]


class IndexProductsRequest(BaseModel):
    product_ids: Optional[list[str]] = Field(default=None)
    force_reindex: bool = Field(default=False)


class IndexProductsResponse(BaseModel):
    message: str
    products_requested: Optional[int]
    force_reindex: bool


# ============================================================
# EMBEDDING ENDPOINTS
# ============================================================

@router.post(
    "/embeddings/generate",
    response_model=GenerateEmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="[Joyitas] Generate an embedding vector from plain text",
)
async def generate_embedding(request: GenerateEmbeddingRequest) -> GenerateEmbeddingResponse:
    try:
        vector = await joyitas_semantic_search_service.generate_embedding(request.text)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Embedding generation failed: {exc}",
        )
    return GenerateEmbeddingResponse(
        embedding=vector,
        dimensions=len(vector),
        model=settings.embedding_model,
        text_preview=request.text[:120],
    )


@router.post(
    "/embeddings/save",
    response_model=SaveProductEmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="[Joyitas] Generate embedding and persist it for a product",
)
async def save_product_embedding(request: SaveProductEmbeddingRequest) -> SaveProductEmbeddingResponse:
    try:
        vector = await joyitas_semantic_search_service.generate_embedding(request.text)
        await joyitas_semantic_search_service.upsert_product_embedding(
            product_id=request.product_id,
            text=request.text,
            model=settings.embedding_model,
            vector=vector,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save embedding: {exc}",
        )
    return SaveProductEmbeddingResponse(
        product_id=request.product_id,
        dimensions=len(vector),
        model=settings.embedding_model,
        text_preview=request.text[:120],
    )


# ============================================================
# SEARCH ENDPOINTS
# ============================================================

@router.post(
    "/products",
    response_model=ProductSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="[Joyitas] Semantic search over jewelry products",
)
async def search_products(request: ProductSearchRequest) -> ProductSearchResponse:
    try:
        results = await joyitas_semantic_search_service.search_products(
            query=request.query,
            top_k=request.top_k,
            min_similarity=request.min_similarity,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {exc}",
        )
    return ProductSearchResponse(
        query=request.query,
        count=len(results),
        min_similarity_used=request.min_similarity,
        results=[
            ProductSearchResult(
                product_id=r.product_id,
                product_name=r.product_name,
                short_description=r.short_description,
                history=r.history,
                similarity=r.similarity,
                craft_name=r.craft_name,
                piece_type=r.piece_type,
                style=r.style,
                process_type=r.process_type,
                materials=r.materials,
                store_name=r.store_name,
                store_id=r.store_id,
                category_name=r.category_name,
                price=r.price,
                currency=r.currency,
                stock=r.stock,
                images=r.images,
            )
            for r in results
        ],
    )


# ============================================================
# BATCH INDEXING ENDPOINTS
# ============================================================

@router.post(
    "/index/products",
    response_model=IndexProductsResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="[Joyitas] Trigger batch embedding indexing",
)
async def index_products(
    request: IndexProductsRequest,
    background_tasks: BackgroundTasks,
) -> IndexProductsResponse:
    if joyitas_semantic_search_service.get_indexing_status()["running"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A joyitas indexing job is already running. Poll /joyitas-search/index/products/status.",
        )
    background_tasks.add_task(
        joyitas_semantic_search_service.index_products,
        product_ids=request.product_ids,
        force_reindex=request.force_reindex,
    )
    return IndexProductsResponse(
        message="Joyitas indexing job started in the background",
        products_requested=len(request.product_ids) if request.product_ids else None,
        force_reindex=request.force_reindex,
    )


@router.get(
    "/index/products/status",
    status_code=status.HTTP_200_OK,
    summary="[Joyitas] Get status of the last indexing job",
)
async def get_indexing_status() -> dict[str, Any]:
    return joyitas_semantic_search_service.get_indexing_status()


# ============================================================
# HEALTH
# ============================================================

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="[Joyitas] Health check",
)
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "database": "joyitas",
        "catalog_db_configured": True,
        "embedding_model": settings.embedding_model,
        "embedding_dimensions": settings.embedding_dimensions,
    }

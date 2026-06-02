"""
Semantic Search & Embedding API router.

Prefix: /api/search

Endpoints
---------
POST /embeddings/generate         Generate a vector from plain text (called by NestJS on product save)
POST /embeddings/save             Generate + persist a product embedding in one call
POST /products                    Semantic search over published products
POST /stores                      Semantic search over stores (reserved - returns 501 until implemented)
POST /index/products              Trigger batch indexing job for all (or selected) products
GET  /index/products/status       Status of the last batch indexing job
"""

import asyncio
from typing import Any, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, Field

from agents.services.semantic_search_service import semantic_search_service
from src.api.config import settings

router = APIRouter(prefix="/search", tags=["Semantic Search"])


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class GenerateEmbeddingRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Plain text to encode. For products, pass the full_semantic_text built by the SQL query.",
        example="Tambor alegre | Transforma cualquier rincon de tu hogar... | Oficio: Ebanisteria y Talla | ...",
    )


class GenerateEmbeddingResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    model: str
    text_preview: str = Field(description="First 120 characters of the input text")


class SaveProductEmbeddingRequest(BaseModel):
    product_id: str = Field(..., description="UUID of the product in shop.products_core")
    text: str = Field(
        ...,
        min_length=1,
        description="full_semantic_text to embed and persist",
    )


class SaveProductEmbeddingResponse(BaseModel):
    product_id: str
    dimensions: int
    model: str
    text_preview: str


class ProductSearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        description="Natural-language search query",
        example="plato decorativo de ceramica azul hecho a mano",
    )
    top_k: int = Field(default=10, ge=1, le=50, description="Maximum results to return")
    min_similarity: float = Field(
        default=0.45,
        ge=0.0,
        le=1.0,
        description="Minimum cosine similarity (0-1). Lower = more results but less relevant.",
    )


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
    price: Optional[int] = Field(None, description="Minimum variant price in minor units (e.g. centavos for COP)")
    currency: Optional[str] = Field(None, description="Currency code, e.g. COP")
    stock: int = Field(0, description="Total stock across all active variants")
    images: list[dict] = Field(default_factory=list, description="List of product images ordered by is_primary DESC, display_order ASC")


class ProductSearchResponse(BaseModel):
    query: str
    count: int
    min_similarity_used: float
    results: list[ProductSearchResult]


class IndexProductsRequest(BaseModel):
    product_ids: Optional[list[str]] = Field(
        default=None,
        description="List of product UUIDs to index. If omitted, all products are indexed.",
    )
    force_reindex: bool = Field(
        default=False,
        description="If true, re-generate embeddings even for already-indexed products.",
    )


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
    summary="Generate an embedding vector from plain text",
    description=(
        "Encodes the provided text using text-embedding-3-small (1536 dims). "
        "Called by NestJS when a product is created or updated. "
        "The caller is responsible for persisting the returned vector."
    ),
)
async def generate_embedding(request: GenerateEmbeddingRequest) -> GenerateEmbeddingResponse:
    try:
        vector = await semantic_search_service.generate_embedding(request.text)
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
    summary="Generate embedding and persist it for a product",
    description=(
        "Convenience endpoint for NestJS: generates the embedding from the provided text "
        "and writes it directly to shop.product_embeddings. "
        "Use this so NestJS does not need to handle the UPSERT itself."
    ),
)
async def save_product_embedding(request: SaveProductEmbeddingRequest) -> SaveProductEmbeddingResponse:
    try:
        vector = await semantic_search_service.generate_embedding(request.text)
        await semantic_search_service.upsert_product_embedding(
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
    summary="Semantic search over published products",
    description=(
        "Encodes the query and returns the most similar published products "
        "ordered by descending cosine similarity. "
        "Use the returned metadata fields (craft_name, style, materials, etc.) "
        "for optional deterministic filters in the frontend."
    ),
)
async def search_products(request: ProductSearchRequest) -> ProductSearchResponse:
    try:
        results = await semantic_search_service.search_products(
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


@router.post(
    "/stores",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Semantic search over stores/artisans (coming soon)",
    description=(
        "Reserved endpoint for store/artisan semantic search. "
        "Will be implemented once shop.store_embeddings is populated."
    ),
)
async def search_stores() -> dict[str, Any]:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Store semantic search is not yet implemented. Check back soon.",
    )


# ============================================================
# BATCH INDEXING ENDPOINTS
# ============================================================

@router.post(
    "/index/products",
    response_model=IndexProductsResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger batch embedding indexing for products",
    description=(
        "Reads product semantic text from the DB, generates embeddings in batches of 20, "
        "and upserts them into shop.product_embeddings. "
        "Runs in the background - poll /index/products/status for progress. "
        "By default skips already-indexed products (same version). "
        "Pass force_reindex=true to regenerate all."
    ),
)
async def index_products(
    request: IndexProductsRequest,
    background_tasks: BackgroundTasks,
) -> IndexProductsResponse:
    if semantic_search_service.get_indexing_status()["running"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An indexing job is already running. Poll /index/products/status for progress.",
        )

    background_tasks.add_task(
        semantic_search_service.index_products,
        product_ids=request.product_ids,
        force_reindex=request.force_reindex,
    )

    return IndexProductsResponse(
        message="Indexing job started in the background",
        products_requested=len(request.product_ids) if request.product_ids else None,
        force_reindex=request.force_reindex,
    )


@router.get(
    "/index/products/status",
    status_code=status.HTTP_200_OK,
    summary="Get status of the last product indexing job",
)
async def get_indexing_status() -> dict[str, Any]:
    return semantic_search_service.get_indexing_status()


# ============================================================
# HEALTH
# ============================================================

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check for the search service",
)
async def health() -> dict[str, Any]:
    from src.api.config import settings as cfg

    return {
        "status": "ok",
        "catalog_db_configured": bool(cfg.catalog_db_url),
        "embedding_model": cfg.embedding_model,
        "embedding_dimensions": cfg.embedding_dimensions,
    }

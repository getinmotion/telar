"""
Product recommendation service.
Provides product recommendations based on user context and preferences.
"""

from typing import List, Dict, Any, Optional
from src.database.supabase_client import db


class ProductRecommendationService:
    """Service for generating product recommendations."""
    
    async def get_recommendations(
        self,
        user_id: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 5,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get product recommendations.
        
        Args:
            user_id: Optional user ID for personalized recommendations
            category: Optional category to filter by
            limit: Maximum number of recommendations
            context: Additional context for recommendations
            
        Returns:
            List of recommended products
        """
        query = db.table("products").select("*")
        
        # Apply filters
        if category:
            query = query.eq("category", category)
        
        # Apply limit
        query = query.limit(limit)
        
        # Execute query
        response = query.execute()
        
        return response.data if response.data else []
    
    async def get_related_products(
        self,
        product_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get products related to a given product.
        
        Args:
            product_id: ID of the reference product
            limit: Maximum number of related products
            
        Returns:
            List of related products
        """
        # Get the reference product
        product_response = db.table("products").select("*").eq("id", product_id).execute()
        
        if not product_response.data:
            return []
        
        product = product_response.data[0]
        category = product.get("category")
        
        # Get products in same category (excluding the reference product)
        query = db.table("products").select("*")
        
        if category:
            query = query.eq("category", category)
        
        query = query.neq("id", product_id).limit(limit)
        
        response = query.execute()
        return response.data if response.data else []


# Global product recommendation service instance
product_recommendation_service = ProductRecommendationService()

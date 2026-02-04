"""
Shop database service.
Handles database operations related to artisan shops.
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from src.database.supabase_client import db


class ShopDbService:
    """Service for shop database operations."""
    
    async def get_shop(self, shop_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a shop by ID.
        
        Args:
            shop_id: Shop ID
            
        Returns:
            Shop data or None if not found
        """
        response = db.table("artisan_shops").select("*").eq("id", shop_id).execute()
        
        return response.data[0] if response.data else None
    
    async def get_shop_by_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a shop by user ID.
        
        Args:
            user_id: User ID
            
        Returns:
            Shop data or None if not found
        """
        response = db.table("artisan_shops").select("*").eq("user_id", user_id).execute()
        
        return response.data[0] if response.data else None
    
    async def create_shop(self, shop_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new shop.
        
        Args:
            shop_data: Shop data to create
            
        Returns:
            Created shop data
        """
        response = db.table("artisan_shops").insert(shop_data).execute()
        
        return response.data[0] if response.data else {}
    
    async def update_shop(self, shop_id: str, shop_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a shop.
        
        Args:
            shop_id: Shop ID
            shop_data: Shop data to update
            
        Returns:
            Updated shop data
        """
        response = db.table("artisan_shops").update(shop_data).eq("id", shop_id).execute()
        
        return response.data[0] if response.data else {}
    
    async def list_shops(
        self,
        limit: int = 20,
        offset: int = 0,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        List shops with optional filters.
        
        Args:
            limit: Maximum number of shops to return
            offset: Number of shops to skip
            filters: Optional filters to apply
            
        Returns:
            List of shops
        """
        query = db.table("artisan_shops").select("*")
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        query = query.limit(limit).offset(offset)
        
        response = query.execute()
        return response.data if response.data else []


# Global shop database service instance
shop_db_service = ShopDbService()

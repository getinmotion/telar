"""
Supabase client for database operations.
Provides a singleton Supabase client instance.
"""

from supabase import create_client, Client
from src.api.config import settings


class SupabaseClient:
    """Singleton Supabase client wrapper."""
    
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance."""
        if cls._instance is None:
            if not settings.supabase_url or not settings.supabase_service_role_key:
                raise ValueError(
                    "Supabase configuration missing. "
                    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
                )
            
            cls._instance = create_client(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_service_role_key
            )
        
        return cls._instance


# Global database client instance
db = SupabaseClient.get_client()

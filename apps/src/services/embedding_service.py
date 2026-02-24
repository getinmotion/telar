"""
Embedding service for generating vector embeddings using OpenAI.
"""

from typing import List
import openai
from src.api.config import settings


class EmbeddingService:
    """Service for generating text embeddings."""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.openai_api_key)
        self.model = settings.embedding_model
        self.dimensions = settings.embedding_dimensions
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
            dimensions=self.dimensions
        )
        
        return response.data[0].embedding
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            raise ValueError("No valid texts to embed")
        
        response = self.client.embeddings.create(
            model=self.model,
            input=valid_texts,
            dimensions=self.dimensions
        )
        
        return [data.embedding for data in response.data]


# Global embedding service instance
embedding_service = EmbeddingService()

"""
Hierarchical Memory Service for multi-agent system.
Manages conversational, profile, strategy, and knowledge memories.
"""

from openai import AsyncOpenAI
from src.api.config import settings
from src.database.supabase_client import db
from src.services.embedding_service import embedding_service
from agents.core.state import MemoryEntry, ArtisanProfile, MemorySearchResult
from typing import List, Dict, Any, Optional
from uuid import UUID
import logging
import json

logger = logging.getLogger(__name__)


class MemoryService:
    """
    Centralized service for hierarchical memory management.
    Handles all memory types: conversational, profile, strategy, knowledge.
    """
    
    def __init__(self):
        """Initialize memory service."""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        
    async def write_memory(
        self,
        memory_type: str,
        agent_type: str,
        content: str,
        knowledge_category: str,
        artisan_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
        summary: Optional[str] = None,
        importance_score: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> UUID:
        """
        Store a memory entry in the vector database.
        
        Args:
            memory_type: Type of memory (conversational, profile, strategy, knowledge)
            agent_type: Agent that created the memory
            content: Full memory content
            knowledge_category: Category for knowledge classification
            artisan_id: User ID (if applicable)
            session_id: Session identifier (if applicable)
            summary: Optional condensed summary
            importance_score: Optional importance (0.0-1.0), calculated if not provided
            metadata: Additional metadata
            
        Returns:
            UUID of the stored memory entry
        """
        try:
            # Calculate importance if not provided
            if importance_score is None:
                importance_score = await self.calculate_importance(
                    content=content,
                    memory_type=memory_type,
                    agent_type=agent_type
                )
            
            # Generate embedding for the content
            embedding = await embedding_service.generate_embedding(content)
            
            # Create memory entry
            memory_entry = MemoryEntry(
                memory_type=memory_type,
                agent_type=agent_type,
                artisan_id=artisan_id,
                session_id=session_id,
                content=content,
                summary=summary,
                importance_score=importance_score,
                embedding=embedding,
                knowledge_category=knowledge_category,
                metadata=metadata or {}
            )
            
            # Save to database - convert Pydantic model to dict for JSON serialization
            # Use by_alias=True to map 'content' -> 'chunk_text' for database
            result = await db.save_memory_entry(memory_entry.model_dump(mode='json', by_alias=True))
            memory_id = UUID(result['id'])
            
            logger.info(f"Stored {memory_type} memory: {memory_id} "
                       f"(agent={agent_type}, importance={importance_score:.2f})")
            
            return memory_id
            
        except Exception as e:
            logger.error(f"Failed to write memory: {str(e)}")
            raise
    
    async def read_memory(
        self,
        query: str,
        memory_type: Optional[str] = None,
        agent_type: Optional[str] = None,
        artisan_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
        limit: int = 10,
        min_importance: float = 0.0
    ) -> List[MemorySearchResult]:
        """
        Retrieve relevant memories via semantic search.
        
        Args:
            query: Search query text
            memory_type: Filter by memory type
            agent_type: Filter by agent type
            artisan_id: Filter by artisan/user
            session_id: Filter by session
            limit: Maximum number of results
            min_importance: Minimum importance threshold
            
        Returns:
            List of memory search results
        """
        try:
            # Generate query embedding
            query_embedding = await embedding_service.generate_embedding(query)
            
            # Search memories
            results = await db.search_memories(
                query_embedding=query_embedding,
                match_count=limit,
                filter_memory_type=memory_type,
                filter_agent_type=agent_type,
                filter_artisan_id=artisan_id,
                filter_session_id=session_id,
                min_importance=min_importance
            )
            
            logger.info(f"Retrieved {len(results)} memories for query: '{query[:50]}...'")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to read memory: {str(e)}")
            raise
    
    async def get_conversation_context(
        self,
        session_id: str,
        artisan_id: Optional[UUID] = None,
        limit: int = 10
    ) -> List[MemorySearchResult]:
        """
        Get recent conversation memories for a session.
        
        Args:
            session_id: Session identifier
            artisan_id: Optional artisan filter
            limit: Maximum number of memories
            
        Returns:
            List of conversation memories
        """
        try:
            results = await db.get_session_memories(
                session_id=session_id,
                artisan_id=artisan_id,
                limit=limit
            )
            
            logger.info(f"Retrieved {len(results)} conversation memories for session {session_id}")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get conversation context: {str(e)}")
            raise
    
    async def update_artisan_profile(
        self,
        artisan_id: UUID,
        profile_summary: str,
        key_insights: Dict[str, Any],
        maturity_snapshot: Dict[str, Any],
        increment_interaction: bool = True
    ) -> Dict[str, Any]:
        """
        Update or create global artisan profile.
        
        Args:
            artisan_id: User/artisan identifier
            profile_summary: Condensed profile text
            key_insights: Structured insights (JSONB)
            maturity_snapshot: Maturity levels snapshot
            increment_interaction: Whether to increment interaction count
            
        Returns:
            Updated profile data
        """
        try:
            # Generate embedding for profile summary
            embedding = await embedding_service.generate_embedding(profile_summary)
            
            # Upsert profile
            result = await db.save_artisan_profile(
                artisan_id=artisan_id,
                profile_summary=profile_summary,
                key_insights=key_insights,
                maturity_snapshot=maturity_snapshot,
                embedding=embedding,
                increment_interaction=increment_interaction
            )
            
            logger.info(f"Updated artisan profile: {artisan_id} "
                       f"(interactions={result.get('interaction_count', 0)})")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to update artisan profile: {str(e)}")
            raise
    
    async def get_artisan_profile(
        self,
        artisan_id: UUID
    ) -> Optional[ArtisanProfile]:
        """
        Retrieve artisan global profile.
        
        Args:
            artisan_id: User/artisan identifier
            
        Returns:
            Artisan profile or None if not found
        """
        try:
            result = await db.get_artisan_profile(artisan_id)
            
            if result:
                logger.info(f"Retrieved artisan profile: {artisan_id}")
                
                # Parse embedding (Supabase returns VECTOR as string, not list)
                embedding_raw = result['embedding']
                if isinstance(embedding_raw, str):
                    # Remove brackets and parse to list of floats
                    embedding = json.loads(embedding_raw)
                else:
                    embedding = embedding_raw
                
                return ArtisanProfile(
                    artisan_id=UUID(result['artisan_id']),
                    profile_summary=result['profile_summary'],
                    key_insights=result['key_insights'],
                    interaction_count=result['interaction_count'],
                    maturity_snapshot=result['maturity_snapshot'],
                    embedding=embedding,
                    last_interaction_at=result.get('last_interaction_at')
                )
            
            logger.info(f"No profile found for artisan: {artisan_id}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to get artisan profile: {str(e)}")
            raise
    
    async def calculate_importance(
        self,
        content: str,
        memory_type: str,
        agent_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Calculate importance score for a memory entry.
        
        Args:
            content: Memory content
            memory_type: Type of memory
            agent_type: Agent that created it
            metadata: Additional context
            
        Returns:
            Importance score between 0.0 and 1.0
        """
        # Base importance by memory type
        base_scores = {
            'profile': 0.9,      # Profile data is always important
            'strategy': 0.8,     # Strategies and recommendations are valuable
            'conversational': 0.5,  # Conversations vary in importance
            'knowledge': 0.7     # Knowledge documents are generally important
        }
        
        base_score = base_scores.get(memory_type, 0.5)
        
        # Adjust based on content length (longer = more detailed = more important)
        length_factor = min(len(content) / 500, 1.0) * 0.1
        
        # Adjust based on agent type (some agents produce more critical memories)
        agent_multipliers = {
            'onboarding': 1.1,   # Onboarding data is critical
            'pricing': 1.0,      # Pricing strategies matter
            'legal': 1.0,        # Legal advice is important
            'producto': 0.9,     # Product info varies
            'presencia_digital': 0.8,
            'faq': 0.5           # FAQ responses are less critical
        }
        
        agent_multiplier = agent_multipliers.get(agent_type, 1.0)
        
        # Calculate final score
        importance = min((base_score + length_factor) * agent_multiplier, 1.0)
        
        logger.debug(f"Calculated importance: {importance:.2f} "
                    f"(type={memory_type}, agent={agent_type})")
        
        return importance
    
    async def generate_summary(
        self,
        content: str,
        max_length: int = 200
    ) -> str:
        """
        Generate a condensed summary of content using LLM.
        
        Args:
            content: Full content to summarize
            max_length: Maximum summary length in characters
            
        Returns:
            Condensed summary
        """
        try:
            prompt = f"""Genera un resumen conciso del siguiente contenido en máximo {max_length} caracteres.
Captura solo los puntos clave más importantes.

Contenido:
{content}

Resumen:"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres un experto en resumir conversaciones de manera concisa."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100
            )
            
            summary = response.choices[0].message.content.strip()
            
            # Ensure it doesn't exceed max_length
            if len(summary) > max_length:
                summary = summary[:max_length-3] + "..."
            
            logger.info(f"Generated summary ({len(summary)} chars) from content ({len(content)} chars)")
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate summary: {str(e)}")
            # Return truncated content as fallback
            return content[:max_length-3] + "..." if len(content) > max_length else content


# Global memory service instance
memory_service = MemoryService()


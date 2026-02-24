"""
Base agent class for all specialized agents.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI
from src.api.config import settings
from agents.core.memory import memory_service
from agents.core.state import MemorySearchResult
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the system.
    Includes hierarchical memory integration.
    """
    
    def __init__(self, agent_type: str):
        """
        Initialize base agent.
        
        Args:
            agent_type: Type identifier for this agent
        """
        self.agent_type = agent_type
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.memory_service = memory_service
        logger.info(f"Initialized {agent_type} agent with memory integration")
    
    @abstractmethod
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user request.
        
        Args:
            user_input: The user's input/query
            context: Optional context dictionary with user info, history, etc.
            metadata: Optional metadata
            
        Returns:
            Dictionary with agent's response
        """
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for this agent.
        
        Returns:
            System prompt string
        """
        pass
    
    async def _call_llm(
        self,
        user_message: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0,
        max_tokens: int = 2000
    ) -> str:
        """
        Call the LLM with a message.
        
        Args:
            user_message: User's message
            system_prompt: System prompt (uses default if None)
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            
        Returns:
            LLM response text
        """
        try:
            if system_prompt is None:
                system_prompt = self.get_system_prompt()
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"{self.agent_type} LLM call failed: {str(e)}")
            raise
    
    def _extract_context_info(self, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract useful information from context dictionary.
        
        Args:
            context: Context dictionary
            
        Returns:
            Dictionary with extracted information
        """
        if not context:
            return {}
        
        info = {}
        
        # Extract onboarding data
        if 'onboarding_summary' in context:
            info['onboarding'] = context['onboarding_summary']
        
        # Extract user profile
        if 'user_profile' in context:
            info['profile'] = context['user_profile']
        
        # Extract previous agent
        if 'previous_agent' in context:
            info['previous_agent'] = context['previous_agent']
        
        return info
    
    async def _get_relevant_memories(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        memory_type: Optional[str] = None,
        limit: int = 5
    ) -> List[MemorySearchResult]:
        """
        Retrieve relevant memories for this agent.
        
        Args:
            query: Search query
            context: Optional context with artisan_id
            memory_type: Optional memory type filter
            limit: Maximum number of memories
            
        Returns:
            List of relevant memories
        """
        try:
            artisan_id = None
            if context and 'user_id' in context:
                try:
                    artisan_id = UUID(context['user_id'])
                except Exception:
                    pass
            
            memories = await self.memory_service.read_memory(
                query=query,
                memory_type=memory_type,
                agent_type=self.agent_type,
                artisan_id=artisan_id,
                limit=limit,
                min_importance=settings.memory_importance_threshold
            )
            
            logger.info(f"Retrieved {len(memories)} relevant memories for {self.agent_type}")
            return memories
            
        except Exception as e:
            logger.error(f"Failed to retrieve memories: {str(e)}")
            return []
    
    async def _store_agent_memory(
        self,
        content: str,
        memory_type: str,
        context: Optional[Dict[str, Any]] = None,
        importance_score: Optional[float] = None,
        summary: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[UUID]:
        """
        Store agent-specific memory.
        
        Args:
            content: Memory content
            memory_type: Type of memory (profile, strategy, conversational)
            context: Optional context with user_id, session_id
            importance_score: Optional importance score
            summary: Optional summary
            metadata: Optional metadata
            
        Returns:
            Memory UUID or None on failure
        """
        try:
            artisan_id = None
            session_id = None
            
            if context:
                # Extract user_id (can be nested in context.context.user_id or direct)
                user_id_str = context.get('user_id') or context.get('context', {}).get('user_id')
                if user_id_str:
                    try:
                        artisan_id = UUID(user_id_str)
                    except Exception:
                        pass
                session_id = context.get('session_id')
            
            memory_id = await self.memory_service.write_memory(
                memory_type=memory_type,
                agent_type=self.agent_type,
                content=content,
                knowledge_category=self.agent_type,
                artisan_id=artisan_id,
                session_id=session_id,
                summary=summary,
                importance_score=importance_score,
                metadata=metadata or {}
            )
            
            logger.info(f"Stored {memory_type} memory for {self.agent_type}: {memory_id}")
            return memory_id
            
        except Exception as e:
            logger.error(f"Failed to store agent memory: {str(e)}")
            return None


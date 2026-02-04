"""
Legal agent with RAG capabilities for legal, tax, and accounting questions.
"""

from agents.agents.base import BaseAgent
from agents.tools.vector_search import rag_service
from agents.prompts import get_legal_prompt as get_legal_agent_prompt
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class LegalAgent(BaseAgent):
    """
    Agent specialized in legal, tax, and accounting matters for artisan businesses.
    Uses RAG to retrieve relevant information from legal documents.
    """
    
    def __init__(self):
        """Initialize legal agent."""
        super().__init__("legal")
    
    def get_system_prompt(self) -> str:
        """Get the legal agent system prompt."""
        return get_legal_agent_prompt()
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a legal question using RAG.
        
        Args:
            user_input: User's legal question
            context: Optional context with onboarding data, user info, and conversation history
            metadata: Optional metadata
            
        Returns:
            Legal advice with sources
        """
        try:
            logger.info(f"Processing legal query: {user_input[:100]}...")
            
            # Extract conversation history if available
            conversation_history = []
            if context and 'conversation_history' in context:
                conversation_history = context['conversation_history']
                logger.info(f"Using conversation history with {len(conversation_history)} messages")
            
            # Generate RAG response with conversation history
            rag_response = await rag_service.generate_rag_response(
                query=user_input,
                category='legal',
                system_prompt=self.get_system_prompt(),
                context=context,
                conversation_history=conversation_history
            )
            
            # Build response
            response = {
                "agent_type": self.agent_type,
                "answer": rag_response['answer'],
                "sources": rag_response.get('sources', []),
                "confidence": rag_response.get('confidence', 'medium'),
                "retrieved_chunks": rag_response.get('retrieved_chunks', 0)
            }
            
            # Add disclaimer
            response['disclaimer'] = (
                "Esta información es orientativa. Para situaciones específicas, "
                "consulta con un profesional legal o contador calificado."
            )
            
            logger.info(f"Legal response generated with {len(response['sources'])} sources")
            return response
            
        except Exception as e:
            logger.error(f"Legal agent processing failed: {str(e)}")
            raise


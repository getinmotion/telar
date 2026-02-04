"""
FAQ agent with RAG capabilities for general artisan business questions.
"""

from agents.agents.base import BaseAgent
from agents.tools.vector_search import rag_service
from agents.prompts import get_faq_prompt as get_faq_agent_prompt
from agents.helpers import extract_context_summary
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class FAQAgent(BaseAgent):
    """
    Agent for general artisan business questions.
    Uses RAG to retrieve relevant information from FAQ documents.
    """
    
    def __init__(self):
        """Initialize FAQ agent."""
        super().__init__("faq")
    
    def get_system_prompt(self) -> str:
        """Get the FAQ agent system prompt."""
        return get_faq_agent_prompt()
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a general business question using RAG.
        
        Args:
            user_input: User's question
            context: Optional context with onboarding data and user info
            metadata: Optional metadata
            
        Returns:
            Answer with sources
        """
        try:
            logger.info(f"Processing FAQ query: {user_input[:100]}...")
            
            # Extract conversation history if available
            conversation_history = []
            if context and 'conversation_history' in context:
                conversation_history = context['conversation_history']
                logger.info(f"Using conversation history with {len(conversation_history)} messages")
            
            # Try RAG - search in 'faq' category first
            sources = []
            rag_has_useful_info = False
            
            try:
                rag_response = await rag_service.generate_rag_response(
                    query=user_input,
                    category='faq',
                    system_prompt=self.get_system_prompt(),
                    context=context,
                    conversation_history=conversation_history
                )
                
                # If no results in 'faq', try 'general'
                if rag_response.get('retrieved_chunks', 0) == 0:
                    logger.info("No results in 'faq', searching in 'general' category")
                    rag_response = await rag_service.generate_rag_response(
                        query=user_input,
                        category='general',
                        system_prompt=self.get_system_prompt(),
                        context=context,
                        conversation_history=conversation_history
                    )
                
                rag_answer = rag_response.get('answer', '')
                rag_sources = rag_response.get('sources', [])
                
                # Check if RAG actually found useful information
                rag_not_found_phrases = [
                    'no encontré información',
                    'no tengo información',
                    'no dispongo de información',
                    'no cuento con información',
                    'no puedo acceder',
                    'no está disponible en mi base'
                ]
                
                if any(phrase in rag_answer.lower() for phrase in rag_not_found_phrases):
                    logger.info("RAG returned 'not found' response - will use general LLM knowledge")
                    rag_has_useful_info = False
                else:
                    logger.info(f"RAG found useful information from {len(rag_sources)} sources")
                    sources.extend(rag_sources)
                    rag_has_useful_info = True
                    answer = rag_answer
                    
            except Exception as e:
                logger.warning(f"RAG query failed: {str(e)}")
                rag_has_useful_info = False
            
            # Fallback to general LLM knowledge if RAG didn't help
            if not rag_has_useful_info:
                logger.info("Using general LLM knowledge for FAQ response")
                
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                # Build conversation context
                conversation_context = ""
                if conversation_history:
                    conversation_context = "\n\nHistorial de conversación:\n"
                    for msg in conversation_history[-5:]:
                        role = "Usuario" if msg.get('role') == 'user' else "Asistente"
                        content = msg.get('content', '')
                        conversation_context += f"{role}: {content}\n"
                
                user_message = f"""Eres un asesor experto de negocios artesanales en Colombia, especializado EXCLUSIVAMENTE en:
- Desarrollo y gestión de emprendimientos artesanales
- Mejores prácticas para micro y pequeños negocios
- Gestión operativa y administrativa
- Desafíos comunes de artesanos y soluciones prácticas
- Crecimiento y escalabilidad de negocios artesanales
- Balance entre tradición artesanal y modelo de negocio
- Gestión de tiempo y recursos limitados

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{conversation_context}

**INSTRUCCIONES IMPORTANTES:**
1. Si la pregunta NO está relacionada con artesanías, negocios artesanales, emprendimiento o temas empresariales afines (por ejemplo: deportes, entretenimiento, ciencia general, etc.), responde BREVEMENTE con:
   "Lo siento, solo puedo ayudarte con consultas sobre artesanías y negocios artesanales. ¿Hay algo sobre tu emprendimiento artesanal en lo que pueda ayudarte?"
   
2. Si la pregunta SÍ está relacionada con artesanías/negocios, proporciona una respuesta útil que incluya:
   - Respuesta directa y clara
   - Contexto y explicación relevante
   - Pasos prácticos si aplica
   - Ejemplos del contexto artesanal colombiano
   - Consideraciones importantes

Sé empático, práctico y realista. Mantén las respuestas concisas pero informativas."""
                
                answer = await self._call_llm(
                    user_message=user_message,
                    temperature=0.7,
                    max_tokens=1500
                )
                sources = ["Conocimiento experto en negocios artesanales"]
            
            # Build response
            response = {
                "agent_type": self.agent_type,
                "answer": answer,
                "sources": sources,
                "used_rag": rag_has_useful_info,
                "confidence": "high" if rag_has_useful_info else "good",
                "retrieved_chunks": len(sources) if rag_has_useful_info else 0
            }
            
            logger.info(f"FAQ response generated (rag={rag_has_useful_info}, sources={len(sources)})")
            return response
            
        except Exception as e:
            logger.error(f"FAQ agent processing failed: {str(e)}")
            raise


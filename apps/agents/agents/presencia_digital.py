"""
Digital presence agent for marketing and social media strategy.
"""

from agents.agents.base import BaseAgent
from agents.tools.vector_search import rag_service
from agents.prompts import get_presencia_digital_prompt as get_presencia_digital_agent_prompt
from agents.helpers import extract_context_summary
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class PresenciaDigitalAgent(BaseAgent):
    """
    Agent specialized in digital marketing and online presence strategies.
    Provides guidance on social media, content creation, and digital visibility.
    """
    
    def __init__(self):
        """Initialize digital presence agent."""
        super().__init__("presencia_digital")
    
    def get_system_prompt(self) -> str:
        """Get the digital presence agent system prompt."""
        return get_presencia_digital_agent_prompt()
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a digital presence question.
        
        Args:
            user_input: User's question about digital marketing/social media
            context: Optional context with onboarding data and user info
            metadata: Optional metadata
            
        Returns:
            Digital marketing recommendations
        """
        try:
            logger.info(f"Processing digital presence query: {user_input[:100]}...")
            
            # Extract conversation history if available
            conversation_history = []
            if context and 'conversation_history' in context:
                conversation_history = context['conversation_history']
                logger.info(f"Using conversation history with {len(conversation_history)} messages")
            
            # Try RAG first for best practices
            sources = []
            rag_has_useful_info = False
            logger.info("Consulting RAG for digital marketing best practices...")
            
            try:
                rag_response = await rag_service.generate_rag_response(
                    query=user_input,
                    category='presencia_digital',
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
                logger.info("Using general LLM knowledge for digital presence guidance")
                
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
                
                user_message = f"""Eres un experto en marketing digital y presencia online para artesanos y pequeños negocios, especializado en:
- Estrategias de redes sociales (Instagram, Facebook, TikTok, Pinterest)
- Creación de contenido visual para productos artesanales
- Marketing de bajo costo y orgánico
- Storytelling y construcción de marca personal
- E-commerce y venta online para artesanos
- SEO y visibilidad en buscadores
- Email marketing y WhatsApp Business

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{conversation_context}

Proporciona una respuesta completa y práctica que incluya:
1. **Análisis**: Entiende la situación y necesidades del artesano
2. **Estrategias Clave**: 2-3 estrategias específicas adaptadas a artesanos
3. **Pasos Accionables**: Guía paso a paso de qué hacer
4. **Herramientas**: Recomienda herramientas gratuitas o económicas
5. **Contenido**: Sugiere tipos de contenido efectivos para artesanos
6. **Quick Wins**: 2-3 acciones que puede hacer HOY
7. **Errores a Evitar**: Advertencias sobre errores comunes

Sé específico, práctico y realista con los recursos de un artesano."""
                
            answer = await self._call_llm(
                user_message=user_message,
                temperature=0.7,
                max_tokens=1500
            )
            sources = ["Conocimiento experto en marketing digital artesanal"]
            
            # Build response
            response = {
                "agent_type": self.agent_type,
                "answer": answer,
                "sources": sources,
                "used_rag": rag_has_useful_info,
                "strategies": self._extract_strategies(answer),
                "quick_wins": self._extract_quick_wins(answer)
            }
            
            logger.info(f"Digital presence response generated (rag={rag_has_useful_info})")
            return response
            
        except Exception as e:
            logger.error(f"Digital presence agent processing failed: {str(e)}")
            raise
    
    def _extract_strategies(self, answer: str) -> list:
        """
        Extract marketing strategies from the answer.
        
        Args:
            answer: LLM response text
            
        Returns:
            List of strategy strings
        """
        strategies = []
        lines = answer.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                clean_line = line.lstrip('0123456789.-•) ').strip()
                if clean_line and len(clean_line) > 20:  # Substantial strategies
                    strategies.append(clean_line)
        
        return strategies[:5]
    
    def _extract_quick_wins(self, answer: str) -> list:
        """
        Extract quick, actionable items from the answer.
        
        Args:
            answer: LLM response text
            
        Returns:
            List of quick win actions
        """
        # Look for phrases that indicate immediate actions
        quick_win_keywords = ['hoy', 'ahora', 'inmediatamente', 'rápido', 'fácil', 'simple']
        quick_wins = []
        
        lines = answer.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in quick_win_keywords):
                clean_line = line.strip().lstrip('0123456789.-•) ').strip()
                if clean_line and len(clean_line) > 15:
                    quick_wins.append(clean_line)
        
        return quick_wins[:3]


"""
Pricing agent for market research and pricing strategies.
"""

from agents.agents.base import BaseAgent
from agents.tools.vector_search import rag_service
from agents.tools.external_apis import get_web_search_tool
from agents.prompts import get_pricing_prompt as get_pricing_agent_prompt
from agents.helpers import extract_context_summary
from src.utils.enhanced_logger import create_enhanced_logger
from typing import Dict, Any, Optional
from langchain.agents import create_react_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from src.api.config import settings
import time

logger = create_enhanced_logger(__name__)


class PricingAgent(BaseAgent):
    """
    Agent specialized in pricing strategies and market research.
    Uses web search (Tavily) for current market data and RAG for internal best practices.
    """
    
    def __init__(self):
        """Initialize pricing agent."""
        super().__init__("pricing")
        self.web_search_tool = get_web_search_tool()
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.7,
            api_key=settings.openai_api_key
        )
    
    def get_system_prompt(self) -> str:
        """Get the pricing agent system prompt."""
        return get_pricing_agent_prompt()
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a pricing-related request.
        
        Args:
            user_input: User's pricing question or request
            context: Optional context with onboarding data, user info, and conversation history
            metadata: Optional metadata
            
        Returns:
            Pricing recommendations with market data and strategies
        """
        start_time = time.time()
        
        try:
            logger.info(f"🎯 PRICING AGENT - Processing query: {user_input[:100]}...")
            
            # Extract conversation history if available
            conversation_history = []
            if context and 'conversation_history' in context:
                conversation_history = context['conversation_history']
                logger.info(f"📚 Using conversation history with {len(conversation_history)} messages")
            
            # Determine if we need web search or RAG or both
            needs_market_data = any(keyword in user_input.lower() for keyword in [
                'precio', 'cuánto', 'cuesta', 'cobran', 'mercado', 'competencia', 'competidor',
                'promedio', 'tendencia', 'actual', 'investiga', 'busca', 'encuentra',
                'otros artesanos', 'similar', 'comparable', 'parecido', 'costo'
            ])
            
            needs_strategy = any(keyword in user_input.lower() for keyword in [
                'estrategia', 'cómo', 'recomienda', 'debería', 'consejo',
                'mejor práctica', 'calcular', 'determinar', 'poner', 'fijar'
            ])
            
            logger.info(f"Query analysis: needs_market_data={needs_market_data}, needs_strategy={needs_strategy}")
            
            # Collect information from both sources
            market_data = ""
            strategy_guidance = ""
            sources = []
            
            # 1. Get internal best practices from RAG if needed
            rag_has_useful_info = False
            if needs_strategy or not needs_market_data:
                logger.rag_search_start(user_input, category='pricing')
                try:
                    rag_response = await rag_service.generate_rag_response(
                        query=user_input,
                        category='pricing',
                        system_prompt=self.get_system_prompt(),
                        context=context,
                        conversation_history=conversation_history
                    )
                    strategy_guidance = rag_response.get('answer', '')
                    rag_sources = rag_response.get('sources', [])
                    
                    # Log RAG results
                    logger.rag_search_results(len(rag_sources), rag_sources if rag_sources else None)
                    
                    # Check if RAG actually found useful information
                    rag_not_found_phrases = [
                        'no encontré información',
                        'no tengo información',
                        'no dispongo de información',
                        'no cuento con información',
                        'no puedo acceder',
                        'no está disponible en mi base'
                    ]
                    
                    if any(phrase in strategy_guidance.lower() for phrase in rag_not_found_phrases):
                        logger.fallback_triggered("RAG returned 'not found' response", "General LLM knowledge")
                        strategy_guidance = ""
                        rag_has_useful_info = False
                    else:
                        logger.info(f"✅ RAG found useful information from {len(rag_sources)} sources")
                        sources.extend(rag_sources)
                        rag_has_useful_info = True
                        
                except Exception as e:
                    logger.error("RAG Query", str(e), {"category": "pricing"})
                    strategy_guidance = ""
                    rag_has_useful_info = False
            
            # 2. Get current market data from web if needed
            if needs_market_data:
                search_query = f"{user_input} Colombia artesanía"
                logger.web_search_start(search_query)
                try:
                    market_data = self.web_search_tool.invoke(search_query)
                    sources.append("Búsqueda web (Tavily)")
                    logger.web_search_results(1 if market_data else 0)
                except Exception as e:
                    logger.error("Web Search", str(e), {"query": search_query[:50]})
                    market_data = ""
            
            # 3. If we have both, combine them intelligently
            if rag_has_useful_info and market_data:
                logger.info("Combining RAG and web search results...")
                
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                # Build enhanced prompt
                combined_prompt = f"""Eres un experto en estrategias de precios para artesanos colombianos.

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}

Mejores prácticas internas (de nuestra guía):
{strategy_guidance}

Datos actuales del mercado:
{market_data}

Basándote en las mejores prácticas internas Y los datos actuales del mercado, proporciona una recomendación completa y específica que combine ambas fuentes de información. Asegúrate de:
1. Explicar los principios de pricing relevantes
2. Incorporar los datos de mercado actuales
3. Dar recomendaciones específicas y accionables
4. Considerar el contexto del artesano si está disponible"""
                
                # Generate combined response
                answer = await self._call_llm(
                    user_message=combined_prompt,
                    temperature=0.7,
                    max_tokens=2000
                )
            
            # 4. If only one source, use it directly
            elif rag_has_useful_info:
                answer = strategy_guidance
            elif market_data:
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                prompt = f"""Eres un experto en estrategias de precios para artesanos colombianos.

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}

Datos del mercado encontrados:
{market_data}

Analiza estos datos del mercado y proporciona recomendaciones específicas de pricing para el artesano."""
                
                answer = await self._call_llm(
                    user_message=prompt,
                    temperature=0.7,
                    max_tokens=2000
                )
            else:
                # Fallback: general LLM response with enhanced expertise
                logger.fallback_triggered("No RAG or web search results", "Expert LLM knowledge")
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                # Build conversation context if available
                conversation_context = ""
                if conversation_history:
                    conversation_context = "\n\nHistorial de conversación:\n"
                    for msg in conversation_history[-5:]:  # Last 5 messages
                        role = "Usuario" if msg.get('role') == 'user' else "Asistente"
                        content = msg.get('content', '')
                        conversation_context += f"{role}: {content}\n"
                
                prompt = f"""Eres un experto en estrategias de precios para artesanos colombianos con amplia experiencia en:
- Análisis de costos y estructuras de pricing
- Estrategias de pricing (costo-plus, value-based, competitive)
- Psicología de pricing y tácticas de posicionamiento
- Mercado artesanal colombiano y comportamiento de clientes
- Pricing para productos hechos a mano y personalizados

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{conversation_context}

Proporciona una respuesta completa y detallada que incluya:
1. **Análisis del Contexto**: Entiende la situación específica del artesano
2. **Principios de Pricing**: Explica los conceptos relevantes de manera clara
3. **Estrategias Específicas**: Ofrece 2-3 estrategias concretas aplicables
4. **Cálculos y Ejemplos**: Si es relevante, incluye fórmulas o ejemplos numéricos
5. **Factores a Considerar**: Lista los factores importantes (materiales, tiempo, mercado, competencia)
6. **Pasos Accionables**: Da recomendaciones concretas que el artesano pueda implementar
7. **Warnings**: Menciona errores comunes a evitar

Sé específico, práctico y educativo. Tu respuesta debe ser tan útil como la de un consultor de negocios."""
                
                logger.llm_call_start(model=settings.openai_model, temperature=0.7, max_tokens=2000)
                llm_start = time.time()
                answer = await self._call_llm(
                    user_message=prompt,
                    temperature=0.7,
                    max_tokens=2000
                )
                llm_duration = (time.time() - llm_start) * 1000
                logger.llm_call_complete(response_length=len(answer), duration_ms=llm_duration)
                sources = ["Conocimiento experto en pricing artesanal"]
            
            # Build response
            response = {
                "agent_type": self.agent_type,
                "answer": answer,
                "sources": list(set(sources)),  # Remove duplicates
                "used_web_search": bool(market_data),
                "used_rag": rag_has_useful_info,
                "confidence": "high" if (rag_has_useful_info and market_data) else ("medium" if (rag_has_useful_info or market_data) else "good")
            }
            
            # Store pricing strategy as memory (high importance)
            await self._store_pricing_strategy(
                user_input=user_input,
                answer=answer,
                context=context,
                used_market_data=bool(market_data)
            )
            
            # Log final metrics
            total_duration = (time.time() - start_time) * 1000
            logger.agent_response(
                agent="pricing",
                response_length=len(answer),
                sources_count=len(response['sources']),
                confidence=response['confidence']
            )
            logger.performance_metrics({
                "total_duration_ms": total_duration,
                "used_web_search": response['used_web_search'],
                "used_rag": response['used_rag']
            })
            
            return response
            
        except Exception as e:
            total_duration = (time.time() - start_time) * 1000
            logger.error("Pricing Agent Processing", str(e), {
                "query": user_input[:100],
                "duration_ms": total_duration
            })
            raise
    
    def _extract_pricing_insights(self, answer: str) -> Dict[str, Any]:
        """
        Extract structured pricing insights from the answer.
        
        Args:
            answer: LLM response text
            
        Returns:
            Dictionary with extracted insights
        """
        insights = {
            "recommended_price_range": None,
            "key_factors": [],
            "competitive_advantage": [],
            "warnings": []
        }
        
        # Simple extraction logic (could be enhanced with more sophisticated parsing)
        lines = answer.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['precio sugerido', 'rango de precio', 'entre']):
                insights["recommended_price_range"] = line
            elif line.startswith('-') or line.startswith('•'):
                clean_line = line.lstrip('-•').strip()
                if clean_line:
                    insights["key_factors"].append(clean_line)
        
        return insights
    
    async def _store_pricing_strategy(
        self,
        user_input: str,
        answer: str,
        context: Optional[Dict[str, Any]],
        used_market_data: bool
    ) -> None:
        """
        Store pricing strategy as high-importance memory.
        
        Args:
            user_input: User's pricing question
            answer: Pricing recommendation
            context: Context with user_id
            used_market_data: Whether market data was used
        """
        try:
            # Build memory content
            memory_content = f"""Consulta de Pricing: {user_input}
            
Recomendación:
{answer[:500]}...

Incluye datos de mercado: {used_market_data}"""
            
            # Generate summary
            summary = await self.memory_service.generate_summary(
                content=f"Pregunta: {user_input}. Respuesta: {answer}",
                max_length=150
            )
            
            # Store as strategy memory with high importance
            await self._store_agent_memory(
                content=memory_content,
                memory_type='strategy',
                context=context,
                importance_score=0.85,  # Pricing strategies are important
                summary=summary,
                metadata={
                    'query_type': 'pricing',
                    'used_market_data': used_market_data
                }
            )
            
            logger.info("Stored pricing strategy as high-importance memory")
            
        except Exception as e:
            logger.error(f"Failed to store pricing strategy: {str(e)}")


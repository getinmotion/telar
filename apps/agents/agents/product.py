"""
Product agent for catalog, inventory, and store description support.
"""

from agents.agents.base import BaseAgent
from agents.tools.vector_search import rag_service
from src.services.product_recommendation_service import product_recommendation_service
from agents.tools.database import get_shop_data_tool
from agents.prompts import get_product_prompt as get_producto_agent_prompt
from agents.helpers import extract_context_summary
from typing import Dict, Any, Optional
import logging
import json
import re

logger = logging.getLogger(__name__)


class ProductoAgent(BaseAgent):
    """
    Agent specialized in product catalog and store description support.
    Helps artisans with product presentation and inventory management.
    """
    
    def __init__(self):
        """Initialize product agent."""
        super().__init__("producto")
    
    def get_system_prompt(self) -> str:
        """Get the product agent system prompt."""
        return get_producto_agent_prompt()
    
    async def _classify_query_intent(self, user_input: str, user_id: Optional[str]) -> Dict[str, Any]:
        """
        Use LLM to classify if the query needs shop database data or semantic product search.
        
        Args:
            user_input: User's question
            user_id: User identifier (if available)
            
        Returns:
            Dict with:
            - needs_semantic_search: bool (if user wants to find/buy products)
            - needs_shop_data: bool (if user asks about THEIR OWN products)
            - query_type: str (products, sales, inventory, top_products, analytics)
            - reasoning: str
        """
        # Note: Semantic search doesn't need user_id (searches all products)
        # Shop data needs user_id (queries user's own products)
        
        classification_prompt = f"""Analiza la siguiente pregunta y clasifica su intención. Lee CUIDADOSAMENTE.

Pregunta: "{user_input}"

Clasifica en UNA o MÁS de estas categorías:

1. **BÚSQUEDA/RECOMENDACIÓN DE PRODUCTOS** (needs_semantic_search=true):
   - Usuario quiere ENCONTRAR/COMPRAR/VER productos artesanales para él o regalar
   - Busca recomendaciones de productos por material, ocasión, estilo, destinatario
   - Quiere ver opciones de productos disponibles en el marketplace
   - PALABRAS CLAVE: "regalar", "comprar", "buscar", "recomendar", "quiero", "necesito", producto para", "de madera", "de cerámica", "para mi mamá", "opciones de", etc.
   - Ejemplos: 
     * "Quiero regalarle algo a mi mamá de madera"
     * "Recomiéndame artesanías en cerámica"
     * "Busco productos para decoración"
     * "Qué productos de madera tienen?"
     * "Muéstrame opciones de regalos"

2. **DATOS DE SU PROPIA TIENDA** (needs_shop_data=true):
   - Usuario pregunta sobre SUS PROPIOS productos, inventario, ventas (usa pronombres posesivos: "mi", "mis", "tengo")
   - Solo aplica si hay user_id disponible: {user_id is not None}
   - Ejemplos: "¿Cuál es MI producto más caro?", "¿Cuántos productos TENGO?", "¿Qué HE vendido?"

3. **CONSEJOS GENERALES** (ni semantic_search ni shop_data):
   - Busca estrategias, mejores prácticas, consejos abstractos
   - Ejemplos: "¿Cómo mejorar mi catálogo?", "¿Qué estrategias de producto usar?"

**IMPORTANTE**: 
- Si la pregunta menciona "regalarle", "comprar", "buscar productos", "recomendar productos", etc. → needs_semantic_search=true
- Si dice "MI producto", "MIS productos", "TENGO" → needs_shop_data=true (solo si user_id disponible)
- Ambos pueden ser true al mismo tiempo si la pregunta tiene ambas intenciones

Tipos de consulta para shop_data:
- "products": Productos en general
- "sales": Ventas, órdenes
- "inventory": Stock, inventario
- "top_products": Rankings (más caro, más vendido)
- "analytics": Métricas

Responde SOLO con JSON (sin markdown, sin explicaciones adicionales):
{{
  "needs_semantic_search": true/false,
  "needs_shop_data": true/false,
  "query_type": "products|sales|inventory|top_products|analytics|null",
  "reasoning": "breve explicación"
}}"""

        try:
            response = await self._call_llm(
                user_message=classification_prompt,
                temperature=0.1,  # Low temperature for consistent classification
                max_tokens=200
            )
            
            # Extract JSON from response
            # Try to find JSON in the response
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                logger.info(f"Query classification: needs_shop_data={result.get('needs_shop_data')}, "
                          f"type={result.get('query_type')}, reason={result.get('reasoning')}")
                return result
            else:
                logger.warning("Could not parse classification response, defaulting to no shop data")
                return {"needs_shop_data": False, "query_type": None, "reasoning": "Parse error"}
                
        except Exception as e:
            logger.warning(f"Classification failed: {str(e)}, defaulting to no shop data")
            return {"needs_shop_data": False, "query_type": None, "reasoning": f"Error: {str(e)}"}
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a product-related request.
        
        Args:
            user_input: User's request about products/catalog
            context: Optional context with onboarding data, user info, and conversation history
            metadata: Optional metadata
            
        Returns:
            Product guidance and recommendations
        """
        try:
            logger.info(f"Processing product query: {user_input[:100]}...")
            
            # Extract user_id from context if available
            user_id = None
            if context:
                user_id = context.get('user_id')
            
            # Extract conversation history if available
            conversation_history = []
            if context and 'conversation_history' in context:
                conversation_history = context['conversation_history']
                logger.info(f"Using conversation history with {len(conversation_history)} messages")
            
            # Use LLM to intelligently classify if we need shop data
            logger.info("🔍 Classifying query intent...")
            classification = await self._classify_query_intent(user_input, user_id)
            needs_semantic_search = classification.get('needs_semantic_search', False)
            needs_shop_data = classification.get('needs_shop_data', False)
            query_type = classification.get('query_type', 'products')
            
            logger.info(f"📊 Classification result: needs_semantic_search={needs_semantic_search}, "
                       f"needs_shop_data={needs_shop_data}, query_type={query_type}, "
                       f"reasoning={classification.get('reasoning')}")
            
            shop_data = ""
            product_recommendations = []
            sources = []
            
            # Perform semantic product search if needed (for recommendations)
            if needs_semantic_search:
                logger.info("🎯 Performing semantic product search for recommendations...")
                try:
                    product_recommendations = await product_recommendation_service.recommend_products(
                        query=user_input,
                        limit=5
                    )
                    if product_recommendations:
                        sources.append("Búsqueda semántica de productos")
                        logger.info(f"✅ Found {len(product_recommendations)} product recommendations")
                    else:
                        logger.info("ℹ️ No product recommendations found")
                except Exception as e:
                    logger.warning(f"❌ Semantic search failed: {str(e)}")
                    product_recommendations = []
            
            # Query shop database if needed and user_id available
            if needs_shop_data and user_id:
                logger.info(f"🔎 Querying shop database for user_id: {user_id}, query_type: {query_type}")
                try:
                    # Get shop data tool with the classified query type
                    shop_tool = get_shop_data_tool(user_id)
                    shop_data = await shop_tool.ainvoke({
                        "query_type": query_type,
                        "filters": None
                    })
                    sources.append("Base de datos de la tienda")
                    logger.info(f"✅ Shop data retrieved: {len(shop_data)} chars")
                except Exception as e:
                    logger.warning(f"❌ Failed to query shop database: {str(e)}")
                    shop_data = ""
            
            # Also get general guidance from RAG
            logger.info("Consulting RAG for product guidance...")
            rag_guidance = ""
            rag_has_useful_info = False
            try:
                rag_response = await rag_service.generate_rag_response(
                    query=user_input,
                    category='producto',
                    system_prompt=self.get_system_prompt(),
                    context=context,
                    conversation_history=conversation_history
                )
                rag_answer = rag_response.get('answer', '')
                rag_sources = rag_response.get('sources', [])
                
                # Check if RAG actually found useful information
                # If RAG says it didn't find info, treat it as no RAG data
                rag_not_found_phrases = [
                    'no encontré información',
                    'no tengo información',
                    'no dispongo de información',
                    'no cuento con información',
                    'no puedo acceder',
                    'no está disponible en mi base'
                ]
                
                if any(phrase in rag_answer.lower() for phrase in rag_not_found_phrases):
                    logger.info("RAG returned 'not found' response - treating as no RAG data")
                    rag_guidance = ""
                    rag_has_useful_info = False
                else:
                    logger.info(f"RAG found useful information from {len(rag_sources)} sources")
                    rag_guidance = rag_answer
                    sources.extend(rag_sources)
                    rag_has_useful_info = True
                    
            except Exception as e:
                logger.warning(f"RAG query failed: {str(e)}")
                rag_guidance = ""
                rag_has_useful_info = False
            
            # Generate response based on available data
            # Priority: product_recommendations > shop_data + RAG > shop_data > RAG > general
            if product_recommendations:
                # We have product recommendations from semantic search
                logger.info("Generating response with product recommendations...")
                
                # Format recommendations for LLM
                recommendations_text = product_recommendation_service.format_recommendations_for_llm(
                    product_recommendations
                )
                
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                # Build conversation context
                conversation_context = ""
                if conversation_history:
                    conversation_context = "\n\nHistorial de conversación:\n"
                    for msg in conversation_history[-5:]:
                        role = msg.get('role', 'unknown')
                        content = msg.get('content', '')
                        conversation_context += f"{role}: {content}\n"
                
                recommendation_prompt = f"""Eres un experto en productos artesanales que ayuda a los usuarios a encontrar productos perfectos.

Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{conversation_context}

{recommendations_text}

INSTRUCCIONES:
1. Presenta las opciones de manera atractiva y personalizada
2. Destaca los productos más relevantes (basándote en la relevancia/similarity)
3. Incluye detalles útiles: precio, material, descripción
4. Usa emojis para hacer la respuesta más visual (🎨, 💰, 🏪, ⭐, etc.)
5. Si mencionas tienda, incluye el nombre de la tienda
6. Sé conversacional y amigable
7. Si hay URL o forma de contactar, menciónalo

Proporciona una respuesta útil, específica y bien formateada."""
                
                answer = await self._call_llm(
                    user_message=recommendation_prompt,
                    temperature=0.8,
                    max_tokens=2000
                )
            
            # Combine shop data and RAG guidance
            elif shop_data and rag_has_useful_info:
                logger.info("Combining shop data and RAG guidance...")
                
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                combined_prompt = f"""Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}

Datos de la tienda del usuario:
{shop_data}

Guía y mejores prácticas:
{rag_guidance}

Basándote en los datos reales de la tienda del usuario Y las mejores prácticas, proporciona una respuesta personalizada y específica. Asegúrate de:
1. Referirte a los datos específicos de su tienda
2. Aplicar las mejores prácticas al contexto específico
3. Dar recomendaciones accionables
4. Ser específico con números y datos cuando estén disponibles"""
                
                answer = await self._call_llm(
                    user_message=combined_prompt,
                    temperature=0.7,
                    max_tokens=1500
                )
                sources.append("Análisis combinado")
                
            elif shop_data:
                # Only shop data available (no useful RAG)
                logger.info("Using only shop data for response...")
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                prompt = f"""Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}

Datos de la tienda:
{shop_data}

Analiza estos datos y proporciona recomendaciones específicas basadas en la información real de su tienda."""
                
                answer = await self._call_llm(
                    user_message=prompt,
                    temperature=0.7,
                    max_tokens=1500
                )
                
            elif rag_has_useful_info:
                # Only RAG guidance available (useful info found)
                logger.info("Using RAG guidance for response...")
                answer = rag_guidance
                
            else:
                # Fallback to general LLM knowledge
                # This handles cases where:
                # - No shop data was requested/available
                # - RAG didn't find specific documentation
                # - But the question is still within the agent's expertise
                logger.info("Using general LLM knowledge for response...")
                context_summary = ""
                if context:
                    context_summary = extract_context_summary(context)
                
                # Build conversation context if available
                conversation_context = ""
                if conversation_history:
                    conversation_context = "\n\nHistorial de conversación:\n"
                    for msg in conversation_history[-5:]:  # Last 5 messages
                        role = msg.get('role', 'unknown')
                        content = msg.get('content', '')
                        conversation_context += f"{role}: {content}\n"
                
                user_message = f"""Pregunta del usuario: {user_input}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{conversation_context}

Eres un experto en productos artesanales, catálogo, inventario y estrategias de venta para artesanos. 
Proporciona orientación específica, práctica y accionable sobre productos y estrategias de catálogo.
Incluye recomendaciones concretas y mejores prácticas basadas en tu experiencia."""
                
                answer = await self._call_llm(
                    user_message=user_message,
                    temperature=0.7,
                    max_tokens=1500
                )
                sources = ["Conocimiento general del modelo"]
            
            # Build response
            response = {
                "agent_type": self.agent_type,
                "answer": answer,
                "sources": list(set(sources)),
                "used_shop_data": bool(shop_data),
                "recommendations": self._extract_recommendations(answer)
            }
            
            logger.info(f"Product response generated (shop_data={response['used_shop_data']})")
            return response
            
        except Exception as e:
            logger.error(f"Product agent processing failed: {str(e)}")
            raise
    
    def _extract_recommendations(self, answer: str) -> list:
        """
        Extract actionable recommendations from the answer.
        
        Args:
            answer: LLM response text
            
        Returns:
            List of recommendation strings
        """
        # Simple extraction: look for numbered or bulleted lists
        recommendations = []
        lines = answer.split('\n')
        
        for line in lines:
            line = line.strip()
            # Match numbered lists or bullet points
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                # Clean up the line
                clean_line = line.lstrip('0123456789.-•) ').strip()
                if clean_line:
                    recommendations.append(clean_line)
        
        return recommendations[:5]  # Return top 5


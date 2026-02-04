"""
Supervisor agent with LangGraph workflow for routing requests.
"""

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from agents.agents.onboarding import OnboardingAgent
from agents.agents.product import ProductoAgent
from agents.agents.legal import LegalAgent
from agents.agents.presencia_digital import PresenciaDigitalAgent
from agents.agents.faq import FAQAgent
from agents.agents.pricing import PricingAgent
from agents.core.state import AgentState
from agents.core.memory import memory_service
from agents.prompts import get_supervisor_prompt
from agents.helpers import parse_json_response
from src.utils.enhanced_logger import create_enhanced_logger
from src.api.config import settings
from typing import Dict, Any, Literal, Optional
from uuid import UUID
import time
import json

logger = create_enhanced_logger(__name__)


class SupervisorAgent:
    """
    Supervisor agent that coordinates the multi-agent workflow.
    Uses LangGraph to route requests to specialized agents.
    """
    
    def __init__(self):
        """Initialize supervisor and worker agents."""
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.3,
            api_key=settings.openai_api_key
        )
        
        # Initialize worker agents
        self.agents = {
            "onboarding": OnboardingAgent(),
            "producto": ProductoAgent(),
            "legal": LegalAgent(),
            "presencia_digital": PresenciaDigitalAgent(),
            "faq": FAQAgent(),
            "pricing": PricingAgent()
        }
        
        # Initialize hierarchical memory service
        self.memory_service = memory_service
        logger.info("✅ Hierarchical memory service initialized")
        print("✅ Hierarchical memory system active (profile + conversational + strategy)")
        
        # Track interaction counts for profile updates
        self.interaction_counts = {}  # {artisan_id: count}
        
        # Build the graph
        self.graph = self._build_graph()
        logger.info("Supervisor agent initialized with hierarchical memory workflow")
    
    def _build_graph(self) -> StateGraph:
        """
        Build the LangGraph workflow.
        
        Returns:
            Compiled StateGraph
        """
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("supervisor", self._supervisor_node)
        workflow.add_node("onboarding", self._onboarding_node)
        workflow.add_node("producto", self._producto_node)
        workflow.add_node("legal", self._legal_node)
        workflow.add_node("presencia_digital", self._presencia_digital_node)
        workflow.add_node("faq", self._faq_node)
        workflow.add_node("pricing", self._pricing_node)
        
        # Set entry point
        workflow.set_entry_point("supervisor")
        
        # Add conditional edges from supervisor to workers
        workflow.add_conditional_edges(
            "supervisor",
            self._route_to_agent,
            {
                "onboarding": "onboarding",
                "producto": "producto",
                "legal": "legal",
                "presencia_digital": "presencia_digital",
                "faq": "faq",
                "pricing": "pricing"
            }
        )
        
        # All worker nodes go to END
        for agent_name in self.agents.keys():
            workflow.add_edge(agent_name, END)
        
        # Compile without checkpointer (using hierarchical memory instead)
        return workflow.compile()
    
    async def _load_artisan_context(self, state: AgentState) -> Dict[str, Any]:
        """
        Load artisan profile and relevant memories before routing.
        
        Args:
            state: Current agent state
            
        Returns:
            Enhanced context with artisan profile and memories
        """
        enhanced_context = state.get('context', {}).copy() if state.get('context') else {}
        
        # Load artisan profile if user_id is available
        # Try to get user_id from state first, then from context
        artisan_id = state.get('user_id')
        if not artisan_id and state.get('context'):
            artisan_id = state.get('context', {}).get('user_id')
        
        logger.info(f"🔑 Artisan ID from state: {artisan_id}")
        
        if artisan_id:
            try:
                artisan_id_uuid = UUID(artisan_id)
                logger.info(f"🔍 Attempting to load profile for artisan: {artisan_id_uuid}")
                profile = await self.memory_service.get_artisan_profile(artisan_id_uuid)
                
                if profile:
                    enhanced_context['artisan_profile'] = {
                        'summary': profile.profile_summary,
                        'key_insights': profile.key_insights,
                        'interaction_count': profile.interaction_count,
                        'maturity_snapshot': profile.maturity_snapshot
                    }
                    logger.info(f"Loaded artisan profile with {profile.interaction_count} interactions")
                
                # Load recent conversation memories for session
                logger.info(f"🔍 Loading conversation context for session: {state['session_id']}")
                session_memories = await self.memory_service.get_conversation_context(
                    session_id=state['session_id'],
                    artisan_id=artisan_id_uuid,
                    limit=5
                )
                logger.info(f"📊 Found {len(session_memories) if session_memories else 0} session memories")
                
                if session_memories:
                    # Store as recent_memories for supervisor routing
                    # session_memories are dicts from database, not Pydantic models
                    enhanced_context['recent_memories'] = [
                        {
                            'content': mem.get('chunk_text', mem.get('content', '')), 
                            'agent': mem.get('agent_type', 'unknown'), 
                            'importance': mem.get('importance_score', 0.5)
                        }
                        for mem in session_memories
                    ]
                    
                    # Also store as conversation_history for agent consumption
                    enhanced_context['conversation_history'] = [
                        {
                            'role': 'assistant' if i % 2 else 'user', 
                            'content': mem.get('chunk_text', mem.get('content', ''))
                        }
                        for i, mem in enumerate(session_memories)
                    ]
                    
                    logger.info(f"Loaded {len(session_memories)} recent memories from database")
                
                # ADDITIONALLY: Load profile memories (onboarding data) for better context
                # This helps agents like Pricing understand the artisan's specific situation
                logger.info(f"🔍 Loading profile memories for artisan: {artisan_id_uuid}")
                profile_memories = await self.memory_service.read_memory(
                    query="onboarding profile artesanía",  # Query for onboarding data
                    artisan_id=artisan_id_uuid,
                    memory_type='profile',
                    limit=3
                )
                logger.info(f"📊 Found {len(profile_memories) if profile_memories else 0} profile memories")
                
                if profile_memories and enhanced_context.get('artisan_profile'):
                    # Extract onboarding info from profile memories and add to artisan_profile
                    for mem in profile_memories:
                        # Parse onboarding data from memory content
                        content = mem.content if hasattr(mem, 'content') else str(mem)
                        if 'Tipo de artesanía:' in content:
                            tipo_match = content.split('Tipo de artesanía:')[1].split('\n')[0].strip()
                            if tipo_match:
                                enhanced_context['artisan_profile']['key_insights']['tipo_artesania'] = tipo_match
                        if 'Experiencia:' in content:
                            exp_match = content.split('Experiencia:')[1].split('\n')[0].strip()
                            if exp_match:
                                enhanced_context['artisan_profile']['key_insights']['experiencia'] = exp_match
                        if 'Nivel de Madurez General:' in content:
                            mat_match = content.split('Nivel de Madurez General:')[1].split('\n')[0].strip()
                            if mat_match:
                                enhanced_context['artisan_profile']['maturity_snapshot']['general'] = mat_match
                    
                    logger.info(f"✅ Enhanced artisan profile with onboarding data")
                    
            except Exception as e:
                logger.warning(f"Failed to load artisan context: {str(e)}")
        
        # Fallback: If no memories from DB, use messages from state (in-memory conversation)
        if 'recent_memories' not in enhanced_context or not enhanced_context['recent_memories']:
            if state.get('messages'):
                logger.info(f"No DB memories found, using {len(state['messages'])} messages from state as fallback")
                # Convert state messages to memory format for supervisor
                enhanced_context['recent_memories'] = []
                for msg in state['messages'][-10:]:  # Last 10 messages
                    role = msg.get('role', 'unknown')
                    content = msg.get('content', '')
                    enhanced_context['recent_memories'].append({
                        'content': f"{role}: {content}",
                        'agent': 'state_fallback',
                        'importance': 0.5
                    })
                
                # Also create conversation_history for agents
                enhanced_context['conversation_history'] = [
                    {'role': msg.get('role', 'user'), 'content': msg.get('content', '')}
                    for msg in state['messages'][-10:]
                ]
        
        return enhanced_context
    
    async def _store_interaction_memory(
        self,
        state: AgentState,
        agent_name: str,
        agent_output: Dict[str, Any]
    ) -> None:
        """
        Store interaction as conversational memory.
        
        Args:
            state: Current agent state
            agent_name: Agent that processed the request
            agent_output: Agent's response
        """
        try:
            # Get user_id from state or context
            user_id_str = state.get('user_id') or state.get('context', {}).get('user_id')
            artisan_id = UUID(user_id_str) if user_id_str else None
            logger.info(f"💾 Storing memory with artisan_id={artisan_id}, session_id={state['session_id']}")
            
            # Build memory content
            memory_content = f"Usuario: {state['user_input']}\nRespuesta ({agent_name}): {agent_output.get('answer', str(agent_output))}"
            
            # Store conversational memory
            await self.memory_service.write_memory(
                memory_type='conversational',
                agent_type=agent_name,
                content=memory_content,
                knowledge_category=agent_name,
                artisan_id=artisan_id,
                session_id=state['session_id'],
                importance_score=None,  # Will be calculated
                metadata={
                    'routing_confidence': state.get('routing_confidence'),
                    'execution_time_ms': state.get('execution_time_ms')
                }
            )
            
            logger.info(f"Stored conversational memory for {agent_name} agent")
            
        except Exception as e:
            logger.error(f"Failed to store interaction memory: {str(e)}")
    
    def _should_update_profile(self, artisan_id: str) -> bool:
        """
        Determine if artisan profile should be updated.
        
        Args:
            artisan_id: Artisan identifier
            
        Returns:
            True if profile should be updated
        """
        if artisan_id not in self.interaction_counts:
            self.interaction_counts[artisan_id] = 0
        
        self.interaction_counts[artisan_id] += 1
        
        # Update profile every N interactions
        should_update = (self.interaction_counts[artisan_id] % settings.profile_update_interval == 0)
        
        if should_update:
            logger.info(f"Profile update triggered for artisan {artisan_id} "
                       f"(interactions: {self.interaction_counts[artisan_id]})")
        
        return should_update
    
    async def _update_artisan_profile(
        self,
        artisan_id: UUID,
        state: AgentState,
        agent_output: Dict[str, Any]
    ) -> None:
        """
        Update artisan global profile with new insights.
        
        Args:
            artisan_id: Artisan identifier
            state: Current agent state
            agent_output: Agent's response
        """
        try:
            # Get existing profile
            existing_profile = await self.memory_service.get_artisan_profile(artisan_id)
            
            # Extract key insights from interaction
            new_insights = {
                'last_agent': state.get('selected_agent'),
                'last_query_category': state.get('selected_agent'),
                'recent_interaction': {
                    'query': state['user_input'][:100],
                    'timestamp': time.time()
                }
            }
            
            # Merge with existing insights
            if existing_profile:
                key_insights = existing_profile.key_insights.copy()
                key_insights.update(new_insights)
                profile_summary = existing_profile.profile_summary
                maturity_snapshot = existing_profile.maturity_snapshot
            else:
                key_insights = new_insights
                profile_summary = f"Artisan with {self.interaction_counts.get(str(artisan_id), 0)} interactions"
                maturity_snapshot = {}
            
            # Update profile
            await self.memory_service.update_artisan_profile(
                artisan_id=artisan_id,
                profile_summary=profile_summary,
                key_insights=key_insights,
                maturity_snapshot=maturity_snapshot,
                increment_interaction=True
            )
            
            logger.info(f"Updated artisan profile for {artisan_id}")
            
        except Exception as e:
            logger.error(f"Failed to update artisan profile: {str(e)}")
    
    async def _supervisor_node(self, state: AgentState) -> AgentState:
        """
        Supervisor node: analyze input and decide which agent to use.
        Load artisan context before routing.
        
        Args:
            state: Current agent state
            
        Returns:
            Updated state with routing decision
        """
        try:
            logger.info(f"🔍 Supervisor analyzing request for session {state['session_id']}")
            
            # Load artisan context (profile + memories)
            logger.info(f"📥 Loading artisan context (user_id={state.get('user_id')})")
            enhanced_context = await self._load_artisan_context(state)
            state['context'] = enhanced_context
            
            # Debug: Log what was loaded
            if 'recent_memories' in enhanced_context:
                logger.info(f"✅ Loaded {len(enhanced_context['recent_memories'])} recent memories")
            else:
                logger.warning(f"⚠️ No recent memories loaded for session {state['session_id']}")
            
            # Build analysis prompt with memory context
            context_info = ""
            if enhanced_context:
                # Include profile summary if available
                if 'artisan_profile' in enhanced_context:
                    profile = enhanced_context['artisan_profile']
                    context_info += f"\n\nPerfil del artesano:\n{profile.get('summary', 'N/A')}"
                    context_info += f"\nInteracciones previas: {profile.get('interaction_count', 0)}"
                
                # Include recent conversation context (CRITICAL for follow-up questions)
                if 'recent_memories' in enhanced_context and enhanced_context['recent_memories']:
                    context_info += f"\n\nContexto de la conversación actual (últimas {len(enhanced_context['recent_memories'])} interacciones):"
                    for idx, mem in enumerate(enhanced_context['recent_memories'], 1):
                        # Show the content of recent memories
                        mem_preview = mem['content'][:200] if len(mem['content']) > 200 else mem['content']
                        context_info += f"\n{idx}. {mem_preview}"
                    context_info += "\n\n⚠️ IMPORTANTE: Si el usuario hace una pregunta de seguimiento (como '¿y eso?' o '¿cuánto cuesta eso?'), usa el contexto anterior para entender a qué se refiere."
            
            # Check if input contains onboarding JSON (Q1-Q16)
            is_onboarding_json = '"Q1"' in state['user_input'] and '"Q16"' in state['user_input']
            onboarding_hint = "\n\n⚠️ NOTA IMPORTANTE: La solicitud contiene un JSON con respuestas Q1-Q16, esto es un DIAGNÓSTICO DE ONBOARDING. Debe ser procesado por el agente 'onboarding'." if is_onboarding_json else ""
            
            analysis_prompt = f"""Analiza la siguiente solicitud del usuario y determina qué agente debe procesarla.

Solicitud del usuario: {state['user_input'][:500]}{'...' if len(state['user_input']) > 500 else ''}
{context_info}
{onboarding_hint}

Agentes disponibles:
- onboarding: Diagnóstico inicial con 16 preguntas (Q1-Q16) para evaluar madurez artesanal
- producto: Catálogo de productos, inventario, descripciones de tienda
- legal: Temas legales, impuestos, contabilidad, formalización
- presencia_digital: Marketing digital, redes sociales, visibilidad online
- pricing: Estrategias de precios, análisis de mercado
- faq: Preguntas generales sobre negocios artesanales

Devuelve tu decisión en formato JSON."""
            
            # Call LLM
            response = await self.llm.ainvoke([
                {"role": "system", "content": get_supervisor_prompt()},
                {"role": "user", "content": analysis_prompt}
            ])
            
            # Parse routing decision
            decision = parse_json_response(response.content)
            
            # Update state
            state['selected_agent'] = decision.get('selected_agent', 'faq')
            state['routing_confidence'] = float(decision.get('confidence', 0.5))
            state['routing_reasoning'] = decision.get('reasoning', 'No reasoning provided')
            state['start_time'] = time.time()
            
            logger.info(f"Supervisor routed to {state['selected_agent']} with confidence {state['routing_confidence']}")
            return state
            
        except Exception as e:
            logger.error(f"Supervisor node failed: {str(e)}")
            # Default to FAQ on error
            state['selected_agent'] = 'faq'
            state['routing_confidence'] = 0.3
            state['routing_reasoning'] = f'Error in routing: {str(e)}'
            state['error'] = str(e)
            return state
    
    def _route_to_agent(self, state: AgentState) -> Literal["onboarding", "producto", "legal", "presencia_digital", "faq", "pricing"]:
        """
        Route to the selected agent.
        
        Args:
            state: Current agent state
            
        Returns:
            Agent name to route to
        """
        return state.get('selected_agent', 'faq')
    
    async def _onboarding_node(self, state: AgentState) -> AgentState:
        """Process request with onboarding agent."""
        return await self._process_with_agent(state, "onboarding")
    
    async def _producto_node(self, state: AgentState) -> AgentState:
        """Process request with product agent."""
        return await self._process_with_agent(state, "producto")
    
    async def _legal_node(self, state: AgentState) -> AgentState:
        """Process request with legal agent."""
        return await self._process_with_agent(state, "legal")
    
    async def _presencia_digital_node(self, state: AgentState) -> AgentState:
        """Process request with digital presence agent."""
        return await self._process_with_agent(state, "presencia_digital")
    
    async def _faq_node(self, state: AgentState) -> AgentState:
        """Process request with FAQ agent."""
        return await self._process_with_agent(state, "faq")
    
    async def _pricing_node(self, state: AgentState) -> AgentState:
        """Process request with Pricing agent."""
        return await self._process_with_agent(state, "pricing")
    
    async def _process_with_agent(self, state: AgentState, agent_name: str) -> AgentState:
        """
        Process request with a specific agent.
        
        Args:
            state: Current agent state
            agent_name: Name of the agent to use
            
        Returns:
            Updated state with agent response
        """
        try:
            logger.info(f"Processing with {agent_name} agent")
            
            agent = self.agents[agent_name]
            
            # Build conversation history from state for context
            conversation_history = []
            if hasattr(state, 'get') and state.get('messages'):
                # If we have messages in state, use them
                conversation_history = state.get('messages', [])
            
            # Enhance context with conversation history and session info
            enhanced_context = state.get('context', {}).copy() if state.get('context') else {}
            if conversation_history:
                enhanced_context['conversation_history'] = conversation_history
            
            # Add session_id to context for agents
            if state.get('session_id'):
                enhanced_context['session_id'] = state['session_id']
            
            # Ensure user_id is in context (can be in state.user_id or state.context.user_id)
            if 'user_id' not in enhanced_context:
                user_id_from_state = state.get('user_id') or state.get('context', {}).get('user_id')
                if user_id_from_state:
                    enhanced_context['user_id'] = user_id_from_state
            
            # Add current user input to history for next iteration
            current_message = {
                "role": "user",
                "content": state['user_input']
            }
            
            # Prepare agent input
            state['agent_input'] = {
                "user_input": state['user_input'],
                "context": enhanced_context,
                "metadata": state.get('metadata')
            }
            
            # Process with agent
            agent_output = await agent.process(
                user_input=state['user_input'],
                context=enhanced_context,
                metadata=state.get('metadata')
            )
            
            state['agent_output'] = agent_output
            
            # Update conversation history in state
            if 'messages' not in state:
                state['messages'] = []
            state['messages'].append(current_message)
            state['messages'].append({
                "role": "assistant",
                "content": str(agent_output.get('answer', agent_output))
            })
            
            # Calculate execution time
            if state.get('start_time'):
                execution_time = (time.time() - state['start_time']) * 1000
                state['execution_time_ms'] = int(execution_time)
            
            # Store interaction memory
            await self._store_interaction_memory(state, agent_name, agent_output)
            
            # Update artisan profile if needed
            user_id_str = state.get('user_id') or state.get('context', {}).get('user_id')
            if user_id_str:
                try:
                    artisan_id_uuid = UUID(user_id_str)
                    if self._should_update_profile(user_id_str):
                        await self._update_artisan_profile(artisan_id_uuid, state, agent_output)
                except Exception as e:
                    logger.warning(f"Failed to update profile check: {str(e)}")
            
            logger.info(f"{agent_name} agent completed successfully")
            return state
            
        except Exception as e:
            logger.error(f"{agent_name} agent failed: {str(e)}")
            state['error'] = str(e)
            state['agent_output'] = {
                "error": str(e),
                "agent_type": agent_name
            }
            return state
    
    async def process(
        self,
        session_id: str,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a request through the supervisor workflow.
        
        Args:
            session_id: Session identifier
            user_input: User's input
            context: Optional context dictionary
            metadata: Optional metadata dictionary
            user_id: Optional user ID
            
        Returns:
            Complete workflow result
        """
        try:
            # Build initial state
            initial_state: AgentState = {
                "session_id": session_id,
                "user_input": user_input,
                "context": context,
                "metadata": metadata,
                "user_id": user_id,
                "selected_agent": None,
                "routing_confidence": None,
                "routing_reasoning": None,
                "agent_input": None,
                "agent_output": None,
                "messages": [],  # Initialize conversation history
                "start_time": None,
                "execution_time_ms": None,
                "error": None
            }
            
            # Run the graph (memory is handled by hierarchical memory service)
            result = await self.graph.ainvoke(initial_state)
            
            # Build response
            response = {
                "supervisor_agent": {
                    "selected_agent": result.get('selected_agent'),
                    "confidence": result.get('routing_confidence'),
                    "reasoning": result.get('routing_reasoning')
                },
                "dispatched_request": {
                    "agent": result.get('selected_agent'),
                    "input_payload": result.get('agent_input')
                },
                "agent_response": result.get('agent_output', {}),
                "session_id": session_id,
                "execution_time_ms": result.get('execution_time_ms')
            }
            
            if result.get('error'):
                response['error'] = result['error']
            
            return response
            
        except Exception as e:
            logger.error(f"Supervisor workflow failed: {str(e)}")
            raise


# Global supervisor instance (lazy initialization)
_supervisor = None

def get_supervisor() -> SupervisorAgent:
    """Get or create the global supervisor instance."""
    global _supervisor
    if _supervisor is None:
        _supervisor = SupervisorAgent()
    return _supervisor

# For backward compatibility
supervisor = get_supervisor()


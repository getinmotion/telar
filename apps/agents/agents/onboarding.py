"""
Onboarding agent for maturity assessment.
"""

from agents.agents.base import BaseAgent
from src.database.supabase_client import db
from agents.core.state import OnboardingProfile
from agents.prompts import get_onboarding_prompt
from agents.helpers import calculate_maturity_level, parse_json_response, validate_onboarding_responses
from typing import Dict, Any, Optional
from uuid import UUID
import logging
import json

logger = logging.getLogger(__name__)


class OnboardingAgent(BaseAgent):
    """
    Agent for processing onboarding assessments.
    Evaluates artisan maturity across 4 categories based on 16 questions.
    """
    
    def __init__(self):
        """Initialize onboarding agent."""
        super().__init__("onboarding")
    
    def get_system_prompt(self) -> str:
        """Get the onboarding system prompt."""
        return get_onboarding_prompt()
    
    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process onboarding responses and generate maturity assessment.
        
        Args:
            user_input: JSON string or dict with question responses (Q1-Q16)
            context: Optional context with session_id and user_id
            metadata: Optional metadata with user profile info
            
        Returns:
            Onboarding assessment results
        """
        try:
            # Parse responses
            if isinstance(user_input, str):
                try:
                    responses = json.loads(user_input)
                except json.JSONDecodeError:
                    responses = parse_json_response(user_input)
            else:
                responses = user_input
            
            # Validate responses
            if not validate_onboarding_responses(responses):
                raise ValueError("Invalid onboarding responses: missing required questions (Q1-Q16)")
            
            # Build user message with responses
            user_message = self._build_assessment_message(responses)
            
            # Call LLM for assessment
            llm_response = await self._call_llm(
                user_message=user_message,
                temperature=0.3,  # Lower temperature for more consistent assessments
                max_tokens=3000
            )
            
            # Parse the structured response
            assessment = parse_json_response(llm_response)
            
            # Extract resumen if it's separate in the response
            if "resumen" not in assessment:
                # Extract resumen from the text after JSON
                lines = llm_response.split('\n')
                resumen_lines = []
                capture = False
                for line in lines:
                    if 'Resumen:' in line or 'resumen:' in line.lower():
                        capture = True
                        continue
                    if capture and line.strip():
                        resumen_lines.append(line.strip())
                
                assessment["resumen"] = ' '.join(resumen_lines) if resumen_lines else assessment.get(
                    "madurez_general", "Resumen no disponible"
                )
            
            # Calculate overall maturity if not provided
            if "madurez_general" not in assessment:
                maturity_scores = {
                    'identidad': assessment.get('madurez_identidad_artesanal', 'Inicial'),
                    'comercial': assessment.get('madurez_realidad_comercial', 'Inicial'),
                    'clientes': assessment.get('madurez_clientes_y_mercado', 'Inicial'),
                    'operacion': assessment.get('madurez_operacion_y_crecimiento', 'Inicial')
                }
                assessment["madurez_general"] = calculate_maturity_level(maturity_scores)
            
            # Save to database if context includes session_id
            if context and 'session_id' in context:
                await self._save_profile(
                    session_id=context['session_id'],
                    user_id=context.get('user_id'),
                    responses=responses,
                    assessment=assessment,
                    metadata=metadata
                )
                
                # Store as profile memory
                await self._store_onboarding_memory(
                    context=context,
                    responses=responses,
                    assessment=assessment
                )
            
            logger.info(f"Onboarding assessment completed: {assessment['madurez_general']}")
            
            # Format response in standard agent format
            # Build human-readable answer from assessment
            answer = f"""## Evaluación de Madurez Empresarial

**Nivel de Madurez General:** {assessment.get('madurez_general', 'N/A')}

### Áreas Evaluadas:

**1. Identidad Artesanal:** {assessment.get('madurez_identidad_artesanal', 'N/A')}
{assessment.get('madurez_identidad_artesanal_razon', '')}

**Tareas recomendadas:**
{assessment.get('madurez_identidad_artesanal_tareas', '')}

---

**2. Realidad Comercial:** {assessment.get('madurez_realidad_comercial', 'N/A')}
{assessment.get('madurez_realidad_comercial_razon', '')}

**Tareas recomendadas:**
{assessment.get('madurez_realidad_comercial_tareas', '')}

---

**3. Clientes y Mercado:** {assessment.get('madurez_clientes_y_mercado', 'N/A')}
{assessment.get('madurez_clientes_y_mercado_razon', '')}

**Tareas recomendadas:**
{assessment.get('madurez_clientes_y_mercado_tareas', '')}

---

**4. Operación y Crecimiento:** {assessment.get('madurez_operacion_y_crecimiento', 'N/A')}
{assessment.get('madurez_operacion_y_crecimiento_razon', '')}

**Tareas recomendadas:**
{assessment.get('madurez_operacion_y_crecimiento_tareas', '')}

---

### Resumen:
{assessment.get('resumen', 'Evaluación completada exitosamente')}
"""
            
            # Return standard format
            return {
                "agent_type": self.agent_type,
                "answer": answer,
                "assessment": assessment,  # Include full assessment for reference
                "confidence": "high",
                "maturity_level": assessment.get('madurez_general', 'N/A')
            }
            
        except Exception as e:
            logger.error(f"Onboarding processing failed: {str(e)}")
            raise
    
    def _build_assessment_message(self, responses: Dict[str, Any]) -> str:
        """
        Build the user message with formatted responses.
        
        Args:
            responses: Dictionary of question responses
            
        Returns:
            Formatted message string
        """
        message_parts = ["Respuestas del artesano al cuestionario de diagnóstico:\n"]
        
        # Group responses by category (based on preguntas_onboarding.json)
        categories = {
            "Identidad Artesanal (Q1-Q4)": ["Q1", "Q2", "Q3", "Q4"],
            "Realidad Comercial (Q5-Q8)": ["Q5", "Q6", "Q7", "Q8"],
            "Clientes y Mercado (Q9-Q12)": ["Q9", "Q10", "Q11", "Q12"],
            "Operación y Crecimiento (Q13-Q16)": ["Q13", "Q14", "Q15", "Q16"]
        }
        
        for category, questions in categories.items():
            message_parts.append(f"\n### {category}")
            for q in questions:
                if q in responses:
                    message_parts.append(f"{q}: {responses[q]}")
        
        message_parts.append("\nPor favor, analiza estas respuestas y genera la evaluación completa según las instrucciones del sistema.")
        
        return '\n'.join(message_parts)
    
    async def _save_profile(
        self,
        session_id: str,
        user_id: Optional[UUID],
        responses: Dict[str, Any],
        assessment: Dict[str, Any],
        metadata: Optional[Dict[str, Any]]
    ) -> None:
        """
        Save onboarding profile to database.
        
        Args:
            session_id: Session identifier
            user_id: Optional user ID
            responses: Raw question responses
            assessment: Assessment results
            metadata: Optional metadata with user profile
        """
        try:
            # Extract user profile from metadata
            user_profile = {}
            if metadata and 'user_profile' in metadata:
                user_profile = metadata['user_profile']
            
            profile = OnboardingProfile(
                session_id=session_id,
                user_id=user_id,
                nombre=user_profile.get('nombre'),
                ubicacion=user_profile.get('ubicacion'),
                tipo_artesania=responses.get('Q1'),  # Q1 is craft type
                madurez_identidad_artesanal=assessment['madurez_identidad_artesanal'],
                madurez_identidad_artesanal_razon=assessment['madurez_identidad_artesanal_razon'],
                madurez_identidad_artesanal_tareas=assessment['madurez_identidad_artesanal_tareas'],
                madurez_realidad_comercial=assessment['madurez_realidad_comercial'],
                madurez_realidad_comercial_razon=assessment['madurez_realidad_comercial_razon'],
                madurez_realidad_comercial_tareas=assessment['madurez_realidad_comercial_tareas'],
                madurez_clientes_y_mercado=assessment['madurez_clientes_y_mercado'],
                madurez_clientes_y_mercado_razon=assessment['madurez_clientes_y_mercado_razon'],
                madurez_clientes_y_mercado_tareas=assessment['madurez_clientes_y_mercado_tareas'],
                madurez_operacion_y_crecimiento=assessment['madurez_operacion_y_crecimiento'],
                madurez_operacion_y_crecimiento_razon=assessment['madurez_operacion_y_crecimiento_razon'],
                madurez_operacion_y_crecimiento_tareas=assessment['madurez_operacion_y_crecimiento_tareas'],
                madurez_general=assessment['madurez_general'],
                resumen=assessment['resumen'],
                raw_responses=responses,
                metadata=metadata
            )
            
            # Convert Pydantic model to dict for JSON serialization
            await db.save_onboarding_profile(profile.model_dump(mode='json'))
            logger.info(f"Saved onboarding profile for session {session_id}")
            
        except Exception as e:
            logger.error(f"Failed to save onboarding profile: {str(e)}")
            # Don't raise - saving is optional
    
    async def _store_onboarding_memory(
        self,
        context: Dict[str, Any],
        responses: Dict[str, Any],
        assessment: Dict[str, Any]
    ) -> None:
        """
        Store onboarding data as profile memory and update artisan global profile.
        
        Args:
            context: Context with user_id and session_id
            responses: Raw onboarding responses
            assessment: Assessment results
        """
        try:
            # Build profile memory content
            memory_content = f"""Perfil de Onboarding:
Tipo de artesanía: {responses.get('Q1', 'N/A')}
Madurez General: {assessment.get('madurez_general', 'N/A')}
Madurez Identidad Artesanal: {assessment.get('madurez_identidad_artesanal', 'N/A')}
Madurez Realidad Comercial: {assessment.get('madurez_realidad_comercial', 'N/A')}
Madurez Clientes y Mercado: {assessment.get('madurez_clientes_y_mercado', 'N/A')}
Madurez Operación y Crecimiento: {assessment.get('madurez_operacion_y_crecimiento', 'N/A')}
Resumen: {assessment.get('resumen', 'N/A')}"""
            
            # Store as profile memory with high importance
            await self._store_agent_memory(
                content=memory_content,
                memory_type='profile',
                context=context,
                importance_score=0.95,  # Onboarding is very important
                summary=f"Onboarding: {assessment.get('madurez_general', 'N/A')}",
                metadata={
                    'tipo_artesania': responses.get('Q1'),
                    'madurez_general': assessment.get('madurez_general')
                }
            )
            
            # Update artisan global profile if user_id available
            # Extract user_id (can be nested in context.context.user_id or direct)
            user_id_str = context.get('user_id') or context.get('context', {}).get('user_id')
            logger.info(f"📝 Attempting to create artisan profile with user_id={user_id_str}")
            if user_id_str:
                try:
                    artisan_id = UUID(user_id_str)
                    
                    # Create maturity snapshot
                    maturity_snapshot = {
                        'identidad_artesanal': assessment.get('madurez_identidad_artesanal'),
                        'realidad_comercial': assessment.get('madurez_realidad_comercial'),
                        'clientes_y_mercado': assessment.get('madurez_clientes_y_mercado'),
                        'operacion_y_crecimiento': assessment.get('madurez_operacion_y_crecimiento'),
                        'general': assessment.get('madurez_general')
                    }
                    
                    # Create key insights
                    key_insights = {
                        'tipo_artesania': responses.get('Q1'),
                        'onboarding_completed': True,
                        'maturity_levels': maturity_snapshot,
                        'top_priorities': assessment.get('madurez_identidad_artesanal_tareas', [])[:3]
                    }
                    
                    # Create profile summary
                    profile_summary = assessment.get('resumen', f"Artisan with {assessment.get('madurez_general', 'N/A')} maturity level")
                    
                    # Update global profile
                    await self.memory_service.update_artisan_profile(
                        artisan_id=artisan_id,
                        profile_summary=profile_summary,
                        key_insights=key_insights,
                        maturity_snapshot=maturity_snapshot,
                        increment_interaction=False  # Don't increment for onboarding
                    )
                    
                    logger.info(f"Created artisan global profile from onboarding for {artisan_id}")
                    
                except Exception as e:
                    logger.error(f"Failed to update artisan global profile: {str(e)}")
            
        except Exception as e:
            logger.error(f"Failed to store onboarding memory: {str(e)}")


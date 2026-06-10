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
    
    async def process_structured(
        self,
        onboarding_identity: Dict[str, Any],
        artisan_name: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process the new structured onboarding payload (flow='onboarding').

        Maps the nested blocks format to the Q1-Q16 dict that the existing
        assessment prompt understands, then transforms the result into the
        new API response format:
            { onboarding_response: { maturity_level, message, next_priority_action, ... } }

        Args:
            onboarding_identity: The payload.onboarding_identity object from the request
            artisan_name: Optional artisan display name for personalised messages
            context: Should contain session_id and user_id

        Returns:
            Dict with onboarding_response key per API spec
        """
        blocks = onboarding_identity.get("blocks") or {}
        identity = blocks.get("identity") or {}
        commercial = blocks.get("commercial_reality") or {}
        clients = blocks.get("clients_market") or {}
        operations = blocks.get("operations_growth") or {}

        def _val(block: Dict[str, Any], key: str, default: str = "") -> Any:
            """Extract the 'value' field from a question block dict."""
            q = block.get(key) or {}
            if isinstance(q, dict):
                return q.get("value", default)
            return q or default

        # Build Q1 from the five open identity questions
        q1_parts: list[str] = []
        for label, field in [
            ("Quién soy", "q1_who_you_are"),
            ("Historia de la tienda", "q1_shop_story"),
            ("Qué hago", "q1_what_you_do"),
            ("Significado", "q1_meaning"),
        ]:
            v = _val(identity, field)
            if v:
                q1_parts.append(f"{label}: {v}")
        exp = _val(identity, "q1_experience_range")
        if exp:
            q1_parts.append(f"Años de experiencia: {exp}")

        responses: Dict[str, Any] = {
            "Q1": " | ".join(q1_parts) if q1_parts else "No especificado",
            "Q2": _val(identity, "q2_product_type"),
            "Q3": _val(identity, "q3_differentiator"),
            "Q4": _val(identity, "q4_tradition"),
            "Q5": _val(commercial, "q5_price_range"),
            "Q6": _val(commercial, "q6_cost_awareness"),
            "Q7": _val(commercial, "q7_pricing_method"),
            "Q8": _val(commercial, "q8_profitability"),
            "Q9": _val(clients, "q9_main_client"),
            "Q10": _val(clients, "q10_digital_presence"),
            "Q11": _val(clients, "q11_sales_channels"),
            "Q12": _val(clients, "q12_sales_frequency"),
            "Q13": _val(operations, "q13_monthly_capacity"),
            "Q14": _val(operations, "q14_main_limitation"),
            "Q15": _val(operations, "q15_work_structure"),
            "Q16": _val(operations, "q16_immediate_priority"),
        }

        q16_value: str = str(responses.get("Q16") or "")

        # Run existing assessment using the Q1-Q16 dict
        meta = onboarding_identity.get("metadata") or {}
        user_profile = {
            "nombre": artisan_name,
            "ubicacion": meta.get("ubicacion") or meta.get("location"),
        }

        import json as _json
        assessment_result = await self.process(
            user_input=_json.dumps(responses),
            context=context,
            metadata={"user_profile": user_profile},
        )

        assessment = assessment_result.get("assessment") or {}

        # Map maturity level to the new enum values
        maturity_raw = assessment.get("madurez_general", "Inicial")
        maturity_map = {
            "Inicial": "emergente",
            "En Desarrollo": "en_desarrollo",
            "Consolidado": "consolidado",
            "Avanzado": "consolidado",
        }
        maturity_level = maturity_map.get(maturity_raw, "emergente")

        # Derive recommendations from the dimension most relevant to q16
        q16_to_dimension = {
            "mostrar_mejor_productos": "identidad_artesanal",
            "entender_precios": "realidad_comercial",
            "conseguir_clientes_online": "clientes_y_mercado",
            "mejorar_proceso_produccion": "operacion_y_crecimiento",
            "conseguir_mas_ventas": "clientes_y_mercado",
            "formalizar_negocio": "operacion_y_crecimiento",
        }
        dimension_key = q16_to_dimension.get(q16_value, "identidad_artesanal")
        tasks_key = f"madurez_{dimension_key}_tareas"
        raw_tasks = assessment.get(tasks_key, [])

        if isinstance(raw_tasks, list):
            recommendations = [str(t) for t in raw_tasks[:3]]
        else:
            recommendations = [
                line.strip()
                for line in str(raw_tasks).split("\n")
                if line.strip()
            ][:3]

        if not recommendations:
            recommendations = [
                "Completa tu perfil con más detalles sobre tu artesanía",
                "Agrega fotos de calidad a tus productos",
                "Define los precios con nuestra calculadora",
            ]

        # Build a friendly, motivational welcome message via a dedicated prompt
        title, body = await self._generate_welcome_message(
            artisan_name=artisan_name,
            maturity_level=maturity_level,
            assessment=assessment,
            q16_value=q16_value,
            recommendations=recommendations,
        )

        from agents.helpers import format_timestamp
        return {
            "onboarding_response": {
                "metadata": {
                    "artisan_id": (context or {}).get("user_id"),
                    "processed_at": format_timestamp(),
                    "form_version": meta.get("form_version", "1.0.0"),
                },
                "status": {
                    "code": "success",
                    "onboarding_complete": True,
                },
                "maturity_level": maturity_level,
                "message": {
                    "title": title,
                    "body": body,
                },
                "next_priority_action": {
                    "based_on_q16": q16_value,
                    "recommendations": recommendations,
                },
            }
        }

    _Q16_LABELS = {
        "mostrar_mejor_productos": "mostrar mejor tus productos",
        "entender_precios": "entender y definir tus precios",
        "conseguir_clientes_online": "conseguir clientes en internet",
        "mejorar_proceso_produccion": "mejorar tu proceso de producción",
        "conseguir_mas_ventas": "conseguir más ventas",
        "formalizar_negocio": "formalizar tu negocio",
    }

    async def _generate_welcome_message(
        self,
        artisan_name: Optional[str],
        maturity_level: str,
        assessment: Dict[str, Any],
        q16_value: str,
        recommendations: list[str],
    ) -> tuple[str, str]:
        """
        Generate a friendly, motivational welcome message (title + body) for the
        onboarding result screen, based on the technical assessment.

        Falls back to a simple templated message if the LLM call fails.
        """
        from agents.prompts import get_onboarding_welcome_message_prompt
        from agents.helpers import parse_json_response

        name_part = f", {artisan_name}" if artisan_name else ""
        fallback_title = f"¡Tu perfil está listo{name_part}!"
        fallback_body = (
            assessment.get("resumen")
            or "Tu perfil artesanal ha sido evaluado exitosamente."
        )

        try:
            next_priority_label = self._Q16_LABELS.get(q16_value, q16_value or "hacer crecer tu negocio")
            recommendations_list = "\n".join(f"- {r}" for r in recommendations)

            system_prompt = get_onboarding_welcome_message_prompt({
                "artisan_name": artisan_name,
                "maturity_level": maturity_level,
                "resumen_tecnico": assessment.get("resumen", ""),
                "next_priority_label": next_priority_label,
                "recommendations_list": recommendations_list,
            })

            raw = await self._call_llm(
                user_message="Genera el mensaje de bienvenida según las instrucciones del sistema.",
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=500,
            )
            parsed = parse_json_response(raw)
            title = parsed.get("title") or fallback_title
            body = parsed.get("body") or fallback_body
            return title, body
        except Exception as e:
            logger.error(f"Failed to generate onboarding welcome message: {str(e)}")
            return fallback_title, fallback_body

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


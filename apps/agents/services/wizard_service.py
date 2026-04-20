"""
Wizard service for step-by-step guided forms.
Currently implements the Return Policy Wizard (Wizard de Políticas de Devolución).
"""

from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


RETURN_POLICY_STEPS = [
    {
        "step": 1,
        "field": "plazo_dias",
        "question": "¿Cuántos días tiene el cliente para solicitar una devolución desde que recibe el producto?",
        "hint": "Ejemplo: 15 días, 30 días. Lo habitual en Colombia es entre 5 y 30 días.",
    },
    {
        "step": 2,
        "field": "condicion_producto",
        "question": "¿En qué condición debe estar el producto para aceptar la devolución?",
        "hint": "Ejemplo: sin uso, en su empaque original, con etiquetas, sin daños por mal uso.",
    },
    {
        "step": 3,
        "field": "costo_envio_devolucion",
        "question": "¿Quién asume el costo del envío de devolución?",
        "hint": "Opciones típicas: el cliente, la tienda, o compartido según la causa (defecto vs arrepentimiento).",
    },
    {
        "step": 4,
        "field": "tipo_solucion",
        "question": "¿Qué soluciones ofreces al cliente? Selecciona las que apliquen.",
        "hint": "Ejemplo: reembolso total, cambio por otro producto, crédito para próxima compra.",
    },
    {
        "step": 5,
        "field": "tiempo_procesamiento",
        "question": "¿Cuántos días hábiles tomas para procesar y resolver la devolución?",
        "hint": "Ejemplo: 3-5 días hábiles. Sé realista según tu capacidad.",
    },
]

TOTAL_STEPS = len(RETURN_POLICY_STEPS)


class ReturnPolicyWizard:
    """
    Manages the state and progression of the return policy wizard.
    All state lives in the caller's context dict (stateless service).
    """

    def get_current_step(self, wizard_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Return the next unanswered step definition, or None if complete."""
        for step_def in RETURN_POLICY_STEPS:
            if step_def["field"] not in wizard_data:
                return step_def
        return None  # All steps answered

    def advance(self, wizard_data: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """
        Record the user's answer for the current step and return updated wizard_data.

        Args:
            wizard_data: Current accumulated answers
            user_answer: Raw user answer for the current step

        Returns:
            Updated wizard_data with the new answer stored
        """
        current_step = self.get_current_step(wizard_data)
        if current_step is None:
            return wizard_data  # Already complete

        updated = wizard_data.copy()
        updated[current_step["field"]] = user_answer.strip()
        return updated

    def is_complete(self, wizard_data: Dict[str, Any]) -> bool:
        """Return True if all steps have been answered."""
        return all(step["field"] in wizard_data for step in RETURN_POLICY_STEPS)

    def generate_policy_document(self, wizard_data: Dict[str, Any], artisan_name: str = "") -> str:
        """
        Generate a formatted return policy document from the completed wizard data.

        Args:
            wizard_data: Completed wizard answers
            artisan_name: Optional artisan/store name

        Returns:
            Formatted policy text in Spanish
        """
        store_ref = f"de {artisan_name}" if artisan_name else "de nuestra tienda"
        plazo = wizard_data.get("plazo_dias", "N/A")
        condicion = wizard_data.get("condicion_producto", "N/A")
        costo_envio = wizard_data.get("costo_envio_devolucion", "N/A")
        soluciones = wizard_data.get("tipo_solucion", "N/A")
        tiempo = wizard_data.get("tiempo_procesamiento", "N/A")

        policy = f"""# Política de Devoluciones {store_ref.title()}

## 1. Plazo para solicitar devoluciones
Los clientes tienen **{plazo}** calendario(s) a partir de la fecha de recepción del producto para solicitar una devolución o cambio.

## 2. Condición del producto
Para aceptar una devolución, el producto debe estar: {condicion}.

## 3. Proceso de devolución
1. El cliente debe contactarnos por nuestro canal de atención para solicitar la devolución.
2. Se evaluará el caso y se dará respuesta en un plazo de **{tiempo}** hábil(es).
3. Una vez aprobada la devolución, se coordinarán los pasos para el envío.

## 4. Costos de envío
{costo_envio}.

## 5. Soluciones disponibles
Ofrecemos las siguientes opciones: {soluciones}.

## 6. Excepciones
No se aceptan devoluciones en los siguientes casos:
- Productos personalizados o hechos a medida (salvo defecto de fabricación).
- Productos con signos evidentes de uso inadecuado.
- Solicitudes realizadas fuera del plazo establecido.

## 7. Contáctanos
Si tienes preguntas sobre esta política, comunícate con nosotros a través de nuestro canal de atención al cliente.

---
*Esta política de devoluciones fue generada con el asistente de Telar.*
"""
        return policy.strip()

    def build_response(
        self,
        wizard_data: Dict[str, Any],
        user_answer: Optional[str] = None,
        artisan_name: str = "",
    ) -> Dict[str, Any]:
        """
        Main entry point: advance the wizard and return the next response structure.

        Args:
            wizard_data: Current wizard_data from context (may be empty dict for first call)
            user_answer: User's answer for the current step (None on first call)
            artisan_name: Optional artisan name for the final document

        Returns:
            Dict with wizard_active, wizard_step, wizard_question, wizard_data,
            wizard_complete, policy_document, answer
        """
        # If there's an answer, record it
        if user_answer:
            wizard_data = self.advance(wizard_data, user_answer)

        complete = self.is_complete(wizard_data)

        if complete:
            policy_doc = self.generate_policy_document(wizard_data, artisan_name)
            return {
                "wizard_active": True,
                "wizard_complete": True,
                "wizard_step": None,
                "wizard_question": None,
                "wizard_data": wizard_data,
                "policy_document": policy_doc,
                "answer": (
                    "¡Excelente! Tu política de devoluciones está lista. "
                    "Puedes copiarla y publicarla en tu tienda o compartirla con tus clientes."
                ),
            }

        next_step = self.get_current_step(wizard_data)
        steps_done = sum(1 for s in RETURN_POLICY_STEPS if s["field"] in wizard_data)

        if steps_done == 0:
            intro = (
                "Voy a ayudarte a crear tu política de devoluciones paso a paso. "
                f"Son {TOTAL_STEPS} preguntas rápidas. ¡Empecemos!\n\n"
            )
        else:
            intro = ""

        return {
            "wizard_active": True,
            "wizard_complete": False,
            "wizard_step": next_step["step"],
            "wizard_question": next_step["question"],
            "wizard_hint": next_step["hint"],
            "wizard_data": wizard_data,
            "wizard_progress": f"{steps_done}/{TOTAL_STEPS}",
            "policy_document": None,
            "answer": f"{intro}**Pregunta {next_step['step']} de {TOTAL_STEPS}:** {next_step['question']}\n\n💡 *{next_step['hint']}*",
        }


# Global singleton
return_policy_wizard = ReturnPolicyWizard()

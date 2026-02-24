import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { TaskStep } from '@/hooks/_deprecated/types/taskStepTypes';

interface StepGuideCardProps {
  step: TaskStep;
}

const getStepGuidance = (title: string, description: string) => {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  if (titleLower.includes('características') || titleLower.includes('features')) {
    return {
      purpose: "Identificar qué hace únicos tus productos o servicios",
      examples: [
        "Materiales: ¿Usas materiales especiales o de alta calidad?",
        "Proceso: ¿Tienes una técnica única de fabricación?",
        "Diseño: ¿Qué estilo o estética te caracteriza?",
        "Personalización: ¿Ofreces productos hechos a medida?"
      ],
      tip: "Piensa en lo que tus clientes mencionan cuando hablan de ti. ¿Qué los hace elegirte a ti en lugar de la competencia?"
    };
  }
  
  if (titleLower.includes('beneficios') || titleLower.includes('benefits')) {
    return {
      purpose: "Explicar cómo tus productos mejoran la vida de tus clientes",
      examples: [
        "Ahorro de tiempo: ¿Les facilitas alguna tarea?",
        "Experiencia emocional: ¿Cómo se sienten al usar tus productos?",
        "Solución de problemas: ¿Qué problema específico resuelves?",
        "Estatus o imagen: ¿Cómo mejoras su imagen personal?"
      ],
      tip: "No describas QUÉ haces, sino CÓMO beneficia a tus clientes. Enfócate en el resultado final que obtienen."
    };
  }
  
  if (titleLower.includes('precio') || titleLower.includes('pricing')) {
    return {
      purpose: "Definir una estrategia de precios rentable y competitiva",
      examples: [
        "Costos: Materiales + tiempo + margen de ganancia",
        "Mercado: ¿Cuánto cobran productos similares?",
        "Valor percibido: ¿Justifica el precio la calidad?",
        "Posicionamiento: ¿Eres premium, accesible o económico?"
      ],
      tip: "Considera el valor que entregas, no solo los costos. Un producto único puede justificar un precio más alto."
    };
  }
  
  return {
    purpose: "Completar este paso te acercará a tu objetivo de negocio",
    examples: [
      "Sé específico y concreto en tus respuestas",
      "Piensa en ejemplos reales de tu experiencia",
      "Considera qué dirían tus clientes actuales",
      "Enfócate en lo que te hace diferente"
    ],
    tip: "Tómate tu tiempo para reflexionar. Una buena respuesta aquí mejorará significativamente tu resultado final."
  };
};

export const StepGuideCard: React.FC<StepGuideCardProps> = ({ step }) => {
  const guidance = getStepGuidance(step.title, step.description);

  return (
    <Card className="bg-amber-50/50 border-amber-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-sm text-amber-800">Guía para este paso</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-amber-900 mb-2">
            {guidance.purpose}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-800">Ejemplos de qué incluir:</p>
          <ul className="space-y-1">
            {guidance.examples.map((example, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-amber-700">
                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-2 border-t border-amber-200">
          <p className="text-xs text-amber-600 font-medium">
            💡 {guidance.tip}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
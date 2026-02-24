
import { Question } from '../types';

export const getIdeaQuestions = (language: 'en' | 'es'): Question[] => {
  // 12 preguntas universales en 4 áreas para emprendedores con idea
  const translations = {
    es: {
      // === ÁREA 1: VALIDACIÓN DE IDEA (3 preguntas) ===
      valueProposition: {
        question: "¿Qué tan clara tenés tu propuesta de valor?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Muy clara, puedo explicarla en 1 minuto', value: 10 },
          { text: 'Tengo una idea general', value: 6 },
          { text: 'Todavía la estoy definiendo', value: 3 }
        ]
      },
      problemUnderstanding: {
        question: "¿Qué tan bien entendés el problema que querés resolver?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Lo viví personalmente o hablé con muchas personas', value: 10 },
          { text: 'Tengo una idea del problema', value: 6 },
          { text: 'Es una intuición que tengo', value: 3 }
        ]
      },
      competition: {
        question: "¿Conocés quién más ofrece soluciones similares?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Sí, investigué la competencia', value: 10 },
          { text: 'Conozco algunos competidores', value: 6 },
          { text: 'No investigué aún', value: 2 }
        ]
      },
      
      // === ÁREA 2: EXPERIENCIA DE USUARIO (3 preguntas) ===
      userContact: {
        question: "¿Ya hablaste con personas que podrían ser tus clientes?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, con varias personas', value: 10 },
          { text: 'Con algunas', value: 6 },
          { text: 'Todavía no', value: 2 }
        ]
      },
      needsUnderstanding: {
        question: "¿Qué tan bien entendés lo que necesitan tus potenciales clientes?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Hice entrevistas y tomé notas', value: 10 },
          { text: 'Tengo una idea general', value: 6 },
          { text: 'Asumo lo que necesitan', value: 3 }
        ]
      },
      prototype: {
        question: "¿Tenés alguna versión inicial de tu producto/servicio?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, un prototipo funcional', value: 10 },
          { text: 'Bocetos o ideas escritas', value: 6 },
          { text: 'Todavía no', value: 2 }
        ]
      },
      
      // === ÁREA 3: AJUSTE AL MERCADO (3 preguntas) ===
      marketSize: {
        question: "¿Cuántas personas crees que necesitan tu solución?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Investigué y tengo números estimados', value: 10 },
          { text: 'Tengo una idea aproximada', value: 6 },
          { text: 'No sé aún', value: 2 }
        ]
      },
      targetCustomer: {
        question: "¿Definiste quién es tu cliente ideal?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, tengo un perfil claro', value: 10 },
          { text: 'Tengo una idea general', value: 6 },
          { text: 'Todavía no lo definí', value: 3 }
        ]
      },
      demandValidation: {
        question: "¿Cómo sabés que hay demanda para tu solución?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Personas me preguntaron cuándo estará listo', value: 10 },
          { text: 'Vi que hay productos similares vendiéndose', value: 6 },
          { text: 'Es una suposición', value: 3 }
        ]
      },
      
      // === ÁREA 4: MONETIZACIÓN (3 preguntas) ===
      revenueModel: {
        question: "¿Ya pensaste cómo vas a generar ingresos?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, tengo un modelo definido', value: 10 },
          { text: 'Tengo algunas ideas', value: 6 },
          { text: 'No lo pensé aún', value: 2 }
        ]
      },
      pricing: {
        question: "¿Sabés cuánto estarían dispuestos a pagar tus clientes?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, les pregunté directamente', value: 10 },
          { text: 'Miré precios de competidores', value: 6 },
          { text: 'Tengo que investigar', value: 3 }
        ]
      },
      costs: {
        question: "¿Estimaste cuánto te costaría lanzar tu proyecto?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, tengo un presupuesto', value: 10 },
          { text: 'Tengo una idea general', value: 6 },
          { text: 'No lo calculé', value: 2 }
        ]
      }
    }
  };

  const t = translations['es'];
  const questionKeys = [
    // Área 1: Validación de Idea
    'valueProposition', 'problemUnderstanding', 'competition',
    // Área 2: Experiencia de Usuario
    'userContact', 'needsUnderstanding', 'prototype',
    // Área 3: Ajuste al Mercado
    'marketSize', 'targetCustomer', 'demandValidation',
    // Área 4: Monetización
    'revenueModel', 'pricing', 'costs'
  ];

  return questionKeys.map((key) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `idea_${key}`,
      question: questionData.question,
      type: questionData.type as 'radio' | 'checkbox',
      category: questionData.category as 'ideaValidation' | 'userExperience' | 'marketFit' | 'monetization',
      options: questionData.options.map((opt: any, optIndex: number) => ({
        id: `${key}_${optIndex}`,
        text: opt.text,
        value: opt.value
      }))
    };
  });
};

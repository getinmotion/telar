
import { Question } from '../types';

export const getTeamQuestions = (language: 'en' | 'es'): Question[] => {
  // 12 preguntas universales en 4 áreas para equipos/colectivos
  const translations = {
    es: {
      // === ÁREA 1: VALIDACIÓN DE IDEA (3 preguntas) ===
      sharedVision: {
        question: "¿Todo el equipo tiene clara la propuesta de valor?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Sí, todos pueden explicarla igual', value: 10 },
          { text: 'Hay consenso general', value: 6 },
          { text: 'Cada uno tiene su versión', value: 3 }
        ]
      },
      problemAlignment: {
        question: "¿El equipo está alineado sobre qué problema resuelven?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Completamente alineados', value: 10 },
          { text: 'Hay coincidencias generales', value: 6 },
          { text: 'Hay visiones diferentes', value: 3 }
        ]
      },
      marketPosition: {
        question: "¿El equipo conoce su competencia y diferenciadores?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Sí, lo analizamos juntos', value: 10 },
          { text: 'Algunos lo conocen', value: 6 },
          { text: 'No lo hemos discutido', value: 2 }
        ]
      },
      
      // === ÁREA 2: EXPERIENCIA DE USUARIO (3 preguntas) ===
      customerInsights: {
        question: "¿El equipo comparte información sobre los clientes?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, tenemos un sistema para compartir feedback', value: 10 },
          { text: 'Lo comentamos informalmente', value: 6 },
          { text: 'Cada uno maneja su relación por separado', value: 3 }
        ]
      },
      customerSatisfaction: {
        question: "¿Miden la satisfacción de sus clientes?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, sistemáticamente', value: 10 },
          { text: 'De vez en cuando', value: 6 },
          { text: 'No lo medimos', value: 2 }
        ]
      },
      iterationProcess: {
        question: "¿El equipo mejora su producto/servicio basándose en feedback?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, tenemos reuniones regulares para esto', value: 10 },
          { text: 'Lo hacemos ocasionalmente', value: 6 },
          { text: 'No tenemos proceso definido', value: 2 }
        ]
      },
      
      // === ÁREA 3: AJUSTE AL MERCADO (3 preguntas) ===
      growthStrategy: {
        question: "¿El equipo tiene una estrategia de crecimiento definida?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, con plan y objetivos claros', value: 10 },
          { text: 'Tenemos ideas generales', value: 6 },
          { text: 'No tenemos estrategia', value: 3 }
        ]
      },
      salesPerformance: {
        question: "¿Monitorean el desempeño de ventas juntos?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, revisamos métricas regularmente', value: 10 },
          { text: 'Lo revisamos ocasionalmente', value: 6 },
          { text: 'No llevamos seguimiento conjunto', value: 3 }
        ]
      },
      marketExpansion: {
        question: "¿Están explorando nuevos mercados o segmentos?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, activamente', value: 10 },
          { text: 'Lo hemos conversado', value: 6 },
          { text: 'No lo hemos considerado', value: 2 }
        ]
      },
      
      // === ÁREA 4: MONETIZACIÓN (3 preguntas) ===
      financialTransparency: {
        question: "¿El equipo tiene claridad sobre las finanzas del proyecto?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, total transparencia y reportes regulares', value: 10 },
          { text: 'Compartimos información básica', value: 6 },
          { text: 'No hay transparencia financiera', value: 2 }
        ]
      },
      revenueDistribution: {
        question: "¿Tienen un modelo claro de distribución de ingresos?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, definido y documentado', value: 10 },
          { text: 'Hay acuerdos informales', value: 6 },
          { text: 'No está definido', value: 3 }
        ]
      },
      financialGoals: {
        question: "¿El equipo tiene metas financieras compartidas?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, metas claras que revisamos juntos', value: 10 },
          { text: 'Tenemos objetivos generales', value: 6 },
          { text: 'No tenemos metas definidas', value: 2 }
        ]
      }
    }
  };

  const t = translations['es'];
  const questionKeys = [
    // Área 1: Validación de Idea
    'sharedVision', 'problemAlignment', 'marketPosition',
    // Área 2: Experiencia de Usuario
    'customerInsights', 'customerSatisfaction', 'iterationProcess',
    // Área 3: Ajuste al Mercado
    'growthStrategy', 'salesPerformance', 'marketExpansion',
    // Área 4: Monetización
    'financialTransparency', 'revenueDistribution', 'financialGoals'
  ];

  return questionKeys.map((key) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `team_${key}`,
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

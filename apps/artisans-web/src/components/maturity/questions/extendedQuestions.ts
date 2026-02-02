
import { Question } from '../types';

export const getExtendedIdeaQuestions = (language: 'en' | 'es'): Question[] => {
  const translations = {
    en: {
      validation: {
        question: "Have you validated your idea with potential customers?",
        options: [
          { text: 'Not yet', value: 1 },
          { text: 'Some informal feedback', value: 2 },
          { text: 'Formal validation process', value: 3 }
        ]
      },
      competition: {
        question: "How well do you understand your competition?",
        options: [
          { text: 'No research done', value: 1 },
          { text: 'Basic understanding', value: 2 },
          { text: 'Detailed competitive analysis', value: 3 }
        ]
      },
      monetization: {
        question: "Do you have a clear monetization strategy?",
        options: [
          { text: 'No clear plan', value: 1 },
          { text: 'General ideas', value: 2 },
          { text: 'Detailed strategy', value: 3 }
        ]
      },
      timeline: {
        question: "Have you set realistic timelines for launch?",
        options: [
          { text: 'No timeline set', value: 1 },
          { text: 'Rough timeline', value: 2 },
          { text: 'Detailed project plan', value: 3 }
        ]
      },
      risks: {
        question: "Have you identified potential risks and challenges?",
        options: [
          { text: 'Not considered', value: 1 },
          { text: 'Some awareness', value: 2 },
          { text: 'Comprehensive risk analysis', value: 3 }
        ]
      }
    },
    es: {
      validation: {
        question: "¿Has validado tu idea con potenciales clientes?",
        options: [
          { text: 'Aún no', value: 1 },
          { text: 'Algunos comentarios informales', value: 2 },
          { text: 'Proceso formal de validación', value: 3 }
        ]
      },
      competition: {
        question: "¿Qué tan bien entiendes a tu competencia?",
        options: [
          { text: 'No he investigado', value: 1 },
          { text: 'Entendimiento básico', value: 2 },
          { text: 'Análisis competitivo detallado', value: 3 }
        ]
      },
      monetization: {
        question: "¿Tienes una estrategia clara de monetización?",
        options: [
          { text: 'No hay plan claro', value: 1 },
          { text: 'Ideas generales', value: 2 },
          { text: 'Estrategia detallada', value: 3 }
        ]
      },
      timeline: {
        question: "¿Has establecido cronogramas realistas para el lanzamiento?",
        options: [
          { text: 'No hay cronograma', value: 1 },
          { text: 'Cronograma aproximado', value: 2 },
          { text: 'Plan de proyecto detallado', value: 3 }
        ]
      },
      risks: {
        question: "¿Has identificado riesgos y desafíos potenciales?",
        options: [
          { text: 'No considerado', value: 1 },
          { text: 'Algo de conciencia', value: 2 },
          { text: 'Análisis integral de riesgos', value: 3 }
        ]
      }
    }
  };

  const t = translations[language];
  const questionKeys = ['validation', 'competition', 'monetization', 'timeline', 'risks'];

  return questionKeys.map((key, index) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `extended_idea_${key}`,
      question: questionData.question,
      type: 'radio' as const,
      category: 'ideaValidation' as const,
      options: questionData.options.map((opt: any, optIndex: number) => ({
        id: `${key}_${optIndex}`,
        text: opt.text,
        value: opt.value
      }))
    };
  });
};

export const getExtendedSoloQuestions = (language: 'en' | 'es'): Question[] => {
  const translations = {
    en: {
      pricing: {
        question: "How do you set your prices?",
        options: [
          { text: 'By feeling/intuition', value: 1 },
          { text: 'Based on costs', value: 2 },
          { text: 'Market research & value', value: 3 }
        ]
      },
      clients: {
        question: "How do you acquire new clients?",
        options: [
          { text: 'Word of mouth only', value: 1 },
          { text: 'Some marketing efforts', value: 2 },
          { text: 'Systematic marketing strategy', value: 3 }
        ]
      },
      scaling: {
        question: "Are you planning to scale your business?",
        options: [
          { text: 'No clear plans', value: 1 },
          { text: 'Considering options', value: 2 },
          { text: 'Clear scaling strategy', value: 3 }
        ]
      },
      tools: {
        question: "What business tools do you currently use?",
        options: [
          { text: 'Basic tools (WhatsApp, email)', value: 1 },
          { text: 'Some specialized software', value: 2 },
          { text: 'Integrated business suite', value: 3 }
        ]
      },
      networking: {
        question: "How active are you in professional networks?",
        options: [
          { text: 'Not very active', value: 1 },
          { text: 'Participate occasionally', value: 2 },
          { text: 'Active community member', value: 3 }
        ]
      }
    },
    es: {
      pricing: {
        question: "¿Cómo establecés tus precios?",
        options: [
          { text: 'Por sensación/intuición', value: 1 },
          { text: 'Basado en costos', value: 2 },
          { text: 'Investigación de mercado y valor', value: 3 }
        ]
      },
      clients: {
        question: "¿Cómo conseguís nuevos clientes?",
        options: [
          { text: 'Solo boca a boca', value: 1 },
          { text: 'Algunos esfuerzos de marketing', value: 2 },
          { text: 'Estrategia sistemática de marketing', value: 3 }
        ]
      },
      scaling: {
        question: "¿Planeas escalar tu negocio?",
        options: [
          { text: 'No hay planes claros', value: 1 },
          { text: 'Considerando opciones', value: 2 },
          { text: 'Estrategia clara de escalamiento', value: 3 }
        ]
      },
      tools: {
        question: "¿Qué herramientas de negocio usás actualmente?",
        options: [
          { text: 'Herramientas básicas (WhatsApp, email)', value: 1 },
          { text: 'Algún software especializado', value: 2 },
          { text: 'Suite integrada de negocio', value: 3 }
        ]
      },
      networking: {
        question: "¿Qué tan activo sos en redes profesionales?",
        options: [
          { text: 'No muy activo', value: 1 },
          { text: 'Participo ocasionalmente', value: 2 },
          { text: 'Miembro activo de la comunidad', value: 3 }
        ]
      }
    }
  };

  const t = translations[language];
  const questionKeys = ['pricing', 'clients', 'scaling', 'tools', 'networking'];

  return questionKeys.map((key, index) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `extended_solo_${key}`,
      question: questionData.question,
      type: 'radio' as const,
      category: 'ideaValidation' as const,
      options: questionData.options.map((opt: any, optIndex: number) => ({
        id: `${key}_${optIndex}`,
        text: opt.text,
        value: opt.value
      }))
    };
  });
};

export const getExtendedTeamQuestions = (language: 'en' | 'es'): Question[] => {
  const translations = {
    en: {
      communication: {
        question: "How does your team communicate internally?",
        options: [
          { text: 'Informal chats', value: 1 },
          { text: 'Regular meetings', value: 2 },
          { text: 'Structured communication systems', value: 3 }
        ]
      },
      decisionMaking: {
        question: "How are decisions made in your team?",
        options: [
          { text: 'One person decides', value: 1 },
          { text: 'Informal consensus', value: 2 },
          { text: 'Formal decision processes', value: 3 }
        ]
      },
      growth: {
        question: "How do you plan team growth?",
        options: [
          { text: 'No formal planning', value: 1 },
          { text: 'Basic hiring plans', value: 2 },
          { text: 'Strategic workforce planning', value: 3 }
        ]
      },
      performance: {
        question: "How do you measure team performance?",
        options: [
          { text: 'No formal metrics', value: 1 },
          { text: 'Basic tracking', value: 2 },
          { text: 'Comprehensive KPIs', value: 3 }
        ]
      },
      culture: {
        question: "How developed is your organizational culture?",
        options: [
          { text: 'Emerging culture', value: 1 },
          { text: 'Some shared values', value: 2 },
          { text: 'Strong, defined culture', value: 3 }
        ]
      }
    },
    es: {
      communication: {
        question: "¿Cómo se comunica tu equipo internamente?",
        options: [
          { text: 'Chats informales', value: 1 },
          { text: 'Reuniones regulares', value: 2 },
          { text: 'Sistemas estructurados de comunicación', value: 3 }
        ]
      },
      decisionMaking: {
        question: "¿Cómo se toman las decisiones en tu equipo?",
        options: [
          { text: 'Una persona decide', value: 1 },
          { text: 'Consenso informal', value: 2 },
          { text: 'Procesos formales de decisión', value: 3 }
        ]
      },
      growth: {
        question: "¿Cómo planean el crecimiento del equipo?",
        options: [
          { text: 'No hay planificación formal', value: 1 },
          { text: 'Planes básicos de contratación', value: 2 },
          { text: 'Planificación estratégica de recursos humanos', value: 3 }
        ]
      },
      performance: {
        question: "¿Cómo miden el rendimiento del equipo?",
        options: [
          { text: 'No hay métricas formales', value: 1 },
          { text: 'Seguimiento básico', value: 2 },
          { text: 'KPIs integrales', value: 3 }
        ]
      },
      culture: {
        question: "¿Qué tan desarrollada está tu cultura organizacional?",
        options: [
          { text: 'Cultura emergente', value: 1 },
          { text: 'Algunos valores compartidos', value: 2 },
          { text: 'Cultura fuerte y definida', value: 3 }
        ]
      }
    }
  };

  const t = translations[language];
  const questionKeys = ['communication', 'decisionMaking', 'growth', 'performance', 'culture'];

  return questionKeys.map((key, index) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `extended_team_${key}`,
      question: questionData.question,
      type: 'radio' as const,
      category: 'ideaValidation' as const,
      options: questionData.options.map((opt: any, optIndex: number) => ({
        id: `${key}_${optIndex}`,
        text: opt.text,
        value: opt.value
      }))
    };
  });
};

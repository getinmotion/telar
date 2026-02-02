
import { Question } from '../types';

export const getSoloQuestions = (language: 'en' | 'es'): Question[] => {
  // 12 preguntas universales en 4 áreas para emprendedores que ya venden
  const translations = {
    es: {
      // === ÁREA 1: VALIDACIÓN DE IDEA (3 preguntas) ===
      uniqueValue: {
        question: "¿Qué hace único a tu producto/servicio?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Tengo algo que me diferencia claramente', value: 10 },
          { text: 'Ofrezco calidad similar a otros', value: 6 },
          { text: 'No sé qué me diferencia', value: 3 }
        ]
      },
      customerFeedback: {
        question: "¿Tus clientes te dicen por qué te eligen?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Sí, me lo comentan seguido', value: 10 },
          { text: 'Algunas veces', value: 6 },
          { text: 'No les pregunto', value: 2 }
        ]
      },
      competitiveAdvantage: {
        question: "¿Monitoreás lo que hace tu competencia?",
        type: 'radio',
        category: 'ideaValidation',
        options: [
          { text: 'Sí, regularmente', value: 10 },
          { text: 'De vez en cuando', value: 6 },
          { text: 'No lo hago', value: 2 }
        ]
      },
      
      // === ÁREA 2: EXPERIENCIA DE USUARIO (3 preguntas) ===
      customerRelationship: {
        question: "¿Cómo es tu relación con tus clientes?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Mantengo contacto regular, conozco sus necesidades', value: 10 },
          { text: 'Hablo con ellos cuando compran', value: 6 },
          { text: 'Casi no interactúo', value: 3 }
        ]
      },
      repeatCustomers: {
        question: "¿Tenés clientes que te compran más de una vez?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, muchos son recurrentes', value: 10 },
          { text: 'Algunos vuelven', value: 6 },
          { text: 'La mayoría compra una vez', value: 3 }
        ]
      },
      improvementProcess: {
        question: "¿Mejorás tu producto/servicio basándote en comentarios?",
        type: 'radio',
        category: 'userExperience',
        options: [
          { text: 'Sí, constantemente', value: 10 },
          { text: 'De vez en cuando', value: 6 },
          { text: 'No lo hago', value: 2 }
        ]
      },
      
      // === ÁREA 3: AJUSTE AL MERCADO (3 preguntas) ===
      salesChannels: {
        question: "¿Por cuántos canales vendés?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: '3 o más canales activos', value: 10 },
          { text: '1-2 canales', value: 6 },
          { text: 'Solo un canal', value: 3 }
        ]
      },
      marketGrowth: {
        question: "¿Tus ventas están creciendo?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, consistentemente', value: 10 },
          { text: 'Se mantienen estables', value: 6 },
          { text: 'Están bajando o son muy irregulares', value: 3 }
        ]
      },
      referrals: {
        question: "¿Tus clientes te recomiendan?",
        type: 'radio',
        category: 'marketFit',
        options: [
          { text: 'Sí, me traen nuevos clientes seguido', value: 10 },
          { text: 'Algunas veces', value: 6 },
          { text: 'No sé si me recomiendan', value: 2 }
        ]
      },
      
      // === ÁREA 4: MONETIZACIÓN (3 preguntas) ===
      profitability: {
        question: "¿Sabés si estás ganando plata o perdiendo?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, llevo control de ingresos y gastos', value: 10 },
          { text: 'Tengo una idea aproximada', value: 6 },
          { text: 'No lo tengo claro', value: 2 }
        ]
      },
      pricingStrategy: {
        question: "¿Cómo definís tus precios?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Calculo costos + margen de ganancia', value: 10 },
          { text: 'Me baso en precios de mercado', value: 6 },
          { text: 'Pongo lo que me parece justo', value: 3 }
        ]
      },
      financialGoals: {
        question: "¿Tenés metas financieras para tu emprendimiento?",
        type: 'radio',
        category: 'monetization',
        options: [
          { text: 'Sí, metas claras y las monitoreo', value: 10 },
          { text: 'Tengo objetivos generales', value: 6 },
          { text: 'No tengo metas definidas', value: 2 }
        ]
      }
    }
  };

  const t = translations['es'];
  const questionKeys = [
    // Área 1: Validación de Idea
    'uniqueValue', 'customerFeedback', 'competitiveAdvantage',
    // Área 2: Experiencia de Usuario
    'customerRelationship', 'repeatCustomers', 'improvementProcess',
    // Área 3: Ajuste al Mercado
    'salesChannels', 'marketGrowth', 'referrals',
    // Área 4: Monetización
    'profitability', 'pricingStrategy', 'financialGoals'
  ];

  return questionKeys.map((key) => {
    const questionData = t[key as keyof typeof t];
    return {
      id: `solo_${key}`,
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

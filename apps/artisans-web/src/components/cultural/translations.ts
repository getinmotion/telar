
import { CulturalAgentTranslations, ArtisanCraftTranslations, CategoryTranslations, ButtonTranslations } from './types';

export const agentTranslations: Record<string, CulturalAgentTranslations> = {
  costCalculator: {
    title: "Calculadora de Costos y Rentabilidad",
    description: "Calcula el costo real y la rentabilidad de tus creaciones artesanales"
  },
  contractGenerator: {
    title: "Generador de Contratos",
    description: "Crea contratos profesionales para tu trabajo artesanal"
  },
  maturityEvaluator: {
    title: "Evaluador de Madurez de Negocio Artesanal",
    description: "Evalúa el nivel de madurez de tu negocio artesanal"
  },
  exportAdvisor: {
    title: "Asesor de Exportación",
    description: "Aprende cómo exportar tus artesanías"
  },
  digitalShopCreator: {
    title: "Creador de Tienda Digital",
    description: "Crea tu tienda en línea para vender artesanías"
  }
};

export const craftTranslations: ArtisanCraftTranslations = {
  ceramic: "Cerámica",
  textile: "Textiles y Tejidos",
  woodwork: "Trabajo en Madera",
  leather: "Marroquinería y Cuero",
  jewelry: "Joyería Artesanal",
  fiber: "Fibras Naturales",
  metal: "Metalistería",
  stone: "Piedra Tallada",
  mixed: "Técnicas Mixtas"
};

export const categoryTranslations: CategoryTranslations = {
  financial: "Gestión Financiera",
  legal: "Soporte Legal",
  commercial: "Soporte Comercial",
  diagnosis: "Evaluación de Negocio",
  operational: "Operativo",
  community: "Comunidad"
};

export const buttonTranslations: ButtonTranslations = {
  selectButton: "Seleccionar",
  comingSoon: "Próximamente",
  viewShop: "Ver Tienda",
  createShop: "Crear Tienda"
};

export const getTranslations = (language: 'en' | 'es') => {
  return {
    title: "Agentes Especializados para Artesanos",
    description: "Elige el agente que mejor se adapte a tus necesidades actuales como artesano",
    profiles: {
      ceramic: craftTranslations.ceramic,
      textile: craftTranslations.textile,
      woodwork: craftTranslations.woodwork,
      leather: craftTranslations.leather
    },
    categories: categoryTranslations,
    buttons: buttonTranslations
  };
};

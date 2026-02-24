
import { 
  User, 
  Palette, 
  Calculator, 
  Scale, 
  Settings,
  FileText,
  Users,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

interface AgentInfo {
  name: string;
  description: string;
  icon: any;
  category: string;
}

const agentMappings: Record<string, { en: AgentInfo; es: AgentInfo }> = {
  admin: {
    en: {
      name: 'Administrative Assistant',
      description: 'Helps with project management, scheduling, and organization',
      icon: User,
      category: 'Core'
    },
    es: {
      name: 'Asistente Administrativo',
      description: 'Ayuda con gestión de proyectos, programación y organización',
      icon: User,
      category: 'Esencial'
    }
  },
  cultural: {
    en: {
      name: 'Creative Specialist',
      description: 'Expert guidance for creative industries and cultural projects',
      icon: Palette,
      category: 'Creative'
    },
    es: {
      name: 'Especialista Creativo',
      description: 'Orientación experta para industrias creativas y proyectos culturales',
      icon: Palette,
      category: 'Creativo'
    }
  },
  accounting: {
    en: {
      name: 'Financial Advisor',
      description: 'Manages finances, pricing strategies, and revenue optimization',
      icon: Calculator,
      category: 'Business'
    },
    es: {
      name: 'Asesor Financiero',
      description: 'Gestiona finanzas, estrategias de precios y optimización de ingresos',
      icon: Calculator,
      category: 'Negocio'
    }
  },
  legal: {
    en: {
      name: 'Legal Advisor',
      description: 'Provides legal guidance, contracts, and intellectual property advice',
      icon: Scale,
      category: 'Legal'
    },
    es: {
      name: 'Asesor Legal',
      description: 'Proporciona orientación legal, contratos y asesoría de propiedad intelectual',
      icon: Scale,
      category: 'Legal'
    }
  },
  operations: {
    en: {
      name: 'Operations Manager',
      description: 'Optimizes workflows, team coordination, and operational efficiency',
      icon: Settings,
      category: 'Operations'
    },
    es: {
      name: 'Gerente de Operaciones',
      description: 'Optimiza flujos de trabajo, coordinación de equipos y eficiencia operacional',
      icon: Settings,
      category: 'Operaciones'
    }
  }
};

export const getAgentInfo = (agentKey: string, language: 'en' | 'es'): AgentInfo | null => {
  const mapping = agentMappings[agentKey];
  return mapping ? mapping[language] : null;
};

export const getAllAgentKeys = (): string[] => {
  return Object.keys(agentMappings);
};

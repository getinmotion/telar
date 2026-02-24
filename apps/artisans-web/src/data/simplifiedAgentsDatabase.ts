
export interface SimpleAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  color: string;
  priority: number;
}

export const simpleAgentsDatabase: SimpleAgent[] = [
  {
    id: 'cost-calculator',
    name: 'Calculadora de Costos',
    category: 'Financiera',
    description: 'Calcula costos y precios de tus productos',
    iconName: 'Calculator',
    color: 'bg-green-500',
    priority: 1
  },
  {
    id: 'collaboration-agreement',
    name: 'Acuerdos de Colaboración',
    category: 'Legal',
    description: 'Genera contratos y acuerdos',
    iconName: 'Scale',
    color: 'bg-blue-500',
    priority: 1
  },
  {
    id: 'maturity-evaluator',
    name: 'Evaluador de Madurez',
    category: 'Diagnóstico',
    description: 'Evalúa el nivel de tu negocio',
    iconName: 'TrendingUp',
    color: 'bg-purple-500',
    priority: 2
  },
  {
    id: 'cultural-consultant',
    name: 'Consultor Creativo',
    category: 'Operativo',
    description: 'Orientación para proyectos culturales',
    iconName: 'Palette',
    color: 'bg-pink-500',
    priority: 1
  },
  {
    id: 'project-manager',
    name: 'Gestor de Proyectos',
    category: 'Operativo',
    description: 'Organiza y coordina tus proyectos',
    iconName: 'Settings',
    color: 'bg-orange-500',
    priority: 2
  },
  {
    id: 'marketing-advisor',
    name: 'Asesor de Marketing',
    category: 'Comercial',
    description: 'Estrategias de marketing y promoción',
    iconName: 'Target',
    color: 'bg-cyan-500',
    priority: 2
  }
];

export const getAgentById = (id: string): SimpleAgent | undefined => {
  return simpleAgentsDatabase.find(agent => agent.id === id);
};

export const getAgentsByCategory = (category: string): SimpleAgent[] => {
  return simpleAgentsDatabase.filter(agent => agent.category === category);
};

export const getPriorityAgents = (): SimpleAgent[] => {
  return simpleAgentsDatabase.filter(agent => agent.priority === 1);
};

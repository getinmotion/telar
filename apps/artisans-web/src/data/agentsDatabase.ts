
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
  TrendingUp,
  Package,
  Share2
} from 'lucide-react';

export interface CulturalAgent {
  id: string;
  code: string;
  name: string;
  category: 'Financiera' | 'Legal' | 'Diagnóstico' | 'Comercial' | 'Operativo' | 'Comunidad';
  impact: 1 | 2 | 3 | 4;
  priority: 'Muy Baja' | 'Baja' | 'Media' | 'Media-Alta' | 'Alta';
  description: string;
  icon: any;
  color: string;
  profiles?: string[];
  exampleQuestion?: string;
  exampleAnswer?: string;
  expertise?: string[];
  mainAction?: {
    label: string;
    route: string;
  };
}

export const culturalAgentsDatabase: CulturalAgent[] = [
  {
    id: 'master-coordinator',
    code: 'M01',
    name: 'Coordinador Maestro',
    category: 'Diagnóstico',
    impact: 4,
    priority: 'Alta',
    description: 'Agente orquestador que guía todo tu viaje empresarial, interpreta resultados y coordina otros agentes',
    icon: Users,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    expertise: ['business coordination', 'strategic guidance', 'agent orchestration', 'progress tracking'],
    profiles: ['musician', 'visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "¿Cómo debo priorizar mis tareas de negocio?",
    exampleAnswer: "Te ayudo a priorizar tareas basándome en tu nivel de madurez, coordino otros agentes especializados y te guío paso a paso hacia el crecimiento de tu negocio creativo."
  },
  {
    id: 'pricing-agent',
    code: 'A01',
    name: 'Agente de Pricing',
    category: 'Financiera',
    impact: 4,
    priority: 'Alta',
    description: 'Calcula costos, márgenes y precios de venta optimizados por producto',
    icon: Calculator,
    color: 'bg-green-500',
    expertise: ['pricing', 'costs', 'margins', 'profitability'],
    profiles: ['visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "¿Cómo calculo el precio de venta de mi producto?",
    exampleAnswer: "Te ayudo a calcular todos los costos (materiales, tiempo, gastos generales) y agregar un margen de ganancia adecuado para tu mercado."
  },
  {
    id: 'legal-assistant',
    code: 'A02',
    name: 'Asistente Legal',
    category: 'Legal',
    impact: 4,
    priority: 'Alta',
    description: 'NIT, registro de marca, términos, políticas y contratos',
    icon: Scale,
    color: 'bg-blue-500',
    expertise: ['legal', 'contracts', 'compliance', 'documentation'],
    profiles: ['musician', 'visual-artist', 'indigenous-artisan', 'textile-artisan'],
    exampleQuestion: "Necesito ayuda con mi NIT y contratos",
    exampleAnswer: "Te guío paso a paso con trámites legales, NIT, registro de marca y generación de contratos personalizados para tu negocio."
  },
  {
    id: 'growth-planner',
    code: 'A03',
    name: 'Planificador de Crecimiento',
    category: 'Diagnóstico',
    impact: 4,
    priority: 'Alta',
    description: 'Evalúa madurez y genera plan de crecimiento de 4-8 semanas',
    icon: TrendingUp,
    color: 'bg-purple-500',
    expertise: ['growth', 'maturity', 'planning', 'roadmap'],
    profiles: ['musician', 'visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "¿En qué etapa está mi negocio y qué debo hacer?",
    exampleAnswer: "Evalúo tu nivel de madurez empresarial y te doy un plan de crecimiento personalizado con misiones priorizadas para las próximas semanas."
  },
  {
    id: 'cultural-consultant',
    code: 'A04',
    name: 'Especialista Creativo',
    category: 'Operativo',
    impact: 3,
    priority: 'Alta',
    description: 'Orientación experta para industrias creativas y proyectos culturales',
    icon: Palette,
    color: 'bg-pink-500',
    expertise: ['idea validation', 'creative strategy', 'cultural projects'],
    profiles: ['musician', 'visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "¿Cómo puedo validar mi idea creativa?",
    exampleAnswer: "Te ayudo a analizar tu propuesta creativa, identificar tu audiencia objetivo y desarrollar una estrategia para validar tu concepto en el mercado."
  },
  {
    id: 'project-manager',
    code: 'A05',
    name: 'Gestor de Proyectos',
    category: 'Operativo',
    impact: 3,
    priority: 'Media',
    description: 'Optimiza flujos de trabajo y coordinación de equipos',
    icon: Settings,
    color: 'bg-orange-500',
    expertise: ['project management', 'planning', 'organization'],
    profiles: ['musician', 'visual-artist', 'textile-artisan'],
    exampleQuestion: "¿Cómo organizo mejor mis proyectos creativos?",
    exampleAnswer: "Te ayudo a estructurar tus proyectos, definir timelines realistas y coordinar recursos para maximizar tu productividad creativa."
  },
  {
    id: 'marketing-advisor',
    code: 'A06',
    name: 'Asesor de Marketing',
    category: 'Comercial',
    impact: 3,
    priority: 'Media',
    description: 'Desarrolla estrategias de marketing y análisis de mercado',
    icon: Target,
    color: 'bg-cyan-500',
    expertise: ['marketing', 'market analysis', 'brand strategy'],
    profiles: ['musician', 'visual-artist', 'textile-artisan'],
    exampleQuestion: "¿Cómo promociono mi trabajo creativo?",
    exampleAnswer: "Desarrollo estrategias de marketing personalizadas para tu perfil creativo, incluyendo redes sociales, networking y posicionamiento de marca."
  },
  {
    id: 'export-advisor',
    code: 'A07',
    name: 'Exportación + Cobros Internacionales',
    category: 'Legal',
    impact: 4,
    priority: 'Media-Alta',
    description: 'Asesora sobre exportación de productos culturales y gestión de cobros internacionales',
    icon: FileText,
    color: 'bg-indigo-500',
    profiles: ['musician', 'visual-artist', 'textile-artisan']
  },
  {
    id: 'collaboration-pitch',
    code: 'A08',
    name: 'Pitch para Colaboraciones',
    category: 'Comercial',
    impact: 2,
    priority: 'Baja',
    description: 'Crea presentaciones profesionales para propuestas de colaboración',
    icon: Users,
    color: 'bg-orange-500'
  },
  {
    id: 'portfolio-catalog',
    code: 'A09',
    name: 'Catálogo de Obras / Productos',
    category: 'Comercial',
    impact: 3,
    priority: 'Baja',
    description: 'Organiza y presenta catálogos profesionales de obras y productos',
    icon: FileText,
    color: 'bg-pink-500',
    profiles: ['visual-artist', 'textile-artisan', 'indigenous-artisan']
  },
  {
    id: 'artwork-description',
    code: 'A10',
    name: 'Descripción Optimizada de Obra',
    category: 'Comercial',
    impact: 2,
    priority: 'Muy Baja',
    description: 'Genera descripciones optimizadas y atractivas para obras de arte',
    icon: FileText,
    color: 'bg-teal-500'
  },
  {
    id: 'income-calculator',
    code: 'A11',
    name: 'Calculadora de Ingresos/Gastos',
    category: 'Financiera',
    impact: 3,
    priority: 'Baja',
    description: 'Gestiona y analiza flujos de ingresos y gastos del negocio cultural',
    icon: Calculator,
    color: 'bg-emerald-500'
  },
  {
    id: 'branding-strategy',
    code: 'A12',
    name: 'Estrategia de Branding y Exposición',
    category: 'Comercial',
    impact: 3,
    priority: 'Baja',
    description: 'Desarrolla estrategias de marca personal y planes de exposición',
    icon: Palette,
    color: 'bg-violet-500'
  },
  {
    id: 'personal-brand-eval',
    code: 'A13',
    name: 'Evaluación de Marca Personal',
    category: 'Diagnóstico',
    impact: 2,
    priority: 'Muy Baja',
    description: 'Analiza y evalúa la efectividad de la marca personal del creador',
    icon: User,
    color: 'bg-cyan-500'
  },
  {
    id: 'funding-routes',
    code: 'A14',
    name: 'Rutas de Fondeo y Convocatorias',
    category: 'Legal',
    impact: 3,
    priority: 'Media',
    description: 'Identifica oportunidades de financiamiento y convocatorias relevantes',
    icon: Target,
    color: 'bg-amber-500'
  },
  {
    id: 'contract-generator',
    code: 'A15',
    name: 'Generador General de Contratos',
    category: 'Legal',
    impact: 4,
    priority: 'Media',
    description: 'Crea contratos personalizados para diversos tipos de proyectos culturales',
    icon: Scale,
    color: 'bg-red-500'
  },
  {
    id: 'tax-compliance',
    code: 'A16',
    name: 'Rendición de Cuentas e Impuestos',
    category: 'Legal',
    impact: 4,
    priority: 'Media',
    description: 'Asiste con declaraciones fiscales y cumplimiento tributario',
    icon: FileText,
    color: 'bg-gray-500'
  },
  {
    id: 'social-impact-eval',
    code: 'A17',
    name: 'Evaluador de Impacto en Redes Sociales',
    category: 'Comercial',
    impact: 2,
    priority: 'Baja',
    description: 'Analiza el impacto y efectividad de la presencia en redes sociales',
    icon: Target,
    color: 'bg-rose-500'
  },
  {
    id: 'pricing-assistant',
    code: 'A18',
    name: 'Asistente de Precios por Canal de Venta',
    category: 'Comercial',
    impact: 4,
    priority: 'Media',
    description: 'Optimiza estrategias de precios según diferentes canales de venta',
    icon: Calculator,
    color: 'bg-lime-500'
  },
  {
    id: 'stakeholder-matching',
    code: 'A19',
    name: 'Matching de Stakeholders Creativos',
    category: 'Comunidad',
    impact: 4,
    priority: 'Alta',
    description: 'Conecta creadores con stakeholders relevantes del ecosistema cultural',
    icon: Users,
    color: 'bg-neutral-500'
  },
  {
    id: 'inventory-manager',
    code: 'A20',
    name: 'Gestor de Inventario y Catálogo',
    category: 'Operativo',
    impact: 4,
    priority: 'Alta',
    description: 'Organiza tu catálogo, normaliza productos, controla stock y mantiene consistencia',
    icon: Package,
    color: 'bg-amber-500',
    expertise: ['inventory', 'catalog', 'stock-control', 'product-management'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'visual-artist'],
    exampleQuestion: "¿Cómo organizo mi inventario de productos?",
    exampleAnswer: "Te ayudo a estructurar tu catálogo, crear variantes, controlar stock y sincronizar todo con tu tienda online.",
    mainAction: {
      label: 'Subir Producto',
      route: '/productos/subir'
    }
  },
  {
    id: 'digital-presence',
    code: 'A21',
    name: 'Presencia Digital',
    category: 'Comercial',
    impact: 3,
    priority: 'Media-Alta',
    description: 'Optimiza tu presencia en redes sociales, genera contenido y calendario editorial',
    icon: Share2,
    color: 'bg-pink-500',
    expertise: ['social-media', 'content', 'branding', 'visibility'],
    profiles: ['musician', 'visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "¿Cómo mejoro mi presencia en redes sociales?",
    exampleAnswer: "Analizo tus redes, propongo mejoras y genero un calendario de contenido de 2 semanas con piezas y copy optimizado."
  },
  {
    id: 'brand-identity',
    code: 'A22',
    name: 'Identidad de Marca',
    category: 'Comercial',
    impact: 3,
    priority: 'Media',
    description: 'Crea logo, define colores, tipografía y tono de marca',
    icon: Palette,
    color: 'bg-violet-500',
    expertise: ['branding', 'design', 'identity', 'visual-assets'],
    profiles: ['musician', 'visual-artist', 'textile-artisan', 'indigenous-artisan'],
    exampleQuestion: "Necesito definir la identidad visual de mi marca",
    exampleAnswer: "Te ayudo a crear tu logo, elegir paleta de colores, tipografía y definir el tono de comunicación de tu marca."
  }
];

// Helper functions with proper error handling
export const getAgentById = (id: string): CulturalAgent | undefined => {
  if (!id || typeof id !== 'string') {
    console.warn('getAgentById: Invalid agent ID provided:', id);
    return undefined;
  }
  return culturalAgentsDatabase.find(agent => agent?.id === id);
};

export const getAgentsByCategory = (category: string): CulturalAgent[] => {
  if (!category || typeof category !== 'string') {
    console.warn('getAgentsByCategory: Invalid category provided:', category);
    return [];
  }
  return culturalAgentsDatabase.filter(agent => agent?.category === category) || [];
};

export const getAgentsByExpertise = (expertise: string): CulturalAgent[] => {
  if (!expertise || typeof expertise !== 'string') {
    console.warn('getAgentsByExpertise: Invalid expertise provided:', expertise);
    return [];
  }
  return culturalAgentsDatabase.filter(agent => 
    agent?.expertise?.some(exp => 
      exp && typeof exp === 'string' && exp.toLowerCase().includes(expertise.toLowerCase())
    )
  ) || [];
};

export const getAllAgentIds = (): string[] => {
  return culturalAgentsDatabase
    .filter(agent => agent?.id && typeof agent.id === 'string')
    .map(agent => agent.id);
};

export const getRecommendedAgentsForProfile = (profileType: string): CulturalAgent[] => {
  if (!profileType || typeof profileType !== 'string') {
    console.warn('getRecommendedAgentsForProfile: Invalid profile type:', profileType);
    return [];
  }
  
  return culturalAgentsDatabase.filter(agent => 
    agent?.profiles?.includes(profileType) || 
    agent?.priority === 'Alta' || 
    (agent?.impact && agent.impact >= 3)
  ) || [];
};

export const getAgentsByPriority = (priority: string): CulturalAgent[] => {
  if (!priority || typeof priority !== 'string') {
    console.warn('getAgentsByPriority: Invalid priority provided:', priority);
    return [];
  }
  return culturalAgentsDatabase.filter(agent => agent?.priority === priority) || [];
};

export const getAgentsByImpact = (impact: number): CulturalAgent[] => {
  if (typeof impact !== 'number' || impact < 1 || impact > 4) {
    console.warn('getAgentsByImpact: Invalid impact level provided:', impact);
    return [];
  }
  return culturalAgentsDatabase.filter(agent => agent?.impact === impact) || [];
};

import { 
  Calculator, 
  Scale, 
  Settings,
  Target,
  Users,
  TrendingUp,
  Store, 
  Package, 
  Camera, 
  Globe, 
  Palette,
  Sparkles,
  ShoppingBag,
  Hammer
} from 'lucide-react';

// Unified artisan agent interface
export interface ArtisanAgent {
  id: string;
  code: string;
  name: string;
  category: 'Financiera' | 'Legal' | 'Diagnóstico' | 'Comercial' | 'Operativo' | 'Comunidad';
  impact: 1 | 2 | 3 | 4;
  priority: 'Muy Baja' | 'Baja' | 'Media' | 'Media-Alta' | 'Alta';
  description: string;
  icon: any;
  color: string;
  craftTypes: string[];  // ceramic, textile, woodwork, leather, jewelry, fiber, metal, stone, mixed
  expertise?: string[];
  exampleQuestion?: string;
  exampleAnswer?: string;
}

// Base artesanal de agentes - SOLO PARA ARTESANOS
export const artisanAgentsDatabase: ArtisanAgent[] = [
  {
    id: 'master-coordinator',
    code: 'M01',
    name: 'Coordinador Maestro Artesanal',
    category: 'Diagnóstico',
    impact: 4,
    priority: 'Alta',
    description: 'Tu guía digital personalizado que entiende tu oficio y te acompaña en cada paso del crecimiento de tu negocio artesanal',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['business coordination', 'strategic guidance', 'agent orchestration', 'progress tracking'],
    exampleQuestion: "¿Cómo debo organizar mi negocio artesanal?",
    exampleAnswer: "Te ayudo a priorizar tareas según tu nivel de madurez, coordino otros agentes especializados y te guío paso a paso hacia el crecimiento de tu oficio artesanal."
  },
  {
    id: 'cost-calculator',
    code: 'A01',
    name: 'Calculadora de Costos y Precios',
    category: 'Financiera',
    impact: 4,
    priority: 'Alta',
    description: 'Calcula costos de producción, precios de venta justos que respeten el valor de tu trabajo artesanal',
    icon: Calculator,
    color: 'bg-gradient-to-r from-emerald-500 to-green-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['cost analysis', 'pricing strategy', 'profitability'],
    exampleQuestion: "¿Cómo calculo el precio de mis artesanías?",
    exampleAnswer: "Calculamos juntos: costo de materiales, tiempo de trabajo, técnica especializada y margen de ganancia justo. Tu trabajo artesanal tiene valor."
  },
  {
    id: 'pricing-optimizer',
    code: 'A02',
    name: 'Optimizador de Precios por Canal',
    category: 'Financiera',
    impact: 4,
    priority: 'Alta',
    description: 'Optimiza precios según diferentes canales de venta: tienda propia, ferias, redes sociales, exportación',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['pricing strategy', 'market research', 'multichannel sales'],
    exampleQuestion: "¿Debo cobrar lo mismo en todas partes?",
    exampleAnswer: "Te ayudo a definir precios estratégicos: un precio para venta directa, otro para mayoristas, otro para exportación. Cada canal tiene sus costos y márgenes."
  },
  {
    id: 'digital-shop-creator',
    code: 'A03',
    name: 'Creador de Tienda Digital',
    category: 'Comercial',
    impact: 4,
    priority: 'Alta',
    description: 'Crea y configura tu tienda digital para vender artesanías en línea, sin conocimientos técnicos',
    icon: Store,
    color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['e-commerce', 'digital presence', 'online sales'],
    exampleQuestion: "¿Cómo vendo en línea si no sé de tecnología?",
    exampleAnswer: "Te guío paso a paso: configurar perfil, cargar productos con buenas fotos y descripciones, configurar pagos seguros. ¡Venderás 24/7!"
  },
  {
    id: 'inventory-manager',
    code: 'A04',
    name: 'Gestor de Inventario Artesanal',
    category: 'Operativo',
    impact: 3,
    priority: 'Media',
    description: 'Control simple de materias primas, productos en proceso y terminados',
    icon: Package,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['inventory control', 'stock management', 'production planning'],
    exampleQuestion: "¿Cómo controlo mis materiales y productos?",
    exampleAnswer: "Te enseño a llevar control simple: materias primas, productos en proceso y terminados. Incluye plantillas y alertas de reorden."
  },
  {
    id: 'artisan-branding',
    code: 'A05',
    name: 'Especialista en Marca Artesanal',
    category: 'Comercial',
    impact: 3,
    priority: 'Media',
    description: 'Desarrolla una marca única que represente tu tradición, técnica y región artesanal',
    icon: Palette,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['brand development', 'storytelling', 'cultural identity'],
    exampleQuestion: "¿Cómo creo una marca para mis artesanías?",
    exampleAnswer: "Definimos tu propuesta única: historia personal, técnicas tradicionales, origen regional. Creamos una narrativa auténtica que conecte con clientes."
  },
  {
    id: 'product-photographer',
    code: 'A06',
    name: 'Fotógrafo de Productos',
    category: 'Comercial',
    impact: 3,
    priority: 'Media-Alta',
    description: 'Aprende a tomar fotos profesionales de tus productos artesanales con tu celular',
    icon: Camera,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['product photography', 'mobile photography', 'lighting'],
    exampleQuestion: "¿Cómo tomo buenas fotos con mi celular?",
    exampleAnswer: "Te enseño técnicas simples: luz natural, fondos neutros, ángulos que resaltan detalles. Fotos que venden tus artesanías."
  },
  {
    id: 'seasonal-planner',
    code: 'A07',
    name: 'Planificador Estacional',
    category: 'Operativo',
    impact: 3,
    priority: 'Media',
    description: 'Planifica producción según temporadas altas: Navidad, Día de la Madre, ferias artesanales',
    icon: Target,
    color: 'bg-gradient-to-r from-amber-500 to-orange-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['seasonal planning', 'event calendar', 'production scheduling'],
    exampleQuestion: "¿Cuándo debo producir más?",
    exampleAnswer: "Te muestro el calendario de oportunidades: Navidad, ferias, temporada turística. Planificamos producción con anticipación para no perder ventas."
  },
  {
    id: 'export-specialist',
    code: 'A08',
    name: 'Especialista en Exportación',
    category: 'Legal',
    impact: 4,
    priority: 'Media',
    description: 'Guía completa para exportar artesanías: documentación, certificaciones, embalaje internacional',
    icon: Globe,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['international trade', 'export documentation', 'customs'],
    exampleQuestion: "¿Cómo exporto mis artesanías?",
    exampleAnswer: "Te explico paso a paso: documentación, certificaciones de origen, embalaje seguro, seguros y canales internacionales. Con apoyo de Artesanías de Colombia."
  },
  {
    id: 'workshop-organizer',
    code: 'A09',
    name: 'Organizador de Talleres',
    category: 'Operativo',
    impact: 2,
    priority: 'Baja',
    description: 'Organiza talleres para enseñar tu técnica artesanal y generar ingresos adicionales',
    icon: Users,
    color: 'bg-gradient-to-r from-violet-500 to-purple-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['workshop planning', 'teaching methodology', 'event organization'],
    exampleQuestion: "¿Puedo enseñar mi técnica y ganar dinero?",
    exampleAnswer: "Te ayudo a estructurar talleres presenciales o virtuales: contenido, precios, promoción. Los talleres son ingresos extra mientras compartes tu conocimiento."
  },
  {
    id: 'collaboration-agreement',
    code: 'A10',
    name: 'Generador de Contratos y Acuerdos',
    category: 'Legal',
    impact: 4,
    priority: 'Media',
    description: 'Crea contratos de colaboración, cesión de derechos y acuerdos comerciales para artesanos',
    icon: Scale,
    color: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['contracts', 'legal documents', 'collaboration agreements'],
    exampleQuestion: "Necesito un contrato para vender en una tienda",
    exampleAnswer: "Creo contratos personalizados: ventas mayoristas, consignación, colaboraciones con otros artesanos. Todo legal y justo para ambas partes."
  },
  {
    id: 'maturity-evaluator',
    code: 'A11',
    name: 'Evaluador de Madurez del Negocio Artesanal',
    category: 'Diagnóstico',
    impact: 3,
    priority: 'Media',
    description: 'Evalúa tu nivel de madurez empresarial artesanal y proporciona plan de crecimiento',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['business analysis', 'maturity assessment', 'growth planning'],
    exampleQuestion: "¿En qué nivel está mi negocio?",
    exampleAnswer: "Evalúo tu negocio artesanal en 4 áreas: finanzas, comercialización, operaciones y marca. Te doy un plan de crecimiento paso a paso."
  },
  {
    id: 'marketplace-advisor',
    code: 'A12',
    name: 'Asesor de Marketplaces',
    category: 'Comercial',
    impact: 3,
    priority: 'Media',
    description: 'Guía para vender en plataformas como Amazon Handmade, Etsy, MercadoLibre, Novica',
    icon: ShoppingBag,
    color: 'bg-gradient-to-r from-pink-500 to-rose-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['marketplace optimization', 'online platforms', 'international sales'],
    exampleQuestion: "¿Conviene vender en Amazon Handmade o Etsy?",
    exampleAnswer: "Comparo plataformas según tu producto: comisiones, alcance, competencia. Te ayudo a optimizar fichas de producto para vender más."
  },
  {
    id: 'artisan-storyteller',
    code: 'A13',
    name: 'Contador de Historias Artesanales',
    category: 'Comercial',
    impact: 2,
    priority: 'Baja',
    description: 'Crea narrativas auténticas sobre tu proceso, tradición y origen que conecten emocionalmente',
    icon: Hammer,
    color: 'bg-gradient-to-r from-amber-600 to-yellow-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['storytelling', 'content creation', 'emotional connection'],
    exampleQuestion: "¿Cómo cuento la historia de mis artesanías?",
    exampleAnswer: "Te ayudo a construir narrativas poderosas: tu historia personal, la tradición familiar, el origen de las técnicas. Historias que agregan valor a tus productos."
  },
  {
    id: 'quality-certifier',
    code: 'A14',
    name: 'Asesor de Certificaciones',
    category: 'Legal',
    impact: 3,
    priority: 'Media',
    description: 'Guía para obtener certificaciones: Hecho a Mano, Denominación de Origen, Comercio Justo',
    icon: Settings,
    color: 'bg-gradient-to-r from-green-600 to-lime-600',
    craftTypes: ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'],
    expertise: ['certifications', 'quality standards', 'legal compliance'],
    exampleQuestion: "¿Qué certificaciones necesito para exportar?",
    exampleAnswer: "Te explico certificaciones importantes: Hecho a Mano de Colombia, Denominación de Origen, Fair Trade. Te guío en el proceso de obtenerlas."
  }
];

// Helper functions
export const getAgentById = (id: string): ArtisanAgent | undefined => {
  if (!id || typeof id !== 'string') {
    console.warn('getAgentById: Invalid agent ID provided:', id);
    return undefined;
  }
  return artisanAgentsDatabase.find(agent => agent?.id === id);
};

export const getAgentsByCategory = (category: string): ArtisanAgent[] => {
  if (!category || typeof category !== 'string') {
    console.warn('getAgentsByCategory: Invalid category provided:', category);
    return [];
  }
  return artisanAgentsDatabase.filter(agent => agent?.category === category) || [];
};

export const getAgentsByCraftType = (craftType: string): ArtisanAgent[] => {
  if (!craftType || typeof craftType !== 'string') {
    console.warn('getAgentsByCraftType: Invalid craft type provided:', craftType);
    return [];
  }
  return artisanAgentsDatabase.filter(agent => 
    agent?.craftTypes?.includes(craftType)
  ) || [];
};

export const getAgentsByPriority = (priority: string): ArtisanAgent[] => {
  if (!priority || typeof priority !== 'string') {
    console.warn('getAgentsByPriority: Invalid priority provided:', priority);
    return [];
  }
  return artisanAgentsDatabase.filter(agent => agent?.priority === priority) || [];
};

export const getAgentsByImpact = (impact: number): ArtisanAgent[] => {
  if (typeof impact !== 'number' || impact < 1 || impact > 4) {
    console.warn('getAgentsByImpact: Invalid impact level provided:', impact);
    return [];
  }
  return artisanAgentsDatabase.filter(agent => agent?.impact === impact) || [];
};

export const getHighPriorityAgents = (): ArtisanAgent[] => {
  return artisanAgentsDatabase.filter(agent => 
    agent?.priority === 'Alta' || agent?.priority === 'Media-Alta'
  ) || [];
};

export const getAllAgentIds = (): string[] => {
  return artisanAgentsDatabase
    .filter(agent => agent?.id && typeof agent.id === 'string')
    .map(agent => agent.id);
};

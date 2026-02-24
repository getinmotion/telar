import { Store, Package, Camera, Globe, Palette, TrendingUp, Settings, Target } from 'lucide-react';
import { CulturalAgent } from '@/data/agentsDatabase';

// Additional agents specific to artisans that extend the existing database
export const artisanSpecificAgents: CulturalAgent[] = [
  {
    id: 'digital-shop-creator',
    code: 'A08',
    name: 'Creador de Tienda Digital',
    category: 'Comercial',
    impact: 4,
    priority: 'Alta',
    description: 'Te ayudo a crear y configurar tu tienda digital para vender artesanías en línea',
    icon: Store,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    expertise: ['e-commerce', 'digital presence', 'online sales', 'shop setup'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo puedo vender mis artesanías en línea?",
    exampleAnswer: "Te guío paso a paso para crear tu tienda digital: desde configurar el perfil hasta cargar productos y configurar pagos. Incluye consejos para fotos, descripciones y precios competitivos."
  },
  {
    id: 'product-photographer',
    code: 'A09',
    name: 'Fotógrafo de Productos',
    category: 'Comercial',
    impact: 3,
    priority: 'Media-Alta',
    description: 'Aprende a tomar fotos profesionales de tus productos artesanales con tu celular',
    icon: Camera,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    expertise: ['product photography', 'mobile photography', 'lighting', 'composition'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo tomo buenas fotos de mis productos?",
    exampleAnswer: "Te enseño técnicas de fotografía con celular: iluminación natural, fondos neutros, ángulos favorecedores y edición básica. Ideal para mostrar la calidad y detalles de tus artesanías."
  },
  {
    id: 'export-specialist',
    code: 'A10',
    name: 'Especialista en Exportación',
    category: 'Legal',
    impact: 4,
    priority: 'Media',
    description: 'Guía completa para exportar artesanías colombianas al mercado internacional',
    icon: Globe,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    expertise: ['international trade', 'export documentation', 'customs', 'international payments'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo puedo exportar mis artesanías?",
    exampleAnswer: "Te explico los pasos para exportar: documentación necesaria, certificaciones, embalaje internacional, seguros y canales de venta global. Incluye apoyo de Artesanías de Colombia."
  },
  {
    id: 'artisan-branding',
    code: 'A11',
    name: 'Especialista en Marca Artesanal',
    category: 'Comercial',
    impact: 3,
    priority: 'Media',
    description: 'Desarrolla una marca única que represente tu tradición y técnica artesanal',
    icon: Palette,
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    expertise: ['brand development', 'storytelling', 'cultural identity', 'visual identity'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo creo una marca para mis artesanías?",
    exampleAnswer: "Te ayudo a definir tu propuesta única de valor: historia personal, técnicas tradicionales, origen regional y valores. Creamos una narrativa auténtica que conecte con clientes nacionales e internacionales."
  },
  {
    id: 'inventory-manager',
    code: 'A12',
    name: 'Gestor de Inventario Artesanal',
    category: 'Operativo',
    impact: 2,
    priority: 'Media',
    description: 'Sistema simple para controlar materias primas, productos terminados y ventas',
    icon: Package,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    expertise: ['inventory control', 'stock management', 'production planning', 'cost tracking'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo controlo mi inventario de materiales?",
    exampleAnswer: "Te enseño a llevar un control simple de materias primas, productos en proceso y terminados. Incluye plantillas digitales y métodos para calcular puntos de reorden."
  },
  {
    id: 'seasonal-planner',
    code: 'A13',
    name: 'Planificador Estacional',
    category: 'Operativo',
    impact: 3,
    priority: 'Media',
    description: 'Planifica tu producción según temporadas altas y ferias artesanales',
    icon: Target,
    color: 'bg-gradient-to-r from-teal-500 to-cyan-600',
    expertise: ['seasonal planning', 'event calendar', 'production scheduling', 'market timing'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cuándo debo producir más para vender mejor?",
    exampleAnswer: "Te muestro el calendario de oportunidades: Navidad, Día de la Madre, temporada turística, ferias como Expoartesanías. Planificamos producción y estrategias de venta por temporada."
  },
  {
    id: 'pricing-optimizer',
    code: 'A14',
    name: 'Optimizador de Precios',
    category: 'Financiera',
    impact: 4,
    priority: 'Alta',
    description: 'Calcula precios competitivos que respeten el valor de tu trabajo artesanal',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    expertise: ['pricing strategy', 'market research', 'value proposition', 'profitability analysis'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Cómo pongo precio a mis artesanías sin quedar muy caro?",
    exampleAnswer: "Calculamos precios justos considerando: costo de materiales, tiempo de trabajo, técnica especializada, unicidad del producto y precios de mercado. Tu trabajo artesanal tiene valor agregado."
  },
  {
    id: 'workshop-organizer',
    code: 'A15',
    name: 'Organizador de Talleres',
    category: 'Operativo',
    impact: 2,
    priority: 'Baja',
    description: 'Organiza y monetiza talleres para enseñar tu técnica artesanal',
    icon: Settings,
    color: 'bg-gradient-to-r from-violet-500 to-purple-600',
    expertise: ['workshop planning', 'teaching methodology', 'event organization', 'additional income'],
    profiles: ['textile-artisan', 'indigenous-artisan', 'ceramic-artisan', 'jewelry-artisan', 'woodwork-artisan', 'leather-artisan'],
    exampleQuestion: "¿Puedo enseñar mi técnica y generar ingresos adicionales?",
    exampleAnswer: "Te ayudo a estructurar talleres presenciales y virtuales: definir audiencia, crear contenido didáctico, fijar precios y promocionar. Los talleres son una fuente adicional de ingresos."
  }
];

// Get artisan-specific agents based on craft type
export const getArtisanAgentsByCraft = (craftType: string): CulturalAgent[] => {
  return artisanSpecificAgents.filter(agent => 
    agent.profiles?.some(profile => 
      profile.includes('artisan') || profile === craftType
    )
  );
};

// Get high-priority artisan agents for onboarding
export const getArtisanOnboardingAgents = (): CulturalAgent[] => {
  return artisanSpecificAgents.filter(agent => 
    agent.priority === 'Alta' || agent.priority === 'Media-Alta'
  );
};
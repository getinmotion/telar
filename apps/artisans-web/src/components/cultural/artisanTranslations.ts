// Traducciones exclusivas en español para plataforma artesanal
export const artisanCraftTranslations: Record<string, string> = {
  // Claves originales del sistema
  ceramic: 'Cerámica',
  textile: 'Textiles y Tejidos',
  woodwork: 'Trabajo en Madera',
  leather: 'Marroquinería y Cuero',
  jewelry: 'Joyería Artesanal',
  fiber: 'Fibras Naturales',
  metal: 'Metalistería',
  stone: 'Piedra Tallada',
  mixed: 'Técnicas Mixtas',
  
  // Claves del sistema AI (TODAS en español)
  ceramics: 'Cerámica',
  textiles: 'Textiles y Tejidos',
  metalwork: 'Metalistería',
  cosmetics: 'Cosmética y Cuidado Personal',
  basketry: 'Cestería y Fibras Naturales',
  glasswork: 'Vidrio Artesanal',
  painting: 'Pintura Artística',
  sculpture: 'Escultura',
  paper: 'Arte en Papel',
  
  // ✅ NUNCA mostrar "other" en inglés - usar nombre bonito
  other: 'Artesanía Tradicional'
};

export const categoryTranslations = {
  financial: 'Gestión Financiera',
  legal: 'Legal y Normativo',
  commercial: 'Comercialización',
  diagnosis: 'Diagnóstico',
  operational: 'Operativo',
  community: 'Comunidad'
};

export const buttonTranslations = {
  selectButton: 'Seleccionar',
  comingSoon: 'Próximamente',
  viewShop: 'Ver Tienda',
  createShop: 'Crear Tienda',
  startJourney: 'Iniciar mi viaje',
  continue: 'Continuar',
  back: 'Volver',
  save: 'Guardar',
  cancel: 'Cancelar'
};

export const onboardingTranslations = {
  welcome: '¡Hola! Soy tu Coordinador Maestro',
  subtitle: 'Tu guía digital para hacer crecer tu negocio artesanal',
  craftQuestion: '¿Qué tipo de artesanía realizas?',
  businessStatusQuestion: '¿Ya vendes tus productos o recién estás empezando?',
  brandQuestion: '¿Tienes un nombre de marca para tus productos?',
  pricingQuestion: '¿Cómo decides el precio de tus productos?',
  inventoryQuestion: '¿Llevas control de tus materiales y productos?',
  salesChannelsQuestion: '¿Dónde vendes actualmente tus productos?',
  goalsQuestion: '¿Qué te gustaría lograr con tu oficio artesanal?'
};

export const maturityLevelTranslations = {
  inicial: 'Nivel Inicial',
  intermedio: 'Nivel Intermedio',
  avanzado: 'Nivel Avanzado'
};

export const maturityAreaTranslations = {
  financialManagement: 'Gestión Financiera',
  commercialization: 'Comercialización',
  operations: 'Operaciones',
  branding: 'Marca e Identidad'
};

export const dashboardTranslations = {
  greeting: (name: string, craft: string) => `Hola ${name}, ¡vamos paso a paso con tu ${craft}!`,
  activeTasks: 'Tareas Activas',
  completedTasks: 'Tareas Completadas',
  salesThisMonth: 'Ventas del Mes',
  inventoryValue: 'Valor del Inventario',
  yourProgress: 'Tu Progreso Artesanal',
  nextMilestone: 'Próximo objetivo',
  todayTasks: 'Tus tareas de hoy',
  chatWithCoordinator: 'Conversar con el Coordinador',
  needHelp: '¿Necesitas ayuda?'
};

export const getCraftLabel = (craftType: string): string => {
  return artisanCraftTranslations[craftType as keyof typeof artisanCraftTranslations] || craftType;
};

export const getCategoryLabel = (category: string): string => {
  return categoryTranslations[category as keyof typeof categoryTranslations] || category;
};

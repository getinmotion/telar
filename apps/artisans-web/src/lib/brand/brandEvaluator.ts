// Brand evaluation logic and scoring

export interface BrandEvaluationData {
  has_logo: boolean;
  logo_quality: 'excellent' | 'good' | 'needs_improvement' | null;
  logo_url?: string;
  has_colors: boolean;
  colors: string[];
  color_consistency: 'high' | 'medium' | 'low';
  has_claim: boolean;
  claim?: string;
  claim_quality: 'memorable' | 'clear' | 'needs_work' | null;
  usage_channels: string[];
  score: number;
  evaluated_at: string;
  // AI-generated fields from master coordinator
  recommendations?: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact?: string;
    effort?: string;
  }>;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  next_steps?: string[];
  raw_answers?: Record<string, any>;
}

export const calculateBrandScore = (wizardData: Record<string, any>): number => {
  let score = 0;
  
  // Logo evaluation (+30 points)
  const logoStatus = wizardData['¿Ya tienes un logo para tu negocio?'];
  if (logoStatus === 'Sí, tengo logo' && wizardData['Sube tu logo actual para evaluación']) {
    score += 30;
  } else if (logoStatus === 'Tengo uno pero no estoy seguro si es bueno') {
    score += 15;
  }
  
  // Colors evaluation (+25 points)
  const colorStatus = wizardData['¿Tienes colores corporativos definidos?'];
  const colors = wizardData['Ingresa tus colores actuales'];
  if (colorStatus === 'Sí, tengo paleta definida' && colors && colors.length >= 3) {
    score += 25;
  } else if (colorStatus === 'Uso colores pero sin sistema') {
    score += 12;
  }
  
  // Claim evaluation (+20 points)
  const claimStatus = wizardData['¿Tienes un slogan o claim definido?'];
  const claim = wizardData['Escribe tu claim actual'];
  if (claimStatus === 'Sí, tengo claim' && claim && claim.length > 20) {
    score += 20;
  } else if (claimStatus === 'Tengo ideas pero no definido') {
    score += 10;
  }
  
  // Usage channels (+25 points)
  const channels = wizardData['¿Dónde usas tu identidad actualmente?'] || [];
  score += Math.min(25, channels.length * 4);
  
  return Math.min(100, score);
};

export const generateBrandRecommendations = (
  wizardData: Record<string, any>,
  score: number
): string[] => {
  const recommendations: string[] = [];
  
  const logoStatus = wizardData['¿Ya tienes un logo para tu negocio?'];
  const colorStatus = wizardData['¿Tienes colores corporativos definidos?'];
  const claimStatus = wizardData['¿Tienes un slogan o claim definido?'];
  const channels = wizardData['¿Dónde usas tu identidad actualmente?'] || [];
  
  // Logo recommendations
  if (logoStatus === 'No, aún no tengo') {
    recommendations.push('Crea un logo profesional que represente tu esencia artesanal');
  } else if (logoStatus === 'Tengo uno pero no estoy seguro si es bueno') {
    recommendations.push('Considera simplificar tu logo para mejor legibilidad en diferentes tamaños');
  } else if (logoStatus === 'Sí, tengo logo') {
    recommendations.push('Tu logo es una excelente base. Asegúrate de tener versiones en diferentes formatos (PNG, SVG)');
  }
  
  // Color recommendations
  if (colorStatus === 'No tengo colores definidos') {
    recommendations.push('Define una paleta de 3-5 colores que representen tu marca');
  } else if (colorStatus === 'Uso colores pero sin sistema') {
    recommendations.push('Establece una paleta de colores oficial y úsala consistentemente');
  } else {
    const colors = wizardData['Ingresa tus colores actuales'] || [];
    if (colors.length < 3) {
      recommendations.push('Amplía tu paleta con 1-2 colores complementarios para mayor versatilidad');
    } else {
      recommendations.push('Excelente paleta. Documenta cuándo usar cada color (primario, secundario, acentos)');
    }
  }
  
  // Claim recommendations
  if (claimStatus === 'No tengo') {
    recommendations.push('Crea un claim memorable que comunique tu propuesta de valor única');
  } else if (claimStatus === 'Tengo ideas pero no definido') {
    recommendations.push('Refina tus ideas en una frase de 5-10 palabras que conecte emocionalmente');
  } else {
    const claim = wizardData['Escribe tu claim actual'];
    if (claim && claim.length < 20) {
      recommendations.push('Expande tu claim para comunicar mejor tu diferenciador');
    } else {
      recommendations.push('Tu claim es sólido. Prueba diferentes versiones con clientes potenciales');
    }
  }
  
  // Usage recommendations
  if (channels.length < 3) {
    recommendations.push('Expande la presencia de tu marca a más puntos de contacto con clientes');
  } else if (channels.length >= 5) {
    recommendations.push('Excelente presencia multicanal. Asegura consistencia visual en todos los puntos');
  }
  
  // Overall score recommendations
  if (score >= 80) {
    recommendations.push('Tu marca está bien establecida. Enfócate en mantener consistencia y evolucionar estratégicamente');
  } else if (score >= 50) {
    recommendations.push('Tienes una buena base. Prioriza los elementos faltantes para alcanzar excelencia');
  } else {
    recommendations.push('Hay mucho potencial. Empieza por definir los elementos básicos: logo, colores, claim');
  }
  
  return recommendations;
};

export const extractBrandEvaluationData = (
  wizardData: Record<string, any>,
  score: number
): BrandEvaluationData => {
  const logoStatus = wizardData['¿Ya tienes un logo para tu negocio?'];
  const colorStatus = wizardData['¿Tienes colores corporativos definidos?'];
  const claimStatus = wizardData['¿Tienes un slogan o claim definido?'];
  
  return {
    has_logo: logoStatus === 'Sí, tengo logo',
    logo_quality: 
      logoStatus === 'Sí, tengo logo' ? 'good' : 
      logoStatus === 'Tengo uno pero no estoy seguro si es bueno' ? 'needs_improvement' : 
      null,
    logo_url: wizardData['Sube tu logo actual para evaluación']?.[0]?.name, // File object
    has_colors: colorStatus === 'Sí, tengo paleta definida',
    colors: wizardData['Ingresa tus colores actuales'] || [],
    color_consistency: 
      colorStatus === 'Sí, tengo paleta definida' ? 'high' :
      colorStatus === 'Uso colores pero sin sistema' ? 'medium' :
      'low',
    has_claim: claimStatus === 'Sí, tengo claim',
    claim: wizardData['Escribe tu claim actual'],
    claim_quality:
      claimStatus === 'Sí, tengo claim' && wizardData['Escribe tu claim actual']?.length > 30 ? 'memorable' :
      claimStatus === 'Sí, tengo claim' ? 'clear' :
      claimStatus === 'Tengo ideas pero no definido' ? 'needs_work' :
      null,
    usage_channels: wizardData['¿Dónde usas tu identidad actualmente?'] || [],
    score,
    evaluated_at: new Date().toISOString()
  };
};

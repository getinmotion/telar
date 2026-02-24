export interface ArtisanProfile {
  name: string;
  productType: string;
  hasSold: 'yes' | 'no' | 'sometimes';
  timeInvested: string;
  knowsCosts: 'yes' | 'no';
  dreamGoal: string;
  costDetails?: string;
  salesExperience?: string;
  timePerProduct?: string;
  industry: string;
  experience: string;
}

export interface ArtisanTask {
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  category: string;
  steps: ArtisanTaskStep[];
  estimatedTime: string;
  impact: number;
  agentId: string;
}

export interface ArtisanTaskStep {
  stepNumber: number;
  title: string;
  description: string;
  inputType: 'text' | 'calculation' | 'checklist' | 'file' | 'selection';
  guidance: string;
  expectedOutput: string;
  validationCriteria: any;
}

export function generateArtisanTasks(profile: ArtisanProfile, language: 'en' | 'es'): ArtisanTask[] {
  const isSpanish = language === 'es';
  const tasks: ArtisanTask[] = [];

  // Task 1: Cost Calculation - Always first for artisans who don't know costs
  if (profile.knowsCosts === 'no') {
    tasks.push({
      title: isSpanish ? `Calcular el costo real de cada ${profile.productType}` : `Calculate real cost of each ${profile.productType}`,
      description: isSpanish 
        ? `Te ayudo a determinar exactamente cuánto te cuesta producir cada ${profile.productType} para que puedas establecer precios justos y rentables.`
        : `I'll help you determine exactly how much it costs to produce each ${profile.productType} so you can set fair and profitable prices.`,
      priority: 'Alta',
      category: 'Finanzas',
      estimatedTime: isSpanish ? '45 minutos' : '45 minutes',
      impact: 5,
      agentId: 'cost-calculator',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Lista tus materiales e insumos' : 'List your materials and supplies',
          description: isSpanish 
            ? `Anota todos los materiales que necesitas para hacer un ${profile.productType}: hilos, relleno, accesorios, herramientas, etc.`
            : `Write down all materials needed to make one ${profile.productType}: threads, filling, accessories, tools, etc.`,
          inputType: 'checklist',
          guidance: isSpanish 
            ? 'Incluye hasta el material más pequeño. Es mejor sobrestimar que quedarse corto.'
            : 'Include even the smallest material. Better to overestimate than fall short.',
          expectedOutput: isSpanish ? 'Lista completa de materiales con cantidades' : 'Complete list of materials with quantities',
          validationCriteria: { minItems: 3, hasQuantities: true }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Calcula el costo de materiales' : 'Calculate material costs',
          description: isSpanish 
            ? 'Suma el costo total de todos los materiales para un producto'
            : 'Add up the total cost of all materials for one product',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Si compras por lotes, divide el costo total entre la cantidad de productos que puedes hacer'
            : 'If you buy in bulk, divide total cost by number of products you can make',
          expectedOutput: isSpanish ? 'Costo total de materiales por unidad' : 'Total material cost per unit',
          validationCriteria: { isNumeric: true, minValue: 0 }
        },
        {
          stepNumber: 3,
          title: isSpanish ? 'Mide tu tiempo de elaboración' : 'Measure your production time',
          description: isSpanish 
            ? `Cronometra cuánto tardas en hacer un ${profile.productType} completo`
            : `Time how long it takes to make one complete ${profile.productType}`,
          inputType: 'text',
          guidance: isSpanish 
            ? 'Incluye tiempo de preparación, elaboración y acabados. Hazlo con 2-3 productos para obtener un promedio'
            : 'Include prep time, creation and finishing. Do this with 2-3 products to get an average',
          expectedOutput: isSpanish ? 'Tiempo promedio en horas' : 'Average time in hours',
          validationCriteria: { hasTimeFormat: true }
        },
        {
          stepNumber: 4,
          title: isSpanish ? 'Define tu valor por hora' : 'Define your hourly rate',
          description: isSpanish 
            ? 'Decide cuánto quieres ganar por cada hora de trabajo'
            : 'Decide how much you want to earn per hour of work',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Considera tu experiencia, la calidad de tu trabajo y lo que cobran otros artesanos similares'
            : 'Consider your experience, work quality and what similar artisans charge',
          expectedOutput: isSpanish ? 'Valor por hora en moneda local' : 'Hourly rate in local currency',
          validationCriteria: { isNumeric: true, minValue: 1 }
        },
        {
          stepNumber: 5,
          title: isSpanish ? 'Calcula tu precio final' : 'Calculate your final price',
          description: isSpanish 
            ? 'Suma materiales + tiempo + margen de ganancia'
            : 'Add materials + time + profit margin',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Precio = (Costo materiales) + (Horas de trabajo × Valor por hora) + 20% de margen'
            : 'Price = (Material cost) + (Work hours × Hourly rate) + 20% margin',
          expectedOutput: isSpanish ? 'Precio de venta sugerido' : 'Suggested selling price',
          validationCriteria: { isNumeric: true, coversAllCosts: true }
        }
      ]
    });
  }

  // Task 2: Monthly Income Goal - Always important for artisans wanting to live from their craft
  if (profile.dreamGoal.toLowerCase().includes('vivir') || profile.dreamGoal.toLowerCase().includes('live') || 
      profile.dreamGoal.toLowerCase().includes('ganar') || profile.dreamGoal.toLowerCase().includes('earn')) {
    tasks.push({
      title: isSpanish ? 'Definir meta mensual para vivir de tu arte' : 'Define monthly goal to live from your art',
      description: isSpanish 
        ? 'Calculamos cuántos productos necesitas hacer y vender al mes para alcanzar tus objetivos económicos.'
        : 'We calculate how many products you need to make and sell monthly to reach your financial goals.',
      priority: 'Alta',
      category: 'Planificación',
      estimatedTime: isSpanish ? '30 minutos' : '30 minutes',
      impact: 5,
      agentId: 'financial-planner',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Define tus gastos mensuales básicos' : 'Define your basic monthly expenses',
          description: isSpanish 
            ? 'Lista cuánto necesitas para vivir: comida, casa, transporte, servicios, etc.'
            : 'List what you need to live: food, housing, transport, utilities, etc.',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Sé realista. Incluye un 10% extra para imprevistos.'
            : 'Be realistic. Include 10% extra for unexpected expenses.',
          expectedOutput: isSpanish ? 'Total de gastos mensuales' : 'Total monthly expenses',
          validationCriteria: { isNumeric: true, minValue: 100 }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Establece tu meta de ingresos deseados' : 'Set your desired income goal',
          description: isSpanish 
            ? 'Decide cuánto quieres ganar además de cubrir gastos básicos'
            : 'Decide how much you want to earn beyond covering basic expenses',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Piensa en ahorros, gustos personales, vacaciones, crecimiento del negocio'
            : 'Think about savings, personal treats, vacations, business growth',
          expectedOutput: isSpanish ? 'Meta de ingresos mensuales' : 'Monthly income goal',
          validationCriteria: { isNumeric: true, exceedsBasicNeeds: true }
        },
        {
          stepNumber: 3,
          title: isSpanish ? 'Calcula productos necesarios por mes' : 'Calculate products needed per month',
          description: isSpanish 
            ? 'Divide tu meta de ingresos entre el precio de tus productos'
            : 'Divide your income goal by your product price',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Si aún no tienes precio definido, usa una estimación basada en materiales y tiempo'
            : 'If you don\'t have a set price yet, use an estimate based on materials and time',
          expectedOutput: isSpanish ? 'Cantidad de productos a vender mensualmente' : 'Number of products to sell monthly',
          validationCriteria: { isNumeric: true, isRealistic: true }
        },
        {
          stepNumber: 4,
          title: isSpanish ? 'Verifica la viabilidad de tiempo' : 'Verify time feasibility',
          description: isSpanish 
            ? 'Comprueba si puedes producir esa cantidad con el tiempo que tienes disponible'
            : 'Check if you can produce that quantity with your available time',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Multiplica productos necesarios × tiempo por producto. ¿Te da el tiempo disponible?'
            : 'Multiply needed products × time per product. Do you have enough available time?',
          expectedOutput: isSpanish ? 'Plan de producción mensual realista' : 'Realistic monthly production plan',
          validationCriteria: { timeIsAvailable: true, isAchievable: true }
        }
      ]
    });
  }

  // Task 3: Brand Creation - Important for artisans wanting recognition
  if (profile.hasSold === 'no' || profile.dreamGoal.toLowerCase().includes('reconoc') || 
      profile.dreamGoal.toLowerCase().includes('known') || profile.dreamGoal.toLowerCase().includes('brand')) {
    tasks.push({
      title: isSpanish ? 'Crear tu marca artesanal' : 'Create your artisan brand',
      description: isSpanish 
        ? 'Desarrolla una identidad única para tu trabajo que te ayude a destacar y ser recordada.'
        : 'Develop a unique identity for your work that helps you stand out and be remembered.',
      priority: 'Media',
      category: 'Marca',
      estimatedTime: isSpanish ? '60 minutos' : '60 minutes',
      impact: 4,
      agentId: 'brand-developer',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Define tu propuesta única de valor' : 'Define your unique value proposition',
          description: isSpanish 
            ? `¿Qué hace especiales tus ${profile.productType}? ¿Qué los diferencia de otros?`
            : `What makes your ${profile.productType} special? How are they different from others?`,
          inputType: 'text',
          guidance: isSpanish 
            ? 'Piensa en técnica, materiales, estilo, historia personal, acabados, etc.'
            : 'Think about technique, materials, style, personal story, finishes, etc.',
          expectedOutput: isSpanish ? 'Descripción clara de tu diferenciación' : 'Clear description of your differentiation',
          validationCriteria: { hasUniqueElements: true, isSpecific: true }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Crea tu nombre de marca' : 'Create your brand name',
          description: isSpanish 
            ? 'Diseña un nombre memorable para tu trabajo artesanal'
            : 'Design a memorable name for your artisan work',
          inputType: 'text',
          guidance: isSpanish 
            ? 'Puede incluir tu nombre, el tipo de producto, o evocar emociones. Que sea fácil de recordar y pronunciar.'
            : 'Can include your name, product type, or evoke emotions. Should be easy to remember and pronounce.',
          expectedOutput: isSpanish ? 'Nombre de marca definido' : 'Defined brand name',
          validationCriteria: { isMemorable: true, isAvailable: true }
        },
        {
          stepNumber: 3,
          title: isSpanish ? 'Define tu historia de marca' : 'Define your brand story',
          description: isSpanish 
            ? 'Cuenta por qué empezaste, qué te inspira y qué quieres transmitir'
            : 'Tell why you started, what inspires you and what you want to convey',
          inputType: 'text',
          guidance: isSpanish 
            ? 'Las historias personales conectan emocionalmente con los clientes'
            : 'Personal stories emotionally connect with customers',
          expectedOutput: isSpanish ? 'Historia de marca auténtica' : 'Authentic brand story',
          validationCriteria: { isPersonal: true, isEngaging: true }
        }
      ]
    });
  }

  // Task 4: Sales Channel Development - For artisans ready to sell
  if (profile.hasSold === 'no' || profile.hasSold === 'sometimes') {
    tasks.push({
      title: isSpanish ? 'Desarrollar tus canales de venta' : 'Develop your sales channels',
      description: isSpanish 
        ? 'Identifica y prepara los mejores lugares y formas para vender tus productos.'
        : 'Identify and prepare the best places and ways to sell your products.',
      priority: 'Alta',
      category: 'Ventas',
      estimatedTime: isSpanish ? '90 minutos' : '90 minutes',
      impact: 4,
      agentId: 'sales-strategist',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Investiga mercados locales' : 'Research local markets',
          description: isSpanish 
            ? 'Encuentra ferias, mercados y eventos donde puedas vender'
            : 'Find fairs, markets and events where you can sell',
          inputType: 'checklist',
          guidance: isSpanish 
            ? 'Busca ferias artesanales, mercados de barrio, eventos culturales, bazares'
            : 'Look for craft fairs, neighborhood markets, cultural events, bazaars',
          expectedOutput: isSpanish ? 'Lista de oportunidades de venta presencial' : 'List of in-person sales opportunities',
          validationCriteria: { minOptions: 3, hasContactInfo: true }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Configura tu presencia en línea' : 'Set up your online presence',
          description: isSpanish 
            ? 'Crea perfiles en redes sociales y plataformas de venta'
            : 'Create profiles on social networks and sales platforms',
          inputType: 'checklist',
          guidance: isSpanish 
            ? 'Instagram, Facebook, WhatsApp Business son esenciales. Considera también Mercado Libre, Facebook Marketplace'
            : 'Instagram, Facebook, WhatsApp Business are essential. Also consider local marketplace platforms',
          expectedOutput: isSpanish ? 'Perfiles activos en redes sociales' : 'Active social media profiles',
          validationCriteria: { hasProfiles: true, isOptimized: true }
        }
      ]
    });
  }

  // Task 5: Production Optimization - For artisans spending significant time
  if (profile.timeInvested === 'part-time' || profile.timeInvested === 'full-time') {
    tasks.push({
      title: isSpanish ? 'Optimizar tu proceso de producción' : 'Optimize your production process',
      description: isSpanish 
        ? 'Mejora tu eficiencia para hacer más productos en menos tiempo sin perder calidad.'
        : 'Improve your efficiency to make more products in less time without losing quality.',
      priority: 'Media',
      category: 'Producción',
      estimatedTime: isSpanish ? '45 minutos' : '45 minutes',
      impact: 3,
      agentId: 'production-optimizer',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Mapea tu proceso actual' : 'Map your current process',
          description: isSpanish 
            ? 'Documenta paso a paso cómo haces un producto'
            : 'Document step by step how you make a product',
          inputType: 'checklist',
          guidance: isSpanish 
            ? 'Desde preparar materiales hasta el acabado final'
            : 'From preparing materials to final finishing',
          expectedOutput: isSpanish ? 'Mapa detallado del proceso' : 'Detailed process map',
          validationCriteria: { isComplete: true, hasTimeEstimates: true }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Identifica cuellos de botella' : 'Identify bottlenecks',
          description: isSpanish 
            ? '¿Qué pasos te toman más tiempo o te frenan?'
            : 'Which steps take the most time or slow you down?',
          inputType: 'text',
          guidance: isSpanish 
            ? 'Pueden ser técnicas complicadas, herramientas inadecuadas, o falta de organización'
            : 'Could be complicated techniques, inadequate tools, or lack of organization',
          expectedOutput: isSpanish ? 'Lista de puntos de mejora' : 'List of improvement points',
          validationCriteria: { isSpecific: true, isActionable: true }
        }
      ]
    });
  }

  return tasks;
}

export function getArtisanAgentPersonality(agentId: string, profile: ArtisanProfile, language: 'en' | 'es'): string {
  const isSpanish = language === 'es';
  const productType = profile.productType;
  
  const personalities = {
    'cost-calculator': isSpanish 
      ? `Soy tu asistente financiero especializado en artesanías. Entiendo perfectamente el valor del trabajo manual y te ayudo a establecer precios justos para tus ${productType}. Mi objetivo es que nunca vendas por debajo de lo que mereces y que tu arte sea sostenible económicamente.`
      : `I'm your financial assistant specialized in crafts. I perfectly understand the value of manual work and help you set fair prices for your ${productType}. My goal is that you never sell below what you deserve and that your art is economically sustainable.`,
    
    'financial-planner': isSpanish 
      ? `Soy tu planificador financiero que cree en el poder de vivir de tu arte. Te ayudo a crear metas realistas y alcanzables para que puedas hacer de tus ${productType} tu fuente de ingresos principal. Cada paso que planificamos te acerca más a tu sueño.`
      : `I'm your financial planner who believes in the power of living from your art. I help you create realistic and achievable goals so you can make your ${productType} your main source of income. Every step we plan brings you closer to your dream.`,
    
    'brand-developer': isSpanish 
      ? `Soy tu experto en marca personal artesanal. Entiendo que cada ${productType} que haces lleva tu esencia y te ayudo a comunicar esa magia única al mundo. Tu marca debe reflejar la pasión y calidad que pones en cada pieza.`
      : `I'm your artisan personal brand expert. I understand that each ${productType} you make carries your essence and I help you communicate that unique magic to the world. Your brand should reflect the passion and quality you put into each piece.`,
    
    'sales-strategist': isSpanish 
      ? `Soy tu estratega de ventas especializado en productos artesanales. Conozco los canales donde tu trabajo será más apreciado y te guío para encontrar clientes que valoren la calidad y dedicación de tus ${productType}.`
      : `I'm your sales strategist specialized in artisan products. I know the channels where your work will be most appreciated and guide you to find customers who value the quality and dedication of your ${productType}.`,
    
    'production-optimizer': isSpanish 
      ? `Soy tu consultor de eficiencia en producción artesanal. Respeto totalmente tu proceso creativo y te ayudo a optimizarlo sin perder la calidad que hace únicos tus ${productType}. Mi objetivo es que puedas hacer más, mejor y con menos estrés.`
      : `I'm your artisan production efficiency consultant. I fully respect your creative process and help you optimize it without losing the quality that makes your ${productType} unique. My goal is for you to do more, better and with less stress.`
  };

  return personalities[agentId] || personalities['cost-calculator'];
}
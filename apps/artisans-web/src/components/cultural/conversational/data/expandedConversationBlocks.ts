import { ConversationBlock } from '../types/conversationalTypes';

/**
 * ⚠️ DEPRECATED - Usar fusedConversationBlocks.ts en su lugar
 * 
 * Este archivo se mantiene por compatibilidad pero ya NO se usa.
 * El nuevo test tiene 12 preguntas en 4 bloques (3 por bloque).
 * 
 * Onboarding Expandido: 16 Preguntas en 4 Bloques (LEGACY)
 * 
 * Cada bloque contiene 4 preguntas profundas y estratégicas que permiten
 * al Coordinador Maestro entender completamente el contexto del artesano.
 * 
 * Flujo: Negocio → Mercado → Operación → Visión
 */

export const getExpandedConversationBlocks = (language: 'en' | 'es'): ConversationBlock[] => {
  const blocks = {
    es: [
      // BLOQUE 1: Tu Negocio (4 preguntas)
      {
        id: 'block_1_business',
        title: 'Tu Negocio Artesanal',
        subtitle: 'Paso 1 de 4 - Entendiendo tu esencia',
        agentMessage: "¡Hola! 👋 Soy tu Coordinador Personal. Antes de empezar a trabajar juntos, necesito conocerte bien. Vamos a conversar sobre tu negocio en 4 pasos simples. ¿Listo? Empecemos con lo básico.",
        strategicContext: "Este bloque establece la identidad central del negocio y permite personalizar todas las interacciones futuras.",
        questions: [
          {
            id: 'q1_business_name',
            question: '¿Cómo se llama tu marca o negocio artesanal?',
            type: 'text-input' as const,
            fieldName: 'brandName',
            placeholder: 'Ej: Alfarería Luna, Tejidos del Valle, etc.',
            explanation: 'Tu nombre me ayuda a personalizar todo nuestro trabajo juntos.',
            required: true
          },
          {
            id: 'q2_craft_type',
            question: '¿Qué tipo de artesanía trabajas?',
            type: 'single-choice' as const,
            fieldName: 'craftType',
            explanation: 'Cada tipo de artesanía tiene desafíos y oportunidades únicas.',
            required: true,
            options: [
              { id: 'textiles', label: 'Textiles', value: 'textiles', description: 'Tejidos, bordados, tapices' },
              { id: 'ceramics', label: 'Cerámica', value: 'ceramics', description: 'Alfarería, porcelana, arcilla' },
              { id: 'leather', label: 'Cuero', value: 'leather', description: 'Marroquinería, talabartería' },
              { id: 'jewelry', label: 'Joyería', value: 'jewelry', description: 'Bisutería, orfebrería' },
              { id: 'wood', label: 'Madera', value: 'wood', description: 'Carpintería, talla, ebanistería' },
              { id: 'paper', label: 'Papel', value: 'paper', description: 'Papelería, origami, cartonería' },
              { id: 'glass', label: 'Vidrio', value: 'glass', description: 'Vitrales, soplado, vitrofusión' },
              { id: 'mixed', label: 'Mixto', value: 'mixed', description: 'Combino varias técnicas' },
              { id: 'other', label: 'Otra artesanía', value: 'other', description: 'Mi trabajo es diferente' }
            ]
          },
          {
            id: 'q3_business_stage',
            question: '¿En qué etapa está tu negocio ahora mismo?',
            type: 'single-choice' as const,
            fieldName: 'businessStage',
            explanation: 'Tu etapa actual determina qué tipo de ayuda necesitas más urgentemente.',
            required: true,
            options: [
              { id: 'idea', label: 'Apenas tengo la idea', value: 'idea', description: 'Estoy empezando a pensar en esto' },
              { id: 'learning', label: 'Aprendiendo el oficio', value: 'learning', description: 'Aún perfecciono mis habilidades' },
              { id: 'first_sales', label: 'Mis primeras ventas', value: 'first_sales', description: 'Ya vendí a amigos/familia' },
              { id: 'active', label: 'Negocio activo', value: 'active', description: 'Vendo regularmente' },
              { id: 'established', label: 'Negocio establecido', value: 'established', description: 'Tengo clientes recurrentes' },
              { id: 'growing', label: 'Creciendo', value: 'growing', description: 'Expandiendo operaciones' }
            ]
          },
          {
            id: 'q4_unique_value',
            question: '¿Qué hace especial a tus productos? (Máximo 200 caracteres)',
            type: 'text-input' as const,
            fieldName: 'uniqueValueProposition',
            placeholder: 'Ej: Uso técnicas ancestrales con materiales locales, cada pieza cuenta una historia...',
            explanation: 'Tu valor único es lo que te diferencia de otros artesanos.',
            required: true
          }
        ]
      },

      // BLOQUE 2: Tu Mercado (4 preguntas)
      {
        id: 'block_2_market',
        title: 'Tu Mercado',
        subtitle: 'Paso 2 de 4 - ¿Quién compra lo que haces?',
        agentMessage: "¡Excelente! Ya entiendo tu negocio. Ahora hablemos de tu mercado. ¿Quiénes son las personas que más valoran tu trabajo? Esto es clave para ayudarte a crecer.",
        strategicContext: "Comprender el mercado objetivo permite optimizar estrategias de marketing y pricing.",
        questions: [
          {
            id: 'q5_target_customer',
            question: '¿A quién le vendes principalmente?',
            type: 'single-choice' as const,
            fieldName: 'targetCustomer',
            explanation: 'Conocer tu cliente ideal ayuda a crear mensajes de marketing más efectivos.',
            required: true,
            options: [
              { id: 'individuals', label: 'Personas individuales', value: 'individuals', description: 'Clientes finales que compran para ellos' },
              { id: 'gifts', label: 'Regalos especiales', value: 'gifts', description: 'Personas que compran para regalar' },
              { id: 'businesses', label: 'Negocios u hoteles', value: 'businesses', description: 'Empresas que compran por mayor' },
              { id: 'galleries', label: 'Galerías o tiendas', value: 'galleries', description: 'Vendo a través de intermediarios' },
              { id: 'tourists', label: 'Turistas', value: 'tourists', description: 'Vendo en zonas turísticas' },
              { id: 'mixed', label: 'Varios tipos', value: 'mixed', description: 'Tengo diferentes tipos de clientes' },
              { id: 'unclear', label: 'No estoy seguro', value: 'unclear', description: 'Aún no defino mi cliente ideal' }
            ]
          },
          {
            id: 'q6_sales_frequency',
            question: '¿Con qué frecuencia vendes?',
            type: 'single-choice' as const,
            fieldName: 'salesFrequency',
            explanation: 'La consistencia de ventas indica el nivel de validación de tu negocio.',
            required: true,
            options: [
              { id: 'never', label: 'Aún no he vendido', value: 'never' },
              { id: 'sporadic', label: 'Muy de vez en cuando', value: 'sporadic' },
              { id: 'monthly', label: 'Algunas veces al mes', value: 'monthly' },
              { id: 'weekly', label: 'Varias veces a la semana', value: 'weekly' },
              { id: 'daily', label: 'Casi todos los días', value: 'daily' }
            ]
          },
          {
            id: 'q7_pricing_clarity',
            question: '¿Qué tan claro tienes cómo poner precios a tus productos?',
            type: 'slider' as const,
            fieldName: 'pricingClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'El pricing es uno de los mayores desafíos para artesanos. Niveles: 1=Muy confundido, 5=Muy claro.',
            required: true
          },
          {
            id: 'q8_growth_goal',
            question: '¿Cuál es tu meta principal para este año?',
            type: 'single-choice' as const,
            fieldName: 'primaryGoal',
            explanation: 'Tu objetivo principal guía qué estrategias priorizaremos juntos.',
            required: true,
            options: [
              { id: 'first_sale', label: 'Hacer mi primera venta', value: 'first_sale' },
              { id: 'more_clients', label: 'Conseguir más clientes', value: 'more_clients' },
              { id: 'better_prices', label: 'Mejorar mis precios', value: 'better_prices' },
              { id: 'online_presence', label: 'Tener presencia online', value: 'online_presence' },
              { id: 'full_time', label: 'Vivir de esto tiempo completo', value: 'full_time' },
              { id: 'scale', label: 'Crecer y contratar ayuda', value: 'scale' },
              { id: 'not_sure', label: 'No estoy seguro todavía', value: 'not_sure' }
            ]
          }
        ]
      },

      // BLOQUE 3: Tu Operación (4 preguntas)
      {
        id: 'block_3_operations',
        title: 'Cómo Trabajas',
        subtitle: 'Paso 3 de 4 - Tu día a día',
        agentMessage: "Perfecto, ya entiendo tu mercado. Ahora cuéntame cómo es tu día a día. Esto me ayuda a diseñar un plan que se ajuste a tu realidad.",
        strategicContext: "Las capacidades operativas determinan la velocidad y tipo de crecimiento posible.",
        questions: [
          {
            id: 'q9_time_dedication',
            question: '¿Cuánto tiempo le dedicas a tu artesanía?',
            type: 'single-choice' as const,
            fieldName: 'timeDedication',
            explanation: 'Tu disponibilidad de tiempo afecta qué estrategias son realistas para ti.',
            required: true,
            options: [
              { id: 'hobby', label: 'Pocas horas a la semana (hobby)', value: 'hobby' },
              { id: 'part_time', label: 'Medio tiempo (10-20 hrs/semana)', value: 'part_time' },
              { id: 'almost_full', label: 'Casi tiempo completo (30+ hrs)', value: 'almost_full' },
              { id: 'full_time', label: 'Tiempo completo (40+ hrs)', value: 'full_time' },
              { id: 'intensive', label: 'Más de 50 horas semanales', value: 'intensive' }
            ]
          },
          {
            id: 'q10_team_structure',
            question: '¿Trabajas solo o con ayuda?',
            type: 'single-choice' as const,
            fieldName: 'teamSize',
            explanation: 'Saber si delegas trabajo nos ayuda a planificar el crecimiento.',
            required: true,
            options: [
              { id: 'solo', label: 'Solo yo, hago todo', value: 'solo' },
              { id: 'family_help', label: 'Con ayuda de familia ocasional', value: 'family_help' },
              { id: 'partner', label: 'Con un socio o pareja', value: 'partner' },
              { id: 'small_team', label: 'Equipo pequeño (2-4 personas)', value: 'small_team' },
              { id: 'larger_team', label: 'Equipo más grande (5+)', value: 'larger_team' }
            ]
          },
          {
            id: 'q11_biggest_challenge',
            question: '¿Cuál es tu mayor desafío ahora mismo?',
            type: 'single-choice' as const,
            fieldName: 'biggestChallenge',
            explanation: 'Identificar tu principal obstáculo me permite priorizarmejor.',
            required: true,
            options: [
              { id: 'finding_customers', label: 'Encontrar clientes', value: 'finding_customers' },
              { id: 'pricing_right', label: 'Poner los precios correctos', value: 'pricing_right' },
              { id: 'time_management', label: 'Organizar mi tiempo', value: 'time_management' },
              { id: 'production_speed', label: 'Producir más rápido', value: 'production_speed' },
              { id: 'online_presence', label: 'Estar en internet', value: 'online_presence' },
              { id: 'materials_cost', label: 'Costo de materiales', value: 'materials_cost' },
              { id: 'quality_consistency', label: 'Mantener calidad consistente', value: 'quality_consistency' },
              { id: 'legal_admin', label: 'Trámites legales', value: 'legal_admin' }
            ]
          },
          {
            id: 'q12_digital_presence',
            question: '¿Dónde estás presente en internet? (puedes elegir varios)',
            type: 'multiple-choice' as const,
            fieldName: 'digitalChannels',
            explanation: 'Tu presencia digital actual determina qué canales debemos fortalecer.',
            required: false,
            options: [
              { id: 'instagram', label: 'Instagram', value: 'instagram' },
              { id: 'facebook', label: 'Facebook', value: 'facebook' },
              { id: 'whatsapp', label: 'WhatsApp Business', value: 'whatsapp' },
              { id: 'tiktok', label: 'TikTok', value: 'tiktok' },
              { id: 'website', label: 'Sitio web propio', value: 'website' },
              { id: 'marketplace', label: 'Mercado Libre u otro marketplace', value: 'marketplace' },
              { id: 'etsy', label: 'Etsy u otras plataformas', value: 'etsy' },
              { id: 'none', label: 'Ninguna todavía', value: 'none' }
            ]
          }
        ]
      },

      // BLOQUE 4: Tu Visión (4 preguntas)
      {
        id: 'block_4_vision',
        title: 'Tu Visión',
        subtitle: 'Paso 4 de 4 - ¿Hacia dónde vamos?',
        agentMessage: "¡Ya casi terminamos! Para el último paso, necesito entender tu visión a largo plazo. ¿Qué sueñas lograr con tu artesanía?",
        strategicContext: "La visión del artesano define el tipo de apoyo y la intensidad del acompañamiento necesario.",
        questions: [
          {
            id: 'q13_dream_outcome',
            question: '¿Cuál es tu sueño con este negocio?',
            type: 'single-choice' as const,
            fieldName: 'dreamOutcome',
            explanation: 'Tu visión nos ayuda a diseñar un camino realista hacia tus objetivos.',
            required: true,
            options: [
              { id: 'extra_income', label: 'Generar un ingreso extra', value: 'extra_income' },
              { id: 'replace_job', label: 'Reemplazar mi trabajo actual', value: 'replace_job' },
              { id: 'lifestyle_business', label: 'Vivir de mi arte cómodamente', value: 'lifestyle_business' },
              { id: 'grow_team', label: 'Tener un taller con empleados', value: 'grow_team' },
              { id: 'preserve_craft', label: 'Preservar técnicas tradicionales', value: 'preserve_craft' },
              { id: 'international', label: 'Vender internacionalmente', value: 'international' },
              { id: 'legacy', label: 'Construir un legado familiar', value: 'legacy' }
            ]
          },
          {
            id: 'q14_urgency_level',
            question: '¿Qué tan urgente es para ti lograr tus objetivos?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Tu nivel de urgencia afecta la intensidad del plan que crearemos. 1=Sin prisa, 5=Muy urgente.',
            required: true
          },
          {
            id: 'q15_investment_capacity',
            question: '¿Puedes invertir en tu negocio ahora?',
            type: 'single-choice' as const,
            fieldName: 'investmentCapacity',
            explanation: 'Esto me ayuda a recomendar soluciones acordes a tu realidad financiera.',
            required: true,
            options: [
              { id: 'nothing', label: 'Nada por ahora', value: 'nothing' },
              { id: 'very_little', label: 'Muy poco (menos de $100/mes)', value: 'very_little' },
              { id: 'moderate', label: 'Moderado ($100-500/mes)', value: 'moderate' },
              { id: 'significant', label: 'Significativo ($500+/mes)', value: 'significant' },
              { id: 'time_only', label: 'Solo tiempo, no dinero', value: 'time_only' }
            ]
          },
          {
            id: 'q16_support_style',
            question: '¿Cómo te gustaría que te acompañe?',
            type: 'single-choice' as const,
            fieldName: 'supportStyle',
            explanation: 'Tu preferencia de apoyo define cómo interactuaremos juntos.',
            required: true,
            options: [
              { id: 'step_by_step', label: 'Paso a paso, con mucha guía', value: 'step_by_step', description: 'Quiero instrucciones detalladas' },
              { id: 'strategic', label: 'Dame el plan, yo ejecuto', value: 'strategic', description: 'Soy más independiente' },
              { id: 'tools_focus', label: 'Dame herramientas y automatiza', value: 'tools_focus', description: 'Prefiero sistemas automatizados' },
              { id: 'minimal', label: 'Solo puntos clave', value: 'minimal', description: 'Ya sé lo que hago' }
            ]
          }
        ]
      }
    ],

    en: [
      // BLOCK 1: Your Business (4 questions)
      {
        id: 'block_1_business',
        title: 'Your Artisan Business',
        subtitle: 'Step 1 of 4 - Understanding your essence',
        agentMessage: "Hi! 👋 I'm your Personal Coordinator. Before we start working together, I need to get to know you well. Let's talk about your business in 4 simple steps. Ready? Let's start with the basics.",
        strategicContext: "This block establishes the core business identity and allows personalizing all future interactions.",
        questions: [
          {
            id: 'q1_business_name',
            question: 'What is your brand or artisan business called?',
            type: 'text-input' as const,
            fieldName: 'brandName',
            placeholder: 'e.g., Luna Pottery, Valley Textiles, etc.',
            explanation: 'Your name helps me personalize all our work together.',
            required: true
          },
          {
            id: 'q2_craft_type',
            question: 'What type of craft do you work with?',
            type: 'single-choice' as const,
            fieldName: 'craftType',
            explanation: 'Each type of craft has unique challenges and opportunities.',
            required: true,
            options: [
              { id: 'textiles', label: 'Textiles', value: 'textiles', description: 'Weaving, embroidery, tapestries' },
              { id: 'ceramics', label: 'Ceramics', value: 'ceramics', description: 'Pottery, porcelain, clay' },
              { id: 'leather', label: 'Leather', value: 'leather', description: 'Leatherwork, saddlery' },
              { id: 'jewelry', label: 'Jewelry', value: 'jewelry', description: 'Jewelry making, goldsmithing' },
              { id: 'wood', label: 'Wood', value: 'wood', description: 'Carpentry, carving, woodwork' },
              { id: 'paper', label: 'Paper', value: 'paper', description: 'Stationery, origami, papercrafts' },
              { id: 'glass', label: 'Glass', value: 'glass', description: 'Stained glass, blown glass' },
              { id: 'mixed', label: 'Mixed', value: 'mixed', description: 'I combine various techniques' },
              { id: 'other', label: 'Other craft', value: 'other', description: 'My work is different' }
            ]
          },
          {
            id: 'q3_business_stage',
            question: 'What stage is your business at right now?',
            type: 'single-choice' as const,
            fieldName: 'businessStage',
            explanation: 'Your current stage determines what type of help you need most urgently.',
            required: true,
            options: [
              { id: 'idea', label: 'Just have the idea', value: 'idea', description: 'Starting to think about this' },
              { id: 'learning', label: 'Learning the craft', value: 'learning', description: 'Still perfecting my skills' },
              { id: 'first_sales', label: 'My first sales', value: 'first_sales', description: 'Sold to friends/family' },
              { id: 'active', label: 'Active business', value: 'active', description: 'Selling regularly' },
              { id: 'established', label: 'Established business', value: 'established', description: 'Have repeat customers' },
              { id: 'growing', label: 'Growing', value: 'growing', description: 'Expanding operations' }
            ]
          },
          {
            id: 'q4_unique_value',
            question: 'What makes your products special? (Max 200 characters)',
            type: 'text-input' as const,
            fieldName: 'uniqueValueProposition',
            placeholder: 'e.g., I use ancestral techniques with local materials, each piece tells a story...',
            explanation: 'Your unique value is what sets you apart from other artisans.',
            required: true
          }
        ]
      },

      // BLOCK 2: Your Market (4 questions)
      {
        id: 'block_2_market',
        title: 'Your Market',
        subtitle: 'Step 2 of 4 - Who buys what you make?',
        agentMessage: "Excellent! I understand your business now. Let's talk about your market. Who are the people who value your work most? This is key to helping you grow.",
        strategicContext: "Understanding the target market allows optimizing marketing and pricing strategies.",
        questions: [
          {
            id: 'q5_target_customer',
            question: 'Who do you mainly sell to?',
            type: 'single-choice' as const,
            fieldName: 'targetCustomer',
            explanation: 'Knowing your ideal customer helps create more effective marketing messages.',
            required: true,
            options: [
              { id: 'individuals', label: 'Individual people', value: 'individuals', description: 'End customers buying for themselves' },
              { id: 'gifts', label: 'Special gifts', value: 'gifts', description: 'People buying to gift' },
              { id: 'businesses', label: 'Businesses or hotels', value: 'businesses', description: 'Companies buying wholesale' },
              { id: 'galleries', label: 'Galleries or stores', value: 'galleries', description: 'Selling through intermediaries' },
              { id: 'tourists', label: 'Tourists', value: 'tourists', description: 'Selling in tourist areas' },
              { id: 'mixed', label: 'Various types', value: 'mixed', description: 'Have different customer types' },
              { id: 'unclear', label: 'Not sure', value: 'unclear', description: 'Haven\'t defined ideal customer yet' }
            ]
          },
          {
            id: 'q6_sales_frequency',
            question: 'How often do you sell?',
            type: 'single-choice' as const,
            fieldName: 'salesFrequency',
            explanation: 'Sales consistency indicates your business validation level.',
            required: true,
            options: [
              { id: 'never', label: 'Haven\'t sold yet', value: 'never' },
              { id: 'sporadic', label: 'Very occasionally', value: 'sporadic' },
              { id: 'monthly', label: 'Few times a month', value: 'monthly' },
              { id: 'weekly', label: 'Several times a week', value: 'weekly' },
              { id: 'daily', label: 'Almost daily', value: 'daily' }
            ]
          },
          {
            id: 'q7_pricing_clarity',
            question: 'How clear are you about pricing your products?',
            type: 'slider' as const,
            fieldName: 'pricingClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Pricing is one of the biggest challenges for artisans. Levels: 1=Very confused, 5=Very clear.',
            required: true
          },
          {
            id: 'q8_growth_goal',
            question: 'What is your main goal for this year?',
            type: 'single-choice' as const,
            fieldName: 'primaryGoal',
            explanation: 'Your primary goal guides which strategies we\'ll prioritize together.',
            required: true,
            options: [
              { id: 'first_sale', label: 'Make my first sale', value: 'first_sale' },
              { id: 'more_clients', label: 'Get more clients', value: 'more_clients' },
              { id: 'better_prices', label: 'Improve my pricing', value: 'better_prices' },
              { id: 'online_presence', label: 'Have online presence', value: 'online_presence' },
              { id: 'full_time', label: 'Do this full-time', value: 'full_time' },
              { id: 'scale', label: 'Grow and hire help', value: 'scale' },
              { id: 'not_sure', label: 'Not sure yet', value: 'not_sure' }
            ]
          }
        ]
      },

      // BLOCK 3: Your Operations (4 questions)
      {
        id: 'block_3_operations',
        title: 'How You Work',
        subtitle: 'Step 3 of 4 - Your day-to-day',
        agentMessage: "Perfect, I understand your market now. Tell me about your day-to-day. This helps me design a plan that fits your reality.",
        strategicContext: "Operational capabilities determine the speed and type of growth possible.",
        questions: [
          {
            id: 'q9_time_dedication',
            question: 'How much time do you dedicate to your craft?',
            type: 'single-choice' as const,
            fieldName: 'timeDedication',
            explanation: 'Your time availability affects which strategies are realistic for you.',
            required: true,
            options: [
              { id: 'hobby', label: 'Few hours a week (hobby)', value: 'hobby' },
              { id: 'part_time', label: 'Part time (10-20 hrs/week)', value: 'part_time' },
              { id: 'almost_full', label: 'Almost full time (30+ hrs)', value: 'almost_full' },
              { id: 'full_time', label: 'Full time (40+ hrs)', value: 'full_time' },
              { id: 'intensive', label: 'More than 50 hours weekly', value: 'intensive' }
            ]
          },
          {
            id: 'q10_team_structure',
            question: 'Do you work alone or with help?',
            type: 'single-choice' as const,
            fieldName: 'teamSize',
            explanation: 'Knowing if you delegate work helps us plan for growth.',
            required: true,
            options: [
              { id: 'solo', label: 'Just me, I do everything', value: 'solo' },
              { id: 'family_help', label: 'With occasional family help', value: 'family_help' },
              { id: 'partner', label: 'With a partner', value: 'partner' },
              { id: 'small_team', label: 'Small team (2-4 people)', value: 'small_team' },
              { id: 'larger_team', label: 'Larger team (5+)', value: 'larger_team' }
            ]
          },
          {
            id: 'q11_biggest_challenge',
            question: 'What is your biggest challenge right now?',
            type: 'single-choice' as const,
            fieldName: 'biggestChallenge',
            explanation: 'Identifying your main obstacle helps me prioritize better.',
            required: true,
            options: [
              { id: 'finding_customers', label: 'Finding customers', value: 'finding_customers' },
              { id: 'pricing_right', label: 'Setting right prices', value: 'pricing_right' },
              { id: 'time_management', label: 'Managing my time', value: 'time_management' },
              { id: 'production_speed', label: 'Producing faster', value: 'production_speed' },
              { id: 'online_presence', label: 'Being online', value: 'online_presence' },
              { id: 'materials_cost', label: 'Materials cost', value: 'materials_cost' },
              { id: 'quality_consistency', label: 'Maintaining consistent quality', value: 'quality_consistency' },
              { id: 'legal_admin', label: 'Legal procedures', value: 'legal_admin' }
            ]
          },
          {
            id: 'q12_digital_presence',
            question: 'Where are you present online? (you can choose several)',
            type: 'multiple-choice' as const,
            fieldName: 'digitalChannels',
            explanation: 'Your current digital presence determines which channels we should strengthen.',
            required: false,
            options: [
              { id: 'instagram', label: 'Instagram', value: 'instagram' },
              { id: 'facebook', label: 'Facebook', value: 'facebook' },
              { id: 'whatsapp', label: 'WhatsApp Business', value: 'whatsapp' },
              { id: 'tiktok', label: 'TikTok', value: 'tiktok' },
              { id: 'website', label: 'Own website', value: 'website' },
              { id: 'marketplace', label: 'Marketplace platforms', value: 'marketplace' },
              { id: 'etsy', label: 'Etsy or similar', value: 'etsy' },
              { id: 'none', label: 'None yet', value: 'none' }
            ]
          }
        ]
      },

      // BLOCK 4: Your Vision (4 questions)
      {
        id: 'block_4_vision',
        title: 'Your Vision',
        subtitle: 'Step 4 of 4 - Where are we going?',
        agentMessage: "Almost done! For the last step, I need to understand your long-term vision. What do you dream of achieving with your craft?",
        strategicContext: "The artisan's vision defines the type of support and intensity of accompaniment needed.",
        questions: [
          {
            id: 'q13_dream_outcome',
            question: 'What is your dream for this business?',
            type: 'single-choice' as const,
            fieldName: 'dreamOutcome',
            explanation: 'Your vision helps us design a realistic path towards your goals.',
            required: true,
            options: [
              { id: 'extra_income', label: 'Generate extra income', value: 'extra_income' },
              { id: 'replace_job', label: 'Replace my current job', value: 'replace_job' },
              { id: 'lifestyle_business', label: 'Live comfortably from my art', value: 'lifestyle_business' },
              { id: 'grow_team', label: 'Have a workshop with employees', value: 'grow_team' },
              { id: 'preserve_craft', label: 'Preserve traditional techniques', value: 'preserve_craft' },
              { id: 'international', label: 'Sell internationally', value: 'international' },
              { id: 'legacy', label: 'Build a family legacy', value: 'legacy' }
            ]
          },
          {
            id: 'q14_urgency_level',
            question: 'How urgent is it for you to achieve your goals?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Your urgency level affects the intensity of the plan we\'ll create. 1=No rush, 5=Very urgent.',
            required: true
          },
          {
            id: 'q15_investment_capacity',
            question: 'Can you invest in your business now?',
            type: 'single-choice' as const,
            fieldName: 'investmentCapacity',
            explanation: 'This helps me recommend solutions that fit your financial reality.',
            required: true,
            options: [
              { id: 'nothing', label: 'Nothing for now', value: 'nothing' },
              { id: 'very_little', label: 'Very little (less than $100/month)', value: 'very_little' },
              { id: 'moderate', label: 'Moderate ($100-500/month)', value: 'moderate' },
              { id: 'significant', label: 'Significant ($500+/month)', value: 'significant' },
              { id: 'time_only', label: 'Only time, no money', value: 'time_only' }
            ]
          },
          {
            id: 'q16_support_style',
            question: 'How would you like me to support you?',
            type: 'single-choice' as const,
            fieldName: 'supportStyle',
            explanation: 'Your support preference defines how we\'ll interact together.',
            required: true,
            options: [
              { id: 'step_by_step', label: 'Step by step, with lots of guidance', value: 'step_by_step', description: 'I want detailed instructions' },
              { id: 'strategic', label: 'Give me the plan, I\'ll execute', value: 'strategic', description: 'I\'m more independent' },
              { id: 'tools_focus', label: 'Give me tools and automate', value: 'tools_focus', description: 'I prefer automated systems' },
              { id: 'minimal', label: 'Just key points', value: 'minimal', description: 'I know what I\'m doing' }
            ]
          }
        ]
      }
    ]
  };

  return blocks[language];
};

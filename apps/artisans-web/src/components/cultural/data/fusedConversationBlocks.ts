/**
 * 🔒 MÓDULO ESTABLE - NO MODIFICAR SIN AUTORIZACIÓN EXPLÍCITA
 * Este archivo es parte del Growth Agent y está certificado como estable.
 * Cualquier cambio debe ser solicitado explícitamente por el usuario.
 * Ver: docs/GROWTH_MODULE_LOCKED.md
 * 
 * ACTUALIZACIÓN: Reestructurado a 30 preguntas en 6 bloques temáticos de 5 preguntas
 */

import { ConversationBlock } from '../conversational/types/conversationalTypes';

// ============================================
// BLOQUE ESPECIAL DE ONBOARDING (3 PREGUNTAS MÁS IMPORTANTES)
// ============================================
const ONBOARDING_BLOCK_ES: ConversationBlock = {
  id: 'onboarding_essentials',
  title: 'Conoce Tu Negocio',
  subtitle: 'Las 3 preguntas esenciales',
  agentMessage: "¡Hola! 👋 Soy tu agente de crecimiento y voy a conocerte mejor. No te preocupes, esto es súper rápido - solo 3 preguntas para empezar.\n\nLo importante es que ME CUENTES EN TUS PROPIAS PALABRAS. Imagina que estás hablándole a un amigo que quiere saber QUÉ HACES TÚ. Háblame en primera persona: 'YO hago...', 'MI marca...', 'TRABAJO desde...'.\n\n✨ Empecemos:",
  strategicContext: "Esta información me ayuda a identificar tu tipo de artesanía, nivel de experiencia y lo que te hace único. Entre más profundo y detallado seas, mejores recomendaciones personalizadas recibirás.",
  questions: [
    {
      id: 'business_description',
      question: '✨ Cuéntame sobre TI: ¿Qué HACES? ¿Dónde ESTÁS? ¿Qué TE hace especial?',
      type: 'long_text_with_ai' as const,
      fieldName: 'businessDescription',
      placeholder: 'Escribe en primera persona, como si me estuvieras contando a mí directamente...\n\n💡 Un buen ejemplo:\n\n"YO trabajo en Oaxaca haciendo cerámica. MI marca se llama Cerámica Luna. HAGO piezas funcionales usando técnicas de esmaltado japonés que aprendí en Kyoto. ME especializo en vajilla para rituales de té. Lo que ME hace diferente es que combino la tradición japonesa con diseños de la naturaleza mexicana..."\n\n📝 Intenta incluir:\n• Si tienes nombre de marca (está bien si no tienes)\n• TU ubicación\n• Qué productos HACES TÚ\n• Qué técnicas USAS\n• Qué TE hace único\n\n👉 Escribe al menos 50 palabras para que pueda conocerte bien',
      explanation: '💡 Tips: Escribe en primera persona (YO hago..., MI marca...). Incluye tu ubicación, productos que haces, técnicas que usas y qué te hace diferente. Mínimo 50 palabras.',
      required: true,
      enableDictation: true,
      aiExtraction: {
        enabled: true,
        fields: ['businessName', 'craftType', 'location', 'differentiator']
      }
    },
    {
      id: 'sales_status',
      question: '¿Cuál es tu situación actual de ventas?',
      type: 'single-choice' as const,
      fieldName: 'salesStatus',
      explanation: 'Tu realidad comercial me ayuda a entender en qué etapa estás y qué necesitas.',
      required: true,
      options: [
        { id: 'not_yet', label: 'Aún no he vendido', value: 'not_yet', description: 'Estoy preparándome' },
        { id: 'first_sales', label: 'He hecho mis primeras ventas', value: 'first_sales', description: '1-5 ventas en total' },
        { id: 'occasional', label: 'Vendo ocasionalmente', value: 'occasional', description: 'Algunas ventas al mes' },
        { id: 'regular', label: 'Vendo regularmente', value: 'regular', description: 'Varias ventas por semana' },
        { id: 'consistent', label: 'Vendo consistentemente', value: 'consistent', description: 'Flujo constante de pedidos' }
      ]
    },
    {
      id: 'target_customer',
      question: '¿A quién le vendes principalmente?',
      type: 'single-choice' as const,
      fieldName: 'targetCustomer',
      explanation: 'Diferentes audiencias requieren diferentes estrategias de venta.',
      required: true,
      options: [
        { id: 'individuals', label: 'Personas individuales', value: 'individuals', description: 'Gente que compra para sí misma' },
        { id: 'businesses', label: 'Tiendas o negocios', value: 'businesses', description: 'Negocios que revenden' },
        { id: 'both', label: 'Ambos', value: 'both', description: 'Vendo a personas y negocios' },
        { id: 'unsure', label: 'Aún no estoy seguro/a', value: 'unsure', description: 'Todavía lo estoy descubriendo' }
      ]
    }
  ]
};

const ONBOARDING_BLOCK_EN: ConversationBlock = {
  id: 'onboarding_essentials',
  title: 'Know Your Business',
  subtitle: 'The 3 essential questions',
  agentMessage: "Hello! 👋 I'm your growth agent and I'm going to get to know you better. Don't worry, this is super quick - just 3 questions to start.\n\nThe important thing is that you TELL ME IN YOUR OWN WORDS. Imagine you're talking to a friend who wants to know WHAT YOU DO. Speak to me in first person: 'I make...', 'MY brand...', 'I WORK from...'\n\n✨ Let's get started:",
  strategicContext: "This information helps me identify your craft type, experience level, and what makes you unique. The deeper and more detailed you are, the better personalized recommendations you'll receive.",
  questions: [
    {
      id: 'business_description',
      question: '✨ Tell me about YOU: What do YOU DO? Where ARE YOU? What makes YOU special?',
      type: 'long_text_with_ai' as const,
      fieldName: 'businessDescription',
      placeholder: 'Write in first person, as if you were telling me directly...\n\n💡 A good example:\n\n"I work in Oaxaca making ceramics. MY brand is called Cerámica Luna. I MAKE functional pieces using Japanese glazing techniques I learned in Kyoto. I specialize in tea ceremony tableware. What makes ME different is that I combine Japanese tradition with Mexican nature designs..."\n\n📝 Try to include:\n• If you have a brand name (it\'s okay if you don\'t)\n• YOUR location\n• What products YOU MAKE\n• What techniques YOU USE\n• What makes YOU unique\n\n👉 Write at least 50 words so I can get to know you well',
      explanation: '💡 Tips: Write in first person (I make..., MY brand...). Include your location, products you make, techniques you use, and what makes you different. Minimum 50 words.',
      required: true,
      enableDictation: true,
      aiExtraction: {
        enabled: true,
        fields: ['businessName', 'craftType', 'location', 'differentiator']
      }
    },
    {
      id: 'sales_status',
      question: 'What is your current sales situation?',
      type: 'single-choice' as const,
      fieldName: 'salesStatus',
      explanation: 'Your commercial reality helps me understand what stage you\'re at and what you need.',
      required: true,
      options: [
        { id: 'not_yet', label: 'I haven\'t sold yet', value: 'not_yet', description: 'I\'m getting ready' },
        { id: 'first_sales', label: 'I\'ve made my first sales', value: 'first_sales', description: '1-5 total sales' },
        { id: 'occasional', label: 'I sell occasionally', value: 'occasional', description: 'Some sales per month' },
        { id: 'regular', label: 'I sell regularly', value: 'regular', description: 'Several sales per week' },
        { id: 'consistent', label: 'I sell consistently', value: 'consistent', description: 'Constant flow of orders' }
      ]
    },
    {
      id: 'target_customer',
      question: 'Who do you sell to mainly?',
      type: 'single-choice' as const,
      fieldName: 'targetCustomer',
      explanation: 'Different audiences require different sales strategies.',
      required: true,
      options: [
        { id: 'individuals', label: 'Individual people', value: 'individuals', description: 'People buying for themselves' },
        { id: 'businesses', label: 'Stores or businesses', value: 'businesses', description: 'Businesses that resell' },
        { id: 'both', label: 'Both', value: 'both', description: 'I sell to people and businesses' },
        { id: 'unsure', label: 'Not sure yet', value: 'unsure', description: 'Still figuring it out' }
      ]
    }
  ]
};

// ============================================
// 6 BLOQUES TEMÁTICOS DE 5 PREGUNTAS CADA UNO (30 PREGUNTAS TOTALES)
// ============================================

export const getFusedConversationBlocks = (language: 'en' | 'es'): ConversationBlock[] => {
  const blocksES: ConversationBlock[] = [
    // BLOQUE 1: IDENTIDAD Y EXPERIENCIA ARTESANAL 🎨
    {
      id: 'identidad_experiencia',
      title: 'Identidad y Experiencia Artesanal',
      subtitle: 'Entendiendo tu oficio y trayectoria',
      agentMessage: "Ahora voy a conocer más sobre tu identidad artesanal, tu experiencia y cómo trabajas. 🎨",
      strategicContext: "Tu nivel de experiencia y estructura de trabajo me ayudan a personalizar las recomendaciones según tu realidad actual.",
      questions: [
        {
          id: 'experience_time',
          question: '¿Cuánto tiempo llevas trabajando en tu oficio artesanal?',
          type: 'single-choice' as const,
          fieldName: 'experienceTime',
          explanation: 'Tu experiencia me ayuda a entender tu nivel de madurez y necesidades específicas.',
          required: true,
          options: [
            { id: 'less_1', label: 'Menos de 1 año', value: 'less_1', description: 'Estoy comenzando' },
            { id: '1_3', label: '1-3 años', value: '1_3', description: 'Aún aprendiendo' },
            { id: '3_5', label: '3-5 años', value: '3_5', description: 'Con experiencia' },
            { id: '5_10', label: '5-10 años', value: '5_10', description: 'Consolidado/a' },
            { id: 'more_10', label: 'Más de 10 años', value: 'more_10', description: 'Maestro/a artesano/a' }
          ]
        },
        {
          id: 'work_structure',
          question: '¿Cómo está estructurado tu trabajo?',
          type: 'single-choice' as const,
          fieldName: 'workStructure',
          explanation: 'Entender si trabajas solo/a o en equipo me ayuda a darte recomendaciones específicas.',
          required: true,
          options: [
            { id: 'solo', label: 'Trabajo solo/a', value: 'solo', description: 'Hago todo yo mismo/a' },
            { id: 'with_help', label: 'Con ayuda ocasional', value: 'with_help', description: 'Familiares o amigos me ayudan a veces' },
            { id: 'small_team', label: 'Equipo pequeño', value: 'small_team', description: '2-3 personas trabajando' },
            { id: 'established_team', label: 'Equipo establecido', value: 'established_team', description: '4+ personas en mi taller' }
          ]
        },
        {
          id: 'production_capacity',
          question: '¿Cuántas piezas produces aproximadamente al mes?',
          type: 'single-choice' as const,
          fieldName: 'productionCapacity',
          explanation: 'Tu capacidad de producción me ayuda a entender el tamaño de tu operación.',
          required: true,
          options: [
            { id: 'very_low', label: '1-5 piezas', value: 'very_low', description: 'Producción muy limitada' },
            { id: 'low', label: '6-20 piezas', value: 'low', description: 'Producción pequeña' },
            { id: 'medium', label: '21-50 piezas', value: 'medium', description: 'Producción mediana' },
            { id: 'high', label: '51-100 piezas', value: 'high', description: 'Producción alta' },
            { id: 'very_high', label: 'Más de 100 piezas', value: 'very_high', description: 'Producción a escala' }
          ]
        },
        {
          id: 'quality_control',
          question: '¿Cómo aseguras la calidad de tus productos?',
          type: 'single-choice' as const,
          fieldName: 'qualityControl',
          explanation: 'Los procesos de calidad reflejan tu nivel de profesionalización.',
          required: true,
          options: [
            { id: 'intuitive', label: 'De forma intuitiva', value: 'intuitive', description: 'Confío en mi ojo y experiencia' },
            { id: 'basic_checks', label: 'Revisiones básicas', value: 'basic_checks', description: 'Reviso cada pieza antes de vender' },
            { id: 'documented', label: 'Proceso documentado', value: 'documented', description: 'Tengo una lista de verificación escrita' },
            { id: 'systematic', label: 'Sistema establecido', value: 'systematic', description: 'Proceso formal de control de calidad' }
          ]
        },
        {
          id: 'business_location',
          question: '¿Dónde vendes principalmente?',
          type: 'single-choice' as const,
          fieldName: 'businessLocation',
          explanation: 'El lugar donde vendes determina tu estrategia de alcance.',
          required: true,
          options: [
            { id: 'local', label: 'Solo en mi localidad', value: 'local', description: 'Ventas en persona' },
            { id: 'regional', label: 'En mi región', value: 'regional', description: 'Varias ciudades cercanas' },
            { id: 'national', label: 'A nivel nacional', value: 'national', description: 'Todo el país' },
            { id: 'international', label: 'Internacional', value: 'international', description: 'Vendo a otros países' }
          ]
        }
      ]
    },
    // BLOQUE 2: VENTAS Y MONETIZACIÓN 💰
    {
      id: 'ventas_monetizacion',
      title: 'Ventas y Monetización',
      subtitle: 'Tu realidad comercial y sistema de precios',
      agentMessage: "Ahora hablemos de dinero. No te preocupes, es para ayudarte a mejorar tu rentabilidad. 💰",
      strategicContext: "Entender tu sistema de precios y seguimiento financiero es clave para tu crecimiento sostenible.",
      questions: [
        {
          id: 'pricing_method',
          question: '¿Cómo defines tus precios?',
          type: 'single-choice' as const,
          fieldName: 'pricingMethod',
          explanation: 'Tu método de fijación de precios impacta directamente en tu rentabilidad.',
          required: true,
          options: [
            { id: 'feeling', label: 'Por intuición', value: 'feeling', description: 'Lo que siento que vale' },
            { id: 'market', label: 'Viendo el mercado', value: 'market', description: 'Me fijo en otros' },
            { id: 'costs_basic', label: 'Costos + margen básico', value: 'costs_basic', description: 'Sumo mis costos y agrego algo' },
            { id: 'costs_detailed', label: 'Costos detallados', value: 'costs_detailed', description: 'Calculo todo: materiales, tiempo, overhead' },
            { id: 'value_based', label: 'Basado en valor', value: 'value_based', description: 'Según el valor que aporto al cliente' }
          ]
        },
        {
          id: 'profit_clarity',
          question: '¿Qué tan claro tienes tu margen de ganancia?',
          type: 'single-choice' as const,
          fieldName: 'profitClarity',
          explanation: 'Conocer tu margen real es fundamental para tomar decisiones.',
          required: true,
          options: [
            { id: 'no_idea', label: 'No tengo idea', value: 'no_idea', description: 'No llevo control' },
            { id: 'rough_estimate', label: 'Tengo una idea aproximada', value: 'rough_estimate', description: 'Calculo a ojo' },
            { id: 'somewhat_clear', label: 'Lo tengo más o menos claro', value: 'somewhat_clear', description: 'Llevo algunos registros' },
            { id: 'very_clear', label: 'Lo tengo muy claro', value: 'very_clear', description: 'Llevo control detallado' },
            { id: 'precise', label: 'Lo tengo calculado con precisión', value: 'precise', description: 'Tengo todo documentado' }
          ]
        },
        {
          id: 'pricing_strategy',
          question: '¿Revisas y ajustas tus precios regularmente?',
          type: 'single-choice' as const,
          fieldName: 'pricingStrategy',
          explanation: 'La flexibilidad en tus precios demuestra adaptabilidad al mercado.',
          required: true,
          options: [
            { id: 'never', label: 'Nunca los cambio', value: 'never', description: 'Mis precios son fijos' },
            { id: 'rarely', label: 'Rara vez', value: 'rarely', description: 'Solo si cambian mucho los costos' },
            { id: 'yearly', label: 'Una vez al año', value: 'yearly', description: 'Revisión anual' },
            { id: 'quarterly', label: 'Trimestralmente', value: 'quarterly', description: 'Cada 3 meses' },
            { id: 'ongoing', label: 'Constantemente', value: 'ongoing', description: 'Los ajusto según necesidad' }
          ]
        },
        {
          id: 'financial_tracking',
          question: '¿Llevas registro de tus ingresos y gastos?',
          type: 'single-choice' as const,
          fieldName: 'financialTracking',
          explanation: 'El control financiero es la base de un negocio sostenible.',
          required: true,
          options: [
            { id: 'no_tracking', label: 'No llevo registro', value: 'no_tracking', description: 'Solo en mi cabeza' },
            { id: 'basic_notes', label: 'Apuntes básicos', value: 'basic_notes', description: 'Anoto lo importante' },
            { id: 'spreadsheet', label: 'En una hoja de cálculo', value: 'spreadsheet', description: 'Excel o Google Sheets' },
            { id: 'accounting_software', label: 'Software contable', value: 'accounting_software', description: 'Uso una app especializada' },
            { id: 'accountant', label: 'Con contador/a', value: 'accountant', description: 'Tengo soporte profesional' }
          ]
        },
        {
          id: 'growth_goal',
          question: '¿Cuál es tu objetivo principal de crecimiento?',
          type: 'single-choice' as const,
          fieldName: 'growthGoal',
          explanation: 'Tu objetivo guía las recomendaciones que te daré.',
          required: true,
          options: [
            { id: 'stable_income', label: 'Ingresos estables', value: 'stable_income', description: 'Vivir de mi arte' },
            { id: 'scale_production', label: 'Escalar producción', value: 'scale_production', description: 'Producir y vender más' },
            { id: 'premium_brand', label: 'Marca premium', value: 'premium_brand', description: 'Posicionamiento de lujo' },
            { id: 'impact', label: 'Impacto social', value: 'impact', description: 'Generar cambio en mi comunidad' },
            { id: 'balance', label: 'Balance vida-trabajo', value: 'balance', description: 'Vivir bien sin tanto estrés' }
          ]
        }
      ]
    },
    // BLOQUE 3: CLIENTES Y MERCADO 🎯
    {
      id: 'clientes_mercado',
      title: 'Clientes y Mercado',
      subtitle: 'Conociendo tu audiencia y canales de venta',
      agentMessage: "Hablemos de tus clientes. Conocer bien a quién le vendes es clave para crecer. 🎯",
      strategicContext: "La claridad sobre tu audiencia y canales determina tu estrategia de marketing y ventas.",
      questions: [
        {
          id: 'customer_knowledge',
          question: '¿Qué tan bien conoces a tus clientes?',
          type: 'single-choice' as const,
          fieldName: 'customerKnowledge',
          explanation: 'Conocer profundamente a tus clientes te permite servirles mejor.',
          required: true,
          options: [
            { id: 'dont_know', label: 'No los conozco bien', value: 'dont_know', description: 'Solo vendo y ya' },
            { id: 'basic', label: 'Sé algunas cosas básicas', value: 'basic', description: 'Edad, género, ubicación' },
            { id: 'good', label: 'Los conozco bien', value: 'good', description: 'Hablo con ellos regularmente' },
            { id: 'very_good', label: 'Los conozco muy bien', value: 'very_good', description: 'Sé qué necesitan y quieren' },
            { id: 'deeply', label: 'Los conozco profundamente', value: 'deeply', description: 'Tengo perfiles detallados' }
          ]
        },
        {
          id: 'promotion_channels',
          question: '¿Dónde promocionas tus productos? (Selecciona todos los que uses)',
          type: 'multiple-choice' as const,
          fieldName: 'promotionChannels',
          explanation: 'Tus canales de promoción determinan tu alcance actual.',
          required: true,
          options: [
            { id: 'word_of_mouth', label: 'Recomendaciones', value: 'word_of_mouth', description: 'Boca a boca' },
            { id: 'instagram', label: 'Instagram', value: 'instagram' },
            { id: 'facebook', label: 'Facebook', value: 'facebook' },
            { id: 'whatsapp', label: 'WhatsApp', value: 'whatsapp' },
            { id: 'website', label: 'Sitio web', value: 'website' },
            { id: 'marketplace', label: 'Marketplaces', value: 'marketplace', description: 'Etsy, MercadoLibre, etc.' },
            { id: 'fairs', label: 'Ferias', value: 'fairs', description: 'Eventos presenciales' },
            { id: 'stores', label: 'Tiendas físicas', value: 'stores', description: 'Vendo en tiendas de terceros' }
          ]
        },
        {
          id: 'customer_feedback',
          question: '¿Cómo recoges opiniones de tus clientes?',
          type: 'single-choice' as const,
          fieldName: 'customerFeedback',
          explanation: 'El feedback de clientes es tu mejor herramienta de mejora.',
          required: true,
          options: [
            { id: 'dont_ask', label: 'No pregunto', value: 'dont_ask', description: 'Espero que me digan si hay algo' },
            { id: 'informal', label: 'Conversaciones casuales', value: 'informal', description: 'Platico con ellos ocasionalmente' },
            { id: 'after_sale', label: 'Pregunto después de vender', value: 'after_sale', description: 'Les escribo para saber cómo les fue' },
            { id: 'surveys', label: 'Encuestas', value: 'surveys', description: 'Envío formularios estructurados' },
            { id: 'systematic', label: 'Sistema establecido', value: 'systematic', description: 'Tengo un proceso formal de feedback' }
          ]
        },
        {
          id: 'biggest_challenge',
          question: '¿Cuál es tu mayor desafío ahora mismo?',
          type: 'textarea' as const,
          fieldName: 'biggestChallenge',
          placeholder: 'Cuéntame qué es lo que más te preocupa o te frena en este momento...\n\nEjemplos:\n• "No logro vender lo suficiente"\n• "No tengo tiempo para todo"\n• "Mis precios están muy bajos pero no sé cómo subirlos"\n• "No sé cómo llegar a más clientes"\n\nSé específico/a para que pueda ayudarte mejor.',
          explanation: 'Tu mayor desafío me ayuda a priorizar las recomendaciones más relevantes para ti.',
          required: true,
          enableDictation: true
        },
        {
          id: 'online_presence',
          question: '¿Dónde tienes presencia online? (Selecciona todos)',
          type: 'multiple-choice' as const,
          fieldName: 'onlinePresence',
          explanation: 'Tu presencia digital determina tu visibilidad y alcance.',
          required: true,
          options: [
            { id: 'none', label: 'No tengo presencia online', value: 'none' },
            { id: 'instagram', label: 'Instagram', value: 'instagram' },
            { id: 'facebook', label: 'Facebook', value: 'facebook' },
            { id: 'whatsapp_business', label: 'WhatsApp Business', value: 'whatsapp_business' },
            { id: 'own_website', label: 'Sitio web propio', value: 'own_website' },
            { id: 'online_store', label: 'Tienda online', value: 'online_store' },
            { id: 'marketplaces', label: 'Marketplaces', value: 'marketplaces', description: 'Etsy, Amazon Handmade, etc.' },
            { id: 'pinterest', label: 'Pinterest', value: 'pinterest' },
            { id: 'tiktok', label: 'TikTok', value: 'tiktok' }
          ]
        }
      ]
    },
    // BLOQUE 4: MARCA Y PRESENCIA DIGITAL 🌐
    {
      id: 'marca_digital',
      title: 'Marca y Presencia Digital',
      subtitle: 'Tu identidad de marca y comunicación',
      agentMessage: "Ahora vamos a hablar de tu marca y cómo te comunicas con el mundo. 🌐",
      strategicContext: "Una marca fuerte y consistente genera confianza y te diferencia de la competencia.",
      questions: [
        {
          id: 'brand_identity',
          question: '¿Tienes una identidad visual definida para tu marca?',
          type: 'single-choice' as const,
          fieldName: 'brandIdentity',
          explanation: 'Tu identidad visual es cómo te reconocen visualmente tus clientes.',
          required: true,
          options: [
            { id: 'no_brand', label: 'No tengo marca aún', value: 'no_brand', description: 'Solo uso mi nombre' },
            { id: 'name_only', label: 'Solo nombre', value: 'name_only', description: 'Tengo nombre pero sin diseño' },
            { id: 'basic_logo', label: 'Logo básico', value: 'basic_logo', description: 'Tengo un logo simple' },
            { id: 'defined_identity', label: 'Identidad definida', value: 'defined_identity', description: 'Logo, colores, tipografía' },
            { id: 'complete_system', label: 'Sistema completo', value: 'complete_system', description: 'Identidad aplicada en todos mis materiales' }
          ]
        },
        {
          id: 'marketing_consistency',
          question: '¿Qué tan consistente es tu comunicación de marca?',
          type: 'single-choice' as const,
          fieldName: 'marketingConsistency',
          explanation: 'La consistencia genera reconocimiento y profesionalismo.',
          required: true,
          options: [
            { id: 'not_consistent', label: 'Nada consistente', value: 'not_consistent', description: 'Cada publicación es diferente' },
            { id: 'somewhat', label: 'Un poco consistente', value: 'somewhat', description: 'Trato de mantener un estilo' },
            { id: 'mostly', label: 'Mayormente consistente', value: 'mostly', description: 'Uso colores y estilo similar' },
            { id: 'very', label: 'Muy consistente', value: 'very', description: 'Tengo guía de estilo' },
            { id: 'always', label: 'Siempre consistente', value: 'always', description: 'Todo sigue mi identidad de marca' }
          ]
        },
        {
          id: 'digital_tools',
          question: '¿Qué herramientas digitales usas? (Selecciona todas)',
          type: 'multiple-choice' as const,
          fieldName: 'digitalTools',
          explanation: 'Las herramientas que uses determinan tu eficiencia operativa.',
          required: true,
          options: [
            { id: 'none', label: 'No uso herramientas digitales', value: 'none' },
            { id: 'whatsapp', label: 'WhatsApp para ventas', value: 'whatsapp' },
            { id: 'social_media', label: 'Redes sociales', value: 'social_media' },
            { id: 'spreadsheets', label: 'Hojas de cálculo', value: 'spreadsheets' },
            { id: 'design_tools', label: 'Herramientas de diseño', value: 'design_tools', description: 'Canva, Photoshop, etc.' },
            { id: 'payment_apps', label: 'Apps de pago', value: 'payment_apps', description: 'PayPal, Stripe, etc.' },
            { id: 'inventory', label: 'Control de inventario', value: 'inventory' },
            { id: 'crm', label: 'CRM o gestión de clientes', value: 'crm' },
            { id: 'email_marketing', label: 'Email marketing', value: 'email_marketing' }
          ]
        },
        {
          id: 'product_development',
          question: '¿Cómo desarrollas nuevos productos?',
          type: 'single-choice' as const,
          fieldName: 'productDevelopment',
          explanation: 'Tu proceso de innovación muestra tu capacidad de adaptación.',
          required: true,
          options: [
            { id: 'intuition', label: 'Por intuición', value: 'intuition', description: 'Hago lo que me gusta' },
            { id: 'customer_requests', label: 'Por pedidos', value: 'customer_requests', description: 'Cuando clientes me piden algo' },
            { id: 'market_observation', label: 'Observando el mercado', value: 'market_observation', description: 'Veo qué funciona' },
            { id: 'planned_testing', label: 'Pruebas planificadas', value: 'planned_testing', description: 'Hago prototipos y los pruebo' },
            { id: 'systematic', label: 'Proceso sistemático', value: 'systematic', description: 'Investigación + desarrollo + validación' }
          ]
        },
        {
          id: 'long_term_vision',
          question: '¿Dónde te ves con tu negocio en 3-5 años?',
          type: 'textarea' as const,
          fieldName: 'longTermVision',
          placeholder: 'Cuéntame tu visión a largo plazo...\n\n💭 Algunas ideas:\n• ¿Qué tamaño quieres que tenga tu negocio?\n• ¿Quieres tener un equipo? ¿De cuántas personas?\n• ¿Quieres tener un taller más grande?\n• ¿Quieres exportar internacionalmente?\n• ¿Qué impacto quieres generar?\n\nSueña en grande, no te limites.',
          explanation: 'Tu visión me ayuda a alinear las recomendaciones con tus objetivos a largo plazo.',
          required: true,
          enableDictation: true
        }
      ]
    },
    // BLOQUE 5: OPERACIONES Y CRECIMIENTO 🚀
    {
      id: 'operaciones_crecimiento',
      title: 'Operaciones y Crecimiento',
      subtitle: 'Capacidad operativa y mentalidad de crecimiento',
      agentMessage: "Hablemos de cómo operas y qué tan preparado/a estás para crecer. 🚀",
      strategicContext: "Tu capacidad operativa y mentalidad determinan qué tan rápido puedes escalar.",
      questions: [
        {
          id: 'delegation_ability',
          question: '¿Qué tan cómodo/a te sientes delegando tareas?',
          type: 'single-choice' as const,
          fieldName: 'delegationAbility',
          explanation: 'Delegar es esencial para crecer más allá de tu capacidad individual.',
          required: true,
          options: [
            { id: 'never', label: 'Nunca delego', value: 'never', description: 'Prefiero hacerlo todo yo' },
            { id: 'rarely', label: 'Rara vez delego', value: 'rarely', description: 'Solo si es absolutamente necesario' },
            { id: 'sometimes', label: 'A veces delego', value: 'sometimes', description: 'Tareas sencillas' },
            { id: 'often', label: 'Delego seguido', value: 'often', description: 'Cuando alguien puede hacerlo mejor' },
            { id: 'always', label: 'Delego todo lo que puedo', value: 'always', description: 'Me enfoco en mi zona de genio' }
          ]
        },
        {
          id: 'team_management',
          question: '¿Cómo organizas el trabajo en tu taller/negocio?',
          type: 'single-choice' as const,
          fieldName: 'teamManagement',
          explanation: 'Tu sistema de organización refleja tu nivel de estructuración.',
          required: true,
          options: [
            { id: 'no_system', label: 'Sin sistema', value: 'no_system', description: 'Hago lo que surge en el momento' },
            { id: 'mental_list', label: 'Lista mental', value: 'mental_list', description: 'Tengo claro qué hacer pero no lo escribo' },
            { id: 'basic_lists', label: 'Listas de tareas', value: 'basic_lists', description: 'Anoto pendientes' },
            { id: 'calendar_planning', label: 'Planificación con calendario', value: 'calendar_planning', description: 'Organizo mi tiempo semanalmente' },
            { id: 'project_management', label: 'Gestión de proyectos', value: 'project_management', description: 'Uso apps como Trello, Asana, Notion' }
          ]
        },
        {
          id: 'experimentation',
          question: '¿Qué tan abierto/a estás a probar cosas nuevas?',
          type: 'single-choice' as const,
          fieldName: 'experimentation',
          explanation: 'La experimentación es clave para innovar y adaptarse.',
          required: true,
          options: [
            { id: 'never', label: 'Prefiero no arriesgar', value: 'never', description: 'Me quedo con lo conocido' },
            { id: 'rarely', label: 'Solo si es necesario', value: 'rarely', description: 'Experimento con precaución' },
            { id: 'sometimes', label: 'De vez en cuando', value: 'sometimes', description: 'Pruebo cosas pequeñas' },
            { id: 'often', label: 'Frecuentemente', value: 'often', description: 'Me gusta experimentar' },
            { id: 'always', label: 'Constantemente', value: 'always', description: 'Siempre busco innovar' }
          ]
        },
        {
          id: 'growth_timeline',
          question: '¿En cuánto tiempo quieres lograr tus objetivos principales?',
          type: 'single-choice' as const,
          fieldName: 'growthTimeline',
          explanation: 'Tu urgencia determina la agresividad de la estrategia.',
          required: true,
          options: [
            { id: '3_6_months', label: '3-6 meses', value: '3_6_months', description: 'Necesito resultados rápidos' },
            { id: '6_12_months', label: '6-12 meses', value: '6_12_months', description: 'En menos de un año' },
            { id: '1_2_years', label: '1-2 años', value: '1_2_years', description: 'Tengo tiempo para construir' },
            { id: '3_5_years', label: '3-5 años', value: '3_5_years', description: 'Visión a mediano plazo' },
            { id: 'no_rush', label: 'Sin prisa', value: 'no_rush', description: 'Voy a mi propio ritmo' }
          ]
        },
        {
          id: 'environmental_practices',
          question: '¿Qué prácticas sostenibles implementas? (Selecciona todas)',
          type: 'multiple-choice' as const,
          fieldName: 'environmentalPractices',
          explanation: 'La sostenibilidad es cada vez más valorada por los clientes.',
          required: true,
          options: [
            { id: 'none_yet', label: 'Ninguna aún', value: 'none_yet', description: 'No he empezado' },
            { id: 'waste_reduction', label: 'Reducción de residuos', value: 'waste_reduction' },
            { id: 'recycling', label: 'Reciclaje de materiales', value: 'recycling' },
            { id: 'local_materials', label: 'Materiales locales', value: 'local_materials' },
            { id: 'eco_packaging', label: 'Empaques ecológicos', value: 'eco_packaging' },
            { id: 'natural_materials', label: 'Materiales naturales', value: 'natural_materials' },
            { id: 'water_conservation', label: 'Ahorro de agua', value: 'water_conservation' },
            { id: 'renewable_energy', label: 'Energías renovables', value: 'renewable_energy' },
            { id: 'upcycling', label: 'Upcycling/reutilización', value: 'upcycling' }
          ]
        }
      ]
    },
    // BLOQUE 6: IMPACTO Y VISIÓN DE FUTURO 🌱
    {
      id: 'impacto_vision',
      title: 'Impacto y Visión de Futuro',
      subtitle: 'Tu legado y contribución al mundo',
      agentMessage: "Finalmente, hablemos del impacto que quieres generar y tu legado artesanal. 🌱",
      strategicContext: "Tu propósito más allá de las ventas es lo que da sentido profundo a tu trabajo.",
      questions: [
        {
          id: 'social_impact',
          question: '¿Cómo generas impacto social con tu trabajo?',
          type: 'single-choice' as const,
          fieldName: 'socialImpact',
          explanation: 'El impacto social suma valor a tu propuesta y atrae clientes conscientes.',
          required: true,
          options: [
            { id: 'none_yet', label: 'Aún no genero impacto social', value: 'none_yet', description: 'Me enfoco solo en vender' },
            { id: 'employment', label: 'Genero empleos', value: 'employment', description: 'Doy trabajo a otras personas' },
            { id: 'skills_transfer', label: 'Enseño mi oficio', value: 'skills_transfer', description: 'Capacito a otros artesanos' },
            { id: 'community_support', label: 'Apoyo a mi comunidad', value: 'community_support', description: 'Trabajo con grupos locales' },
            { id: 'preservation', label: 'Preservo tradiciones', value: 'preservation', description: 'Mantengo técnicas ancestrales vivas' },
            { id: 'fair_trade', label: 'Comercio justo', value: 'fair_trade', description: 'Pago precios justos a proveedores' }
          ]
        },
        {
          id: 'ethical_sourcing',
          question: '¿Cómo obtienes tus materiales principales?',
          type: 'single-choice' as const,
          fieldName: 'ethicalSourcing',
          explanation: 'El origen de tus materiales impacta en tu huella ambiental y social.',
          required: true,
          options: [
            { id: 'wherever', label: 'Donde sea más barato', value: 'wherever', description: 'Precio es lo principal' },
            { id: 'local_when_possible', label: 'Local cuando puedo', value: 'local_when_possible', description: 'Prefiero local pero no siempre' },
            { id: 'mostly_local', label: 'Mayormente local', value: 'mostly_local', description: 'Priorizo proveedores cercanos' },
            { id: 'all_local', label: 'Todo local', value: 'all_local', description: 'Solo compro en mi región' },
            { id: 'ethical_certified', label: 'Certificado ético', value: 'ethical_certified', description: 'Solo materiales con certificación' }
          ]
        },
        {
          id: 'product_customization',
          question: '¿Ofreces productos personalizados o hechos a medida?',
          type: 'single-choice' as const,
          fieldName: 'productCustomization',
          explanation: 'La personalización puede ser una ventaja competitiva importante.',
          required: true,
          options: [
            { id: 'no_customization', label: 'No, solo productos estándar', value: 'no_customization', description: 'Hago lo mismo siempre' },
            { id: 'minimal', label: 'Personalizaciones mínimas', value: 'minimal', description: 'Pequeños cambios como colores' },
            { id: 'moderate', label: 'Personalizaciones moderadas', value: 'moderate', description: 'Puedo adaptar varios aspectos' },
            { id: 'fully_custom', label: 'Completamente a medida', value: 'fully_custom', description: 'Cada pieza es única según el cliente' },
            { id: 'both_lines', label: 'Ambas líneas', value: 'both_lines', description: 'Tengo productos estándar Y personalizados' }
          ]
        },
        {
          id: 'innovation_priority',
          question: '¿Qué tan importante es la innovación en tu trabajo?',
          type: 'single-choice' as const,
          fieldName: 'innovationPriority',
          explanation: 'Balance entre tradición e innovación define tu estilo.',
          required: true,
          options: [
            { id: 'not_important', label: 'No es importante', value: 'not_important', description: 'Sigo la tradición' },
            { id: 'somewhat', label: 'Algo importante', value: 'somewhat', description: 'Innovación moderada' },
            { id: 'important', label: 'Importante', value: 'important', description: 'Balance tradición-innovación' },
            { id: 'very_important', label: 'Muy importante', value: 'very_important', description: 'Innovación constante' },
            { id: 'critical', label: 'Es crítica', value: 'critical', description: 'Mi diferenciador clave' }
          ]
        },
        {
          id: 'artisan_legacy',
          question: '¿Qué legado quieres dejar como artesano/a?',
          type: 'textarea' as const,
          fieldName: 'artisanLegacy',
          placeholder: 'Cuéntame qué quieres que recuerden de ti y tu trabajo...\n\n💭 Piensa en:\n• ¿Por qué quieres ser recordado/a?\n• ¿Qué quieres que tus piezas representen?\n• ¿Qué cambio quieres generar en tu campo?\n• ¿Qué enseñanzas quieres transmitir?\n\nNo hay respuestas correctas o incorrectas, solo tu verdad.',
          explanation: 'Tu legado es tu norte, lo que le da sentido profundo a todo tu esfuerzo.',
          required: true,
          enableDictation: true
        }
      ]
    }
  ];

  const blocksEN: ConversationBlock[] = [
    // BLOCK 1: CRAFT IDENTITY AND EXPERIENCE 🎨
    {
      id: 'craft_identity_experience',
      title: 'Craft Identity and Experience',
      subtitle: 'Understanding your craft and background',
      agentMessage: "Now I want to learn more about your craft identity, your experience, and how you work. 🎨",
      strategicContext: "Your experience level and work structure help me tailor recommendations to your current reality.",
      questions: [
        {
          id: 'experience_time',
          question: 'How long have you been working in your craft?',
          type: 'single-choice' as const,
          fieldName: 'experienceTime',
          explanation: 'Your experience helps me understand your maturity level and specific needs.',
          required: true,
          options: [
            { id: 'less_1', label: 'Less than 1 year', value: 'less_1', description: 'Just starting' },
            { id: '1_3', label: '1-3 years', value: '1_3', description: 'Still learning' },
            { id: '3_5', label: '3-5 years', value: '3_5', description: 'Experienced' },
            { id: '5_10', label: '5-10 years', value: '5_10', description: 'Established' },
            { id: 'more_10', label: 'More than 10 years', value: 'more_10', description: 'Master artisan' }
          ]
        },
        {
          id: 'work_structure',
          question: 'How is your work structured?',
          type: 'single-choice' as const,
          fieldName: 'workStructure',
          explanation: 'Knowing if you work alone or in a team helps me give specific recommendations.',
          required: true,
          options: [
            { id: 'solo', label: 'I work alone', value: 'solo', description: 'I do everything myself' },
            { id: 'with_help', label: 'Occasional help', value: 'with_help', description: 'Family or friends help sometimes' },
            { id: 'small_team', label: 'Small team', value: 'small_team', description: '2-3 people working' },
            { id: 'established_team', label: 'Established team', value: 'established_team', description: '4+ people in my workshop' }
          ]
        },
        {
          id: 'production_capacity',
          question: 'How many pieces do you produce approximately per month?',
          type: 'single-choice' as const,
          fieldName: 'productionCapacity',
          explanation: 'Your production capacity helps me understand the size of your operation.',
          required: true,
          options: [
            { id: 'very_low', label: '1-5 pieces', value: 'very_low', description: 'Very limited production' },
            { id: 'low', label: '6-20 pieces', value: 'low', description: 'Small production' },
            { id: 'medium', label: '21-50 pieces', value: 'medium', description: 'Medium production' },
            { id: 'high', label: '51-100 pieces', value: 'high', description: 'High production' },
            { id: 'very_high', label: 'More than 100 pieces', value: 'very_high', description: 'Scale production' }
          ]
        },
        {
          id: 'quality_control',
          question: 'How do you ensure the quality of your products?',
          type: 'single-choice' as const,
          fieldName: 'qualityControl',
          explanation: 'Quality processes reflect your level of professionalism.',
          required: true,
          options: [
            { id: 'intuitive', label: 'Intuitively', value: 'intuitive', description: 'I trust my eye and experience' },
            { id: 'basic_checks', label: 'Basic checks', value: 'basic_checks', description: 'I check each piece before selling' },
            { id: 'documented', label: 'Documented process', value: 'documented', description: 'I have a written checklist' },
            { id: 'systematic', label: 'Established system', value: 'systematic', description: 'Formal quality control process' }
          ]
        },
        {
          id: 'business_location',
          question: 'Where do you mainly sell?',
          type: 'single-choice' as const,
          fieldName: 'businessLocation',
          explanation: 'Where you sell determines your outreach strategy.',
          required: true,
          options: [
            { id: 'local', label: 'Only in my locality', value: 'local', description: 'In-person sales' },
            { id: 'regional', label: 'In my region', value: 'regional', description: 'Several nearby cities' },
            { id: 'national', label: 'Nationally', value: 'national', description: 'Across the country' },
            { id: 'international', label: 'Internationally', value: 'international', description: 'I sell to other countries' }
          ]
        }
      ]
    },
    // BLOCK 2: SALES AND MONETIZATION 💰
    {
      id: 'sales_monetization',
      title: 'Sales and Monetization',
      subtitle: 'Your commercial reality and pricing system',
      agentMessage: "Let's talk about money. Don't worry, it's to help you improve your profitability. 💰",
      strategicContext: "Understanding your pricing system and financial tracking is key to sustainable growth.",
      questions: [
        {
          id: 'pricing_method',
          question: 'How do you set your prices?',
          type: 'single-choice' as const,
          fieldName: 'pricingMethod',
          explanation: 'Your pricing method directly impacts your profitability.',
          required: true,
          options: [
            { id: 'feeling', label: 'By intuition', value: 'feeling', description: 'What I feel it\'s worth' },
            { id: 'market', label: 'Looking at the market', value: 'market', description: 'I check others' },
            { id: 'costs_basic', label: 'Costs + basic margin', value: 'costs_basic', description: 'I add my costs and a bit more' },
            { id: 'costs_detailed', label: 'Detailed costs', value: 'costs_detailed', description: 'I calculate everything: materials, time, overhead' },
            { id: 'value_based', label: 'Value-based', value: 'value_based', description: 'Based on the value I provide to the client' }
          ]
        },
        {
          id: 'profit_clarity',
          question: 'How clear are you about your profit margin?',
          type: 'single-choice' as const,
          fieldName: 'profitClarity',
          explanation: 'Knowing your real margin is fundamental for decision making.',
          required: true,
          options: [
            { id: 'no_idea', label: 'No idea', value: 'no_idea', description: 'I don\'t track' },
            { id: 'rough_estimate', label: 'Rough estimate', value: 'rough_estimate', description: 'I estimate by eye' },
            { id: 'somewhat_clear', label: 'Somewhat clear', value: 'somewhat_clear', description: 'I keep some records' },
            { id: 'very_clear', label: 'Very clear', value: 'very_clear', description: 'I track it in detail' },
            { id: 'precise', label: 'Precisely calculated', value: 'precise', description: 'Everything documented' }
          ]
        },
        {
          id: 'pricing_strategy',
          question: 'Do you review and adjust your prices regularly?',
          type: 'single-choice' as const,
          fieldName: 'pricingStrategy',
          explanation: 'Price flexibility shows adaptability to the market.',
          required: true,
          options: [
            { id: 'never', label: 'Never change them', value: 'never', description: 'My prices are fixed' },
            { id: 'rarely', label: 'Rarely', value: 'rarely', description: 'Only if costs change a lot' },
            { id: 'yearly', label: 'Once a year', value: 'yearly', description: 'Annual review' },
            { id: 'quarterly', label: 'Quarterly', value: 'quarterly', description: 'Every 3 months' },
            { id: 'ongoing', label: 'Constantly', value: 'ongoing', description: 'I adjust as needed' }
          ]
        },
        {
          id: 'financial_tracking',
          question: 'Do you keep track of your income and expenses?',
          type: 'single-choice' as const,
          fieldName: 'financialTracking',
          explanation: 'Financial control is the foundation of a sustainable business.',
          required: true,
          options: [
            { id: 'no_tracking', label: 'No tracking', value: 'no_tracking', description: 'Only in my head' },
            { id: 'basic_notes', label: 'Basic notes', value: 'basic_notes', description: 'I write down important things' },
            { id: 'spreadsheet', label: 'Spreadsheet', value: 'spreadsheet', description: 'Excel or Google Sheets' },
            { id: 'accounting_software', label: 'Accounting software', value: 'accounting_software', description: 'I use a specialized app' },
            { id: 'accountant', label: 'With an accountant', value: 'accountant', description: 'I have professional support' }
          ]
        },
        {
          id: 'growth_goal',
          question: 'What is your main growth goal?',
          type: 'single-choice' as const,
          fieldName: 'growthGoal',
          explanation: 'Your goal guides the recommendations I will give you.',
          required: true,
          options: [
            { id: 'stable_income', label: 'Stable income', value: 'stable_income', description: 'Make a living from my art' },
            { id: 'scale_production', label: 'Scale production', value: 'scale_production', description: 'Produce and sell more' },
            { id: 'premium_brand', label: 'Premium brand', value: 'premium_brand', description: 'Luxury positioning' },
            { id: 'impact', label: 'Social impact', value: 'impact', description: 'Create change in my community' },
            { id: 'balance', label: 'Work-life balance', value: 'balance', description: 'Live well without too much stress' }
          ]
        }
      ]
    },
    // BLOCK 3: CUSTOMERS AND MARKET 🎯
    {
      id: 'customers_market',
      title: 'Customers and Market',
      subtitle: 'Knowing your audience and sales channels',
      agentMessage: "Let's talk about your customers. Knowing well who you sell to is key to growth. 🎯",
      strategicContext: "Clarity about your audience and channels determines your marketing and sales strategy.",
      questions: [
        {
          id: 'customer_knowledge',
          question: 'How well do you know your customers?',
          type: 'single-choice' as const,
          fieldName: 'customerKnowledge',
          explanation: 'Deep knowledge of your customers allows you to serve them better.',
          required: true,
          options: [
            { id: 'dont_know', label: 'Don\'t know them well', value: 'dont_know', description: 'Just sell and that\'s it' },
            { id: 'basic', label: 'Some basic things', value: 'basic', description: 'Age, gender, location' },
            { id: 'good', label: 'Know them well', value: 'good', description: 'Talk with them regularly' },
            { id: 'very_good', label: 'Know them very well', value: 'very_good', description: 'Know what they need and want' },
            { id: 'deeply', label: 'Know them deeply', value: 'deeply', description: 'Have detailed profiles' }
          ]
        },
        {
          id: 'promotion_channels',
          question: 'Where do you promote your products? (Select all that apply)',
          type: 'multiple-choice' as const,
          fieldName: 'promotionChannels',
          explanation: 'Your promotion channels determine your current reach.',
          required: true,
          options: [
            { id: 'word_of_mouth', label: 'Word of mouth', value: 'word_of_mouth', description: 'Referrals' },
            { id: 'instagram', label: 'Instagram', value: 'instagram' },
            { id: 'facebook', label: 'Facebook', value: 'facebook' },
            { id: 'whatsapp', label: 'WhatsApp', value: 'whatsapp' },
            { id: 'website', label: 'Website', value: 'website' },
            { id: 'marketplace', label: 'Marketplaces', value: 'marketplace', description: 'Etsy, MercadoLibre, etc.' },
            { id: 'fairs', label: 'Fairs', value: 'fairs', description: 'In-person events' },
            { id: 'stores', label: 'Physical stores', value: 'stores', description: 'I sell in third-party stores' }
          ]
        },
        {
          id: 'customer_feedback',
          question: 'How do you collect customer feedback?',
          type: 'single-choice' as const,
          fieldName: 'customerFeedback',
          explanation: 'Customer feedback is your best improvement tool.',
          required: true,
          options: [
            { id: 'dont_ask', label: 'I don\'t ask', value: 'dont_ask', description: 'I wait for them to tell me if something' },
            { id: 'informal', label: 'Casual conversations', value: 'informal', description: 'I chat with them occasionally' },
            { id: 'after_sale', label: 'Ask after sale', value: 'after_sale', description: 'I write to know how it went' },
            { id: 'surveys', label: 'Surveys', value: 'surveys', description: 'I send structured forms' },
            { id: 'systematic', label: 'Established system', value: 'systematic', description: 'I have a formal feedback process' }
          ]
        },
        {
          id: 'biggest_challenge',
          question: 'What is your biggest challenge right now?',
          type: 'textarea' as const,
          fieldName: 'biggestChallenge',
          placeholder: 'Tell me what worries or holds you back the most right now...\n\nExamples:\n• "I can\'t sell enough"\n• "I don\'t have time for everything"\n• "My prices are too low but I don\'t know how to raise them"\n• "I don\'t know how to reach more customers"\n\nBe specific so I can help you better.',
          explanation: 'Your biggest challenge helps me prioritize the most relevant recommendations for you.',
          required: true,
          enableDictation: true
        },
        {
          id: 'online_presence',
          question: 'Where do you have an online presence? (Select all)',
          type: 'multiple-choice' as const,
          fieldName: 'onlinePresence',
          explanation: 'Your digital presence determines your visibility and reach.',
          required: true,
          options: [
            { id: 'none', label: 'I have no online presence', value: 'none' },
            { id: 'instagram', label: 'Instagram', value: 'instagram' },
            { id: 'facebook', label: 'Facebook', value: 'facebook' },
            { id: 'whatsapp_business', label: 'WhatsApp Business', value: 'whatsapp_business' },
            { id: 'own_website', label: 'Own website', value: 'own_website' },
            { id: 'online_store', label: 'Online store', value: 'online_store' },
            { id: 'marketplaces', label: 'Marketplaces', value: 'marketplaces', description: 'Etsy, Amazon Handmade, etc.' },
            { id: 'pinterest', label: 'Pinterest', value: 'pinterest' },
            { id: 'tiktok', label: 'TikTok', value: 'tiktok' }
          ]
        }
      ]
    },
    // BLOCK 4: BRAND AND DIGITAL PRESENCE 🌐
    {
      id: 'brand_digital',
      title: 'Brand and Digital Presence',
      subtitle: 'Your brand identity and communication',
      agentMessage: "Now let's talk about your brand and how you communicate with the world. 🌐",
      strategicContext: "A strong and consistent brand builds trust and differentiates you from competitors.",
      questions: [
        {
          id: 'brand_identity',
          question: 'Do you have a defined visual identity for your brand?',
          type: 'single-choice' as const,
          fieldName: 'brandIdentity',
          explanation: 'Your visual identity is how your customers recognize you visually.',
          required: true,
          options: [
            { id: 'no_brand', label: 'I don\'t have a brand yet', value: 'no_brand', description: 'I only use my name' },
            { id: 'name_only', label: 'Name only', value: 'name_only', description: 'I have a name but no design' },
            { id: 'basic_logo', label: 'Basic logo', value: 'basic_logo', description: 'I have a simple logo' },
            { id: 'defined_identity', label: 'Defined identity', value: 'defined_identity', description: 'Logo, colors, typography' },
            { id: 'complete_system', label: 'Complete system', value: 'complete_system', description: 'Identity applied in all my materials' }
          ]
        },
        {
          id: 'marketing_consistency',
          question: 'How consistent is your brand communication?',
          type: 'single-choice' as const,
          fieldName: 'marketingConsistency',
          explanation: 'Consistency generates recognition and professionalism.',
          required: true,
          options: [
            { id: 'not_consistent', label: 'Not consistent', value: 'not_consistent', description: 'Each post is different' },
            { id: 'somewhat', label: 'Somewhat consistent', value: 'somewhat', description: 'I try to maintain a style' },
            { id: 'mostly', label: 'Mostly consistent', value: 'mostly', description: 'Use similar colors and style' },
            { id: 'very', label: 'Very consistent', value: 'very', description: 'Have style guide' },
            { id: 'always', label: 'Always consistent', value: 'always', description: 'Everything follows my brand identity' }
          ]
        },
        {
          id: 'digital_tools',
          question: 'What digital tools do you use? (Select all)',
          type: 'multiple-choice' as const,
          fieldName: 'digitalTools',
          explanation: 'The tools you use determine your operational efficiency.',
          required: true,
          options: [
            { id: 'none', label: 'I don\'t use digital tools', value: 'none' },
            { id: 'whatsapp', label: 'WhatsApp for sales', value: 'whatsapp' },
            { id: 'social_media', label: 'Social media', value: 'social_media' },
            { id: 'spreadsheets', label: 'Spreadsheets', value: 'spreadsheets' },
            { id: 'design_tools', label: 'Design tools', value: 'design_tools', description: 'Canva, Photoshop, etc.' },
            { id: 'payment_apps', label: 'Payment apps', value: 'payment_apps', description: 'PayPal, Stripe, etc.' },
            { id: 'inventory', label: 'Inventory control', value: 'inventory' },
            { id: 'crm', label: 'CRM or customer management', value: 'crm' },
            { id: 'email_marketing', label: 'Email marketing', value: 'email_marketing' }
          ]
        },
        {
          id: 'product_development',
          question: 'How do you develop new products?',
          type: 'single-choice' as const,
          fieldName: 'productDevelopment',
          explanation: 'Your innovation process shows your adaptability.',
          required: true,
          options: [
            { id: 'intuition', label: 'By intuition', value: 'intuition', description: 'I do what I like' },
            { id: 'customer_requests', label: 'By customer requests', value: 'customer_requests', description: 'When customers ask me for something' },
            { id: 'market_observation', label: 'Observing the market', value: 'market_observation', description: 'I see what works' },
            { id: 'planned_testing', label: 'Planned testing', value: 'planned_testing', description: 'I make prototypes and test them' },
            { id: 'systematic', label: 'Systematic process', value: 'systematic', description: 'Research + development + validation' }
          ]
        },
        {
          id: 'long_term_vision',
          question: 'Where do you see your business in 3-5 years?',
          type: 'textarea' as const,
          fieldName: 'longTermVision',
          placeholder: 'Tell me your long-term vision...\n\n💭 Some ideas:\n• What size do you want your business to be?\n• Do you want to have a team? How many people?\n• Do you want a bigger workshop?\n• Do you want to export internationally?\n• What impact do you want to generate?\n\nDream big, don\'t limit yourself.',
          explanation: 'Your vision helps me align recommendations with your long-term goals.',
          required: true,
          enableDictation: true
        }
      ]
    },
    // BLOCK 5: OPERATIONS AND GROWTH 🚀
    {
      id: 'operations_growth',
      title: 'Operations and Growth',
      subtitle: 'Operational capacity and growth mindset',
      agentMessage: "Let's talk about how you operate and how ready you are to grow. 🚀",
      strategicContext: "Your operational capacity and mindset determine how fast you can scale.",
      questions: [
        {
          id: 'delegation_ability',
          question: 'How comfortable are you delegating tasks?',
          type: 'single-choice' as const,
          fieldName: 'delegationAbility',
          explanation: 'Delegating is essential to grow beyond your individual capacity.',
          required: true,
          options: [
            { id: 'never', label: 'Never delegate', value: 'never', description: 'Prefer to do everything myself' },
            { id: 'rarely', label: 'Rarely delegate', value: 'rarely', description: 'Only if absolutely necessary' },
            { id: 'sometimes', label: 'Sometimes delegate', value: 'sometimes', description: 'Simple tasks' },
            { id: 'often', label: 'Often delegate', value: 'often', description: 'When someone can do it better' },
            { id: 'always', label: 'Delegate everything I can', value: 'always', description: 'Focus on my zone of genius' }
          ]
        },
        {
          id: 'team_management',
          question: 'How do you organize work in your workshop/business?',
          type: 'single-choice' as const,
          fieldName: 'teamManagement',
          explanation: 'Your organization system reflects your level of structuring.',
          required: true,
          options: [
            { id: 'no_system', label: 'No system', value: 'no_system', description: 'I do whatever comes up' },
            { id: 'mental_list', label: 'Mental list', value: 'mental_list', description: 'I know what to do but don\'t write it down' },
            { id: 'basic_lists', label: 'Task lists', value: 'basic_lists', description: 'I write down pending tasks' },
            { id: 'calendar_planning', label: 'Calendar planning', value: 'calendar_planning', description: 'I organize my time weekly' },
            { id: 'project_management', label: 'Project management', value: 'project_management', description: 'I use apps like Trello, Asana, Notion' }
          ]
        },
        {
          id: 'experimentation',
          question: 'How open are you to trying new things?',
          type: 'single-choice' as const,
          fieldName: 'experimentation',
          explanation: 'Experimentation is key to innovate and adapt.',
          required: true,
          options: [
            { id: 'never', label: 'Prefer not to risk', value: 'never', description: 'Stick to what I know' },
            { id: 'rarely', label: 'Only if necessary', value: 'rarely', description: 'Experiment with caution' },
            { id: 'sometimes', label: 'From time to time', value: 'sometimes', description: 'Try small things' },
            { id: 'often', label: 'Frequently', value: 'often', description: 'I like to experiment' },
            { id: 'always', label: 'Constantly', value: 'always', description: 'Always looking to innovate' }
          ]
        },
        {
          id: 'growth_timeline',
          question: 'In how much time do you want to achieve your main goals?',
          type: 'single-choice' as const,
          fieldName: 'growthTimeline',
          explanation: 'Your urgency determines the aggressiveness of the strategy.',
          required: true,
          options: [
            { id: '3_6_months', label: '3-6 months', value: '3_6_months', description: 'I need quick results' },
            { id: '6_12_months', label: '6-12 months', value: '6_12_months', description: 'Within a year' },
            { id: '1_2_years', label: '1-2 years', value: '1_2_years', description: 'I have time to build' },
            { id: '3_5_years', label: '3-5 years', value: '3_5_years', description: 'Medium-term vision' },
            { id: 'no_rush', label: 'No rush', value: 'no_rush', description: 'I go at my own pace' }
          ]
        },
        {
          id: 'environmental_practices',
          question: 'What sustainable practices do you implement? (Select all)',
          type: 'multiple-choice' as const,
          fieldName: 'environmentalPractices',
          explanation: 'Sustainability is increasingly valued by customers.',
          required: true,
          options: [
            { id: 'none_yet', label: 'None yet', value: 'none_yet', description: 'I haven\'t started' },
            { id: 'waste_reduction', label: 'Waste reduction', value: 'waste_reduction' },
            { id: 'recycling', label: 'Material recycling', value: 'recycling' },
            { id: 'local_materials', label: 'Local materials', value: 'local_materials' },
            { id: 'eco_packaging', label: 'Eco-friendly packaging', value: 'eco_packaging' },
            { id: 'natural_materials', label: 'Natural materials', value: 'natural_materials' },
            { id: 'water_conservation', label: 'Water conservation', value: 'water_conservation' },
            { id: 'renewable_energy', label: 'Renewable energy', value: 'renewable_energy' },
            { id: 'upcycling', label: 'Upcycling/reuse', value: 'upcycling' }
          ]
        }
      ]
    },
    // BLOCK 6: IMPACT AND FUTURE VISION 🌱
    {
      id: 'impact_vision',
      title: 'Impact and Future Vision',
      subtitle: 'Your legacy and contribution to the world',
      agentMessage: "Finally, let's talk about the impact you want to generate and your artisan legacy. 🌱",
      strategicContext: "Your purpose beyond sales is what gives deep meaning to your work.",
      questions: [
        {
          id: 'social_impact',
          question: 'How do you generate social impact with your work?',
          type: 'single-choice' as const,
          fieldName: 'socialImpact',
          explanation: 'Social impact adds value to your proposal and attracts conscious customers.',
          required: true,
          options: [
            { id: 'none_yet', label: 'I don\'t generate social impact yet', value: 'none_yet', description: 'I focus only on selling' },
            { id: 'employment', label: 'I create jobs', value: 'employment', description: 'I provide work to others' },
            { id: 'skills_transfer', label: 'I teach my craft', value: 'skills_transfer', description: 'I train other artisans' },
            { id: 'community_support', label: 'I support my community', value: 'community_support', description: 'I work with local groups' },
            { id: 'preservation', label: 'I preserve traditions', value: 'preservation', description: 'I keep ancestral techniques alive' },
            { id: 'fair_trade', label: 'Fair trade', value: 'fair_trade', description: 'I pay fair prices to suppliers' }
          ]
        },
        {
          id: 'ethical_sourcing',
          question: 'How do you source your main materials?',
          type: 'single-choice' as const,
          fieldName: 'ethicalSourcing',
          explanation: 'The origin of your materials impacts your environmental and social footprint.',
          required: true,
          options: [
            { id: 'wherever', label: 'Wherever is cheapest', value: 'wherever', description: 'Price is the main factor' },
            { id: 'local_when_possible', label: 'Local when possible', value: 'local_when_possible', description: 'I prefer local but not always' },
            { id: 'mostly_local', label: 'Mostly local', value: 'mostly_local', description: 'I prioritize nearby suppliers' },
            { id: 'all_local', label: 'All local', value: 'all_local', description: 'I only buy in my region' },
            { id: 'ethical_certified', label: 'Ethically certified', value: 'ethical_certified', description: 'Only materials with certification' }
          ]
        },
        {
          id: 'product_customization',
          question: 'Do you offer customized or made-to-measure products?',
          type: 'single-choice' as const,
          fieldName: 'productCustomization',
          explanation: 'Customization can be an important competitive advantage.',
          required: true,
          options: [
            { id: 'no_customization', label: 'No, only standard products', value: 'no_customization', description: 'I always do the same' },
            { id: 'minimal', label: 'Minimal customizations', value: 'minimal', description: 'Small changes like colors' },
            { id: 'moderate', label: 'Moderate customizations', value: 'moderate', description: 'I can adapt several aspects' },
            { id: 'fully_custom', label: 'Fully custom', value: 'fully_custom', description: 'Each piece is unique per client' },
            { id: 'both_lines', label: 'Both lines', value: 'both_lines', description: 'I have standard AND customized products' }
          ]
        },
        {
          id: 'innovation_priority',
          question: 'How important is innovation in your work?',
          type: 'single-choice' as const,
          fieldName: 'innovationPriority',
          explanation: 'Balance between tradition and innovation defines your style.',
          required: true,
          options: [
            { id: 'not_important', label: 'Not important', value: 'not_important', description: 'Follow tradition' },
            { id: 'somewhat', label: 'Somewhat important', value: 'somewhat', description: 'Moderate innovation' },
            { id: 'important', label: 'Important', value: 'important', description: 'Balance tradition-innovation' },
            { id: 'very_important', label: 'Very important', value: 'very_important', description: 'Constant innovation' },
            { id: 'critical', label: 'It\'s critical', value: 'critical', description: 'My key differentiator' }
          ]
        },
        {
          id: 'artisan_legacy',
          question: 'What legacy do you want to leave as an artisan?',
          type: 'textarea' as const,
          fieldName: 'artisanLegacy',
          placeholder: 'Tell me what you want to be remembered for and your work...\n\n💭 Think about:\n• Why do you want to be remembered?\n• What do you want your pieces to represent?\n• What change do you want to generate in your field?\n• What teachings do you want to transmit?\n\nThere are no right or wrong answers, only your truth.',
          explanation: 'Your legacy is your north, what gives deep meaning to all your effort.',
          required: true,
          enableDictation: true
        }
      ]
    }
  ];

  return language === 'es' ? blocksES : blocksEN;
};

// Export onboarding blocks separately for use in onboarding mode
export const ONBOARDING_BLOCKS = {
  es: ONBOARDING_BLOCK_ES,
  en: ONBOARDING_BLOCK_EN
};

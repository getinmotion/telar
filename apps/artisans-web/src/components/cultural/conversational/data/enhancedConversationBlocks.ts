import { ConversationBlock } from '../types/conversationalTypes';

export const getEnhancedConversationBlocks = (language: 'en' | 'es'): ConversationBlock[] => {
  const blocks = {
    en: [
      {
        id: 'welcome',
        title: 'Welcome to Your Growth Journey',
        subtitle: 'Let\'s understand your creative business',
        agentMessage: "Hi! I'm your business growth agent, and I specialize in helping creative entrepreneurs like you turn passion into profit. I'm going to ask you some questions to understand exactly where you are and create a personalized action plan. This isn't a generic test - I'll adapt my questions based on your specific situation. Ready to begin?",
        strategicContext: "This initial conversation helps me understand your business type, stage, and personality so I can provide hyper-personalized guidance throughout our journey together.",
        questions: [
          {
            id: 'business_description',
            question: 'Tell me about your creative work - what do you do, and what makes it special?',
            type: 'text-input' as const,
            fieldName: 'businessDescription',
            placeholder: 'Example: I create handmade ceramic bowls inspired by Japanese aesthetics. Each piece is unique and I focus on sustainable materials. I work from my home studio and love the meditative process of throwing clay...',
            explanation: 'The more specific you are, the better I can understand your unique situation. Think about what you create, your process, and what drives you.',
            required: true
          }
        ]
      },
      {
        id: 'businessType',
        title: 'Your Creative Category',
        subtitle: 'Helping me understand your field',
        agentMessage: "Perfect! I can already see the passion in what you do. Now let me categorize your work so I can give you industry-specific advice. Different creative fields have different challenges and opportunities.",
        strategicContext: "Industry classification helps me provide relevant strategies, pricing guidance, and marketing approaches specific to your field.",
        questions: [
          {
            id: 'industry_type',
            question: 'Which category best describes your creative work?',
            type: 'single-choice' as const,
            fieldName: 'industry',
            explanation: 'This helps me understand the unique challenges and opportunities in your specific creative field.',
            required: true,
            options: [
              { id: 'creative', label: 'Visual Arts & Crafts', value: 'creative', description: 'Painting, ceramics, jewelry, textiles, woodworking' },
              { id: 'design', label: 'Design Services', value: 'design', description: 'Graphic design, web design, interior design' },
              { id: 'music', label: 'Music & Audio', value: 'music', description: 'Musicians, producers, audio services' },
              { id: 'writing', label: 'Writing & Content', value: 'writing', description: 'Authors, copywriters, content creators' },
              { id: 'photo', label: 'Photography & Video', value: 'photo', description: 'Photographers, videographers, visual storytellers' },
              { id: 'performance', label: 'Performance & Events', value: 'performance', description: 'Performers, event planners, entertainers' },
              { id: 'teaching', label: 'Creative Education', value: 'teaching', description: 'Art teachers, workshop leaders, course creators' },
              { id: 'other', label: 'Other Creative Field', value: 'other', description: 'Something unique or mixed' }
            ]
          },
          {
            id: 'experience_level',
            question: 'How long have you been doing this creative work?',
            type: 'single-choice' as const,
            fieldName: 'experience',
            explanation: 'Your experience level helps me gauge your skill development and business readiness.',
            required: true,
            options: [
              { id: 'new', label: 'Just starting (less than 1 year)', value: 'new' },
              { id: 'developing', label: 'Developing skills (1-3 years)', value: 'developing' },
              { id: 'experienced', label: 'Experienced (3-7 years)', value: 'experienced' },
              { id: 'expert', label: 'Expert level (7+ years)', value: 'expert' }
            ]
          }
        ]
      },
      {
        id: 'currentSituation',
        title: 'Your Current Reality',
        subtitle: 'Understanding where you are now',
        agentMessage: "Based on your creative background, let me ask some specific questions about your current situation. I'm generating these questions specifically for creative entrepreneurs in your field.",
        strategicContext: "Understanding your current business stage helps me recommend the right next steps and avoid overwhelming you with advanced strategies if you're just starting.",
        questions: [
          {
            id: 'current_stage',
            question: 'Which best describes your current situation?',
            type: 'single-choice' as const,
            fieldName: 'currentStage',
            explanation: 'This helps me understand what type of support you need most right now.',
            required: true,
            options: [
              { id: 'idea', label: 'I have ideas but haven\'t started selling', value: 'idea' },
              { id: 'creating', label: 'I\'m creating but not selling consistently', value: 'creating' },
              { id: 'selling', label: 'I\'m selling but want to grow', value: 'selling' },
              { id: 'established', label: 'I have an established creative business', value: 'established' }
            ]
          },
          {
            id: 'target_audience',
            question: 'Who do you create for?',
            type: 'single-choice' as const,
            fieldName: 'targetAudience',
            explanation: 'Understanding your audience helps me suggest the best ways to reach and serve them.',
            required: true,
            options: [
              { id: 'individuals', label: 'Individual customers who love unique pieces', value: 'individuals' },
              { id: 'businesses', label: 'Businesses that need creative services', value: 'businesses' },
              { id: 'collectors', label: 'Collectors and art enthusiasts', value: 'collectors' },
              { id: 'everyday', label: 'Everyday people looking for beautiful items', value: 'everyday' },
              { id: 'unclear', label: 'I\'m still figuring this out', value: 'unclear' }
            ]
          }
        ]
      },
      {
        id: 'salesReality',
        title: 'Sales & Money',
        subtitle: 'Let\'s talk about the business side',
        agentMessage: "Now for the important question that many creatives find challenging - let's talk about money! This isn't about judgment, it's about understanding how to help you create sustainable income from your passion.",
        strategicContext: "Sales history and pricing understanding are crucial indicators of business maturity and help me prioritize the most important next steps.",
        questions: [
          {
            id: 'sales_experience',
            question: 'What best describes your sales experience?',
            type: 'single-choice' as const,
            fieldName: 'salesExperience',
            explanation: 'Understanding your sales history helps me recommend the right growth strategy.',
            required: true,
            options: [
              { id: 'never_sold', label: 'I\'ve never sold my creative work', value: 'never_sold' },
              { id: 'few_sales', label: 'I\'ve made a few sales but it\'s inconsistent', value: 'few_sales' },
              { id: 'regular_sales', label: 'I make regular sales but want to grow', value: 'regular_sales' },
              { id: 'established_sales', label: 'I have consistent sales and revenue', value: 'established_sales' }
            ]
          },
          {
            id: 'income_goal',
            question: 'What\'s your monthly income goal from your creative work?',
            type: 'single-choice' as const,
            fieldName: 'incomeGoal',
            explanation: 'Your income goal helps me understand the scale of business strategy you need.',
            required: true,
            options: [
              { id: 'hobby', label: 'Just cover materials ($0-200/month)', value: 'hobby' },
              { id: 'side', label: 'Meaningful side income ($200-1000/month)', value: 'side' },
              { id: 'partial', label: 'Partial living income ($1000-3000/month)', value: 'partial' },
              { id: 'full', label: 'Full living income ($3000+/month)', value: 'full' },
              { id: 'scale', label: 'Scale to hire others and grow big', value: 'scale' }
            ]
          },
          {
            id: 'pricing_confidence',
            question: 'How confident do you feel about pricing your work appropriately?',
            type: 'slider' as const,
            fieldName: 'pricingConfidence',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Pricing confidence affects your ability to earn what your work is worth.',
            required: true,
            showIf: {
              field: 'salesExperience',
              operator: 'not_equals' as const,
              value: 'never_sold'
            }
          }
        ]
      },
      {
        id: 'currentChallenges',
        title: 'Your Biggest Challenges',
        subtitle: 'What\'s holding you back?',
        agentMessage: "Based on your creative field and current situation, I can predict some challenges you might be facing. Let's identify what's really blocking your progress so I can help you overcome these specific obstacles.",
        strategicContext: "Understanding specific challenges helps me create a targeted action plan that addresses your most pressing needs first.",
        questions: [
          {
            id: 'main_obstacles',
            question: 'What are your biggest challenges right now? (Select all that apply)',
            type: 'multiple-choice' as const,
            fieldName: 'mainObstacles',
            explanation: 'Be honest about what\'s difficult - this helps me prioritize the most impactful solutions.',
            required: true,
            options: [
              { id: 'time', label: 'Finding time to work on business vs. creating', value: 'time' },
              { id: 'pricing', label: 'Setting prices that feel right', value: 'pricing' },
              { id: 'customers', label: 'Finding customers who value my work', value: 'customers' },
              { id: 'confidence', label: 'Confidence in selling my work', value: 'confidence' },
              { id: 'marketing', label: 'Marketing and promoting myself', value: 'marketing' },
              { id: 'consistency', label: 'Creating consistent income', value: 'consistency' },
              { id: 'business', label: 'Understanding the business side', value: 'business' },
              { id: 'scale', label: 'Scaling beyond just me', value: 'scale' }
            ]
          },
          {
            id: 'urgency_level',
            question: 'How urgent do these challenges feel?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'This helps me understand how quickly we need to create solutions for you.',
            required: true
          }
        ]
      },
      {
        id: 'vision',
        title: 'Your Creative Vision',
        subtitle: 'Where do you want to go?',
        agentMessage: "Finally, let's talk about your dreams! Understanding your vision helps me create a growth plan that aligns with what you really want, not what others think you should want.",
        strategicContext: "Your goals and vision determine the type and intensity of support you'll need. Big dreams require different strategies than lifestyle businesses.",
        questions: [
          {
            id: 'business_vision',
            question: 'What does success look like for your creative business?',
            type: 'single-choice' as const,
            fieldName: 'businessVision',
            explanation: 'Your vision helps me recommend the right growth strategy and level of support.',
            required: true,
            options: [
              { id: 'freedom', label: 'Creative freedom with sustainable income', value: 'freedom' },
              { id: 'impact', label: 'Making a meaningful impact through my art', value: 'impact' },
              { id: 'growth', label: 'Building a recognized creative brand', value: 'growth' },
              { id: 'legacy', label: 'Creating something that lasts beyond me', value: 'legacy' },
              { id: 'balance', label: 'Perfect work-life balance doing what I love', value: 'balance' }
            ]
          },
          {
            id: 'support_style',
            question: 'What kind of support works best for you?',
            type: 'single-choice' as const,
            fieldName: 'supportStyle',
            explanation: 'This helps me recommend the right balance of guidance, tools, and independence.',
            required: true,
            options: [
              { id: 'guided', label: 'Step-by-step guidance with clear instructions', value: 'guided' },
              { id: 'strategic', label: 'Strategic direction, I\'ll figure out the details', value: 'strategic' },
              { id: 'tools', label: 'Give me the right tools and resources', value: 'tools' },
              { id: 'community', label: 'Community support with other creatives', value: 'community' }
            ]
          }
        ]
      }
    ],
    es: [
      {
        id: 'welcome',
        title: 'Bienvenido a tu Viaje de Crecimiento',
        subtitle: 'Entendamos tu negocio creativo',
        agentMessage: "¡Hola! Soy tu agente de crecimiento empresarial, y me especializo en ayudar a emprendedores creativos como tú a convertir la pasión en ganancias. Te haré algunas preguntas para entender exactamente dónde estás y crear un plan de acción personalizado. Esto no es un test genérico - adaptaré mis preguntas según tu situación específica. ¿Listo para comenzar?",
        strategicContext: "Esta conversación inicial me ayuda a entender tu tipo de negocio, etapa y personalidad para poder brindarte orientación hiper-personalizada durante todo nuestro viaje juntos.",
        questions: [
          {
            id: 'business_description',
            question: '¿Cuéntame sobre tu trabajo creativo - qué haces y qué lo hace especial?',
            type: 'text-input' as const,
            fieldName: 'businessDescription',
            placeholder: 'Ejemplo: Creo cuencos de cerámica hechos a mano inspirados en la estética japonesa. Cada pieza es única y me enfoco en materiales sostenibles. Trabajo desde mi estudio en casa y amo el proceso meditativo de moldear arcilla...',
            explanation: 'Mientras más específico seas, mejor podré entender tu situación única. Piensa en qué creas, tu proceso, y qué te motiva.',
            required: true
          }
        ]
      },
      {
        id: 'businessType',
        title: 'Tu Categoría Creativa',
        subtitle: 'Ayudándome a entender tu campo',
        agentMessage: "¡Perfecto! Ya puedo ver la pasión en lo que haces. Ahora déjame categorizar tu trabajo para poder darte consejos específicos de tu industria. Diferentes campos creativos tienen diferentes desafíos y oportunidades.",
        strategicContext: "La clasificación de industria me ayuda a brindar estrategias relevantes, orientación de precios y enfoques de marketing específicos para tu campo.",
        questions: [
          {
            id: 'industry_type',
            question: '¿Qué categoría describe mejor tu trabajo creativo?',
            type: 'single-choice' as const,
            fieldName: 'industry',
            explanation: 'Esto me ayuda a entender los desafíos únicos y oportunidades en tu campo creativo específico.',
            required: true,
            options: [
              { id: 'creative', label: 'Artes Visuales y Artesanías', value: 'creative', description: 'Pintura, cerámica, joyería, textiles, carpintería' },
              { id: 'design', label: 'Servicios de Diseño', value: 'design', description: 'Diseño gráfico, web, interiores' },
              { id: 'music', label: 'Música y Audio', value: 'music', description: 'Músicos, productores, servicios de audio' },
              { id: 'writing', label: 'Escritura y Contenido', value: 'writing', description: 'Autores, copywriters, creadores de contenido' },
              { id: 'photo', label: 'Fotografía y Video', value: 'photo', description: 'Fotógrafos, videógrafos, narradores visuales' },
              { id: 'performance', label: 'Performance y Eventos', value: 'performance', description: 'Artistas, organizadores de eventos, entretenimiento' },
              { id: 'teaching', label: 'Educación Creativa', value: 'teaching', description: 'Profesores de arte, líderes de talleres, creadores de cursos' },
              { id: 'other', label: 'Otro Campo Creativo', value: 'other', description: 'Algo único o mixto' }
            ]
          },
          {
            id: 'experience_level',
            question: '¿Cuánto tiempo llevas haciendo este trabajo creativo?',
            type: 'single-choice' as const,
            fieldName: 'experience',
            explanation: 'Tu nivel de experiencia me ayuda a evaluar tu desarrollo de habilidades y preparación para el negocio.',
            required: true,
            options: [
              { id: 'new', label: 'Recién comenzando (menos de 1 año)', value: 'new' },
              { id: 'developing', label: 'Desarrollando habilidades (1-3 años)', value: 'developing' },
              { id: 'experienced', label: 'Con experiencia (3-7 años)', value: 'experienced' },
              { id: 'expert', label: 'Nivel experto (7+ años)', value: 'expert' }
            ]
          }
        ]
      },
      {
        id: 'currentSituation',
        title: 'Tu Realidad Actual',
        subtitle: 'Entendiendo dónde estás ahora',
        agentMessage: "Basándome en tu trasfondo creativo, déjame hacerte algunas preguntas específicas sobre tu situación actual. Estoy generando estas preguntas específicamente para emprendedores creativos en tu campo.",
        strategicContext: "Entender tu etapa actual de negocio me ayuda a recomendar los siguientes pasos correctos y evitar abrumarte con estrategias avanzadas si recién estás comenzando.",
        questions: [
          {
            id: 'current_stage',
            question: '¿Cuál describe mejor tu situación actual?',
            type: 'single-choice' as const,
            fieldName: 'currentStage',
            explanation: 'Esto me ayuda a entender qué tipo de apoyo necesitas más ahora mismo.',
            required: true,
            options: [
              { id: 'idea', label: 'Tengo ideas pero no he empezado a vender', value: 'idea' },
              { id: 'creating', label: 'Estoy creando pero no vendo consistentemente', value: 'creating' },
              { id: 'selling', label: 'Estoy vendiendo pero quiero crecer', value: 'selling' },
              { id: 'established', label: 'Tengo un negocio creativo establecido', value: 'established' }
            ]
          },
          {
            id: 'target_audience',
            question: '¿Para quién creas?',
            type: 'single-choice' as const,
            fieldName: 'targetAudience',
            explanation: 'Entender tu audiencia me ayuda a sugerir las mejores formas de alcanzarla y servirla.',
            required: true,
            options: [
              { id: 'individuals', label: 'Clientes individuales que aman piezas únicas', value: 'individuals' },
              { id: 'businesses', label: 'Empresas que necesitan servicios creativos', value: 'businesses' },
              { id: 'collectors', label: 'Coleccionistas y entusiastas del arte', value: 'collectors' },
              { id: 'everyday', label: 'Gente común buscando artículos hermosos', value: 'everyday' },
              { id: 'unclear', label: 'Aún estoy descubriendo esto', value: 'unclear' }
            ]
          }
        ]
      },
      {
        id: 'salesReality',
        title: 'Ventas y Dinero',
        subtitle: 'Hablemos del lado del negocio',
        agentMessage: "Ahora la pregunta importante que muchos creativos encuentran desafiante - ¡hablemos de dinero! Esto no es para juzgar, es para entender cómo ayudarte a crear ingresos sostenibles de tu pasión.",
        strategicContext: "El historial de ventas y entendimiento de precios son indicadores cruciales de madurez empresarial y me ayudan a priorizar los siguientes pasos más importantes.",
        questions: [
          {
            id: 'sales_experience',
            question: '¿Qué describe mejor tu experiencia en ventas?',
            type: 'single-choice' as const,
            fieldName: 'salesExperience',
            explanation: 'Entender tu historial de ventas me ayuda a recomendar la estrategia de crecimiento correcta.',
            required: true,
            options: [
              { id: 'never_sold', label: 'Nunca he vendido mi trabajo creativo', value: 'never_sold' },
              { id: 'few_sales', label: 'He hecho algunas ventas pero es inconsistente', value: 'few_sales' },
              { id: 'regular_sales', label: 'Hago ventas regulares pero quiero crecer', value: 'regular_sales' },
              { id: 'established_sales', label: 'Tengo ventas e ingresos consistentes', value: 'established_sales' }
            ]
          },
          {
            id: 'income_goal',
            question: '¿Cuál es tu meta de ingresos mensuales de tu trabajo creativo?',
            type: 'single-choice' as const,
            fieldName: 'incomeGoal',
            explanation: 'Tu meta de ingresos me ayuda a entender la escala de estrategia de negocio que necesitas.',
            required: true,
            options: [
              { id: 'hobby', label: 'Solo cubrir materiales ($0-200/mes)', value: 'hobby' },
              { id: 'side', label: 'Ingreso secundario significativo ($200-1000/mes)', value: 'side' },
              { id: 'partial', label: 'Ingreso parcial para vivir ($1000-3000/mes)', value: 'partial' },
              { id: 'full', label: 'Ingreso completo para vivir ($3000+/mes)', value: 'full' },
              { id: 'scale', label: 'Escalar para contratar otros y crecer grande', value: 'scale' }
            ]
          },
          {
            id: 'pricing_confidence',
            question: '¿Qué tan seguro te sientes al poner precios apropiados a tu trabajo?',
            type: 'slider' as const,
            fieldName: 'pricingConfidence',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'La confianza en precios afecta tu capacidad de ganar lo que vale tu trabajo.',
            required: true,
            showIf: {
              field: 'salesExperience',
              operator: 'not_equals' as const,
              value: 'never_sold'
            }
          }
        ]
      },
      {
        id: 'currentChallenges',
        title: 'Tus Mayores Desafíos',
        subtitle: '¿Qué te está frenando?',
        agentMessage: "Basándome en tu campo creativo y situación actual, puedo predecir algunos desafíos que podrías estar enfrentando. Identifiquemos qué está realmente bloqueando tu progreso para poder ayudarte a superar estos obstáculos específicos.",
        strategicContext: "Entender desafíos específicos me ayuda a crear un plan de acción dirigido que aborde tus necesidades más urgentes primero.",
        questions: [
          {
            id: 'main_obstacles',
            question: '¿Cuáles son tus mayores desafíos ahora mismo? (Selecciona todos los que aplican)',
            type: 'multiple-choice' as const,
            fieldName: 'mainObstacles',
            explanation: 'Sé honesto sobre qué es difícil - esto me ayuda a priorizar las soluciones más impactantes.',
            required: true,
            options: [
              { id: 'time', label: 'Encontrar tiempo para trabajar en el negocio vs. crear', value: 'time' },
              { id: 'pricing', label: 'Establecer precios que se sientan correctos', value: 'pricing' },
              { id: 'customers', label: 'Encontrar clientes que valoren mi trabajo', value: 'customers' },
              { id: 'confidence', label: 'Confianza en vender mi trabajo', value: 'confidence' },
              { id: 'marketing', label: 'Marketing y promoción personal', value: 'marketing' },
              { id: 'consistency', label: 'Crear ingresos consistentes', value: 'consistency' },
              { id: 'business', label: 'Entender el lado del negocio', value: 'business' },
              { id: 'scale', label: 'Escalar más allá de solo yo', value: 'scale' }
            ]
          },
          {
            id: 'urgency_level',
            question: '¿Qué tan urgentes se sienten estos desafíos?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Esto me ayuda a entender qué tan rápido necesitamos crear soluciones para ti.',
            required: true
          }
        ]
      },
      {
        id: 'vision',
        title: 'Tu Visión Creativa',
        subtitle: '¿Hacia dónde quieres ir?',
        agentMessage: "¡Finalmente, hablemos de tus sueños! Entender tu visión me ayuda a crear un plan de crecimiento que se alinee con lo que realmente quieres, no con lo que otros piensan que deberías querer.",
        strategicContext: "Tus metas y visión determinan el tipo e intensidad de apoyo que necesitarás. Los grandes sueños requieren estrategias diferentes que los negocios de estilo de vida.",
        questions: [
          {
            id: 'business_vision',
            question: '¿Cómo se ve el éxito para tu negocio creativo?',
            type: 'single-choice' as const,
            fieldName: 'businessVision',
            explanation: 'Tu visión me ayuda a recomendar la estrategia de crecimiento correcta y nivel de apoyo.',
            required: true,
            options: [
              { id: 'freedom', label: 'Libertad creativa con ingresos sostenibles', value: 'freedom' },
              { id: 'impact', label: 'Hacer un impacto significativo a través de mi arte', value: 'impact' },
              { id: 'growth', label: 'Construir una marca creativa reconocida', value: 'growth' },
              { id: 'legacy', label: 'Crear algo que perdure más allá de mí', value: 'legacy' },
              { id: 'balance', label: 'Equilibrio perfecto trabajo-vida haciendo lo que amo', value: 'balance' }
            ]
          },
          {
            id: 'support_style',
            question: '¿Qué tipo de apoyo funciona mejor para ti?',
            type: 'single-choice' as const,
            fieldName: 'supportStyle',
            explanation: 'Esto me ayuda a recomendar el equilibrio correcto de orientación, herramientas e independencia.',
            required: true,
            options: [
              { id: 'guided', label: 'Orientación paso a paso con instrucciones claras', value: 'guided' },
              { id: 'strategic', label: 'Dirección estratégica, yo resuelvo los detalles', value: 'strategic' },
              { id: 'tools', label: 'Dame las herramientas y recursos correctos', value: 'tools' },
              { id: 'community', label: 'Apoyo comunitario con otros creativos', value: 'community' }
            ]
          }
        ]
      }
    ]
  };
  
  return blocks[language] || blocks.en;
};
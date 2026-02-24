import { ConversationBlock } from '../types/conversationalTypes';

export const getConversationBlocks = (language: 'en' | 'es'): ConversationBlock[] => {
  const blocks = {
    en: [
      {
        id: 'whatYouDo',
        title: 'What You Do',
        subtitle: 'Understanding your core activity',
        agentMessage: "Hi! I'm excited to help you grow your business. Let's start with the basics - I need to understand what you actually do.",
        strategicContext: "This helps me identify your business type, skill level, and market position so I can give you the most relevant advice.",
        questions: [
          {
            id: 'business_description',
            question: 'Describe your business in detail - what you do, who you help, and what makes you unique?',
            type: 'text-input' as const,
            fieldName: 'businessDescription',
            placeholder: 'E.g., I create custom handmade jewelry for young professionals who want unique pieces that reflect their personality. I specialize in silver work with natural stones...',
            explanation: 'The more specific you are, the better I can understand your business and generate personalized recommendations. Think about your unique value proposition.',
            required: true
          },
          {
            id: 'industry_type',
            question: 'Which category best describes your work?',
            type: 'single-choice' as const,
            fieldName: 'industry',
            explanation: 'Different industries have different growth patterns and challenges. This helps me customize my recommendations.',
            required: true,
            options: [
              { id: 'creative', label: 'Creative & Artisan', value: 'creative', description: 'Art, crafts, design, photography' },
              { id: 'services', label: 'Services & Consulting', value: 'services', description: 'Coaching, consulting, freelancing' },
              { id: 'retail', label: 'Retail & Commerce', value: 'retail', description: 'Selling products, e-commerce' },
              { id: 'tech', label: 'Technology', value: 'tech', description: 'Software, apps, digital products' },
              { id: 'education', label: 'Education & Training', value: 'education', description: 'Teaching, courses, workshops' },
              { id: 'other', label: 'Other', value: 'other', description: 'Something different' }
            ]
          }
        ]
      },
      {
        id: 'whoYouServe',
        title: 'Your Audience',
        subtitle: 'Identifying your ideal customers',
        agentMessage: "Perfect! Based on what you've told me about your business, I'm now generating some specific questions tailored just for you. Let's dive deeper into your audience.",
        strategicContext: "Knowing your target market helps me recommend the right marketing strategies, pricing approaches, and growth tactics.",
        questions: [
          {
            id: 'target_audience',
            question: 'Who do you primarily serve?',
            type: 'single-choice' as const,
            fieldName: 'targetAudience',
            explanation: 'Different audiences require different approaches. B2C needs different strategies than B2B, for example.',
            required: true,
            options: [
              { id: 'individuals', label: 'Individual Consumers (B2C)', value: 'individuals', description: 'Regular people buying for themselves' },
              { id: 'businesses', label: 'Other Businesses (B2B)', value: 'businesses', description: 'Companies or organizations' },
              { id: 'both', label: 'Both', value: 'both', description: 'I serve both individuals and businesses' },
              { id: 'unclear', label: 'Not sure yet', value: 'unclear', description: 'Still figuring this out' }
            ]
          },
          {
            id: 'customer_clarity',
            question: 'How well do you know your ideal customer?',
            type: 'slider' as const,
            fieldName: 'customerClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Understanding your customer deeply is crucial for effective marketing and product development.',
            required: true
          },
          {
            id: 'target_demographics',
            question: 'Which demographics best describe your customers?',
            type: 'multiple-choice' as const,
            fieldName: 'targetDemographics',
            explanation: 'Demographic information helps tailor marketing messages and channels.',
            required: false,
            options: [
              { id: 'young_adults', label: 'Young Adults (18-30)', value: 'young_adults' },
              { id: 'professionals', label: 'Working Professionals (30-50)', value: 'professionals' },
              { id: 'seniors', label: 'Seniors (50+)', value: 'seniors' },
              { id: 'parents', label: 'Parents with Children', value: 'parents' },
              { id: 'students', label: 'Students', value: 'students' },
              { id: 'entrepreneurs', label: 'Other Entrepreneurs', value: 'entrepreneurs' }
            ]
          }
        ]
      },
      {
        id: 'howYouCharge',
        title: 'Your Pricing',
        subtitle: 'Understanding your revenue model',
        agentMessage: "Now that I understand your business and audience better, let's talk money! I'm generating some pricing questions specific to your industry and business model.",
        strategicContext: "Your pricing strategy reveals a lot about your business maturity and helps me identify opportunities for improvement.",
        questions: [
          {
            id: 'pricing_method',
            question: 'How do you currently set your prices?',
            type: 'single-choice' as const,
            fieldName: 'pricingMethod',
            explanation: 'Your pricing method affects profitability and scalability. Each approach has different optimization strategies.',
            required: true,
            options: [
              { id: 'hourly', label: 'By the hour', value: 'hourly', description: 'I charge per hour worked' },
              { id: 'project', label: 'Fixed project prices', value: 'project', description: 'One price per complete project' },
              { id: 'product', label: 'Per product/item', value: 'product', description: 'Each item has its own price' },
              { id: 'subscription', label: 'Monthly/recurring', value: 'subscription', description: 'Customers pay regularly' },
              { id: 'commission', label: 'Commission/percentage', value: 'commission', description: 'I get a percentage of sales/results' },
              { id: 'no_system', label: 'No clear system yet', value: 'no_system', description: 'Still figuring this out' }
            ]
          },
          {
            id: 'profit_clarity',
            question: 'How clear are you about your actual profits?',
            type: 'slider' as const,
            fieldName: 'profitClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Understanding your true profitability is essential for making smart business decisions and planning growth.',
            required: true
          },
          {
            id: 'revenue_streams',
            question: 'What are your current revenue sources?',
            type: 'multiple-choice' as const,
            fieldName: 'revenueStreams',
            explanation: 'Diversifying revenue streams can increase stability and growth potential.',
            required: false,
            options: [
              { id: 'primary_service', label: 'Main Service/Product', value: 'primary_service' },
              { id: 'add_ons', label: 'Add-on Services', value: 'add_ons' },
              { id: 'digital_products', label: 'Digital Products', value: 'digital_products' },
              { id: 'courses', label: 'Courses/Training', value: 'courses' },
              { id: 'affiliates', label: 'Affiliate Marketing', value: 'affiliates' },
              { id: 'licensing', label: 'Licensing/Royalties', value: 'licensing' }
            ]
          }
        ]
      },
      {
        id: 'salesValidation',
        title: 'Sales History',
        subtitle: 'Your track record so far',
        agentMessage: "Based on your pricing model, let me ask some targeted questions about your sales experience. This helps me understand your validation level.",
        strategicContext: "Your sales history helps me determine whether you need validation strategies or scaling strategies.",
        questions: [
          {
            id: 'has_sold',
            question: 'Have you already sold something?',
            type: 'yes-no' as const,
            fieldName: 'hasSold',
            explanation: 'This is a major milestone that changes everything about your growth strategy.',
            required: true
          },
          {
            id: 'sales_consistency',
            question: 'How often do you make sales?',
            type: 'single-choice' as const,
            fieldName: 'salesConsistency',
            explanation: 'Consistent sales indicate market validation and help me understand your current business maturity.',
            required: true,
            options: [
              { id: 'never', label: 'Never sold anything yet', value: 'never' },
              { id: 'rarely', label: 'Very rarely', value: 'rarely' },
              { id: 'occasionally', label: 'Occasionally', value: 'occasionally' },
              { id: 'regularly', label: 'Regularly', value: 'regularly' },
              { id: 'consistently', label: 'Very consistently', value: 'consistently' }
            ]
          }
        ]
      },
      {
        id: 'teamStructure',
        title: 'Your Team',
        subtitle: 'Understanding your resources',
        agentMessage: "Time to understand your support system. Are you flying solo or do you have help? Both approaches have their advantages!",
        strategicContext: "Your team structure affects everything from task prioritization to growth strategies and delegation opportunities.",
        questions: [
          {
            id: 'team_size',
            question: 'Do you work alone or with others?',
            type: 'single-choice' as const,
            fieldName: 'teamStructure',
            explanation: 'Your team structure determines what tasks you can delegate and how quickly you can scale.',
            required: true,
            options: [
              { id: 'solo', label: 'Just me', value: 'solo', description: 'I handle everything myself' },
              { id: 'partner', label: 'With a partner', value: 'partner', description: 'I have one main collaborator' },
              { id: 'small_team', label: 'Small team (3-5 people)', value: 'small_team', description: 'We have a small group' },
              { id: 'larger_team', label: 'Larger team (6+ people)', value: 'larger_team', description: 'We have a bigger organization' }
            ]
          },
          {
            id: 'delegation_comfort',
            question: 'How comfortable are you delegating tasks?',
            type: 'slider' as const,
            fieldName: 'delegationComfort',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Delegation skills are crucial for scaling. This helps me know if we need to work on this area.',
            required: true
          }
        ]
      },
      {
        id: 'marketingChannels',
        title: 'Promotion & Visibility',
        subtitle: 'How you attract customers',
        agentMessage: "Perfect! Now I'll customize some marketing questions specifically for your industry and target audience. Let's see what's working and what we can improve.",
        strategicContext: "Your current marketing efforts reveal opportunities for improvement and help me recommend the best growth channels for your business type.",
        questions: [
          {
            id: 'promotion_channels',
            question: 'Where do you currently promote your work?',
            type: 'multiple-choice' as const,
            fieldName: 'promotionChannels',
            explanation: 'Understanding your current channels helps me identify gaps and opportunities for better reach.',
            required: true,
            options: [
              { id: 'social_media', label: 'Social Media', value: 'social_media' },
              { id: 'word_of_mouth', label: 'Word of Mouth', value: 'word_of_mouth' },
              { id: 'website', label: 'My Website', value: 'website' },
              { id: 'referrals', label: 'Referrals', value: 'referrals' },
              { id: 'advertising', label: 'Paid Advertising', value: 'advertising' },
              { id: 'networking', label: 'Networking Events', value: 'networking' },
              { id: 'marketplace', label: 'Online Marketplaces', value: 'marketplace' },
              { id: 'nowhere', label: 'Nowhere really', value: 'nowhere' }
            ]
          },
          {
            id: 'marketing_confidence',
            question: 'How confident do you feel about marketing yourself?',
            type: 'slider' as const,
            fieldName: 'marketingConfidence',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Marketing confidence affects how effectively you can promote your business. Low confidence means we need to work on this area.',
            required: true
          }
        ]
      },
      {
        id: 'growthBlocks',
        title: 'Growth Obstacles',
        subtitle: 'What\'s holding you back',
        agentMessage: "Now for the tailored analysis - based on everything you've shared, I can predict some specific obstacles. Let's see if I'm right and identify what's really holding you back.",
        strategicContext: "Understanding your specific challenges helps me prioritize the most impactful tasks and recommend the right agents to help you.",
        questions: [
          {
            id: 'main_obstacles',
            question: 'What are your biggest obstacles right now?',
            type: 'multiple-choice' as const,
            fieldName: 'mainObstacles',
            explanation: 'Identifying your specific challenges helps me create a personalized action plan to overcome them.',
            required: true,
            options: [
              { id: 'time', label: 'Not enough time', value: 'time' },
              { id: 'money', label: 'Limited budget', value: 'money' },
              { id: 'knowledge', label: 'Don\'t know where to start', value: 'knowledge' },
              { id: 'confidence', label: 'Lack of confidence', value: 'confidence' },
              { id: 'customers', label: 'Finding customers', value: 'customers' },
              { id: 'pricing', label: 'Setting the right prices', value: 'pricing' },
              { id: 'competition', label: 'Too much competition', value: 'competition' },
              { id: 'technology', label: 'Technical challenges', value: 'technology' },
              { id: 'legal', label: 'Legal/administrative stuff', value: 'legal' },
              { id: 'fear', label: 'Fear of failure', value: 'fear' }
            ]
          },
          {
            id: 'urgency_level',
            question: 'How urgent do these obstacles feel?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Urgency level helps me prioritize which obstacles to tackle first and how quickly we need to move.',
            required: true
          }
        ]
      },
      {
        id: 'visionGoals',
        title: 'Your Vision',
        subtitle: 'Where you want to go',
        agentMessage: "Finally, based on your unique business profile, let me ask some vision questions that will help me create the perfect growth strategy for you specifically.",
        strategicContext: "Your goals determine the type and intensity of support you'll need. Big dreams require different strategies than lifestyle businesses.",
        questions: [
          {
            id: 'business_goals',
            question: 'What\'s your main goal for your business?',
            type: 'single-choice' as const,
            fieldName: 'businessGoals',
            explanation: 'Your goals help me recommend the right level of support and appropriate growth strategies.',
            required: true,
            options: [
              { id: 'side_income', label: 'Extra income on the side', value: 'side_income', description: 'Supplement my main income' },
              { id: 'replace_job', label: 'Replace my day job', value: 'replace_job', description: 'Become my main source of income' },
              { id: 'grow_business', label: 'Build a real business', value: 'grow_business', description: 'Create something that can grow beyond me' },
              { id: 'scale_enterprise', label: 'Scale to a big company', value: 'scale_enterprise', description: 'Build a large organization' },
              { id: 'not_sure', label: 'Not sure yet', value: 'not_sure', description: 'Still exploring possibilities' }
            ]
          },
          {
            id: 'support_preference',
            question: 'What kind of support do you prefer?',
            type: 'single-choice' as const,
            fieldName: 'supportPreference',
            explanation: 'This helps me recommend the right balance of guidance, tools, and automation for your working style.',
            required: true,
            options: [
              { id: 'hands_on', label: 'Hands-on guidance', value: 'hands_on', description: 'I want detailed help with everything' },
              { id: 'strategic', label: 'Strategic direction', value: 'strategic', description: 'Give me the plan, I\'ll execute' },
              { id: 'tools', label: 'Tools and resources', value: 'tools', description: 'I need better systems and tools' },
              { id: 'minimal', label: 'Minimal intervention', value: 'minimal', description: 'Just point me in the right direction' }
            ]
          }
        ]
      }
    ],
    es: [
      {
        id: 'whatYouDo',
        title: 'Qué Haces',
        subtitle: 'Entendiendo tu actividad principal',
        agentMessage: "¡Hola! Estoy emocionado de ayudarte a hacer crecer tu negocio. Empecemos por lo básico: necesito entender qué haces realmente.",
        strategicContext: "Esto me ayuda a identificar tu tipo de negocio, nivel de habilidad y posición en el mercado para darte el consejo más relevante.",
        questions: [
          {
            id: 'business_description',
            question: '¿Qué haces o vendes exactamente?',
            type: 'text-input' as const,
            fieldName: 'businessDescription',
            placeholder: 'Ej: Hago joyería artesanal, enseño piano, desarrollo apps móviles...',
            explanation: 'Esto me ayuda a entender tu producto o servicio principal e identificar las mejores estrategias de crecimiento para tu industria específica.',
            required: true
          },
          {
            id: 'industry_type',
            question: '¿Qué categoría describe mejor tu trabajo?',
            type: 'single-choice' as const,
            fieldName: 'industry',
            explanation: 'Diferentes industrias tienen diferentes patrones de crecimiento y desafíos. Esto me ayuda a personalizar mis recomendaciones.',
            required: true,
            options: [
              { id: 'creative', label: 'Creativo y Artesanal', value: 'creative', description: 'Arte, manualidades, diseño, fotografía' },
              { id: 'services', label: 'Servicios y Consultoría', value: 'services', description: 'Coaching, consultoría, freelancing' },
              { id: 'retail', label: 'Venta y Comercio', value: 'retail', description: 'Venta de productos, e-commerce' },
              { id: 'tech', label: 'Tecnología', value: 'tech', description: 'Software, apps, productos digitales' },
              { id: 'education', label: 'Educación y Capacitación', value: 'education', description: 'Enseñanza, cursos, talleres' },
              { id: 'other', label: 'Otro', value: 'other', description: 'Algo diferente' }
            ]
          }
        ]
      },
      {
        id: 'whoYouServe',
        title: 'Tu Audiencia',
        subtitle: 'Identificando tus clientes ideales',
        agentMessage: "¡Perfecto! Ahora necesito entender a quién estás ayudando. Tu audiencia es clave para todo lo que construiremos juntos.",
        strategicContext: "Conocer tu mercado objetivo me ayuda a recomendar las estrategias de marketing, enfoques de precios y tácticas de crecimiento correctas.",
        questions: [
          {
            id: 'target_audience',
            question: '¿A quién sirves principalmente?',
            type: 'single-choice' as const,
            fieldName: 'targetAudience',
            explanation: 'Diferentes audiencias requieren diferentes enfoques. B2C necesita estrategias diferentes a B2B, por ejemplo.',
            required: true,
            options: [
              { id: 'individuals', label: 'Consumidores Individuales (B2C)', value: 'individuals', description: 'Personas normales comprando para sí mismas' },
              { id: 'businesses', label: 'Otras Empresas (B2B)', value: 'businesses', description: 'Compañías u organizaciones' },
              { id: 'both', label: 'Ambos', value: 'both', description: 'Sirvo tanto a individuos como empresas' },
              { id: 'unclear', label: 'No estoy seguro aún', value: 'unclear', description: 'Aún estoy descubriendo esto' }
            ]
          },
          {
            id: 'customer_clarity',
            question: '¿Qué tan bien conoces a tu cliente ideal?',
            type: 'slider' as const,
            fieldName: 'customerClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Entender profundamente a tu cliente es crucial para el marketing efectivo y el desarrollo de productos.',
            required: true
          }
        ]
      },
      {
        id: 'howYouCharge',
        title: 'Tus Precios',
        subtitle: 'Entendiendo tu modelo de ingresos',
        agentMessage: "¡Hora de hablar de dinero! No te preocupes, esto no es un juicio - es para entender tu modelo de ingresos actual y ayudarte a optimizarlo.",
        strategicContext: "Tu estrategia de precios revela mucho sobre la madurez de tu negocio y me ayuda a identificar oportunidades de mejora.",
        questions: [
          {
            id: 'pricing_method',
            question: '¿Cómo estableces tus precios actualmente?',
            type: 'single-choice' as const,
            fieldName: 'pricingMethod',
            explanation: 'Tu método de precios afecta la rentabilidad y escalabilidad. Cada enfoque tiene diferentes estrategias de optimización.',
            required: true,
            options: [
              { id: 'hourly', label: 'Por hora', value: 'hourly', description: 'Cobro por hora trabajada' },
              { id: 'project', label: 'Precios fijos por proyecto', value: 'project', description: 'Un precio por proyecto completo' },
              { id: 'product', label: 'Por producto/artículo', value: 'product', description: 'Cada artículo tiene su propio precio' },
              { id: 'subscription', label: 'Mensual/recurrente', value: 'subscription', description: 'Los clientes pagan regularmente' },
              { id: 'commission', label: 'Comisión/porcentaje', value: 'commission', description: 'Obtengo un porcentaje de ventas/resultados' },
              { id: 'no_system', label: 'Sin sistema claro aún', value: 'no_system', description: 'Aún estoy descubriendo esto' }
            ]
          },
          {
            id: 'profit_clarity',
            question: '¿Qué tan claro tienes tus ganancias reales?',
            type: 'slider' as const,
            fieldName: 'profitClarity',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Entender tu rentabilidad real es esencial para tomar decisiones inteligentes de negocio y planificar el crecimiento.',
            required: true
          }
        ]
      },
      {
        id: 'salesValidation',
        title: 'Historial de Ventas',
        subtitle: 'Tu trayectoria hasta ahora',
        agentMessage: "Hablemos de tu experiencia en ventas. Esto no es para presumir - es para entender dónde estás en tu viaje.",
        strategicContext: "Tu historial de ventas me ayuda a determinar si necesitas estrategias de validación o estrategias de escalamiento.",
        questions: [
          {
            id: 'has_sold',
            question: '¿Ya has vendido algo?',
            type: 'yes-no' as const,
            fieldName: 'hasSold',
            explanation: 'Este es un hito importante que cambia todo sobre tu estrategia de crecimiento.',
            required: true
          },
          {
            id: 'sales_consistency',
            question: '¿Con qué frecuencia realizas ventas?',
            type: 'single-choice' as const,
            fieldName: 'salesConsistency',
            explanation: 'Las ventas consistentes indican validación del mercado y me ayudan a entender tu madurez empresarial actual.',
            required: true,
            options: [
              { id: 'never', label: 'Nunca he vendido nada aún', value: 'never' },
              { id: 'rarely', label: 'Muy raramente', value: 'rarely' },
              { id: 'occasionally', label: 'Ocasionalmente', value: 'occasionally' },
              { id: 'regularly', label: 'Regularmente', value: 'regularly' },
              { id: 'consistently', label: 'Muy consistentemente', value: 'consistently' }
            ]
          }
        ]
      },
      {
        id: 'teamStructure',
        title: 'Tu Equipo',
        subtitle: 'Entendiendo tus recursos',
        agentMessage: "Hora de entender tu sistema de apoyo. ¿Trabajas solo o tienes ayuda? ¡Ambos enfoques tienen sus ventajas!",
        strategicContext: "Tu estructura de equipo afecta todo, desde la priorización de tareas hasta las estrategias de crecimiento y oportunidades de delegación.",
        questions: [
          {
            id: 'team_size',
            question: '¿Trabajas solo o con otros?',
            type: 'single-choice' as const,
            fieldName: 'teamStructure',
            explanation: 'Tu estructura de equipo determina qué tareas puedes delegar y qué tan rápido puedes escalar.',
            required: true,
            options: [
              { id: 'solo', label: 'Solo yo', value: 'solo', description: 'Manejo todo yo mismo' },
              { id: 'partner', label: 'Con un socio', value: 'partner', description: 'Tengo un colaborador principal' },
              { id: 'small_team', label: 'Equipo pequeño (3-5 personas)', value: 'small_team', description: 'Tenemos un grupo pequeño' },
              { id: 'larger_team', label: 'Equipo más grande (6+ personas)', value: 'larger_team', description: 'Tenemos una organización más grande' }
            ]
          },
          {
            id: 'delegation_comfort',
            question: '¿Qué tan cómodo te sientes delegando tareas?',
            type: 'slider' as const,
            fieldName: 'delegationComfort',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'Las habilidades de delegación son cruciales para escalar. Esto me ayuda a saber si necesitamos trabajar en esta área.',
            required: true
          }
        ]
      },
      {
        id: 'marketingChannels',
        title: 'Promoción y Visibilidad',
        subtitle: 'Cómo atraes clientes',
        agentMessage: "Exploremos cómo la gente se entera de ti. El marketing no tiene que dar miedo - veamos qué está funcionando y qué necesita atención.",
        strategicContext: "Tus esfuerzos de marketing actuales revelan oportunidades de mejora y me ayudan a recomendar los mejores canales de crecimiento para tu tipo de negocio.",
        questions: [
          {
            id: 'promotion_channels',
            question: '¿Dónde promocionas tu trabajo actualmente?',
            type: 'multiple-choice' as const,
            fieldName: 'promotionChannels',
            explanation: 'Entender tus canales actuales me ayuda a identificar brechas y oportunidades para mejor alcance.',
            required: true,
            options: [
              { id: 'social_media', label: 'Redes Sociales', value: 'social_media' },
              { id: 'word_of_mouth', label: 'Boca a Boca', value: 'word_of_mouth' },
              { id: 'website', label: 'Mi Sitio Web', value: 'website' },
              { id: 'referrals', label: 'Referencias', value: 'referrals' },
              { id: 'advertising', label: 'Publicidad Pagada', value: 'advertising' },
              { id: 'networking', label: 'Eventos de Networking', value: 'networking' },
              { id: 'marketplace', label: 'Mercados Online', value: 'marketplace' },
              { id: 'nowhere', label: 'En ningún lado realmente', value: 'nowhere' }
            ]
          },
          {
            id: 'marketing_confidence',
            question: '¿Qué tan confiado te sientes promocionándote?',
            type: 'slider' as const,
            fieldName: 'marketingConfidence',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'La confianza en marketing afecta qué tan efectivamente puedes promocionar tu negocio. Baja confianza significa que necesitamos trabajar en esta área.',
            required: true
          }
        ]
      },
      {
        id: 'growthBlocks',
        title: 'Obstáculos de Crecimiento',
        subtitle: 'Qué te está frenando',
        agentMessage: "Ahora la conversación real - ¿qué te está impidiendo crecer realmente? Sin juicios aquí, todos tenemos obstáculos. Identificarlos es el primer paso para superarlos.",
        strategicContext: "Entender tus desafíos específicos me ayuda a priorizar las tareas más impactantes y recomendar los agentes correctos para ayudarte.",
        questions: [
          {
            id: 'main_obstacles',
            question: '¿Cuáles son tus mayores obstáculos ahora mismo?',
            type: 'multiple-choice' as const,
            fieldName: 'mainObstacles',
            explanation: 'Identificar tus desafíos específicos me ayuda a crear un plan de acción personalizado para superarlos.',
            required: true,
            options: [
              { id: 'time', label: 'No tengo suficiente tiempo', value: 'time' },
              { id: 'money', label: 'Presupuesto limitado', value: 'money' },
              { id: 'knowledge', label: 'No sé por dónde empezar', value: 'knowledge' },
              { id: 'confidence', label: 'Falta de confianza', value: 'confidence' },
              { id: 'customers', label: 'Encontrar clientes', value: 'customers' },
              { id: 'pricing', label: 'Establecer precios correctos', value: 'pricing' },
              { id: 'competition', label: 'Demasiada competencia', value: 'competition' },
              { id: 'technology', label: 'Desafíos técnicos', value: 'technology' },
              { id: 'legal', label: 'Temas legales/administrativos', value: 'legal' },
              { id: 'fear', label: 'Miedo al fracaso', value: 'fear' }
            ]
          },
          {
            id: 'urgency_level',
            question: '¿Qué tan urgentes se sienten estos obstáculos?',
            type: 'slider' as const,
            fieldName: 'urgencyLevel',
            min: 1,
            max: 5,
            step: 1,
            explanation: 'El nivel de urgencia me ayuda a priorizar qué obstáculos abordar primero y qué tan rápido necesitamos movernos.',
            required: true
          }
        ]
      },
      {
        id: 'visionGoals',
        title: 'Tu Visión',
        subtitle: 'A dónde quieres llegar',
        agentMessage: "Finalmente, ¡vamos a soñar un poco! ¿Dónde te ves en el futuro? Tu visión me ayuda a entender qué tipo de apoyo necesitarás.",
        strategicContext: "Tus objetivos determinan el tipo e intensidad de apoyo que necesitarás. Los grandes sueños requieren estrategias diferentes a los negocios de estilo de vida.",
        questions: [
          {
            id: 'business_goals',
            question: '¿Cuál es tu objetivo principal para tu negocio?',
            type: 'single-choice' as const,
            fieldName: 'businessGoals',
            explanation: 'Tus objetivos me ayudan a recomendar el nivel correcto de apoyo y estrategias de crecimiento apropiadas.',
            required: true,
            options: [
              { id: 'side_income', label: 'Ingresos extra', value: 'side_income', description: 'Complementar mis ingresos principales' },
              { id: 'replace_job', label: 'Reemplazar mi trabajo', value: 'replace_job', description: 'Convertirse en mi fuente principal de ingresos' },
              { id: 'grow_business', label: 'Construir un negocio real', value: 'grow_business', description: 'Crear algo que pueda crecer más allá de mí' },
              { id: 'scale_enterprise', label: 'Escalar a una gran empresa', value: 'scale_enterprise', description: 'Construir una organización grande' },
              { id: 'not_sure', label: 'No estoy seguro aún', value: 'not_sure', description: 'Aún explorando posibilidades' }
            ]
          },
          {
            id: 'support_preference',
            question: '¿Qué tipo de apoyo prefieres?',
            type: 'single-choice' as const,
            fieldName: 'supportPreference',
            explanation: 'Esto me ayuda a recomendar el equilibrio correcto de orientación, herramientas y automatización para tu estilo de trabajo.',
            required: true,
            options: [
              { id: 'hands_on', label: 'Orientación práctica', value: 'hands_on', description: 'Quiero ayuda detallada con todo' },
              { id: 'strategic', label: 'Dirección estratégica', value: 'strategic', description: 'Dame el plan, yo lo ejecuto' },
              { id: 'tools', label: 'Herramientas y recursos', value: 'tools', description: 'Necesito mejores sistemas y herramientas' },
              { id: 'minimal', label: 'Intervención mínima', value: 'minimal', description: 'Solo señálame la dirección correcta' }
            ]
          }
        ]
      }
    ]
  };

  return blocks[language];
};
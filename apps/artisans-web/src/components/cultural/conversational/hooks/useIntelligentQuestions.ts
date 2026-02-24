import { useState, useCallback, useRef } from 'react';
import { ConversationBlock, ConversationQuestion } from '../types/conversationalTypes';
import { UserProfileData } from '../../types/wizardTypes';

interface IntelligentQuestionParams {
  profileData: UserProfileData;
  language: 'en' | 'es';
  currentBlock: ConversationBlock;
}

interface UserContext {
  industry: string;
  experienceLevel: string;
  businessStage: string;
  mainChallenges: string[];
  businessType: string;
  specificDetails: string[];
}

export const useIntelligentQuestions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<ConversationQuestion[]>([]);
  const generationTimeoutRef = useRef<NodeJS.Timeout>();

  const analyzeUserContext = useCallback((profileData: UserProfileData): UserContext => {
    const businessDescription = typeof profileData.businessDescription === 'string'
      ? profileData.businessDescription.toLowerCase()
      : '';
    const industry = profileData.industry || '';
    const challenges = Array.isArray(profileData.mainObstacles) ? profileData.mainObstacles : [];
    
    // Extract specific details from business description
    const specificDetails: string[] = [];
    if (businessDescription.includes('ceramic') || businessDescription.includes('clay')) specificDetails.push('ceramics');
    if (businessDescription.includes('photo') || businessDescription.includes('imagen')) specificDetails.push('photography');
    if (businessDescription.includes('design') || businessDescription.includes('diseño')) specificDetails.push('design');
    if (businessDescription.includes('music') || businessDescription.includes('música')) specificDetails.push('music');
    if (businessDescription.includes('write') || businessDescription.includes('escrib')) specificDetails.push('writing');
    if (businessDescription.includes('coach') || businessDescription.includes('consult')) specificDetails.push('consulting');
    
    return {
      industry,
      experienceLevel: profileData.experience || 'new',
      businessStage: profileData.supportPreference || 'idea',
      mainChallenges: challenges,
      businessType: detectBusinessType(businessDescription, industry),
      specificDetails
    };
  }, []);

  const detectBusinessType = useCallback((description: string, industry: string): string => {
    if (description.includes('ceramic') || description.includes('pottery') || description.includes('clay')) return 'ceramist';
    if (description.includes('photo') || description.includes('imagen')) return 'photographer';
    if (description.includes('design') || description.includes('diseño')) return 'designer';
    if (description.includes('music') || description.includes('sound')) return 'musician';
    if (description.includes('paint') || description.includes('draw') || description.includes('ilustr')) return 'visual_artist';
    if (description.includes('coach') || description.includes('consult') || description.includes('teach')) return 'service_provider';
    return industry || 'creative';
  }, []);

  const generateContextualQuestions = useCallback(async ({
    profileData,
    language,
    currentBlock
  }: IntelligentQuestionParams) => {
    console.log('🤖 Generating intelligent questions based on context...');
    setIsGenerating(true);
    
    const userContext = analyzeUserContext(profileData);
    const adaptiveQuestions = generateAdaptiveQuestions(userContext, profileData, language, currentBlock);
    
    setDynamicQuestions(adaptiveQuestions);
    setIsGenerating(false);
    return adaptiveQuestions;
  }, [analyzeUserContext]);

  const getIndustrySpecificQuestions = useCallback((
    industry: string, 
    businessDescription: string, 
    language: 'en' | 'es'
  ): ConversationQuestion[] => {
    const industryQuestions: Record<string, ConversationQuestion[]> = {
      creative: [
        {
          id: 'creative_portfolio',
          question: language === 'es' 
            ? '¿Cómo muestras tu trabajo creativo a clientes potenciales?'
            : 'How do you showcase your creative work to potential clients?',
          type: 'multiple-choice',
          fieldName: 'portfolioChannels',
          options: [
            { id: 'website', label: language === 'es' ? 'Sitio web personal' : 'Personal website', value: 'website' },
            { id: 'social', label: language === 'es' ? 'Redes sociales' : 'Social media', value: 'social' },
            { id: 'marketplace', label: language === 'es' ? 'Plataformas como Etsy' : 'Platforms like Etsy', value: 'marketplace' },
            { id: 'physical', label: language === 'es' ? 'Portafolio físico' : 'Physical portfolio', value: 'physical' }
          ],
          explanation: language === 'es' 
            ? 'Tu portafolio es clave para atraer clientes en industrias creativas'
            : 'Your portfolio is key to attracting clients in creative industries',
          required: true
        }
      ],
      tech: [
        {
          id: 'tech_stack',
          question: language === 'es'
            ? '¿Qué tecnologías usas principalmente en tus proyectos?'
            : 'What technologies do you primarily use in your projects?',
          type: 'multiple-choice',
          fieldName: 'techStack',
          options: [
            { id: 'web', label: 'Web Development', value: 'web' },
            { id: 'mobile', label: 'Mobile Apps', value: 'mobile' },
            { id: 'ai', label: 'AI/Machine Learning', value: 'ai' },
            { id: 'blockchain', label: 'Blockchain', value: 'blockchain' }
          ],
          explanation: language === 'es'
            ? 'Conocer tu stack tecnológico nos ayuda a recomendar herramientas específicas'
            : 'Knowing your tech stack helps us recommend specific tools',
          required: true
        }
      ],
      services: [
        {
          id: 'service_delivery',
          question: language === 'es'
            ? '¿Cómo entregas tus servicios a los clientes?'
            : 'How do you deliver your services to clients?',
          type: 'multiple-choice',
          fieldName: 'serviceDelivery',
          options: [
            { id: 'in_person', label: language === 'es' ? 'En persona' : 'In person', value: 'in_person' },
            { id: 'online', label: language === 'es' ? 'Online/Virtual' : 'Online/Virtual', value: 'online' },
            { id: 'hybrid', label: language === 'es' ? 'Híbrido' : 'Hybrid', value: 'hybrid' }
          ],
          explanation: language === 'es'
            ? 'El método de entrega afecta la escalabilidad de tu negocio'
            : 'Delivery method affects your business scalability',
          required: true
        }
      ]
    };

    return industryQuestions[industry] || [];
  }, []);

  const getConditionalQuestions = useCallback((
    profileData: UserProfileData,
    language: 'en' | 'es'
  ): ConversationQuestion[] => {
    const conditionalQuestions: ConversationQuestion[] = [];

    // Add questions based on previous answers
    if (profileData.hasSold === false) {
      conditionalQuestions.push({
        id: 'validation_strategy',
        question: language === 'es'
          ? '¿Qué estrategia planeas usar para validar tu primera venta?'
          : 'What strategy do you plan to use to validate your first sale?',
        type: 'single-choice',
        fieldName: 'validationStrategy',
        options: [
          { id: 'mvp', label: language === 'es' ? 'Crear un MVP' : 'Create an MVP', value: 'mvp' },
          { id: 'pre_order', label: language === 'es' ? 'Pre-órdenes' : 'Pre-orders', value: 'pre_order' },
          { id: 'prototype', label: language === 'es' ? 'Mostrar prototipos' : 'Show prototypes', value: 'prototype' },
          { id: 'free_trial', label: language === 'es' ? 'Prueba gratuita' : 'Free trial', value: 'free_trial' }
        ],
        explanation: language === 'es'
          ? 'Validar antes de invertir tiempo es crucial para el éxito'
          : 'Validating before investing time is crucial for success',
        required: true
      });
    }

    if (profileData.teamStructure === 'solo') {
      conditionalQuestions.push({
        id: 'solo_challenges',
        question: language === 'es'
          ? '¿Cuál es tu mayor desafío trabajando solo?'
          : 'What is your biggest challenge working alone?',
        type: 'single-choice',
        fieldName: 'soloChallenges',
        options: [
          { id: 'time', label: language === 'es' ? 'Falta de tiempo' : 'Lack of time', value: 'time' },
          { id: 'skills', label: language === 'es' ? 'Habilidades limitadas' : 'Limited skills', value: 'skills' },
          { id: 'motivation', label: language === 'es' ? 'Motivación' : 'Motivation', value: 'motivation' },
          { id: 'resources', label: language === 'es' ? 'Recursos limitados' : 'Limited resources', value: 'resources' }
        ],
        explanation: language === 'es'
          ? 'Entender tus limitaciones nos ayuda a sugerir soluciones específicas'
          : 'Understanding your limitations helps us suggest specific solutions',
        required: true
      });
    }

    return conditionalQuestions;
  }, []);

  const generateAdaptiveQuestions = useCallback((
    userContext: UserContext,
    profileData: UserProfileData,
    language: 'en' | 'es',
    currentBlock: ConversationBlock
  ): ConversationQuestion[] => {
    const questions: ConversationQuestion[] = [];
    
    // Generate questions based on specific business type mentioned
    if (userContext.specificDetails.includes('ceramics')) {
      questions.push({
        id: 'ceramic_technique',
        question: language === 'es' 
          ? 'Veo que trabajas con cerámica. ¿Qué técnicas específicas usas - raku, gres, porcelana?'
          : 'I see you work with ceramics. What specific techniques do you use - raku, stoneware, porcelain?',
        type: 'text-input',
        fieldName: 'ceramicTechnique',
        explanation: language === 'es' 
          ? 'Las técnicas específicas afectan tus costos de materiales y pricing'
          : 'Specific techniques affect your material costs and pricing',
        required: false,
        placeholder: language === 'es' ? 'Ej: Trabajo principalmente con gres a alta temperatura...' : 'e.g., I mainly work with high-fire stoneware...'
      });
      
      if (profileData.hasSold === false) {
        questions.push({
          id: 'ceramic_market_test',
          question: language === 'es' 
            ? 'Para cerámica, ¿has considerado vender en mercados locales o ferias de artesanos primero?'
            : 'For ceramics, have you considered selling at local markets or craft fairs first?',
          type: 'single-choice',
          fieldName: 'marketTestStrategy',
          explanation: language === 'es' 
            ? 'Los mercados locales son perfectos para probar tu producto y obtener feedback directo'
            : 'Local markets are perfect for testing your product and getting direct feedback',
          options: [
            { id: 'yes_planned', label: language === 'es' ? 'Sí, lo tengo planeado' : 'Yes, I have it planned', value: 'yes_planned' },
            { id: 'yes_done', label: language === 'es' ? 'Sí, ya lo he hecho' : 'Yes, I\'ve already done it', value: 'yes_done' },
            { id: 'no_interest', label: language === 'es' ? 'No me interesa' : 'Not interested', value: 'no_interest' },
            { id: 'no_idea', label: language === 'es' ? 'No sabía de esta opción' : 'Didn\'t know about this option', value: 'no_idea' }
          ],
          required: true
        });
      }
    }
    
    if (userContext.specificDetails.includes('photography')) {
      questions.push({
        id: 'photo_specialty',
        question: language === 'es' 
          ? 'Como fotógrafo, ¿cuál es tu especialidad - bodas, retratos, comercial, arte?'
          : 'As a photographer, what\'s your specialty - weddings, portraits, commercial, fine art?',
        type: 'text-input',
        fieldName: 'photoSpecialty',
        explanation: language === 'es' 
          ? 'Tu especialidad determina tu mercado objetivo y estrategia de precios'
          : 'Your specialty determines your target market and pricing strategy',
        required: false,
        placeholder: language === 'es' ? 'Ej: Me especializo en retratos de familia en exteriores...' : 'e.g., I specialize in outdoor family portraits...'
      });
      
      if (profileData.targetAudience === 'businesses') {
        questions.push({
          id: 'b2b_photo_process',
          question: language === 'es' 
            ? 'Para clientes empresariales, ¿cómo es tu proceso de venta? ¿Propuestas, reuniones?'
            : 'For business clients, what\'s your sales process? Proposals, meetings?',
          type: 'text-input',
          fieldName: 'b2bSalesProcess',
          explanation: language === 'es' 
            ? 'Los procesos B2B requieren estrategias diferentes a clientes individuales'
            : 'B2B processes require different strategies than individual clients',
          required: false,
          placeholder: language === 'es' ? 'Describe tu proceso actual...' : 'Describe your current process...'
        });
      }
    }
    
    // Generate follow-up questions based on previous answers
    if (profileData.mainObstacles?.includes('pricing')) {
      const businessType = userContext.businessType;
      questions.push({
        id: 'pricing_specific_challenge',
        question: language === 'es' 
          ? `Como ${businessType}, ¿qué específicamente te confunde del pricing - costos, competencia, valor percibido?`
          : `As a ${businessType}, what specifically confuses you about pricing - costs, competition, perceived value?`,
        type: 'text-input',
        fieldName: 'pricingSpecificChallenge',
        explanation: language === 'es' 
          ? 'Entender el aspecto específico del pricing nos ayuda a darte consejos precisos'
          : 'Understanding the specific pricing aspect helps us give you precise advice',
        required: false,
        placeholder: language === 'es' ? 'Ej: No sé cómo justificar precios altos...' : 'e.g., I don\'t know how to justify high prices...'
      });
    }
    
    if (profileData.mainObstacles?.includes('customers') && profileData.targetAudience) {
      questions.push({
        id: 'customer_finding_specifics',
        question: language === 'es' 
          ? `Has dicho que tu audiencia son ${profileData.targetAudience}. ¿Dónde crees que están en línea?`
          : `You said your audience is ${profileData.targetAudience}. Where do you think they hang out online?`,
        type: 'text-input',
        fieldName: 'customerOnlineHabits',
        explanation: language === 'es' 
          ? 'Saber dónde está tu audiencia te ayuda a enfocar tu marketing'
          : 'Knowing where your audience is helps you focus your marketing',
        required: false,
        placeholder: language === 'es' ? 'Ej: Instagram, Facebook, Pinterest...' : 'e.g., Instagram, Facebook, Pinterest...'
      });
    }
    
    // Experience-based adaptive questions  
    if (userContext.experienceLevel === 'expert' && profileData.supportPreference === 'strategic') {
      questions.push({
        id: 'scaling_vision',
        question: language === 'es' 
          ? 'Con tu experiencia, ¿qué aspecto del escalamiento te emociona más - equipo, sistemas, impacto?'
          : 'With your experience, what aspect of scaling excites you most - team, systems, impact?',
        type: 'single-choice',
        fieldName: 'scalingFocus',
        explanation: language === 'es' 
          ? 'Tu enfoque de escalamiento determina las siguientes estrategias a implementar'
          : 'Your scaling focus determines the next strategies to implement',
        options: [
          { id: 'team', label: language === 'es' ? 'Construir un equipo' : 'Building a team', value: 'team' },
          { id: 'systems', label: language === 'es' ? 'Crear sistemas eficientes' : 'Creating efficient systems', value: 'systems' },
          { id: 'impact', label: language === 'es' ? 'Amplificar mi impacto' : 'Amplifying my impact', value: 'impact' },
          { id: 'freedom', label: language === 'es' ? 'Libertad personal' : 'Personal freedom', value: 'freedom' }
        ],
        required: true
      });
    }
    
    return questions;
  }, []);

  const getHighQualityStaticQuestions = useCallback((
    profileData: UserProfileData,
    language: 'en' | 'es',
    currentBlock: ConversationBlock
  ): ConversationQuestion[] => {
    // Return curated, high-quality text-input questions based on context
    const questions: ConversationQuestion[] = [];
    
    if (currentBlock.id === 'whoYouServe') {
      questions.push({
        id: 'target_audience_detail',
        question: language === 'es' 
          ? '¿Qué problema específico resuelves para tus clientes ideales?'
          : 'What specific problem do you solve for your ideal clients?',
        type: 'text-input',
        fieldName: 'problemSolved',
        explanation: language === 'es' 
          ? 'Entender el problema que resuelves nos ayuda a crear mejores estrategias'
          : 'Understanding the problem you solve helps us create better strategies',
        required: false,
        placeholder: language === 'es' 
          ? 'Describe el problema principal que resuelves...' 
          : 'Describe the main problem you solve...'
      });
    }
    
    if (currentBlock.id === 'howYouCharge') {
      questions.push({
        id: 'pricing_challenges',
        question: language === 'es' 
          ? '¿Cuál es tu mayor desafío al establecer precios?'
          : 'What is your biggest challenge when setting prices?',
        type: 'text-input',
        fieldName: 'pricingChallenges',
        explanation: language === 'es' 
          ? 'Los desafíos de precios nos ayudan a sugerir mejores estrategias'
          : 'Pricing challenges help us suggest better strategies',
        required: false,
        placeholder: language === 'es' 
          ? 'Comparte tus desafíos con los precios...' 
          : 'Share your pricing challenges...'
      });
    }
    
    return questions;
  }, []);

  return {
    generateContextualQuestions,
    generateAdaptiveQuestions,
    getIndustrySpecificQuestions,
    getConditionalQuestions,
    getHighQualityStaticQuestions,
    analyzeUserContext,
    isGenerating,
    dynamicQuestions
  };
};
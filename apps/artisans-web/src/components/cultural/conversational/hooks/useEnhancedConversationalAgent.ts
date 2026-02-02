import { useState, useCallback, useEffect, useRef } from 'react';
import { ConversationBlock, MaturityLevel, PersonalizedTask } from '../types/conversationalTypes';
import { getEnhancedConversationBlocks } from '../data/enhancedConversationBlocks';
import { UserProfileData } from '../../types/wizardTypes';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { useMaturityScoresSaver } from '@/hooks/useMaturityScoresSaver';
import { useUnifiedUserData } from '@/hooks/user';
import { createUserAgentsFromRecommendations, markOnboardingComplete } from '@/utils/onboardingUtils';
import { generateMaturityBasedRecommendations } from '@/utils/maturityRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIntelligentQuestions } from './useIntelligentQuestions';
import { generateAdaptiveAgentMessage } from '../data/adaptiveConversationBlocks';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

export const useEnhancedConversationalAgent = (
  language: 'en' | 'es',
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData) => void
) => {
  const { user } = useAuth();
  const { saveMaturityScores } = useMaturityScoresSaver();
  const { updateProfile, updateContext } = useUnifiedUserData();
  const userLocalStorage = useUserLocalStorage();
  const blocks = getEnhancedConversationBlocks(language);
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [profileData, setProfileData] = useState<UserProfileData>({} as UserProfileData);
  const [isCompleted, setIsCompleted] = useState(false);
  const [enhancedBlocks, setEnhancedBlocks] = useState<ConversationBlock[]>([]);
  const [businessType, setBusinessType] = useState<'creative' | 'service' | 'product' | 'tech' | 'other'>('creative');

  const {
    generateContextualQuestions,
    generateAdaptiveQuestions,
    getIndustrySpecificQuestions,
    getConditionalQuestions,
    analyzeUserContext,
    isGenerating
  } = useIntelligentQuestions();

  const currentBlock = enhancedBlocks.length > 0 
    ? enhancedBlocks[currentBlockIndex] 
    : (blocks && blocks.length > 0 ? blocks[currentBlockIndex] : null);

  // Enhanced tracking to prevent loops and excessive updates
  const generatedQuestionsRef = useRef<Set<string>>(new Set());
  const isGeneratingRef = useRef(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateProfileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionGenerationCooldownRef = useRef<number>(0);
  const maxGenerationsPerSession = useRef<number>(3);
  const currentGenerationsRef = useRef<number>(0);
  
  // Enhanced business type detection
  const detectBusinessType = useCallback((description: string, industry: string) => {
    const lowerDesc = description.toLowerCase();
    const lowerIndustry = industry?.toLowerCase() || '';
    
    if (lowerIndustry.includes('creative') || lowerDesc.includes('arte') || lowerDesc.includes('diseño') || 
        lowerDesc.includes('art') || lowerDesc.includes('design') || lowerDesc.includes('craft') || 
        lowerDesc.includes('music') || lowerDesc.includes('photo')) {
      return 'creative';
    }
    if (lowerIndustry.includes('service') || lowerDesc.includes('consultor') || lowerDesc.includes('coaching')) {
      return 'service';
    }
    if (lowerIndustry.includes('tech') || lowerDesc.includes('software') || lowerDesc.includes('app')) {
      return 'tech';
    }
    if (lowerDesc.includes('product') || lowerDesc.includes('vend') || lowerDesc.includes('sell')) {
      return 'product';
    }
    return 'creative'; // Default to creative for most solo entrepreneurs
  }, []);

  // Enhanced blocks initialization with intelligent generation
  useEffect(() => {
    const initializeEnhancedBlocks = async () => {
      if (isGeneratingRef.current) return;
      
      const enhanced = [...blocks];
      let hasChanges = false;
      
      // Detect business type early
      if (profileData.businessDescription && profileData.industry) {
        const detectedType = detectBusinessType(profileData.businessDescription, profileData.industry);
        if (detectedType !== businessType) {
          setBusinessType(detectedType);
        }
      }

      // ENABLED: Intelligent agent message adaptation
      enhanced.forEach((block, index) => {
        const adaptiveMessage = generateAdaptiveAgentMessage(block.id, profileData, language);
        if (adaptiveMessage !== block.agentMessage) {
          enhanced[index] = {
            ...block,
            agentMessage: adaptiveMessage
          };
          hasChanges = true;
        }
      });

      // Add intelligent adaptive questions based on context
      if (profileData.businessDescription && profileData.businessDescription.length > 20) {
        const userContext = analyzeUserContext(profileData);
        const adaptiveQuestions = generateAdaptiveQuestions(userContext, profileData, language, currentBlock || enhanced[0]);
        
        if (adaptiveQuestions.length > 0) {
          // Find the most appropriate block to add questions to
          const targetBlockIndex = enhanced.findIndex(block => 
            block.id === 'currentSituation' || block.id === 'salesReality' || block.id === 'currentChallenges'
          );
          
          if (targetBlockIndex !== -1 && !generatedQuestionsRef.current.has(profileData.businessDescription)) {
            enhanced[targetBlockIndex] = {
              ...enhanced[targetBlockIndex],
              questions: [
                ...enhanced[targetBlockIndex].questions,
                ...adaptiveQuestions.slice(0, 2) // Limit to prevent overwhelming
              ]
            };
            generatedQuestionsRef.current.add(profileData.businessDescription);
            hasChanges = true;
          }
        }
      }

      // Add industry-specific and conditional questions
      if (profileData.industry) {
        const industryQuestions = getIndustrySpecificQuestions(profileData.industry, profileData.businessDescription || '', language);
        const conditionalQuestions = getConditionalQuestions(profileData, language);
        
        if (industryQuestions.length > 0 || conditionalQuestions.length > 0) {
          const targetBlockIndex = enhanced.findIndex(block => block.id === 'vision');
          if (targetBlockIndex !== -1) {
            enhanced[targetBlockIndex] = {
              ...enhanced[targetBlockIndex],
              questions: [
                ...enhanced[targetBlockIndex].questions,
                ...industryQuestions.slice(0, 1), // Limit to prevent overwhelming
                ...conditionalQuestions.slice(0, 1)
              ]
            };
            hasChanges = true;
          }
        }
      }

      if (hasChanges || enhancedBlocks.length === 0) {
        setEnhancedBlocks(enhanced);
      }
    };

    initializeEnhancedBlocks();
  }, [profileData.businessDescription, profileData.industry, blocks, businessType, language, analyzeUserContext, generateAdaptiveQuestions, currentBlock]);

  // ENABLED: Intelligent follow-up generation
  const triggerIntelligentFollowUp = useCallback(async (fieldName: string, answer: any) => {
    console.log('🤖 Triggering intelligent follow-up for:', fieldName, answer);
    
    // Generate follow-up questions based on specific answers
    if (fieldName === 'businessDescription' && answer && answer.length > 20) {
      const userContext = analyzeUserContext({ ...profileData, [fieldName]: answer });
      
      // Log what we detected about the user
      console.log('🔍 Detected user context:', userContext);
      
      // Update agent message for next interactions
      const enhanced = [...enhancedBlocks];
      enhanced.forEach((block, index) => {
        if (block.id === 'businessType' || block.id === 'currentSituation') {
          const adaptiveMessage = generateAdaptiveAgentMessage(block.id, { ...profileData, [fieldName]: answer }, language);
          enhanced[index] = {
            ...block,
            agentMessage: adaptiveMessage
          };
        }
      });
      setEnhancedBlocks(enhanced);
    }
    
    if (fieldName === 'mainObstacles' && Array.isArray(answer) && answer.includes('pricing')) {
      console.log('🎯 User has pricing challenges - preparing targeted questions');
    }
    
    if (fieldName === 'targetAudience' && answer === 'businesses') {
      console.log('🏢 User targets businesses - preparing B2B questions');
    }
  }, [analyzeUserContext, profileData, enhancedBlocks, language]);

  const updateProfileData = useCallback((data: Partial<UserProfileData>) => {
    const now = Date.now();
    
    // Prevent excessive updates - minimum 100ms between updates
    if (now - lastUpdateTimeRef.current < 100) {
      console.log('Enhanced Agent: Throttling rapid updates');
      return;
    }
    
    console.log('Enhanced Agent: Smart profile data update', { data, now });
    
    // Enhanced change detection for text fields
    const textFields = ['businessDescription', 'targetAudience', 'mainObstacles'];
    const isTextFieldUpdate = Object.keys(data).some(key => textFields.includes(key));
    
    if (isTextFieldUpdate) {
      // Clear existing timeout for debounced updates
      if (updateProfileTimeoutRef.current) {
        clearTimeout(updateProfileTimeoutRef.current);
      }
      
      // For text fields, use more sophisticated change detection
      const shouldUpdate = Object.entries(data).every(([key, value]) => {
        const currentValue = String(profileData[key] || '');
        const newValue = String(value || '');
        
        // Advanced change detection
        const significantChange = Math.abs(newValue.length - currentValue.length) > 5;
        const isComplete = newValue.length > 20 && newValue.split(' ').length > 3;
        const isEmpty = newValue.length === 0;
        
        return significantChange || isComplete || isEmpty;
      });
      
      if (!shouldUpdate) {
        console.log('Enhanced Agent: Deferring minor text update');
        return;
      }
      
      // Debounce profile updates for text fields
      updateProfileTimeoutRef.current = setTimeout(() => {
        performUpdate();
      }, 300);
    } else {
      // Immediate update for non-text fields
      performUpdate();
    }
    
    function performUpdate() {
      lastUpdateTimeRef.current = now;
      
      setProfileData(prev => {
        const updated = { ...prev, ...data };
        
        // Detect business type on industry change
        if (data.industry || data.businessDescription) {
          const detectedType = detectBusinessType(
            updated.businessDescription || '', 
            updated.industry || ''
          );
          setBusinessType(detectedType);
        }
        
        // REMOVED: Smart progress saving with debounce - let the main component handle it
        // debouncedSaveProgress();
        
        return updated;
      });
    }
  }, [detectBusinessType, profileData]);

  const answerQuestion = useCallback((questionId: string, answer: any) => {
    console.log('Enhanced Agent: Question answered', { questionId, answer });
    
    const question = currentBlock?.questions.find(q => q.id === questionId);
    if (question) {
      const fieldName = question.fieldName;
      updateProfileData({ [fieldName]: answer });
      
      // Trigger intelligent follow-up
      triggerIntelligentFollowUp(fieldName, answer);
    }
  }, [currentBlock, updateProfileData, triggerIntelligentFollowUp]);

  const goToNextBlock = useCallback(() => {
    if (currentBlockIndex < enhancedBlocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      completeAssessment();
    }
  }, [currentBlockIndex, enhancedBlocks.length]);

  const goToPreviousBlock = useCallback(() => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
    }
  }, [currentBlockIndex]);

  // Optimized progress saving with debouncing
  const debouncedSaveProgress = useCallback(() => {
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }
    
    saveProgressTimeoutRef.current = setTimeout(() => {
      try {
        const progressData = {
          currentBlockIndex,
          profileData,
          enhancedBlocks,
          businessType,
          lastUpdated: new Date().toISOString()
        };
        userLocalStorage.setItem('enhanced_conversational_agent_progress', JSON.stringify(progressData));
        console.log('Enhanced Agent: Smart progress saved');
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }, 2000); // 2 second debounce
  }, [currentBlockIndex, profileData, enhancedBlocks, businessType, userLocalStorage]);

  const saveProgress = useCallback(() => {
    // Immediate save for manual triggers
    try {
      const progressData = {
        currentBlockIndex,
        profileData,
        enhancedBlocks,
        businessType,
        lastUpdated: new Date().toISOString()
      };
      userLocalStorage.setItem('enhanced_conversational_agent_progress', JSON.stringify(progressData));
      console.log('Enhanced Agent: Manual progress saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [currentBlockIndex, profileData, enhancedBlocks, businessType, userLocalStorage]);

  const loadProgress = useCallback(() => {
    try {
      const saved = userLocalStorage.getItem('enhanced_conversational_agent_progress');
      if (saved) {
        const progressData = JSON.parse(saved);
        setCurrentBlockIndex(progressData.currentBlockIndex || 0);
        setProfileData(progressData.profileData || {});
        setBusinessType(progressData.businessType || 'creative');
        if (progressData.enhancedBlocks) {
          setEnhancedBlocks(progressData.enhancedBlocks);
        }
        console.log('Enhanced Agent: Progress loaded', progressData);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [userLocalStorage]);

  const completeAssessment = useCallback(async () => {
    console.log('Enhanced Agent: Completing assessment', { profileData });
    
    try {
      // Calculate enhanced maturity scores
      const scores = calculateEnhancedMaturityScores(profileData, businessType);
      const recommendedAgents = generateMaturityBasedRecommendations(scores);
      
      if (user) {
        await saveMaturityScores(scores);
        await createUserAgentsFromRecommendations(user.id, recommendedAgents);
        
        // Update using unified data hook
        await Promise.all([
          updateProfile({
            businessType: profileData.industry,
            businessDescription: profileData.businessDescription,
            targetMarket: profileData.targetAudience,
            languagePreference: language
          }),
          updateContext({
            businessProfile: profileData,
            taskGenerationContext: {
              maturityScores: scores,
              language,
              lastAssessmentSource: 'enhanced_conversational_agent',
              lastGeneration: new Date().toISOString()
            }
          })
        ]);
        
        markOnboardingComplete(user.id, scores, recommendedAgents);
        
        toast.success(
          language === 'es' 
            ? `¡Perfil completo! Detectamos que eres un ${getBusinessTypeLabel(businessType, language)} en crecimiento.`
            : `Profile complete! We detected you're a growing ${getBusinessTypeLabel(businessType, language)}.`
        );
      }
      
      setIsCompleted(true);
      userLocalStorage.removeItem('enhanced_conversational_agent_progress');
      onComplete(scores, recommendedAgents, profileData);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      toast.error(
        language === 'es' 
          ? 'Error al completar la evaluación'
          : 'Error completing assessment'
      );
    }
  }, [profileData, businessType, user, saveMaturityScores, updateProfile, updateContext, onComplete, language]);

  const getBlockProgress = useCallback(() => {
    return {
      current: currentBlockIndex + 1,
      total: enhancedBlocks.length || blocks.length,
      percentage: Math.round(((currentBlockIndex + 1) / (enhancedBlocks.length || blocks.length)) * 100)
    };
  }, [currentBlockIndex, enhancedBlocks.length, blocks.length]);

  return {
    currentBlock,
    profileData,
    isCompleted,
    maturityLevel: getMaturityLevel(profileData, businessType, language),
    personalizedTasks: generatePersonalizedTasks(profileData, businessType, language),
    updateProfileData,
    answerQuestion,
    goToNextBlock,
    goToPreviousBlock,
    saveProgress,
    loadProgress,
    completeAssessment,
    getBlockProgress,
    businessType
  };
};

// Helper functions
const getEnhancedAgentMessage = (
  block: ConversationBlock, 
  profileData: UserProfileData, 
  businessType: string, 
  language: 'en' | 'es'
): string => {
  const businessName = profileData.businessDescription?.split(' ').slice(0, 3).join(' ') || 
    (language === 'es' ? 'tu proyecto' : 'your project');
  
  const typeSpecificMessages = {
    en: {
      creative: `Perfect! I can see you're working on something creative with ${businessName}. Let me ask some specific questions for creative entrepreneurs like yourself.`,
      service: `Great! I understand you're providing services with ${businessName}. Let me tailor these questions for service-based businesses.`,
      product: `Excellent! You're building something tangible with ${businessName}. Let me ask questions specific to product businesses.`,
      tech: `Awesome! You're in the tech space with ${businessName}. Let me customize these questions for tech entrepreneurs.`
    },
    es: {
      creative: `¡Perfecto! Veo que estás trabajando en algo creativo con ${businessName}. Déjame hacerte preguntas específicas para emprendedores creativos como tú.`,
      service: `¡Genial! Entiendo que ofreces servicios con ${businessName}. Voy a adaptar estas preguntas para negocios basados en servicios.`,
      product: `¡Excelente! Estás construyendo algo tangible con ${businessName}. Déjame hacer preguntas específicas para negocios de productos.`,
      tech: `¡Increíble! Estás en el espacio tecnológico con ${businessName}. Voy a personalizar estas preguntas para emprendedores tech.`
    }
  };
  
  return typeSpecificMessages[language][businessType] || block.agentMessage;
};

const generateContextualInsight = (
  fieldName: string, 
  answer: any, 
  profileData: UserProfileData, 
  businessType: string,
  language: 'en' | 'es'
): string | null => {
  // DISABLED: These insights were contaminating options
  console.log('🚫 Contextual insights DISABLED to prevent contamination');
  return null;
};

const calculateEnhancedMaturityScores = (profileData: UserProfileData, businessType: string): CategoryScore => {
  // Enhanced scoring based on business type and profile
  const baseScores = {
    ideaValidation: calculateIdeaValidationScore(profileData),
    userExperience: calculateUserExperienceScore(profileData),
    marketFit: calculateMarketFitScore(profileData),
    monetization: calculateMonetizationScore(profileData)
  };
  
  // Business type modifiers
  const typeModifiers = {
    creative: { ideaValidation: 1.1, userExperience: 1.2, marketFit: 1.0, monetization: 0.9 },
    service: { ideaValidation: 1.0, userExperience: 1.1, marketFit: 1.1, monetization: 1.0 },
    product: { ideaValidation: 0.9, userExperience: 1.0, marketFit: 1.1, monetization: 1.1 },
    tech: { ideaValidation: 1.1, userExperience: 1.0, marketFit: 0.9, monetization: 1.2 }
  };
  
  const modifiers = typeModifiers[businessType] || typeModifiers.creative;
  
  return {
    ideaValidation: Math.min(100, Math.round(baseScores.ideaValidation * modifiers.ideaValidation)),
    userExperience: Math.min(100, Math.round(baseScores.userExperience * modifiers.userExperience)),
    marketFit: Math.min(100, Math.round(baseScores.marketFit * modifiers.marketFit)),
    monetization: Math.min(100, Math.round(baseScores.monetization * modifiers.monetization))
  };
};

const calculateIdeaValidationScore = (profileData: UserProfileData): number => {
  let score = 20; // Base score
  
  if (profileData.businessDescription && profileData.businessDescription.length > 20) score += 15;
  if (profileData.targetAudience && profileData.targetAudience !== 'unclear') score += 15;
  if (profileData.customerClarity && profileData.customerClarity >= 3) score += 20;
  if (profileData.hasSold) score += 30;
  
  return Math.min(100, score);
};

const calculateUserExperienceScore = (profileData: UserProfileData): number => {
  let score = 15;
  
  if (profileData.promotionChannels && profileData.promotionChannels.length > 0) score += 20;
  if (profileData.marketingConfidence && profileData.marketingConfidence >= 3) score += 25;
  if (profileData.businessGoals && (Array.isArray(profileData.businessGoals) ? profileData.businessGoals.length > 0 : profileData.businessGoals !== 'not_sure')) score += 20;
  if (profileData.supportPreference) score += 20;
  
  return Math.min(100, score);
};

const calculateMarketFitScore = (profileData: UserProfileData): number => {
  let score = 10;
  
  if (profileData.salesConsistency === 'consistently') score += 40;
  else if (profileData.salesConsistency === 'regularly') score += 30;
  else if (profileData.salesConsistency === 'occasionally') score += 20;
  
  if (profileData.targetAudience === 'individuals' || profileData.targetAudience === 'businesses') score += 20;
  if (profileData.customerClarity && profileData.customerClarity >= 4) score += 20;
  if (profileData.businessDescription && profileData.businessDescription.includes('unique')) score += 10;
  
  return Math.min(100, score);
};

const calculateMonetizationScore = (profileData: UserProfileData): number => {
  let score = 5;
  
  if (profileData.pricingMethod && profileData.pricingMethod !== 'no_system') score += 25;
  if (profileData.profitClarity && profileData.profitClarity >= 3) score += 30;
  if (profileData.hasSold) score += 25;
  if (profileData.salesConsistency === 'consistently') score += 15;
  
  return Math.min(100, score);
};

const getMaturityLevel = (profileData: UserProfileData, businessType: string, language: 'en' | 'es'): MaturityLevel => {
  const scores = calculateEnhancedMaturityScores(profileData, businessType);
  const avgScore = (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4;
  
  const levels = {
    en: [
      {
        id: 'beginner',
        level: 1,
        name: 'Creative Beginner',
        description: 'You\'re at the start of your entrepreneurial journey with great potential.',
        characteristics: ['Strong creative vision', 'Learning business fundamentals', 'Building confidence'],
        nextSteps: ['Validate your idea', 'Define your target audience', 'Create first prototype']
      },
      {
        id: 'developing',
        level: 2,
        name: 'Developing Creator',
        description: 'You\'re making progress and starting to see some traction.',
        characteristics: ['Some sales or validation', 'Growing customer understanding', 'Improving systems'],
        nextSteps: ['Scale marketing efforts', 'Optimize pricing', 'Build consistent processes']
      },
      {
        id: 'growing',
        level: 3,
        name: 'Growing Entrepreneur',
        description: 'You have a working business model and are ready to scale.',
        characteristics: ['Consistent revenue', 'Clear value proposition', 'Established customer base'],
        nextSteps: ['Automate operations', 'Expand product line', 'Build team']
      }
    ],
    es: [
      {
        id: 'beginner',
        level: 1,
        name: 'Creativo Principiante',
        description: 'Estás al inicio de tu viaje emprendedor con gran potencial.',
        characteristics: ['Visión creativa fuerte', 'Aprendiendo fundamentos de negocio', 'Construyendo confianza'],
        nextSteps: ['Validar tu idea', 'Definir tu audiencia objetivo', 'Crear primer prototipo']
      },
      {
        id: 'developing',
        level: 2,
        name: 'Creador en Desarrollo',
        description: 'Estás progresando y empezando a ver tracción.',
        characteristics: ['Algunas ventas o validación', 'Entendimiento creciente del cliente', 'Mejorando sistemas'],
        nextSteps: ['Escalar esfuerzos de marketing', 'Optimizar precios', 'Construir procesos consistentes']
      },
      {
        id: 'growing',
        level: 3,
        name: 'Emprendedor en Crecimiento',
        description: 'Tienes un modelo de negocio funcionando y estás listo para escalar.',
        characteristics: ['Ingresos consistentes', 'Propuesta de valor clara', 'Base de clientes establecida'],
        nextSteps: ['Automatizar operaciones', 'Expandir línea de productos', 'Construir equipo']
      }
    ]
  };
  
  if (avgScore >= 70) return levels[language][2];
  if (avgScore >= 40) return levels[language][1];
  return levels[language][0];
};

const generatePersonalizedTasks = (profileData: UserProfileData, businessType: string, language: 'en' | 'es'): PersonalizedTask[] => {
  const tasks = [];
  const isSpanish = language === 'es';
  
  // Business type specific tasks
  if (businessType === 'creative') {
    if (!profileData.hasSold) {
      tasks.push({
        id: 'create_portfolio',
        title: isSpanish ? 'Crear portafolio visual' : 'Create visual portfolio',
        description: isSpanish 
          ? 'Documenta tu mejor trabajo para mostrar tu estilo y calidad únicos'
          : 'Document your best work to showcase your unique style and quality',
        agentId: 'brand-identity',
        priority: 'high' as const,
        estimatedTime: isSpanish ? '2-3 horas' : '2-3 hours',
        category: isSpanish ? 'Marca' : 'Branding'
      });
    }
    
    if (profileData.pricingMethod === 'no_system') {
      tasks.push({
        id: 'define_pricing',
        title: isSpanish ? 'Definir estrategia de precios' : 'Define pricing strategy',
        description: isSpanish 
          ? 'Calcula tus costos y define precios que reflejen el valor de tu trabajo creativo'
          : 'Calculate your costs and set prices that reflect your creative work\'s value',
        agentId: 'financial-planning',
        priority: 'high' as const,
        estimatedTime: isSpanish ? '1-2 horas' : '1-2 hours',
        category: isSpanish ? 'Finanzas' : 'Finance'
      });
    }
  }
  
  // General high-impact tasks based on profile
  if (profileData.customerClarity && profileData.customerClarity < 3) {
    tasks.push({
      id: 'define_ideal_customer',
      title: isSpanish ? 'Definir cliente ideal' : 'Define ideal customer',
      description: isSpanish 
        ? 'Crea un perfil detallado de tu cliente perfecto para enfocar mejor tu marketing'
        : 'Create a detailed profile of your perfect customer to better focus your marketing',
      agentId: 'market-research',
      priority: 'high' as const,
      estimatedTime: isSpanish ? '1 hora' : '1 hour',
      category: isSpanish ? 'Marketing' : 'Marketing'
    });
  }
  
  if (profileData.marketingConfidence && profileData.marketingConfidence < 3) {
    tasks.push({
      id: 'marketing_plan',
      title: isSpanish ? 'Plan de marketing simple' : 'Simple marketing plan',
      description: isSpanish 
        ? 'Crea un plan mensual de contenido y promoción adaptado a tu estilo'
        : 'Create a monthly content and promotion plan adapted to your style',
      agentId: 'social-media',
      priority: 'medium' as const,
      estimatedTime: isSpanish ? '2 horas' : '2 hours',
      category: isSpanish ? 'Marketing' : 'Marketing'
    });
  }
  
  return tasks.slice(0, 5); // Limit to 5 most important tasks
};

const getBusinessTypeLabel = (businessType: string, language: 'en' | 'es'): string => {
  const labels = {
    en: {
      creative: 'creative entrepreneur',
      service: 'service provider',
      product: 'product maker',
      tech: 'tech entrepreneur',
      other: 'entrepreneur'
    },
    es: {
      creative: 'emprendedor creativo',
      service: 'proveedor de servicios',
      product: 'creador de productos',
      tech: 'emprendedor tech',
      other: 'emprendedor'
    }
  };
  
  return labels[language][businessType] || labels[language].other;
};
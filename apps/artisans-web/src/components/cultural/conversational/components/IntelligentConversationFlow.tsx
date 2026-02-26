import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, ArrowRight, ArrowLeft, Brain, Star, CheckCircle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationBlock } from '../types/conversationalTypes';
import { UserProfileData } from '../../types/wizardTypes';
import { QuestionRenderer } from './QuestionRenderer';
import { CheckpointProgress } from './CheckpointProgress';
import { getCraftTypeLabel } from '@/utils/aiCraftTypeDetection';
import { detectLocation, getLocationEmoji } from '@/utils/locationDetection';
import { MATURITY_TEST_CONFIG, getProgressPercentage, isAssessmentComplete } from '@/config/maturityTest';
import { BusinessInfoConfirmationClean } from './BusinessInfoConfirmationClean';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserMasterContextByUserId, upsertUserMasterContext } from '@/services/userMasterContext.actions';

// Hook de debounce para evitar guardados constantes
const useDebouncedCallback = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

interface IntelligentConversationFlowProps {
  block: ConversationBlock;
  profileData: UserProfileData;
  language: 'en' | 'es';
  onAnswer: (questionId: string, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  businessType?: string;
  isProcessing?: boolean;
  totalAnswered?: number;
  totalQuestions?: number;
  globalQuestionNumber?: number;
  showSaveIndicator?: boolean;
  isOnboarding?: boolean;
}

export const IntelligentConversationFlow: React.FC<IntelligentConversationFlowProps> = ({
  block,
  profileData,
  language,
  onAnswer,
  onNext,
  onPrevious,
  updateProfileData,
  businessType = 'creative',
  isProcessing = false,
  totalAnswered = 0,
  totalQuestions = MATURITY_TEST_CONFIG.TOTAL_QUESTIONS,
  globalQuestionNumber = 1,
  showSaveIndicator = false,
  isOnboarding = false
}) => {
  // ✅ CRITICAL FIX: ALL HOOKS MUST BE AT THE TOP (React error #310 fix)
  // Moved validations to AFTER hooks - no early returns before hooks!

  // 1. ALL HOOKS FIRST
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCraftTypeDetection, setShowCraftTypeDetection] = useState(false);
  const [showLocationDetection, setShowLocationDetection] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ location: string; type: 'city' | 'state' | 'country' | 'online' } | null>(null);
  const [localShowSaveIndicator, setLocalShowSaveIndicator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(undefined);

  // AI Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);


  // Debounced version of updateProfileData to prevent constant saves
  const debouncedUpdateProfile = useDebouncedCallback((data: Partial<UserProfileData>) => {
    updateProfileData(data);
  }, 1000); // Increased to 1 second for better typing experience

  // 🧹 CLEANUP: Resetear confirmación al cambiar de pregunta/bloque (excepto primera confirmación)
  useEffect(() => {
    if (totalAnswered !== 1) {
      setShowConfirmation(false);
      setExtractedInfo(null);
    }
  }, [currentQuestionIndex, block.id, totalAnswered]);

  // Show save indicator after each checkpoint
  useEffect(() => {
    if (totalAnswered > 0 && totalAnswered % 4 === 0) {
      setLocalShowSaveIndicator(true);
      const timer = setTimeout(() => setLocalShowSaveIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [totalAnswered]);

  // Show craft type detection confirmation when it's auto-detected
  useEffect(() => {
    if (profileData.craftType && profileData.businessDescription && !showCraftTypeDetection) {
      setShowCraftTypeDetection(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => setShowCraftTypeDetection(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileData.craftType, profileData.businessDescription]);

  useEffect(() => {
    const locationValue = profileData.businessLocation;
    const locationStr = typeof locationValue === 'string' ? locationValue.trim() : '';

    if (locationStr.length >= 3) {
      const result = detectLocation(locationStr);

      if (result && result.detected) {
        setDetectedLocation({ location: result.location, type: result.type });
        setShowLocationDetection(true);

        const timer = setTimeout(() => setShowLocationDetection(false), 4000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowLocationDetection(false);
      setDetectedLocation(null);
    }
  }, [profileData.businessLocation]);

  const preCalculatedQuestions = React.useMemo(() => {
    if (!block || !block.questions || block.questions.length === 0) {
      return [];
    }

    return block.questions.filter(q => {
      if (!q.showIf) return true;

      const condition = q.showIf;
      const fieldValue = profileData[condition.field];

      switch (condition.operator) {
        case 'equals': return fieldValue === condition.value;
        case 'not_equals': return fieldValue !== condition.value;
        case 'includes': return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
        case 'greater_than': return Number(fieldValue) > Number(condition.value);
        case 'less_than': return Number(fieldValue) < Number(condition.value);
        case 'exists': return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
        case 'not_exists': return fieldValue === undefined || fieldValue === null || fieldValue === '';
        default: return true;
      }
    });
  }, [block, profileData]);

  const visibleQuestions = preCalculatedQuestions;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  }, [block.id, visibleQuestions.length]);

  useEffect(() => {
    if (currentQuestionIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
      setCurrentQuestionIndex(visibleQuestions.length - 1);
    }
  }, [visibleQuestions.length, currentQuestionIndex]);

  const translations = {
    en: {
      next: "Next",
      previous: "Previous",
      whatIsThis: "What is this?",
      lastQuestion: "Continue to next section",
      finalizeAssessment: "Finalize Assessment",
      processingResults: "Processing results..."
    },
    es: {
      next: "Siguiente",
      previous: "Anterior",
      whatIsThis: "¿Qué es esto?",
      lastQuestion: "Continuar a la siguiente sección",
      finalizeAssessment: "Finalizar Evaluación",
      processingResults: "Procesando resultados..."
    }
  };

  const t = translations[language];

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestionInBlock = currentQuestionIndex === visibleQuestions.length - 1;
  const isLastQuestionGlobal = isAssessmentComplete(totalAnswered);
  const isFirstQuestion = currentQuestionIndex === 0;

  useEffect(() => {
    if (!currentQuestion) return;

    const newValue = profileData[currentQuestion.fieldName];
    setCurrentAnswer(newValue);
  }, [currentQuestion?.id, profileData]);

  const handleQuestionAnswer = (answer: any) => {
    if (!currentQuestion) return;

    setCurrentAnswer(answer);
    debouncedUpdateProfile({ [currentQuestion.fieldName]: answer });
  };

  const evaluateConditionalLogic = (question: any, answer: any, profileData: UserProfileData): boolean => {
    // Implement conditional logic based on question dependencies
    if (question.showIf) {
      const condition = question.showIf;
      const fieldValue = profileData[condition.field];

      // Evaluate condition
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'includes':
          return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return true;
      }
    }

    return true; // No conditional logic, proceed normally
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    if (isSaving) {
      return;
    }

    if (currentQuestion.id === 'business_description') {
      const description = currentAnswer || profileData.businessDescription;

      const minLength = block.id === 'onboarding_essentials' ? 30 : 50;
      if (description && typeof description === 'string' && description.length >= minLength) {
        setIsExtracting(true);

        try {
          const { data, error } = await supabase.functions.invoke('extract-business-info', {
            body: {
              userText: description,
              fieldsToExtract: ['businessName', 'craftType', 'location'],
              language
            }
          });

          if (error) {
            toast.error(
              language === 'es'
                ? '⚠️ Procesando tu respuesta... Continuamos de todos modos'
                : '⚠️ Processing your response... We continue anyway',
              { duration: 2000 }
            );
            onAnswer(currentQuestion.id, description);
            setIsExtracting(false);
            setCurrentQuestionIndex(prev => prev + 1);
            return;
          }

          if (data?.success && data?.data) {
            // ✅ Validación frontend adicional mejorada
            const invalidBrandPhrases = [
              // Verbos de primera persona
              'hago', 'i make', 'trabajo', 'i work',
              'soy', 'i am', 'creo', 'i create',
              'elaboro', 'produzco', 'vendo', 'realizo',
              'me dedico', 'ofrezco', 'fabrico',

              // NUEVO: Artículos indefinidos
              'un ', 'una ', 'a ', 'an ',

              // NUEVO: Descripciones genéricas
              'estudio de', 'taller de', 'tienda de', 'empresa de',
              'negocio de', 'marca de', 'shop of', 'studio of',
              'taller artesanal', 'estudio artesanal'
            ];

            const startsWithInvalid = invalidBrandPhrases.some(phrase =>
              data.data.brand_name?.toLowerCase().startsWith(phrase)
            );

            // NUEVO: Detectar si es solo descripción genérica
            const isOnlyDescription = /^(un |una |a |an )/i.test(data.data.brand_name);

            // NUEVO: Detectar si el nombre es igual a craft_type
            const isSameCraftType = data.data.brand_name?.toLowerCase() === data.data.craft_type?.toLowerCase();

            const isLocationNotBrand = data.data.brand_name === data.data.business_location;

            const isTooLong = data.data.brand_name?.split(' ').length > 5;

            if (startsWithInvalid || isLocationNotBrand || isTooLong || isOnlyDescription || isSameCraftType) {
              data.data.brand_name = language === 'es' ? 'Sin nombre definido' : 'No name defined';
              data.data.confidence = Math.min(data.data.confidence, 0.4);
            }

            onAnswer(currentQuestion.id, description);

            const mappedExtractedInfo = {
              brand_name: data.data.brand_name || undefined,
              craft_type: data.data.craft_type || undefined,
              business_location: data.data.business_location || undefined,
              unique_value: data.data.unique_value || undefined,
              craftType: data.data.craft_type || undefined,
            };

            updateProfileData({
              brandName: mappedExtractedInfo.brand_name,
              craftType: mappedExtractedInfo.craft_type,
              businessLocation: mappedExtractedInfo.business_location,
              uniqueValue: mappedExtractedInfo.unique_value
            });

            setExtractedInfo(mappedExtractedInfo);
            setShowConfirmation(true);
            setIsExtracting(false);
            return;
          } else {
            onAnswer(currentQuestion.id, description);
            setIsExtracting(false);
            setCurrentQuestionIndex(prev => prev + 1);
            return;
          }
        } catch {
          toast.error(
            language === 'es'
              ? '⚠️ Error inesperado al analizar'
              : '⚠️ Unexpected error analyzing'
          );
          onAnswer(currentQuestion.id, description);
          setIsExtracting(false);
          setCurrentQuestionIndex(prev => prev + 1);
          return;
        }
      } else {
        toast.error(
          language === 'es'
            ? 'Por favor escribe al menos 20 caracteres para poder analizar tu negocio'
            : 'Please write at least 20 characters so we can analyze your business'
        );
        return;
      }
    }

    const currentValue = currentAnswer;

    if (currentQuestion.required && (currentValue === undefined || currentValue === null || currentValue === '')) {
      return;
    }

    setIsSaving(true);

    onAnswer(currentQuestion.id, currentValue || '');

    if (isLastQuestionInBlock) {
      onNext();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }

    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePrevious = () => {
    if (isFirstQuestion) {
      onPrevious();
    } else {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleConfirmExtractedInfo = async (confirmedData: any) => {
    // ✅ Si la ubicación extraída es inválida, usar la del perfil como fallback
    const { data: { user } } = await supabase.auth.getUser();
    let finalLocation = confirmedData.business_location;

    if (user && (!finalLocation || finalLocation === 'No especificado')) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('business_location')
        .eq('user_id', user.id)
        .single();

      finalLocation = profileData?.business_location || confirmedData.business_location;
    }

    // Update profile with extracted data - prioritize craft_type
    updateProfileData({
      brandName: confirmedData.brand_name,
      craftType: confirmedData.craft_type || confirmedData.craftType, // ✅ Priorizar craft_type
      businessLocation: finalLocation,
      uniqueValue: confirmedData.unique_value,
      aiExtracted: true,
      extractionConfidence: confirmedData.confidence
    });

    // ✅ NUEVO: Sincronizar inmediatamente a user_profiles Y user_master_context
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && confirmedData.brand_name) {
        // Actualizar user_profiles
        await supabase
          .from('user_profiles')
          .update({
            brand_name: confirmedData.brand_name,
            business_description: profileData.businessDescription,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        // ✅ CRÍTICO: También actualizar conversation_insights en user_master_context (NestJS)
        const existingContext = await getUserMasterContextByUserId(user.id);

        const currentBusinessProfile = existingContext?.businessProfile || {};
        const currentConversationInsights = existingContext?.conversationInsights || {};

        await upsertUserMasterContext(user.id, {
          businessProfile: {
            ...(typeof currentBusinessProfile === 'object' ? currentBusinessProfile : {}),
            brandName: confirmedData.brand_name
          },
          conversationInsights: {
            ...(typeof currentConversationInsights === 'object' ? currentConversationInsights : {}),
            nombre_marca: confirmedData.brand_name
          },
        });
      }
    } catch {
      // sync error is non-critical
    }

    // Reset confirmation state
    setShowConfirmation(false);
    setExtractedInfo(null);

    toast.success(
      language === 'es'
        ? '¡Perfecto! Entendimos tu negocio. Continuemos...'
        : 'Perfect! We understood your business. Let\'s continue...'
    );

    setCurrentQuestionIndex(prev => prev + 1);
  };

  const isQuestionAnswered = (question: any) => {
    const fieldValue = question.id === currentQuestion?.id
      ? currentAnswer
      : profileData[question.fieldName];

    // Handle different question types
    if (question.type === 'multiple-choice' && Array.isArray(fieldValue)) {
      return fieldValue.length > 0;
    }

    if (question.type === 'slider' || question.type === 'rating') {
      return fieldValue !== undefined && fieldValue !== null && fieldValue > 0;
    }

    if (question.type === 'text-input' || question.type === 'text' || question.type === 'textarea' || question.type === 'long_text_with_ai') {
      return fieldValue !== undefined && fieldValue !== null &&
        typeof fieldValue === 'string' && fieldValue.trim() !== '';
    }

    if (question.type === 'yes-no') {
      return fieldValue !== undefined && fieldValue !== null;
    }

    // For single-choice questions
    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
  };


  const shouldShowConfirmation = showConfirmation && extractedInfo && totalAnswered === 1;

  // ✅ CONDITIONAL RENDERING - After ALL hooks
  if (!block || !block.questions || block.questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <Brain className="w-8 h-8 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {language === 'es' ? 'Preparando preguntas inteligentes...' : 'Preparing intelligent questions...'}
          </p>
        </div>
      </div>
    );
  }

  // Check 2: No visible questions after filtering
  if (visibleQuestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <Brain className="w-8 h-8 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {language === 'es' ? 'Preparando siguiente sección...' : 'Preparing next section...'}
          </p>
        </div>
      </div>
    );
  }

  // ✅ SINGLE RETURN with conditional JSX - NO early returns after hooks
  return !currentQuestion ? (
    // CASO 1: Loading si currentQuestion es undefined
    <div className="p-8 text-center">
      <div className="animate-pulse">
        <Brain className="w-8 h-8 mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">
          {language === 'es' ? 'Cargando pregunta...' : 'Loading question...'}
        </p>
      </div>
    </div>
  ) : isExtracting ? (
    // CASO 2: Extracting AI info
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-lg font-medium text-foreground">
        {language === 'es' ? 'Analizando tu descripción con IA...' : 'Analyzing your description with AI...'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {language === 'es'
          ? 'Estamos extrayendo información clave de tu negocio'
          : 'We are extracting key information from your business'}
      </p>
    </div>
  ) : shouldShowConfirmation ? (
    // CASO 3: Show confirmation
    <BusinessInfoConfirmationClean
      extractedInfo={extractedInfo}
      originalText={profileData.businessDescription || currentAnswer}
      language={language}
      craftType={profileData.craftType}
      totalAnswered={totalAnswered}
      onConfirm={handleConfirmExtractedInfo}
      onEdit={() => {
        setShowConfirmation(false);
        setExtractedInfo(null);
      }}
    />
  ) : (
    // CASO 4: Render normal - El flujo principal de preguntas
    <>
      {/* Las categorizaciones artesanales solo aparecen en /profile, nunca en wizards */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >

        {/* Progress Saved Indicator */}
        <AnimatePresence>
          {localShowSaveIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mx-6 mt-4 px-4 py-2 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm font-medium text-success">
                {language === 'es' ? '✓ Progreso guardado' : '✓ Progress saved'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Processing Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-6 mt-4 px-4 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">
                  {language === 'es'
                    ? '🤖 Analizando tu negocio con IA...'
                    : '🤖 Analyzing your business with AI...'
                  }
                </p>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  {language === 'es'
                    ? 'Detectando automáticamente el tipo de artesanía'
                    : 'Auto-detecting craft type'
                  }
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Compacto Unificado */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-4 mb-2 p-2.5 bg-primary/5 border border-primary/20 rounded-lg"
        >
          {/* Línea principal con indicadores */}
          <div className="flex items-center gap-2 text-xs text-charcoal/70 flex-wrap">
            <span className="font-medium text-primary">
              {language === 'es' ? 'Pregunta' : 'Question'} {globalQuestionNumber} {language === 'es' ? 'de' : 'of'} {isOnboarding ? 3 : totalQuestions}
            </span>

            {/* Craft type inline */}
            {profileData.craftType && (
              <span className="flex items-center gap-1">
                • <CheckCircle className="w-3 h-3 text-accent" />
                <span className="text-accent font-medium">{getCraftTypeLabel(profileData.craftType, language)}</span>
              </span>
            )}

            {/* Location inline */}
            {detectedLocation && (
              <span className="flex items-center gap-1">
                • <span className="text-base">{getLocationEmoji(detectedLocation.type)}</span>
                <span className="text-primary font-medium">{detectedLocation.location}</span>
              </span>
            )}

            {/* Mensaje motivacional inline para onboarding */}
            {isOnboarding && (
              <span className="flex items-center gap-1">
                • <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-accent/80 italic">
                  {language === 'es' ? 'Tu taller digital te espera' : 'Your digital workshop awaits'}
                </span>
              </span>
            )}
          </div>

          {/* Línea secundaria con contexto (opcional) */}
          {block.strategicContext && (
            <p className="text-xs text-charcoal/60 mt-1.5 leading-relaxed">
              ℹ️ {block.strategicContext.length > 80
                ? block.strategicContext.substring(0, 80) + '...'
                : block.strategicContext
              }
            </p>
          )}
        </motion.div>

        {/* Question Content - min-height prevents screen jumping */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${currentQuestion.id}-${currentQuestionIndex}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.3,
                layout: { duration: 0.3, ease: "easeInOut" }
              }}
            >

              {/* Compact Question Header */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-charcoal/60">
                      {language === 'es' ? 'Pregunta' : 'Question'} {globalQuestionNumber} {language === 'es' ? 'de' : 'of'} {isOnboarding ? 3 : totalQuestions}
                    </span>
                  </div>

                  {currentQuestion.explanation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="h-7 px-2 text-xs flex items-center gap-1"
                    >
                      <Brain className="w-3.5 h-3.5" /> Info
                    </Button>
                  )}
                </div>

                <h4 className="text-xl font-bold text-charcoal">
                  {currentQuestion.question}
                </h4>

                <AnimatePresence>
                  {showExplanation && currentQuestion.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <p className="text-sm text-charcoal/70">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Question Renderer */}
              <QuestionRenderer
                question={currentQuestion}
                value={currentAnswer}
                onAnswer={handleQuestionAnswer}
                onComplete={() => {
                  if (currentQuestion.type === 'long_text_with_ai') {
                    onAnswer(currentQuestion.id, currentAnswer || '');

                    if (isLastQuestionInBlock) {
                      onNext();
                    } else {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }

                    setIsSaving(false);
                  }
                }}
                language={language}
              />

            </motion.div>
          </AnimatePresence>
        </div>


        {/* Simplified Navigation Footer */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion && currentQuestionIndex === 0}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.previous}</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentQuestion.required && !isQuestionAnswered(currentQuestion) || isProcessing || isExtracting}
              className="flex-1 sm:flex-initial min-w-[140px] justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.processingResults}
                </>
              ) : isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'es' ? 'Analizando...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  {isLastQuestionGlobal ? t.finalizeAssessment : t.next}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );  // ✅ Closes the ternary operator and return statement
};
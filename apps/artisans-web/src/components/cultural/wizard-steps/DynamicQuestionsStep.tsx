
import React, { useEffect, useState } from 'react';
import { UserProfileData } from '../types/wizardTypes';
import { StepContainer } from '../wizard-components/StepContainer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Brain, ChevronRight, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VoiceInput } from '@/components/ui/voice-input';

interface DynamicQuestion {
  id: string;
  question: string;
  context?: string;
}

interface DynamicQuestionsStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isStepValid: boolean;
}

export const DynamicQuestionsStep: React.FC<DynamicQuestionsStepProps> = ({
  profileData,
  updateProfileData,
  language,
  currentStepNumber,
  totalSteps,
  onNext,
  onPrevious,
  isStepValid
}) => {
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const { toast } = useToast();

  const t = {
    en: {
      title: "Let's Dive Deeper",
      subtitle: "Based on your responses, we'd like to understand more about your creative journey",
      loadingQuestions: "AI is generating personalized questions for you...",
      questionOf: "Question {current} of {total}",
      placeholder: "Share your thoughts here... Be as detailed as you'd like.",
      next: "Next Question",
      previous: "Previous Question",
      complete: "Complete Assessment",
      answerRequired: "Please provide an answer before continuing",
      errorGenerating: "Unable to generate questions. Let's proceed with your assessment.",
      skipStep: "Skip This Step",
      almostDone: "Almost done! Just a few more insights to personalize your recommendations.",
      thinking: "Generating your personalized questions...",
      errorTitle: "Question Generation Failed",
      errorMessage: "We couldn't generate personalized questions right now. You can skip this step or try again.",
      tryAgain: "Try Again",
      proceedAnyway: "Proceed Without Questions"
    },
    es: {
      title: "Profundicemos Más",
      subtitle: "Basado en tus respuestas, nos gustaría entender más sobre tu viaje creativo",
      loadingQuestions: "La IA está generando preguntas personalizadas para ti...",
      questionOf: "Pregunta {current} de {total}",
      placeholder: "Comparte tus pensamientos aquí... Sé tan detallado como desees.",
      next: "Siguiente Pregunta",
      previous: "Pregunta Anterior",
      complete: "Completar Evaluación",
      answerRequired: "Por favor proporciona una respuesta antes de continuar",
      errorGenerating: "No se pudieron generar las preguntas. Continuemos con tu evaluación.",
      skipStep: "Omitir Este Paso",
      almostDone: "¡Casi terminamos! Solo unos insights más para personalizar tus recomendaciones.",
      thinking: "Generando tus preguntas personalizadas...",
      errorTitle: "Falló la Generación de Preguntas",
      errorMessage: "No pudimos generar preguntas personalizadas en este momento. Puedes omitir este paso o intentar de nuevo.",
      tryAgain: "Intentar de Nuevo",
      proceedAnyway: "Continuar Sin Preguntas"
    }
  };

  // Generate dynamic questions based on user's profile data
  const generateDynamicQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      setGenerationError(false);
      
      console.log('Generating dynamic questions for profile:', profileData);
      
      const { data, error } = await supabase.functions.invoke('generate-dynamic-questions', {
        body: {
          profileData,
          language
        }
      });

      if (error) {
        console.error('Error generating dynamic questions:', error);
        setGenerationError(true);
        return;
      }

      console.log('Dynamic questions response:', data);

      if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const questionsWithIds = data.questions.map((q: any, index: number) => ({
          id: `dynamic_${index + 1}`,
          question: q.question,
          context: q.context
        }));
        setDynamicQuestions(questionsWithIds);
        console.log('Set dynamic questions:', questionsWithIds);
      } else {
        console.log('No questions generated, setting error state');
        setGenerationError(true);
      }
    } catch (error) {
      console.error('Error generating dynamic questions:', error);
      setGenerationError(true);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    generateDynamicQuestions();
  }, [profileData, language]);

  const currentQuestion = dynamicQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === dynamicQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    const currentAnswer = answers[currentQuestion.id]?.trim();
    if (!currentAnswer) {
      toast({
        title: t[language].answerRequired,
        variant: 'destructive'
      });
      return;
    }

    if (isLastQuestion) {
      setIsSubmitting(true);
      try {
        // Save all dynamic answers to profile data
        updateProfileData({ 
          dynamicQuestionAnswers: answers 
        });
        console.log('Saved dynamic answers:', answers);
        
        // Process answers with AI to extract insights
        console.log('🧠 Processing deep analysis answers with AI...');
        try {
          const { data: insightsData, error: insightsError } = await supabase.functions.invoke('process-deep-insights', {
            body: {
              answers,
              questions: dynamicQuestions,
              profileData,
              language
            }
          });

          if (insightsError) {
            console.error('Error processing insights:', insightsError);
          } else {
            console.log('✅ AI insights extracted:', insightsData);
          }
        } catch (error) {
          console.error('Failed to process insights:', error);
          // Continue anyway, insights are optional
        }
        
        onNext();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (isFirstQuestion) {
      onPrevious();
    } else {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    updateProfileData({ 
      dynamicQuestionAnswers: {} 
    });
    onNext();
  };

  const handleRetry = () => {
    generateDynamicQuestions();
  };

  // Loading state
  if (isLoadingQuestions) {
    return (
      <StepContainer
        title={t[language].title}
        subtitle={t[language].subtitle}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-8"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          
          <div className="flex items-center space-x-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          
          <p className="text-xl text-foreground text-center font-medium mb-2">
            {t[language].thinking}
          </p>
          <p className="text-muted-foreground text-center max-w-md">
            {t[language].almostDone}
          </p>
        </div>
      </StepContainer>
    );
  }

  // Error state
  if (generationError || dynamicQuestions.length === 0) {
    return (
      <StepContainer
        title={t[language].title}
        subtitle={t[language].subtitle}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-8">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            {t[language].errorTitle}
          </h3>
          
          <p className="text-muted-foreground text-center max-w-md mb-8">
            {t[language].errorMessage}
          </p>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              {t[language].tryAgain}
            </Button>
            
            <Button
              onClick={handleSkip}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              {t[language].proceedAnyway}
            </Button>
          </div>
        </div>
      </StepContainer>
    );
  }

  return (
    <StepContainer
      title={t[language].title}
      subtitle={t[language].subtitle}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t[language].questionOf
                .replace('{current}', (currentQuestionIndex + 1).toString())
                .replace('{total}', dynamicQuestions.length.toString())}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              {t[language].skipStep}
            </Button>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + 1) / dynamicQuestions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-white rounded-2xl border border-slate-200/50 shadow-xl p-8 mb-8"
          >
            {/* Context if available */}
            {currentQuestion.context && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-l-4 border-purple-500"
              >
                <p className="text-sm text-primary italic font-medium">
                  💡 {currentQuestion.context}
                </p>
              </motion.div>
            )}

            {/* Question */}
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-6 leading-relaxed"
            >
              {currentQuestion.question}
            </motion.h3>

            {/* Answer textarea with voice input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="relative">
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={t[language].placeholder}
                  className="min-h-[140px] resize-none border-border focus:border-primary focus:ring-primary text-base leading-relaxed pr-12"
                />
                <div className="absolute right-2 top-2">
                  <VoiceInput
                    onTranscript={(transcript) => {
                      const currentAnswer = answers[currentQuestion.id] || '';
                      const newAnswer = currentAnswer ? `${currentAnswer} ${transcript}` : transcript;
                      handleAnswerChange(newAnswer);
                    }}
                    language={language}
                    className="h-8 w-8 p-0"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {language === 'es' 
                  ? 'Puedes usar el micrófono para dictar tu respuesta' 
                  : 'You can use the microphone to dictate your answer'}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" />
            {isFirstQuestion ? 'Back' : t[language].previous}
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center gap-2 px-8 py-3"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLastQuestion ? t[language].complete : t[language].next}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </StepContainer>
  );
};

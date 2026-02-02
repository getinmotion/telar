import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationBlock, QuestionType } from '../types/conversationalTypes';
import { UserProfileData } from '../../types/wizardTypes';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionGeneratingIndicator } from './QuestionGeneratingIndicator';
import { BusinessInfoConfirmation } from './BusinessInfoConfirmation';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConversationFlowProps {
  block: ConversationBlock;
  profileData: UserProfileData;
  language: 'en' | 'es';
  onAnswer: (questionId: string, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  updateProfileData: (data: Partial<UserProfileData>) => void;
}

export const ConversationFlow: React.FC<ConversationFlowProps> = ({
  block,
  profileData,
  language,
  onAnswer,
  onNext,
  onPrevious,
  updateProfileData
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset question index when block changes
  useEffect(() => {
    console.log('ConversationFlow: Block changed, resetting question index', { 
      blockId: block.id, 
      questionsLength: block.questions?.length 
    });
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  }, [block.id]);

  const translations = {
    en: {
      next: "Continue",
      previous: "Previous",
      whatIsThis: "What is this?",
      insight: "Agent Insight",
      lastQuestion: "Complete this section"
    },
    es: {
      next: "Continuar",
      previous: "Anterior",
      whatIsThis: "¿Qué es esto?",
      insight: "Insight del Agente",
      lastQuestion: "Completar esta sección"
    }
  };

  const t = translations[language];
  
  // Add defensive checks to prevent undefined errors
  if (!block || !block.questions || block.questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }
  
  const currentQuestion = block.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === block.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Additional check for currentQuestion
  if (!currentQuestion) {
    console.error('ConversationFlow: currentQuestion is undefined', {
      currentQuestionIndex,
      totalQuestions: block.questions.length,
      blockId: block.id
    });
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Error loading question. Please refresh the page.</p>
      </div>
    );
  }

  const handleQuestionAnswer = async (answer: any) => {
    console.log('ConversationFlow: handleQuestionAnswer', { 
      currentQuestionIndex, 
      totalQuestions: block.questions.length,
      isLastQuestion,
      blockId: block.id,
      questionId: currentQuestion.id,
      answerLength: typeof answer === 'string' ? answer.length : 'N/A'
    });
    
    // 🎯 Special handling for business_description (first question)
    if (currentQuestion.id === 'business_description' && typeof answer === 'string' && answer.length >= 50) {
      console.log('🔍 [Q1] Intercepting business_description for AI extraction');
      setIsExtracting(true);
      
      try {
        console.log('📡 [Q1] Calling extract-business-info edge function...');
        const { data, error } = await supabase.functions.invoke('extract-business-info', {
          body: { 
            userText: answer,
            fieldsToExtract: ['businessName', 'craftType', 'location'],
            language 
          }
        });

        console.log('📥 [Q1] Edge function response:', { data, error });

        if (error) {
          console.error('❌ [Q1] Error extracting info:', error);
          console.error('❌ [Q1] Error details:', JSON.stringify(error, null, 2));
          toast.error(
            language === 'es' 
              ? '⚠️ No pudimos analizar tu descripción con IA, pero continuaremos sin problema' 
              : '⚠️ Could not analyze your description with AI, but we\'ll continue without issue'
          );
          // Save answer and proceed without confirmation
          onAnswer(currentQuestion.id, answer);
          setIsExtracting(false);
          handleNext();
          return;
        }

        if (data?.success && data?.data) {
          console.log('✅ [Q1] Successfully extracted info:', data.data);
          // Save the original description but DON'T advance yet
          onAnswer(currentQuestion.id, answer);
          // Show confirmation UI - user must confirm before advancing
          setExtractedInfo(data.data);
          setShowConfirmation(true);
          setIsExtracting(false);
          // ⚠️ DON'T call handleNext() here - wait for user confirmation
          return;
        } else {
          console.warn('⚠️ [Q1] Extraction returned no data, proceeding without confirmation');
          console.warn('⚠️ [Q1] Response data:', data);
          onAnswer(currentQuestion.id, answer);
          setIsExtracting(false);
          handleNext();
          return;
        }
      } catch (err) {
        console.error('❌ [Q1] Unexpected error:', err);
        console.error('❌ [Q1] Error stack:', err instanceof Error ? err.stack : 'No stack');
        toast.error(
          language === 'es' 
            ? '⚠️ Error inesperado al analizar, continuaremos sin problema' 
            : '⚠️ Unexpected error analyzing, we\'ll continue without issue'
        );
        onAnswer(currentQuestion.id, answer);
        setIsExtracting(false);
        handleNext();
        return;
      }
    } else {
      // Normal flow for other questions
      onAnswer(currentQuestion.id, answer);
      handleNext();
    }
  };

  const handleConfirmExtractedInfo = (confirmedData: any) => {
    console.log('✅ [Q1-CONFIRM] User confirmed extracted info:', confirmedData);
    
    // Update profile with extracted data
    updateProfileData({
      brandName: confirmedData.brand_name,
      craftType: confirmedData.craft_type,
      businessLocation: confirmedData.business_location,
      uniqueValue: confirmedData.unique_value,
      aiExtracted: true,
      extractionConfidence: confirmedData.confidence
    });
    
    // Reset confirmation state
    setShowConfirmation(false);
    setExtractedInfo(null);
    
    toast.success(
      language === 'es' 
        ? '¡Perfecto! Entendimos tu negocio. Continuemos...' 
        : 'Perfect! We understood your business. Let\'s continue...'
    );
    
    // NOW advance to next question after confirmation
    handleNext();
  };

  const handleNext = async () => {
    console.log('🔍 [NEXT] handleNext called', { 
      currentQuestionIndex, 
      isLastQuestion, 
      totalQuestions: block.questions.length,
      currentQuestionId: currentQuestion.id,
      questionFieldName: currentQuestion.fieldName
    });
    
    // 🎯 SPECIAL HANDLING: First question needs AI extraction
    if (currentQuestion.id === 'business_description') {
      console.log('🎯 [NEXT] Detected business_description question');
      console.log('🔍 [NEXT] ProfileData keys:', Object.keys(profileData));
      console.log('🔍 [NEXT] ProfileData.businessDescription:', profileData.businessDescription);
      console.log('🔍 [NEXT] ProfileData full:', profileData);
      
      const description = profileData.businessDescription;
      
      console.log('🔍 [NEXT] Description check:', {
        hasDescription: !!description,
        isString: typeof description === 'string',
        length: description?.length || 0,
        descriptionPreview: description ? String(description).substring(0, 100) : 'NO DESCRIPTION'
      });
      
      if (description && typeof description === 'string' && description.length >= 50) {
        console.log('✅ [Q1-AUTO] Description is valid, triggering AI extraction');
        console.log('📝 [Q1-AUTO] Full description:', description);
        
        // Call handleQuestionAnswer which will:
        // 1. Extract with AI
        // 2. Show confirmation screen
        // 3. Wait for user confirmation before advancing
        await handleQuestionAnswer(description);
        console.log('⏸️ [Q1-AUTO] Waiting for user confirmation...');
        return; // Exit here - handleConfirmExtractedInfo will advance later
      } else {
        console.error('❌ [Q1] Description validation failed!', {
          hasDescription: !!description,
          isString: typeof description === 'string',
          length: description?.length || 0,
          failReason: !description ? 'No description' : 
                      typeof description !== 'string' ? 'Not a string' : 
                      'Too short (< 50 chars)'
        });
        toast.error(
          language === 'es'
            ? 'Por favor escribe al menos 50 caracteres para describir tu negocio'
            : 'Please write at least 50 characters to describe your business'
        );
        return; // Don't advance
      }
    }
    
    console.log('➡️ [NEXT] Normal navigation (not first question)');
    // Normal navigation for other questions
    if (isLastQuestion) {
      setCurrentQuestionIndex(0);
      onNext();
    } else if (currentQuestionIndex + 1 < block.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    console.log('ConversationFlow: handlePrevious', { 
      currentQuestionIndex, 
      isFirstQuestion 
    });
    
    if (isFirstQuestion) {
      // Reset question index when moving to previous block
      setCurrentQuestionIndex(0);
      onPrevious();
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isQuestionAnswered = () => {
    // Special check for first question - need at least 50 chars
    if (currentQuestion.id === 'business_description') {
      const description = profileData.businessDescription;
      return description && typeof description === 'string' && description.length >= 50;
    }
    
    // For other questions, check if field exists
    const fieldName = currentQuestion.fieldName;
    const value = profileData[fieldName as keyof UserProfileData];
    return value !== undefined && value !== '';
  };

  // 🎯 Show confirmation UI if we have extracted info
  if (showConfirmation && extractedInfo) {
    return (
      <BusinessInfoConfirmation
        extractedInfo={extractedInfo}
        language={language}
        onConfirm={handleConfirmExtractedInfo}
        onEdit={() => {
          setShowConfirmation(false);
          setExtractedInfo(null);
        }}
      />
    );
  }

  // 🔄 Show loading state while extracting
  if (isExtracting) {
    return (
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 flex-1">
            <p className="text-foreground font-medium mb-2">{block.agentMessage}</p>
            <p className="text-muted-foreground text-sm">{block.strategicContext}</p>
          </div>
        </div>


        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-muted-foreground hover:text-foreground mb-4"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {t.whatIsThis}
        </Button>

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 dark:bg-primary/30 border border-primary/20 dark:border-primary/30 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-primary dark:text-primary">{currentQuestion.explanation}</p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          {currentQuestion.question}
        </h3>

        <QuestionRenderer
          question={currentQuestion}
          value={profileData[currentQuestion.fieldName as keyof UserProfileData]}
          onAnswer={handleQuestionAnswer}
          language={language}
        />
      </motion.div>


      <div className="flex justify-between items-center pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && block.id === 'whatYouDo'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.previous}
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentQuestionIndex + 1} / {block.questions.length}</span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!isQuestionAnswered() || isExtracting}
          className="flex items-center gap-2"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'es' ? 'Analizando...' : 'Analyzing...'}
            </>
          ) : currentQuestion.id === 'business_description' ? (
            <>
              🤖 {language === 'es' ? 'Analizar mi negocio con IA →' : 'Analyze my business with AI →'}
            </>
          ) : isLastQuestion ? (
            <>
              {t.lastQuestion}
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              {t.next}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
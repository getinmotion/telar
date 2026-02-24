
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { Language, ProfileType } from './types';
import { getQuestions } from './getQuestions';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { CompletionScreen } from './CompletionScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWizardLayout } from '../cultural/components/MobileWizardLayout';
import { MobileWizardNavigation } from '../cultural/wizard-components/MobileWizardNavigation';

interface VisualMaturityCalculatorProps {
  language: Language;
  profileType?: ProfileType;
  onComplete: (scores: Record<string, number>, total: number) => void;
}

export const VisualMaturityCalculator: React.FC<VisualMaturityCalculatorProps> = ({ 
  language, 
  profileType,
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const questions = getQuestions(language, profileType);

  // Scroll to top when step changes
  useEffect(() => {
    if (!isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, isMobile]);

  const handleSelectOption = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    
    if (!answers[currentQuestion.id]) {
      toast({
        title: language === 'en' ? 'Please select an option' : 'Por favor, selecciona una opción',
        variant: 'destructive'
      });
      return;
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate total score
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxPossibleScore = questions.length * 3; // Assuming 3 is max value
      const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
      
      // Call the completion callback with scores
      onComplete(answers, percentageScore);
      setIsCompleted(true);
      
      toast({
        title: language === 'en' ? 'Assessment completed!' : '¡Evaluación completada!',
        description: language === 'en' 
          ? `Your maturity score: ${percentageScore}%` 
          : `Tu puntuación de madurez: ${percentageScore}%`
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Convert the Question type from getQuestions to match QuestionCard's expected format
  const adaptQuestionForCard = (question: any) => ({
    id: question.id,
    title: question.question, // Map 'question' property to 'title'
    subtitle: undefined,
    options: question.options
  });

  const currentQuestion = adaptQuestionForCard(questions[currentStep]);

  if (isCompleted) {
    return <CompletionScreen language={language} />;
  }

  // Mobile Layout - Single Column, No Image
  if (isMobile) {
    const navigationSlot = (
      <MobileWizardNavigation
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep >= questions.length - 1}
        isValid={!!answers[currentQuestion.id]}
        nextLabel={currentStep < questions.length - 1 ? 'Next' : 'Complete'}
      />
    );

    return (
      <MobileWizardLayout
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        title={language === 'en' ? 'Cultural Maturity Assessment' : 'Evaluación de Madurez Cultural'}
        language={language}
        navigationSlot={navigationSlot}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard 
              question={currentQuestion}
              selectedValue={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />
          </motion.div>
        </AnimatePresence>
      </MobileWizardLayout>
    );
  }

  // Desktop Layout - Fitness Tracker Inspired
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-0">
          {/* Progress Ring Header */}
          <div className="bg-gradient-to-br from-neon-green-50 to-white p-8">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
              <div className="flex-shrink-0">
                <svg width="120" height="120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="50" stroke="#EAEAEA" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#B8FF5C"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - (currentStep + 1) / questions.length)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(184, 255, 92, 0.4))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-120px', marginLeft: '0px' }}>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-neon-green">{currentStep + 1}</p>
                    <p className="text-xs text-gray-500">de {questions.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-charcoal mb-2">
                  {language === 'en' ? 'Artisan Maturity' : 'Madurez Artesanal'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en' 
                    ? `Question ${currentStep + 1} of ${questions.length}` 
                    : `Pregunta ${currentStep + 1} de ${questions.length}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Question Area */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionCard 
                  question={currentQuestion}
                  selectedValue={answers[currentQuestion.id]}
                  onSelectOption={handleSelectOption}
                />
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between pt-8">
              {currentStep > 0 && (
                <Button 
                  onClick={handlePrevious}
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  {language === 'en' ? 'Back' : 'Atrás'}
                </Button>
              )}
              <Button 
                onClick={handleNext}
                variant="neon"
                size="lg"
                className="ml-auto"
                disabled={!answers[currentQuestion.id]}
              >
                {currentStep < questions.length - 1 
                  ? (language === 'en' ? 'Next' : 'Siguiente')
                  : (language === 'en' ? 'Complete' : 'Completar')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCard } from '@/components/maturity/QuestionCard';
import { CheckboxQuestionCard } from '@/components/maturity/CheckboxQuestionCard';
import { ProfileTypeSelector } from './ProfileTypeSelector';
import { BifurcationChoice } from './BifurcationChoice';
import { ResultsDisplay } from './ResultsDisplay';
import { OptimizedCharacterImage } from './OptimizedCharacterImage';
import { useIsMobile } from '@/hooks/use-mobile';

interface StepContentContainerProps {
  currentStep: string;
  currentQuestionIndex: number;
  questions: any[];
  extendedQuestions: any[];
  profileType: any;
  answers: any;
  extendedAnswers: any;
  analysisType: 'quick' | 'deep' | null;
  scores: any;
  recommendedAgents: any;
  language: 'en' | 'es';
  t: any;
  characterImage: string;
  nextCharacterImage?: string;
  onProfileSelect: (type: any) => void;
  onSelectOption: (id: string, value: number | string[]) => void;
  onAnalysisChoice: (type: 'quick' | 'deep') => void;
  onComplete: () => void;
}

export const StepContentContainer: React.FC<StepContentContainerProps> = ({
  currentStep,
  currentQuestionIndex,
  questions,
  extendedQuestions,
  profileType,
  answers,
  extendedAnswers,
  analysisType,
  scores,
  recommendedAgents,
  language,
  t,
  characterImage,
  nextCharacterImage,
  onProfileSelect,
  onSelectOption,
  onAnalysisChoice,
  onComplete
}) => {
  const isMobile = useIsMobile();

  // Helper function to handle checkbox question responses
  const handleCheckboxResponse = (questionId: string, values: string[]) => {
    onSelectOption(questionId, values);
  };

  // Helper function to handle radio question responses
  const handleRadioResponse = (questionId: string, value: number) => {
    onSelectOption(questionId, value);
  };

  return (
    <div className={`flex gap-6 items-start ${isMobile ? 'flex-col gap-4' : ''}`}>
      {/* Character Image - Only show on desktop */}
      {!isMobile && (
        <div className="w-1/3 flex-shrink-0">
          <OptimizedCharacterImage
            src={characterImage}
            alt="Character guide"
            preloadNext={nextCharacterImage}
            className="w-full h-auto max-w-sm mx-auto"
          />
        </div>
      )}

      {/* Content - Full width on mobile */}
      <div className={`${isMobile ? 'w-full' : 'flex-1'} min-w-0`}>
        <AnimatePresence mode="wait">
          {currentStep === 'profileType' && (
            <motion.div
              key="profileType"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileTypeSelector
                profileType={profileType}
                onSelect={onProfileSelect}
                t={t}
              />
            </motion.div>
          )}

          {currentStep === 'questions' && questions[currentQuestionIndex] && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {questions[currentQuestionIndex].type === 'checkbox' ? (
                <CheckboxQuestionCard 
                  question={questions[currentQuestionIndex]}
                  selectedValues={answers[questions[currentQuestionIndex].id] || []}
                  onSelectOption={handleCheckboxResponse}
                />
              ) : (
                <QuestionCard 
                  question={questions[currentQuestionIndex]}
                  selectedValue={answers[questions[currentQuestionIndex].id]}
                  onSelectOption={handleRadioResponse}
                />
              )}
            </motion.div>
          )}

          {currentStep === 'bifurcation' && (
            <motion.div
              key="bifurcation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BifurcationChoice
                language={language}
                selectedType={analysisType}
                onSelect={onAnalysisChoice}
              />
            </motion.div>
          )}

          {currentStep === 'extendedQuestions' && extendedQuestions[currentQuestionIndex] && (
            <motion.div
              key={`extended-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {extendedQuestions[currentQuestionIndex].type === 'checkbox' ? (
                <CheckboxQuestionCard 
                  question={extendedQuestions[currentQuestionIndex]}
                  selectedValues={extendedAnswers[extendedQuestions[currentQuestionIndex].id] || []}
                  onSelectOption={handleCheckboxResponse}
                />
              ) : (
                <QuestionCard 
                  question={extendedQuestions[currentQuestionIndex]}
                  selectedValue={extendedAnswers[extendedQuestions[currentQuestionIndex].id]}
                  onSelectOption={handleRadioResponse}
                />
              )}
            </motion.div>
          )}

          {currentStep === 'results' && scores && recommendedAgents && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ResultsDisplay
                scores={scores}
                recommendedAgents={recommendedAgents}
                t={t}
                language={language}
                onComplete={onComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

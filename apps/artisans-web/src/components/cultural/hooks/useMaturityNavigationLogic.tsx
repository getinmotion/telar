
import { useCallback } from 'react';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';

interface UseMaturityNavigationLogicProps {
  currentStep: 'profileType' | 'questions' | 'bifurcation' | 'extendedQuestions' | 'results';
  setCurrentStep: (step: 'profileType' | 'questions' | 'bifurcation' | 'extendedQuestions' | 'results') => void;
  profileType: any;
  questions: any[];
  extendedQuestions: any[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answers: Record<string, number | string[]>;
  extendedAnswers: Record<string, number | string[]>;
  analysisType: 'quick' | 'deep' | null;
  calculateScores: () => CategoryScore;
  getRecommendations: (scores: CategoryScore) => RecommendedAgents;
  setScores: (scores: CategoryScore) => void;
  setRecommendedAgents: (agents: RecommendedAgents) => void;
  toast: any;
  t: any;
  language: 'en' | 'es';
}

export const useMaturityNavigationLogic = ({
  currentStep,
  setCurrentStep,
  profileType,
  questions,
  extendedQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  extendedAnswers,
  analysisType,
  calculateScores,
  getRecommendations,
  setScores,
  setRecommendedAgents,
  toast,
  t,
  language
}: UseMaturityNavigationLogicProps) => {

  const handleNext = useCallback(() => {
    if (currentStep === 'profileType') {
      if (!profileType) {
        toast({
          title: t.selectProfile,
          variant: 'destructive'
        });
        return;
      }
      setCurrentStep('questions');
    } else if (currentStep === 'questions') {
      const currentQuestion = questions[currentQuestionIndex];
      if (!answers[currentQuestion.id]) {
        toast({
          title: t.answerQuestion,
          variant: 'destructive'
        });
        return;
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentStep('bifurcation');
      }
    } else if (currentStep === 'bifurcation') {
      if (!analysisType) {
        toast({
          title: language === 'en' ? 'Please select an analysis type' : 'Por favor selecciona un tipo de análisis',
          variant: 'destructive'
        });
        return;
      }

      if (analysisType === 'quick') {
        const finalScores = calculateScores();
        const recommendations = getRecommendations(finalScores);
        setScores(finalScores);
        setRecommendedAgents(recommendations);
        setCurrentStep('results');
      } else {
        setCurrentQuestionIndex(0);
        setCurrentStep('extendedQuestions');
      }
    } else if (currentStep === 'extendedQuestions') {
      const currentQuestion = extendedQuestions[currentQuestionIndex];
      if (!extendedAnswers[currentQuestion.id]) {
        toast({
          title: t.answerQuestion,
          variant: 'destructive'
        });
        return;
      }

      if (currentQuestionIndex < extendedQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const finalScores = calculateScores();
        const recommendations = getRecommendations(finalScores);
        setScores(finalScores);
        setRecommendedAgents(recommendations);
        setCurrentStep('results');
      }
    }
  }, [currentStep, profileType, questions, extendedQuestions, currentQuestionIndex, answers, extendedAnswers, analysisType, t, toast, calculateScores, getRecommendations, setCurrentStep, setCurrentQuestionIndex, setScores, setRecommendedAgents, language]);

  const handleBack = useCallback(() => {
    if (currentStep === 'questions' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep === 'questions' && currentQuestionIndex === 0) {
      setCurrentStep('profileType');
    } else if (currentStep === 'bifurcation') {
      setCurrentStep('questions');
      setCurrentQuestionIndex(questions.length - 1);
    } else if (currentStep === 'extendedQuestions' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep === 'extendedQuestions' && currentQuestionIndex === 0) {
      setCurrentStep('bifurcation');
    } else if (currentStep === 'results') {
      if (analysisType === 'deep') {
        setCurrentStep('extendedQuestions');
        setCurrentQuestionIndex(extendedQuestions.length - 1);
      } else {
        setCurrentStep('bifurcation');
      }
    }
  }, [currentStep, currentQuestionIndex, questions.length, extendedQuestions.length, analysisType, setCurrentStep, setCurrentQuestionIndex]);

  return {
    handleNext,
    handleBack
  };
};

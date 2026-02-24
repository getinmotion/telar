
import React from 'react';
import { QuestionStep } from '../wizard-components/QuestionStep';
import { UserProfileData } from '../types/wizardTypes';
import { getAnalysisQuestions } from '../wizard-questions/analysisQuestions';

interface DetailedAnalysisStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  industry?: string;
  illustration?: string;
  currentStepNumber?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  currentStepId?: string;
  isStepValid?: boolean;
}

export const DetailedAnalysisStep: React.FC<DetailedAnalysisStepProps> = (props) => {
  const questionsObject = getAnalysisQuestions(props.language);
  const questions = Object.values(questionsObject);
  
  return (
    <>
      {questions.map((question, index) => (
        <QuestionStep
          key={question.id}
          question={question}
          profileData={props.profileData}
          updateProfileData={props.updateProfileData}
          language={props.language}
          industry={props.industry}
          illustration={props.illustration}
          currentStepNumber={props.currentStepNumber}
          totalSteps={props.totalSteps}
          onNext={props.onNext}
          onPrevious={props.onPrevious}
          isFirstStep={props.isFirstStep}
          currentStepId={props.currentStepId}
          isStepValid={props.isStepValid}
        />
      ))}
    </>
  );
};

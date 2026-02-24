
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { useFusedMaturityAgent } from './hooks/useFusedMaturityAgent';
import { IntelligentConversationFlow } from './conversational/components/IntelligentConversationFlow';
import { MilestoneCheckpoint } from './conversational/components/MilestoneCheckpoint';
import { UserProfileData } from './types/wizardTypes';
import { useTaskGenerationControl } from '@/hooks/useTaskGenerationControl';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface AIQuestion {
  question: string;
  context: string;
}

export const CulturalMaturityWizard: React.FC<{
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData, aiQuestions?: AIQuestion[]) => void;
}> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { enableAutoGeneration } = useTaskGenerationControl();

  const handleMaturityComplete = (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData, aiQuestions?: AIQuestion[]) => {
    enableAutoGeneration();
    onComplete(scores, recommendedAgents, profileData, aiQuestions);
  };

  const compatibleLanguage = mapToLegacyLanguage(language);

  const {
    currentBlock,
    profileData,
    isCompleted,
    updateProfileData,
    answerQuestion,
    goToNextBlock,
    goToPreviousBlock,
    businessType,
    isProcessing,
    showCheckpoint,
    checkpointInfo,
    continueFromCheckpoint,
    totalAnswered,
    totalQuestions, // ✅ Get dynamic total from hook
    answeredQuestionIds,
    blocks // ✅ Get all blocks for checkpoint
  } = useFusedMaturityAgent(compatibleLanguage, handleMaturityComplete);

  // Loading state
  if (!currentBlock) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  // ✅ Use dynamic total from hook (no hardcoded 16)
  const percentComplete = Math.round((totalAnswered / totalQuestions) * 100);

  return (
    <div className="w-full h-full">
      {showCheckpoint ? (
        <MilestoneCheckpoint
          checkpointNumber={checkpointInfo.checkpointNumber}
          totalAnswered={totalAnswered}
          totalQuestions={totalQuestions}
          percentComplete={percentComplete}
          language={compatibleLanguage}
          profileData={profileData}
          answeredQuestionIds={answeredQuestionIds}
          allBlocks={blocks} // ✅ Pass ALL blocks for better question lookup
          onContinue={continueFromCheckpoint}
          onGoToDashboard={() => navigate('/dashboard/home')}
          isOnboarding={totalQuestions <= 3}
        />
      ) : (
        <IntelligentConversationFlow
          block={currentBlock}
          profileData={profileData}
          language={compatibleLanguage}
          onAnswer={answerQuestion}
          onNext={goToNextBlock}
          onPrevious={goToPreviousBlock}
          updateProfileData={updateProfileData}
          businessType={businessType}
          isProcessing={isProcessing}
          totalAnswered={totalAnswered}
          totalQuestions={totalQuestions}
          globalQuestionNumber={totalAnswered + 1}
          isOnboarding={totalQuestions <= 3}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { UserProfileData } from '../types/wizardTypes';
import { AgentHeader } from './components/AgentHeader';
import { ConversationFlow } from './components/ConversationFlow';
import { ProgressSaving } from './components/ProgressSaving';
import { ResultsDisplay } from './components/ResultsDisplay';
import { useConversationalAgent } from './hooks/useConversationalAgent';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface AIQuestion {
  question: string;
  context: string;
}

interface ConversationalMaturityAgentProps {
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData, aiQuestions?: AIQuestion[]) => void;
  language: 'en' | 'es';
}

export const ConversationalMaturityAgent: React.FC<ConversationalMaturityAgentProps> = ({
  onComplete,
  language
}) => {
  const {
    currentBlock,
    profileData,
    insights,
    isCompleted,
    maturityLevel,
    personalizedTasks,
    updateProfileData,
    answerQuestion,
    goToNextBlock,
    goToPreviousBlock,
    saveProgress,
    loadProgress,
    completeAssessment,
    getBlockProgress,
    isGenerating,
    generateContextualQuestions,
    personalizationCount,
    currentPersonalizationContext
  } = useConversationalAgent(language, onComplete);

  const { trackEvent } = useAnalyticsTracking();
  const [showResults, setShowResults] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Auto-save progress
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      saveProgress();
    }
  }, [profileData, saveProgress]);

  // Track step changes and measure time
  useEffect(() => {
    if (currentBlock) {
      setStepStartTime(Date.now());
      trackEvent({
        eventType: 'onboarding_step_completed',
        eventData: {
          block_id: currentBlock.id,
          block_title: currentBlock.title
        }
      });
    }
  }, [currentBlock, trackEvent]);

  // Show results when completed
  useEffect(() => {
    if (isCompleted) {
      const duration = Math.floor((Date.now() - stepStartTime) / 1000);
      trackEvent({
        eventType: 'onboarding_step_completed',
        eventData: {
          completed: true,
          maturity_level: maturityLevel,
          total_duration: duration
        },
        success: true,
        durationSeconds: duration
      });
      setShowResults(true);
    }
  }, [isCompleted, maturityLevel, stepStartTime, trackEvent]);

  // Show loading if currentBlock is not available
  if (!currentBlock) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto min-h-screen p-8"
      >
        <div className="text-center">
          <p className="text-muted-foreground">Loading conversation blocks...</p>
        </div>
      </motion.div>
    );
  }

  if (showResults) {
    return (
      <ResultsDisplay
        profileData={profileData}
        maturityLevel={maturityLevel}
        personalizedTasks={personalizedTasks}
        language={language}
        onComplete={completeAssessment}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto min-h-screen"
    >
      {/* Agent Header */}
      <AgentHeader
        language={language}
        currentBlock={currentBlock}
        progress={getBlockProgress()}
        isOnboarding={personalizationCount === 0}
        totalAnswered={Object.keys(profileData).length}
      />

      {/* Progress Saving Indicator */}
      <ProgressSaving language={language} />

      {/* Main Conversation Flow */}
      <div className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <ConversationFlow
            key={currentBlock.id}
            block={currentBlock}
            profileData={profileData}
            
            language={language}
            onAnswer={answerQuestion}
            onNext={goToNextBlock}
            onPrevious={goToPreviousBlock}
            updateProfileData={updateProfileData}
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Target } from 'lucide-react';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { UserProfileData } from './types/wizardTypes';
import { MaturityTestHeader } from './MaturityTestHeader';
import { IntelligentConversationFlow } from './conversational/components/IntelligentConversationFlow';
import { CreativeResultsDisplay } from './conversational/components/CreativeResultsDisplay';
import { MilestoneCheckpoint } from './conversational/components/MilestoneCheckpoint';
import { MaturityTestProgress } from './components/MaturityTestProgress';
import { useFusedMaturityAgent } from './hooks/useFusedMaturityAgent';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '@/utils/eventBus';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { MATURITY_TEST_CONFIG, getProgressPercentage, getRemainingQuestions, getGlobalQuestionNumber } from '@/config/maturityTest';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { updateUserProfile } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId, upsertUserMasterContext } from '@/services/userMasterContext.actions';

interface AIQuestion {
  question: string;
  context: string;
}

interface FusedMaturityCalculatorProps {
  language?: 'en' | 'es';
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData, aiQuestions?: AIQuestion[]) => void;
}

// ErrorBoundary for checkpoint to prevent crashes
class CheckpointErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('❌ [CHECKPOINT-ERROR]:', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export const FusedMaturityCalculator: React.FC<FusedMaturityCalculatorProps> = ({
  language: propLanguage,
  onComplete
}) => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracking();
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();

  // Detectar modo review desde URL
  const [searchParams] = React.useState(() => new URLSearchParams(window.location.search));
  const isReviewMode = searchParams.get('mode') === 'review';
  const isContinueMode = searchParams.get('mode') === 'continue';

  const compatibleLanguage = propLanguage || 'es';

  const {
    currentBlock,
    profileData,
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
    businessType,
    isProcessing,
    isLoadingProgress, // ✅ Nuevo: detectar cuando está cargando progreso
    showCheckpoint,
    checkpointInfo,
    continueFromCheckpoint,
    totalAnswered,
    answeredQuestionIds,
    totalQuestions, // ✅ NUEVO: total dinámico (3 en onboarding, 36 en full)
    isOnboardingMode, // ✅ NUEVO: detectar si estamos en modo onboarding
    blocks // ✅ NUEVO: todos los bloques para checkpoint
  } = useFusedMaturityAgent(compatibleLanguage, onComplete);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isReviewMode) {
      loadProgress();
    }
    if (isContinueMode) {
      loadProgress();
    }

    trackEvent({
      eventType: 'onboarding_started',
      eventData: {
        language: compatibleLanguage,
        isReviewMode,
        timestamp: new Date().toISOString()
      }
    });
  }, []);

  // Show results when completed
  useEffect(() => {
    if (isCompleted) {
      setShowResults(true);
    }
  }, [isCompleted]);

  const handleComplete = async (scores?: CategoryScore, recommendedAgents?: RecommendedAgents) => {
    // Track completion
    await trackEvent({
      eventType: 'onboarding_assessment_completed',
      eventData: {
        totalQuestions: answeredQuestionIds?.size || 0,
        businessType,
        completedAt: new Date().toISOString(),
        scores
      },
      success: true
    });

    // ✅ NUEVO: Sincronizar con user_master_context (NestJS backend)
    if (user && profileData) {
      try {
        const existingContext = await getUserMasterContextByUserId(user.id);

        const currentProfile = (existingContext?.businessProfile as any) || {};

        // Trust AI extraction and user confirmation - no regex fallback
        const extractedBrandName = profileData.brandName || "Sin nombre definido";

        const updatedBusinessProfile = {
          ...currentProfile,
          brandName: extractedBrandName,
          businessDescription: profileData.businessDescription,
          uniqueValue: profileData.uniqueValue,
          craftType: profileData.craftType || profileData.businessType,
          businessType: profileData.businessType,
          businessLocation: profileData.businessLocation,
          yearsInBusiness: profileData.yearsInBusiness,
          targetAudience: profileData.targetAudience,
          currentSales: profileData.currentSales,
          pricingStrategy: profileData.pricing,
          salesChannels: profileData.salesChannels,
          primarySkills: profileData.primarySkills,
          currentChallenges: profileData.currentChallenges,
          businessGoals: profileData.businessGoals,
          timeAvailability: profileData.timeAvailability,
          monthlyRevenueGoal: profileData.monthlyRevenueGoal,
          teamSize: profileData.teamSize,
          lastUpdated: new Date().toISOString()
        };

        // ✅ Migrado a endpoint NestJS (UPSERT)
        await upsertUserMasterContext(user.id, {
          businessProfile: updatedBusinessProfile,
          contextVersion: (existingContext?.contextVersion || 0) + 1
        });

        // ✅ Migrado a endpoint NestJS (PATCH /telar/server/user-profiles/:userId)
        await updateUserProfile(user.id, {
          brandName: extractedBrandName,
          businessDescription: profileData.businessDescription,
          businessType: profileData.businessType
        });

        // ✅ Notificar cambios para sincronización automática
        EventBus.publish('business.profile.updated', { userId: user.id });
      } catch (error) {
        console.error('Error sincronizando Master Context:', error);
      }
    }

    setShowResults(true);
    setTimeout(() => {
      onComplete(scores!, recommendedAgents!, profileData);
    }, 3000);
  };


  // Show loading while recovering progress
  if (isLoadingProgress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto min-h-screen p-8 flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-3 bg-primary-subtle rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {compatibleLanguage === 'es' ? 'Recuperando tu progreso...' : 'Recovering your progress...'}
          </p>
        </div>
      </motion.div>
    );
  }

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
          <div className="animate-pulse">
            <div className="h-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-3 bg-primary-subtle rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show checkpoint screen (NUNCA en modo onboarding)
  if (showCheckpoint && !isOnboardingMode && !isCompleted && totalAnswered < totalQuestions) {
    const percentComplete = getProgressPercentage(totalAnswered, totalQuestions);

    return (
      <CheckpointErrorBoundary onError={() => {
        console.error('Checkpoint failed, continuing...');
        continueFromCheckpoint();
      }}>
        <MilestoneCheckpoint
          key={`checkpoint-${checkpointInfo.checkpointNumber}-${totalAnswered}`}
          checkpointNumber={checkpointInfo.checkpointNumber}
          totalAnswered={totalAnswered}
          totalQuestions={totalQuestions}
          percentComplete={percentComplete}
          language={compatibleLanguage}
          profileData={profileData}
          answeredQuestionIds={answeredQuestionIds}
          allBlocks={blocks}
          onContinue={continueFromCheckpoint}
          onGoToDashboard={() => {
            saveProgress();

            if (isOnboardingMode) {
              userLocalStorage.setItem('onboarding_completed', 'true');
            }

            navigate('/dashboard');
          }}
          isOnboarding={isOnboardingMode}
        />
      </CheckpointErrorBoundary>
    );
  }

  // Show results screen
  if (isCompleted && showResults) {
    return (
      <CreativeResultsDisplay
        profileData={profileData}
        maturityLevel={maturityLevel}
        personalizedTasks={personalizedTasks}
        businessType={profileData.businessType || 'creative'}
        onComplete={handleComplete}
        language={compatibleLanguage}
      />
    );
  }

  // Main assessment interface
  return (
    <div className="w-full min-h-screen">
      {/* ✅ PASO 5: Nuevo header unificado consistente */}
      <MaturityTestHeader
        onBack={() => navigate('/dashboard/home')}
        totalAnswered={totalAnswered}
        totalQuestions={totalQuestions}
        language={compatibleLanguage}
      />

      {/* Espaciador para header fijo */}
      <div className="h-20" />

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
        {/* Review Mode Banner */}
        {isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {compatibleLanguage === 'es' ? 'Modo Revisión' : 'Review Mode'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {compatibleLanguage === 'es'
                      ? 'Estás revisando tu evaluación. Puedes cambiar respuestas para mejorar tu puntuación. Los resultados anteriores se mantendrán en el historial.'
                      : 'You are reviewing your assessment. You can change answers to improve your score. Previous results will remain in history.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlock.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <IntelligentConversationFlow
              block={currentBlock}
              profileData={profileData}
              onAnswer={answerQuestion}
              onNext={goToNextBlock}
              onPrevious={goToPreviousBlock}
              updateProfileData={updateProfileData}
              isProcessing={isProcessing}
              totalAnswered={totalAnswered}
              totalQuestions={totalQuestions}
              globalQuestionNumber={totalAnswered + 1}
              language={compatibleLanguage}
              isOnboarding={isOnboardingMode}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
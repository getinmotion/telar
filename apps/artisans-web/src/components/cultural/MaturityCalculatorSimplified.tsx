import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { CulturalMaturityWizard } from './CulturalMaturityWizard';
import { useMaturityScoresSaver } from '@/hooks/useMaturityScoresSaver';
import { UserProfileData } from './types/wizardTypes';
import { createUserAgentsFromRecommendations, markOnboardingComplete } from '@/utils/onboardingUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedUserData } from '@/hooks/user';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

interface AIQuestion {
  question: string;
  context: string;
}

interface MaturityCalculatorSimplifiedProps {
  language: 'en' | 'es';
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents) => void;
}

export const MaturityCalculatorSimplified: React.FC<MaturityCalculatorSimplifiedProps> = ({
  language,
  onComplete
}) => {
  const { user } = useAuth();
  const { saveMaturityScores, saving: savingScores } = useMaturityScoresSaver();
  const { t } = useTranslations();
  const { updateProfile, updateContext } = useUnifiedUserData();
  const userLocalStorage = useUserLocalStorage();
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const handleWizardComplete = useCallback(async (
    scores: CategoryScore, 
    recommendedAgents: RecommendedAgents, 
    profileData: UserProfileData,
    aiQuestions?: AIQuestion[]
  ) => {
    console.log('MaturityCalculator: Wizard completed', { scores, recommendedAgents, profileData });
    
    try {
      // 1. Save to user-namespaced localStorage immediately
      if (user?.id) {
        markOnboardingComplete(user.id, scores, recommendedAgents);
        userLocalStorage.setItem('profileData', JSON.stringify(profileData));
      }
      
      // 2. If user is authenticated, save to database and generate personalized tasks
      if (user?.id) {
        console.log('Saving scores and generating personalized tasks for user:', user.id);
        
        // Save maturity scores to database
        const scoresSaved = await saveMaturityScores(scores, profileData);
        if (scoresSaved) {
          console.log('Maturity scores saved to database successfully');
        }
        
        // Update user context with comprehensive information using unified data
        const updateResults = await Promise.all([
          updateProfile({
            businessType: profileData.industry,
            businessDescription: profileData.businessDescription,
            targetMarket: profileData.targetAudience,
            languagePreference: language
          }),
          updateContext({
            businessProfile: profileData,
            taskGenerationContext: {
              maturityScores: scores,
              language,
              lastAssessmentSource: 'maturity_calculator',
              lastGeneration: new Date().toISOString()
            }
          })
        ]);
        
        if (updateResults.every(r => r.success)) {
          console.log('User master context updated successfully');
        }
        
        // Create agents in database
        const agentsCreated = await createUserAgentsFromRecommendations(user.id, recommendedAgents);
        if (agentsCreated) {
          console.log('User agents created in database successfully');
        }
        
        // Show warning about complete task replacement
        const shouldGenerateTasks = await new Promise<boolean>((resolve) => {
          const warningDialog = document.createElement('div');
          warningDialog.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
          warningDialog.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div class="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-foreground mb-4">
                ${language === 'es' ? '¿Reiniciar todas tus tareas?' : 'Reset all your tasks?'}
              </h3>
              <div class="text-left mb-6">
                <p class="text-foreground font-medium mb-3">
                  ${language === 'es' 
                    ? 'Esto BORRARÁ TODAS tus tareas existentes y creará nuevas basadas en tu evaluación actualizada.' 
                    : 'This will DELETE ALL your existing tasks and create new ones based on your updated assessment.'}
                </p>
                <p class="text-destructive font-medium mb-3">
                  ${language === 'es' 
                    ? '⚠️ Esta acción no se puede deshacer' 
                    : '⚠️ This action cannot be undone'}
                </p>
                <p class="text-muted-foreground text-sm">
                  ${language === 'es' 
                    ? 'Si solo quieres añadir más tareas sin borrar las existentes, usa la herramienta "Más Tareas" en el dashboard.' 
                    : 'If you only want to add more tasks without deleting existing ones, use the "More Tasks" tool in the dashboard.'}
                </p>
              </div>
              <div class="flex gap-3 justify-center">
                <button id="cancel-tasks" class="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted">
                  ${language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button id="confirm-tasks" class="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">
                  ${language === 'es' ? 'Sí, reiniciar todo' : 'Yes, reset everything'}
                </button>
              </div>
            </div>
          `;
          
          document.body.appendChild(warningDialog);
          
          const cancelBtn = warningDialog.querySelector('#cancel-tasks');
          const confirmBtn = warningDialog.querySelector('#confirm-tasks');
          
          cancelBtn?.addEventListener('click', () => {
            document.body.removeChild(warningDialog);
            resolve(false);
          });
          
          confirmBtn?.addEventListener('click', () => {
            document.body.removeChild(warningDialog);
            resolve(true);
          });
        });

        if (shouldGenerateTasks) {
          // Generate personalized tasks using AI
          setIsGeneratingTasks(true);
          try {
            console.log('Generating personalized tasks with profile data:', profileData);
            
            const { data: taskResult, error: taskError } = await supabase.functions.invoke(
              'generate-task-recommendations',
              {
                body: {
                  userId: user.id,
                  profileData: profileData,
                  maturityScores: scores,
                  language: language,
                  replaceExisting: true
                }
              }
            );

            if (taskError) {
              console.error('Error generating personalized tasks:', taskError);
              // Show user-friendly error message
              alert(language === 'es' 
                ? 'Error al reiniciar las tareas. Es posible que tengas demasiadas tareas activas o haya un problema temporal.'
                : 'Error resetting tasks. You may have too many active tasks or there may be a temporary issue.');
            } else {
              console.log('Tasks reset and new personalized tasks generated successfully:', taskResult);
            }
          } catch (taskGenerationError) {
            console.error('Failed to reset and generate tasks:', taskGenerationError);
            alert(language === 'es' 
              ? 'Error al reiniciar las tareas. Por favor, inténtalo de nuevo más tarde.'
              : 'Failed to reset tasks. Please try again later.');
          } finally {
            setIsGeneratingTasks(false);
          }
        }
      }
      
      // 3. Call completion callback
      onComplete(scores, recommendedAgents);
    } catch (err) {
      console.error('Error completing maturity calculator:', err);
      // Still complete to not block user
      onComplete(scores, recommendedAgents);
    }
  }, [onComplete, user, saveMaturityScores, language]);

  return (
    <div className="w-full min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t.maturityCalculator.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.maturityCalculator.description}
          </p>
        </motion.div>

        {/* Loading State for Task Generation */}
        {isGeneratingTasks && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-card rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.maturityCalculator.generatingTasks}
              </h3>
              <p className="text-muted-foreground">
                {t.maturityCalculator.generatingTasksDescription}
              </p>
            </div>
          </motion.div>
        )}

        {/* Wizard Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <CulturalMaturityWizard onComplete={handleWizardComplete} />
        </motion.div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { FusedMaturityCalculator } from '@/components/cultural/FusedMaturityCalculator';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/config/seo';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';
import { useMasterCoordinator } from '@/hooks/useMasterCoordinator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { upsertUserProgress } from '@/services/userProgress.actions';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

const MaturityCalculator = () => {
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { analyzeProfileAndGenerateTasks } = useMasterCoordinator();
  const [searchParams] = useSearchParams();
  const { trackEvent } = useAnalyticsTracking();

  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const finalLanguage = 'es';

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track assessment page view
    trackEvent({
      eventType: 'onboarding_assessment_started',
      eventData: {
        language: finalLanguage,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent, finalLanguage]);

  const handleBackToDashboard = () => {
    navigate('/dashboard/home');
  };

  const handleComplete = async (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData?: any) => {
    // ✅ DETECCIÓN AUTOMÁTICA: Detectar onboarding por scores en 0, no por mode
    const isOnboardingCompletion = Object.values(scores).every(v => {
      const score = Number(v);
      return !isNaN(score) && score === 0;
    });

    // Store completion flag for dashboard integration
    if (!isOnboardingCompletion) {
      localStorage.setItem('maturity_assessment_completed', 'true');
      localStorage.setItem('assessment_completion_time', new Date().toISOString());
    }

    setIsGeneratingTasks(true);

    try {
      // 🛡️ PASO 1: Garantizar que user_progress existe ANTES de generar tareas
      if (user?.id) {
        await upsertUserProgress(user.id, {
          experiencePoints: 0,
          level: 1,
          completedMissions: 0,
          nextLevelXp: 100,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0
        }).catch((insertError) => {
          console.error('Failed to create user_progress:', insertError);
          throw new Error('No se pudo inicializar el progreso del usuario');
        });
      }

      // 🎯 PASO 2: Generar tareas personalizadas
      const tasks = await analyzeProfileAndGenerateTasks();

      if (tasks && tasks.length > 0) {
        toast({
          title: "🎯 ¡Misiones Creadas!",
          description: `Generamos ${tasks.length} misiones personalizadas para tu negocio`,
        });
      }

      // Redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 2000);

    } catch (error) {
      console.error('Error durante el proceso de completado:', error);
      toast({
        title: "Completado",
        description: isOnboardingCompletion
          ? "Onboarding completado. Redirigiendo al dashboard..."
          : "Evaluación completada. Podrás ver tus misiones en el dashboard.",
      });

      // Redirigir incluso si hay errores
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 2000);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const seoData = SEO_CONFIG.pages.maturityCalculator?.en || {
    title: 'Business Maturity Calculator - Motion',
    description: 'Assess your business maturity level',
    keywords: 'maturity calculator, business assessment'
  };

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`${SEO_CONFIG.siteUrl}/maturity-calculator`}
        type="website"
        noIndex={true}
      />

      <div className="pt-20 relative">
        <ErrorBoundary>
          <FusedMaturityCalculator
            language={finalLanguage}
            onComplete={handleComplete}
          />
        </ErrorBoundary>

        {/* Loading overlay durante generación de tareas */}
        {isGeneratingTasks && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-xl p-8 max-w-md mx-4 shadow-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ✨ Generando tus misiones personalizadas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estamos analizando tu perfil para crear las misiones perfectas para ti...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MaturityCalculator;

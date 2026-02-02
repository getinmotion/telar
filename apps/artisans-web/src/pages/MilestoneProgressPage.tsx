import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtisanProgressHero } from '@/components/dashboard/artisan/ArtisanProgressHero';
import { MilestoneProgressDashboard } from '@/components/dashboard/artisan/MilestoneProgressDashboard';
import { MilestoneProgressChart } from '@/components/dashboard/artisan/MilestoneProgressChart';
import { MilestoneBadgeGallery } from '@/components/gamification/MilestoneBadgeGallery';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useAuth } from '@/context/AuthContext';

import { useMilestoneNotifications } from '@/hooks/useMilestoneNotifications';
import { useMilestoneProgressHistory } from '@/hooks/useMilestoneProgressHistory';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TelarLoadingAnimation } from '@/components/ui/TelarLoadingAnimation';
import { RotatingLoadingPhrases } from '@/components/ui/RotatingLoadingPhrases';

export const MilestoneProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { unifiedProgress, loading: progressLoading } = useUnifiedProgress();
  const { tasks } = useAgentTasks();

  // Activate notifications and progress tracking
  useMilestoneNotifications();
  useMilestoneProgressHistory(unifiedProgress);

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto">
              <TelarLoadingAnimation size="lg" />
            </div>
            <RotatingLoadingPhrases />
          </div>
        </div>
      </div>
    );
  }

  if (!unifiedProgress) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">No hay datos de progreso disponibles</p>
        </div>
      </div>
    );
  }

  const maturityScores = unifiedProgress.maturityScores || {
    ideaValidation: 0,
    userExperience: 0,
    marketFit: 0,
    monetization: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/artisan')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Taller Digital
            </Button>
            <h1 className="text-4xl font-bold text-foreground">
              Tu Progreso en el Camino del Artesano
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitorea tu avance y descubre nuevas oportunidades de crecimiento
            </p>
          </div>
        </div>

        {/* Hero Progress */}
        <ArtisanProgressHero
          userName={user?.user_metadata?.name || 'Artesano'}
          maturityScores={maturityScores}
          totalProgress={unifiedProgress.totalProgress}
          hasCompletedMaturityTest={true}
        />

        {/* Badge Gallery */}
        <MilestoneBadgeGallery variant="detailed" />

        {/* Historical Progress Chart */}
        <MilestoneProgressChart unifiedProgress={unifiedProgress} />

        {/* Detailed Milestone Dashboard */}
        <MilestoneProgressDashboard
          unifiedProgress={unifiedProgress}
          tasks={tasks}
        />
      </div>
    </div>
  );
};

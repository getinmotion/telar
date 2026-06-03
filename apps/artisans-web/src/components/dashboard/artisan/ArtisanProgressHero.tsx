import React, { useState, useMemo } from 'react';
import { Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedProgress, Milestone } from '@/types/unifiedProgress';
import { cn } from '@/lib/utils';
import { MilestoneDetailPopover } from './MilestoneDetailPopover';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { useMilestoneNotifications } from '@/hooks/useMilestoneNotifications';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { MILESTONE_DISPLAY_CONFIG } from '@/config/systemConfig';
import { SystemIcon } from '@/components/ui/SystemIcon';

interface ArtisanProgressHeroProps {
  userName?: string;
  totalProgress: number;
  unifiedProgress?: UnifiedProgress | null;
}

// Using centralized milestone configuration from systemConfig

export const ArtisanProgressHero: React.FC<ArtisanProgressHeroProps> = ({
  userName: userNameProp,
  totalProgress
}) => {
  const { unifiedProgress, loading: progressLoading } = useUnifiedProgress();
  const { profile, context } = useUnifiedUserData();

  // Lista de nombres genéricos que NO deben mostrarse
  const genericNames = [
    'Tu Negocio',
    'Tu Emprendimiento',
    'Tu Empresa',
    'Tu Proyecto',
    'Tu Startup',
    'Tu Taller Artesanal',
    'Tu Sello Musical',
    'Tu Productora Musical',
    'Tu Estudio Creativo',
    'Tu Consultoría',
    'Tu Agencia',
    'Sin nombre definido',
    'Artesano'
  ];

  // Determinar el nombre a mostrar con fallback inteligente
  const userName = useMemo(() => {
    // Prioridad 1: brandName desde profile
    if (profile?.brandName && !genericNames.some(g => profile.brandName?.toLowerCase() === g.toLowerCase())) {
      return profile.brandName;
    }
    // Prioridad 2: brandName desde context
    if (context?.businessProfile?.brandName && !genericNames.some(g => context.businessProfile.brandName?.toLowerCase() === g.toLowerCase())) {
      return context.businessProfile.brandName;
    }
    // Prioridad 3: prop pasado externamente (solo si no es genérico)
    if (userNameProp && !genericNames.some(g => userNameProp.toLowerCase() === g.toLowerCase())) {
      return userNameProp;
    }
    // Fallback: usar 'Artesano' si nada más está disponible
    return 'Artesano';
  }, [profile?.brandName, context?.businessProfile?.brandName, userNameProp]);
  const [selectedMilestone, setSelectedMilestone] = useState<(Milestone & { icon: string; color: string }) | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Activate milestone notifications
  useMilestoneNotifications();

  console.log('[ArtisanProgressHero] 📊 Unified Progress:', {
    loading: progressLoading,
    totalProgress: unifiedProgress?.totalProgress,
    milestones: unifiedProgress?.milestones,
    maturityScores: unifiedProgress?.maturityScores
  });

  // Convert UnifiedProgress milestones to array for display
  const milestones = useMemo(() => {
    if (!unifiedProgress?.milestones) return [];

    const milestoneOrder: Array<keyof typeof unifiedProgress.milestones> = [
      'formalization', 'brand', 'shop', 'sales', 'community'
    ];

    return milestoneOrder.map(key => {
      const milestone = unifiedProgress.milestones[key];
      const displayConfig = MILESTONE_DISPLAY_CONFIG[key];
      
      return {
        ...milestone,
        icon: displayConfig.icon,
        color: displayConfig.color
      };
    });
  }, [unifiedProgress]);

  const handleMilestoneClick = (milestone: Milestone & { icon: string; color: string }) => {
    console.log('[ArtisanProgressHero] 🎯 Milestone clicked:', milestone);
    setSelectedMilestone(milestone);
    setIsPopoverOpen(true);
  };

  const getMood = () => {
    const greetingName = userName !== 'Artesano' ? userName : 'tu taller digital';
    if (totalProgress >= 80) return { emoji: '🎉', message: `¡Increíble trabajo, ${greetingName}! Tu taller está floreciendo` };
    if (totalProgress >= 60) return { emoji: '🌱', message: `${greetingName}, tu oficio está tomando forma hermosamente` };
    if (totalProgress >= 40) return { emoji: '🪴', message: `Cada paso te acerca a tu visión, ${greetingName}` };
    if (totalProgress >= 20) return { emoji: '🌾', message: `Estás sembrando las bases de algo especial, ${greetingName}` };
    return { emoji: '✨', message: `Bienvenido, ${greetingName}` };
  };

  const mood = getMood();

  return (
    <>
      {/* Banner removido - solo debe aparecer en el dashboard principal */}

      <Card variant="neumorphic" className="relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative p-8 md:p-10">
        {/* Greeting Section */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              {mood.emoji} Hola, {userName}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {mood.message}
            </p>
          </div>
          <Badge className="shadow-neumorphic-inset bg-success/10 text-success border-success/30 px-4 py-2 text-base font-semibold">
            <Award className="w-4 h-4 mr-1.5" />
            Nivel {Math.floor(totalProgress / 20) + 1}
          </Badge>
        </div>

        {/* Progress Line */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Tu Progreso</span>
            <span className="text-sm font-bold text-foreground">{totalProgress}%</span>
          </div>

          {/* Progress Track */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden neumorphic-inset">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${totalProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Milestones */}
          <div className="flex justify-between mt-4">
            {milestones.map((milestone, index) => {
              const isCompleted = milestone.status === 'completed';
              const isActive = milestone.status === 'active';
              const progress = milestone.progress;

              return (
                <div
                  key={milestone.id}
                  onClick={() => handleMilestoneClick(milestone)}
                  className={cn(
                    "group relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105",
                    isActive && "scale-110"
                  )}
                >
                  {/* Milestone Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 neumorphic-inset",
                      isCompleted && "bg-success/10 scale-105 ring-2 ring-success/30",
                      isActive && "bg-success/10 animate-soft-glow ring-2 ring-success/30",
                      !isCompleted && !isActive && "bg-muted/50 opacity-60 hover:opacity-80"
                    )}
                  >
                    <SystemIcon name={milestone.icon} className="w-6 h-6 text-primary filter drop-shadow" />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs mt-2 font-medium text-center transition-all duration-300",
                      isCompleted && "text-success font-semibold",
                      isActive && "text-success font-semibold",
                      !isCompleted && !isActive && "text-muted-foreground"
                    )}
                  >
                    {milestone.label}
                  </span>

                  {/* Enhanced Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{milestone.tasksCompleted}/{milestone.totalTasks} tareas</div>
                      <div className="text-success/80 mt-1">Click para ver detalles</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

        {/* Milestone Detail Popover */}
        {selectedMilestone && (
          <MilestoneDetailPopover
            milestone={selectedMilestone}
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            currentProgress={totalProgress}
          />
        )}
      </Card>
    </>
  );
};

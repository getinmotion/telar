import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getLatestMaturityScore } from '@/services/userMaturityScores.actions';
import { ArtisanCard } from '@/components/artisan/ArtisanCard';
import { ArtisanBadge } from '@/components/artisan/ArtisanBadge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AgentRecommendation {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
  prompt: string;
  completed: boolean;
  isRealAgent: boolean;
}

export const AgentRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Get maturity scores
      // ✅ Migrado a endpoint NestJS (GET /user-maturity-scores/user/{user_id})
      const maturityData = await getLatestMaturityScore(user.id);

      if (!maturityData) {
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      const maturityScores = {
        idea_validation: maturityData.ideaValidation,
        user_experience: maturityData.userExperience,
        market_fit: maturityData.marketFit,
        monetization: maturityData.monetization
      };

      // Call master-agent-coordinator to generate recommendations
      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'generate_intelligent_recommendations',
          userId: user.id,
          maturityScores,
          language: 'es'
        }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Error al cargar recomendaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRecommendation = async (recommendation: AgentRecommendation) => {
    if (!user?.id) return;

    try {
      setIsGenerating(true);

      // Create task in database
      const { data: taskData, error: taskError } = await supabase
        .from('agent_tasks')
        .insert({
          user_id: user.id,
          title: recommendation.title,
          description: recommendation.description,
          agent_id: recommendation.agentId,
          priority: recommendation.priority === 'high' ? 5 : recommendation.priority === 'medium' ? 3 : 1,
          status: 'pending',
          estimated_time: recommendation.estimatedTime,
          category: recommendation.category
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Generate task steps using AI
      const { data: stepsData, error: stepsError } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'create_task_steps',
          taskId: taskData.id,
          taskData: {
            title: recommendation.title,
            description: recommendation.description,
            prompt: recommendation.prompt
          },
          profileContext: {
            agentId: recommendation.agentId,
            userId: user.id
          }
        }
      });

      if (stepsError) throw stepsError;

      toast.success('¡Tarea aceptada! La encontrarás en tu lista de tareas.');
      
      // Mark recommendation as completed
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendation.id
            ? { ...rec, completed: true }
            : rec
        )
      );
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      toast.error('Error al aceptar la recomendación');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <Target className="h-4 w-4" />;
    if (priority === 'medium') return <TrendingUp className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  const getPriorityVariant = (priority: string) => {
    if (priority === 'high') return 'primary';
    if (priority === 'medium') return 'golden';
    return 'earth';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <ArtisanCard variant="glass" className="p-8 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/60" />
        <h3 className="text-lg font-semibold mb-2">Sin recomendaciones por ahora</h3>
        <p className="text-sm text-muted-foreground">
          Completa tu evaluación de madurez para recibir recomendaciones personalizadas
        </p>
      </ArtisanCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Recomendaciones Inteligentes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Basadas en tu perfil y nivel de madurez
          </p>
        </div>
        <Button
          onClick={loadRecommendations}
          variant="artisan"
          size="sm"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <ArtisanCard
            key={rec.id}
            variant={rec.completed ? 'default' : 'elevated'}
            className={rec.completed ? 'opacity-60' : ''}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ArtisanBadge variant={getPriorityVariant(rec.priority as any)} size="sm">
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(rec.priority)}
                        <span className="capitalize">{rec.priority}</span>
                      </div>
                    </ArtisanBadge>
                    <ArtisanBadge variant="secondary" size="sm">
                      {rec.estimatedTime}
                    </ArtisanBadge>
                  </div>
                  <h3 className="font-semibold text-base leading-tight mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{rec.agentName}</span>
                    <span>•</span>
                    <span>{rec.category}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleAcceptRecommendation(rec)}
                disabled={rec.completed || isGenerating}
                variant={rec.completed ? 'outline' : 'artisan'}
                size="sm"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : rec.completed ? (
                  '✓ Aceptada'
                ) : (
                  'Aceptar Tarea'
                )}
              </Button>
            </div>
          </ArtisanCard>
        ))}
      </div>
    </div>
  );
};

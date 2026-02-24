import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getLatestMaturityScore } from '@/services/userMaturityScores.actions';
import { ArtisanCard } from '@/components/artisan/ArtisanCard';
import { Brain, TrendingUp, Target, Zap, Sparkles } from 'lucide-react';
import { getAgent } from '@/agents';

interface AgentInsight {
  agentId: string;
  agentName: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

export const AgentInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeWithAgents();
  }, [user?.id]);

  const analyzeWithAgents = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Load user context
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const maturityData = await getLatestMaturityScore(user.id);

      const { data: shops } = await supabase
        .from('artisan_shops')
        .select('id')
        .eq('user_id', user.id);

      const hasShop = shops && shops.length > 0;
      const shopId = hasShop ? shops[0].id : null;

      let productsCount = 0;
      if (shopId) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shopId);
        productsCount = count || 0;
      }

      const userContext = {
        userId: user.id,
        businessName: profile?.brand_name || profile?.full_name,
        craftType: profile?.business_type,
        maturityScores: maturityData ? {
          ideaValidation: maturityData.ideaValidation,
          userExperience: maturityData.userExperience,
          marketFit: maturityData.marketFit,
          monetization: maturityData.monetization
        } : undefined,
        hasShop,
        productsCount,
        hasCompletedOnboarding: !!maturityData,
        language: 'es' as const,
        profileData: profile
      };

      // Analyze with all agents
      const agentIds = ['growth', 'pricing', 'brand'];
      const analysisPromises = agentIds.map(async (agentId) => {
        const agent = getAgent(agentId);
        if (!agent) return null;

        const analysis = await agent.analyze(userContext);
        return {
          ...analysis,
          agentName: agent.name
        };
      });

      const results = await Promise.all(analysisPromises);
      const validInsights = results.filter((r): r is AgentInsight => r !== null);

      setInsights(validInsights);
    } catch (error) {
      console.error('Error analyzing with agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <Zap className="h-5 w-5 text-destructive" />;
    if (priority === 'medium') return <Target className="h-5 w-5 text-warning" />;
    return <TrendingUp className="h-5 w-5 text-success" />;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ArtisanCard key={i} variant="clay" className="p-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
          </ArtisanCard>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <ArtisanCard variant="glass" className="p-8 text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-primary/60" />
        <p className="text-sm text-muted-foreground">
          Completa tu onboarding para ver insights de los agentes
        </p>
      </ArtisanCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Análisis de Agentes Invisibles</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <ArtisanCard key={insight.agentId} variant="elevated">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-base">{insight.agentName}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.estimatedImpact}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(insight.priority)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Puntuación</span>
                  <span className={`text-2xl font-bold ${getScoreColor(insight.score)}`}>
                    {insight.score}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${insight.score}%` }}
                  />
                </div>
              </div>

              {insight.strengths.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-success">Fortalezas</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insight.strengths.slice(0, 2).map((strength, idx) => (
                      <li key={idx}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.weaknesses.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-600">Áreas de mejora</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insight.weaknesses.slice(0, 2).map((weakness, idx) => (
                      <li key={idx}>• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.recommendations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">Próximos pasos</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {insight.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ArtisanCard>
        ))}
      </div>
    </div>
  );
};

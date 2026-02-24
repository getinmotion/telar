
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RobustDashboardData {
  profile: {
    name: string;
    email: string;
  };
  maturityScores: {
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
  };
  userAgents: Array<{
    agent_id: string;
    is_enabled: boolean;
    usage_count: number;
  }>;
  loading: boolean;
  error: string | null;
  hasCompletedMaturityTest: boolean;
}

const DEFAULT_SCORES = {
  ideaValidation: 0,
  userExperience: 0,
  marketFit: 0,
  monetization: 0
};

export const useRobustDashboardData = (): RobustDashboardData => {
  const { user } = useAuth();
  const [data, setData] = useState<RobustDashboardData>({
    profile: {
      name: 'Usuario',
      email: ''
    },
    maturityScores: DEFAULT_SCORES,
    userAgents: [],
    loading: true,
    error: null,
    hasCompletedMaturityTest: false
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({
        ...prev,
        loading: false,
        profile: { name: 'Usuario', email: '' }
      }));
      return;
    }

    const loadData = async () => {
      try {
        // Datos básicos del usuario - SIEMPRE disponibles
        const basicProfile = {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || ''
        };

        // Intentar cargar datos adicionales con timeout corto
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );

        try {
          const [scoresResult, agentsResult] = await Promise.race([
            Promise.all([
              supabase.rpc('get_latest_maturity_scores', { user_uuid: user.id }),
              supabase.from('user_agents').select('*').eq('user_id', user.id)
            ]),
            timeoutPromise
          ]) as any[];

          let maturityScores = DEFAULT_SCORES;
          let hasCompletedTest = false;
          
          if (scoresResult.data && scoresResult.data.length > 0) {
            const scores = scoresResult.data[0];
            maturityScores = {
              ideaValidation: scores.idea_validation || 0,
              userExperience: scores.user_experience || 0,
              marketFit: scores.market_fit || 0,
              monetization: scores.monetization || 0
            };
            hasCompletedTest = true;
          }

          setData({
            profile: basicProfile,
            maturityScores,
            userAgents: agentsResult.data || [],
            loading: false,
            error: null,
            hasCompletedMaturityTest: hasCompletedTest
          });

        } catch (fetchError) {
          // Usar datos básicos si la carga falla
          console.log('Using basic data due to fetch timeout');
          setData({
            profile: basicProfile,
            maturityScores: DEFAULT_SCORES,
            userAgents: [],
            loading: false,
            error: null,
            hasCompletedMaturityTest: false
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar datos'
        }));
      }
    };

    loadData();
  }, [user]);

  return data;
};

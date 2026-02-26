import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { createUserAgentsFromRecommendations, markOnboardingComplete } from '@/utils/onboardingUtils';
import { createUserMaturityScore } from '@/services/userMaturityScores.actions';

interface RecoveryStatus {
  needsRecovery: boolean;
  recovering: boolean;
  recovered: boolean;
  error: string | null;
}

export const useDataRecovery = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<RecoveryStatus>({
    needsRecovery: false,
    recovering: false,
    recovered: false,
    error: null
  });

  // ✅ FIX: Usar ref para user para callbacks estables
  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // ✅ FIX: Guard para ejecutar solo una vez
  const hasCheckedRef = useRef(false);

  // NUEVA FUNCIÓN: Auto-reparar basado en maturity scores existentes
  const autoRepairFromMaturityScores = useCallback(async (scores: CategoryScore): Promise<boolean> => {
    const userId = userIdRef.current;
    if (!userId || !scores) {
      return false;
    }

    try {
      // Generar agentes recomendados inteligentemente basado en los scores
      const recommendedAgents: RecommendedAgents = {
        primary: [],
        secondary: []
      };

      // Lógica mejorada para recomendación de agentes
      const scoreEntries = [
        { key: 'monetization', value: scores.monetization || 0, agents: ['cost-calculator', 'pricing-assistant'] },
        { key: 'ideaValidation', value: scores.ideaValidation || 0, agents: ['cultural-consultant', 'maturity-evaluator'] },
        { key: 'userExperience', value: scores.userExperience || 0, agents: ['project-manager', 'marketing-advisor'] },
        { key: 'marketFit', value: scores.marketFit || 0, agents: ['marketing-advisor', 'export-advisor'] }
      ].sort((a, b) => a.value - b.value); // Ordenar por puntuación más baja

      // Agregar agentes para las 2 áreas más débiles
      scoreEntries.slice(0, 2).forEach(area => {
        if (area.value < 70) {
          area.agents.forEach(agentId => {
            if (!recommendedAgents.primary?.includes(agentId)) {
              recommendedAgents.primary?.push(agentId);
            }
          });
        }
      });

      // Siempre incluir agentes esenciales
      if (!recommendedAgents.primary?.includes('cultural-consultant')) {
        recommendedAgents.primary?.push('cultural-consultant');
      }
      if (!recommendedAgents.primary?.includes('cost-calculator')) {
        recommendedAgents.primary?.push('cost-calculator');
      }

      // Limitar a 6 agentes primarios
      if (recommendedAgents.primary && recommendedAgents.primary.length > 6) {
        recommendedAgents.primary = recommendedAgents.primary.slice(0, 6);
      }

      // Agregar agentes secundarios
      const secondaryAgents = ['collaboration-agreement', 'funding-routes', 'contract-generator'];
      recommendedAgents.secondary = secondaryAgents.filter(
        agentId => !recommendedAgents.primary?.includes(agentId)
      );

      // Crear agentes en la base de datos
      const success = await createUserAgentsFromRecommendations(userId, recommendedAgents);

      if (success) {
        // Marcar onboarding como completo
        markOnboardingComplete(userId, scores, recommendedAgents);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error in auto-repair:', err);
      return false;
    }
  }, []); // ✅ FIX: Sin dependencias - usa refs

  const checkAndRepair = useCallback(async (): Promise<void> => {
    const userId = userIdRef.current;
    if (!userId) {
      return;
    }

    // ✅ FIX: Guard para ejecutar solo una vez
    if (hasCheckedRef.current) {
      return;
    }
    hasCheckedRef.current = true;

    try {
      // Verificar maturity scores
      const { data: scores, error: scoresError } = await supabase.rpc('get_latest_maturity_scores', {
        user_uuid: userId
      });

      if (scoresError) {
        console.error('Error fetching maturity scores:', scoresError);
        setStatus(prev => ({ ...prev, error: 'Error verificando scores de madurez' }));
        return;
      }

      // Verificar agentes habilitados
      const { data: userAgents, error: agentsError } = await supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_enabled', true);

      if (agentsError) {
        console.error('Error fetching user agents:', agentsError);
        setStatus(prev => ({ ...prev, error: 'Error verificando agentes del usuario' }));
        return;
      }

      const hasScores = scores && scores.length > 0;
      const hasUsefulAgents = userAgents && userAgents.length > 1; // Más de 1 agente

      // Si tiene scores pero no agentes útiles, auto-reparar
      if (hasScores && !hasUsefulAgents && scores[0]) {
        setStatus(prev => ({ ...prev, recovering: true }));

        const scoresData: CategoryScore = {
          ideaValidation: scores[0].idea_validation || 50,
          userExperience: scores[0].user_experience || 50,
          marketFit: scores[0].market_fit || 50,
          monetization: scores[0].monetization || 30
        };

        const repaired = await autoRepairFromMaturityScores(scoresData);

        if (repaired) {
          setStatus({
            needsRecovery: false,
            recovering: false,
            recovered: true,
            error: null
          });
          return;
        }
      }

      // Si no tiene nada, necesita recovery completo
      if (!hasScores) {
        setStatus(prev => ({ ...prev, needsRecovery: true }));
      } else {
        setStatus(prev => ({ ...prev, needsRecovery: false }));
      }

    } catch (err) {
      console.error('Error in checkAndRepair:', err);
      setStatus(prev => ({ ...prev, error: 'Error verificando datos del usuario' }));
    }
  }, [autoRepairFromMaturityScores]); // ✅ FIX: Solo autoRepairFromMaturityScores

  const performEmergencyRecovery = useCallback(async (): Promise<boolean> => {
    const userId = userIdRef.current;
    if (!userId) {
      console.error('performEmergencyRecovery: No user found');
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, recovering: true, error: null }));

      const emergencyScores: CategoryScore = {
        ideaValidation: 50,
        userExperience: 50,
        marketFit: 50,
        monetization: 30
      };

      const emergencyAgents: RecommendedAgents = {
        primary: ['cultural-consultant', 'cost-calculator'],
        secondary: ['marketing-advisor', 'project-manager']
      };

      // Upsert user profile to ensure it exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.warn('Emergency recovery: could not upsert profile.', profileError);
      }

      // Save maturity scores to DB
      // ✅ Migrado a endpoint NestJS (POST /user-maturity-scores)
      try {
        await createUserMaturityScore({
          userId: userId,
          ideaValidation: emergencyScores.ideaValidation,
          userExperience: emergencyScores.userExperience,
          marketFit: emergencyScores.marketFit,
          monetization: emergencyScores.monetization,
          profileData: { emergencySetup: true, recoveredAt: new Date().toISOString() }
        });
      } catch (scoresError) {
        console.error('Emergency recovery: failed to save scores', scoresError);
      }

      // Guardar en user-namespaced localStorage
      markOnboardingComplete(userId, emergencyScores, emergencyAgents);

      // Crear agentes en BD
      const success = await createUserAgentsFromRecommendations(userId, emergencyAgents);

      if (success) {
        setStatus({
          needsRecovery: false,
          recovering: false,
          recovered: true,
          error: null
        });
        return true;
      } else {
        throw new Error('Failed to create user agents');
      }

    } catch (err) {
      console.error('Emergency recovery failed:', err);
      setStatus(prev => ({
        ...prev,
        recovering: false,
        error: 'Error en recuperación de emergencia'
      }));
      return false;
    }
  }, []); // ✅ FIX: Sin dependencias - usa refs

  // ✅ FIX: Solo ejecutar cuando cambia el userId y no se ha checkeado antes
  useEffect(() => {
    if (!user?.id || hasCheckedRef.current) return;

    // Delay de 2 segundos para dar tiempo a otros hooks a cargar
    const timer = setTimeout(() => {
      checkAndRepair();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user?.id]); // ✅ Solo depende del userId, no del user object completo

  // ✅ Reset guard cuando cambia el usuario
  useEffect(() => {
    if (user?.id !== userIdRef.current) {
      hasCheckedRef.current = false;
    }
  }, [user?.id]);

  return {
    ...status,
    performEmergencyRecovery,
    checkAndRepair
  };
};

/**
 * Update User Progress - Edge Function
 * 
 * Actualiza el progreso del usuario: XP, nivel, rachas, misiones completadas.
 * Verifica y desbloquea logros automáticamente.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateProgressRequest {
  xpGained: number;
  missionCompleted?: boolean;
  timeSpent?: number; // en minutos
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { xpGained, missionCompleted = false, timeSpent = 0 }: UpdateProgressRequest = await req.json();

    console.log('[UpdateProgress] Processing for user:', user.id, {
      xpGained,
      missionCompleted,
      timeSpent
    });

    // 🔧 FIXED: Usar maybeSingle y crear si no existe (UPSERT pattern)
    let { data: currentProgress, error: fetchError } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si no existe, crear con UPSERT
    if (!currentProgress) {
      console.log('[UpdateProgress] No progress found, creating initial record...');
      
      const { data: newProgress, error: upsertError } = await supabaseClient
        .from('user_progress')
        .upsert({
          user_id: user.id,
          experience_points: 0,
          level: 1,
          completed_missions: 0,
          next_level_xp: 100,
          current_streak: 0,
          longest_streak: 0,
          total_time_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (upsertError) {
        console.error('[UpdateProgress] Error creating progress:', upsertError);
        throw new Error('Error al crear progreso del usuario');
      }
      
      currentProgress = newProgress;
      console.log('[UpdateProgress] Initial progress created successfully');
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[UpdateProgress] Error fetching progress:', fetchError);
      throw new Error('Error al obtener progreso del usuario');
    }

    // Calcular nuevos valores
    let newXP = currentProgress.experience_points + xpGained;
    let newLevel = currentProgress.level;
    let nextLevelXP = currentProgress.next_level_xp;
    let leveledUp = false;
    const levelsGained = [];

    // Verificar si sube de nivel (puede subir múltiples niveles)
    while (newXP >= nextLevelXP) {
      newLevel++;
      newXP -= nextLevelXP;
      nextLevelXP = calculateNextLevelXP(newLevel);
      leveledUp = true;
      levelsGained.push(newLevel);
    }

    // Actualizar racha (función de base de datos)
    const { data: streakData } = await supabaseClient.rpc('update_user_streak', {
      p_user_id: user.id
    });

    // Actualizar progreso
    const updateData: any = {
      experience_points: newXP,
      level: newLevel,
      next_level_xp: nextLevelXP,
      total_time_spent: currentProgress.total_time_spent + timeSpent,
      updated_at: new Date().toISOString()
    };

    if (missionCompleted) {
      updateData.completed_missions = currentProgress.completed_missions + 1;
    }

    const { error: updateError } = await supabaseClient
      .from('user_progress')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[UpdateProgress] Error updating progress:', updateError);
      throw new Error('Error al actualizar progreso');
    }

    // Verificar y desbloquear logros
    const unlockedAchievements = await checkAndUnlockAchievements(
      supabaseClient,
      user.id,
      {
        ...updateData,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0
      }
    );

    console.log('[UpdateProgress] Progress updated successfully', {
      levelsGained,
      unlockedAchievements: unlockedAchievements.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          level: newLevel,
          experiencePoints: newXP,
          nextLevelXP,
          leveledUp,
          levelsGained,
          completedMissions: updateData.completed_missions || currentProgress.completed_missions,
          currentStreak: streakData?.current_streak || 0,
          longestStreak: streakData?.longest_streak || 0,
          unlockedAchievements
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[UpdateProgress] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateNextLevelXP(level: number): number {
  // Fórmula: 100 * 1.5^(level-1)
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

async function checkAndUnlockAchievements(
  supabase: any,
  userId: string,
  progress: any
): Promise<any[]> {
  const newAchievements = [];

  // Obtener logros ya desbloqueados
  const { data: unlockedIds } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const alreadyUnlocked = new Set(unlockedIds?.map((a: any) => a.achievement_id) || []);

  // Obtener catálogo de logros
  const { data: catalog } = await supabase
    .from('achievements_catalog')
    .select('*');

  if (!catalog) return [];

  // Verificar cada logro
  for (const achievement of catalog) {
    if (alreadyUnlocked.has(achievement.id)) continue;

    const criteria = achievement.unlock_criteria;
    let shouldUnlock = false;

    switch (criteria.type) {
      case 'missions_completed':
        shouldUnlock = progress.completed_missions >= criteria.count;
        break;
      case 'level_reached':
        shouldUnlock = progress.level >= criteria.level;
        break;
      case 'streak_reached':
        shouldUnlock = progress.current_streak >= criteria.days;
        break;
      case 'onboarding_complete':
        // Verificar si existe maturity score
        const { data: maturityData } = await supabase
          .from('user_maturity_scores')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .single();
        shouldUnlock = !!maturityData;
        break;
    }

    if (shouldUnlock) {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });

      if (!error) {
        newAchievements.push({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });
      }
    }
  }

  return newAchievements;
}

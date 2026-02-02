import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserMode = 'simple' | 'advanced';

interface UserModeReturn {
  mode: UserMode;
  isAdvancedMode: boolean;
  canUnlockAdvanced: boolean;
  isLoading: boolean;
  unlockAdvancedMode: () => Promise<void>;
  checkAdvancedModeConditions: () => Promise<boolean>;
}

export const useUserMode = (): UserModeReturn => {
  const { user } = useAuth();
  const [mode, setMode] = useState<UserMode>('simple');
  const [canUnlock, setCanUnlock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdvancedModeConditions = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if user has manually unlocked advanced mode
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences' as any)
        .select('advanced_mode_unlocked')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!prefError && (preferences as any)?.advanced_mode_unlocked) {
        return true;
      }

      // Check automatic unlock conditions
      const { data: context } = await supabase
        .from('user_master_context' as any)
        .select('task_generation_context, conversation_insights')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check if user has a shop
      const { data: shop } = await supabase
        .from('business_profile' as any)
        .select('id, brand_reviewed')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check products count
      const { count: productsCount } = await supabase
        .from('products' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Check analysis progress (safely access nested properties)
      const contextData: any = context;
      const analysisProgress = contextData?.task_generation_context?.maturity_test_progress?.total_answered || 0;

      const shopData = shop as any;
      const hasShop = shopData?.id != null;
      const hasEnoughProducts = (productsCount || 0) >= 5;
      const hasBrandReviewed = shopData?.brand_reviewed === true;
      const hasAnalysisProgress = analysisProgress >= 6; // At least 50% of deep analysis

      return hasShop && hasEnoughProducts && hasBrandReviewed && hasAnalysisProgress;
    } catch (error) {
      console.error('Error checking advanced mode conditions:', error);
      return false;
    }
  };

  const unlockAdvancedMode = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_preferences' as any)
        .upsert({
          user_id: user.id,
          advanced_mode_unlocked: true,
          unlocked_at: new Date().toISOString(),
        });

      setMode('advanced');
    } catch (error) {
      console.error('Error unlocking advanced mode:', error);
    }
  };

  useEffect(() => {
    const checkMode = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const meetsConditions = await checkAdvancedModeConditions();
      setMode(meetsConditions ? 'advanced' : 'simple');
      setCanUnlock(meetsConditions);
      setIsLoading(false);
    };

    checkMode();
  }, [user]);

  return {
    mode,
    isAdvancedMode: mode === 'advanced',
    canUnlockAdvanced: canUnlock,
    isLoading,
    unlockAdvancedMode,
    checkAdvancedModeConditions,
  };
};

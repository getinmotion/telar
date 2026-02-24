
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CategoryScore } from '@/types/dashboard';
import { useUserLocalStorage } from './useUserLocalStorage';

interface OptimizedMaturityData {
  currentScores: CategoryScore | null;
  profileData: any | null;
  loading: boolean;
  error: string | null;
}

const FETCH_TIMEOUT = 4000;

export const useOptimizedMaturityScores = (): OptimizedMaturityData => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const [data, setData] = useState<OptimizedMaturityData>({
    currentScores: null,
    profileData: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchMaturityScores = async () => {
      console.log('useOptimizedMaturityScores: Starting fetch');
      setData(prev => ({ ...prev, loading: true, error: null }));

      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), FETCH_TIMEOUT)
        );

        const scoresPromise = supabase.rpc('get_latest_maturity_scores', {
          user_uuid: user.id
        });

        const { data: scores, error } = await Promise.race([
          scoresPromise,
          timeoutPromise
        ]) as any;

        if (error) throw error;

        let currentScores = null;
        let profileData = null;

        if (scores && scores.length > 0) {
          currentScores = {
            ideaValidation: scores[0].idea_validation,
            userExperience: scores[0].user_experience,
            marketFit: scores[0].market_fit,
            monetization: scores[0].monetization
          };
          profileData = scores[0].profile_data;
          
          // Save to user-namespaced localStorage for future use
          userLocalStorage.setItem('maturityScores', JSON.stringify(currentScores));
          userLocalStorage.setItem('profileData', JSON.stringify(profileData));
        } else {
          // Try user-namespaced localStorage fallback
          const localScores = userLocalStorage.getItem('maturityScores');
          const localProfileData = userLocalStorage.getItem('profileData');
          
          if (localScores && localScores !== 'null') {
            currentScores = JSON.parse(localScores);
            profileData = localProfileData ? JSON.parse(localProfileData) : null;
          }
        }

        console.log('useOptimizedMaturityScores: Fetch completed');
        setData({
          currentScores,
          profileData,
          loading: false,
          error: null,
        });

      } catch (err) {
        console.warn('useOptimizedMaturityScores: Using localStorage fallback');
        
        // Try user-namespaced localStorage fallback
        try {
          const localScores = userLocalStorage.getItem('maturityScores');
          const localProfileData = userLocalStorage.getItem('profileData');
          
          if (localScores && localScores !== 'null') {
            const parsedScores = JSON.parse(localScores);
            const parsedProfileData = localProfileData ? JSON.parse(localProfileData) : null;
            
            setData({
              currentScores: parsedScores,
              profileData: parsedProfileData,
              loading: false,
              error: null
            });
            return;
          }
        } catch (fallbackErr) {
          console.warn('useOptimizedMaturityScores: localStorage fallback failed');
        }

        // Final fallback: empty data
        setData({
          currentScores: null,
          profileData: null,
          loading: false,
          error: null
        });
      }
    };

    fetchMaturityScores();
  }, [user]);

  return data;
};

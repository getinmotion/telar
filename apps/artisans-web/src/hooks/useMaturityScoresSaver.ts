
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CategoryScore } from '@/types/dashboard';
import { createUserMaturityScore } from '@/services/userMaturityScores.actions';

export const useMaturityScoresSaver = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveMaturityScores = async (scores: CategoryScore, profileData?: any) => {
    if (!user) {
      console.warn('No authenticated user found for saving maturity scores');
      return false;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('Saving maturity scores to database:', { userId: user.id, scores });

      // ✅ Migrado a endpoint NestJS (POST /user-maturity-scores)
      const data = await createUserMaturityScore({
        userId: user.id,
        ideaValidation: scores.ideaValidation,
        userExperience: scores.userExperience,
        marketFit: scores.marketFit,
        monetization: scores.monetization,
        profileData: profileData || {}
      });

      console.log('Maturity scores saved successfully:', data);
      return true;
    } catch (err: any) {
      console.error('Error saving maturity scores:', err);
      setError(err.message || 'Error al guardar las puntuaciones de madurez');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveMaturityScores,
    saving,
    error
  };
};

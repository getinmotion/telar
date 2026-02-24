
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CategoryScore } from '@/types/dashboard';
import { 
  getUserMaturityScoresByUserId, 
  getLatestMaturityScore,
  createUserMaturityScore 
} from '@/services/userMaturityScores.actions';
import { UserMaturityScore } from '@/types/userMaturityScore.types';

export const useMaturityScores = () => {
  const { user } = useAuth();
  const [currentScores, setCurrentScores] = useState<CategoryScore | null>(null);
  const [scoreHistory, setScoreHistory] = useState<UserMaturityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestScores = async () => {
    if (!user) return;

    try {
      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const latest = await getLatestMaturityScore(user.id);

      if (latest) {
        setCurrentScores({
          ideaValidation: latest.ideaValidation,
          userExperience: latest.userExperience,
          marketFit: latest.marketFit,
          monetization: latest.monetization
        });
      } else {
        setCurrentScores(null);
      }
    } catch (err) {
      console.error('Error fetching latest maturity scores:', err);
      setError('Error al cargar las puntuaciones de madurez');
    }
  };

  const fetchScoreHistory = async () => {
    if (!user) return;

    try {
      // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
      const data = await getUserMaturityScoresByUserId(user.id);
      // Limit to last 10 scores
      setScoreHistory(data.slice(0, 10));
    } catch (err) {
      console.error('Error fetching score history:', err);
    }
  };

  const saveMaturityScores = async (scores: CategoryScore, profileData?: any) => {
    if (!user) return null;

    try {
      // ✅ Migrado a endpoint NestJS (POST /telar/server/user-maturity-scores)
      const data = await createUserMaturityScore({
        userId: user.id,
        ideaValidation: scores.ideaValidation,
        userExperience: scores.userExperience,
        marketFit: scores.marketFit,
        monetization: scores.monetization,
        profileData: profileData || {}
      });

      setCurrentScores(scores);
      setScoreHistory(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error saving maturity scores:', err);
      throw err;
    }
  };

  const getScoreComparison = () => {
    if (scoreHistory.length < 2) return null;

    const latest = scoreHistory[0];
    const previous = scoreHistory[1];

    return {
      ideaValidation: latest.ideaValidation - previous.ideaValidation,
      userExperience: latest.userExperience - previous.userExperience,
      marketFit: latest.marketFit - previous.marketFit,
      monetization: latest.monetization - previous.monetization
    };
  };

  const getOverallProgress = () => {
    if (!currentScores) return 0;
    
    return Math.round(
      (currentScores.ideaValidation + 
       currentScores.userExperience + 
       currentScores.marketFit + 
       currentScores.monetization) / 4
    );
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          fetchLatestScores(),
          fetchScoreHistory()
        ]);
        
        setLoading(false);
      };
      
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    currentScores,
    scoreHistory,
    loading,
    error,
    saveMaturityScores,
    getScoreComparison,
    getOverallProgress,
    refetch: () => {
      if (user) {
        fetchLatestScores();
        fetchScoreHistory();
      }
    }
  };
};

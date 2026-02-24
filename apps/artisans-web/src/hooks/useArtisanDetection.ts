import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { detectArtisanProfile, detectCraftType } from '@/utils/artisanDetection';
import { CraftType } from '@/types/artisan';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

export const useArtisanDetection = () => {
  const [isArtisan, setIsArtisan] = useState<boolean | null>(null);
  const [craftType, setCraftType] = useState<CraftType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile, context, loading: unifiedLoading } = useUnifiedUserData();

  useEffect(() => {
    const checkArtisanStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Wait for unified data to load
      if (unifiedLoading) {
        return;
      }

      try {
        // Check if user already has an artisan shop
        // ✅ Migrado a endpoint NestJS (GET /telar/server/artisan-shops/user/{user_id})
        const shop = await getArtisanShopByUserId(user.id);

        if (shop) {
          setIsArtisan(true);
          setCraftType(shop.craftType as CraftType);
          setLoading(false);
          return;
        }

        // ✅ Use cached data from useUnifiedUserData
        const combinedData = {
          ...(profile || {}),
          ...(context?.businessProfile || {}),
          specificAnswers: {
            ...(context?.businessProfile || {}),
            ...(context?.taskGenerationContext || {})
          }
        };

        const detectedIsArtisan = detectArtisanProfile(combinedData);
        const detectedCraftType = detectCraftType(combinedData);

        setIsArtisan(detectedIsArtisan);
        setCraftType(detectedCraftType);

      } catch (error) {
        console.error('Error checking artisan status:', error);
        setIsArtisan(false);
        setCraftType(null);
      } finally {
        setLoading(false);
      }
    };

    checkArtisanStatus();
  }, [user, profile, context, unifiedLoading]);

  return {
    isArtisan,
    craftType,
    loading,
    refreshDetection: () => {
      setLoading(true);
      // Re-trigger the effect
      setIsArtisan(null);
    }
  };
};
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ConversationalShopCreation } from '@/components/shop/ConversationalShopCreation';
import { IntelligentShopCreationWizard } from '@/components/shop/IntelligentShopCreationWizard';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Loader2, ExternalLink, Package, Edit3 } from 'lucide-react';

export const CreateShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const { shop, loading, initialCheckComplete, checkExistingShop } = useArtisanShop();
  const [existingShop, setExistingShop] = useState<any>(null);
  const [checkingShop, setCheckingShop] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check for existing shop on mount - run once when initialCheckComplete
  useEffect(() => {

    const checkShop = () => {
      try {
        // Use the already-fetched shop from hook instead of re-fetching
        const shopData = shop as any;
        if (shopData && shopData.creation_status === 'complete') {
          navigate('/mi-tienda', { replace: true });
          return;
        }
        // If shop exists but incomplete, set it for continuation
        if (shopData && shopData.creation_status === 'incomplete') {
          console.log('shopData', shopData)
          setExistingShop(shopData);
        }

        // Only run once when initialCheckComplete becomes true
        if (hasChecked || !initialCheckComplete) return;
      } catch (error) {
        console.error('Error checking existing shop:', error);
      } finally {
        setCheckingShop(false);
        setHasChecked(true);
      }
    };

    checkShop();
  }, [initialCheckComplete, shop, navigate, hasChecked]);

  // Check if conversational mode is requested
  const isConversational = searchParams.get('mode') === 'conversational';

  // Show minimal loading while checking
  if (checkingShop) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If user has incomplete shop, allow continuation
  if (existingShop && existingShop.creation_status === 'incomplete') {
    // Continue creation from where they left off
    if (isConversational || true) {
      return <ConversationalShopCreation existingShop={existingShop} />;
    }
    return <IntelligentShopCreationWizard language={compatibleLanguage} existingShop={existingShop} />;
  }

  // New shop creation
  if (isConversational || true) {
    return <ConversationalShopCreation />;
  }

  return <IntelligentShopCreationWizard language={compatibleLanguage} />;
};
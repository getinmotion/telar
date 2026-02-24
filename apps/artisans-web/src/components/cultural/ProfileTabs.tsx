import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArtisanCraftType } from './types';
import { artisanCraftTranslations } from './artisanTranslations';

interface ProfileTabsProps {
  // No necesitamos pasar profiles como prop, usamos las traducciones directamente
}

export const ProfileTabs: React.FC<ProfileTabsProps> = () => {
  const craftTypes: ArtisanCraftType[] = ['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'];
  
  return (
    <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1">
      {craftTypes.map(craft => (
        <TabsTrigger key={craft} value={craft} className="text-sm">
          {artisanCraftTranslations[craft]}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

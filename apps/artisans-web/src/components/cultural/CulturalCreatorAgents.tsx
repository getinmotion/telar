// DEPRECATED: Este componente era para "creadores culturales" genéricos
// La plataforma ahora es exclusiva para artesanos
// Mantener temporalmente para compatibilidad, pero no usar en código nuevo

import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { ProfileTabs } from './ProfileTabs';
import { ProfileContent } from './ProfileContent';
import { ArtisanCraftType } from './types';
import { useAgentData } from './useAgentData';
import { getTranslations } from './translations';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface CulturalCreatorAgentsProps {
  onSelectAgent: (id: string) => void;
}

export const CulturalCreatorAgents: React.FC<CulturalCreatorAgentsProps> = ({ onSelectAgent }) => {
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const [selectedProfile, setSelectedProfile] = useState<ArtisanCraftType>('ceramic');
  
  const culturalAgents = useAgentData(compatibleLanguage);
  const t = getTranslations(compatibleLanguage);

  const handleProfileChange = (value: string) => {
    setSelectedProfile(value as ArtisanCraftType);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-sage-green/10 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2 text-foreground">Asistentes Artesanales</h2>
      <p className="text-muted-foreground mb-6">Guías especializados para artesanos colombianos</p>
      
      <Tabs defaultValue="ceramic" className="mb-6" onValueChange={handleProfileChange}>
        <ProfileTabs />
        
        {/* Profile content tabs - todos los tipos artesanales */}
        {(['ceramic', 'textile', 'woodwork', 'leather', 'jewelry', 'fiber', 'metal', 'stone', 'mixed'] as ArtisanCraftType[]).map((craftType) => (
          <ProfileContent
            key={craftType}
            profile={craftType}
            agents={culturalAgents}
            selectButtonText="Seleccionar"
            onSelectAgent={onSelectAgent}
          />
        ))}
      </Tabs>
    </div>
  );
};

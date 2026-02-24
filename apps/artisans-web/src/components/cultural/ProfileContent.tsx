
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { CulturalAgentCard } from './CulturalAgentCard';
import { CulturalAgent, ArtisanCraftType } from './types';

interface ProfileContentProps {
  profile: ArtisanCraftType;
  agents: CulturalAgent[];
  selectButtonText: string;
  onSelectAgent: (id: string) => void;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ 
  profile, 
  agents, 
  selectButtonText,
  onSelectAgent 
}) => {
  const filteredAgents = agents.filter(agent => 
    agent.craftTypes.includes(profile)
  );

  return (
    <TabsContent value={profile}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <CulturalAgentCard
            key={agent.id}
            agent={agent}
            onSelect={onSelectAgent}
            buttonText={selectButtonText}
          />
        ))}
      </div>
    </TabsContent>
  );
};

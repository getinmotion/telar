
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CulturalAgent } from './types';

interface CulturalAgentCardProps {
  agent: CulturalAgent;
  onSelect: (id: string) => void;
  buttonText: string;
}

export const CulturalAgentCard: React.FC<CulturalAgentCardProps> = ({ 
  agent, 
  onSelect, 
  buttonText 
}) => {
  const Icon = agent.icon;
  
  return (
    <Card 
      variant="elevated" 
      className="group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(agent.id)}
    >
      <CardHeader>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-charcoal group-hover:text-deep-green transition-colors">
          {agent.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground leading-relaxed">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button 
          variant="neon"
          className="w-full"
          size="lg"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};


import React from 'react';
import { Language } from './types';
import { getAgents } from './agentsData';
import { ChatBoxCarousel } from './ChatBoxCarousel';
import { ChatBoxesHeader } from './ChatBoxesHeader';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';

interface HeroChatBoxesProps {
  language?: Language;
}

export const HeroChatBoxes: React.FC<HeroChatBoxesProps> = ({ language }) => {
  const agents = getAgents();
  const { t } = useTranslations();

  return (
    <div className="w-full py-8 md:py-12 bg-gradient-to-br from-neon-green-900/90 to-neon-green-800/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChatBoxesHeader language={language} />
        <ChatBoxCarousel agents={agents} language={language} />
        
        {/* CTA to view all agents */}
        <div className="text-center mt-8 md:mt-12">
          <Link to="/dashboard">
            <Button 
              size="lg" 
              variant="neon"
              className="px-8 py-4 text-lg"
            >
              {t.heroChatBoxes.viewAllAgents}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-neon-green-200 text-sm mt-3 font-medium">
            {t.heroChatBoxes.exploreComplete}
          </p>
        </div>
      </div>
    </div>
  );
};

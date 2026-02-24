
import React from 'react';
import { ChatBox } from './hero/ChatBox';
import { ChatBoxesHeader } from './hero/ChatBoxesHeader';

import { motion } from 'framer-motion';
import { getAgents } from './hero/agentsData';
import { ChatBoxCarousel } from './hero/ChatBoxCarousel';
import { useIsMobile } from '@/hooks/use-mobile';

export const HeroChatBoxes = () => {
  const language = 'en'; // Fixed to English only
  const isMobile = useIsMobile();
  const agents = getAgents();
  
  if (isMobile) {
    return (
      <div className="w-full py-8 bg-gradient-to-br from-indigo-900/80 to-purple-900/80">
        <div className="container mx-auto px-4">
          <ChatBoxesHeader language={language} />
          <ChatBoxCarousel agents={agents} language={language} />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full py-12 bg-gradient-to-br from-indigo-900/80 to-purple-900/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <ChatBoxesHeader language={language} />
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <ChatBox 
              key={agent.id} 
              agent={agent}
              language={language}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

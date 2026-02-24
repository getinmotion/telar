
import React from 'react';
import { Language } from './types';

interface ChatBoxesHeaderProps {
  language: Language;
}

export const ChatBoxesHeader: React.FC<ChatBoxesHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mb-8 md:mb-12">
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-serif">
        {language === 'en' ? 'Back Office Agents for Every Need' : 'Agentes de Back Office para Cada Necesidad'}
      </h2>
      <p className="text-base md:text-lg text-indigo-100 max-w-3xl mx-auto">
        {language === 'en' 
          ? 'Each agent specializes in solving different back office challenges faced by creative businesses.' 
          : 'Cada agente se especializa en resolver diferentes desafíos de back office que enfrentan los negocios creativos.'}
      </p>
    </div>
  );
};

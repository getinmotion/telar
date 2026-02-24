
import React from 'react';
import { Agent, Language } from './types';

interface ChatBoxProps {
  agent: Agent;
  language: Language;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ agent, language }) => {
  return (
    <div className="flex-1 bg-indigo-900/50 rounded-lg p-3 md:p-5 border border-indigo-700/30 backdrop-blur-sm h-full">
      <div className="flex items-center mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${agent.color} flex items-center justify-center mr-3`}>
          {agent.icon}
        </div>
        <h3 className="font-medium text-lg md:text-xl text-indigo-200">
          {agent.title[language]}
        </h3>
      </div>
      <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
        <p className="py-2 px-3 bg-indigo-800/50 rounded-md border border-indigo-700/30 text-indigo-100">
          {agent.question[language]}
        </p>
        <p className={`py-2 px-3 ${agent.responseColor} rounded-md border`}>
          {agent.response[language]}
        </p>
      </div>
    </div>
  );
};

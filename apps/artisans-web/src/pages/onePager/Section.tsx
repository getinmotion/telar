
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  content?: string | null;
  bullets?: string[] | null;
}

export const Section = ({ icon, title, content, bullets }: SectionProps) => {
  return (
    <div className="bg-gradient-to-br from-indigo-950 to-purple-950 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-indigo-800/30">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-bold ml-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">{title}</h3>
      </div>
      {content && <p className="text-indigo-100 mb-4">{content}</p>}
      {bullets && (
        <ul className="space-y-2">
          {bullets.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-pink-400 mr-2 mt-1 flex-shrink-0" />
              <span className="text-indigo-100">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

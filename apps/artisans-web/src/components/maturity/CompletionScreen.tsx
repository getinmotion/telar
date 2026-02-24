
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Language } from './types';

interface CompletionScreenProps {
  language: Language;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ language }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] relative overflow-hidden">
      {/* Confetti-like background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-3 h-3 rounded-full bg-neon-green animate-float" style={{animationDelay: '0s'}} />
        <div className="absolute top-[30%] right-[20%] w-2 h-2 rounded-full bg-deep-green animate-float" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-[40%] left-[25%] w-4 h-4 rounded-full bg-neon-green-300 animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-[50%] right-[30%] w-2 h-2 rounded-full bg-deep-green-400 animate-float" style={{animationDelay: '1.5s'}} />
        <div className="absolute bottom-[20%] right-[15%] w-3 h-3 rounded-full bg-neon-green animate-float" style={{animationDelay: '0.8s'}} />
        <div className="absolute top-[20%] left-[40%] w-2 h-2 rounded-full bg-deep-green-300 animate-float" style={{animationDelay: '0.3s'}} />
      </div>

      <div className="text-center p-8 relative z-10">
        {/* Success icon with glow */}
        <div className="inline-block relative mb-6 animate-scale-in">
          <div className="absolute inset-0 bg-neon-green/30 rounded-full blur-2xl animate-glow-pulse-intense" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-neon-green-400 to-neon-green-700 rounded-full flex items-center justify-center shadow-glow-intense">
            <CheckCircle2 className="h-14 w-14 text-white animate-scale-bounce" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-4xl font-bold text-charcoal mb-3 animate-fade-in">
          {language === 'en' ? 'Assessment Completed!' : '¡Evaluación Completada!'}
        </h3>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-6 animate-slide-up">
          {language === 'en' 
            ? 'Your results are being analyzed...' 
            : 'Estamos analizando tus resultados...'}
        </p>

        {/* Loading animation */}
        <div className="flex justify-center items-center gap-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
          <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
        </div>
      </div>
    </div>
  );
};

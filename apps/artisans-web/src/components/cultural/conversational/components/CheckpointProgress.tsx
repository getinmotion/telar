import React from 'react';
import { motion } from 'framer-motion';

interface CheckpointProgressProps {
  answeredInBlock: number; // 1, 2, 3, o 4
  totalInBlock: number;
  language: 'en' | 'es';
}

export const CheckpointProgress: React.FC<CheckpointProgressProps> = ({
  answeredInBlock,
  totalInBlock,
  language
}) => {
  const translations = {
    en: {
      checkpoint: (answered: number, total: number) => `${answered}/${total} questions until checkpoint`,
      almostThere: "Almost there! One more question until checkpoint",
      checkpointReached: "Checkpoint reached! ✨"
    },
    es: {
      checkpoint: (answered: number, total: number) => `${answered}/${total} preguntas hasta el checkpoint`,
      almostThere: "¡Casi! Una pregunta más hasta el checkpoint",
      checkpointReached: "¡Checkpoint alcanzado! ✨"
    }
  };
  
  const t = translations[language];
  
  return (
    <div className="flex items-center gap-2 text-sm text-charcoal/60 mb-4">
      {Array.from({ length: totalInBlock }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-2 w-2 rounded-full transition-all ${
            i < answeredInBlock 
              ? 'bg-primary scale-110 shadow-lg' 
              : 'bg-muted'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: i < answeredInBlock ? 1.1 : 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}
      <span className="ml-2 font-medium">
        {answeredInBlock === totalInBlock || answeredInBlock === 0
          ? t.checkpointReached
          : answeredInBlock === totalInBlock - 1
            ? t.almostThere 
            : t.checkpoint(answeredInBlock, totalInBlock)
        }
      </span>
    </div>
  );
};

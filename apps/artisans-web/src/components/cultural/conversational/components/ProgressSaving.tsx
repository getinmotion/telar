import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check } from 'lucide-react';

interface ProgressSavingProps {
  language: 'en' | 'es';
}

export const ProgressSaving: React.FC<ProgressSavingProps> = ({ language }) => {
  const [showSaved, setShowSaved] = useState(false);

  const translations = {
    en: {
      saving: "Saving progress...",
      saved: "Progress saved"
    },
    es: {
      saving: "Guardando progreso...",
      saved: "Progreso guardado"
    }
  };

  const t = translations[language];

  // Simulate save animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {showSaved && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 rounded-lg p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-success-foreground" />
            </div>
            <span className="text-sm font-medium text-success dark:text-success">
              {t.saved}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Clock, Brain } from 'lucide-react';

interface SmartProgressIndicatorProps {
  language: 'en' | 'es';
  isGenerating?: boolean;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
}

export const SmartProgressIndicator: React.FC<SmartProgressIndicatorProps> = ({ 
  language, 
  isGenerating = false,
  isSaving = false,
  hasUnsavedChanges = false
}) => {
  const [showIndicator, setShowIndicator] = useState(false);

  const translations = {
    en: {
      saving: "Saving progress...",
      saved: "Progress saved",
      generating: "Generating smart questions...",
      unsavedChanges: "Unsaved changes"
    },
    es: {
      saving: "Guardando progreso...",
      saved: "Progreso guardado",
      generating: "Generando preguntas inteligentes...",
      unsavedChanges: "Cambios sin guardar"
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (isGenerating || isSaving || hasUnsavedChanges) {
      setShowIndicator(true);
    } else {
      const timer = setTimeout(() => setShowIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isSaving, hasUnsavedChanges]);

  const getIndicatorContent = () => {
    if (isGenerating) {
      return {
        icon: <Brain className="w-4 h-4 text-primary" />,
        text: t.generating,
        bgColor: "bg-primary/10 dark:bg-primary/20",
        borderColor: "border-primary/20 dark:border-primary/30"
      };
    }
    
    if (isSaving) {
      return {
        icon: <Save className="w-4 h-4 text-secondary animate-pulse" />,
        text: t.saving,
        bgColor: "bg-secondary/10 dark:bg-secondary/20",
        borderColor: "border-secondary/20 dark:border-secondary/30"
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        icon: <Clock className="w-4 h-4 text-orange-500" />,
        text: t.unsavedChanges,
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-800"
      };
    }
    
    return {
      icon: <Check className="w-4 h-4 text-success" />,
      text: t.saved,
      bgColor: "bg-success/10 dark:bg-success/20",
      borderColor: "border-success/20 dark:border-success/30"
    };
  };

  const content = getIndicatorContent();

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 ${content.bgColor} border ${content.borderColor} rounded-lg p-3 shadow-lg max-w-xs`}
        >
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {content.icon}
            </div>
            <span className="text-sm font-medium text-foreground">
              {content.text}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
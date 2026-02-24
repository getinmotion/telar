import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../../types/wizardTypes';
import { MaturityLevel, PersonalizedTask } from '../types/conversationalTypes';

interface ResultsDisplayProps {
  profileData: UserProfileData;
  maturityLevel: MaturityLevel | null;
  personalizedTasks: PersonalizedTask[];
  language: 'en' | 'es';
  onComplete: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  profileData,
  maturityLevel,
  personalizedTasks,
  language,
  onComplete
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const translations = {
    en: {
      title: "Your Business Growth Profile",
      level: "Your Level",
      tasks: "Your Personalized Action Plan",
      complete: "Start Your Journey",
      completing: "Setting up your dashboard...",
      completed: "Welcome to your dashboard!"
    },
    es: {
      title: "Tu Perfil de Crecimiento Empresarial",
      level: "Tu Nivel",
      tasks: "Tu Plan de Acción Personalizado", 
      complete: "Iniciar Tu Viaje",
      completing: "Configurando tu panel...",
      completed: "¡Bienvenido a tu panel!"
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
      setIsCompleted(true);
      setTimeout(() => {
        // Navigation will be handled by parent component
      }, 1500);
    } catch (error) {
      console.error('Error completing:', error);
      setIsCompleting(false);
    }
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8"
    >
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
      </div>

      {maturityLevel && (
        <div className="bg-primary/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t.level}: {maturityLevel.name}</h2>
          <p className="text-muted-foreground">{maturityLevel.description}</p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t.tasks}</h3>
        <div className="space-y-3">
          {personalizedTasks.slice(0, 3).map((task, index) => (
            <div key={task.id} className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleComplete} 
        className="w-full" 
        disabled={isCompleting || isCompleted}
      >
        {isCompleted ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.completed}
          </>
        ) : isCompleting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t.completing}
          </>
        ) : (
          <>
            {t.complete}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
};
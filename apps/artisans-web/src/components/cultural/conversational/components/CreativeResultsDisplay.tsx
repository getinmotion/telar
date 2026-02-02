import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, CheckCircle, ArrowRight, Star, Palette, Target, TrendingUp, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../../types/wizardTypes';
import { MaturityLevel, PersonalizedTask } from '../types/conversationalTypes';

interface CreativeResultsDisplayProps {
  profileData: UserProfileData;
  maturityLevel: MaturityLevel | null;
  personalizedTasks: PersonalizedTask[];
  language: 'en' | 'es';
  businessType: string;
  onComplete: () => void;
}

export const CreativeResultsDisplay: React.FC<CreativeResultsDisplayProps> = ({
  profileData,
  maturityLevel,
  personalizedTasks,
  language,
  businessType,
  onComplete
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const translations = {
    en: {
      title: 'Your Creative Business Profile',
      subtitle: 'Personalized insights and action plan',
      maturityTitle: 'Your Current Stage',
      tasksTitle: 'Your Personalized Action Plan',
      detectedAs: 'Detected as',
      characteristics: 'Key Characteristics',
      nextSteps: 'Recommended Next Steps',
      startJourney: 'Start Your Growth Journey',
      completing: 'Setting up your dashboard...',
      completed: 'Ready!',
      businessTypes: {
        creative: 'Creative Entrepreneur',
        service: 'Service Provider',
        product: 'Product Maker',
        tech: 'Tech Entrepreneur',
        other: 'Entrepreneur'
      }
    },
    es: {
      title: 'Tu Perfil de Negocio Creativo',
      subtitle: 'Insights personalizados y plan de acción',
      maturityTitle: 'Tu Etapa Actual',
      tasksTitle: 'Tu Plan de Acción Personalizado',
      detectedAs: 'Detectado como',
      characteristics: 'Características Clave',
      nextSteps: 'Siguientes Pasos Recomendados',
      startJourney: 'Comenzar tu Viaje de Crecimiento',
      completing: 'Configurando tu dashboard...',
      completed: '¡Listo!',
      businessTypes: {
        creative: 'Emprendedor Creativo',
        service: 'Proveedor de Servicios',
        product: 'Creador de Productos',
        tech: 'Emprendedor Tech',
        other: 'Emprendedor'
      }
    }
  };

  const t = translations[language];

  const handleComplete = () => {
    setIsCompleting(true);
    // Immediate feedback and completion
    setTimeout(() => {
      setIsCompleted(true);
      onComplete();
    }, 800);
  };

  const getBusinessIcon = () => {
    switch (businessType) {
      case 'creative':
        return <Palette className="w-6 h-6" />;
      case 'service':
        return <Target className="w-6 h-6" />;
      case 'product':
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getProfileSummary = () => {
    const businessName = profileData.businessDescription?.split(' ').slice(0, 4).join(' ') || 
      (language === 'es' ? 'tu proyecto creativo' : 'your creative project');
    
    if (language === 'es') {
      return `Hemos analizado ${businessName} y detectado que eres un ${t.businessTypes[businessType]} en la etapa "${maturityLevel?.name}". Basándome en tus respuestas específicas, he creado un plan de acción personalizado para ayudarte a crecer de manera estratégica.`;
    } else {
      return `We've analyzed ${businessName} and detected that you're a ${t.businessTypes[businessType]} at the "${maturityLevel?.name}" stage. Based on your specific responses, I've created a personalized action plan to help you grow strategically.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Celebration Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
            animate={{ 
              y: window.innerHeight + 100, 
              rotate: 360,
              scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className={`absolute w-4 h-4 ${
              i % 3 === 0 ? 'bg-warning' : 
              i % 3 === 1 ? 'bg-accent' : 'bg-destructive'
            } rounded-full shadow-lg`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto p-6"
      >
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            {/* Achievement Badge */}
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto bg-gradient-accent rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <Crown className="w-16 h-16 text-white" />
              </div>
              {/* Sparkle effects around badge */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className={`absolute w-3 h-3 bg-warning rounded-full`}
                  style={{
                    top: `${20 + 30 * Math.cos((i / 8) * 2 * Math.PI)}%`,
                    left: `${50 + 30 * Math.sin((i / 8) * 2 * Math.PI)}%`,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-warning/20 to-accent/20 px-6 py-3 rounded-full border-2 border-warning/30 shadow-lg">
                <Star className="w-6 h-6 text-warning" />
                <span className="text-xl font-bold text-foreground">
                  {language === 'es' ? '¡Análisis Completado!' : 'Analysis Complete!'}
                </span>
                <Star className="w-6 h-6 text-warning" />
              </div>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-4"
          >
            {language === 'es' ? '¡Felicitaciones!' : 'Congratulations!'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-foreground font-medium"
          >
            {language === 'es' 
              ? 'Tu perfil creativo está listo para el crecimiento' 
              : 'Your creative profile is ready for growth'
            }
          </motion.p>
        </div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 mb-8 border border-primary/20 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-primary to-accent rounded-lg text-white">
            {getBusinessIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-charcoal mb-2">
              {language === 'es' ? 'Resumen de tu Perfil' : 'Your Profile Summary'}
            </h3>
            <p className="text-charcoal/70 leading-relaxed">
              {getProfileSummary()}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Maturity Level */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-primary/20 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-charcoal">{t.maturityTitle}</h3>
          </div>
          
          {maturityLevel && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg text-charcoal mb-1">
                  {maturityLevel.name}
                </h4>
                <p className="text-charcoal/70 text-sm">
                  {maturityLevel.description}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium text-charcoal mb-2 text-sm">
                  {t.characteristics}
                </h5>
                <ul className="space-y-1">
                  {maturityLevel.characteristics.slice(0, 3).map((char, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-charcoal/70">
                      <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* Personalized Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-primary/20 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-charcoal">{t.tasksTitle}</h3>
          </div>
          
          <div className="space-y-3">
            {personalizedTasks.slice(0, 4).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="p-3 bg-primary-subtle rounded-lg border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                    task.priority === 'high' ? 'bg-destructive' :
                    task.priority === 'medium' ? 'bg-accent' : 'bg-charcoal/40'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-charcoal text-sm mb-1">
                      {task.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-charcoal/60">
                        {task.estimatedTime}
                      </span>
                      <span className="text-xs text-accent">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next Steps */}
      {maturityLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 mb-8 border border-primary/20 shadow-lg"
        >
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            {t.nextSteps}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {maturityLevel.nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-2 p-3 bg-primary-subtle rounded-lg border border-primary/20"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-charcoal">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

        {/* Celebration Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Button
            onClick={handleComplete}
            disabled={isCompleting || isCompleted}
            size="lg"
            className="bg-gradient-accent hover:bg-gradient-accent/90 text-white px-12 py-6 text-xl font-bold shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-6 h-6 mr-3" />
                {language === 'es' ? '¡Listo!' : 'Ready!'}
              </>
            ) : isCompleting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-3"
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
                {language === 'es' ? 'Configurando...' : 'Setting up...'}
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                {language === 'es' ? 'Comenzar Mi Aventura Creativa' : 'Start My Creative Adventure'}
                <ArrowRight className="w-6 h-6 ml-3" />
              </>
            )}
          </Button>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-4 text-muted-foreground"
          >
            {language === 'es' 
              ? 'Tu dashboard personalizado te espera' 
              : 'Your personalized dashboard awaits'
            }
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
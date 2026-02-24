import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, CheckCircle, Star, Zap, Target, Palette, Users, TrendingUp, Heart, Lightbulb, Building, DollarSign, AlertTriangle } from 'lucide-react';
import { ConversationBlock } from '../types/conversationalTypes';

interface AgentHeaderProps {
  language: 'en' | 'es';
  currentBlock: ConversationBlock;
  progress: number;
  businessType?: string;
  agentPersonality?: string;
  personalizationCount?: number;
  agentMessage?: string;
  isOnboarding?: boolean;
  totalAnswered?: number;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  language,
  currentBlock,
  progress,
  businessType,
  agentPersonality,
  personalizationCount,
  agentMessage,
  isOnboarding = false,
  totalAnswered = 0
}) => {
  const translations = {
    en: {
      title: "Your Growth Agent",
      subtitle: "I'm here to understand your business and create a personalized growth path",
      currentStep: "We're talking about"
    },
    es: {
      title: "Tu Agente de Crecimiento",
      subtitle: "Estoy aquí para entender tu negocio y crear un camino de crecimiento personalizado",
      currentStep: "Estamos hablando sobre"
    }
  };

  const t = translations[language];

  // Debug current block
  console.log('Current block ID:', currentBlock.id);

  // Dynamic styling based on conversation block - SIMPLIFIED GRADIENTS
  const getSectionStyling = (blockId: string) => {
    switch (blockId) {
      case 'welcome':
        return {
          gradient: 'bg-gradient-to-r from-accent/80 to-accent',
          border: 'border-accent/30',
          icon: Heart,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-accent/20'
        };
      case 'businessType':
        return {
          gradient: 'bg-gradient-to-r from-primary/80 to-primary',
          border: 'border-primary/30',
          icon: Building,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-primary/20'
        };
      case 'currentSituation':
        return {
          gradient: 'bg-gradient-to-r from-success/80 to-success',
          border: 'border-success/30',
          icon: TrendingUp,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-success/20'
        };
      case 'salesReality':
        return {
          gradient: 'bg-gradient-to-r from-warning/80 to-warning',
          border: 'border-warning/30',
          icon: DollarSign,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-warning/20'
        };
      case 'currentChallenges':
        return {
          gradient: 'bg-gradient-to-r from-destructive/80 to-destructive',
          border: 'border-destructive/30',
          icon: AlertTriangle,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-destructive/20'
        };
      case 'vision':
        return {
          gradient: 'bg-gradient-to-r from-secondary/80 to-secondary',
          border: 'border-secondary/30',
          icon: Target,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-secondary/20'
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-muted to-muted/80',
          border: 'border-border',
          icon: Lightbulb,
          iconColor: 'text-white',
          textColor: 'text-white',
          accentGradient: 'bg-muted/20'
        };
    }
  };

  const styling = getSectionStyling(currentBlock.id);
  const SectionIcon = styling.icon;

  return (
    <motion.div
      key={currentBlock.id}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-primary to-primary-glow rounded-2xl p-6 mb-6 border border-primary/30 shadow-float relative overflow-hidden"
    >
      {/* Animated background accent */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-${styling.accentGradient} to-transparent`}
      />
      
      {/* Agent Avatar and Identity */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="relative">
          <div className={`w-14 h-14 bg-gradient-to-br ${styling.iconColor.replace('text-', 'from-')} to-opacity-80 rounded-full flex items-center justify-center shadow-lg border-2 ${styling.border}`}>
            <Bot className="w-7 h-7 text-white" />
          </div>
            <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center shadow-md"
          >
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center"
          >
            <Star className="w-2 h-2 text-white" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-xl font-bold bg-gradient-to-r ${styling.textColor} bg-clip-text text-transparent`}>{t.title}</h1>
            <SectionIcon className={`w-5 h-5 ${styling.iconColor}`} />
          </div>
          <p className={`text-sm ${styling.iconColor.replace('text-', 'text-').replace('-600', '-700')} font-medium`}>{t.subtitle}</p>
        </div>
      </div>

      {/* Dynamic Progress Badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${
          isOnboarding 
            ? 'bg-amber-500/90 border-amber-300/50' 
            : 'bg-emerald-500/90 border-emerald-300/50'
        } text-white text-sm px-4 py-2 rounded-full shadow-lg border-2 font-semibold backdrop-blur-sm`}>
          {isOnboarding
            ? `${totalAnswered}/3 Inicial`
            : `${totalAnswered}/33`
          }
        </div>
        
        <span className="text-xs text-white/80 font-medium">
          {isOnboarding
            ? (language === 'es' ? '3 preguntas para empezar' : '3 questions to start')
            : `${33 - totalAnswered} ${language === 'es' ? 'restantes' : 'remaining'}`
          }
        </span>
      </div>

      {/* Current Block Indicator */}
      <div className="flex items-center gap-2 text-sm relative z-10">
        <SectionIcon className={`w-4 h-4 ${styling.iconColor}`} />
        <span className={`${styling.iconColor.replace('text-', 'text-').replace('-600', '-700')} font-medium`}>{currentBlock.subtitle}</span>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-auto"
        >
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </motion.div>
      </div>

      {/* Agent Message */}
      {agentMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 relative z-10"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed flex-1">
              {agentMessage}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Target, TrendingUp } from 'lucide-react';
import { PremiumStatsCard } from '../PremiumStatsCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { CategoryScore } from '@/types/dashboard';

interface PremiumDashboardHeroProps {
  language: 'en' | 'es';
  welcomeText: string;
  subtitleText: string;
  activeAgentsCount: number;
  completedTasksCount: number;
  overallProgress: number;
  maturityScores?: CategoryScore | null;
  profileData?: any;
  onMaturityCalculatorClick?: () => void;
}

const t = {
    en: {
      aiAssistant: 'AI-Powered Creative Assistant',
      activeAgents: 'Active Assistants',
      completedTasks: 'Completed Today',
      ideaMaturity: 'Idea Maturity',
    },
    es: {
      aiAssistant: 'Asistente Creativo con IA',
      activeAgents: 'Asistentes Activos',
      completedTasks: 'Completadas Hoy',
      ideaMaturity: 'Madurez de Idea',
    }
};

export const PremiumDashboardHero: React.FC<PremiumDashboardHeroProps> = ({
  language,
  welcomeText,
  subtitleText,
  activeAgentsCount,
  completedTasksCount,
  overallProgress,
  maturityScores,
  profileData,
  onMaturityCalculatorClick,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <motion.div 
        className={`relative z-10 ${isMobile ? 'px-4 py-5' : 'px-6 py-5'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-4"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">
              {t[language].aiAssistant}
            </span>
          </motion.div>
          
          <motion.h1 
            className={`font-bold text-white mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {welcomeText}
          </motion.h1>
          
          <motion.p 
            className={`text-white/80 mb-6 ${isMobile ? 'text-base px-4' : 'text-lg max-w-2xl mx-auto'}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {subtitleText}
          </motion.p>

          <motion.div 
            className={`grid gap-4 ${isMobile ? 'grid-cols-1 px-2' : 'grid-cols-3 max-w-2xl mx-auto'}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <PremiumStatsCard
              icon={Users}
              title={t[language].activeAgents}
              value={activeAgentsCount}
              color="text-blue-400"
              bgColor="bg-blue-500/20"
            />
            <PremiumStatsCard
              icon={Target}
              title={t[language].completedTasks}
              value={completedTasksCount}
              color="text-green-400"
              bgColor="bg-green-500/20"
            />
            <PremiumStatsCard
              icon={TrendingUp}
              title={t[language].ideaMaturity}
              value={`${overallProgress}%`}
              color="text-purple-400"
              bgColor="bg-purple-500/20"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};


import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StablePremiumDashboardHeroProps {
  profile: { name: string; email: string };
  maturityScores: {
    ideaValidation: number;
    userExperience: number;
    marketFit: number;
    monetization: number;
  };
  activeAgentsCount: number;
  onMaturityCalculatorClick: () => void;
}

export const StablePremiumDashboardHero: React.FC<StablePremiumDashboardHeroProps> = ({
  profile,
  maturityScores,
  activeAgentsCount,
  onMaturityCalculatorClick
}) => {
  const totalScore = Math.round(
    (maturityScores.ideaValidation + maturityScores.userExperience + 
     maturityScores.marketFit + maturityScores.monetization) / 4
  );

  const getMotivationalMessage = () => {
    if (totalScore < 40) {
      return "¡Perfecto momento para empezar a construir algo increíble!";
    } else if (totalScore < 70) {
      return "¡Ya estás en marcha! Sigamos potenciando tu proyecto";
    } else {
      return "¡Estás haciendo un trabajo increíble! Mantengamos este ritmo";
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <motion.div 
        className="relative z-10 px-6 py-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">
                Tu Espacio Creativo Personal
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              ¡Hola de nuevo, {profile.name}!
            </motion.h1>
            
            <motion.p 
              className="text-white/80 text-lg max-w-2xl mx-auto mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {getMotivationalMessage()}
            </motion.p>

            <motion.p 
              className="text-white/70 text-base max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Sigamos trabajando en tu proyecto creativo con tus asistentes de IA
            </motion.p>
          </div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{activeAgentsCount}</div>
                <div className="text-white/70 text-sm">Asistentes Trabajando Para Vos</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/20 mb-4">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">0</div>
                <div className="text-white/70 text-sm">Tareas Completadas Hoy</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/20 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{totalScore}%</div>
                <div className="text-white/70 text-sm">Nivel de Tu Proyecto</div>
                <Progress value={totalScore} className="mt-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Action */}
          <div className="flex justify-center mt-5">
            <Button 
              onClick={onMaturityCalculatorClick}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              <Target className="w-4 h-4 mr-2" />
              {totalScore < 40 
                ? "Vamos a Evaluar Tu Proyecto" 
                : "Actualizar Mi Evaluación"
              }
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

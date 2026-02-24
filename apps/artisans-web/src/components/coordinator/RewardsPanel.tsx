/**
 * Rewards Panel - Panel de Recompensas y Logros
 * 
 * Muestra el progreso del usuario, niveles desbloqueados,
 * insignias ganadas, y estadísticas de crecimiento.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Target,
  CheckCircle2,
  Crown,
  Sparkles,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LEVEL_PROGRESSION_CONFIG, ACHIEVEMENT_ICONS, calculateLevelProgress } from '@/config/systemConfig';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isUnlocked: boolean;
}

interface UserStats {
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
  completedMissions: number;
  totalMissions: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

interface RewardsPanelProps {
  stats: UserStats;
  language?: 'es' | 'en';
}

// Using centralized level progression and icons from systemConfig
const iconComponentMap: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />
};

export const RewardsPanel: React.FC<RewardsPanelProps> = ({ 
  stats,
  language = 'es'
}) => {
  const translations = {
    es: {
      title: 'Tu Progreso',
      level: 'Nivel',
      xpToNext: 'XP para siguiente nivel',
      completedMissions: 'Misiones Completadas',
      currentStreak: 'Racha Actual',
      longestStreak: 'Mejor Racha',
      achievements: 'Logros Desbloqueados',
      days: 'días',
      locked: 'Bloqueado',
      unlocked: 'Desbloqueado'
    },
    en: {
      title: 'Your Progress',
      level: 'Level',
      xpToNext: 'XP to next level',
      completedMissions: 'Completed Missions',
      currentStreak: 'Current Streak',
      longestStreak: 'Best Streak',
      achievements: 'Unlocked Achievements',
      days: 'days',
      locked: 'Locked',
      unlocked: 'Unlocked'
    }
  };

  const t = translations[language];
  
  // Calculate level info using centralized config
  const levelProgress = calculateLevelProgress(stats.experiencePoints);
  const currentLevelInfo = levelProgress.currentLevel;
  const progressPercentage = levelProgress.progressPercentage;
  const unlockedAchievements = stats.achievements.filter(a => a.isUnlocked);

  return (
    <div className="space-y-6">
      {/* Level and XP Card */}
      <Card className="bg-white rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-charcoal">
            <Crown className="w-5 h-5 text-neon-green-500" />
            {t.level} {stats.level} - {currentLevelInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.xpToNext}</span>
              <span className="font-bold text-neon-green-600">
                {stats.experiencePoints} / {stats.nextLevelXP} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 rounded-lg bg-neon-green-50 border border-neon-green-200"
            >
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-neon-green-600" />
              <p className="text-2xl font-bold text-neon-green-700">
                {stats.completedMissions}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.completedMissions}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200"
            >
              <Flame className="w-6 h-6 mx-auto mb-1 text-amber-600" />
              <p className="text-2xl font-bold text-amber-700">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.currentStreak}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {stats.longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.longestStreak}
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-charcoal">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-green-500" />
              {t.achievements}
            </span>
            <Badge variant="outline" className="bg-neon-green-50 text-neon-green-700 border-neon-green-200">
              {unlockedAchievements.length} / {stats.achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: achievement.isUnlocked ? 1.05 : 1 }}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition-all",
                  achievement.isUnlocked
                    ? "bg-gradient-to-br from-neon-green-50 to-white border-neon-green-200 cursor-pointer"
                    : "bg-muted border-border opacity-50"
                )}
              >
                <motion.div
                  animate={achievement.isUnlocked ? {
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: achievement.isUnlocked ? Infinity : 0,
                    repeatDelay: 3
                  }}
                  className={cn(
                    "w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center",
                    achievement.isUnlocked
                      ? "bg-gradient-to-br from-neon-green-400 to-neon-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {iconComponentMap[achievement.icon] || <Award className="w-6 h-6" />}
                </motion.div>
                
                <h4 className={cn(
                  "font-medium text-sm mb-1",
                  achievement.isUnlocked ? "text-charcoal" : "text-muted-foreground"
                )}>
                  {achievement.title}
                </h4>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {achievement.description}
                </p>

                {achievement.isUnlocked && achievement.unlockedAt && (
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-xs bg-neon-green-50 text-neon-green-700 border-neon-green-200"
                  >
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </Badge>
                )}

                {!achievement.isUnlocked && (
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-xs"
                  >
                    {t.locked}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

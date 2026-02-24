import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Brain, TrendingUp, AlertCircle, Crown, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CategoryScore } from '@/types/dashboard';

interface FloatingMasterAgentProps {
  language: 'en' | 'es';
  maturityScores: CategoryScore | null;
  activeTasksCount: number;
  completedTasksCount: number;
  userActivityDays?: number;
  onStartChat: () => void;
  onViewProgress: () => void;
  onHelp?: () => void;
}

export const FloatingMasterAgent: React.FC<FloatingMasterAgentProps> = ({
  language,
  maturityScores,
  activeTasksCount,
  completedTasksCount,
  userActivityDays = 0,
  onStartChat,
  onViewProgress,
  onHelp
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowProactive, setShouldShowProactive] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Enhanced coaching tips
  const coachingTips = [
    "✨ Soy tu guía personal hacia el éxito",
    "🎯 Cada paso cuenta en tu journey",
    "💡 Tienes todo lo necesario para triunfar",
    "🚀 Juntos construiremos algo increíble"
  ];

  // Rotate tips every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % coachingTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const translations = {
    en: {
      masterAgent: "Master Coach",
      todayMessage: "Today you could advance with 3 priority tasks",
      helpMessage: "Need help with something? I'm here.",
      inactiveMessage: "I notice you haven't been active lately. Want to reorganize your tasks?",
      congratsMessage: "Great progress! You've completed {count} tasks this week.",
      taskSlots: "{active}/15 task slots",
      viewProgress: "View Progress",
      getHelp: "Get Help",
      startSession: "Start Session",
      close: "Close"
    },
    es: {
      masterAgent: "Coach Maestro",
      todayMessage: "Hoy podrías avanzar con 3 tareas prioritarias",
      helpMessage: "¿Necesitas ayuda con algo? Estoy aquí.",
      inactiveMessage: "Noto que no has estado activo últimamente. ¿Quieres reorganizar tus tareas?",
      congratsMessage: "¡Excelente progreso! Has completado {count} tareas esta semana.",
      taskSlots: "{active}/15 espacios de tareas",
      viewProgress: "Ver Progreso",
      getHelp: "Pedir Ayuda",
      startSession: "Iniciar Sesión",
      close: "Cerrar"
    }
  };

  const t = translations[language];

  // Proactive message logic
  useEffect(() => {
    if (userActivityDays >= 3) {
      setShouldShowProactive(true);
    } else if (completedTasksCount > 0 && completedTasksCount % 5 === 0) {
      setShouldShowProactive(true);
    }
  }, [userActivityDays, completedTasksCount]);

  const getContextualMessage = () => {
    if (userActivityDays >= 3) {
      return "💭 Te he extrañado. ¿Retomamos tu camino al éxito?";
    }
    if (completedTasksCount > 0 && completedTasksCount % 5 === 0) {
      return `🎉 ¡Increíble! ${completedTasksCount} tareas completadas. Sigamos el momentum.`;
    }
    if (activeTasksCount >= 12) {
      return "⚡ Tienes mucha energía! Te ayudo a priorizar para maximizar resultados.";
    }
    return coachingTips[currentTip];
  };

  const getMoodColor = () => {
    if (userActivityDays >= 3) return "bg-destructive hover:bg-destructive/90";
    if (completedTasksCount > 0 && completedTasksCount % 5 === 0) return "bg-success hover:bg-success/90";
    if (activeTasksCount >= 12) return "bg-warning hover:bg-warning/90";
    return "bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90";
  };

  const getIconForStatus = () => {
    if (userActivityDays >= 3) return <AlertCircle className="h-4 w-4" />;
    if (completedTasksCount > 0) return <TrendingUp className="h-4 w-4" />;
    return <Brain className="h-4 w-4" />;
  };

  return (
    <div className="floating-agent-container fixed bottom-6 right-6 z-[10000]">
      {/* Floating Button - Enhanced Visibility */}
      {!isExpanded && (
        <div className="relative">
          {/* Permanent pulse background */}
          <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30" />
          
          <Button
            onClick={() => setIsExpanded(true)}
            className={`relative rounded-full h-20 w-20 ${getMoodColor()} hover:scale-125 transition-all duration-300 shadow-2xl ring-4 ring-background/50 animate-float`}
            size="icon"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            
            <MessageCircle className="h-9 w-9 text-white relative z-10" />
            
            {shouldShowProactive && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full animate-pulse ring-2 ring-background z-20" />
            )}
            
            {/* Always visible indicator */}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full ring-2 ring-background z-20 animate-pulse" />
          </Button>
        </div>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <Card className="w-80 neumorphic animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={`h-12 w-12 ${getMoodColor()} shadow-md animate-glow-pulse`}>
                  <AvatarFallback className="text-white text-xl">
                    🧙‍♂️
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{t.masterAgent}</CardTitle>
                  <Badge variant="secondary" className="text-xs shadow-neumorphic-inset">
                    {t.taskSlots.replace('{active}', activeTasksCount.toString())}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Enhanced Contextual Message */}
            <div className="neumorphic-inset rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-display font-semibold text-foreground text-sm">Tu Maestro Artesano</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {getContextualMessage()}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-success">{completedTasksCount}</div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-primary">{activeTasksCount}</div>
                <div className="text-xs text-muted-foreground">Activas</div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onStartChat} 
                className="w-full btn-capsule" 
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversar con el Maestro
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={onViewProgress} variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Progreso
                </Button>
                <Button onClick={onHelp} variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-1" />
                  Guía
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMasterCoordinator } from '@/hooks/useMasterCoordinator';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  MessageCircle, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Users,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Play,
  TrendingUp,
  Clock,
  Zap,
  Star,
  Crown,
  Bot
} from 'lucide-react';
import { IntelligentRecommendationCard } from './IntelligentRecommendationCard';
import { ProgressJourneyVisualization } from './ProgressJourneyVisualization';
import { ContextualCoordinatorChat } from './ContextualCoordinatorChat';
import { SmartQuickActions } from './SmartQuickActions';

interface MasterCoordinatorCommandCenterProps {
  language: 'en' | 'es';
  onBack: () => void;
}

export const MasterCoordinatorCommandCenter: React.FC<MasterCoordinatorCommandCenterProps> = ({
  language,
  onBack
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatExpanded, setChatExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'progress' | 'chat'>('overview');

  const { context, loading: profileLoading } = useUnifiedUserData();
  const currentScores = context?.taskGenerationContext?.maturityScores;
  const scoresLoading = profileLoading;
  
  const {
    coordinatorTasks,
    deliverables,
    coordinatorMessage,
    nextUnlockedTask,
    startTaskJourney,
    loading: coordinatorLoading
  } = useMasterCoordinator();

  const translations = {
    es: {
      title: 'Tu Coordinador Personal',
      subtitle: 'Te ayudo a hacer crecer tu negocio artesanal paso a paso',
      myProgress: 'Cómo Vas',
      recommendedActions: 'Pasos Recomendados',
      quickActions: 'Acciones Rápidas',
      chatWithCoordinator: 'Conversemos',
      overview: 'Resumen',
      tasks: 'Mis Tareas',
      progress: 'Mi Avance',
      chat: 'Chat',
      greetingMessage: '¡Hola! ¿Listo para trabajar juntos en tu negocio?',
      contextualMessage: 'Vi tu perfil y tengo algunas ideas para ayudarte a crecer.',
      viewDetails: 'Ver Más',
      startNow: 'Empezar',
      discussThis: 'Hablemos de esto'
    }
  };

  const t = translations['es']; // Solo español para plataforma artesanal

  // Calculate metrics
  const completedTasks = coordinatorTasks.filter(task => 
    task.steps.every(step => step.isCompleted)
  ).length;
  
  const totalTasks = coordinatorTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const unlockedTasks = coordinatorTasks.filter(task => task.isUnlocked);
  const nextRecommendations = unlockedTasks.slice(0, 3);

  const handleTaskStart = async (taskId: string) => {
    const success = await startTaskJourney(taskId);
    if (success) {
      navigate(`/dashboard/tasks/${taskId}`);
    }
  };

  const handleOpenChat = () => {
    setChatExpanded(true);
    setActiveView('chat');
  };

  if (scoresLoading || profileLoading || coordinatorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <Brain className="w-16 h-16 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              Preparando tu espacio...
            </h2>
            <p className="text-muted-foreground">
              Estamos organizando tus herramientas
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header with intelligent message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {t.title}
                      <Sparkles className="w-5 h-5 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">{t.subtitle}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
              </div>
              
              {/* Coordinator's intelligent message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary mb-1">Master Coordinator</p>
                    <p className="text-sm leading-relaxed">
                      {typeof coordinatorMessage === 'object' && coordinatorMessage?.message 
                        ? coordinatorMessage.message 
                        : typeof coordinatorMessage === 'string' 
                        ? coordinatorMessage 
                        : t.contextualMessage}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleOpenChat}
                      className="mt-2 text-primary hover:bg-primary/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t.discussThis}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-1 p-1 bg-muted rounded-lg w-fit">
            {[
              { id: 'overview', label: t.overview, icon: Target },
              { id: 'tasks', label: t.tasks, icon: CheckCircle2 },
              { id: 'progress', label: t.progress, icon: TrendingUp },
              { id: 'chat', label: t.chat, icon: MessageCircle }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeView === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Progress Overview */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {t.myProgress}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressJourneyVisualization 
                    tasks={coordinatorTasks}
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                    progressPercentage={progressPercentage}
                  />
                </CardContent>
              </Card>

              {/* Intelligent Recommendations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    {t.recommendedActions}
                  </h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {nextRecommendations.length} available
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {nextRecommendations.map((task, index) => (
                    <IntelligentRecommendationCard
                      key={task.id}
                      task={task}
                      onStart={() => handleTaskStart(task.id)}
                      onDiscuss={() => handleOpenChat()}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Smart Task Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coordinatorTasks.map((task, index) => (
                  <IntelligentRecommendationCard
                    key={task.id}
                    task={task}
                    onStart={() => handleTaskStart(task.id)}
                    onDiscuss={() => handleOpenChat()}
                    delay={index * 0.05}
                    showFullDetails
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProgressJourneyVisualization 
                tasks={coordinatorTasks}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
                progressPercentage={progressPercentage}
                showDetailedView
              />
            </motion.div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-[600px]"
            >
              <ContextualCoordinatorChat 
                language={language}
                tasks={coordinatorTasks}
                nextTask={nextUnlockedTask}
                onTaskStart={handleTaskStart}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <SmartQuickActions 
            language={language}
            nextTask={nextUnlockedTask}
            onTaskStart={handleTaskStart}
            onOpenChat={handleOpenChat}
          />
        </motion.div>

      </div>
    </div>
  );
};
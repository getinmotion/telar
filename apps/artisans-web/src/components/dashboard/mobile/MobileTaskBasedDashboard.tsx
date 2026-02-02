import React, { useMemo } from 'react';
import { Agent, CategoryScore } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  Target,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOptimizedRecommendedTasks } from '@/hooks/useOptimizedRecommendedTasks';
import { mapToLegacyLanguage } from '@/utils/languageMapper';
import { MobileTaskCard } from './MobileTaskCard';
import { MobileStatsCard } from './MobileStatsCard';
import { MobileCollapsibleSection } from './MobileCollapsibleSection';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';
import { AgentIcon } from '../AgentIcon';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

interface MobileTaskBasedDashboardProps {
  agents: Agent[];
  maturityScores: CategoryScore | null;
  profileData: any | null;
  onSelectAgent: (id: string) => void;
  onMaturityCalculatorClick: () => void;
}

export const MobileTaskBasedDashboard: React.FC<MobileTaskBasedDashboardProps> = ({
  agents,
  maturityScores,
  profileData,
  onSelectAgent,
  onMaturityCalculatorClick
}) => {
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const allAgentIds = useMemo(() => culturalAgentsDatabase.map(agent => agent.id), []);
  const { tasks, loading, markTaskCompleted } = useOptimizedRecommendedTasks(maturityScores, profileData, allAgentIds);
  const userLocalStorage = useUserLocalStorage();

  const t = {
    en: {
      welcomeTitle: "Welcome to Your Creative Workspace",
      welcomeSubtitle: "Ready to bring your creative project to life?",
      priorityTasks: "Priority Tasks",
      activeAgents: "Active AI Assistants",
      quickActions: "Quick Actions",
      projectProgress: "Project Progress",
      retakeAssessment: "Retake Assessment",
      noTasks: "No tasks yet",
      noTasksDesc: "Complete your maturity assessment to get personalized tasks"
    },
    es: {
      welcomeTitle: "Bienvenido a tu Espacio Creativo",
      welcomeSubtitle: "¿Listo para dar vida a tu proyecto creativo?",
      priorityTasks: "Tareas Prioritarias",
      activeAgents: "Asistentes IA Activos",
      quickActions: "Acciones Rápidas",
      projectProgress: "Progreso del Proyecto",
      retakeAssessment: "Repetir Evaluación",
      noTasks: "Sin tareas aún",
      noTasksDesc: "Completa tu evaluación de madurez para obtener tareas personalizadas"
    }
  };

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const overallProgress = maturityScores 
    ? Math.round((maturityScores.ideaValidation + maturityScores.userExperience + maturityScores.marketFit + maturityScores.monetization) / 4)
    : 0;

  const handleStartTask = (task: any) => {
    userLocalStorage.setItem(`agent-${task.agentId}-prompt`, task.prompt);
    userLocalStorage.setItem(`agent-${task.agentId}-task`, JSON.stringify({
      title: task.title,
      description: task.description
    }));
    onSelectAgent(task.agentId);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <motion.div 
        className="text-center py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          {t[compatibleLanguage].welcomeTitle}
        </h1>
        <p className="text-white/80">
          {t[compatibleLanguage].welcomeSubtitle}
        </p>
      </motion.div>

      {/* Project Progress - Always visible on mobile */}
      {maturityScores && (
        <MobileStatsCard
          title={t[compatibleLanguage].projectProgress}
          icon={TrendingUp}
          iconColor="text-green-400"
          value={overallProgress}
          progress={overallProgress}
          items={[
            { label: "Validación de Idea", value: maturityScores.ideaValidation },
            { label: "Experiencia Usuario", value: maturityScores.userExperience },
            { label: "Ajuste al Mercado", value: maturityScores.marketFit },
            { label: "Monetización", value: maturityScores.monetization }
          ]}
        />
      )}

      {/* Priority Tasks - Collapsible */}
      <MobileCollapsibleSection
        title={t[compatibleLanguage].priorityTasks}
        defaultOpen={true}
        badge={tasks.length > 0 ? `${tasks.length} tareas` : undefined}
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-white/60 text-sm">Generando recomendaciones...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">{t[compatibleLanguage].noTasks}</h3>
            <p className="text-white/60 text-sm mb-4">{t[compatibleLanguage].noTasksDesc}</p>
            <Button onClick={onMaturityCalculatorClick} className="bg-purple-600 hover:bg-purple-700" size="sm">
              {t[compatibleLanguage].retakeAssessment}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <MobileTaskCard
                key={task.id}
                task={task}
                index={index}
                onStartTask={handleStartTask}
                language={compatibleLanguage}
              />
            ))}
          </div>
        )}
      </MobileCollapsibleSection>

      {/* Active Agents - Collapsible */}
      <MobileCollapsibleSection
        title={t[compatibleLanguage].activeAgents}
        badge={activeAgents.length > 0 ? `${activeAgents.length}` : undefined}
      >
        {activeAgents.length === 0 ? (
          <p className="text-white/60 text-center py-4 text-sm">No active agents yet</p>
        ) : (
          <div className="space-y-3">
            {activeAgents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center text-white text-sm flex-shrink-0`}>
                    <AgentIcon icon={agent.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white text-sm truncate">{agent.name}</div>
                    <div className="text-white/50 text-xs">{agent.activeTasks} tareas activas</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectAgent(agent.id)}
                  className="text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                >
                  Ver
                </Button>
              </div>
            ))}
          </div>
        )}
      </MobileCollapsibleSection>

      {/* Quick Actions - Collapsible */}
      <MobileCollapsibleSection title={t[compatibleLanguage].quickActions}>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
            onClick={onMaturityCalculatorClick}
          >
            <TrendingUp className="w-4 h-4 mr-3" />
            {t[compatibleLanguage].retakeAssessment}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Calendar className="w-4 h-4 mr-3" />
            Programar Sesión
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <CheckCircle2 className="w-4 h-4 mr-3" />
            Ver Progreso
          </Button>
        </div>
      </MobileCollapsibleSection>
    </div>
  );
};

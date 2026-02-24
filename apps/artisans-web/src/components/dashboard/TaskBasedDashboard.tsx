import React, { useMemo } from 'react';
import { Agent, CategoryScore } from '@/types/dashboard';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  Users, 
  Target,
  Zap,
  TrendingUp,
  Calendar,
  ArrowRight,
  Flame,
  FileText,
  type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOptimizedRecommendedTasks } from '@/hooks/useOptimizedRecommendedTasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTaskBasedDashboard } from './mobile/MobileTaskBasedDashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';
import { AgentIcon } from './AgentIcon';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

interface TaskBasedDashboardProps {
  agents: Agent[];
  maturityScores: CategoryScore | null;
  onSelectAgent: (id: string) => void;
  onMaturityCalculatorClick: () => void;
  profileData: any | null;
}

export const TaskBasedDashboard: React.FC<TaskBasedDashboardProps> = ({
  agents,
  maturityScores,
  onSelectAgent,
  onMaturityCalculatorClick,
  profileData
}) => {
  const { t, language } = useTranslations();
  const allAgentIds = useMemo(() => culturalAgentsDatabase.map(agent => agent.id), []);
  const { tasks, loading, markTaskCompleted } = useOptimizedRecommendedTasks(maturityScores, profileData, allAgentIds);
  const isMobile = useIsMobile();
  const userLocalStorage = useUserLocalStorage();

  // Use mobile version on small screens
  if (isMobile) {
    return (
      <MobileTaskBasedDashboard
        agents={agents}
        maturityScores={maturityScores}
        profileData={profileData}
        onSelectAgent={onSelectAgent}
        onMaturityCalculatorClick={onMaturityCalculatorClick}
      />
    );
  }


  const activeAgents = agents.filter(agent => agent.status === 'active');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityIcon = (priority: string): LucideIcon => {
    switch (priority) {
      case 'high': return Flame;
      case 'medium': return Zap;
      case 'low': return FileText;
      default: return FileText;
    }
  };

  const handleStartTask = (task: any) => {
    userLocalStorage.setItem(`agent-${task.agentId}-prompt`, task.prompt);
    userLocalStorage.setItem(`agent-${task.agentId}-task`, JSON.stringify({
      title: task.title,
      description: task.description
    }));
    onSelectAgent(task.agentId);
  };

  const overallProgress = maturityScores 
    ? Math.round((maturityScores.ideaValidation + maturityScores.userExperience + maturityScores.marketFit + maturityScores.monetization) / 4)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          {t.dashboard.welcomeTitle}
        </h1>
        <p className="text-xl text-white/80">
          {t.dashboard.welcomeSubtitle}
        </p>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Priority Tasks - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Target className="w-6 h-6 text-purple-400" />
                {t.dashboard.priorityTasks}
                {tasks.length > 0 && (
                  <Badge className="bg-purple-600 text-white">
                    {tasks.length} {t.tasks.tasksLabel}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">{t.ui.generatingRecommendations}</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">{t.dashboard.noTasks}</h3>
                  <p className="text-white/60 mb-6">{t.dashboard.noTasksDesc}</p>
                  <Button onClick={onMaturityCalculatorClick} className="bg-purple-600 hover:bg-purple-700">
                    {t.dashboard.retakeAssessment}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {React.createElement(getPriorityIcon(task.priority), { className: "w-5 h-5 text-white" })}
                            <h4 className="font-semibold text-white text-lg">{task.title}</h4>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {t.missionsDashboard[task.priority as keyof typeof t.missionsDashboard]}
                            </Badge>
                            {task.category && (
                              <Badge variant="outline" className="text-white/70 border-white/30">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/80 text-sm mb-4 leading-relaxed">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                            <span>👤 {task.agentName}</span>
                            <span>⏱️ {task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                          {t.dashboard.recommendedAssistant}: <span className="text-white font-medium">{task.agentName}</span>
                        </div>
                        <Button
                          onClick={() => handleStartTask(task)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t.dashboard.startWithAgent} {task.agentName}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Project Progress */}
          {maturityScores && (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  {t.dashboard.projectProgress}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white mb-2">{overallProgress}%</div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>{t.maturityCalculator.ideaValidation}</span>
                    <span>{maturityScores.ideaValidation}%</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>{t.maturityCalculator.userExperience}</span>
                    <span>{maturityScores.userExperience}%</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>{t.maturityCalculator.marketFit}</span>
                    <span>{maturityScores.marketFit}%</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>{t.maturityCalculator.monetization}</span>
                    <span>{maturityScores.monetization}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Agents */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users className="w-6 h-6 text-blue-400" />
                {t.dashboard.activeAgents}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAgents.length === 0 ? (
                <p className="text-white/60 text-center py-4">{t.dashboard.noActiveAgents}</p>
              ) : (
                <div className="space-y-3">
                  {activeAgents.slice(0, 3).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center text-white text-sm`}>
                          <AgentIcon icon={agent.icon} />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{agent.name}</div>
                          <div className="text-white/50 text-xs">{agent.activeTasks} {t.dashboard.activeTasks}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectAgent(agent.id)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        {t.dashboard.viewAgent}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Zap className="w-6 h-6 text-yellow-400" />
                {t.dashboard.quickActions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={onMaturityCalculatorClick}
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  {t.dashboard.retakeAssessment}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  {t.dashboard.scheduleSession}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <CheckCircle2 className="w-4 h-4 mr-3" />
                  {t.dashboard.viewProgress}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

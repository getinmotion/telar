
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRobustDashboardData } from '@/hooks/useRobustDashboardData';
import { StablePremiumDashboardHero } from './StablePremiumDashboardHero';
import { SafeTaskManagementInterface } from './SafeTaskManagementInterface';
import { RobustModernAgentsGrid } from './RobustModernAgentsGrid';
import { PremiumSidebar } from './PremiumSidebar';
import { DashboardBackground } from './DashboardBackground';
import { MasterAgentInterface } from './MasterAgentInterface';
import { MaturityProgressIndicator } from './MaturityProgressIndicator';
import { IntelligentTaskSuggestions } from './IntelligentTaskSuggestions';
// FloatingMasterAgent and TaskLimitManager are now global components
import { useAgentTasks } from '@/hooks/useAgentTasks';

export const RobustPremiumDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, maturityScores, userAgents, loading, error } = useRobustDashboardData();
  const { tasks, createTask } = useAgentTasks();
  const [showMasterChat, setShowMasterChat] = useState(false);

  console.log('RobustPremiumDashboard: Rendering', {
    user: user?.email,
    loading,
    error
  });

  const handleSelectAgent = (agentId: string) => {
    console.log('Selecting agent:', agentId);
    navigate(`/dashboard/agent/${agentId}`);
  };

  const handleMaturityCalculator = () => {
    navigate('/maturity-calculator');
  };


  const handleMasterAgentChat = () => {
    setShowMasterChat(true);
    // Navigate to master agent chat
    navigate('/dashboard/agent/master-coordinator');
  };

  const handleViewProgress = () => {
    navigate('/dashboard/progress');
  };

  const handlePauseTask = (taskId: string) => {
    // Update task status to paused
    console.log('Pausing task:', taskId);
  };

  const handleResumeTask = (taskId: string) => {
    // Update task status to active
    console.log('Resuming task:', taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    // Delete task
    console.log('Deleting task:', taskId);
  };

  const handleMasterHelp = () => {
    console.log('Master agent help requested');
  };

  const handleAcceptTaskSuggestion = (suggestion: any) => {
    // Create new task from suggestion
    createTask({
      title: suggestion.title,
      description: suggestion.description,
      agent_id: 'master-coordinator',
      priority: suggestion.priority === 'high' ? 1 : suggestion.priority === 'medium' ? 2 : 3,
      relevance: suggestion.priority
    });
  };

  const handleIgnoreTaskSuggestion = (suggestionId: string) => {
    console.log('Ignored suggestion:', suggestionId);
  };

  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const activeTasksCount = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length;

  if (loading) {
    return (
      <DashboardBackground>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto mb-4"></div>
              <p className="text-white text-lg">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </DashboardBackground>
    );
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        {/* Hero Section */}
        <StablePremiumDashboardHero 
          profile={profile}
          maturityScores={maturityScores}
          activeAgentsCount={userAgents.filter(ua => ua.is_enabled).length}
          onMaturityCalculatorClick={handleMaturityCalculator}
        />

        {/* Main Content Grid - Master Agent First Layout */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
            
            {/* Master Agent - Prominently Featured */}
            <div className="col-span-12 mb-6">
              <MasterAgentInterface
                language="es"
                maturityScores={maturityScores}
                activeTasksCount={activeTasksCount}
                completedTasksCount={completedTasksCount}
                onStartChat={handleMasterAgentChat}
                onViewProgress={handleViewProgress}
              />
            </div>

            {/* Task Limit Manager is now global - remove local version */}

            {/* Full Width - Priority Tasks Section */}
            <div className="col-span-12 space-y-6">
              {/* Task Management - Now Full Width and Prominent */}
              <SafeTaskManagementInterface 
                language="es"
                maturityScores={maturityScores}
                profileData={profile}
                enabledAgents={userAgents.filter(ua => ua.is_enabled).map(ua => ua.agent_id)}
                onSelectAgent={handleSelectAgent}
              />
            </div>

            {/* Three-Column Layout for Progress, Suggestions, and Agents */}
            <div className="col-span-12 lg:col-span-4">
              <MaturityProgressIndicator
                maturityScores={maturityScores}
                completedTasksCount={completedTasksCount}
                totalTasksCount={tasks.length}
                language="es"
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <IntelligentTaskSuggestions
                maturityScores={maturityScores}
                completedTasks={tasks.filter(t => t.status === 'completed').map(t => t.id)}
                language="es"
                onAcceptSuggestion={handleAcceptTaskSuggestion}
                onIgnoreSuggestion={handleIgnoreTaskSuggestion}
              />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <PremiumSidebar 
                profile={profile}
                maturityScores={maturityScores}
                language="es"
              />
            </div>

            {/* Agents Grid - Now Secondary */}
            <div className="col-span-12 space-y-6">
              <RobustModernAgentsGrid 
                userAgents={userAgents}
                maturityScores={maturityScores}
                onSelectAgent={handleSelectAgent}
                language="es"
              />
            </div>
          </div>
        </div>
        
        {/* Floating Master Agent is now global - remove local version */}
      </div>
    </DashboardBackground>
  );
};

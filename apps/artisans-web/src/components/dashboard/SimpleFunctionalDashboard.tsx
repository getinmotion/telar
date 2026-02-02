
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SafeAgentIcon } from './SafeAgentIcon';
import { useRobustDashboardData } from '@/hooks/useRobustDashboardData';
import { simpleAgentsDatabase, getPriorityAgents } from '@/data/simplifiedAgentsDatabase';
import { DashboardBackground } from './DashboardBackground';
import { Zap, BarChart3, Settings, Users } from 'lucide-react';

export const SimpleFunctionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, maturityScores, userAgents, loading } = useRobustDashboardData();
  
  console.log('SimpleFunctionalDashboard: Rendering with data:', {
    profile,
    maturityScores,
    userAgentsCount: userAgents.length,
    loading
  });

  const priorityAgents = getPriorityAgents();
  const activeAgentsCount = userAgents.filter(ua => ua.is_enabled).length;
  const totalScore = Math.round(
    (maturityScores.ideaValidation + maturityScores.userExperience + 
     maturityScores.marketFit + maturityScores.monetization) / 4
  );

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
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header de Bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Hola, {profile.name}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            Tu espacio creativo está listo para trabajar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Puntuación General</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalScore}%</div>
              <Progress value={totalScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Agentes Activos</CardTitle>
              <Zap className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeAgentsCount}</div>
              <p className="text-xs text-white/70">de {simpleAgentsDatabase.length} disponibles</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Idea Validation</CardTitle>
              <Settings className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{maturityScores.ideaValidation}%</div>
              <Progress value={maturityScores.ideaValidation} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Market Fit</CardTitle>
              <Users className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{maturityScores.marketFit}%</div>
              <Progress value={maturityScores.marketFit} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Agentes Recomendados */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-300" />
              Misiones Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityAgents.map(agent => {
                const userAgent = userAgents.find(ua => ua.agent_id === agent.id);
                const isActive = userAgent?.is_enabled || false;
                
                return (
                  <div 
                    key={agent.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-lg ${agent.color}`}>
                        <SafeAgentIcon iconName={agent.iconName} className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{agent.name}</h3>
                        <p className="text-sm text-white/70 mb-3">{agent.description}</p>
                        <Button 
                          size="sm" 
                          variant={isActive ? "default" : "outline"}
                          className="w-full"
                          onClick={() => navigate(`/agent-details/${agent.id}`)}
                        >
                          {isActive ? "Usar Agente" : "Activar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Evaluación de Madurez</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Actualiza tu evaluación para obtener recomendaciones personalizadas
              </p>
              <Button 
                onClick={() => navigate('/maturity-calculator')}
                className="w-full"
              >
                Hacer Evaluación
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Gestionar Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 mb-4">
                Activa o desactiva agentes según tus necesidades
              </p>
              <Button 
                onClick={() => navigate('/agent-manager')}
                variant="outline"
                className="w-full"
              >
                Gestionar Agentes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardBackground>
  );
};

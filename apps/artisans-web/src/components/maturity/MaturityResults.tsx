
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, CheckCircle2, Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  recommended: boolean;
}

interface MaturityResultsProps {
  language: 'en' | 'es';
  score: number;
  profileType?: 'idea' | 'solo' | 'team';
  agents: Agent[];
}

const getRecommendationText = (language: 'en' | 'es', score: number, profileType?: 'idea' | 'solo' | 'team') => {
  if (language === 'en') {
    if (profileType === 'idea') {
      return "Based on your responses, you're at the early stages of your project. We recommend these agents to help you define your vision and start building a solid foundation.";
    } else if (profileType === 'solo') {
      return "You're making progress as a solo creator! These agents can help you streamline your workflows and free up your time for creative work.";
    } else if (profileType === 'team') {
      return "Managing a team requires coordination. These agents can help you organize your team's workflow and improve collaboration.";
    } else {
      return "Based on your assessment, here are the agents we recommend to help you move forward with your project.";
    }
  } else {
    if (profileType === 'idea') {
      return "Según tus respuestas, estás en las primeras etapas de tu proyecto. Recomendamos estos agentes para ayudarte a definir tu visión y comenzar a construir una base sólida.";
    } else if (profileType === 'solo') {
      return "¡Estás avanzando como creador independiente! Estos agentes pueden ayudarte a optimizar tus flujos de trabajo y liberar tu tiempo para el trabajo creativo.";
    } else if (profileType === 'team') {
      return "Gestionar un equipo requiere coordinación. Estos agentes pueden ayudarte a organizar el flujo de trabajo de tu equipo y mejorar la colaboración.";
    } else {
      return "Según tu evaluación, estos son los agentes que recomendamos para ayudarte a avanzar con tu proyecto.";
    }
  }
};

const getLevelText = (language: 'en' | 'es', score: number) => {
  if (score < 40) {
    return language === 'en' ? 'Early Stage' : 'Etapa Inicial';
  } else if (score < 70) {
    return language === 'en' ? 'Developing' : 'En Desarrollo';
  } else {
    return language === 'en' ? 'Established' : 'Establecido';
  }
};

export const MaturityResults: React.FC<MaturityResultsProps> = ({ 
  language, 
  score, 
  profileType,
  agents
}) => {
  const recommendedAgents = agents.filter(agent => agent.recommended);
  const otherAgents = agents.filter(agent => !agent.recommended);
  
  const levelText = getLevelText(language, score);
  const recommendationText = getRecommendationText(language, score, profileType);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8">
      {/* Celebratory Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-block mb-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-neon-green-400 to-neon-green-700 rounded-full flex items-center justify-center shadow-glow-intense">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 text-charcoal">
          {language === 'en' ? 'Your Maturity Assessment Results' : 'Resultados de tu Evaluación'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {recommendationText}
        </p>
      </div>
      
      {/* Score Card */}
      <Card variant="elevated" className="overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-br from-neon-green-400 to-neon-green-700 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">
            {language === 'en' ? 'Artisan Maturity Score' : 'Puntuación de Madurez Artesanal'}
          </h3>
        </div>
        <CardContent className="p-8">
          {/* Progress Ring */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            <div className="flex-shrink-0">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#EAEAEA" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#B8FF5C"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(184, 255, 92, 0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-160px' }}>
                <div className="text-center">
                  <p className="text-5xl font-bold text-neon-green">{score}%</p>
                  <p className="text-sm text-gray-500 mt-1">{language === 'en' ? 'Score' : 'Puntuación'}</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Badge className="bg-neon-green text-deep-green font-bold text-lg px-6 py-2 mb-4">
                {levelText}
              </Badge>
              <p className="text-gray-600 text-lg">
                {language === 'en' ? 'Based on your assessment' : 'Basado en tu evaluación'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommended Agents */}
      <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
        <h3 className="text-2xl font-bold mb-6 flex items-center text-charcoal">
          <Zap className="mr-3 h-6 w-6 text-neon-green" />
          {language === 'en' ? 'Recommended Agents' : 'Agentes Recomendados'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedAgents.map((agent, index) => (
            <Card 
              key={agent.id} 
              variant="elevated"
              className="animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg text-charcoal">{agent.name}</h4>
                      <Badge className="bg-neon-green-100 text-neon-green-700 flex items-center border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {language === 'en' ? 'Recommended' : 'Recomendado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{agent.description}</p>
                    <Button size="sm" variant="neon" className="w-full">
                      {language === 'en' ? 'Activate Agent' : 'Activar Agente'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Other Agents */}
      {otherAgents.length > 0 && (
        <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-2xl font-bold mb-6 text-charcoal">
            {language === 'en' ? 'Other Available Agents' : 'Otros Agentes Disponibles'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherAgents.map((agent, index) => (
              <Card 
                key={agent.id} 
                variant="elevated"
                className="animate-fade-in hover:scale-[1.02] transition-all"
                style={{animationDelay: `${(index * 0.05) + 0.4}s`}}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-charcoal">{agent.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                  <Button size="sm" variant="outline" className="w-full border-neon-green-200 text-neon-green-700 hover:bg-neon-green-50">
                    {language === 'en' ? 'Activate' : 'Activar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

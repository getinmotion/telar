import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryScore } from '@/types/dashboard';
import { Lightbulb, Plus, ArrowRight, CheckCircle, Target } from 'lucide-react';

interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: keyof CategoryScore;
}

interface IntelligentTaskSuggestionsProps {
  maturityScores: CategoryScore | null;
  completedTasks: string[];
  language: 'en' | 'es';
  onAcceptSuggestion: (suggestion: TaskSuggestion) => void;
  onIgnoreSuggestion: (suggestionId: string) => void;
}

export const IntelligentTaskSuggestions: React.FC<IntelligentTaskSuggestionsProps> = ({
  maturityScores,
  completedTasks,
  language,
  onAcceptSuggestion,
  onIgnoreSuggestion
}) => {
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<string[]>([]);

  const translations = {
    en: {
      smartSuggestions: 'Smart Suggestions',
      subtitle: 'Based on your progress, here are your next recommended tasks',
      whyThisTask: 'Why this task?',
      accept: 'Add Task',
      ignore: 'Not now',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      estimatedTime: 'Estimated time',
      noSuggestions: 'Great work! Complete some current tasks to unlock new suggestions.',
      categories: {
        ideaValidation: 'Idea Validation',
        userExperience: 'User Experience',
        marketFit: 'Market Fit',
        monetization: 'Monetization'
      }
    },
    es: {
      smartSuggestions: 'Sugerencias Inteligentes',
      subtitle: 'Basado en tu progreso, estas son tus próximas tareas recomendadas',
      whyThisTask: '¿Por qué esta tarea?',
      accept: 'Agregar Tarea',
      ignore: 'Ahora no',
      highPriority: 'Prioridad Alta',
      mediumPriority: 'Prioridad Media',
      lowPriority: 'Prioridad Baja',
      estimatedTime: 'Tiempo estimado',
      noSuggestions: '¡Buen trabajo! Completa algunas tareas actuales para desbloquear nuevas sugerencias.',
      categories: {
        ideaValidation: 'Validación de Idea',
        userExperience: 'Experiencia de Usuario',
        marketFit: 'Encaje de Mercado',
        monetization: 'Monetización'
      }
    }
  };

  const t = translations[language];

  const generateIntelligentSuggestions = (): TaskSuggestion[] => {
    if (!maturityScores) return [];

    const suggestions: TaskSuggestion[] = [];

    // Monetization suggestions
    if (maturityScores.monetization < 40) {
      suggestions.push({
        id: 'setup-pricing-strategy',
        title: language === 'es' ? 'Configurar Estrategia de Precios' : 'Set Up Pricing Strategy',
        description: language === 'es' 
          ? 'Define precios competitivos basados en costos y valor de mercado'
          : 'Define competitive prices based on costs and market value',
        reason: language === 'es'
          ? 'Tu puntuación de monetización es baja. Necesitas optimizar tus precios.'
          : 'Your monetization score is low. You need to optimize your pricing.',
        priority: 'high',
        estimatedTime: language === 'es' ? '2-3 horas' : '2-3 hours',
        category: 'monetization'
      });
    }

    // Market fit suggestions
    if (maturityScores.marketFit < 50) {
      suggestions.push({
        id: 'validate-target-audience',
        title: language === 'es' ? 'Validar Audiencia Objetivo' : 'Validate Target Audience',
        description: language === 'es'
          ? 'Identifica y valida tu cliente ideal con research de mercado'
          : 'Identify and validate your ideal customer with market research',
        reason: language === 'es'
          ? 'Necesitas mejorar tu encaje de mercado para crecer sosteniblemente.'
          : 'You need to improve your market fit to grow sustainably.',
        priority: 'high',
        estimatedTime: language === 'es' ? '3-4 horas' : '3-4 hours',
        category: 'marketFit'
      });
    }

    // User experience suggestions
    if (maturityScores.userExperience < 60) {
      suggestions.push({
        id: 'improve-customer-journey',
        title: language === 'es' ? 'Mejorar Experiencia del Cliente' : 'Improve Customer Experience',
        description: language === 'es'
          ? 'Optimiza cada punto de contacto con tus clientes'
          : 'Optimize every touchpoint with your customers',
        reason: language === 'es'
          ? 'La experiencia de usuario impacta directamente en las ventas repetidas.'
          : 'User experience directly impacts repeat sales.',
        priority: 'medium',
        estimatedTime: language === 'es' ? '1-2 horas' : '1-2 hours',
        category: 'userExperience'
      });
    }

    // Idea validation suggestions
    if (maturityScores.ideaValidation < 70) {
      suggestions.push({
        id: 'test-new-concepts',
        title: language === 'es' ? 'Probar Nuevos Conceptos' : 'Test New Concepts',
        description: language === 'es'
          ? 'Valida nuevas ideas de productos o servicios con métodos lean'
          : 'Validate new product or service ideas with lean methods',
        reason: language === 'es'
          ? 'Validar ideas continuamente te mantiene relevante en el mercado.'
          : 'Continuously validating ideas keeps you relevant in the market.',
        priority: 'medium',
        estimatedTime: language === 'es' ? '4-5 horas' : '4-5 hours',
        category: 'ideaValidation'
      });
    }

    return suggestions.filter(s => !ignoredSuggestions.includes(s.id));
  };

  const suggestions = generateIntelligentSuggestions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t.highPriority;
      case 'medium': return t.mediumPriority;
      case 'low': return t.lowPriority;
      default: return priority;
    }
  };

  const handleIgnoreSuggestion = (suggestionId: string) => {
    setIgnoredSuggestions(prev => [...prev, suggestionId]);
    onIgnoreSuggestion(suggestionId);
  };

  if (suggestions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.smartSuggestions}</h3>
          <p className="text-gray-600">{t.noSuggestions}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t.smartSuggestions}</h3>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                    {getPriorityText(suggestion.priority)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{t.estimatedTime}: {suggestion.estimatedTime}</span>
                  <span>{t.categories[suggestion.category]}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-blue-900">{t.whyThisTask}</h5>
                  <p className="text-sm text-blue-800">{suggestion.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onAcceptSuggestion(suggestion)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.accept}
              </Button>
              <Button
                onClick={() => handleIgnoreSuggestion(suggestion.id)}
                variant="outline"
                size="sm"
              >
                {t.ignore}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Plus } from 'lucide-react';
import { AgentTask } from '@/hooks/useAgentTasks';

interface TaskWizardFlowProps {
  task: AgentTask;
  language: 'en' | 'es';
  onComplete: () => void;
  onClose: () => void;
  onUpdateTask: (updates: Partial<AgentTask>) => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  validation?: () => boolean;
}

export const TaskWizardFlow: React.FC<TaskWizardFlowProps> = ({
  task,
  language,
  onComplete,
  onClose,
  onUpdateTask
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const translations = {
    en: {
      wizardTitle: 'Task Wizard',
      step: 'Step',
      of: 'of',
      next: 'Next',
      previous: 'Previous',
      complete: 'Complete Task',
      cancel: 'Cancel',
      addData: 'Add Data',
      progress: 'Progress'
    },
    es: {
      wizardTitle: 'Asistente de Tarea',
      step: 'Paso',
      of: 'de',
      next: 'Siguiente',
      previous: 'Anterior',
      complete: 'Completar Tarea',
      cancel: 'Cancelar',
      addData: 'Agregar Dato',
      progress: 'Progreso'
    }
  };

  const t = translations[language];

  // Define wizard steps based on task type/category
  const getWizardSteps = (): WizardStep[] => {
    const baseSteps = [
      {
        id: 'overview',
        title: language === 'es' ? 'Resumen de la Tarea' : 'Task Overview',
        description: language === 'es' ? 'Revisemos qué vamos a hacer' : 'Let\'s review what we\'re going to do',
        component: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {language === 'es' ? 'Objetivos de esta tarea:' : 'Objectives for this task:'}
              </h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• {language === 'es' ? 'Completar configuración inicial' : 'Complete initial setup'}</li>
                <li>• {language === 'es' ? 'Definir parámetros importantes' : 'Define important parameters'}</li>
                <li>• {language === 'es' ? 'Generar resultados medibles' : 'Generate measurable results'}</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'configuration',
        title: language === 'es' ? 'Configuración' : 'Configuration',
        description: language === 'es' ? 'Configuremos los parámetros necesarios' : 'Let\'s configure the necessary parameters',
        component: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'es' ? 'Parámetro Principal' : 'Main Parameter'}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.mainParameter || ''}
                onChange={(e) => setFormData({ ...formData, mainParameter: e.target.value })}
                placeholder={language === 'es' ? 'Ingresa el valor principal' : 'Enter main value'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'es' ? 'Descripción Adicional' : 'Additional Description'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                value={formData.additionalInfo || ''}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                placeholder={language === 'es' ? 'Información adicional...' : 'Additional information...'}
              />
            </div>
          </div>
        ),
        validation: () => !!formData.mainParameter
      },
      {
        id: 'review',
        title: language === 'es' ? 'Revisión Final' : 'Final Review',
        description: language === 'es' ? 'Revisemos todo antes de completar' : 'Let\'s review everything before completing',
        component: (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {language === 'es' ? 'Resumen de configuración:' : 'Configuration summary:'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === 'es' ? 'Parámetro Principal:' : 'Main Parameter:'}</span>
                  <span className="font-medium">{formData.mainParameter || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === 'es' ? 'Información Adicional:' : 'Additional Info:'}</span>
                  <span className="font-medium">{formData.additionalInfo ? 'Configurado' : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <p className="text-center text-gray-600">
              {language === 'es' 
                ? 'Todo está listo para completar la tarea' 
                : 'Everything is ready to complete the task'
              }
            </p>
          </div>
        )
      }
    ];

    return baseSteps;
  };

  const steps = getWizardSteps();
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canProceed = !currentStep.validation || currentStep.validation();

  const handleNext = () => {
    if (canProceed && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    // Update task with wizard data
    onUpdateTask({
      ...task,
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
      notes: `${task.notes || ''}\n\nWizard completed with data: ${JSON.stringify(formData)}`
    });
    onComplete();
  };

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.wizardTitle}</h2>
              <p className="text-sm text-gray-600">
                {t.step} {currentStepIndex + 1} {t.of} {steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{currentStep.title}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStep.title}</h3>
            <p className="text-gray-600 mb-4">{currentStep.description}</p>
            {currentStep.component}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.previous}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
              >
                {t.cancel}
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  disabled={!canProceed}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.complete}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
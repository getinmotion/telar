import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTaskSteps } from '@/hooks/_deprecated/useTaskSteps';
import { AgentTask } from '@/hooks/useAgentTasks';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { useUserBusinessProfile } from '@/hooks/useUserBusinessProfile';
import { 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause,
  Save,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskStepInterfaceProps {
  task: AgentTask;
  language: 'en' | 'es';
  onClose: () => void;
  onComplete: () => void;
}

export const TaskStepInterface: React.FC<TaskStepInterfaceProps> = ({
  task,
  language,
  onClose,
  onComplete
}) => {
  const { businessProfile } = useUserBusinessProfile();
  const { 
    steps, 
    loading, 
    currentStepIndex, 
    currentStep, 
    updateStepData, 
    validateStep, 
    moveToNextStep, 
    moveToPreviousStep,
    setCurrentStepIndex,
    canAdvanceToStep
  } = useTaskSteps(task.id);

  const [stepInput, setStepInput] = useState<any>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const t = {
    en: {
      stepProgress: 'Step Progress',
      step: 'Step',
      of: 'of',
      guidance: 'Guidance',
      expectedOutput: 'Expected Output',
      yourInput: 'Your Input',
      markCompleted: 'Mark as Completed',
      saveProgress: 'Save Progress',
      previous: 'Previous',
      next: 'Next',
      complete: 'Complete Task',
      confirmCompletion: 'I confirm this step is completed correctly',
      showGuidance: 'Show Guidance',
      hideGuidance: 'Hide Guidance',
      pauseTask: 'Pause Task',
      resumeTask: 'Resume Task',
      taskPaused: 'Task paused - you can resume anytime',
      stepCompleted: 'Step completed successfully!',
      allStepsCompleted: 'All steps completed! Ready to finish task.',
      close: 'Close'
    },
    es: {
      stepProgress: 'Progreso de Pasos',
      step: 'Paso',
      of: 'de',
      guidance: 'Orientación',
      expectedOutput: 'Resultado Esperado',
      yourInput: 'Tu Respuesta',
      markCompleted: 'Marcar como Completado',
      saveProgress: 'Guardar Progreso',
      previous: 'Anterior',
      next: 'Siguiente',
      complete: 'Completar Tarea',
      confirmCompletion: 'Confirmo que este paso está completado correctamente',
      showGuidance: 'Mostrar Orientación',
      hideGuidance: 'Ocultar Orientación',
      pauseTask: 'Pausar Tarea',
      resumeTask: 'Reanudar Tarea',
      taskPaused: 'Tarea pausada - puedes reanudar en cualquier momento',
      stepCompleted: '¡Paso completado exitosamente!',
      allStepsCompleted: '¡Todos los pasos completados! Listo para terminar la tarea.',
      close: 'Cerrar'
    }
  };

  useEffect(() => {
    if (currentStep && currentStep.user_input_data) {
      setStepInput(currentStep.user_input_data);
    } else {
      setStepInput({});
    }
  }, [currentStep]);

  const handleSaveProgress = async () => {
    if (!currentStep) return;
    
    await updateStepData(currentStep.id, stepInput);
  };

  const handleCompleteStep = async () => {
    if (!currentStep) return;
    
    setIsValidating(true);
    
    // Save current input first
    await updateStepData(currentStep.id, stepInput);
    
    // Validate step
    const success = await validateStep(currentStep.id, 'manual', 'User confirmed completion');
    
    if (success && currentStepIndex < steps.length - 1) {
      moveToNextStep();
    }
    
    setIsValidating(false);
  };

  const handleCompleteTask = () => {
    onComplete();
  };

  const renderStepInput = () => {
    if (!currentStep) return null;

    switch (currentStep.input_type) {
      case 'text':
        return (
          <Textarea
            value={stepInput.text || ''}
            onChange={(e) => setStepInput({ ...stepInput, text: e.target.value })}
            placeholder={t[language].yourInput}
            rows={4}
            className="w-full"
          />
        );
      
      case 'calculation':
        return (
          <div className="space-y-4">
            <Input
              type="number"
              value={stepInput.result || ''}
              onChange={(e) => setStepInput({ ...stepInput, result: parseFloat(e.target.value) || 0 })}
              placeholder="Resultado del cálculo"
              className="w-full"
            />
            <Textarea
              value={stepInput.explanation || ''}
              onChange={(e) => setStepInput({ ...stepInput, explanation: e.target.value })}
              placeholder="Explica cómo llegaste a este resultado"
              rows={3}
              className="w-full"
            />
          </div>
        );
      
      case 'checklist':
        return (
          <div className="space-y-3">
            {(stepInput.items || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={item.completed || false}
                  onCheckedChange={(checked) => {
                    const updatedItems = [...(stepInput.items || [])];
                    updatedItems[index] = { ...item, completed: checked };
                    setStepInput({ ...stepInput, items: updatedItems });
                  }}
                />
                <Input
                  value={item.text || ''}
                  onChange={(e) => {
                    const updatedItems = [...(stepInput.items || [])];
                    updatedItems[index] = { ...item, text: e.target.value };
                    setStepInput({ ...stepInput, items: updatedItems });
                  }}
                  placeholder="Describe el elemento"
                  className="flex-1"
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newItems = [...(stepInput.items || []), { text: '', completed: false }];
                setStepInput({ ...stepInput, items: newItems });
              }}
              className="w-full"
            >
              + Agregar elemento
            </Button>
          </div>
        );
      
      default:
        return (
          <Textarea
            value={stepInput.text || ''}
            onChange={(e) => setStepInput({ ...stepInput, text: e.target.value })}
            placeholder={t[language].yourInput}
            rows={4}
            className="w-full"
          />
        );
    }
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completion_status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const allStepsCompleted = steps.every(step => step.completion_status === 'completed');

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando pasos de la tarea...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {formatTaskTitleForDisplay(task.title, businessProfile?.brandName)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{t[language].stepProgress}</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {t[language].step} {currentStepIndex + 1} {t[language].of} {steps.length}
              </Badge>
            </div>
            <Progress value={getProgressPercentage()} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">
              {Math.round(getProgressPercentage())}% completado
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                variant={index === currentStepIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentStepIndex(index)}
                disabled={!canAdvanceToStep(index)}
                className={`flex-shrink-0 ${
                  step.completion_status === 'completed' 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : index === currentStepIndex 
                      ? 'bg-purple-600 text-white'
                      : ''
                }`}
              >
                {step.completion_status === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <Circle className="w-3 h-3 mr-1" />
                )}
                {index + 1}
              </Button>
            ))}
          </div>

          {/* Current Step */}
          {currentStep && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Header */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {currentStep.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {currentStep.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGuidance(!showGuidance)}
                      className="ml-4 flex-shrink-0"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {showGuidance ? t[language].hideGuidance : t[language].showGuidance}
                    </Button>
                  </div>

                  {/* Guidance Section */}
                  <AnimatePresence>
                    {showGuidance && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4"
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800 mb-1">{t[language].guidance}</h4>
                            <p className="text-blue-700 text-sm leading-relaxed">
                              {currentStep.ai_context_prompt}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t[language].yourInput}
                      </label>
                      {renderStepInput()}
                    </div>

                    {/* Step Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveProgress}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {t[language].saveProgress}
                      </Button>

                      {currentStep.completion_status !== 'completed' && (
                        <Button
                          onClick={handleCompleteStep}
                          disabled={isValidating}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isValidating ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {t[language].markCompleted}
                        </Button>
                      )}

                      {currentStep.completion_status === 'completed' && (
                        <Badge className="bg-green-100 text-green-700 px-3 py-1">
                          ✓ {t[language].stepCompleted}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* All Steps Completed */}
          {allStepsCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {t[language].allStepsCompleted}
              </h3>
              <Button
                onClick={handleCompleteTask}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {t[language].complete}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <Button
            onClick={moveToPreviousStep}
            disabled={currentStepIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t[language].previous}
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
          >
            {t[language].close}
          </Button>

          <Button
            onClick={moveToNextStep}
            disabled={currentStepIndex >= steps.length - 1 || currentStep?.completion_status !== 'completed'}
            className="flex items-center gap-2"
          >
            {t[language].next}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
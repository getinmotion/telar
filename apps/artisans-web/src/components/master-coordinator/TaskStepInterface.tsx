import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { TaskStep, CoordinatorTask } from '@/hooks/useMasterCoordinator';
import { useLanguage } from '@/context/LanguageContext';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  MessageCircle,
  Lightbulb,
  Target,
  Clock,
  AlertCircle,
  Save,
  Send
} from 'lucide-react';

interface TaskStepInterfaceProps {
  task: CoordinatorTask;
  currentStepIndex: number;
  onStepComplete: (stepId: string, stepData: any) => Promise<boolean>;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onRequestHelp: (stepId: string, question: string) => void;
}

export const TaskStepInterface: React.FC<TaskStepInterfaceProps> = ({
  task,
  currentStepIndex,
  onStepComplete,
  onPreviousStep,
  onNextStep,
  onRequestHelp
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const userLocalStorage = useUserLocalStorage();
  const [stepData, setStepData] = useState<any>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState('');

  const currentStep = task.steps[currentStepIndex];
  const isLastStep = currentStepIndex === task.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const progress = ((currentStepIndex + 1) / task.steps.length) * 100;

  useEffect(() => {
    // Cargar datos guardados del paso si existen
    const savedData = userLocalStorage.getItem(`step-data-${currentStep.id}`);
    if (savedData) {
      setStepData(JSON.parse(savedData));
    }
  }, [currentStep.id, userLocalStorage]);

  const handleSaveProgress = () => {
    userLocalStorage.setItem(`step-data-${currentStep.id}`, JSON.stringify(stepData));
    toast({
      title: "Progreso Guardado",
      description: "Tus datos han sido guardados automáticamente.",
    });
  };

  const handleCompleteStep = async () => {
    if (!stepData || Object.keys(stepData).length === 0) {
      toast({
        title: "Información Requerida",
        description: "Por favor completa la información necesaria para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const success = await onStepComplete(currentStep.id, stepData);
      
      if (success) {
        toast({
          title: "¡Paso Completado!",
          description: currentStep.validationRequired 
            ? "Validando tu información y desbloqueando el siguiente paso..."
            : "Continuando al siguiente paso...",
        });
        
        // Limpiar datos guardados del paso completado
        localStorage.removeItem(`step-data-${currentStep.id}`);
        
        if (!isLastStep) {
          setTimeout(onNextStep, 1000);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar este paso. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRequestHelp = () => {
    if (helpQuestion.trim()) {
      onRequestHelp(currentStep.id, helpQuestion);
      setHelpQuestion('');
      setShowHelp(false);
      toast({
        title: "Pregunta Enviada",
        description: "El Coordinador Maestro te responderá en breve.",
      });
    }
  };

  const translations = {
    en: {
      step: 'Step',
      of: 'of',
      progress: 'Progress',
      completed: 'Completed',
      locked: 'Locked',
      unlockAfterPrevious: 'Complete the previous step to unlock',
      contextualHelp: 'Contextual Help',
      askForHelp: 'Ask for Help',
      yourQuestion: 'Your question...',
      sendQuestion: 'Send Question',
      saveProgress: 'Save Progress',
      completeStep: 'Complete Step',
      validating: 'Validating...',
      previous: 'Previous',
      next: 'Next',
      finish: 'Finish Task',
      helpMeWith: 'Help me with this step',
      backToPrevious: 'Back to Previous Step'
    },
    es: {
      step: 'Paso',
      of: 'de',
      progress: 'Progreso',
      completed: 'Completado',
      locked: 'Bloqueado',
      unlockAfterPrevious: 'Completa el paso anterior para desbloquear',
      contextualHelp: 'Ayuda Contextual',
      askForHelp: 'Pedir Ayuda',
      yourQuestion: 'Tu pregunta...',
      sendQuestion: 'Enviar Pregunta',
      saveProgress: 'Guardar Progreso',
      completeStep: 'Completar Paso',
      validating: 'Validando...',
      previous: 'Anterior',
      next: 'Siguiente',
      finish: 'Finalizar Tarea',
      helpMeWith: 'Ayúdame con este paso',
      backToPrevious: 'Volver al Paso Anterior'
    }
  };

  const t = translations[language];

  if (currentStep.isLocked) {
    return (
      <Card className="border-gray-300">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <Lock className="w-16 h-16 text-gray-400 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-600">{t.locked}</h3>
            <p className="text-gray-500">{t.unlockAfterPrevious}</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Progress Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>{task.title}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t.step} {currentStepIndex + 1} {t.of} {task.steps.length}
              </p>
            </div>
            <Badge variant={currentStep.isCompleted ? 'default' : 'secondary'}>
              {currentStep.isCompleted ? t.completed : `${Math.round(progress)}%`}
            </Badge>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardHeader>
      </Card>

      {/* Main Step Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-primary" />
              )}
              <span>{currentStep.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="text-primary hover:text-primary/80"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                {t.askForHelp}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Step Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Step Input Interface */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Información para este paso
              </label>
              <Textarea
                placeholder="Describe tu progreso, resultados, o información relevante para este paso..."
                value={stepData.content || ''}
                onChange={(e) => setStepData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>

            {/* Additional fields based on step type */}
            {currentStep.stepNumber === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recursos disponibles
                  </label>
                  <Input
                    placeholder="Ej: 2 horas diarias, $500 presupuesto"
                    value={stepData.resources || ''}
                    onChange={(e) => setStepData(prev => ({ ...prev, resources: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha objetivo
                  </label>
                  <Input
                    type="date"
                    value={stepData.targetDate || ''}
                    onChange={(e) => setStepData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contextual Help */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          {t.contextualHelp}
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                          {currentStep.contextualHelp}
                        </p>
                        
                        {/* Help Question Interface */}
                        <div className="space-y-2">
                          <Textarea
                            placeholder={t.yourQuestion}
                            value={helpQuestion}
                            onChange={(e) => setHelpQuestion(e.target.value)}
                            className="bg-white dark:bg-background border-blue-200 dark:border-blue-800"
                            rows={2}
                          />
                          <Button
                            size="sm"
                            onClick={handleRequestHelp}
                            disabled={!helpQuestion.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {t.sendQuestion}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onPreviousStep}
                  className="flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.previous}</span>
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveProgress}
                disabled={!stepData || Object.keys(stepData).length === 0}
              >
                <Save className="w-4 h-4 mr-1" />
                {t.saveProgress}
              </Button>
              
              <Button
                onClick={handleCompleteStep}
                disabled={isValidating || !stepData || Object.keys(stepData).length === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isValidating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </motion.div>
                    {t.validating}
                  </>
                ) : (
                  <>
                    {isLastStep ? t.finish : t.completeStep}
                    {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
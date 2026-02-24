import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { StepInput } from './StepInput';
import { BrandEvaluationResults } from './BrandEvaluationResults';
import { validateStep } from '@/lib/wizards/stepValidation';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { calculateBrandScore, generateBrandRecommendations, extractBrandEvaluationData } from '@/lib/brand/brandEvaluator';

interface WizardStep {
  title: string;
  description?: string;
  inputType: string;
  validation: any[];
  required: boolean;
  [key: string]: any;
}

interface TaskWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  steps: WizardStep[];
  onComplete: (data: Record<string, any>) => Promise<void>;
}

export const TaskWizardModal: React.FC<TaskWizardModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  steps,
  onComplete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setCurrentStepIndex(0);
      setStepData({});
      setErrors({});
    }
  }, [isOpen]);

  const handleStepChange = (value: any) => {
    setStepData(prev => ({
      ...prev,
      [currentStepIndex]: value
    }));
    
    // Clear error when user starts typing
    if (errors[currentStepIndex]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentStepIndex];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const value = stepData[currentStepIndex];
    const validation = validateStep(value, currentStep.validation);
    
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [currentStepIndex]: validation.error || 'Error de validación'
      }));
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Transform stepData to named object
      const completedData = steps.reduce((acc, step, index) => {
        acc[step.title] = stepData[index];
        return acc;
      }, {} as Record<string, any>);

      // Check if this is a brand evaluation wizard
      const isBrandEvaluation = taskTitle.toLowerCase().includes('marca') || 
                                taskTitle.toLowerCase().includes('identidad') ||
                                taskTitle.toLowerCase().includes('evalúa');
      
      if (isBrandEvaluation && user) {
        console.log('🎨 Calling master-agent-coordinator for brand evaluation');
        
        // Call master coordinator for AI-powered evaluation
        const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
          body: {
            action: 'evaluate_brand_identity',
            userId: user.id,
            wizardData: completedData
          }
        });
        
        if (error) {
          console.error('Error calling master coordinator:', error);
          throw error;
        }
        
        if (data?.analysis) {
          console.log('✅ Brand evaluation completed:', data.analysis);
          setEvaluationResults(data.analysis);
          setShowResults(true);
          
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
          
          // Don't close the modal - show results instead
          return;
        } else {
          throw new Error('No analysis data received');
        }
      } else {
        // Standard completion for non-brand tasks
        await onComplete(completedData);
        
        toast({
          title: "🎉 ¡Misión completada!",
          description: `Has completado: ${taskTitle}`,
        });
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error completing wizard:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la tarea. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentStep) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-moss-green-900">
            {showResults ? '🎨 Resultados de Evaluación' : taskTitle}
          </DialogTitle>
        </DialogHeader>

        {showResults && evaluationResults ? (
          <BrandEvaluationResults 
            analysis={evaluationResults}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-wood-brown-600 font-medium">
                  Paso {currentStepIndex + 1} de {steps.length}
                </span>
                <span className="text-moss-green-700 font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentStepIndex && "w-8 bg-gradient-to-r from-moss-green-500 to-golden-hour-500",
                index < currentStepIndex && "bg-moss-green-500",
                index > currentStepIndex && "bg-linen-white-300"
              )}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-moss-green-900 flex items-center gap-2">
              {currentStep.required && <span className="text-terracotta-500">*</span>}
              {currentStep.title}
            </Label>
            {currentStep.description && (
              <p className="text-sm text-wood-brown-600">{currentStep.description}</p>
            )}
          </div>

          <StepInput
            step={currentStep}
            value={stepData[currentStepIndex]}
            onChange={handleStepChange}
            error={errors[currentStepIndex]}
            allStepData={stepData}
            currentStepIndex={currentStepIndex}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className={cn(
              "gap-2",
              isLastStep 
                ? "bg-gradient-to-r from-moss-green-600 to-moss-green-700 hover:from-moss-green-700 hover:to-moss-green-800" 
                : "bg-gradient-to-r from-golden-hour-500 to-terracotta-500 hover:from-golden-hour-600 hover:to-terracotta-600"
            )}
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Guardando...' : 'Completar'}
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

            {/* Encouragement Message */}
            <div className="bg-gradient-to-r from-golden-hour-50 to-linen-white-50 rounded-lg p-4 border border-golden-hour-200">
              <p className="text-sm text-wood-brown-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-golden-hour-600" />
                {isLastStep 
                  ? '¡Último paso! Estás a punto de completar esta misión 🎉'
                  : `¡Vas muy bien! ${steps.length - currentStepIndex - 1} paso${steps.length - currentStepIndex - 1 !== 1 ? 's' : ''} más y habrás terminado`
                }
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

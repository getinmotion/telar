import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { TaskStep, StepValidation, StepInputData } from './types/taskStepTypes';

export function useTaskSteps(taskId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const fetchSteps = useCallback(async () => {
    if (!user || !taskId) return;

    try {
      const { data, error } = await supabase
        .from('task_steps')
        .select('*')
        .eq('task_id', taskId as any)
        .order('step_number', { ascending: true });

      if (error) throw error;
      
      // If no steps found, check if task is in_progress and attempt to create steps
      if (!data || data.length === 0) {
        console.log('🔍 No steps found for task:', taskId);
        
        // Check if task exists and is in progress
        const { data: task, error: taskError } = await supabase
          .from('agent_tasks')
          .select('status, title, description, agent_id')
          .eq('id', taskId as any)
          .single();
          
        const taskData = task as any;
        if (!taskError && taskData && taskData.status === 'in_progress') {
          console.log('🚀 Task is in progress but has no steps, attempting to create them');
          setLoading(true);
          
          try {
            const { data: createStepsResult, error: createError } = await supabase.functions.invoke('master-agent-coordinator', {
              body: {
                action: 'create_task_steps',
                taskId,
                taskData: task
              }
            });
            
            if (createError) {
              console.error('Error creating steps:', createError);
            } else {
              console.log('✅ Steps created successfully, refetching...');
              // Wait a moment and refetch
              setTimeout(() => fetchSteps(), 1000);
              return;
            }
          } catch (createStepsError) {
            console.error('Error in step creation call:', createStepsError);
          }
        }
      }
      
      setSteps((data || []).map((step: any) => ({
        id: step.id,
        task_id: step.task_id,
        step_number: step.step_number,
        title: step.title,
        description: step.description,
        input_type: step.input_type as TaskStep['input_type'],
        expected_output: '',
        ai_context_prompt: step.ai_context_prompt || '',
        completion_status: step.completion_status as TaskStep['completion_status'],
        user_input_data: step.user_input_data,
        validation_notes: null,
        validation_criteria: step.validation_criteria,
        ai_assistance_log: step.ai_assistance_log,
        created_at: step.created_at,
        updated_at: step.updated_at
      })));
      
      // Find first incomplete step
      const mappedSteps = (data || []).map((step: any) => ({
        ...(step as any),
        completion_status: step.completion_status as TaskStep['completion_status']
      }));
      const firstIncomplete = mappedSteps.findIndex((step: any) => step.completion_status !== 'completed');
      setCurrentStepIndex(Math.max(0, firstIncomplete));
    } catch (error) {
      console.error('Error fetching task steps:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pasos de la tarea',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, taskId, toast]);

  const updateStepData = useCallback(async (stepId: string, inputData: any) => {
    try {
      const { error } = await supabase
        .from('task_steps')
        .update({
          user_input_data: inputData,
          completion_status: 'in_progress',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', stepId as any);

      if (error) throw error;
      
      // Update local state
      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, user_input_data: inputData, completion_status: 'in_progress' }
          : step
      ));
    } catch (error) {
      console.error('Error updating step data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el paso',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const validateStep = useCallback(async (
    stepId: string, 
    validationType: 'automatic' | 'ai_assisted' | 'manual',
    userConfirmation?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Create validation record
      const validationData = {
        step_id: stepId,
        user_id: user.id,
        validation_type: validationType,
        validation_result: 'pending',
        user_confirmation: userConfirmation,
        created_at: new Date().toISOString()
      };

      const { data: validation, error: validationError } = await supabase
        .from('step_validations')
        .insert(validationData as any)
        .select()
        .single();

      if (validationError) throw validationError;
      const validationResult = validation as any;

      // For now, manual validation always passes if user confirms
      if (validationType === 'manual' && userConfirmation) {
        const { error: updateError } = await supabase
          .from('step_validations')
          .update({ validation_result: 'passed' } as any)
          .eq('id', validationResult.id as any);

        if (updateError) throw updateError;

        // Mark step as completed
        await supabase
          .from('task_steps')
          .update({ completion_status: 'completed' } as any)
          .eq('id', stepId as any);

        // Update local state
        setSteps(prev => prev.map(step => 
          step.id === stepId 
            ? { ...step, completion_status: 'completed' }
            : step
        ));

        toast({
          title: 'Paso completado',
          description: 'El paso ha sido marcado como completado',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating step:', error);
      toast({
        title: 'Error',
        description: 'No se pudo validar el paso',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  const moveToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const moveToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const canAdvanceToStep = useCallback((targetIndex: number) => {
    // Can always go to previous steps
    if (targetIndex <= currentStepIndex) return true;
    
    // Can only advance if all previous steps are completed
    for (let i = 0; i < targetIndex; i++) {
      if (steps[i]?.completion_status !== 'completed') {
        return false;
      }
    }
    return true;
  }, [currentStepIndex, steps]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task-steps-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_steps',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          fetchSteps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, fetchSteps]);

  return {
    steps,
    loading,
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    updateStepData,
    validateStep,
    moveToNextStep,
    moveToPreviousStep,
    canAdvanceToStep,
    setCurrentStepIndex: (index: number) => {
      if (canAdvanceToStep(index)) {
        setCurrentStepIndex(index);
      }
    },
    refreshSteps: fetchSteps
  };
}
-- Create task_steps table for detailed step information
CREATE TABLE public.task_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'selection', 'calculation', 'url', 'checklist'
  validation_criteria JSONB DEFAULT '{}',
  ai_context_prompt TEXT,
  completion_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  user_input_data JSONB DEFAULT '{}',
  ai_assistance_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (task_id) REFERENCES public.agent_tasks(id) ON DELETE CASCADE
);

-- Create step_validations table for validation history
CREATE TABLE public.step_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL,
  user_id UUID NOT NULL,
  validation_type TEXT NOT NULL, -- 'automatic', 'ai_assisted', 'manual'
  validation_result TEXT NOT NULL, -- 'passed', 'failed', 'pending'
  validation_data JSONB DEFAULT '{}',
  ai_feedback TEXT,
  user_confirmation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (step_id) REFERENCES public.task_steps(id) ON DELETE CASCADE
);

-- Enable RLS on new tables
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_validations ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_steps
CREATE POLICY "Users can view steps for their tasks" ON public.task_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.agent_tasks 
    WHERE id = task_steps.task_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create steps for their tasks" ON public.task_steps
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_tasks 
    WHERE id = task_steps.task_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update steps for their tasks" ON public.task_steps
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.agent_tasks 
    WHERE id = task_steps.task_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete steps for their tasks" ON public.task_steps
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.agent_tasks 
    WHERE id = task_steps.task_id AND user_id = auth.uid()
  )
);

-- RLS policies for step_validations
CREATE POLICY "Users can view their own step validations" ON public.step_validations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own step validations" ON public.step_validations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own step validations" ON public.step_validations
FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger for task_steps
CREATE TRIGGER update_task_steps_updated_at
BEFORE UPDATE ON public.task_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_task_steps_task_id ON public.task_steps(task_id);
CREATE INDEX idx_task_steps_step_number ON public.task_steps(task_id, step_number);
CREATE INDEX idx_step_validations_step_id ON public.step_validations(step_id);
CREATE INDEX idx_step_validations_user_id ON public.step_validations(user_id);
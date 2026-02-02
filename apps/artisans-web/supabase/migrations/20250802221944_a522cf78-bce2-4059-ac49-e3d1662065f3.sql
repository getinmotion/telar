-- Create user_master_context table for storing unified user information
CREATE TABLE public.user_master_context (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    business_context JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    conversation_insights JSONB DEFAULT '{}'::jsonb,
    technical_details JSONB DEFAULT '{}'::jsonb,
    goals_and_objectives JSONB DEFAULT '{}'::jsonb,
    context_version INTEGER DEFAULT 1,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure one context per user
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_master_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own master context" 
ON public.user_master_context 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own master context" 
ON public.user_master_context 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own master context" 
ON public.user_master_context 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    NEW.context_version = OLD.context_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_master_context_timestamp
BEFORE UPDATE ON public.user_master_context
FOR EACH ROW
EXECUTE FUNCTION public.update_master_context_timestamp();
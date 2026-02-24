
-- Create table for calculator images, allowing them to be managed centrally.
CREATE TABLE public.calculator_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_name text NOT NULL UNIQUE,
  image_url text NOT NULL,
  alt_text text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security for calculator images.
ALTER TABLE public.calculator_images ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active images.
CREATE POLICY "Allow public read access to active calculator images"
ON public.calculator_images
FOR SELECT
USING (is_active = true);

-- Policy to allow admin full access for management.
CREATE POLICY "Allow admin full access to calculator images"
ON public.calculator_images
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- Create table for storing user chat context from the assistant.
CREATE TABLE public.user_chat_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  message text NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  step_context text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security for user chat context.
ALTER TABLE public.user_chat_context ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own chat context.
CREATE POLICY "Users can manage their own chat context"
ON public.user_chat_context
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy to allow anonymous users to insert their chat context.
CREATE POLICY "Allow anonymous users to insert chat context"
ON public.user_chat_context
FOR INSERT
WITH CHECK (user_id IS NULL);


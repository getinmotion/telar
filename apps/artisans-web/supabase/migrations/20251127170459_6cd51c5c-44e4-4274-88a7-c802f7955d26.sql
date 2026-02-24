-- 1. Add moderation_status column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'draft';

-- Add constraint for valid statuses
ALTER TABLE public.products
ADD CONSTRAINT products_moderation_status_check 
CHECK (moderation_status IN (
  'draft',
  'pending_moderation', 
  'approved',
  'approved_with_edits',
  'changes_requested',
  'rejected',
  'archived'
));

-- 2. Create product_moderation_history table
CREATE TABLE public.product_moderation_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  moderator_id uuid,
  artisan_id uuid,
  comment text,
  edits_made jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on product_moderation_history
ALTER TABLE public.product_moderation_history ENABLE ROW LEVEL SECURITY;

-- 3. Create notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_product_moderation_history_product_id ON public.product_moderation_history(product_id);
CREATE INDEX idx_products_moderation_status ON public.products(moderation_status);

-- 4. Create is_moderator() function
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
  )
$$;

-- 5. RLS Policies for product_moderation_history

-- Moderators can view all moderation history
CREATE POLICY "Moderators can view all moderation history"
ON public.product_moderation_history
FOR SELECT
USING (public.is_moderator());

-- Moderators can insert moderation history
CREATE POLICY "Moderators can insert moderation history"
ON public.product_moderation_history
FOR INSERT
WITH CHECK (public.is_moderator());

-- Artisans can view moderation history of their own products
CREATE POLICY "Artisans can view their product moderation history"
ON public.product_moderation_history
FOR SELECT
USING (
  product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.artisan_shops s ON p.shop_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- 6. RLS Policies for notifications

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service/System can insert notifications
CREATE POLICY "Service can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);
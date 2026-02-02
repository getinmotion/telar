-- First, clean up duplicate shops by keeping only the most recent one per user
WITH ranked_shops AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.artisan_shops
),
shops_to_delete AS (
  SELECT id FROM ranked_shops WHERE rn > 1
)
DELETE FROM public.artisan_shops 
WHERE id IN (SELECT id FROM shops_to_delete);

-- Now add the new fields for creation tracking
ALTER TABLE public.artisan_shops 
ADD COLUMN creation_status text DEFAULT 'complete' CHECK (creation_status IN ('draft', 'incomplete', 'complete')),
ADD COLUMN creation_step integer DEFAULT 0;

-- Create unique constraint to enforce one shop per user
ALTER TABLE public.artisan_shops 
ADD CONSTRAINT unique_user_shop UNIQUE (user_id);

-- Update existing shops to 'complete' status
UPDATE public.artisan_shops 
SET creation_status = 'complete', creation_step = 0;
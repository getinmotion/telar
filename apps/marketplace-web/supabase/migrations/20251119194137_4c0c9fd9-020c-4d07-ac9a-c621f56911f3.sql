-- Add user_id column to order_items for direct RLS checks
ALTER TABLE public.order_items ADD COLUMN user_id uuid;

-- Create index for performance
CREATE INDEX idx_order_items_user_id ON public.order_items(user_id);

-- Create function to automatically set user_id on order_items from orders table
CREATE OR REPLACE FUNCTION public.set_order_item_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get user_id from the order
  SELECT user_id INTO NEW.user_id
  FROM public.orders
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically populate user_id
CREATE TRIGGER set_order_item_user_id_trigger
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_item_user_id();

-- Backfill existing order_items with user_id from orders
UPDATE public.order_items oi
SET user_id = o.user_id
FROM public.orders o
WHERE oi.order_id = o.id
AND oi.user_id IS NULL;

-- Make user_id NOT NULL after backfill
ALTER TABLE public.order_items ALTER COLUMN user_id SET NOT NULL;

-- Drop old indirect RLS policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

-- Create new direct RLS policies using user_id
CREATE POLICY "Users can view own order items"
  ON public.order_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Keep admin policy
-- (Admins can view all order items policy already exists)
-- Phase 1: Add new fields to artisan_shops and products

-- 1.1 Add bank_data_status to artisan_shops (explicit status field)
ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS bank_data_status text DEFAULT 'not_set';

-- 1.2 Add marketplace_approval_status to artisan_shops
ALTER TABLE public.artisan_shops 
ADD COLUMN IF NOT EXISTS marketplace_approval_status text DEFAULT 'pending';

-- 1.3 Add shipping_data_complete flag to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipping_data_complete boolean DEFAULT false;

-- 1.4 Add ready_for_checkout flag to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ready_for_checkout boolean DEFAULT false;

-- 2. Migrate existing data

-- 2.1 Update bank_data_status based on existing id_contraparty
UPDATE public.artisan_shops 
SET bank_data_status = CASE 
  WHEN id_contraparty IS NOT NULL AND id_contraparty != '' THEN 'complete'
  ELSE 'not_set'
END
WHERE bank_data_status = 'not_set';

-- 2.2 Update marketplace_approval_status based on existing marketplace_approved boolean
UPDATE public.artisan_shops 
SET marketplace_approval_status = CASE 
  WHEN marketplace_approved = true THEN 'approved'
  ELSE 'pending'
END
WHERE marketplace_approval_status = 'pending';

-- 2.3 Calculate shipping_data_complete for existing products
UPDATE public.products 
SET shipping_data_complete = (
  weight IS NOT NULL AND weight > 0 AND
  dimensions IS NOT NULL AND
  (dimensions->>'length')::numeric > 0 AND
  (dimensions->>'width')::numeric > 0 AND
  (dimensions->>'height')::numeric > 0
);

-- 3. Create trigger to auto-update shipping_data_complete on product changes
CREATE OR REPLACE FUNCTION public.update_shipping_data_complete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.shipping_data_complete := (
    NEW.weight IS NOT NULL AND NEW.weight > 0 AND
    NEW.dimensions IS NOT NULL AND
    (NEW.dimensions->>'length')::numeric > 0 AND
    (NEW.dimensions->>'width')::numeric > 0 AND
    (NEW.dimensions->>'height')::numeric > 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_update_shipping_data_complete ON public.products;
CREATE TRIGGER trigger_update_shipping_data_complete
BEFORE INSERT OR UPDATE OF weight, dimensions ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_shipping_data_complete();

-- 4. Create trigger to sync bank_data_status when id_contraparty changes
CREATE OR REPLACE FUNCTION public.sync_bank_data_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_contraparty IS NOT NULL AND NEW.id_contraparty != '' THEN
    NEW.bank_data_status := 'complete';
  ELSIF OLD.id_contraparty IS NOT NULL AND (NEW.id_contraparty IS NULL OR NEW.id_contraparty = '') THEN
    NEW.bank_data_status := 'incomplete';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_sync_bank_data_status ON public.artisan_shops;
CREATE TRIGGER trigger_sync_bank_data_status
BEFORE UPDATE OF id_contraparty ON public.artisan_shops
FOR EACH ROW
EXECUTE FUNCTION public.sync_bank_data_status();
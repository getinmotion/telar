-- 1. Actualizar los 110 usuarios existentes con tienda a shop_owner
UPDATE user_profiles 
SET user_type = 'shop_owner', updated_at = now()
WHERE user_id IN (
  SELECT user_id FROM artisan_shops
)
AND user_type != 'admin';

-- 2. Crear función que actualiza user_type cuando se crea una tienda
CREATE OR REPLACE FUNCTION public.update_user_type_on_shop_creation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles 
  SET user_type = 'shop_owner', updated_at = now()
  WHERE user_id = NEW.user_id 
  AND user_type = 'regular';
  
  RETURN NEW;
END;
$$;

-- 3. Crear trigger que se ejecuta al crear una tienda
DROP TRIGGER IF EXISTS on_shop_created ON artisan_shops;
CREATE TRIGGER on_shop_created
  AFTER INSERT ON artisan_shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_type_on_shop_creation();
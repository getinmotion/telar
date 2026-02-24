-- Función para decrementar el inventario de un producto de forma segura
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_inventory INTEGER;
BEGIN
  -- Obtener inventario actual con lock para evitar race conditions
  SELECT inventory INTO current_inventory
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF current_inventory IS NULL THEN
    RAISE WARNING 'Producto % no encontrado', p_product_id;
    RETURN FALSE;
  END IF;

  -- Si no hay suficiente inventario, decrementar a 0
  IF current_inventory < p_quantity THEN
    RAISE WARNING 'Inventario insuficiente para producto %. Inventario: %, Solicitado: %', 
      p_product_id, current_inventory, p_quantity;
    UPDATE products
    SET inventory = 0, updated_at = NOW()
    WHERE id = p_product_id;
    RETURN TRUE;
  END IF;

  -- Decrementar el inventario
  UPDATE products
  SET inventory = inventory - p_quantity, updated_at = NOW()
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;
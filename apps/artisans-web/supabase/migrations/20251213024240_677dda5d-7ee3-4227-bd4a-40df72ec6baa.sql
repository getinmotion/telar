-- Eliminar política existente que no tiene WITH CHECK
DROP POLICY IF EXISTS "Shop owners can manage their products" ON products;

-- Crear nueva política con USING y WITH CHECK explícitos
CREATE POLICY "Shop owners can manage their products" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM artisan_shops 
      WHERE artisan_shops.id = products.shop_id 
        AND artisan_shops.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisan_shops 
      WHERE artisan_shops.id = products.shop_id 
        AND artisan_shops.user_id = auth.uid()
    )
  );
-- Política para que admins puedan ver todas las órdenes
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (is_admin());

-- Política para que admins puedan actualizar todas las órdenes
CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (is_admin());
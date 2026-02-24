-- Insertar las 2 órdenes pasadas que no fueron registradas

-- Orden 1 - ORD-22E6FCF0 (18 Dic 2025 - 02:23) - Tarjeta de crédito + Gift Card
INSERT INTO orders (
  shop_id, order_number, customer_name, customer_email, customer_phone,
  shipping_address, items, subtotal, shipping_cost, tax, total,
  payment_id, payment_method, payment_status, status, fulfillment_status,
  notes, created_at
) VALUES (
  'bb7cba66-9413-4709-8268-480f68fc9257',
  'ORD-22E6FCF0',
  'andres osorio',
  'osoriop0312@gmail.com',
  '3186144744',
  '{"method": "servientrega"}'::jsonb,
  '[{"product_id": "8573668d-fbc8-4dcf-8966-67eecae0813b", "name": "Caja Artesanal de Madera Telar Premium", "quantity": 1, "price": 20000}]'::jsonb,
  20000, 15000, 0, 35000,
  'GC-613F2A79',
  'credit_card',
  'paid', 'confirmed', 'pending',
  'Gift card aplicada: GC-613F2A79',
  '2025-12-18 02:23:00+00'
);

-- Orden 2 - ORD-23747769 (18 Dic 2025 - 22:51) - Gift Card completa
INSERT INTO orders (
  shop_id, order_number, customer_name, customer_email, customer_phone,
  shipping_address, items, subtotal, shipping_cost, tax, total,
  payment_id, payment_method, payment_status, status, fulfillment_status,
  created_at
) VALUES (
  'bb7cba66-9413-4709-8268-480f68fc9257',
  'ORD-23747769',
  'andres osorio',
  'osoriop0312@gmail.com',
  '3186144744',
  '{"method": "pickup", "note": "Retiro en local"}'::jsonb,
  '[{"product_id": "950e7dc3-34e5-41ad-b4f2-863d0f84c4ad", "name": "Caja de Madera Artesanal Telar Original", "quantity": 1, "price": 15000}]'::jsonb,
  15000, 0, 0, 15000,
  'GC-613F2A79',
  'gift_card',
  'paid', 'confirmed', 'pending',
  '2025-12-18 22:51:00+00'
);
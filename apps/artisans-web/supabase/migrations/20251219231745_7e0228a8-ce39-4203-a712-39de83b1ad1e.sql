-- Corregir la orden de prueba que tiene guía inventada
UPDATE orders 
SET fulfillment_status = 'pending', 
    status = 'pending',
    tracking_number = NULL,
    updated_at = NOW()
WHERE id = 'f71b43af-5f95-4411-9d23-fb51b8aa0683';
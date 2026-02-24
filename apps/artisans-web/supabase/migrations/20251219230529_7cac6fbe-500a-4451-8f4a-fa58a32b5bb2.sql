-- Corregir el estado de ORD-22E6FCF0 que está como shipped pero no se ha enviado
UPDATE orders 
SET fulfillment_status = 'pending', 
    updated_at = now() 
WHERE order_number = 'ORD-22E6FCF0' 
AND fulfillment_status = 'shipped';
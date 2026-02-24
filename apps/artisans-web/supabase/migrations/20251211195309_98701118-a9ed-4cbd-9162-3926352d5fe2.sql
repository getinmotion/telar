-- Sincronizar bank_data_status para tiendas que tienen id_contraparty pero no tienen status 'complete'
UPDATE artisan_shops
SET bank_data_status = 'complete'
WHERE id_contraparty IS NOT NULL
  AND (bank_data_status IS NULL OR bank_data_status != 'complete');
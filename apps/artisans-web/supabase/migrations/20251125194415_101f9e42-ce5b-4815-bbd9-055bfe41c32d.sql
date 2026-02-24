-- Limpiar tareas del sistema viejo que ya no aplican
-- Solo mantener las tareas del nuevo sistema de misiones fijas

DELETE FROM agent_tasks 
WHERE agent_id NOT IN (
  'create_shop', 
  'create_brand', 
  'first_product', 
  'five_products', 
  'ten_products', 
  'customize_shop', 
  'create_story', 
  'complete_rut', 
  'maturity_block_1', 
  'maturity_block_2', 
  'maturity_block_3', 
  'maturity_block_4'
)
AND agent_id NOT LIKE 'agent_%'; -- Preservar tareas de agentes reales

-- Log de limpieza
DO $$ 
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Limpiadas % tareas obsoletas del sistema viejo', deleted_count;
END $$;
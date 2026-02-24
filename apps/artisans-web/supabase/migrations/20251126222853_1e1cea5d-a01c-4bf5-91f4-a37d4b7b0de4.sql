-- Migrar agent_ids legacy a los nuevos identificadores permitidos
-- Esto normaliza los datos existentes para que funcionen con el nuevo sistema

UPDATE agent_tasks 
SET agent_id = CASE 
  -- Mapeos principales
  WHEN agent_id = 'create_shop' THEN 'inventory'
  WHEN agent_id = 'create_brand' THEN 'brand'
  WHEN agent_id = 'market-researcher' THEN 'growth'
  WHEN agent_id = 'brand-consultant' THEN 'digital-presence'
  WHEN agent_id = 'price-consultant' THEN 'growth'
  
  -- Mapeos de agentes bloqueados a permitidos
  WHEN agent_id = 'legal' THEN 'growth'
  WHEN agent_id = 'pricing' THEN 'growth'
  WHEN agent_id = 'cultural-consultant' THEN 'digital-presence'
  WHEN agent_id = 'marketing-specialist' THEN 'digital-presence'
  WHEN agent_id = 'personal-brand-eval' THEN 'brand'
  WHEN agent_id = 'financial-management' THEN 'growth'
  WHEN agent_id = 'operations-specialist' THEN 'inventory'
  WHEN agent_id = 'business-intelligence' THEN 'growth'
  WHEN agent_id = 'expansion-specialist' THEN 'growth'
  
  ELSE agent_id 
END
WHERE agent_id IN (
  'create_shop', 'create_brand', 'market-researcher', 'brand-consultant', 
  'price-consultant', 'legal', 'pricing', 'cultural-consultant', 
  'marketing-specialist', 'personal-brand-eval', 'financial-management', 
  'operations-specialist', 'business-intelligence', 'expansion-specialist'
);

-- Actualizar milestone_category para tareas que no lo tienen
UPDATE agent_tasks 
SET milestone_category = CASE 
  WHEN agent_id = 'brand' THEN 'brand'
  WHEN agent_id = 'inventory' THEN 'shop'
  WHEN agent_id = 'digital-presence' THEN 'digital'
  WHEN agent_id = 'growth' THEN 'growth'
  ELSE milestone_category
END
WHERE milestone_category IS NULL;
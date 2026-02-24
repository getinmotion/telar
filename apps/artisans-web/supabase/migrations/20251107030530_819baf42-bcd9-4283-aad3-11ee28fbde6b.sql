-- Temporarily disable the check_active_tasks_limit trigger
ALTER TABLE agent_tasks DISABLE TRIGGER check_active_tasks_limit_trigger;

-- Update brand-related tasks
UPDATE agent_tasks 
SET deliverable_type = 'brand_identity_wizard'
WHERE (
  agent_id IN ('brand', 'brand-identity', 'personal-brand-eval', 'cultural-consultant')
  OR title ILIKE '%identidad%visual%'
  OR title ILIKE '%brand%identity%'
  OR title ILIKE '%logo%'
  OR title ILIKE '%marca%'
  OR title ILIKE '%evalúa%identidad%'
  OR title ILIKE '%crea%identidad%'
)
AND deliverable_type IS NULL;

-- Update product/inventory-related tasks
UPDATE agent_tasks 
SET deliverable_type = 'product_upload_wizard'
WHERE (
  agent_id IN ('inventory', 'operations-specialist')
  OR title ILIKE '%producto%'
  OR title ILIKE '%product%'
  OR title ILIKE '%inventario%'
  OR title ILIKE '%inventory%'
  OR title ILIKE '%sube%primer%'
  OR title ILIKE '%upload%'
)
AND deliverable_type IS NULL;

-- Re-enable the trigger
ALTER TABLE agent_tasks ENABLE TRIGGER check_active_tasks_limit_trigger;
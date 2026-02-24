-- ============================================
-- MISSION SYSTEM FIX: Clean up duplicate tasks and auto-complete valid ones
-- ============================================

-- Step 1: Mark create_shop tasks as completed for users who already have a shop
UPDATE agent_tasks 
SET 
  status = 'completed', 
  progress_percentage = 100, 
  completed_at = NOW(),
  updated_at = NOW()
WHERE agent_id = 'create_shop' 
  AND status IN ('pending', 'in_progress')
  AND user_id IN (
    SELECT user_id 
    FROM artisan_shops 
    WHERE active = true
  );

-- Step 2: Mark create_brand tasks as completed for users who have a logo
UPDATE agent_tasks 
SET 
  status = 'completed', 
  progress_percentage = 100, 
  completed_at = NOW(),
  updated_at = NOW()
WHERE agent_id = 'create_brand' 
  AND status IN ('pending', 'in_progress')
  AND user_id IN (
    SELECT user_id 
    FROM artisan_shops 
    WHERE logo_url IS NOT NULL AND logo_url != ''
  );

-- Step 3: Delete duplicate tasks, keeping only the most recent per user/agent_id combination
DELETE FROM agent_tasks a
WHERE a.id NOT IN (
  SELECT id FROM (
    SELECT DISTINCT ON (user_id, agent_id) id
    FROM agent_tasks
    ORDER BY user_id, agent_id, created_at DESC
  ) as latest_tasks
);

-- Step 4: Create index for faster task lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_agent ON agent_tasks(user_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status) WHERE NOT is_archived;

-- Log the cleanup results
DO $$
DECLARE
  fixed_count INTEGER;
  duplicate_count INTEGER;
BEGIN
  -- Get count of fixed tasks
  SELECT COUNT(*) INTO fixed_count
  FROM agent_tasks
  WHERE status = 'completed' 
    AND completed_at > NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE '✅ Mission system cleanup completed:';
  RAISE NOTICE '  - Tasks auto-completed: %', fixed_count;
  RAISE NOTICE '  - Indexes created for performance';
END $$;
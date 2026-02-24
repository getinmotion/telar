-- Delete all task-related data for user a26938e6-000a-4f4f-bbdd-0dd867ac25b5
-- Order: step_validations -> task_steps -> agent_tasks (respecting foreign key dependencies)

-- 1. Delete step validations for the user
DELETE FROM step_validations 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 2. Delete task steps for user's tasks
DELETE FROM task_steps 
WHERE task_id IN (
  SELECT id FROM agent_tasks 
  WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
);

-- 3. Delete all agent tasks for the user
DELETE FROM agent_tasks 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- This script removes duplicate tasks from the agent_tasks table.
-- It identifies duplicates based on the user_id and task title,
-- and keeps only the most recently created task for each combination.

WITH RankedTasks AS (
    SELECT
        id,
        -- Assign a unique number to each task within a user's set of tasks with the same title,
        -- ordering them by creation date so the newest is number 1.
        ROW_NUMBER() OVER(PARTITION BY user_id, title ORDER BY created_at DESC) as rn
    FROM
        public.agent_tasks
)
-- Delete all tasks that are not the newest one (i.e., their rank is greater than 1).
DELETE FROM public.agent_tasks
WHERE id IN (
    SELECT id
    FROM RankedTasks
    WHERE rn > 1
);

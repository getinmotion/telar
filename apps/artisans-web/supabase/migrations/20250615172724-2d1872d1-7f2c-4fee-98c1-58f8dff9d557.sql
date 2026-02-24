
WITH RankedTasks AS (
    SELECT
        id,
        ROW_NUMBER() OVER(PARTITION BY user_id, title ORDER BY created_at DESC) as rn
    FROM
        public.agent_tasks
    WHERE 
        user_id = auth.uid()
)
DELETE FROM public.agent_tasks
WHERE id IN (
    SELECT id
    FROM RankedTasks
    WHERE rn > 1
);

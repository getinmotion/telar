
-- Limpieza completa de datos para el usuario mduque49@gmail.com (ID: a26938e6-000a-4f4f-bbdd-0dd867ac25b5)

-- 1. Eliminar todos los mensajes de las conversaciones del usuario
DELETE FROM agent_messages 
WHERE conversation_id IN (
    SELECT id FROM agent_conversations 
    WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
);

-- 2. Eliminar todas las conversaciones del usuario
DELETE FROM agent_conversations 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 3. Eliminar todas las tareas del usuario
DELETE FROM agent_tasks 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 4. Eliminar todos los deliverables del usuario
DELETE FROM agent_deliverables 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 5. Eliminar métricas de uso de agentes
DELETE FROM agent_usage_metrics 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 6. Eliminar contexto de chat del usuario
DELETE FROM user_chat_context 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 7. Eliminar proyectos del usuario
DELETE FROM user_projects 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 8. Resetear configuración de agentes del usuario
DELETE FROM user_agents 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- 9. Eliminar puntuaciones de madurez del usuario
DELETE FROM user_maturity_scores 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

-- Verificar que la limpieza fue exitosa
SELECT 
    'agent_messages' as tabla, COUNT(*) as registros_restantes
FROM agent_messages 
WHERE conversation_id IN (
    SELECT id FROM agent_conversations 
    WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
)
UNION ALL
SELECT 'agent_conversations', COUNT(*) 
FROM agent_conversations 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'agent_tasks', COUNT(*) 
FROM agent_tasks 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'agent_deliverables', COUNT(*) 
FROM agent_deliverables 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'agent_usage_metrics', COUNT(*) 
FROM agent_usage_metrics 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'user_chat_context', COUNT(*) 
FROM user_chat_context 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'user_projects', COUNT(*) 
FROM user_projects 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'user_agents', COUNT(*) 
FROM user_agents 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
UNION ALL
SELECT 'user_maturity_scores', COUNT(*) 
FROM user_maturity_scores 
WHERE user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5';

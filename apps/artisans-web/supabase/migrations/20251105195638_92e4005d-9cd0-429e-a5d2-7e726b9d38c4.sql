-- Actualizar función de reset para borrar TODO lo relacionado con maturity test
CREATE OR REPLACE FUNCTION public.reset_user_maturity_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_deleted_scores integer := 0;
  v_deleted_actions integer := 0;
  v_deleted_agents integer := 0;
  v_deleted_tasks integer := 0;
  v_deleted_conversations integer := 0;
  v_deleted_messages integer := 0;
  v_deleted_deliverables integer := 0;
BEGIN
  -- Obtener user_id del usuario autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuario no autenticado'
    );
  END IF;
  
  -- 1. Borrar scores de madurez
  DELETE FROM user_maturity_scores 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_scores = ROW_COUNT;
  
  -- 2. Borrar acciones registradas
  DELETE FROM user_maturity_actions 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_actions = ROW_COUNT;
  
  -- 3. Borrar entregables generados
  DELETE FROM agent_deliverables 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_deliverables = ROW_COUNT;
  
  -- 4. Borrar mensajes de conversaciones (antes de borrar conversaciones)
  DELETE FROM agent_messages 
  WHERE conversation_id IN (
    SELECT id FROM agent_conversations WHERE user_id = v_user_id
  );
  GET DIAGNOSTICS v_deleted_messages = ROW_COUNT;
  
  -- 5. Borrar conversaciones con agentes
  DELETE FROM agent_conversations 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_conversations = ROW_COUNT;
  
  -- 6. Borrar tareas generadas
  DELETE FROM agent_tasks 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_tasks = ROW_COUNT;
  
  -- 7. Borrar agentes recomendados
  DELETE FROM user_agents 
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_agents = ROW_COUNT;
  
  -- 8. Resetear contexto de generación de tareas en user_master_context
  UPDATE user_master_context 
  SET task_generation_context = jsonb_build_object(
    'maturity_test_progress', jsonb_build_object(
      'total_answered', 0,
      'total_questions', 12,
      'is_complete', false,
      'last_updated', now()
    )
  )
  WHERE user_id = v_user_id;
  
  -- Retornar resultado completo
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted_scores', v_deleted_scores,
    'deleted_actions', v_deleted_actions,
    'deleted_agents', v_deleted_agents,
    'deleted_tasks', v_deleted_tasks,
    'deleted_conversations', v_deleted_conversations,
    'deleted_messages', v_deleted_messages,
    'deleted_deliverables', v_deleted_deliverables
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
-- Update reset_user_maturity_progress function to also clean user_master_context
CREATE OR REPLACE FUNCTION public.reset_user_maturity_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_deleted_scores integer := 0;
  v_deleted_actions integer := 0;
  v_deleted_agents integer := 0;
  v_deleted_tasks integer := 0;
  v_deleted_conversations integer := 0;
  v_deleted_messages integer := 0;
  v_deleted_deliverables integer := 0;
  v_updated_profiles integer := 0;
  v_updated_contexts integer := 0;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No authenticated user found'
    );
  END IF;

  -- Delete maturity scores
  DELETE FROM user_maturity_scores WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_scores = ROW_COUNT;

  -- Delete maturity actions
  DELETE FROM user_maturity_actions WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_actions = ROW_COUNT;

  -- Delete user agents
  DELETE FROM user_agents WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_agents = ROW_COUNT;

  -- Delete agent tasks
  DELETE FROM agent_tasks WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_tasks = ROW_COUNT;

  -- Delete agent conversations
  DELETE FROM agent_chat_messages WHERE conversation_id IN (
    SELECT id FROM agent_chat_conversations WHERE user_id = v_user_id
  );
  GET DIAGNOSTICS v_deleted_messages = ROW_COUNT;

  DELETE FROM agent_chat_conversations WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_conversations = ROW_COUNT;

  -- Delete deliverables
  DELETE FROM agent_deliverables WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_deliverables = ROW_COUNT;

  -- Clean user profile business fields
  UPDATE user_profiles 
  SET 
    business_name = NULL,
    business_stage = NULL,
    business_model = NULL,
    target_market = NULL,
    key_challenges = NULL,
    last_assessment_date = NULL,
    updated_at = now()
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_updated_profiles = ROW_COUNT;

  -- NUEVO: Limpiar business_profile y task_generation_context de user_master_context
  UPDATE user_master_context 
  SET 
    business_profile = '{}'::jsonb,
    task_generation_context = '{}'::jsonb,
    last_updated = now()
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_updated_contexts = ROW_COUNT;

  -- Return success with counts
  RETURN jsonb_build_object(
    'success', true,
    'deleted_scores', v_deleted_scores,
    'deleted_actions', v_deleted_actions,
    'deleted_agents', v_deleted_agents,
    'deleted_tasks', v_deleted_tasks,
    'deleted_conversations', v_deleted_conversations,
    'deleted_messages', v_deleted_messages,
    'deleted_deliverables', v_deleted_deliverables,
    'updated_profiles', v_updated_profiles,
    'updated_contexts', v_updated_contexts,
    'user_id', v_user_id::text
  );
END;
$function$;
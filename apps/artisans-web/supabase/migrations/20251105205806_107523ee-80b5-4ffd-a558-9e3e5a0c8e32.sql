-- Update reset function to also clear business fields from user_profiles
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
BEGIN
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

  -- Delete messages first (foreign key dependency)
  DELETE FROM agent_messages 
  WHERE conversation_id IN (
    SELECT id FROM agent_conversations WHERE user_id = v_user_id
  );
  GET DIAGNOSTICS v_deleted_messages = ROW_COUNT;

  -- Delete conversations
  DELETE FROM agent_conversations WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_conversations = ROW_COUNT;

  -- Delete tasks
  DELETE FROM agent_tasks WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_tasks = ROW_COUNT;

  -- Delete deliverables
  DELETE FROM agent_deliverables WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_deleted_deliverables = ROW_COUNT;

  -- Clear business fields from user_profiles (keep personal data)
  UPDATE user_profiles 
  SET 
    brand_name = NULL,
    business_description = NULL,
    business_type = NULL,
    business_location = NULL,
    target_market = NULL,
    current_stage = NULL,
    business_goals = NULL,
    current_challenges = NULL,
    sales_channels = NULL,
    monthly_revenue_goal = NULL,
    years_in_business = NULL,
    time_availability = NULL,
    team_size = NULL,
    initial_investment_range = NULL,
    primary_skills = NULL,
    social_media_presence = '{}'::jsonb,
    updated_at = now()
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_updated_profiles = ROW_COUNT;

  -- Reset task_generation_context in user_master_context
  UPDATE user_master_context 
  SET 
    task_generation_context = '{}'::jsonb,
    last_updated = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'deleted_scores', v_deleted_scores,
    'deleted_actions', v_deleted_actions,
    'deleted_agents', v_deleted_agents,
    'deleted_tasks', v_deleted_tasks,
    'deleted_conversations', v_deleted_conversations,
    'deleted_messages', v_deleted_messages,
    'deleted_deliverables', v_deleted_deliverables,
    'updated_profiles', v_updated_profiles
  );
END;
$function$;
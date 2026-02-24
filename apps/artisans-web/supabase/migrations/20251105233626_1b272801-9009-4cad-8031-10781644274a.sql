-- Update reset_user_maturity_progress function to also clear user_profiles business fields
CREATE OR REPLACE FUNCTION public.reset_user_maturity_progress(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_scores integer;
  deleted_actions integer;
  deleted_tasks integer;
  deleted_context integer;
  deleted_agents integer;
  deleted_conversations integer;
  updated_profiles integer;
BEGIN
  -- Delete maturity scores
  DELETE FROM user_maturity_scores WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_scores = ROW_COUNT;
  
  -- Delete maturity actions
  DELETE FROM user_maturity_actions WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_actions = ROW_COUNT;
  
  -- Delete agent tasks
  DELETE FROM agent_tasks WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_tasks = ROW_COUNT;
  
  -- Clear master coordinator context (set business_profile and task_generation_context to empty JSON)
  UPDATE master_coordinator_context 
  SET 
    business_profile = '{}'::jsonb,
    task_generation_context = '{}'::jsonb,
    last_updated = NOW()
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_context = ROW_COUNT;
  
  -- Delete user agents
  DELETE FROM user_agents WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_agents = ROW_COUNT;
  
  -- Delete agent conversations
  DELETE FROM agent_chat_conversations WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_conversations = ROW_COUNT;
  
  -- Clear business fields in user_profiles
  UPDATE user_profiles 
  SET 
    brand_name = NULL,
    business_description = NULL,
    business_type = NULL,
    business_location = NULL,
    target_market = NULL,
    current_stage = NULL,
    business_goals = NULL,
    monthly_revenue_goal = NULL,
    years_in_business = NULL,
    team_size = NULL,
    time_availability = NULL,
    current_challenges = NULL,
    sales_channels = NULL,
    social_media_presence = NULL,
    initial_investment_range = NULL,
    primary_skills = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS updated_profiles = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_scores', deleted_scores,
    'deleted_actions', deleted_actions,
    'deleted_tasks', deleted_tasks,
    'cleared_context', deleted_context,
    'deleted_agents', deleted_agents,
    'deleted_conversations', deleted_conversations,
    'cleared_profiles', updated_profiles
  );
END;
$$;
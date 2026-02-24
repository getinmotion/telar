-- Update reset_user_maturity_progress function to delete EVERYTHING including shops, products, etc.
CREATE OR REPLACE FUNCTION public.reset_user_maturity_progress(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_scores integer := 0;
  deleted_actions integer := 0;
  deleted_tasks integer := 0;
  deleted_agents integer := 0;
  deleted_conversations integer := 0;
  updated_profiles integer := 0;
  deleted_shops integer := 0;
  deleted_deliverables integer := 0;
  deleted_onboarding integer := 0;
  deleted_global_profiles integer := 0;
  deleted_materials integer := 0;
  deleted_wishlists integer := 0;
  updated_master_context integer := 0;
  v_shop_id uuid;
BEGIN
  -- Get shop_id if exists (for cascade cleanup)
  SELECT id INTO v_shop_id 
  FROM artisan_shops 
  WHERE user_id = p_user_id 
  LIMIT 1;

  -- Delete wishlists
  DELETE FROM wishlists WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_wishlists = ROW_COUNT;

  -- Delete materials
  DELETE FROM materials WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_materials = ROW_COUNT;

  -- Delete artisan_global_profiles
  DELETE FROM artisan_global_profiles WHERE artisan_id = p_user_id;
  GET DIAGNOSTICS deleted_global_profiles = ROW_COUNT;
  
  -- Delete maturity scores
  DELETE FROM user_maturity_scores WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_scores = ROW_COUNT;
  
  -- Delete maturity actions
  DELETE FROM user_maturity_actions WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_actions = ROW_COUNT;
  
  -- Delete agent tasks
  DELETE FROM agent_tasks WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_tasks = ROW_COUNT;
  
  -- Delete agent deliverables
  DELETE FROM agent_deliverables WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_deliverables = ROW_COUNT;
  
  -- Delete onboarding profiles
  DELETE FROM user_onboarding_profiles WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_onboarding = ROW_COUNT;
  
  -- Clear master_coordinator_context
  UPDATE master_coordinator_context 
  SET 
    context_snapshot = '{}'::jsonb,
    last_updated = NOW()
  WHERE user_id = p_user_id;
  
  -- Delete user agents
  DELETE FROM user_agents WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_agents = ROW_COUNT;
  
  -- Delete agent conversations
  DELETE FROM agent_chat_conversations WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_conversations = ROW_COUNT;
  
  -- Delete agent_conversations (old table)
  DELETE FROM agent_conversations WHERE user_id = p_user_id;
  
  -- Delete artisan shops (CASCADE will handle products, variants, inventory, etc.)
  DELETE FROM artisan_shops WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_shops = ROW_COUNT;
  
  -- Delete artisan_analytics if shop existed
  IF v_shop_id IS NOT NULL THEN
    DELETE FROM artisan_analytics WHERE shop_id = v_shop_id;
  END IF;
  
  -- Reset user_master_context (UPDATE to preserve row)
  UPDATE user_master_context 
  SET 
    business_context = '{}'::jsonb,
    task_generation_context = NULL,
    context_version = 1,
    last_updated = NOW()
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS updated_master_context = ROW_COUNT;
  
  -- Create master_context if doesn't exist
  IF updated_master_context = 0 THEN
    INSERT INTO user_master_context (user_id, business_context, task_generation_context, context_version)
    VALUES (p_user_id, '{}'::jsonb, NULL, 1)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Reset user_progress
  DELETE FROM user_progress WHERE user_id = p_user_id;
  INSERT INTO user_progress (
    user_id, level, experience_points, next_level_xp, 
    completed_missions, current_streak, longest_streak, total_time_spent
  ) VALUES (
    p_user_id, 1, 0, 100, 0, 0, 0, 0
  );
  
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
    'user_id', p_user_id,
    'deleted_scores', deleted_scores,
    'deleted_actions', deleted_actions,
    'deleted_tasks', deleted_tasks,
    'deleted_deliverables', deleted_deliverables,
    'deleted_onboarding', deleted_onboarding,
    'deleted_agents', deleted_agents,
    'deleted_conversations', deleted_conversations,
    'deleted_shops', deleted_shops,
    'deleted_global_profiles', deleted_global_profiles,
    'deleted_materials', deleted_materials,
    'deleted_wishlists', deleted_wishlists,
    'updated_profiles', updated_profiles,
    'updated_master_context', updated_master_context
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION public.reset_user_maturity_progress(uuid) IS 'Resets ALL user progress including shops, products, maturity scores, tasks, conversations, and profile data';
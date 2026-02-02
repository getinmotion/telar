-- Fix search_path in remaining SQL functions to prevent path injection attacks
-- This completes the security hardening started in the previous migration

-- All trigger functions
ALTER FUNCTION public.update_user_master_context_timestamp() SET search_path = 'public';
ALTER FUNCTION public.update_agent_conversations_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_agent_chat_conversations_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_artisan_global_profiles_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_coordinator_context_timestamp() SET search_path = 'public';
ALTER FUNCTION public.update_brand_themes_updated_at() SET search_path = 'public';
ALTER FUNCTION public.calculate_routing_completion_time() SET search_path = 'public';
ALTER FUNCTION public.update_review_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.update_public_profile() SET search_path = 'public';
ALTER FUNCTION public.update_conversation_insights_updated_at() SET search_path = 'public';
ALTER FUNCTION public.increment_usage_count() SET search_path = 'public';
ALTER FUNCTION public.set_order_number() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.check_active_tasks_limit() SET search_path = 'public';
ALTER FUNCTION public.audit_role_changes() SET search_path = 'public';
ALTER FUNCTION public.log_waitlist_access() SET search_path = 'public';
ALTER FUNCTION public.update_learning_patterns() SET search_path = 'public';
ALTER FUNCTION public.update_variant_updated_at() SET search_path = 'public';
ALTER FUNCTION public.check_active_tasks_limit_enhanced() SET search_path = 'public';
ALTER FUNCTION public.validate_and_clean_agent_task() SET search_path = 'public';
ALTER FUNCTION public.sanitize_waitlist_data() SET search_path = 'public';
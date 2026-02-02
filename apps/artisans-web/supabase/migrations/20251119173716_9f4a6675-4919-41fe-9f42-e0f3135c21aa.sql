-- Fix handle_new_user to use UPSERT instead of INSERT
-- This prevents "duplicate key" errors when creating user_progress
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Use UPSERT for user_profiles to prevent duplicates
  INSERT INTO public.user_profiles (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now())
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = now();
  
  -- Use UPSERT for user_progress to prevent duplicates
  INSERT INTO public.user_progress (user_id, created_at, updated_at, experience_points, level, completed_missions, next_level_xp, current_streak, longest_streak, total_time_spent)
  VALUES (NEW.id, now(), now(), 0, 1, 0, 100, 0, 0, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Add comment explaining the change
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function that creates user_profiles and user_progress records when a new user signs up. Uses UPSERT to prevent duplicate key violations.';

-- Add search_path to remaining SECURITY DEFINER functions

-- 1. cleanup_expired_verification_tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < now() - interval '7 days';
END;
$function$;

-- 2. update_user_streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_progress RECORD;
  v_days_since_last_activity INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT * INTO v_progress FROM user_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    RETURN jsonb_build_object('error', 'User progress not found');
  END IF;
  
  v_days_since_last_activity := CURRENT_DATE - v_progress.last_activity_date;
  
  IF v_days_since_last_activity = 0 THEN
    v_new_streak := v_progress.current_streak;
  ELSIF v_days_since_last_activity = 1 THEN
    v_new_streak := v_progress.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;
  
  UPDATE user_progress
  SET 
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(v_progress.longest_streak, v_new_streak),
    'streak_updated', true
  );
END;
$function$;
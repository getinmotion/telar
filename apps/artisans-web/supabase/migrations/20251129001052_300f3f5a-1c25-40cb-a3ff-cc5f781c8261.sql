-- Fix search_path in all SQL functions to prevent path injection attacks
-- This migration secures all SECURITY DEFINER functions

-- Function: increment_maturity_score
DROP FUNCTION IF EXISTS public.increment_maturity_score(uuid, text, integer, text, jsonb);
CREATE OR REPLACE FUNCTION public.increment_maturity_score(user_uuid uuid, score_category text, increment_points integer, action_description text, action_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(idea_validation integer, user_experience integer, market_fit integer, monetization integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_score INTEGER;
  column_name TEXT;
BEGIN
  column_name := CASE score_category
    WHEN 'ideaValidation' THEN 'idea_validation'
    WHEN 'userExperience' THEN 'user_experience'
    WHEN 'marketFit' THEN 'market_fit'
    WHEN 'monetization' THEN 'monetization'
    ELSE NULL
  END;
  
  IF column_name IS NULL THEN
    RAISE EXCEPTION 'Invalid score category: %', score_category;
  END IF;
  
  SELECT * INTO current_record
  FROM user_maturity_scores
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    INSERT INTO user_maturity_scores (user_id, idea_validation, user_experience, market_fit, monetization)
    VALUES (user_uuid, 0, 0, 0, 0)
    RETURNING * INTO current_record;
  END IF;
  
  new_score := LEAST(
    COALESCE(
      CASE column_name
        WHEN 'idea_validation' THEN current_record.idea_validation
        WHEN 'user_experience' THEN current_record.user_experience
        WHEN 'market_fit' THEN current_record.market_fit
        WHEN 'monetization' THEN current_record.monetization
      END, 
      0
    ) + increment_points, 
    100
  );
  
  EXECUTE format(
    'UPDATE user_maturity_scores SET %I = $1, created_at = NOW() WHERE user_id = $2',
    column_name
  ) USING new_score, user_uuid;
  
  INSERT INTO user_maturity_actions (user_id, action_type, category, points, description, metadata)
  VALUES (user_uuid, 'increment', score_category, increment_points, action_description, action_metadata);
  
  RETURN QUERY
  SELECT ms.idea_validation, ms.user_experience, ms.market_fit, ms.monetization
  FROM user_maturity_scores ms
  WHERE ms.user_id = user_uuid
  ORDER BY ms.created_at DESC
  LIMIT 1;
END;
$function$;

-- Function: get_latest_maturity_scores
DROP FUNCTION IF EXISTS public.get_latest_maturity_scores(uuid);
CREATE OR REPLACE FUNCTION public.get_latest_maturity_scores(user_uuid uuid)
 RETURNS TABLE(idea_validation integer, user_experience integer, market_fit integer, monetization integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ums.idea_validation,
    ums.user_experience,
    ums.market_fit,
    ums.monetization,
    ums.created_at
  FROM public.user_maturity_scores ums
  WHERE ums.user_id = user_uuid
  ORDER BY ums.created_at DESC
  LIMIT 1;
END;
$function$;
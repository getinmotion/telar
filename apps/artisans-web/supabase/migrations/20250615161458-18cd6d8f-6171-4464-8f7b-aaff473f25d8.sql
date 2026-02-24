
-- Drop the existing function to redefine it with a new return type
DROP FUNCTION IF EXISTS public.get_latest_maturity_scores(user_uuid uuid);

-- Recreate the function to include the profile_data column
CREATE OR REPLACE FUNCTION public.get_latest_maturity_scores(user_uuid uuid)
 RETURNS TABLE(
   idea_validation integer, 
   user_experience integer, 
   market_fit integer, 
   monetization integer, 
   created_at timestamp with time zone,
   profile_data jsonb
 )
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT 
    ums.idea_validation,
    ums.user_experience,
    ums.market_fit,
    ums.monetization,
    ums.created_at,
    ums.profile_data
  FROM public.user_maturity_scores ums
  WHERE ums.user_id = user_uuid
  ORDER BY ums.created_at DESC
  LIMIT 1;
$function$

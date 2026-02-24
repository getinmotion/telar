-- Sincronizar nombre_marca desde business_profile a conversation_insights
-- para usuarios que ya completaron onboarding pero no tienen el campo en conversation_insights

UPDATE user_master_context
SET 
  conversation_insights = 
    COALESCE(conversation_insights, '{}'::jsonb) || 
    jsonb_build_object('nombre_marca', business_profile->>'brandName'),
  last_updated = now()
WHERE 
  -- Solo actualizar si business_profile tiene brandName
  business_profile->>'brandName' IS NOT NULL
  AND business_profile->>'brandName' != ''
  -- Y conversation_insights no tiene nombre_marca o está vacío
  AND (
    conversation_insights IS NULL 
    OR conversation_insights->>'nombre_marca' IS NULL
    OR conversation_insights->>'nombre_marca' = ''
  );
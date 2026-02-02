-- ============================================
-- MIGRATION: Add DELETE policy for user_maturity_scores
-- Purpose: Allow users to delete their own maturity scores (for testing)
-- ============================================

-- 1. Add DELETE policy so users can reset their own scores
CREATE POLICY "Users can delete their own maturity scores"
ON user_maturity_scores
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Create a secure function to reset user progress
-- This can be called from the client and respects RLS
CREATE OR REPLACE FUNCTION reset_user_maturity_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_scores_count int;
  deleted_actions_count int;
  v_user_id uuid;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Delete all maturity scores for current user
  WITH deleted_scores AS (
    DELETE FROM user_maturity_scores
    WHERE user_id = v_user_id
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_scores_count FROM deleted_scores;

  -- Delete all maturity actions for current user
  WITH deleted_actions AS (
    DELETE FROM user_maturity_actions
    WHERE user_id = v_user_id
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_actions_count FROM deleted_actions;

  -- Reset task_generation_context
  UPDATE user_master_context
  SET 
    task_generation_context = jsonb_set(
      COALESCE(task_generation_context, '{}'::jsonb),
      '{maturity_test_progress}',
      jsonb_build_object(
        'current_block', 0,
        'total_answered', 0,
        'answered_question_ids', '[]'::jsonb,
        'last_updated', now()
      )
    ),
    last_updated = now()
  WHERE user_id = v_user_id;

  -- Return success with counts
  RETURN jsonb_build_object(
    'success', true,
    'deleted_scores', deleted_scores_count,
    'deleted_actions', deleted_actions_count,
    'user_id', v_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_maturity_progress() TO authenticated;

COMMENT ON FUNCTION reset_user_maturity_progress() IS 'Allows users to reset their own maturity progress for testing purposes';

-- Fix RLS security issue: Enable RLS on tables without it

-- Enable RLS on agent_messages if not already enabled
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_messages
-- Users can only view messages from their own conversations
CREATE POLICY "Users can view their own conversation messages"
  ON agent_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM agent_conversations WHERE user_id = auth.uid()
    )
  );

-- Service/system can insert messages for any conversation
CREATE POLICY "Service can insert agent messages"
  ON agent_messages
  FOR INSERT
  WITH CHECK (true);

-- Users can delete their own conversation messages
CREATE POLICY "Users can delete their own conversation messages"
  ON agent_messages
  FOR DELETE
  USING (
    conversation_id IN (
      SELECT id FROM agent_conversations WHERE user_id = auth.uid()
    )
  );

-- Check for agent_conversations table and enable RLS if needed
DO $$
BEGIN
  -- Check if agent_conversations exists and enable RLS
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agent_conversations') THEN
    EXECUTE 'ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY';
    
    -- Create policies for agent_conversations if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'agent_conversations' 
      AND policyname = 'Users can view their own conversations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can view their own conversations" ON agent_conversations FOR SELECT USING (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'agent_conversations' 
      AND policyname = 'Users can create their own conversations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can create their own conversations" ON agent_conversations FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'agent_conversations' 
      AND policyname = 'Users can update their own conversations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can update their own conversations" ON agent_conversations FOR UPDATE USING (auth.uid() = user_id)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'agent_conversations' 
      AND policyname = 'Users can delete their own conversations'
    ) THEN
      EXECUTE 'CREATE POLICY "Users can delete their own conversations" ON agent_conversations FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;
END
$$;

-- Verify all public tables have RLS enabled
-- This query will help identify any remaining tables without RLS
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
  LOOP
    -- Enable RLS on each table if not already enabled
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
      RAISE NOTICE 'Enabled RLS on %.%', r.schemaname, r.tablename;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not enable RLS on %.% - %', r.schemaname, r.tablename, SQLERRM;
    END;
  END LOOP;
END
$$;
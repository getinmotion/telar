-- Hierarchical Memory System Migration
-- Extends agent_knowledge_embeddings for multi-type memory support
-- Creates artisan_global_profiles for supervisor-level memory

-- ========================================
-- 1. Extend agent_knowledge_embeddings
-- ========================================

-- Add new columns for hierarchical memory
ALTER TABLE public.agent_knowledge_embeddings
  ADD COLUMN IF NOT EXISTS memory_type TEXT NOT NULL DEFAULT 'knowledge'
    CHECK (memory_type IN ('conversational', 'profile', 'strategy', 'knowledge')),
  ADD COLUMN IF NOT EXISTS agent_type TEXT,
  ADD COLUMN IF NOT EXISTS artisan_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS importance_score FLOAT DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0;

-- Make document_id nullable (not all memories come from documents)
ALTER TABLE public.agent_knowledge_embeddings
  ALTER COLUMN document_id DROP NOT NULL;

-- Update knowledge_category constraint to include all agent types
ALTER TABLE public.agent_knowledge_embeddings
  DROP CONSTRAINT IF EXISTS agent_knowledge_embeddings_knowledge_category_check;

ALTER TABLE public.agent_knowledge_embeddings
  ADD CONSTRAINT agent_knowledge_embeddings_knowledge_category_check
  CHECK (knowledge_category IN (
    'legal', 'faq', 'general', 'producto', 'pricing', 
    'presencia_digital', 'onboarding'
  ));

-- Create indexes for memory queries
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_memory_type 
  ON public.agent_knowledge_embeddings(memory_type);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_agent_type 
  ON public.agent_knowledge_embeddings(agent_type);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_artisan_id 
  ON public.agent_knowledge_embeddings(artisan_id);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_session_id 
  ON public.agent_knowledge_embeddings(session_id);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_importance 
  ON public.agent_knowledge_embeddings(importance_score DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_embeddings_composite 
  ON public.agent_knowledge_embeddings(artisan_id, agent_type, memory_type, created_at DESC);

-- ========================================
-- 2. Create artisan_global_profiles table
-- ========================================

CREATE TABLE IF NOT EXISTS public.artisan_global_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Artisan identification
  artisan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile content
  profile_summary TEXT NOT NULL,
  key_insights JSONB DEFAULT '{}'::jsonb,
  
  -- Interaction tracking
  interaction_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Maturity snapshot from onboarding
  maturity_snapshot JSONB DEFAULT '{}'::jsonb,
  
  -- Vector embedding for semantic profile search
  embedding VECTOR(1536) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one profile per artisan
  UNIQUE(artisan_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artisan_global_profiles_artisan_id 
  ON public.artisan_global_profiles(artisan_id);

CREATE INDEX IF NOT EXISTS idx_artisan_global_profiles_last_interaction 
  ON public.artisan_global_profiles(last_interaction_at DESC);

-- IVFFlat index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_artisan_global_profiles_vector_ivfflat 
  ON public.artisan_global_profiles 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Enable Row Level Security
ALTER TABLE public.artisan_global_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.artisan_global_profiles 
  FOR SELECT 
  USING (auth.uid() = artisan_id);

CREATE POLICY "Service can manage all profiles" 
  ON public.artisan_global_profiles 
  FOR ALL 
  USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_artisan_global_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_artisan_global_profiles_updated_at_trigger
  BEFORE UPDATE ON public.artisan_global_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_artisan_global_profiles_updated_at();

-- ========================================
-- 3. Enhanced RPC Function for Memory Search
-- ========================================

CREATE OR REPLACE FUNCTION public.search_agent_memory(
  query_embedding VECTOR(1536),
  match_count INTEGER DEFAULT 10,
  filter_memory_type TEXT DEFAULT NULL,
  filter_agent_type TEXT DEFAULT NULL,
  filter_artisan_id UUID DEFAULT NULL,
  filter_session_id TEXT DEFAULT NULL,
  min_importance FLOAT DEFAULT 0.0
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  agent_type TEXT,
  artisan_id UUID,
  session_id TEXT,
  chunk_text TEXT,
  summary TEXT,
  importance_score FLOAT,
  knowledge_category TEXT,
  similarity FLOAT,
  document_filename TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ake.id,
    ake.memory_type,
    ake.agent_type,
    ake.artisan_id,
    ake.session_id,
    ake.chunk_text,
    ake.summary,
    ake.importance_score,
    ake.knowledge_category,
    -- Convert cosine distance to similarity (1 - distance)
    (1 - (ake.embedding <=> query_embedding))::FLOAT AS similarity,
    akd.filename AS document_filename,
    ake.metadata,
    ake.created_at
  FROM
    public.agent_knowledge_embeddings ake
    LEFT JOIN public.agent_knowledge_documents akd ON ake.document_id = akd.id
  WHERE
    -- Apply filters only if provided
    (filter_memory_type IS NULL OR ake.memory_type = filter_memory_type)
    AND (filter_agent_type IS NULL OR ake.agent_type = filter_agent_type)
    AND (filter_artisan_id IS NULL OR ake.artisan_id = filter_artisan_id)
    AND (filter_session_id IS NULL OR ake.session_id = filter_session_id)
    AND (ake.importance_score >= min_importance)
    -- Only search in completed documents (if document-based)
    AND (ake.document_id IS NULL OR akd.processing_status = 'completed')
  ORDER BY
    ake.embedding <=> query_embedding  -- Cosine distance (lower is better)
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_agent_memory TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_agent_memory TO anon;
GRANT EXECUTE ON FUNCTION public.search_agent_memory TO service_role;

-- ========================================
-- 4. Upsert RPC Function for Artisan Profile
-- ========================================

CREATE OR REPLACE FUNCTION public.upsert_artisan_profile(
  p_artisan_id UUID,
  p_profile_summary TEXT,
  p_key_insights JSONB,
  p_maturity_snapshot JSONB,
  p_embedding VECTOR(1536),
  p_increment_interaction BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  id UUID,
  artisan_id UUID,
  profile_summary TEXT,
  interaction_count INTEGER,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_interaction_count INTEGER;
BEGIN
  -- Check if profile exists
  SELECT agp.interaction_count INTO v_interaction_count
  FROM public.artisan_global_profiles agp
  WHERE agp.artisan_id = p_artisan_id;
  
  -- Calculate new interaction count
  IF p_increment_interaction THEN
    v_interaction_count := COALESCE(v_interaction_count, 0) + 1;
  ELSE
    v_interaction_count := COALESCE(v_interaction_count, 0);
  END IF;
  
  -- Upsert profile
  INSERT INTO public.artisan_global_profiles (
    artisan_id,
    profile_summary,
    key_insights,
    maturity_snapshot,
    embedding,
    interaction_count,
    last_interaction_at
  ) VALUES (
    p_artisan_id,
    p_profile_summary,
    p_key_insights,
    p_maturity_snapshot,
    p_embedding,
    v_interaction_count,
    NOW()
  )
  ON CONFLICT (artisan_id) DO UPDATE SET
    profile_summary = EXCLUDED.profile_summary,
    key_insights = EXCLUDED.key_insights,
    maturity_snapshot = EXCLUDED.maturity_snapshot,
    embedding = EXCLUDED.embedding,
    interaction_count = EXCLUDED.interaction_count,
    last_interaction_at = EXCLUDED.last_interaction_at,
    updated_at = NOW();
  
  -- Return updated profile
  RETURN QUERY
  SELECT 
    agp.id AS id,
    agp.artisan_id AS artisan_id,
    agp.profile_summary AS profile_summary,
    agp.interaction_count AS interaction_count,
    agp.updated_at AS updated_at
  FROM public.artisan_global_profiles agp
  WHERE agp.artisan_id = p_artisan_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_artisan_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_artisan_profile TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_artisan_profile TO service_role;

-- ========================================
-- 5. Add helpful comments
-- ========================================

COMMENT ON COLUMN public.agent_knowledge_embeddings.memory_type IS 
  'Type of memory: conversational (interactions), profile (artisan data), strategy (recommendations), knowledge (RAG documents)';

COMMENT ON COLUMN public.agent_knowledge_embeddings.agent_type IS 
  'Agent that created this memory: onboarding, legal, producto, pricing, presencia_digital, faq, supervisor';

COMMENT ON COLUMN public.agent_knowledge_embeddings.importance_score IS 
  'Importance score from 0.0 to 1.0, used for memory prioritization and pruning';

COMMENT ON TABLE public.artisan_global_profiles IS 
  'Global profiles maintained by supervisor for each artisan, updated after significant interactions';

COMMENT ON FUNCTION public.search_agent_memory IS 
  'Enhanced semantic search supporting filters by memory_type, agent_type, artisan_id, session_id, and importance threshold';

COMMENT ON FUNCTION public.upsert_artisan_profile IS 
  'Creates or updates artisan global profile, optionally incrementing interaction count';


-- ============================================================
-- Agents DB Migration — Lightsail PostgreSQL
-- Run against the same DB used by the catalog (getinmotion)
-- All agents tables live in the 'agents' schema to avoid
-- collisions with shop.* and taxonomy.* schemas.
--
-- Usage (with SSH tunnel on port 5433):
--   psql "postgresql://postgres:<password>@localhost:5433/getinmotion" -f migrate_agents_db.sql
-- ============================================================

-- Enable pgvector extension (already enabled for shop.product_embeddings)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents schema
CREATE SCHEMA IF NOT EXISTS agents;

-- ============================================================
-- 1. agent_conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS agents.agent_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      TEXT NOT NULL,
    user_id         UUID,
    agent_type      TEXT NOT NULL,
    user_input      TEXT,
    agent_output    JSONB,
    context         JSONB,
    metadata        JSONB,
    selected_agent  TEXT,
    routing_confidence  DECIMAL(4,3),
    routing_reasoning   TEXT,
    execution_time_ms   INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id
    ON agents.agent_conversations (session_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id
    ON agents.agent_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_type
    ON agents.agent_conversations (agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at
    ON agents.agent_conversations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_created
    ON agents.agent_conversations (session_id, created_at DESC);

-- ============================================================
-- 2. agent_knowledge_documents
-- ============================================================
CREATE TABLE IF NOT EXISTS agents.agent_knowledge_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename            TEXT NOT NULL,
    file_type           TEXT NOT NULL DEFAULT 'text/plain',
    content             TEXT,
    knowledge_category  TEXT NOT NULL,
    tags                TEXT[] DEFAULT '{}',
    uploaded_by         TEXT DEFAULT 'system',
    metadata            JSONB DEFAULT '{}',
    processing_status   TEXT NOT NULL DEFAULT 'pending'
                            CHECK (processing_status IN ('pending','processing','completed','failed')),
    chunk_count         INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category
    ON agents.agent_knowledge_documents (knowledge_category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status
    ON agents.agent_knowledge_documents (processing_status);

-- ============================================================
-- 3. agent_knowledge_embeddings (also used for hierarchical memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS agents.agent_knowledge_embeddings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- RAG fields
    document_id         UUID REFERENCES agents.agent_knowledge_documents(id) ON DELETE CASCADE,
    chunk_index         INTEGER DEFAULT 0,
    chunk_text          TEXT NOT NULL,
    knowledge_category  TEXT NOT NULL DEFAULT 'general',
    embedding           VECTOR(1536),
    metadata            JSONB DEFAULT '{}',
    -- Hierarchical memory fields
    memory_type         TEXT CHECK (memory_type IN ('conversational','profile','strategy','knowledge')),
    agent_type          TEXT,
    artisan_id          UUID,
    session_id          TEXT,
    summary             TEXT,
    importance_score    FLOAT DEFAULT 0.5 CHECK (importance_score >= 0.0 AND importance_score <= 1.0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embeddings_document_id
    ON agents.agent_knowledge_embeddings (document_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_category
    ON agents.agent_knowledge_embeddings (knowledge_category);
CREATE INDEX IF NOT EXISTS idx_embeddings_memory_type
    ON agents.agent_knowledge_embeddings (memory_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_agent_type
    ON agents.agent_knowledge_embeddings (agent_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_artisan_id
    ON agents.agent_knowledge_embeddings (artisan_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_session_id
    ON agents.agent_knowledge_embeddings (session_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_importance
    ON agents.agent_knowledge_embeddings (importance_score);
CREATE INDEX IF NOT EXISTS idx_embeddings_artisan_memory
    ON agents.agent_knowledge_embeddings (artisan_id, memory_type, agent_type, created_at DESC);

-- Vector similarity index (IVFFlat — adjust lists based on row count)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
    ON agents.agent_knowledge_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ============================================================
-- 4. artisan_global_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS agents.artisan_global_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id          UUID NOT NULL UNIQUE,
    profile_summary     TEXT,
    key_insights        JSONB DEFAULT '{}',
    interaction_count   INTEGER NOT NULL DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,
    maturity_snapshot   JSONB DEFAULT '{}',
    embedding           VECTOR(1536),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artisan_profiles_artisan_id
    ON agents.artisan_global_profiles (artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_last_interaction
    ON agents.artisan_global_profiles (last_interaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_vector
    ON agents.artisan_global_profiles
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

-- ============================================================
-- 5. user_onboarding_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS agents.user_onboarding_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID,
    session_id      TEXT NOT NULL,
    nombre          TEXT,
    ubicacion       TEXT,
    tipo_artesania  TEXT,
    -- Maturity levels
    madurez_identidad_artesanal         TEXT,
    madurez_identidad_artesanal_razon   TEXT,
    madurez_identidad_artesanal_tareas  JSONB DEFAULT '[]',
    madurez_realidad_comercial          TEXT,
    madurez_realidad_comercial_razon    TEXT,
    madurez_realidad_comercial_tareas   JSONB DEFAULT '[]',
    madurez_clientes_y_mercado          TEXT,
    madurez_clientes_y_mercado_razon    TEXT,
    madurez_clientes_y_mercado_tareas   JSONB DEFAULT '[]',
    madurez_operacion_y_crecimiento         TEXT,
    madurez_operacion_y_crecimiento_razon   TEXT,
    madurez_operacion_y_crecimiento_tareas  JSONB DEFAULT '[]',
    madurez_general TEXT,
    resumen         TEXT,
    raw_responses   JSONB DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_id
    ON agents.user_onboarding_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_session_id
    ON agents.user_onboarding_profiles (session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tipo_artesania
    ON agents.user_onboarding_profiles (tipo_artesania);

-- ============================================================
-- 6. Helper function: search agent memory (replaces Supabase RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION agents.search_agent_memory(
    query_embedding     VECTOR(1536),
    match_count         INTEGER DEFAULT 10,
    filter_memory_type  TEXT DEFAULT NULL,
    filter_agent_type   TEXT DEFAULT NULL,
    filter_artisan_id   UUID DEFAULT NULL,
    filter_session_id   TEXT DEFAULT NULL,
    min_importance      FLOAT DEFAULT 0.0
)
RETURNS TABLE (
    id              UUID,
    chunk_text      TEXT,
    memory_type     TEXT,
    agent_type      TEXT,
    artisan_id      UUID,
    session_id      TEXT,
    summary         TEXT,
    importance_score FLOAT,
    knowledge_category TEXT,
    similarity      FLOAT,
    created_at      TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
    SELECT
        e.id,
        e.chunk_text,
        e.memory_type,
        e.agent_type,
        e.artisan_id,
        e.session_id,
        e.summary,
        e.importance_score,
        e.knowledge_category,
        1 - (e.embedding <=> query_embedding) AS similarity,
        e.created_at
    FROM agents.agent_knowledge_embeddings e
    WHERE
        (filter_memory_type IS NULL OR e.memory_type = filter_memory_type)
        AND (filter_agent_type  IS NULL OR e.agent_type  = filter_agent_type)
        AND (filter_artisan_id  IS NULL OR e.artisan_id  = filter_artisan_id)
        AND (filter_session_id  IS NULL OR e.session_id  = filter_session_id)
        AND e.importance_score >= min_importance
        AND e.embedding IS NOT NULL
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ============================================================
-- 7. Helper function: search knowledge base (RAG)
-- ============================================================
CREATE OR REPLACE FUNCTION agents.search_agent_knowledge(
    query_embedding     VECTOR(1536),
    match_count         INTEGER DEFAULT 5,
    filter_category     TEXT DEFAULT NULL
)
RETURNS TABLE (
    id              UUID,
    chunk_text      TEXT,
    knowledge_category TEXT,
    similarity      FLOAT,
    document_id     UUID,
    chunk_index     INTEGER
)
LANGUAGE sql STABLE
AS $$
    SELECT
        e.id,
        e.chunk_text,
        e.knowledge_category,
        1 - (e.embedding <=> query_embedding) AS similarity,
        e.document_id,
        e.chunk_index
    FROM agents.agent_knowledge_embeddings e
    WHERE
        (filter_category IS NULL OR e.knowledge_category = filter_category)
        AND (e.memory_type = 'knowledge' OR e.memory_type IS NULL)
        AND e.document_id IS NOT NULL
        AND e.embedding IS NOT NULL
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ============================================================
-- Done
-- ============================================================
-- To verify:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = 'agents';

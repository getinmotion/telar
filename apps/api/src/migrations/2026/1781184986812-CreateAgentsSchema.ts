import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentsSchema1781184986812 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable required extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create agents schema
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS agents`);

        // ============================================================
        // 1. agent_conversations
        // ============================================================
        await queryRunner.query(`
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
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agents.agent_conversations (session_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agents.agent_conversations (user_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_type ON agents.agent_conversations (agent_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agents.agent_conversations (created_at DESC)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_created ON agents.agent_conversations (session_id, created_at DESC)`);

        // ============================================================
        // 2. agent_knowledge_documents
        // ============================================================
        await queryRunner.query(`
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
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category ON agents.agent_knowledge_documents (knowledge_category)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON agents.agent_knowledge_documents (processing_status)`);

        // ============================================================
        // 3. agent_knowledge_embeddings
        // ============================================================
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS agents.agent_knowledge_embeddings (
                id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                document_id         UUID REFERENCES agents.agent_knowledge_documents(id) ON DELETE CASCADE,
                chunk_index         INTEGER DEFAULT 0,
                chunk_text          TEXT NOT NULL,
                knowledge_category  TEXT NOT NULL DEFAULT 'general',
                embedding           VECTOR(1536),
                metadata            JSONB DEFAULT '{}',
                memory_type         TEXT CHECK (memory_type IN ('conversational','profile','strategy','knowledge')),
                agent_type          TEXT,
                artisan_id          UUID,
                session_id          TEXT,
                summary             TEXT,
                importance_score    FLOAT DEFAULT 0.5 CHECK (importance_score >= 0.0 AND importance_score <= 1.0),
                created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON agents.agent_knowledge_embeddings (document_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_category ON agents.agent_knowledge_embeddings (knowledge_category)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_memory_type ON agents.agent_knowledge_embeddings (memory_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_agent_type ON agents.agent_knowledge_embeddings (agent_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_artisan_id ON agents.agent_knowledge_embeddings (artisan_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_session_id ON agents.agent_knowledge_embeddings (session_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_importance ON agents.agent_knowledge_embeddings (importance_score)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_artisan_memory ON agents.agent_knowledge_embeddings (artisan_id, memory_type, agent_type, created_at DESC)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON agents.agent_knowledge_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`);

        // ============================================================
        // 4. artisan_global_profiles
        // ============================================================
        await queryRunner.query(`
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
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_artisan_profiles_artisan_id ON agents.artisan_global_profiles (artisan_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_artisan_profiles_last_interaction ON agents.artisan_global_profiles (last_interaction_at DESC)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_artisan_profiles_vector ON agents.artisan_global_profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)`);

        // ============================================================
        // 5. user_onboarding_profiles
        // ============================================================
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS agents.user_onboarding_profiles (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id         UUID,
                session_id      TEXT NOT NULL,
                nombre          TEXT,
                ubicacion       TEXT,
                tipo_artesania  TEXT,
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
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON agents.user_onboarding_profiles (user_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_onboarding_session_id ON agents.user_onboarding_profiles (session_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_onboarding_tipo_artesania ON agents.user_onboarding_profiles (tipo_artesania)`);

        // ============================================================
        // 6. product_drafts
        // ============================================================
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS agents.product_drafts (
                id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                product_draft_id     UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
                user_id              UUID,
                session_id           TEXT,
                current_step         TEXT,
                status               TEXT NOT NULL DEFAULT 'draft'
                                         CHECK (status IN ('draft', 'preview', 'published', 'cancelled')),
                accumulated_snapshot JSONB NOT NULL DEFAULT '{}',
                created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_drafts_product_draft_id ON agents.product_drafts (product_draft_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_drafts_user_id ON agents.product_drafts (user_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_drafts_session_id ON agents.product_drafts (session_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_drafts_status ON agents.product_drafts (status)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_product_drafts_created_at ON agents.product_drafts (created_at DESC)`);

        // ============================================================
        // Helper functions
        // ============================================================

        // Function: search_agent_memory
        await queryRunner.query(`
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
            $$
        `);

        // Function: search_agent_knowledge
        await queryRunner.query(`
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
            $$
        `);

        // Function: set_updated_at (trigger function)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION agents.set_updated_at()
            RETURNS TRIGGER LANGUAGE plpgsql AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$
        `);

        // Trigger for product_drafts
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_product_drafts_updated_at ON agents.product_drafts`);
        await queryRunner.query(`
            CREATE TRIGGER trg_product_drafts_updated_at
                BEFORE UPDATE ON agents.product_drafts
                FOR EACH ROW EXECUTE FUNCTION agents.set_updated_at()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_product_drafts_updated_at ON agents.product_drafts CASCADE`);

        // Drop functions
        await queryRunner.query(`DROP FUNCTION IF EXISTS agents.set_updated_at() CASCADE`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS agents.search_agent_knowledge(VECTOR, INTEGER, TEXT) CASCADE`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS agents.search_agent_memory(VECTOR, INTEGER, TEXT, TEXT, UUID, TEXT, FLOAT) CASCADE`);

        // Drop tables (in reverse order to respect foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS agents.product_drafts CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS agents.user_onboarding_profiles CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS agents.artisan_global_profiles CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS agents.agent_knowledge_embeddings CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS agents.agent_knowledge_documents CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS agents.agent_conversations CASCADE`);

        // Drop schema
        await queryRunner.query(`DROP SCHEMA IF EXISTS agents CASCADE`);
    }

}

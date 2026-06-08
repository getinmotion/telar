-- ============================================================
-- Product Drafts Migration — Agents Schema
-- Adds the agents.product_drafts table to persist state across
-- the 6-step product creation flow.
--
-- Usage (with SSH tunnel on port 5433):
--   psql "postgresql://postgres:<password>@localhost:5433/getinmotion" -f migrate_product_drafts.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- agents.product_drafts
-- Stores the accumulated product snapshot across creation steps
-- ============================================================
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
);

CREATE INDEX IF NOT EXISTS idx_product_drafts_product_draft_id
    ON agents.product_drafts (product_draft_id);

CREATE INDEX IF NOT EXISTS idx_product_drafts_user_id
    ON agents.product_drafts (user_id);

CREATE INDEX IF NOT EXISTS idx_product_drafts_session_id
    ON agents.product_drafts (session_id);

CREATE INDEX IF NOT EXISTS idx_product_drafts_status
    ON agents.product_drafts (status);

CREATE INDEX IF NOT EXISTS idx_product_drafts_created_at
    ON agents.product_drafts (created_at DESC);

-- ============================================================
-- Auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION agents.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_drafts_updated_at ON agents.product_drafts;
CREATE TRIGGER trg_product_drafts_updated_at
    BEFORE UPDATE ON agents.product_drafts
    FOR EACH ROW EXECUTE FUNCTION agents.set_updated_at();

-- ============================================================
-- Done
-- ============================================================
-- To verify:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema = 'agents' AND table_name = 'product_drafts';

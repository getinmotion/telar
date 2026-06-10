-- ============================================================
-- Cleanup test data left behind by manual local development
-- testing against the agents flows (onboarding, product creation).
--
-- Removes rows associated with the well-known placeholder
-- user_id values used during manual testing:
--   00000000-0000-0000-0000-000000000001
--   11111111-1111-1111-1111-111111111111
--   22222222-2222-2222-2222-222222222222
--   33333333-3333-3333-3333-333333333333
--
-- Safe to run repeatedly (no-op if nothing matches).
-- Run against the target DB, e.g. via the SSH tunnel to stage:
--   PGPASSWORD=... psql -h localhost -p 5433 -U postgres -d getinmotion \
--     -f apps/agents/scripts/cleanup_test_data.sql
-- ============================================================

DELETE FROM agents.product_drafts
WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

DELETE FROM agents.user_onboarding_profiles
WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

DELETE FROM agents.artisan_global_profiles
WHERE artisan_id IN (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

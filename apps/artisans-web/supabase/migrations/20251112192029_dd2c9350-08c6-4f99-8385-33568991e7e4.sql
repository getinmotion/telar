-- COMPLETE USER DATA RESET - DESTRUCTIVE (No Backup)
-- Removes ALL users and ALL associated data from the database
-- Database structure (tables, policies) remains intact

-- Admin data FIRST (references auth.users)
DELETE FROM admin_audit_log;
DELETE FROM access_codes;
DELETE FROM admin_users;

-- Agent-related data
DELETE FROM agent_messages;
DELETE FROM agent_conversations;
DELETE FROM agent_deliverables;
DELETE FROM agent_tasks;

-- Validation and routing data
DELETE FROM step_validations;
DELETE FROM task_routing_analytics;
DELETE FROM task_generation_history;

-- Analytics and behavior
DELETE FROM user_behavior_analytics;
DELETE FROM data_access_audit;

-- Progress and achievements
DELETE FROM user_achievements;
DELETE FROM user_maturity_actions;
DELETE FROM user_maturity_scores;
DELETE FROM user_progress;

-- Insights and context
DELETE FROM conversation_insights;
DELETE FROM user_chat_context;
DELETE FROM master_coordinator_context;
DELETE FROM user_master_context;

-- Onboarding and profiles
DELETE FROM user_onboarding_profiles;
DELETE FROM artisan_global_profiles;
DELETE FROM brand_themes;
DELETE FROM email_verifications;

-- Shop and inventory data
DELETE FROM wishlists;
DELETE FROM product_reviews;
DELETE FROM inventory_movements;
DELETE FROM bom;
DELETE FROM materials;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM store_embeddings;
DELETE FROM artisan_shops;

-- User profiles (public schema)
DELETE FROM user_profiles;

-- Authentication users LAST (cascades to remaining FK relationships)
DELETE FROM auth.users;
-- Clean up orphaned dummy data
-- This migration removes all dummy shops (Taller%) and their associated data

-- Step 1: Delete products belonging to dummy shops
DELETE FROM products 
WHERE shop_id IN (
  SELECT id FROM artisan_shops 
  WHERE shop_name LIKE 'Taller%'
);

-- Step 2: Delete analytics data for dummy shops
DELETE FROM artisan_analytics
WHERE shop_id IN (
  SELECT id FROM artisan_shops 
  WHERE shop_name LIKE 'Taller%'
);

-- Step 3: Delete orders for dummy shops
DELETE FROM orders
WHERE shop_id IN (
  SELECT id FROM artisan_shops 
  WHERE shop_name LIKE 'Taller%'
);

-- Step 4: Delete store embeddings for dummy shops
DELETE FROM store_embeddings
WHERE shop_id IN (
  SELECT id FROM artisan_shops 
  WHERE shop_name LIKE 'Taller%'
);

-- Step 5: Delete the dummy shops themselves
DELETE FROM artisan_shops 
WHERE shop_name LIKE 'Taller%';

-- Step 6: Clean up orphaned user profiles (users that don't exist in auth.users)
DELETE FROM user_profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 7: Clean up orphaned agent tasks
DELETE FROM agent_tasks
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 8: Clean up orphaned agent conversations
DELETE FROM agent_conversations
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 9: Clean up orphaned agent chat conversations
DELETE FROM agent_chat_conversations
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 10: Clean up orphaned materials
DELETE FROM materials
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 11: Clean up orphaned user master context
DELETE FROM user_master_context
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 12: Clean up orphaned master coordinator context
DELETE FROM master_coordinator_context
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add carlos@telar.co to admin_users table (without created_by since it's failing)
INSERT INTO admin_users (email, is_active)
VALUES ('carlos@telar.co', true)
ON CONFLICT (email) DO UPDATE
SET is_active = true, updated_at = NOW();

-- Add admin role to user_roles for carlos@telar.co  
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'carlos@telar.co'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the result
SELECT 
  'admin_users' as source,
  email,
  is_active::text as status
FROM admin_users 
WHERE email = 'carlos@telar.co'

UNION ALL

SELECT 
  'user_roles' as source,
  au.email,
  ur.role::text as status
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'carlos@telar.co'
ORDER BY source, status;

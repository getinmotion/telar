-- Assign moderator role to juanita@telar.co
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'moderator'::app_role
FROM auth.users
WHERE email = 'juanita@telar.co'
ON CONFLICT (user_id, role) DO NOTHING;
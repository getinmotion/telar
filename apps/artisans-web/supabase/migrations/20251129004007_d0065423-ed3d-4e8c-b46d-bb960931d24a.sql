-- Assign admin role to manuel@getinmotion.io
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'manuel@getinmotion.io'
ON CONFLICT (user_id, role) DO NOTHING;
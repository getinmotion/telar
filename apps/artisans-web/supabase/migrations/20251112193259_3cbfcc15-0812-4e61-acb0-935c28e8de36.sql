-- Add manuel@getinmotion.io as admin user
INSERT INTO public.admin_users (email, is_active, created_by)
VALUES ('manuel@getinmotion.io', true, NULL)
ON CONFLICT (email) DO UPDATE 
SET is_active = true, updated_at = now();
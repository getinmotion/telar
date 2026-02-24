-- Fix foreign key constraint on admin_audit_log to allow user deletion
-- This allows admin_user_id to be set to NULL when a user is deleted

ALTER TABLE public.admin_audit_log 
DROP CONSTRAINT IF EXISTS admin_audit_log_admin_user_id_fkey;

ALTER TABLE public.admin_audit_log
ADD CONSTRAINT admin_audit_log_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;
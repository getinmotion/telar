
-- =============================================
-- FIX RLS POLICIES THAT DIRECTLY ACCESS auth.users
-- Replace with SECURITY DEFINER function calls
-- =============================================

-- 1. FIX user_roles TABLE
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate using is_admin() function
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. FIX analytics_events TABLE
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;

CREATE POLICY "Admins can view all analytics events" ON public.analytics_events
FOR SELECT USING (public.is_admin());

-- 3. FIX data_access_audit TABLE
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.data_access_audit;

CREATE POLICY "Admins can view all audit logs" ON public.data_access_audit
FOR SELECT USING (public.is_admin());

-- 4. FIX design_system_history TABLE
DROP POLICY IF EXISTS "Only admins can view design system history" ON public.design_system_history;

CREATE POLICY "Only admins can view design system history" ON public.design_system_history
FOR SELECT USING (public.is_admin());

-- 5. Verify user_roles has policy for users to see their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

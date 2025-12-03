-- =====================================================
-- FIX RLS INFINITE RECURSION
-- =====================================================

-- 1. Create a SECURITY DEFINER function to get the current user's tenant_id
-- This bypasses RLS on the users table to avoid recursion
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

-- 2. Update the "Tenant isolation for users" policy to use the function
DROP POLICY IF EXISTS "Tenant isolation for users" ON public.users;

CREATE POLICY "Tenant isolation for users"
  ON public.users FOR SELECT
  USING (
    -- 1. Admin Owner (view all users in their tenant)
    tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
    -- 2. Tenant Member (view other members in same tenant)
    OR tenant_id = get_my_tenant_id()
    -- 3. Super Admin
    OR is_super_admin()
  );

-- 3. Also update other policies that might use the recursive subquery pattern
-- (Customers, Projects, etc. used "tenant_id IN (SELECT tenant_id FROM public.users ...)")

-- Update Customers Policy
DROP POLICY IF EXISTS "Tenant isolation for customers" ON public.customers;
CREATE POLICY "Tenant isolation for customers"
  ON public.customers FOR ALL
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
    OR tenant_id = get_my_tenant_id()
    OR is_super_admin()
  );

-- Update Projects Policy
DROP POLICY IF EXISTS "Tenant isolation for projects" ON public.projects;
CREATE POLICY "Tenant isolation for projects"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = projects.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

-- Update Time Logs Policy
DROP POLICY IF EXISTS "Tenant isolation for time_logs" ON public.time_logs;
CREATE POLICY "Tenant isolation for time_logs"
  ON public.time_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.customers c ON p.customer_id = c.id
      WHERE p.id = time_logs.project_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert own time logs" ON public.time_logs;
CREATE POLICY "Users can insert own time logs"
  ON public.time_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.customers c ON p.customer_id = c.id
      WHERE p.id = time_logs.project_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

-- Update Todos Policy
DROP POLICY IF EXISTS "Tenant isolation for todos" ON public.todos;
CREATE POLICY "Tenant isolation for todos"
  ON public.todos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = todos.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

-- Update Activities Policy
DROP POLICY IF EXISTS "Tenant isolation for activities" ON public.activities;
CREATE POLICY "Tenant isolation for activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id::text = activities.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert tenant activities" ON public.activities;
CREATE POLICY "Users can insert tenant activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id::text = activities.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id = get_my_tenant_id()
        OR is_super_admin()
      )
    )
  );

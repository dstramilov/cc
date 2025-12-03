-- =====================================================
-- PHASE 1C: UPDATE RLS POLICIES FOR MULTI-TENANCY
-- =====================================================
-- This migration updates all RLS policies to enforce
-- tenant isolation via Hybrid Approach (Owner + Membership)
-- =====================================================

-- =====================================================
-- CUSTOMERS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customer" ON public.customers;
DROP POLICY IF EXISTS "Tenant isolation for customers" ON public.customers;

CREATE POLICY "Tenant isolation for customers"
  ON public.customers FOR ALL
  USING (
    -- 1. Admin Owner
    tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
    -- 2. Tenant Member
    OR tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    -- 3. Super Admin
    OR is_super_admin()
  );

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view team members" ON public.users;
DROP POLICY IF EXISTS "Tenant isolation for users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Users can view members of their own tenant
CREATE POLICY "Tenant isolation for users"
  ON public.users FOR SELECT
  USING (
    -- 1. Admin Owner (view all users in their tenant)
    tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
    -- 2. Tenant Member (view other members in same tenant)
    OR tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    -- 3. Super Admin
    OR is_super_admin()
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (
    id = auth.uid()
  );

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view customer projects" ON public.projects;
DROP POLICY IF EXISTS "Admins/Managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Tenant isolation for projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage tenant projects" ON public.projects;

-- Projects inherit tenancy via customers
CREATE POLICY "Tenant isolation for projects"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = projects.customer_id
      AND (
        -- 1. Admin Owner
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        -- 2. Tenant Member
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        -- 3. Super Admin
        OR is_super_admin()
      )
    )
  );

-- =====================================================
-- TIME LOGS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for time_logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can view customer time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can insert own time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can manage own time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Tenant isolation for time_logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can insert tenant time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can update own time logs" ON public.time_logs;

-- Time Logs inherit tenancy via projects -> customers
CREATE POLICY "Tenant isolation for time_logs"
  ON public.time_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.customers c ON p.customer_id = c.id
      WHERE p.id = time_logs.project_id
      AND (
        -- 1. Admin Owner
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        -- 2. Tenant Member
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        -- 3. Super Admin
        OR is_super_admin()
      )
    )
  );

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
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        OR is_super_admin()
      )
    )
  );

CREATE POLICY "Users can update own time logs"
  ON public.time_logs FOR UPDATE
  USING (
    user_id = auth.uid()
  );

-- =====================================================
-- TODOS TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for todos" ON public.todos;
DROP POLICY IF EXISTS "Users can view their customer todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete todos" ON public.todos;
DROP POLICY IF EXISTS "Tenant isolation for todos" ON public.todos;

-- Todos inherit tenancy via customers
CREATE POLICY "Tenant isolation for todos"
  ON public.todos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = todos.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        OR is_super_admin()
      )
    )
  );

-- =====================================================
-- ACTIVITIES TABLE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Public read access for activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view their customer activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Tenant isolation for activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert tenant activities" ON public.activities;

-- Activities inherit tenancy via customers (customer_id is text, need cast)
CREATE POLICY "Tenant isolation for activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id::text = activities.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        OR is_super_admin()
      )
    )
  );

CREATE POLICY "Users can insert tenant activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id::text = activities.customer_id
      AND (
        c.tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
        OR c.tenant_id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        OR is_super_admin()
      )
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- All tables now enforce tenant isolation
-- Super admins can access all tenant data
-- =====================================================

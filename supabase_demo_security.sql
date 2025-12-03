-- =====================================================
-- DEMO SECURITY CONFIGURATION
-- =====================================================
-- This script relaxes RLS policies to allow public read access
-- for demo/testing purposes. DO NOT USE IN PRODUCTION.
-- =====================================================

-- Drop existing restrictive policies and create permissive ones

-- CUSTOMERS POLICIES
DROP POLICY IF EXISTS "Users can view their own customer" ON public.customers;
DROP POLICY IF EXISTS "Public read access for customers" ON public.customers;
CREATE POLICY "Public read access for customers"
    ON public.customers FOR SELECT
    USING (true);

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view team members" ON public.users;
DROP POLICY IF EXISTS "Public read access for users" ON public.users;
CREATE POLICY "Public read access for users"
    ON public.users FOR SELECT
    USING (true);

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Users can view customer projects" ON public.projects;
DROP POLICY IF EXISTS "Admins/Managers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public read access for projects" ON public.projects;
CREATE POLICY "Public read access for projects"
    ON public.projects FOR SELECT
    USING (true);

-- TIME LOGS POLICIES
DROP POLICY IF EXISTS "Users can view customer time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can insert own time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Users can manage own time logs" ON public.time_logs;
DROP POLICY IF EXISTS "Public read access for time_logs" ON public.time_logs;
CREATE POLICY "Public read access for time_logs"
    ON public.time_logs FOR SELECT
    USING (true);

-- TODOS POLICIES
DROP POLICY IF EXISTS "Users can view their customer todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete todos" ON public.todos;
DROP POLICY IF EXISTS "Public read access for todos" ON public.todos;
CREATE POLICY "Public read access for todos"
    ON public.todos FOR SELECT
    USING (true);

-- ACTIVITIES POLICIES
DROP POLICY IF EXISTS "Users can view their customer activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Public read access for activities" ON public.activities;
CREATE POLICY "Public read access for activities"
    ON public.activities FOR SELECT
    USING (true);

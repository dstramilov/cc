-- Enable RLS on core tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS POLICIES
-- 1. Users can view their own customer details
CREATE POLICY "Users can view their own customer"
    ON public.customers FOR SELECT
    USING (
        id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

-- USERS POLICIES
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (
        id = auth.uid()
    );

-- 2. Users can view other users in their customer (for team visibility)
CREATE POLICY "Users can view team members"
    ON public.users FOR SELECT
    USING (
        customer_id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

-- PROJECTS POLICIES
-- 1. Users can view projects for their customer
CREATE POLICY "Users can view customer projects"
    ON public.projects FOR SELECT
    USING (
        customer_id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

-- 2. Admins/Managers can insert/update projects
CREATE POLICY "Admins/Managers can manage projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND customer_id = projects.customer_id
        )
    );

-- TIME LOGS POLICIES
-- 1. Users can view time logs for their projects/customer
CREATE POLICY "Users can view customer time logs"
    ON public.time_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND (
                -- User is the creator of the log
                time_logs.user_id = u.id
                OR
                -- OR user belongs to the same customer as the project
                EXISTS (
                    SELECT 1 FROM public.projects p
                    WHERE p.id = time_logs.project_id
                    AND p.customer_id = u.customer_id
                )
            )
        )
    );

-- 2. Users can insert their own time logs
CREATE POLICY "Users can insert own time logs"
    ON public.time_logs FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

-- 3. Users can update/delete their own time logs
CREATE POLICY "Users can manage own time logs"
    ON public.time_logs FOR UPDATE
    USING (
        user_id = auth.uid()
    );

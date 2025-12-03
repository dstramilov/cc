-- Enable RLS on core tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS POLICIES
DROP POLICY IF EXISTS "Users can view their own customer" ON public.customers;
CREATE POLICY "Users can view their own customer"
    ON public.customers FOR SELECT
    USING (
        id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (
        id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can view team members" ON public.users;
CREATE POLICY "Users can view team members"
    ON public.users FOR SELECT
    USING (
        customer_id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Users can view customer projects" ON public.projects;
CREATE POLICY "Users can view customer projects"
    ON public.projects FOR SELECT
    USING (
        customer_id IN (
            SELECT customer_id FROM public.users WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins/Managers can manage projects" ON public.projects;
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
DROP POLICY IF EXISTS "Users can view customer time logs" ON public.time_logs;
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

DROP POLICY IF EXISTS "Users can insert own time logs" ON public.time_logs;
CREATE POLICY "Users can insert own time logs"
    ON public.time_logs FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can manage own time logs" ON public.time_logs;
CREATE POLICY "Users can manage own time logs"
    ON public.time_logs FOR UPDATE
    USING (
        user_id = auth.uid()
    );

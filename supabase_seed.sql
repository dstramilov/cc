-- SEED DATA SCRIPT
-- Run this in the Supabase SQL Editor to populate your database with test data.
-- This script bypasses RLS and ensures all data is linked correctly.

BEGIN;

-- 0. FIX CONSTRAINTS
-- Ensure the project_type check constraint matches our application code
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_project_type_check 
    CHECK (project_type IN ('Implementation', 'Optimization', 'Support', 'Custom Dev', 'T&M', 'Fixed', 'Change Order', 'MSP'));

-- 1. Clean up existing data
TRUNCATE TABLE public.activities, public.todos, public.time_logs, public.projects, public.users, public.customers RESTART IDENTITY CASCADE;

DO $$
DECLARE
    -- ID Variables
    cust_id uuid;
    user_admin_id uuid;
    user_pm_id uuid;
    user_cust_id uuid;
    proj_id uuid;
    log_id uuid;
    todo_id uuid;
    
    -- Loop Variables
    i integer;
    j integer;
    k integer;
    
    -- Data Arrays
    project_types text[] := ARRAY['Implementation', 'Optimization', 'Support', 'Custom Dev', 'T&M', 'Fixed', 'Change Order', 'MSP'];
    project_statuses text[] := ARRAY['active', 'on-hold', 'completed'];
    tasks text[] := ARRAY['Design', 'Development', 'Testing', 'Meeting', 'Planning', 'Documentation'];
    todo_titles text[] := ARRAY['Review Requirements', 'Sign off Design', 'UAT Testing', 'Approve Budget', 'Weekly Sync'];
    
    -- Random Helpers
    random_type text;
    random_status text;
    random_task text;
    random_title text;
    random_date date;
    random_hours numeric;
    week_ending_date date;
    
BEGIN
    -- 2. Create Admin and PM Users (linked to a dummy internal customer or just null if nullable, but schema says users.customer_id is FK)
    -- We'll create an "Internal" customer first for our staff
    INSERT INTO public.customers (name, external_id, email, domain, status)
    VALUES ('Antigravity Internal', 'INT-001', 'admin@antigravity.com', 'antigravity.com', 'active')
    RETURNING id INTO cust_id;

    INSERT INTO public.users (name, email, role, customer_id, status)
    VALUES ('Admin User', 'admin@antigravity.com', 'admin', cust_id, 'active')
    RETURNING id INTO user_admin_id;

    INSERT INTO public.users (name, email, role, customer_id, status)
    VALUES ('Project Manager', 'pm@antigravity.com', 'pm', cust_id, 'active')
    RETURNING id INTO user_pm_id;

    -- 3. Generate 10 Customers
    FOR i IN 1..10 LOOP
        INSERT INTO public.customers (name, external_id, email, domain, status)
        VALUES (
            'Customer ' || i, 
            'CUST-' || lpad(i::text, 3, '0'), 
            'contact@customer' || i || '.com', 
            'customer' || i || '.com', 
            CASE WHEN i > 8 THEN 'inactive' ELSE 'active' END
        )
        RETURNING id INTO cust_id;

        -- Create a primary contact user for this customer
        INSERT INTO public.users (name, email, role, customer_id, status)
        VALUES (
            'Contact ' || i, 
            'contact@customer' || i || '.com', 
            'customer', 
            cust_id, 
            'active'
        )
        RETURNING id INTO user_cust_id;

        -- 4. Generate 1-3 Projects per Customer
        FOR j IN 1..(1 + floor(random() * 3)::int) LOOP
            random_type := project_types[1 + floor(random() * array_length(project_types, 1))::int];
            random_status := project_statuses[1 + floor(random() * array_length(project_statuses, 1))::int];
            random_date := (NOW() - (floor(random() * 365) || ' days')::interval)::date;

            INSERT INTO public.projects (
                name, customer_id, project_type, status, 
                budget, hours_budget, start_date, end_date, description
            )
            VALUES (
                'Project ' || j || ' for C' || i,
                cust_id,
                random_type,
                random_status,
                10000 + floor(random() * 90000),
                100 + floor(random() * 500),
                random_date,
                random_date + interval '6 months',
                'A ' || random_type || ' project for Customer ' || i
            )
            RETURNING id INTO proj_id;

            -- Log Project Creation Activity
            INSERT INTO public.activities (customer_id, user_id, activity_type, entity_type, entity_id, description, created_at)
            VALUES (cust_id, user_pm_id, 'project_created', 'project', proj_id::text, 'Created project', random_date);

            -- 5. Generate Time Logs (only for active projects)
            IF random_status = 'active' THEN
                FOR k IN 1..(5 + floor(random() * 10)::int) LOOP
                    random_task := tasks[1 + floor(random() * array_length(tasks, 1))::int];
                    random_hours := (ARRAY[2, 4, 8])[1 + floor(random() * 3)::int];
                    random_date := (random_date + (floor(random() * 30) || ' days')::interval)::date;
                    
                    -- Calculate week ending (next Friday)
                    week_ending_date := random_date + ((5 - EXTRACT(ISODOW FROM random_date)::int + 7) % 7 || ' days')::interval;

                    INSERT INTO public.time_logs (
                        project_id, user_id, task, date, week_ending, hours, status, description
                    )
                    VALUES (
                        proj_id,
                        CASE WHEN random() > 0.5 THEN user_admin_id ELSE user_pm_id END,
                        random_task,
                        random_date,
                        week_ending_date,
                        random_hours,
                        'approved',
                        'Worked on ' || random_task
                    )
                    RETURNING id INTO log_id;

                    -- Log Time Activity
                    INSERT INTO public.activities (customer_id, user_id, activity_type, entity_type, entity_id, description, metadata, created_at)
                    VALUES (
                        cust_id, 
                        user_pm_id, 
                        'time_logged', 
                        'time_log', 
                        log_id::text, 
                        'Logged ' || random_hours || 'h', 
                        jsonb_build_object('hours', random_hours),
                        random_date
                    );
                END LOOP;
            END IF;

            -- 6. Generate Todos
            FOR k IN 1..(2 + floor(random() * 3)::int) LOOP
                random_title := todo_titles[1 + floor(random() * array_length(todo_titles, 1))::int];
                
                INSERT INTO public.todos (
                    customer_id, title, status, due_date, created_by
                )
                VALUES (
                    cust_id,
                    random_title || ' - ' || random_type,
                    CASE WHEN random() > 0.5 THEN 'completed' ELSE 'pending' END,
                    NOW() + interval '1 month',
                    user_pm_id
                )
                RETURNING id INTO todo_id;

                -- Log Todo Activity
                INSERT INTO public.activities (customer_id, user_id, activity_type, entity_type, entity_id, description, created_at)
                VALUES (cust_id, user_pm_id, 'todo_created', 'todo', todo_id::text, 'Created task: ' || random_title, NOW());
            END LOOP;

        END LOOP;
    END LOOP;
END $$;

COMMIT;

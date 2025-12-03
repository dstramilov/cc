-- =====================================================
-- DATA MIGRATION: POPULATE TENANT_ID FOR EXISTING DATA
-- =====================================================
-- This script creates a default tenant and assigns all
-- existing records to it
-- =====================================================

-- 1. CREATE DEFAULT TENANT FOR EXISTING DATA
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Check if default tenant already exists
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE subdomain = 'legacy';

  -- Create if it doesn't exist
  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (
      name,
      subdomain,
      status,
      subscription_tier,
      max_users,
      max_projects,
      max_storage_gb
    ) VALUES (
      'Legacy Instance',
      'legacy',
      'active',
      'enterprise',
      999,  -- Unlimited users
      999,  -- Unlimited projects
      100   -- 100GB storage
    )
    RETURNING id INTO v_tenant_id;

    RAISE NOTICE 'Created default tenant with ID: %', v_tenant_id;
  ELSE
    RAISE NOTICE 'Default tenant already exists with ID: %', v_tenant_id;
  END IF;

  -- 2. UPDATE ALL EXISTING RECORDS WITH TENANT_ID
  
  -- Update customers
  UPDATE public.customers
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % customers', (SELECT COUNT(*) FROM public.customers WHERE tenant_id = v_tenant_id);

  -- Update users
  UPDATE public.users
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % users', (SELECT COUNT(*) FROM public.users WHERE tenant_id = v_tenant_id);

  -- Update projects
  UPDATE public.projects
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % projects', (SELECT COUNT(*) FROM public.projects WHERE tenant_id = v_tenant_id);

  -- Update time_logs
  UPDATE public.time_logs
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % time_logs', (SELECT COUNT(*) FROM public.time_logs WHERE tenant_id = v_tenant_id);

  -- Update todos
  UPDATE public.todos
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % todos', (SELECT COUNT(*) FROM public.todos WHERE tenant_id = v_tenant_id);

  -- Update activities
  UPDATE public.activities
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Updated % activities', (SELECT COUNT(*) FROM public.activities WHERE tenant_id = v_tenant_id);

END $$;

-- 3. MAKE TENANT_ID NOT NULL (after data migration)
ALTER TABLE public.customers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.projects ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.time_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.todos ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.activities ALTER COLUMN tenant_id SET NOT NULL;

-- 4. VERIFY MIGRATION
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION VERIFICATION';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tenants: %', (SELECT COUNT(*) FROM public.tenants);
  RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM public.customers WHERE tenant_id IS NOT NULL);
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM public.users WHERE tenant_id IS NOT NULL);
  RAISE NOTICE 'Projects: %', (SELECT COUNT(*) FROM public.projects WHERE tenant_id IS NOT NULL);
  RAISE NOTICE 'Time Logs: %', (SELECT COUNT(*) FROM public.time_logs WHERE tenant_id IS NOT NULL);
  RAISE NOTICE 'Todos: %', (SELECT COUNT(*) FROM public.todos WHERE tenant_id IS NOT NULL);
  RAISE NOTICE 'Activities: %', (SELECT COUNT(*) FROM public.activities WHERE tenant_id IS NOT NULL);
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- All existing data now belongs to 'legacy' tenant
-- =====================================================

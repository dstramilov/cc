-- =====================================================
-- PHASE 1: MULTI-TENANT DATABASE SCHEMA
-- =====================================================
-- This migration creates the foundational tables for
-- multi-tenant SaaS architecture
-- =====================================================

-- 1. TENANTS TABLE
-- Each registered organization becomes a tenant
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL, -- e.g., 'acme' for acme.yourcentralapp.com
  admin_user_id UUID NOT NULL REFERENCES auth.users(id), -- The owner/admin of the tenant
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  
  -- Subscription limits
  max_users INTEGER DEFAULT 5,
  max_projects INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 1,
  
  -- Trial management
  trial_ends_at TIMESTAMPTZ,
  
  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_admin_user ON public.tenants(admin_user_id);

-- 2. TENANT SUBSCRIPTIONS TABLE
-- Tracks billing and subscription status
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Subscription details
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'incomplete')),
  
  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Pricing
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.tenant_subscriptions(stripe_customer_id);

-- 3. SUPER ADMINS TABLE
-- Platform administrators who can access any tenant
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_super_admins_user ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);

-- 4. TENANT ACCESS LOG TABLE
-- Audit trail for super admin access to tenant data
CREATE TABLE IF NOT EXISTS public.tenant_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES public.super_admins(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  action TEXT NOT NULL, -- 'switch_tenant', 'view_data', 'modify_settings', etc.
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_log_super_admin ON public.tenant_access_log(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_access_log_tenant ON public.tenant_access_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_access_log_accessed_at ON public.tenant_access_log(accessed_at DESC);

-- 5. TENANT CONTEXT FUNCTION
-- Sets the current tenant context for RLS policies
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GET CURRENT TENANT FUNCTION
-- Helper function to get current tenant from context
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. CHECK IF USER IS SUPER ADMIN
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. ENABLE RLS ON NEW TABLES
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_access_log ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR TENANTS TABLE
-- Admin Owners can view their own tenant
CREATE POLICY "Admin Owners can view own tenant"
  ON public.tenants FOR SELECT
  USING (
    admin_user_id = auth.uid()
    OR is_super_admin()
  );

-- Only super admins can modify tenants (for now, or admins can update settings)
CREATE POLICY "Super admins can manage tenants"
  ON public.tenants FOR ALL
  USING (is_super_admin());

-- 10. RLS POLICIES FOR SUBSCRIPTIONS
CREATE POLICY "Admin Owners can view own subscription"
  ON public.tenant_subscriptions FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE admin_user_id = auth.uid())
    OR is_super_admin()
  );

CREATE POLICY "Super admins can manage subscriptions"
  ON public.tenant_subscriptions FOR ALL
  USING (is_super_admin());

-- 11. RLS POLICIES FOR SUPER ADMINS
-- Only super admins can view the super admin list
CREATE POLICY "Super admins can view super admins"
  ON public.super_admins FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admins can manage super admins"
  ON public.super_admins FOR ALL
  USING (is_super_admin());

-- 12. RLS POLICIES FOR ACCESS LOG
-- Super admins can view their own access logs
CREATE POLICY "Super admins can view access logs"
  ON public.tenant_access_log FOR SELECT
  USING (is_super_admin());

CREATE POLICY "System can insert access logs"
  ON public.tenant_access_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- MIGRATION COMPLETE
-- Next: Run supabase_add_tenant_columns.sql to add
-- tenant_id to existing tables
-- =====================================================

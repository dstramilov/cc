-- =====================================================
-- PHASE 1B: ADD TENANT_ID TO EXISTING TABLES
-- =====================================================
-- This migration adds tenant_id column to specific
-- tables for multi-tenant isolation (Hybrid Approach)
-- =====================================================

-- 1. ADD TENANT_ID COLUMNS
-- Add tenant_id to customers table (Top-Level Entity)
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Add tenant_id to users table (Top-Level Entity - for membership)
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- NOTE: projects, time_logs, todos, activities do NOT get tenant_id.
-- They inherit tenancy via customers.

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);

-- 3. CREATE COMPOSITE INDEXES FOR COMMON QUERIES
CREATE INDEX IF NOT EXISTS idx_customers_tenant_status ON public.customers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON public.users(tenant_id, role);

-- =====================================================
-- NOTE: Do NOT make tenant_id NOT NULL yet!
-- First run the data migration script to populate
-- tenant_id for existing records
-- =====================================================

-- After migration, run:
-- ALTER TABLE public.customers ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE public.users ALTER COLUMN tenant_id SET NOT NULL;

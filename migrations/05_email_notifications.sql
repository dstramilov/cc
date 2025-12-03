-- =====================================================
-- EMAIL NOTIFICATION SCHEMA
-- =====================================================
-- Tables for email notifications and preferences
-- =====================================================

-- 1. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Email notification settings
  weekly_summary BOOLEAN DEFAULT true,
  project_updates BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  milestone_reminders BOOLEAN DEFAULT true,
  
  -- Frequency settings
  summary_day TEXT DEFAULT 'friday' CHECK (summary_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
  summary_time TIME DEFAULT '09:00:00',
  
  -- Project-specific preferences (array of project IDs)
  project_filters JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_tenant ON public.notification_preferences(tenant_id);

-- 2. EMAIL QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_tenant ON public.email_queue(tenant_id);

-- 3. ENABLE RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR NOTIFICATION PREFERENCES
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_super_admin()
  );

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (
    user_id = auth.uid()
    AND tenant_id = get_current_tenant_id()
  );

-- 5. RLS POLICIES FOR EMAIL QUEUE
-- Only system and super admins can access email queue
CREATE POLICY "Super admins can view email queue"
  ON public.email_queue FOR SELECT
  USING (is_super_admin());

CREATE POLICY "System can manage email queue"
  ON public.email_queue FOR ALL
  USING (true); -- Service role will handle this

-- =====================================================
-- MIGRATION COMPLETE
-- Email notification system ready
-- =====================================================

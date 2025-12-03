-- =====================================================
-- FIX FOREIGN KEY RELATIONSHIP
-- =====================================================
-- This script ensures the foreign key relationship exists
-- between time_logs.user_id and users.id, and notifies
-- PostgREST to refresh its schema cache.
-- =====================================================

-- First, check if the foreign key constraint exists
-- If it doesn't exist, add it
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'time_logs_user_id_fkey' 
        AND table_name = 'time_logs'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.time_logs 
        ADD CONSTRAINT time_logs_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.users(id);
        
        RAISE NOTICE 'Foreign key constraint time_logs_user_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint time_logs_user_id_fkey already exists';
    END IF;
END $$;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

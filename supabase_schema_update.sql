-- 1. Projects: Hours Budget & Customer ID
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hours_budget INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- 2. Users: Customer ID & Status
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Customers: External ID, Domain, Status
ALTER TABLE customers ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 4. Time Logs: Date & Description
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS description TEXT;

-- Comments
COMMENT ON COLUMN time_logs.description IS 'Optional description of the work done';

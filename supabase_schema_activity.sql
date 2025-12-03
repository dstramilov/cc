-- Create activities table
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  customer_id text not null,
  user_id text not null,
  activity_type text not null, -- 'project_created', 'time_logged', 'todo_created', 'todo_completed', 'document_uploaded'
  entity_type text not null, -- 'project', 'time_log', 'todo', 'document'
  entity_id text not null,
  description text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- Policies
-- 1. Users can view activities for their customer (or all if admin/internal)
create policy "Users can view their customer activities"
  on public.activities for select
  using (
    customer_id in (
      select customer_id::text from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- 2. Users can insert activities for their customer
create policy "Users can insert activities"
  on public.activities for insert
  with check (
    customer_id in (
      select customer_id::text from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Create index for faster queries
create index if not exists idx_activities_customer_created_at 
  on public.activities (customer_id, created_at desc);

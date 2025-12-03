-- Create todos table
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid not null references public.customers(id),
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.users(id)
);

-- Enable RLS
alter table public.todos enable row level security;

-- Policies
-- 1. Users can view todos for their customer (or all if admin/internal)
create policy "Users can view their customer todos"
  on public.todos for select
  using (
    customer_id in (
      select customer_id from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- 2. Users can insert todos for their customer
create policy "Users can insert todos"
  on public.todos for insert
  with check (
    customer_id in (
      select customer_id from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- 3. Users can update todos for their customer
create policy "Users can update todos"
  on public.todos for update
  using (
    customer_id in (
      select customer_id from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- 4. Users can delete todos for their customer
create policy "Users can delete todos"
  on public.todos for delete
  using (
    customer_id in (
      select customer_id from public.users where id = auth.uid()
    )
    or exists (
      select 1 from public.users where id = auth.uid() and role in ('admin', 'manager')
    )
  );

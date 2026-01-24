-- Create system_logs table for System Guardian Agent
create table if not exists public.system_logs (
    id uuid default gen_random_uuid() primary key,
    level text not null check (level in ('info', 'warning', 'error', 'critical')),
    module text not null,
    message text not null,
    meta jsonb default '{}'::jsonb,
    user_id uuid references auth.users(id),
    user_email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_logs enable row level security;

-- Policies
-- Authenticated users can insert logs (the "spies")
create policy "Authenticated users can insert logs"
    on public.system_logs for insert
    to authenticated
    with check (true);

-- Only superadmins/admins can view logs (the "guardian")
create policy "Admins can view logs"
    on public.system_logs for select
    to authenticated
    using (
        auth.uid() in (
            select user_id from employees 
            where role::text in ('superadmin', 'admin')
        )
    );

-- Indexes for performance
create index system_logs_created_at_idx on public.system_logs(created_at desc);
create index system_logs_level_idx on public.system_logs(level);
create index system_logs_module_idx on public.system_logs(module);

-- Create table for storing Wodbuster data snapshots
create table if not exists wodbuster_snapshots (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  center text not null, -- 'sevilla', 'jerez', 'puerto'
  data jsonb not null, -- The full JSON array of athletes
  metrics jsonb, -- Pre-calculated metrics summary (optional)
  
  -- Metadata
  athlete_count integer,
  active_count integer
);

-- Add index for fast retrieval of latest snapshot per center
create index if not exists idx_wodbuster_snapshots_center_created 
on wodbuster_snapshots (center, created_at desc);

-- RLS Policies
alter table wodbuster_snapshots enable row level security;

create policy "Allow read access to authenticated users"
on wodbuster_snapshots for select
to authenticated
using (true);

create policy "Allow insert access to authenticated users"
on wodbuster_snapshots for insert
to authenticated
with check (true);

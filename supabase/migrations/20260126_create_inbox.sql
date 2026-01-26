-- Tabla para guardar los mensajes capturados por el Agente
create table if not exists public.inbox_messages (
  id uuid default gen_random_uuid() primary key,
  sender text not null,        -- Nombre del cliente (ej: Vanessa García)
  content text not null,       -- Contenido del mensaje
  received_at timestamptz default now(),
  status text default 'new',   -- new, replied, archived
  source text default 'wodbuster',
  raw_data jsonb,              -- Datos crudos del scraper
  created_at timestamptz default now()
);

-- Tabla para cola de salidas (Respuestas)
create table if not exists public.outbox_messages (
  id uuid default gen_random_uuid() primary key,
  recipient text not null,
  content text not null,
  status text default 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED_TO_SEND, SENT, FAILED
  created_at timestamptz default now(),
  approved_at timestamptz,
  sent_at timestamptz
);

-- RLS (Políticas de Seguridad)
alter table public.inbox_messages enable row level security;
alter table public.outbox_messages enable row level security;

-- Permitir acceso público/anon para el Agente (en prod restringir más)
create policy "Agent can insert inbox" on public.inbox_messages for insert with check (true);
create policy "Agent can read inbox" on public.inbox_messages for select using (true);

create policy "Agent can read outbox" on public.outbox_messages for select using (true);
create policy "Agent can update outbox" on public.outbox_messages for update using (true);

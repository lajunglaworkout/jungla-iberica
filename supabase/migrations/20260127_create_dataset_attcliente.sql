
-- Tabla para Dataset de Entrenamiento (Memoria del Agente)
create table if not exists public.dataset_attcliente (
  id uuid default gen_random_uuid() primary key,
  original_message text not null,       -- Lo que dijo el cliente
  final_reply text not null,            -- Lo que respondimos finalmente (humano o aprobado)
  context text,                         -- Contexto extra (ej: 'tarifa socio fundador', 'clase llena')
  sentiment text,                       -- Sentimiento detectado (opcional)
  source_message_id uuid references public.inbox_messages(id),
  created_at timestamptz default now()
);

-- RLS
alter table public.dataset_attcliente enable row level security;

create policy "Service Role Full Access Examples" on public.dataset_attcliente
  for all using ( auth.role() = 'service_role' );

create policy "Staff Read Examples" on public.dataset_attcliente
  for select using ( auth.role() = 'authenticated' );

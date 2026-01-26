-- 🔒 LOCKDOWN DE SEGURIDAD
-- Ejecuta esto para cerrar el acceso público que abrimos para pruebas.

-- 1. Borrar políticas viejas (las permisivas)
drop policy if exists "Agent can insert inbox" on public.inbox_messages;
drop policy if exists "Agent can read inbox" on public.inbox_messages;
drop policy if exists "Agent can read outbox" on public.outbox_messages;
drop policy if exists "Agent can update outbox" on public.outbox_messages;

-- 2. Asegurar que RLS está activo
alter table public.inbox_messages enable row level security;
alter table public.outbox_messages enable row level security;

-- 3. Crear política ESTRICTA: Solo Service Role (tu script con la clave secreta) puede tocar esto.
-- El usuario 'anon' (público) NO tendrá acceso.
-- El usuario 'authenticated' (dashboard logueado) SÍ podrá leer para ver el CRM.

create policy "Service Role Full Access" on public.inbox_messages
  for all
  using ( auth.role() = 'service_role' );

create policy "Dashboard Staff Read Access" on public.inbox_messages
  for select
  using ( auth.role() = 'authenticated' );

-- Repetir para Outbox
create policy "Service Role Full Access Outbox" on public.outbox_messages
  for all
  using ( auth.role() = 'service_role' );

create policy "Dashboard Staff Approve Access" on public.outbox_messages
  for update
  using ( auth.role() = 'authenticated' );

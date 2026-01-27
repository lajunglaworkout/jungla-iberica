-- EJECUTAR EN SUPABASE SQL EDITOR --

-- 1. Añadir columnas para respuestas pendientes
ALTER TABLE public.inbox_messages 
ADD COLUMN IF NOT EXISTS reply_to_send TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reply_sent_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS wodbuster_chat_id TEXT DEFAULT NULL;

-- 2. Política RLS para dataset_attcliente (arreglar error 403)
DROP POLICY IF EXISTS "Allow insert attcliente" ON public.dataset_attcliente;
CREATE POLICY "Allow insert attcliente" ON public.dataset_attcliente 
FOR INSERT WITH CHECK (true);

-- 3. Permitir UPDATE en inbox_messages para el frontend
DROP POLICY IF EXISTS "Allow update inbox" ON public.inbox_messages;
CREATE POLICY "Allow update inbox" ON public.inbox_messages 
FOR UPDATE USING (true) WITH CHECK (true);

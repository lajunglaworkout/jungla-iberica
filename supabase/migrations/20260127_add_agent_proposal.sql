
-- Add agent_proposal column to inbox_messages for storing AI drafts
alter table public.inbox_messages 
add column if not exists agent_proposal jsonb;

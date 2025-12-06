create table if not exists public.whatsapp_status_logs (
  id uuid primary key default gen_random_uuid(),
  z_api_message_id text,
  status text,
  phone text,
  event_type text,
  is_group boolean,
  raw_data jsonb,
  created_at timestamp default now()
);

alter table public.whatsapp_status_logs enable row level security;

create policy "allow status insert"
on public.whatsapp_status_logs
for insert
to anon
with check (true);

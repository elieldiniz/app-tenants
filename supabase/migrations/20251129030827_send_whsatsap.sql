create extension if not exists "pgcrypto";

create table if not exists public.whatsapp_messages (
    id uuid primary key default gen_random_uuid(),
    message_text text not null,
    z_api_message_id varchar(255) unique
);

-- active policy --

alter table public.whatsapp_messages enable row level security;

create policy "allow all"
on public.whatsapp_messages
for all
to authenticated
using (true)
with check (true);

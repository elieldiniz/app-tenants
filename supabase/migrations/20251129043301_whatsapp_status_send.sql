create table public.whatsapp_status_send (
  id uuid not null default gen_random_uuid(),
  instance_id text null,
  status text null,
  ids jsonb null,
  momment bigint null,
  phone_device integer null,
  phone text null,
  event_type text null,
  is_group boolean null,
  raw_data jsonb null,
  created_at timestamp without time zone null default now(),
  constraint whatsapp_status_send_pkey primary key (id)
);

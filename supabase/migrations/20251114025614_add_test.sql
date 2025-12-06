create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid,
  status text default 'pronto',
  criado_em timestamp with time zone default now()
);


create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes(id) on delete cascade,
  nome_arquivo text not null,
  caminho text not null,
  tipo text,
  tamanho integer,
  criado_em timestamp with time zone default now()
);

create index documentos_lote_idx on public.documentos (lote_id);

create table public.tokens_de_download (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes(id) on delete cascade,
  token text not null unique,
  criado_em timestamp with time zone default now(),
  usado boolean default false
);

create index tokens_lote_idx on public.tokens_de_download (lote_id);
create index tokens_token_idx on public.tokens_de_download (token);

-- ================================================================
--  Tabla: clinicas_campana
--  Ejecuta esto en Supabase → SQL Editor → Run
-- ================================================================

create table if not exists public.clinicas_campana (
  id              uuid        default gen_random_uuid() primary key,
  place_id        text        unique,

  -- Datos de la clínica
  ciudad          text,
  nombre          text        not null,
  direccion       text,
  telefono        text,
  web             text,
  email           text,
  fuente_email    text,
  valoracion      numeric(3,1),
  n_resenas       integer     default 0,
  resumen         text,

  -- Estado de la campaña
  estado          text        default 'Nuevo',
  fecha_contacto        date,
  n_seguimientos        integer  default 0,
  fecha_ultimo_contacto date,
  asunto_enviado        text,
  notas                 text,

  -- Análisis SEO (lo rellena el workflow de n8n)
  seo_performance  integer,        -- PageSpeed score móvil 0-100
  seo_score        integer,        -- Google SEO score 0-100
  seo_problemas    jsonb   default '[]'::jsonb,  -- array de {type, ok, label}
  seo_resumen      text,           -- resumen GPT de debilidades
  seo_analizado_at timestamptz,

  -- Meta
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Índices
create index if not exists clinicas_campana_estado_idx   on public.clinicas_campana(estado);
create index if not exists clinicas_campana_ciudad_idx   on public.clinicas_campana(ciudad);
create index if not exists clinicas_campana_email_idx    on public.clinicas_campana(email);

-- RLS: solo admins autenticados
alter table public.clinicas_campana enable row level security;

create policy "Authenticated users can read"
  on public.clinicas_campana for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert"
  on public.clinicas_campana for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update"
  on public.clinicas_campana for update
  using (auth.role() = 'authenticated');

-- Trigger updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clinicas_campana_updated_at
  before update on public.clinicas_campana
  for each row execute function public.handle_updated_at();

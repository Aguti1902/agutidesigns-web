-- ================================================================
--  Tabla: clinicas_leads
--  Leads del formulario de la landing de clínicas dentales.
--  Ejecuta en Supabase → SQL Editor → Run
-- ================================================================

create table if not exists public.clinicas_leads (
  id                 uuid        default gen_random_uuid() primary key,

  -- Datos del formulario
  nombre             text        not null,
  clinica            text        not null,
  ciudad             text,
  email              text        not null,
  telefono           text,
  web_actual         text,

  -- Cualificación
  pacientes_objetivo text,       -- "5-10", "10-20", "20-50", "+50"
  situacion          jsonb,      -- array con su situación actual

  -- Gestión
  estado             text        default 'nuevo',
  -- nuevo | contactado | reunión | cerrado | descartado
  notas              text,
  fuente             text        default 'landing-clinicas',

  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists clinicas_leads_estado_idx    on public.clinicas_leads(estado);
create index if not exists clinicas_leads_email_idx     on public.clinicas_leads(email);
create index if not exists clinicas_leads_created_idx   on public.clinicas_leads(created_at desc);

-- RLS
alter table public.clinicas_leads enable row level security;

-- Cualquiera puede insertar (desde la landing pública)
create policy "Public insert leads"
  on public.clinicas_leads for insert
  with check (true);

-- Solo autenticados pueden leer
create policy "Auth read leads"
  on public.clinicas_leads for select
  using (auth.role() = 'authenticated');

create policy "Auth update leads"
  on public.clinicas_leads for update
  using (auth.role() = 'authenticated');

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger leads_updated_at
  before update on public.clinicas_leads
  for each row execute function public.set_updated_at();

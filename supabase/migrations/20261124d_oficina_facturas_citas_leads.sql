-- Facturas (Holded), citas, clientes potenciales, baja/pausa y preferencias de avisos.
alter table public.of_negocios add column if not exists cancela_el timestamptz;
alter table public.of_negocios add column if not exists motivo_baja text;
alter table public.of_negocios add column if not exists pausa_hasta timestamptz;
alter table public.of_negocios add column if not exists preferencias jsonb not null default '{"avisos_email": true, "resumen_semanal": true}'::jsonb;
alter table public.of_negocios add column if not exists holded_contacto text;
alter table public.of_negocios add column if not exists razon_social text;
alter table public.of_negocios add column if not exists nif text;

create table if not exists public.of_facturas (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  stripe_invoice text unique not null, holded_id text, numero text, fecha date not null default current_date, concepto text,
  base numeric(10,2) not null default 0, iva numeric(10,2) not null default 0, total numeric(10,2) not null default 0,
  estado text not null default 'pagada' check (estado in ('pagada','pendiente','error','rectificada')), stripe_url text, error text);
create index if not exists of_facturas_neg on public.of_facturas (negocio_id, fecha desc);

create table if not exists public.of_citas (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  conversacion_id uuid references public.of_conversaciones(id) on delete set null,
  nombre text, contacto text, canal text, servicio text, cuando_texto text, fecha timestamptz,
  estado text not null default 'pendiente' check (estado in ('pendiente','confirmada','cancelada','hecha')), nota text, actualizado timestamptz not null default now());
create index if not exists of_citas_neg on public.of_citas (negocio_id, estado, fecha);

create table if not exists public.of_leads (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  conversacion_id uuid unique references public.of_conversaciones(id) on delete set null,
  nombre text, contacto text, canal text, interes text, importe numeric(10,2),
  etapa text not null default 'nuevo' check (etapa in ('nuevo','contactado','presupuesto','ganado','perdido')), nota text, actualizado timestamptz not null default now());
create index if not exists of_leads_neg on public.of_leads (negocio_id, etapa);

alter table public.of_facturas enable row level security;
alter table public.of_citas enable row level security;
alter table public.of_leads enable row level security;
create policy of_facturas_leer on public.of_facturas for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_citas_leer on public.of_citas for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_leads_leer on public.of_leads for select to authenticated using (oficina_priv.es_mio(negocio_id));
revoke all on public.of_facturas, public.of_citas, public.of_leads from anon;
revoke insert, update, delete on public.of_facturas, public.of_citas, public.of_leads from authenticated;
grant select on public.of_facturas, public.of_citas, public.of_leads to authenticated;
grant all on public.of_facturas, public.of_citas, public.of_leads to service_role;
alter publication supabase_realtime add table public.of_citas, public.of_leads, public.of_facturas;

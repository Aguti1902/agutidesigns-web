-- Ampliaciones de cupo (bolsas extra de un solo mes) por departamento.
alter table public.of_departamentos add column if not exists extra_n integer not null default 0;
alter table public.of_departamentos add column if not exists extra_tokens bigint not null default 0;
alter table public.of_departamentos add column if not exists extra_mes text;

create table if not exists public.of_bolsas (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  depto text not null, mes text not null, unidades integer not null, tokens bigint not null, importe numeric(10,2) not null, stripe_invoice text);
create index if not exists of_bolsas_neg on public.of_bolsas (negocio_id, creado desc);
alter table public.of_bolsas enable row level security;
create policy of_bolsas_leer on public.of_bolsas for select to authenticated using (oficina_priv.es_mio(negocio_id));
revoke all on public.of_bolsas from anon;
grant select on public.of_bolsas to authenticated;
grant all on public.of_bolsas to service_role;

-- El cupo efectivo del mes suma la ampliación si es de este mes.
create or replace view public.of_uso_mes with (security_invoker = true) as
select d.negocio_id, d.depto,
       (d.cupo_n + case when d.extra_mes = to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM') then d.extra_n else 0 end)::integer as cupo_n,
       (d.tokens_mes + case when d.extra_mes = to_char(now() at time zone 'Europe/Madrid', 'YYYY-MM') then d.extra_tokens else 0 end)::bigint as tokens_mes,
       coalesce(sum(c.unidades), 0)::int                    as unidades_mes,
       coalesce(sum(c.tokens_in + c.tokens_out), 0)::bigint as tokens_usados,
       coalesce(sum(c.tokens_in + c.tokens_out) filter (where c.creado >= date_trunc('day', now())), 0)::bigint as tokens_hoy
from public.of_departamentos d
left join public.of_consumo c
  on c.negocio_id = d.negocio_id and c.depto = d.depto and c.creado >= date_trunc('month', now())
group by d.negocio_id, d.depto, d.cupo_n, d.tokens_mes, d.extra_n, d.extra_tokens, d.extra_mes;

-- Personalización de la oficina 3D (colores, mobiliario, logo y rótulos): la edita el propio cliente.
alter table public.of_negocios add column if not exists oficina jsonb not null default '{}'::jsonb;
grant update (oficina) on public.of_negocios to authenticated;

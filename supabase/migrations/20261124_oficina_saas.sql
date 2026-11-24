-- Oficina de IA en modo SaaS: negocios, departamentos contratados, consumo de IA y actividad en vivo.
-- Solo crea tablas nuevas (prefijo of_). No toca quotes, briefings ni nada existente.

create table if not exists public.of_negocios (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  nombre          text not null,
  owner_email     text not null,
  sector          text,
  telefono        text,
  direccion       text,
  horarios        text,
  precios         text,
  tono            text,
  instrucciones   text,
  onboarding      jsonb not null default '{}'::jsonb,
  estado          text not null default 'activo' check (estado in ('activo','impago','pausado','cancelado')),
  importe_mes     integer,
  stripe_customer     text,
  stripe_subscription text unique,
  stripe_session      text unique
);
create index if not exists of_negocios_owner on public.of_negocios (lower(owner_email));

create table if not exists public.of_departamentos (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  negocio_id  uuid not null references public.of_negocios(id) on delete cascade,
  depto       text not null,
  activo      boolean not null default true,
  cupo_n      integer not null,
  tokens_mes  bigint not null,
  unique (negocio_id, depto)
);

-- Cada llamada a la IA deja aquí su gasto. El motor de agentes comprueba el saldo ANTES de llamar.
create table if not exists public.of_consumo (
  id          bigserial primary key,
  creado      timestamptz not null default now(),
  negocio_id  uuid not null references public.of_negocios(id) on delete cascade,
  depto       text not null,
  modelo      text,
  tokens_in   integer not null default 0,
  tokens_out  integer not null default 0,
  coste_usd   numeric(10,5) not null default 0,
  unidades    integer not null default 0  -- conversaciones, citas, posts… lo que cuenta para el cupo visible
);
create index if not exists of_consumo_mes on public.of_consumo (negocio_id, depto, creado);

-- Lo que hacen los agentes, para el feed y la oficina 3D en directo.
create table if not exists public.of_actividad (
  id          bigserial primary key,
  creado      timestamptz not null default now(),
  negocio_id  uuid not null references public.of_negocios(id) on delete cascade,
  depto       text not null,
  tipo        text not null default 'hecho' check (tipo in ('hecho','aviso','pendiente','sistema')),
  texto       text not null,
  detalle     jsonb
);
create index if not exists of_actividad_feed on public.of_actividad (negocio_id, creado desc);

-- Uso del mes en curso por departamento.
create or replace view public.of_uso_mes with (security_invoker = true) as
select d.negocio_id, d.depto, d.cupo_n, d.tokens_mes,
       coalesce(sum(c.unidades), 0)::int                    as unidades_mes,
       coalesce(sum(c.tokens_in + c.tokens_out), 0)::bigint as tokens_usados,
       coalesce(sum(c.tokens_in + c.tokens_out) filter (where c.creado >= date_trunc('day', now())), 0)::bigint as tokens_hoy
from public.of_departamentos d
left join public.of_consumo c
  on c.negocio_id = d.negocio_id and c.depto = d.depto and c.creado >= date_trunc('month', now())
group by d.negocio_id, d.depto, d.cupo_n, d.tokens_mes;

-- Saldo que usa el motor de agentes (service role) antes de cada llamada: mensual y diario (mes / 15).
create or replace function public.of_saldo(p_negocio uuid, p_depto text)
returns table (puede boolean, tokens_restantes bigint, tokens_hoy_restantes bigint, pct numeric)
language sql stable security definer set search_path = public as $$
  select (n.estado = 'activo' and d.activo
          and u.tokens_usados < u.tokens_mes and u.tokens_hoy < u.tokens_mes / 15) as puede,
         greatest(u.tokens_mes - u.tokens_usados, 0),
         greatest(u.tokens_mes / 15 - u.tokens_hoy, 0),
         round(u.tokens_usados::numeric / nullif(u.tokens_mes, 0), 3)
  from public.of_uso_mes u
  join public.of_departamentos d on d.negocio_id = u.negocio_id and d.depto = u.depto
  join public.of_negocios n on n.id = u.negocio_id
  where u.negocio_id = p_negocio and u.depto = p_depto;
$$;
revoke all on function public.of_saldo(uuid, text) from public, anon, authenticated;

-- Seguridad: cada cliente solo ve su negocio (por el correo con el que entra).
alter table public.of_negocios      enable row level security;
alter table public.of_departamentos enable row level security;
alter table public.of_consumo       enable row level security;
alter table public.of_actividad     enable row level security;

create or replace function public.of_es_mio(p_negocio uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.of_negocios n
                 where n.id = p_negocio and lower(n.owner_email) = lower(auth.jwt() ->> 'email'));
$$;

create policy of_negocios_leer on public.of_negocios for select to authenticated
  using (lower(owner_email) = lower(auth.jwt() ->> 'email'));
create policy of_negocios_editar on public.of_negocios for update to authenticated
  using (lower(owner_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(owner_email) = lower(auth.jwt() ->> 'email'));
create policy of_departamentos_leer on public.of_departamentos for select to authenticated using (public.of_es_mio(negocio_id));
create policy of_consumo_leer       on public.of_consumo       for select to authenticated using (public.of_es_mio(negocio_id));
create policy of_actividad_leer     on public.of_actividad     for select to authenticated using (public.of_es_mio(negocio_id));

-- El cliente solo puede editar los datos de su negocio, nunca estado, importe ni Stripe.
revoke insert, update, delete on public.of_negocios from anon, authenticated;
grant update (sector, telefono, direccion, horarios, precios, tono, instrucciones, onboarding) on public.of_negocios to authenticated;
revoke insert, update, delete on public.of_departamentos, public.of_consumo, public.of_actividad from anon, authenticated;
revoke all on public.of_negocios, public.of_departamentos, public.of_consumo, public.of_actividad from anon;
grant select on public.of_uso_mes to authenticated;

-- Feed en directo
alter publication supabase_realtime add table public.of_actividad;

-- Métricas (web y redes), vídeos, material, competencia y chat con el equipo.
create table if not exists public.of_metricas (
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  fuente text not null, fecha date not null, datos jsonb not null default '{}'::jsonb, actualizado timestamptz not null default now(),
  primary key (negocio_id, fuente, fecha));

create table if not exists public.of_videos (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  titulo text not null, guion jsonb not null default '{}'::jsonb,
  estado text not null default 'guion' check (estado in ('guion','voz','montaje','revision','aprobado','publicado','descartado')),
  voz text, estilo text, audio_path text, video_path text, nota text, actualizado timestamptz not null default now());
create index if not exists of_videos_neg on public.of_videos (negocio_id, creado desc);

create table if not exists public.of_material (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  tipo text not null check (tipo in ('foto','video','logo','documento','carpeta')), nombre text not null, ruta text, url text, tamano bigint, etiquetas text[]);
create index if not exists of_material_neg on public.of_material (negocio_id, creado desc);

create table if not exists public.of_competidores (
  id uuid primary key default gen_random_uuid(), creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  nombre text not null, web text, place_id text, direccion text, nota numeric(2,1), resenas int, datos jsonb not null default '{}'::jsonb, actualizado timestamptz);
create index if not exists of_competidores_neg on public.of_competidores (negocio_id);

create table if not exists public.of_chat (
  id bigint generated always as identity primary key, creado timestamptz not null default now(),
  negocio_id uuid not null references public.of_negocios(id) on delete cascade,
  de text not null check (de in ('tu','equipo')), texto text not null, detalle jsonb not null default '{}'::jsonb);
create index if not exists of_chat_neg on public.of_chat (negocio_id, creado desc);

alter table public.of_metricas enable row level security;
alter table public.of_videos enable row level security;
alter table public.of_material enable row level security;
alter table public.of_competidores enable row level security;
alter table public.of_chat enable row level security;
create policy of_metricas_leer on public.of_metricas for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_videos_leer on public.of_videos for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_material_leer on public.of_material for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_material_crear on public.of_material for insert to authenticated with check (oficina_priv.es_mio(negocio_id));
create policy of_material_borrar on public.of_material for delete to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_competidores_leer on public.of_competidores for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_chat_leer on public.of_chat for select to authenticated using (oficina_priv.es_mio(negocio_id));
revoke all on public.of_metricas, public.of_videos, public.of_material, public.of_competidores, public.of_chat from anon;
grant select on public.of_metricas, public.of_videos, public.of_competidores, public.of_chat to authenticated;
grant select, insert, delete on public.of_material to authenticated;
grant all on public.of_metricas, public.of_videos, public.of_material, public.of_competidores, public.of_chat to service_role;
grant usage, select on sequence public.of_chat_id_seq to service_role;

-- Material del negocio en Storage (privado): cada negocio solo ve su carpeta (<negocio_id>/...).
insert into storage.buckets (id, name, public, file_size_limit) values ('oficina-material', 'oficina-material', false, 104857600)
  on conflict (id) do update set file_size_limit = excluded.file_size_limit;
create policy of_material_obj_leer on storage.objects for select to authenticated
  using (bucket_id = 'oficina-material' and (case when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then oficina_priv.es_mio(((storage.foldername(name))[1])::uuid) else false end));
create policy of_material_obj_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'oficina-material' and (case when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then oficina_priv.es_mio(((storage.foldername(name))[1])::uuid) else false end));
create policy of_material_obj_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'oficina-material' and (case when (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' then oficina_priv.es_mio(((storage.foldername(name))[1])::uuid) else false end));

do $$ begin
  alter publication supabase_realtime add table public.of_videos, public.of_chat;
exception when others then null; end $$;

-- Último mensaje de cada conversación (para la lista) e informe por correo configurable.
alter table public.of_conversaciones add column if not exists ultimo_texto text;

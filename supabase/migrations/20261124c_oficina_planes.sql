-- Plan mensual (con 7 días de prueba) o anual (-20 %, con web incluida desde 3 departamentos).
alter table public.of_negocios add column if not exists periodo text not null default 'mes' check (periodo in ('mes','anio'));
alter table public.of_negocios add column if not exists prueba_hasta timestamptz;
alter table public.of_negocios add column if not exists web_incluida boolean not null default false;
alter table public.of_negocios add column if not exists web_estado text check (web_estado in ('pendiente','solicitada','en_curso','entregada'));
alter table public.of_negocios add column if not exists web_detalle jsonb;

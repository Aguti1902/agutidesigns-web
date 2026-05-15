-- ================================================================
--  Tabla: campana_borradores
--  Emails generados por IA listos para revisar antes de enviar.
--  Ejecuta en Supabase → SQL Editor → Run
-- ================================================================

create table if not exists public.campana_borradores (
  id          uuid        default gen_random_uuid() primary key,
  clinica_id  uuid        references public.clinicas_campana(id) on delete set null,

  -- Destinatario
  nombre      text        not null,
  ciudad      text,
  to_email    text        not null,

  -- Contenido del email
  subject     text        not null,
  html_body   text        not null,
  seo_resumen text,         -- resumen de problemas detectados

  -- Estado del borrador
  estado      text        default 'borrador',
  -- borrador  → generado, pendiente de revisión
  -- aprobado  → revisado y listo para enviar
  -- enviado   → enviado con éxito
  -- descartado→ rechazado manualmente

  sent_at     timestamptz,
  error_msg   text,
  created_at  timestamptz default now()
);

create index if not exists campana_borradores_estado_idx   on public.campana_borradores(estado);
create index if not exists campana_borradores_email_idx    on public.campana_borradores(to_email);
create index if not exists campana_borradores_clinica_idx  on public.campana_borradores(clinica_id);

alter table public.campana_borradores enable row level security;

create policy "Auth can read borradores"
  on public.campana_borradores for select
  using (auth.role() = 'authenticated');

create policy "Auth can insert borradores"
  on public.campana_borradores for insert
  with check (auth.role() = 'authenticated');

create policy "Auth can update borradores"
  on public.campana_borradores for update
  using (auth.role() = 'authenticated');

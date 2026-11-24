-- Retención de IRPF en las facturas y recordatorios de cita enviados.
alter table public.of_facturas add column if not exists retencion numeric(10,2) not null default 0;
alter table public.of_citas add column if not exists recordado timestamptz;

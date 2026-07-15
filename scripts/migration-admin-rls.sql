-- ================================================================
--  AGUTIDESIGNS — Fix RLS para panel admin con anon key
--  Ejecuta en: Supabase → SQL Editor → Run
--  Necesario porque el admin usa localStorage (no Supabase Auth)
-- ================================================================

-- ── quotes: permitir lectura y update con anon key ────────────
drop policy if exists "Admin full access quotes"   on public.quotes;
drop policy if exists "Admin anon read quotes"     on public.quotes;
drop policy if exists "Admin anon update quotes"   on public.quotes;

-- Lectura pública (el panel admin usa anon key)
create policy "Admin anon read quotes"
  on public.quotes for select
  using (true);

-- Update público (para cambiar status y notas desde el panel)
create policy "Admin anon update quotes"
  on public.quotes for update
  using (true)
  with check (true);

-- Insert sigue siendo público (para la calculadora)
-- La política "Public insert quotes" ya existe, no hace falta crearla

-- ── clinicas_leads: lectura y update con anon key ─────────────
drop policy if exists "Auth read leads"    on public.clinicas_leads;
drop policy if exists "Auth update leads"  on public.clinicas_leads;
drop policy if exists "Admin anon read leads"   on public.clinicas_leads;
drop policy if exists "Admin anon update leads"  on public.clinicas_leads;

create policy "Admin anon read leads"
  on public.clinicas_leads for select
  using (true);

create policy "Admin anon update leads"
  on public.clinicas_leads for update
  using (true)
  with check (true);

select '✅ RLS actualizado — el panel admin puede leer y actualizar datos' as resultado;

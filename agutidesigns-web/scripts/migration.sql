-- ============================================================
--  AGUTIDESIGNS — Migración completa
--  Pega esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. TABLA: quotes (se crea cuando alguien envía la calculadora)
create table if not exists public.quotes (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  name            text,
  email           text,
  phone           text,
  web_type        text,
  pages           text,
  timeline        text,
  product_count   text,
  ai_features     text[],
  extra_features  text[],
  total           integer,
  monthly         integer default 0,
  breakdown       jsonb,
  status          text default 'pending',
  admin_notes     text
);

-- 2. TABLA: briefings (rellena el cliente tras pagar)
create table if not exists public.briefings (
  id                   uuid default gen_random_uuid() primary key,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  quote_id             uuid references public.quotes(id) on delete cascade,
  user_id              uuid,
  status               text default 'draft',
  company_name         text,
  company_description  text,
  sector               text,
  founded_year         text,
  team_size            text,
  target_audience      text,
  customer_pain        text,
  unique_value         text,
  main_cta             text,
  services_list        text,
  team_members         text,
  awards               text,
  projects_list        text,
  project_categories   text,
  product_categories   text,
  price_range          text,
  product_variations   text,
  stock_info           text,
  shipping_info        text,
  return_policy        text,
  payment_methods      text,
  payment_gateway      text,
  features_list        text,
  pricing_model        text,
  integrations         text,
  tech_stack           text,
  extra_features       text,
  pages_content        text,
  key_messages         text,
  testimonials         text,
  process_info         text,
  brand_colors         text,
  typography           text,
  tone                 text,
  logo_url             text,
  image_urls           text[],
  reference_sites      text,
  style_likes          text,
  style_dislikes       text,
  competitors          text,
  social_links         text,
  phone                text,
  address              text,
  additional_notes     text
);

-- 3. ÍNDICES
create index if not exists idx_quotes_email    on public.quotes(email);
create index if not exists idx_quotes_status   on public.quotes(status);
create index if not exists idx_briefings_quote on public.briefings(quote_id);

-- 4. ROW LEVEL SECURITY
alter table public.quotes    enable row level security;
alter table public.briefings enable row level security;

-- 5. POLÍTICAS — quotes
drop policy if exists "Admin full access quotes" on public.quotes;
drop policy if exists "Public insert quotes"     on public.quotes;

create policy "Admin full access quotes"
  on public.quotes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public insert quotes"
  on public.quotes for insert
  with check (true);

-- 6. POLÍTICAS — briefings
drop policy if exists "User can manage own briefing" on public.briefings;
drop policy if exists "Admin read all briefings"     on public.briefings;

create policy "User can manage own briefing"
  on public.briefings for all
  using (auth.uid()::text = user_id::text)
  with check (auth.uid()::text = user_id::text);

create policy "Admin read all briefings"
  on public.briefings for select
  using (auth.role() = 'authenticated');

-- 7. POLÍTICAS — Storage (bucket: briefing-assets)
drop policy if exists "Briefing upload authenticated" on storage.objects;
drop policy if exists "Briefing public read"          on storage.objects;
drop policy if exists "Briefing owner delete"         on storage.objects;

create policy "Briefing upload authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'briefing-assets');

create policy "Briefing public read"
  on storage.objects for select
  to public
  using (bucket_id = 'briefing-assets');

create policy "Briefing owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'briefing-assets');

-- ✅ ¡Listo!
select 'Migración completada correctamente 🎉' as resultado;

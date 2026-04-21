/**
 * AGUTIDESIGNS — Supabase Setup Script
 * Crea tablas, políticas RLS y bucket de storage automáticamente.
 */

const SUPABASE_URL     = 'https://uwbbzqjcxtryatxpxmvw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmJ6cWpjeHRyeWF0eHB4bXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4OTU0NywiZXhwIjoyMDkxMTY1NTQ3fQ.SedGMPa-gf_otjzxFZmhvhcrU6UMtweLyDiwXI3J8u8';
const PROJECT_REF      = 'uwbbzqjcxtryatxpxmvw';

const headers = {
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
};

// ── Helper: ejecutar SQL via Management API ──
async function runSQL(sql, description) {
  process.stdout.write(`⏳  ${description}... `);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) { console.log('✅'); return true; }
  // Fallback: intentar via REST admin
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql }),
  });
  if (res2.ok) { console.log('✅'); return true; }
  console.log(`❌ (${res.status}) ${JSON.stringify(body).slice(0, 120)}`);
  return false;
}

// ── Helper: crear bucket de storage ──
async function createBucket(name, isPublic) {
  process.stdout.write(`⏳  Crear bucket "${name}"... `);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: name, name, public: isPublic }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok || body.error === 'Duplicate') { console.log('✅'); return true; }
  console.log(`❌ ${JSON.stringify(body)}`);
  return false;
}

// ── Helper: política de storage ──
async function createStoragePolicy(sql, description) {
  return runSQL(sql, description);
}

// ═══════════════════════════════════════
//  SQL MIGRATIONS
// ═══════════════════════════════════════
const SQL = {

  enableExtensions: `
    create extension if not exists "uuid-ossp";
  `,

  createQuotes: `
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
  `,

  createBriefings: `
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
  `,

  createIndexes: `
    create index if not exists idx_quotes_email  on public.quotes (email);
    create index if not exists idx_quotes_status on public.quotes (status);
    create index if not exists idx_briefings_quote_id on public.briefings (quote_id);
  `,

  enableRLS: `
    alter table public.quotes    enable row level security;
    alter table public.briefings enable row level security;
  `,

  dropOldPolicies: `
    drop policy if exists "Admin full access quotes"    on public.quotes;
    drop policy if exists "Public insert quotes"        on public.quotes;
    drop policy if exists "User can manage own briefing" on public.briefings;
    drop policy if exists "Admin read all briefings"    on public.briefings;
  `,

  policiesQuotes: `
    create policy "Admin full access quotes"
      on public.quotes for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');

    create policy "Public insert quotes"
      on public.quotes for insert
      with check (true);
  `,

  policiesBriefings: `
    create policy "User can manage own briefing"
      on public.briefings for all
      using (auth.uid()::text = user_id::text)
      with check (auth.uid()::text = user_id::text);

    create policy "Admin read all briefings"
      on public.briefings for select
      using (auth.role() = 'authenticated');
  `,

  storagePolicies: `
    create policy if not exists "Authenticated upload"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'briefing-assets');

    create policy if not exists "Public read"
      on storage.objects for select
      to public
      using (bucket_id = 'briefing-assets');

    create policy if not exists "Owner delete"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'briefing-assets');
  `,
};

// ═══════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════
async function main() {
  console.log('\n🚀  AGUTIDESIGNS — Supabase Setup\n');

  const steps = [
    ['Habilitar extensiones',          SQL.enableExtensions],
    ['Crear tabla quotes',             SQL.createQuotes],
    ['Crear tabla briefings',          SQL.createBriefings],
    ['Crear índices',                  SQL.createIndexes],
    ['Habilitar RLS',                  SQL.enableRLS],
    ['Limpiar políticas antiguas',     SQL.dropOldPolicies],
    ['Políticas RLS — quotes',         SQL.policiesQuotes],
    ['Políticas RLS — briefings',      SQL.policiesBriefings],
  ];

  let sqlOk = true;
  for (const [desc, sql] of steps) {
    const ok = await runSQL(sql.trim(), desc);
    if (!ok) sqlOk = false;
  }

  console.log('');
  await createBucket('briefing-assets', true);
  await runSQL(SQL.storagePolicies.trim(), 'Políticas Storage');

  console.log('\n────────────────────────────────────');
  if (sqlOk) {
    console.log('✅  ¡Todo configurado correctamente!');
    console.log('   Tu base de datos está lista para usar.');
  } else {
    console.log('⚠️   Algunas queries fallaron (probablemente el Management API');
    console.log('    requiere un Personal Access Token en lugar de service_role).');
    console.log('    El bucket SÍ debería haberse creado.');
    console.log('\n    ➡️  Abre el SQL Editor en Supabase y pega el contenido');
    console.log('    de SUPABASE_SETUP.md para crear las tablas manualmente.');
  }
  console.log('────────────────────────────────────\n');
}

main().catch(console.error);

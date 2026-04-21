import pg from 'pg';
const { Client } = pg;

const PROJECT_REF = 'uwbbzqjcxtryatxpxmvw';
const DB_PASSWORD = '5o+dydIRbhPKQWT9XLDstN+yGsDpvw1qhGQCJD3/xlI8kgr7e2V1fF00Pwz/BZbPadHlYRN4ip3/Ew0tO4Xsfw==';

const client = new Client({
  host:     `db.${PROJECT_REF}.supabase.co`,
  port:     5432,
  database: 'postgres',
  user:     'postgres',
  password: DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
});

const MIGRATIONS = [
  {
    name: 'Crear tabla quotes',
    sql: `
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
  },
  {
    name: 'Crear tabla briefings',
    sql: `
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
  },
  {
    name: 'Crear índices',
    sql: `
      create index if not exists idx_quotes_email      on public.quotes(email);
      create index if not exists idx_quotes_status     on public.quotes(status);
      create index if not exists idx_briefings_quote   on public.briefings(quote_id);
    `,
  },
  {
    name: 'Habilitar RLS',
    sql: `
      alter table public.quotes    enable row level security;
      alter table public.briefings enable row level security;
    `,
  },
  {
    name: 'Limpiar políticas antiguas',
    sql: `
      drop policy if exists "Admin full access quotes"     on public.quotes;
      drop policy if exists "Public insert quotes"         on public.quotes;
      drop policy if exists "User can manage own briefing" on public.briefings;
      drop policy if exists "Admin read all briefings"     on public.briefings;
    `,
  },
  {
    name: 'Políticas RLS — quotes',
    sql: `
      create policy "Admin full access quotes"
        on public.quotes for all
        using (auth.role() = 'authenticated')
        with check (auth.role() = 'authenticated');

      create policy "Public insert quotes"
        on public.quotes for insert
        with check (true);
    `,
  },
  {
    name: 'Políticas RLS — briefings',
    sql: `
      create policy "User can manage own briefing"
        on public.briefings for all
        using (auth.uid()::text = user_id::text)
        with check (auth.uid()::text = user_id::text);

      create policy "Admin read all briefings"
        on public.briefings for select
        using (auth.role() = 'authenticated');
    `,
  },
  {
    name: 'Políticas Storage (briefing-assets)',
    sql: `
      do $$
      begin
        if not exists (
          select 1 from pg_policies
          where schemaname = 'storage' and tablename = 'objects'
          and policyname = 'Briefing upload authenticated'
        ) then
          execute $p$
            create policy "Briefing upload authenticated"
              on storage.objects for insert
              to authenticated
              with check (bucket_id = 'briefing-assets')
          $p$;
        end if;

        if not exists (
          select 1 from pg_policies
          where schemaname = 'storage' and tablename = 'objects'
          and policyname = 'Briefing public read'
        ) then
          execute $p$
            create policy "Briefing public read"
              on storage.objects for select
              to public
              using (bucket_id = 'briefing-assets')
          $p$;
        end if;
      end $$;
    `,
  },
];

async function run() {
  console.log('\n🚀  AGUTIDESIGNS — Supabase Migration\n');

  try {
    await client.connect();
    console.log('✅  Conectado a Supabase Postgres\n');
  } catch (e) {
    console.error('❌  No se pudo conectar:', e.message);
    console.log('\n💡  Necesito el password de la base de datos.');
    console.log('    Ve a Supabase → Settings → Database → Database password');
    process.exit(1);
  }

  let allOk = true;
  for (const { name, sql } of MIGRATIONS) {
    process.stdout.write(`⏳  ${name}... `);
    try {
      await client.query(sql);
      console.log('✅');
    } catch (e) {
      console.log(`❌  ${e.message.split('\n')[0]}`);
      allOk = false;
    }
  }

  await client.end();

  console.log('\n────────────────────────────────────');
  if (allOk) {
    console.log('🎉  ¡Base de datos configurada al 100%!');
    console.log('    Tablas: quotes, briefings');
    console.log('    Bucket: briefing-assets ✅');
    console.log('    RLS:    activado ✅');
  } else {
    console.log('⚠️   Algunas migraciones fallaron. Revisa los errores arriba.');
  }
  console.log('────────────────────────────────────\n');
}

run();

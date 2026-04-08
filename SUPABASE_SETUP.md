# Configuración de Supabase

## 1. Crear proyecto en Supabase
Ve a https://supabase.com y crea un nuevo proyecto.

## 2. Ejecutar este SQL en el Editor de Supabase
Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta esto:

```sql
-- Tabla de presupuestos (se crea al enviar la calculadora)
create table public.quotes (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  name          text,
  email         text,
  phone         text,
  web_type      text,
  pages         text,
  timeline      text,
  product_count text,
  ai_features   text[],
  extra_features text[],
  total         integer,
  monthly       integer default 0,
  breakdown     jsonb,
  status        text default 'pending',  -- pending | sent | approved | in_progress | completed | rejected
  admin_notes   text
);

-- Tabla de briefings (rellena el cliente)
create table public.briefings (
  id                  uuid default gen_random_uuid() primary key,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  quote_id            uuid references public.quotes(id) on delete cascade,
  user_id             uuid references auth.users(id),
  status              text default 'draft',  -- draft | submitted
  company_name        text,
  company_description text,
  sector              text,
  founded_year        text,
  target_audience     text,
  customer_pain       text,
  brand_colors        text,
  typography          text,
  tone                text,
  logo_url            text,
  pages_content       text,
  key_messages        text,
  reference_sites     text,
  style_likes         text,
  style_dislikes      text,
  competitors         text,
  social_links        text,
  phone               text,
  address             text,
  additional_notes    text
);

-- Índices para búsquedas frecuentes
create index on public.quotes (email);
create index on public.quotes (status);
create index on public.briefings (quote_id);

-- RLS: habilitar Row Level Security
alter table public.quotes enable row level security;
alter table public.briefings enable row level security;

-- Políticas para quotes:
-- El admin (autenticado) puede leer y escribir todo
create policy "Admin full access quotes"
  on public.quotes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Inserción pública desde la calculadora (sin auth)
create policy "Public insert quotes"
  on public.quotes
  for insert
  with check (true);

-- Políticas para briefings:
-- Los usuarios autenticados pueden ver y editar sus propios briefings
create policy "User can manage own briefing"
  on public.briefings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- El admin puede leer todos los briefings
create policy "Admin read all briefings"
  on public.briefings
  for select
  using (auth.role() = 'authenticated');
```

## 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (`agutidesigns-web/.env`) con:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_ADMIN_EMAIL=tu@email.com
```

Encuentra los valores en: **Supabase → Project Settings → API**

## 4. Configurar Auth en Supabase

1. Ve a **Authentication → Email Templates** y personaliza el asunto del magic link
2. Ve a **Authentication → URL Configuration** y añade en **Redirect URLs**:
   - `https://tu-dominio.vercel.app/admin/dashboard`
   - `https://tu-dominio.vercel.app/cliente/briefing`
   - `http://localhost:5173/admin/dashboard` (desarrollo)
   - `http://localhost:5173/cliente/briefing` (desarrollo)

## 5. Variables en Vercel

En Vercel → Settings → Environment Variables añade:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`

## Flujo de uso

1. **Cliente rellena la calculadora** → se guarda en `quotes` con status `pending`
2. **Tú ves el lead en `/admin/dashboard`** → accedes con tu email (magic link)
3. **Desde el detalle del presupuesto** → haces clic en "Enviar link de briefing"
4. **El cliente recibe un email** con un enlace mágico a `/cliente/briefing`
5. **El cliente rellena el briefing** → se guarda en `briefings`, status cambia a `in_progress`
6. **Tú ves el briefing completo** en el detalle del presupuesto en el admin

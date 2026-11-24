# Oficina de IA · modo SaaS (rama `saas-oficina`)

Venta en autoservicio para negocios físicos de Cornellà: el cliente elige departamentos, paga una suscripción
mensual (sin puesta en marcha ni permanencia) y entra en su panel `/app`, donde ve su oficina 3D y lo que
hacen los agentes en directo.

## Qué hay hecho (fases 1 y 2)
- `src/data/oficinaSaas.js`: catálogo de 6 departamentos, cupos visibles, presupuesto de tokens y precios
  (49/89/129/169/199/229 € según nº de departamentos, sin IVA). **Precios propuestos: pendientes de aprobar.**
- `/oficina-ia`: configurador (`Configurador.jsx`) en lugar de los planes con setup; textos actualizados.
- `api/oficina-checkout.js`: suscripción en Stripe Checkout. `api/oficina-alta.js`: alta idempotente tras pagar.
  `api/oficina-webhook.js`: estado (activo/impago/cancelado). `api/oficina-portal.js`: portal de facturas.
- `/app`: acceso con enlace mágico, oficina 3D con sus departamentos, feed en vivo (Supabase Realtime),
  cupo por departamento con aviso al 80 %, puesta en marcha guiada. `/app?demo=1`: demo con datos de ejemplo.
- `supabase/migrations/20261124_oficina_saas.sql`: tablas `of_*`, RLS por correo, vista `of_uso_mes` y
  función `of_saldo()` (tope mensual y diario = mes/15) que el motor de agentes consulta antes de cada llamada.

## Para activarlo
1. Supabase: el proyecto de la web está en pausa → reactivarlo y aplicar la migración.
2. Variables en Vercel (Preview primero, en modo test de Stripe):
   `STRIPE_OFICINA_KEY` (clave con escritura en Checkout Sessions y Billing Portal),
   `STRIPE_OFICINA_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, opcional `STRIPE_TAX_RATE_IVA`.
3. Stripe: webhook a `/api/oficina-webhook` con `customer.subscription.*` e `invoice.payment_failed`;
   activar el portal de cliente.
4. Supabase Auth: añadir `https://…/app` a las URLs de redirección.

## Siguiente (fase 3)
Motor de agentes por cliente con la API de Claude (Haiku por defecto), comprobando `of_saldo()` antes de
cada llamada y registrando cada gasto en `of_consumo` y cada acción en `of_actividad`. Primero: Atención
(WhatsApp Cloud API + chat web) y Google y reseñas. Después: alta de departamentos desde el panel, bolsas
extra y panel de admin con margen por cliente.

## Panel en modo dashboard (/app/:vista)
Resumen (KPIs con comparativa, actividad por día, reparto por departamento, oficina 3D en directo, «te necesitan»,
cupos), Oficina 3D, Actividad (filtros y búsqueda), Estadísticas (comparativa de periodos, mapa de calor de mensajes,
canales, temas más preguntados, respuesta media, nota de reseñas), Departamentos (cupo, revisar antes de publicar,
pausar), Conexiones, Mi negocio y Facturación. «Horas que te ahorra» es una estimación y se indica así.

## Conexiones con un clic
`api/oficina-conectar.js` devuelve la URL de OAuth y `api/oficina-oauth.js` guarda los tokens cifrados
(AES-256-GCM) en `of_conexiones`. Hace falta, por proveedor, registrar la app y poner en Vercel:
- `OFICINA_CIFRADO_KEY` (cadena larga aleatoria; sin ella no se guarda ninguna conexión).
- Google (Perfil de Empresa, Calendar, Gmail): `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.
  Perfil de Empresa exige solicitar acceso a la API a Google; Gmail con permisos de escritura pasa verificación.
- Meta (WhatsApp, Instagram, Facebook): `META_APP_ID`, `META_APP_SECRET`, con revisión de la app por Meta.
- TikTok: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`. Microsoft (Outlook): `MS_CLIENT_ID`, `MS_CLIENT_SECRET`.
URL de vuelta a registrar en todos: `https://agutidesigns.io/api/oficina-oauth` (y la de la vista previa).
Mientras un proveedor no tenga claves, el botón responde «te la conectamos nosotros» en lugar de fallar.
WordPress se conecta con contraseña de aplicación; el chat web con un código para pegar (el widget
`oficina-chat.js` llega con la fase 3).

## Proyecto de Supabase propio
La oficina usa su propio proyecto (cuenta info@agutidesigns.io), separado del de la web.
- Públicas (navegador): `VITE_OFICINA_SUPABASE_URL`, `VITE_OFICINA_SUPABASE_ANON_KEY`.
- Servidor: `OFICINA_SUPABASE_SERVICE_ROLE_KEY` (y opcional `OFICINA_SUPABASE_URL`).
- Auth → URL Configuration: Site URL `https://agutidesigns.io`, Redirect URLs `https://agutidesigns.io/app` y `https://*-nexgents-projects.vercel.app/app`.
- Auth → SMTP: Resend (host smtp.resend.com, puerto 465, usuario `resend`, contraseña = clave de Resend, remitente info@agutidesigns.io).
  Sin SMTP propio, Supabase solo envía unos pocos correos por hora.

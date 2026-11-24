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

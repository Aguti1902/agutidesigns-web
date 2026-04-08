# 🤖 Sistema Automático de Ventas — AgutiDesigns

## Qué hace este sistema

Cuando un cliente rellena la calculadora de precios:

1. **Email 1** (inmediato) — Presupuesto en PDF adjunto desde Holded
2. **Email 2** (día 3) — Seguimiento si no responde
3. **Email 3** (día 5) — Contraoferta -20% con caducidad de 48h
4. **Email 4** (día 7) — Último aviso, cierra expediente

Si acepta el presupuesto en Holded → se detiene la secuencia + notificación interna + email de bienvenida al cliente.

---

## Herramientas necesarias

| Herramienta | Para qué | Precio |
|---|---|---|
| [n8n Cloud](https://n8n.io) | Motor de automatización | ~20€/mes |
| [Airtable](https://airtable.com) | CRM / base de datos | Gratis (hasta 1000 reg.) |
| [Holded](https://holded.com) | Generar presupuestos PDF | Ya lo tienes |
| Gmail / SMTP | Enviar emails | Gratis |

---

## PASO 1 — Crear la base en Airtable

Crea una nueva base llamada **"AgutiDesigns CRM"** con una tabla **"Leads"** y estos campos:

| Campo | Tipo |
|---|---|
| Name | Single line text |
| Email | Email |
| Web Type | Single line text |
| Price | Number (currency) |
| Price Discount | Number (currency) |
| Monthly | Number (currency) |
| Timeline | Single line text |
| Breakdown | Long text |
| **Status** | Single select: `nuevo` / `propuesta_enviada` / `seguimiento_1` / `seguimiento_2` / `ganado` / `perdido` / `pagado` |
| Holded Estimate ID | Single line text |
| Holded Invoice ID | Single line text |
| Submitted At | Date (include time) |
| Paid At | Date (include time) |
| Last Email Sent | Date (include time) |
| Notes | Long text |

**Obtener tu Base ID:**
1. Abre la base en Airtable
2. La URL tiene este formato: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. El `appXXXXXXXXXXXXXX` es tu **Base ID** → guárdalo

---

## PASO 2 — Obtener API key de Holded

1. Entra en Holded → **Ajustes → Integraciones → API**
2. Genera una nueva API key
3. Guárdala (se usará como header `key: TU_API_KEY` en las peticiones)

**Configurar webhook de Holded** (para tracking de pagos):
1. En Holded → **Ajustes → Webhooks → Añadir webhook**
2. URL: `https://TU_INSTANCIA.n8n.cloud/webhook/holded-payment-webhook`
3. Eventos: `estimateAccepted`, `invoicePaid`

---

## PASO 3 — Configurar n8n

### 3.1 Instalar n8n
- Opción A: [n8n Cloud](https://n8n.io) (recomendado, más fácil)
- Opción B: Self-hosted en VPS (más barato a largo plazo)

### 3.2 Crear credenciales en n8n

**Credencial Airtable:**
1. n8n → Credentials → New → "Airtable Personal Access Token"
2. Pega tu token de Airtable (Settings → Developer Hub → Personal access tokens)
3. Nombre: `Airtable`

**Credencial Holded (HTTP Header):**
1. n8n → Credentials → New → "HTTP Header Auth"
2. Name: `key`, Value: `TU_API_KEY_HOLDED`
3. Nombre: `Holded API`

**Credencial Gmail/SMTP:**
1. n8n → Credentials → New → "Gmail OAuth2" o "SMTP"
2. Para Gmail: usa una App Password (Google → Cuenta → Seguridad → Contraseñas de app)
3. Nombre: `SMTP / Gmail`

### 3.3 Importar los workflows

1. En n8n, ve a **Workflows → Import from file**
2. Importa `workflow-ventas.json`
3. Importa `workflow-pagos.json`

### 3.4 Configurar variables de entorno en n8n

En n8n → Settings → Environment Variables:
```
AIRTABLE_BASE_ID = appXXXXXXXXXXXXXX
```

### 3.5 Activar los workflows

1. Abre cada workflow
2. Haz clic en **"Activate"** (toggle arriba a la derecha)
3. Copia la URL del webhook (aparece al hacer clic en el nodo Webhook)

---

## PASO 4 — Conectar la calculadora web

Crea un archivo `.env.local` en `agutidesigns-web/`:

```bash
VITE_N8N_WEBHOOK_URL=https://TU_INSTANCIA.n8n.cloud/webhook/calculadora-lead
```

Para Vercel, añade esta variable en:
**Vercel → Project → Settings → Environment Variables**

---

## PASO 5 — Personalizar los emails

En cada nodo de email en n8n, pega el HTML del archivo correspondiente:

| Nodo | Archivo |
|---|---|
| Email 1 — Presupuesto | `emails/email-1-presupuesto.html` |
| Email 2 — Seguimiento | `emails/email-2-seguimiento.html` |
| Email 3 — Contraoferta | `emails/email-3-contraoferta.html` |
| Email 4 — Último aviso | `emails/email-4-ultimo.html` |

**Variables disponibles en los emails** (n8n las reemplaza automáticamente):
- `{{name}}` → Nombre del lead
- `{{email}}` → Email del lead
- `{{webType}}` → Tipo de web
- `{{price}}` → Precio original
- `{{priceDiscount}}` → Precio con -20%
- `{{savings}}` → Ahorro (precio - priceDiscount)
- `{{timeline}}` → Plazo de entrega
- `{{expiryDate}}` → Fecha de caducidad oferta
- `{{unsubscribeUrl}}` → URL para darse de baja

---

## Cómo parar la secuencia si el cliente responde

Cuando un cliente te responda por email o acepte el presupuesto en Holded:

**Opción A (automática):** El workflow de pagos lo detecta vía webhook de Holded y cambia el estado a `ganado` → la secuencia se para sola (los nodos IF comprueban el estado).

**Opción B (manual):** En Airtable, cambia el campo **Status** del lead a cualquier valor distinto de `propuesta_enviada` / `seguimiento_1` / `seguimiento_2`. Los nodos IF detectarán el cambio y no enviarán más emails.

---

## Vista del CRM en Airtable

Para ver quién paga y quién no, crea estas vistas en Airtable:

1. **Pipeline activo** → Filtro: Status no es `ganado`, `perdido`, `pagado`
2. **Clientes ganados** → Filtro: Status = `ganado` o `pagado`
3. **Leads perdidos** → Filtro: Status = `perdido`
4. **Pagados** → Filtro: Status = `pagado`

---

## Flujo completo

```
Cliente rellena calculadora
         ↓
  n8n recibe lead (webhook)
         ↓
  Crea contacto en Holded
  Crea presupuesto PDF en Holded
         ↓
  Email 1: Presupuesto adjunto
  Airtable → status: propuesta_enviada
         ↓ (3 días sin respuesta)
  Email 2: Seguimiento suave
  Airtable → status: seguimiento_1
         ↓ (2 días sin respuesta)
  Email 3: Contraoferta -20%
  Airtable → status: seguimiento_2
         ↓ (2 días sin respuesta)
  Email 4: Cierre expediente
  Airtable → status: perdido
  
  ══════════════════════════════
  
  Cliente acepta presupuesto (Holded webhook)
         ↓
  Airtable → status: ganado
  Email confirmación al cliente
  Notificación interna a Guti
  
  Cliente paga la factura (Holded webhook)
         ↓
  Airtable → status: pagado
```

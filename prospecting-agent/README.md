# Agente de Prospección — Clínicas Dentales

Dos scripts Python que trabajan en cadena:

1. **`01_scrape_clinics.py`** — Busca clínicas dentales en Google Maps (Barcelona, Madrid, Sevilla, Valencia), entra en la web de cada una para extraer el email y genera un Excel.
2. **`02_send_emails.py`** — Lee ese Excel, genera un email personalizado por clínica con GPT-4o y lo envía por SMTP.

---

## Requisitos previos

- Python 3.11+
- Una **Google Places API key** (gratuita hasta ~5.000 búsquedas/mes)
- Una **OpenAI API key** (GPT-4o, ~0.01€ por email generado)
- Una cuenta de email con SMTP activado (Gmail recomendado)

---

## Setup en 5 pasos

### 1. Instalar dependencias

```bash
cd prospecting-agent
pip install -r requirements.txt
```

### 2. Crear el archivo `.env`

Copia el ejemplo y rellena tus claves:

```bash
cp .env.example .env
```

Edita `.env`:

```
GOOGLE_PLACES_API_KEY=AIzaSy...    # Tu clave de Google Places
OPENAI_API_KEY=sk-...              # Tu clave de OpenAI
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx     # Contraseña de aplicación de Gmail (ver abajo)
SENDER_NAME=Alejandro
SENDER_COMPANY=Agutidesigns
SENDER_WEBSITE=https://agutidesigns.io
SENDER_WHATSAPP=+34625204337
```

### 3. Conseguir la Google Places API key

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo
3. Activa la API: **Places API**
4. Ve a "Credenciales" → "Crear credencial" → "Clave de API"
5. Copia la clave en el `.env`

> El tier gratuito incluye $200/mes (~5.000 búsquedas). Para 4 ciudades (~200 clínicas) no gastarás casi nada.

### 4. Contraseña de aplicación Gmail

Para enviar con Gmail necesitas una contraseña de aplicación (no tu contraseña normal):

1. Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicaciones"
4. Genera una contraseña para "Correo / Mac"
5. Pon esa contraseña de 16 caracteres en `SMTP_PASS`

---

## Uso

### Paso 1 — Scraping de clínicas

```bash
python 01_scrape_clinics.py
```

Esto tarda ~15-30 minutos dependiendo del número de clínicas. Al terminar tendrás `clinicas_dentales.xlsx` con columnas:

| Ciudad | Nombre | Dirección | Teléfono | Email | Web | Valoración | Nº Reseñas | Email enviado | Notas |

### Paso 2 — Previsualizar emails (sin enviar)

Antes de enviar nada, revisa cómo quedan los emails:

```bash
python 02_send_emails.py --dry-run --limit 5
```

Verás los primeros 5 emails generados por IA en la terminal.

### Paso 3 — Enviar emails

Cuando estés satisfecho con los resultados:

```bash
python 02_send_emails.py --limit 20    # Envía solo 20 (recomendado para empezar)
python 02_send_emails.py               # Envía todos los pendientes
```

El script:
- Salta automáticamente las clínicas sin email o ya contactadas
- Marca cada fila como "Sí" en la columna "Email enviado" al enviar
- Guarda el Excel tras cada envío (si se interrumpe, no pierde el progreso)

---

## Estructura del Excel

El Excel generado tiene filtros automáticos y está listo para trabajar:

- **Email enviado**: `No` / `Sí` — puedes filtrar para ver quién ha sido contactado
- **Notas**: el agente escribe aquí el asunto del email enviado o el error

---

## Consejos para maximizar resultados

- **No envíes más de 50 emails/día** desde Gmail para evitar que te marquen como spam
- Espera 2-3 días antes de hacer seguimiento
- Las clínicas con valoración >4.2 suelen tener mayor tasa de respuesta
- El mejor horario de envío: martes-jueves entre 9h y 11h

---

## Cumplimiento legal (LSSI-CE / GDPR)

En España, el email B2B a empresas está permitido bajo "interés legítimo" siempre que:

✅ El email sea de una empresa (no personal)  
✅ El contenido sea relevante para su actividad  
✅ Incluyas una forma de darse de baja → **ya está incluida en el footer de cada email**  
✅ No uses datos personales sensibles

Los emails enviados van al correo de contacto de la clínica, no a emails personales.

---

## Costes estimados

| Concepto | Coste estimado |
|---|---|
| Google Places API (200 clínicas) | Gratis (dentro del tier gratuito) |
| OpenAI GPT-4o (200 emails) | ~2€ |
| Gmail SMTP | Gratis |
| **Total** | **~2€** |

---

## Estructura de archivos

```
prospecting-agent/
├── 01_scrape_clinics.py   # Scraping Google Maps → Excel
├── 02_send_emails.py      # Email personalizado con IA → SMTP
├── requirements.txt       # Dependencias Python
├── .env.example           # Plantilla de configuración
├── .env                   # Tu configuración real (NO subir a Git)
└── clinicas_dentales.xlsx # Generado automáticamente
```

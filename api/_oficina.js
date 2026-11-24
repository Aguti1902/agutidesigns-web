// Utilidades de la Oficina de IA SaaS (los archivos con _ no son funciones de Vercel).
// Variables: STRIPE_OFICINA_KEY (o STRIPE_SECRET_KEY) con permiso de escritura, SUPABASE_SERVICE_ROLE_KEY,
// SUPABASE_URL (o VITE_SUPABASE_URL), VITE_SUPABASE_ANON_KEY, OPENAI_API_KEY o ANTHROPIC_API_KEY.
// Opcionales: OFICINA_CIFRADO_KEY, credenciales OAuth por proveedor, META_VERIFY_TOKEN, CRON_SECRET.
import crypto from 'node:crypto';
import { DEPARTAMENTOS, DEPTO, precioOficina } from '../src/data/oficinaSaas.js';

export { DEPARTAMENTOS, DEPTO, precioOficina };
export const stripeKey = () => process.env.STRIPE_OFICINA_KEY || process.env.STRIPE_SECRET_KEY;
// La oficina usa su propio proyecto de Supabase (OFICINA_*); si no está, cae al de la web.
export const sbUrl = () => (process.env.OFICINA_SUPABASE_URL || process.env.VITE_OFICINA_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const sbKey = () => process.env.OFICINA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = () => process.env.VITE_OFICINA_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
export const configurado = () => Boolean(stripeKey() && sbUrl() && sbKey());
export const hayBase = () => Boolean(sbUrl() && sbKey());
export const origen = (req) => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
export const esUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
export const limpiaDeptos = (lista) => [...new Set((Array.isArray(lista) ? lista : String(lista || '').split(',')).map((s) => String(s).trim()).filter((id) => DEPTO[id]))];

export async function stripe(ruta, { metodo = 'GET', datos } = {}) {
  const r = await fetch(`https://api.stripe.com/v1/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${stripeKey()}`, ...(datos ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: datos ? new URLSearchParams(datos).toString() : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `Stripe ${r.status}`);
  return j;
}

export async function sb(ruta, { metodo = 'GET', cuerpo, prefer } = {}) {
  const r = await fetch(`${sbUrl()}/rest/v1/${ruta}`, {
    method: metodo,
    headers: { apikey: sbKey(), Authorization: `Bearer ${sbKey()}`, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : null;
}
export const rpc = (fn, args) => sb(`rpc/${fn}`, { metodo: 'POST', cuerpo: args });
export const uno = async (ruta) => (await sb(ruta))?.[0] || null;

// ---------- registro de lo que hacen los agentes ----------
export const actividad = (negocio_id, depto, texto, tipo = 'hecho', detalle = null) =>
  sb('of_actividad', { metodo: 'POST', prefer: 'return=representation', cuerpo: [{ negocio_id, depto, tipo, texto: String(texto).slice(0, 600), detalle }] }).then((r) => r?.[0]).catch((e) => console.error('[actividad]', e.message));
export const estadoAgente = (negocio_id, depto, estado, tarea) =>
  sb('of_agentes?on_conflict=negocio_id,depto', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: { negocio_id, depto, estado, tarea: String(tarea || '').slice(0, 160), actualizado: new Date().toISOString() } }).catch(() => {});
export const consumo = (negocio_id, depto, uso) =>
  sb('of_consumo', { metodo: 'POST', cuerpo: [{ negocio_id, depto, modelo: uso.modelo, tokens_in: uso.tin || 0, tokens_out: uso.tout || 0, coste_usd: uso.coste || 0, unidades: uso.unidades || 0 }] }).catch((e) => console.error('[consumo]', e.message));

// ---------- sesión del cliente ----------
export async function usuarioDeSesion(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const u = await fetch(`${sbUrl()}/auth/v1/user`, { headers: { apikey: anonKey() || sbKey(), Authorization: `Bearer ${token}` } });
  return u.ok ? u.json() : null;
}
export async function negocioDeSesion(req) {
  const u = await usuarioDeSesion(req);
  if (!u?.email) return null;
  return uno(`of_negocios?owner_email=eq.${encodeURIComponent(String(u.email).toLowerCase())}&select=*&order=created_at.desc&limit=1`);
}
// Enlace de acceso al panel: lo genera Supabase (admin) y lo enviamos nosotros con Resend.
// Así no depende del SMTP ni de las URL de redirección configuradas en Supabase.
async function authAdmin(ruta, cuerpo) {
  const r = await fetch(`${sbUrl()}/auth/v1/admin/${ruta}`, { method: 'POST', headers: { apikey: sbKey(), Authorization: `Bearer ${sbKey()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  return { ok: r.ok, status: r.status, datos: await r.json().catch(() => ({})) };
}
export async function enviarAcceso(email, base, nombre) {
  const mail = String(email || '').trim().toLowerCase();
  await authAdmin('users', { email: mail, email_confirm: true }); // si ya existe, Supabase responde 422 y seguimos
  const { ok, datos } = await authAdmin('generate_link', { type: 'magiclink', email: mail });
  const hash = datos?.hashed_token || datos?.properties?.hashed_token;
  if (!ok || !hash) { console.error('[acceso] generate_link', datos?.msg || datos?.error_description || ''); return false; }
  const enlace = `${base}/app/entrar?t=${encodeURIComponent(hash)}`;
  if (!process.env.RESEND_API_KEY) { console.error('[acceso] falta RESEND_API_KEY'); return false; }
  const { Resend } = await import('resend');
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Oficina de IA · Agutidesigns <info@agutidesigns.io>', to: mail,
    subject: nombre ? `Entra en la oficina de IA de ${nombre}` : 'Tu enlace para entrar en tu oficina de IA',
    html: `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0d1020">
      <img src="${base}/images/logoazul.png" alt="Agutidesigns" height="28" style="height:28px">
      <h1 style="font-size:22px;margin:28px 0 8px">Entra en tu oficina de IA</h1>
      <p style="color:#3b3f52;line-height:1.55;margin:0 0 24px">Pulsa el botón para entrar en tu panel${nombre ? ` de ${nombre}` : ''}. El enlace caduca en una hora y solo funciona una vez.</p>
      <a href="${enlace}" style="display:inline-block;background:#0047ff;color:#fff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:10px">Entrar en mi oficina</a>
      <p style="color:#6c7086;font-size:13px;line-height:1.5;margin:28px 0 0">Si no has pedido este enlace, ignora este correo.</p></div>`,
    text: `Entra en tu oficina de IA: ${enlace}\nEl enlace caduca en una hora.`,
  });
  if (error) { console.error('[acceso] resend', error.message); return false; }
  return true;
}

// ---------- alta tras el pago (idempotente: la llaman la vuelta de Stripe y el webhook) ----------
export async function altaDesdeSesion(s, base) {
  if (s.metadata?.app !== 'oficina-saas' || s.mode !== 'subscription' || s.status !== 'complete') return null;
  const email = String(s.customer_details?.email || s.customer_email || '').toLowerCase();
  const ids = limpiaDeptos(s.metadata.deptos);
  const creado = await sb('of_negocios?on_conflict=stripe_session', {
    metodo: 'POST', prefer: 'resolution=ignore-duplicates,return=representation',
    cuerpo: { nombre: s.metadata.nombre || 'Mi negocio', owner_email: email, importe_mes: Math.round((s.amount_subtotal || 0) / 100), stripe_customer: s.customer, stripe_subscription: s.subscription, stripe_session: s.id },
  });
  const nuevo = creado?.[0];
  const neg = nuevo || await uno(`of_negocios?stripe_session=eq.${encodeURIComponent(s.id)}&select=*`);
  if (nuevo) {
    await sb('of_departamentos?on_conflict=negocio_id,depto', { metodo: 'POST', prefer: 'resolution=ignore-duplicates',
      cuerpo: ids.map((d) => ({ negocio_id: neg.id, depto: d, cupo_n: DEPTO[d].cupo.n, tokens_mes: DEPTO[d].tokensMes })) });
    await sb('of_agentes?on_conflict=negocio_id,depto', { metodo: 'POST', prefer: 'resolution=ignore-duplicates',
      cuerpo: ids.map((d) => ({ negocio_id: neg.id, depto: d, estado: 'preparando', tarea: 'Esperando a que completes la puesta en marcha' })) });
    await actividad(neg.id, ids[0], 'Tu oficina de IA está creada. Cuéntale a tus agentes cómo es tu negocio y conecta tus herramientas para que empiecen a trabajar.', 'sistema');
    await enviarAcceso(email, base, neg.nombre);
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: 'Oficina de IA <info@agutidesigns.io>', to: 'info@agutidesigns.io',
        subject: `Nueva oficina de IA: ${neg.nombre} (${neg.importe_mes} €/mes)`,
        text: `${neg.nombre} · ${email}\nDepartamentos: ${ids.map((d) => DEPTO[d].nombre).join(', ')}\nImporte: ${neg.importe_mes} €/mes`,
      }).catch((e) => console.error('[alta] aviso', e.message));
    }
  }
  return neg;
}

// ---------- cifrado de credenciales y estado OAuth ----------
const clave = () => crypto.createHash('sha256').update(String(process.env.OFICINA_CIFRADO_KEY || `oficina:${sbKey() || ''}`)).digest();
export const hayCifrado = () => Boolean(process.env.OFICINA_CIFRADO_KEY || sbKey());
export function cifrar(texto) {
  if (texto == null) return null;
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', clave(), iv);
  const datos = Buffer.concat([c.update(String(texto), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), datos].map((b) => b.toString('base64url')).join('.');
}
export function descifrar(s) {
  const [iv, tag, datos] = String(s).split('.').map((x) => Buffer.from(x, 'base64url'));
  const d = crypto.createDecipheriv('aes-256-gcm', clave(), iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(datos), d.final()]).toString('utf8');
}
export function firmarEstado(obj) {
  const datos = Buffer.from(JSON.stringify({ ...obj, e: Date.now() + 15 * 60e3 })).toString('base64url');
  return `${datos}.${crypto.createHmac('sha256', clave()).update(datos).digest('base64url')}`;
}
export function leerEstado(s) {
  const [datos, f] = String(s || '').split('.'); if (!datos || !f) return null;
  const ok = crypto.createHmac('sha256', clave()).update(datos).digest('base64url');
  if (ok.length !== f.length || !crypto.timingSafeEqual(Buffer.from(ok), Buffer.from(f))) return null;
  const o = JSON.parse(Buffer.from(datos, 'base64url').toString()); return o.e > Date.now() ? o : null;
}

// Proveedores OAuth. Cada herramienta pide solo los permisos que necesita.
export const PROVEEDORES = {
  google: { id: () => process.env.GOOGLE_OAUTH_CLIENT_ID, secreto: () => process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    auth: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', extra: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' } },
  meta: { id: () => process.env.META_APP_ID, secreto: () => process.env.META_APP_SECRET, auth: 'https://www.facebook.com/v21.0/dialog/oauth', token: 'https://graph.facebook.com/v21.0/oauth/access_token', sep: ',' },
  tiktok: { id: () => process.env.TIKTOK_CLIENT_KEY, secreto: () => process.env.TIKTOK_CLIENT_SECRET, auth: 'https://www.tiktok.com/v2/auth/authorize/', token: 'https://open.tiktokapis.com/v2/oauth/token/', sep: ',', claveId: 'client_key' },
  microsoft: { id: () => process.env.MS_CLIENT_ID, secreto: () => process.env.MS_CLIENT_SECRET, auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token' },
};
export const HERRAMIENTAS_OAUTH = {
  whatsapp: { p: 'meta', scopes: ['whatsapp_business_management', 'whatsapp_business_messaging', 'business_management'] },
  instagram: { p: 'meta', scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_messages', 'pages_show_list', 'pages_read_engagement'] },
  facebook: { p: 'meta', scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'pages_messaging'] },
  google_business: { p: 'google', scopes: ['openid', 'email', 'https://www.googleapis.com/auth/business.manage'] },
  google_calendar: { p: 'google', scopes: ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'] },
  gmail: { p: 'google', scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.modify'] },
  tiktok: { p: 'tiktok', scopes: ['user.info.basic', 'video.upload', 'video.publish'] },
  outlook: { p: 'microsoft', scopes: ['openid', 'email', 'offline_access', 'User.Read', 'Mail.ReadWrite', 'Mail.Send'] },
};

// Token vigente de una conexión (renueva con el refresh token si ha caducado).
export async function tokenDe(con) {
  if (!con?.token_cifrado) return null;
  if (!con.expira || new Date(con.expira).getTime() > Date.now() + 60e3 || !con.refresh_cifrado) return descifrar(con.token_cifrado);
  const p = PROVEEDORES[con.proveedor]; if (!p) return descifrar(con.token_cifrado);
  const r = await fetch(p.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ [p.claveId || 'client_id']: p.id(), client_secret: p.secreto(), grant_type: 'refresh_token', refresh_token: descifrar(con.refresh_cifrado) }) });
  const t = await r.json();
  if (!r.ok || !t.access_token) { await sb(`of_conexiones?id=eq.${con.id}`, { metodo: 'PATCH', cuerpo: { estado: 'caducada' } }); return null; }
  await sb(`of_conexiones?id=eq.${con.id}`, { metodo: 'PATCH', cuerpo: { token_cifrado: cifrar(t.access_token), expira: t.expires_in ? new Date(Date.now() + t.expires_in * 1000).toISOString() : null, ...(t.refresh_token ? { refresh_cifrado: cifrar(t.refresh_token) } : {}) } });
  return t.access_token;
}

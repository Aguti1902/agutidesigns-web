// Utilidades compartidas de la Oficina de IA SaaS (los archivos con _ no son funciones de Vercel).
// Variables: STRIPE_OFICINA_KEY (o STRIPE_SECRET_KEY) con permiso de escritura en Checkout,
// STRIPE_OFICINA_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY y SUPABASE_URL (o VITE_SUPABASE_URL).
import { DEPARTAMENTOS, DEPTO, precioOficina } from '../src/data/oficinaSaas.js';

export { DEPARTAMENTOS, DEPTO, precioOficina };
export const stripeKey = () => process.env.STRIPE_OFICINA_KEY || process.env.STRIPE_SECRET_KEY;
const sbUrl = () => (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const sbKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

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

export const configurado = () => Boolean(stripeKey() && sbUrl() && sbKey());
export const limpiaDeptos = (lista) => [...new Set((Array.isArray(lista) ? lista : String(lista || '').split(',')).map((s) => String(s).trim()).filter((id) => DEPTO[id]))];
export const origen = (req) => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;

// ---------- sesión del cliente, cifrado y OAuth ----------
import crypto from 'node:crypto';

export async function negocioDeSesion(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const u = await fetch(`${sbUrl()}/auth/v1/user`, { headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY || sbKey(), Authorization: `Bearer ${token}` } });
  if (!u.ok) return null;
  const { email } = await u.json();
  const [neg] = await sb(`of_negocios?owner_email=eq.${encodeURIComponent(String(email).toLowerCase())}&select=id,nombre,stripe_customer,estado&order=created_at.desc&limit=1`);
  return neg || null;
}

const clave = () => crypto.createHash('sha256').update(String(process.env.OFICINA_CIFRADO_KEY || '')).digest();
export const hayCifrado = () => Boolean(process.env.OFICINA_CIFRADO_KEY);
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

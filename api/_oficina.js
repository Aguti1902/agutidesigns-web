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

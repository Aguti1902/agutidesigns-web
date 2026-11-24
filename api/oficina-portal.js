// Abre el portal de cliente de Stripe (facturas, tarjeta, baja) para el negocio del usuario que ha entrado.
import { stripe, sb, configurado, origen } from './_oficina.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!configurado()) return res.status(503).json({ error: 'No disponible' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sin sesión' });
  try {
    const base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL).replace(/\/$/, '');
    const u = await fetch(`${base}/auth/v1/user`, { headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
    if (!u.ok) return res.status(401).json({ error: 'Sesión caducada' });
    const { email } = await u.json();
    const [neg] = await sb(`of_negocios?owner_email=eq.${encodeURIComponent(String(email).toLowerCase())}&select=stripe_customer&order=created_at.desc&limit=1`);
    if (!neg?.stripe_customer) return res.status(404).json({ error: 'Sin suscripción' });
    const p = await stripe('billing_portal/sessions', { metodo: 'POST', datos: { customer: neg.stripe_customer, return_url: `${origen(req)}/app` } });
    return res.status(200).json({ url: p.url });
  } catch (e) {
    console.error('[oficina-portal]', e.message);
    return res.status(502).json({ error: 'No se ha podido abrir el portal' });
  }
}

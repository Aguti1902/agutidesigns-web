// Webhook de Stripe: mantiene el estado de cada oficina (activa, impago, cancelada).
import crypto from 'node:crypto';
import { sb } from './_oficina.js';

export const config = { api: { bodyParser: false } };
const crudo = (req) => new Promise((ok, ko) => { const t = []; req.on('data', (c) => t.push(c)); req.on('end', () => ok(Buffer.concat(t))); req.on('error', ko); });

function valida(cuerpo, cabecera, secreto) {
  const partes = Object.fromEntries(String(cabecera || '').split(',').map((p) => p.split('=')));
  if (!partes.t || !partes.v1 || Math.abs(Date.now() / 1000 - Number(partes.t)) > 300) return false;
  const esperada = crypto.createHmac('sha256', secreto).update(`${partes.t}.${cuerpo}`).digest('hex');
  return esperada.length === partes.v1.length && crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(partes.v1));
}
const ESTADO = { active: 'activo', trialing: 'activo', past_due: 'impago', unpaid: 'impago', canceled: 'cancelado', incomplete_expired: 'cancelado', paused: 'pausado' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const secreto = process.env.STRIPE_OFICINA_WEBHOOK_SECRET;
  if (!secreto) return res.status(503).end();
  const cuerpo = (await crudo(req)).toString('utf8');
  if (!valida(cuerpo, req.headers['stripe-signature'], secreto)) return res.status(400).send('firma');
  const ev = JSON.parse(cuerpo);
  const o = ev.data?.object || {};
  try {
    if (ev.type.startsWith('customer.subscription.') && o.metadata?.app === 'oficina-saas') {
      const estado = ESTADO[o.status];
      if (estado) await sb(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.id)}`, { metodo: 'PATCH', cuerpo: { estado } });
    }
    if (ev.type === 'invoice.payment_failed' && o.subscription) {
      await sb(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.subscription)}`, { metodo: 'PATCH', cuerpo: { estado: 'impago' } });
    }
  } catch (e) { console.error('[oficina-webhook]', e.message); return res.status(500).end(); }
  return res.status(200).json({ ok: true });
}

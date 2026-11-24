// Crea la suscripción mensual de la Oficina de IA en Stripe Checkout con los departamentos elegidos.
import { stripe, configurado, limpiaDeptos, precioOficina, DEPTO, origen } from './_oficina.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!configurado()) return res.status(503).json({ error: 'El alta online aún no está activada. Escríbenos y te la activamos.' });
  const { deptos, nombre, email } = req.body || {};
  const ids = limpiaDeptos(deptos);
  const nom = String(nombre || '').trim().slice(0, 120);
  const mail = String(email || '').trim().toLowerCase();
  if (!ids.length) return res.status(400).json({ error: 'Elige al menos un departamento.' });
  if (!nom) return res.status(400).json({ error: 'Falta el nombre de tu negocio.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return res.status(400).json({ error: 'Revisa tu correo.' });

  const euros = precioOficina(ids.length);
  const base = origen(req);
  const datos = {
    mode: 'subscription',
    locale: 'es',
    customer_email: mail,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': String(euros * 100),
    'line_items[0][price_data][recurring][interval]': 'month',
    'line_items[0][price_data][product_data][name]': `Oficina de IA · ${ids.length} departamento${ids.length > 1 ? 's' : ''}`,
    'line_items[0][price_data][product_data][description]': ids.map((id) => DEPTO[id].nombre).join(' · '),
    'metadata[app]': 'oficina-saas', 'metadata[deptos]': ids.join(','), 'metadata[nombre]': nom,
    'subscription_data[metadata][app]': 'oficina-saas', 'subscription_data[metadata][deptos]': ids.join(','),
    success_url: `${base}/app/bienvenida?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/oficina-ia#precios`,
  };
  if (process.env.STRIPE_TAX_RATE_IVA) datos['line_items[0][tax_rates][0]'] = process.env.STRIPE_TAX_RATE_IVA;
  try {
    const s = await stripe('checkout/sessions', { metodo: 'POST', datos });
    return res.status(200).json({ url: s.url });
  } catch (e) {
    console.error('[oficina-checkout]', e.message);
    return res.status(502).json({ error: 'No hemos podido abrir el pago. Inténtalo de nuevo en un momento.' });
  }
}

// Tras pagar: comprueba la sesión de Stripe y da de alta el negocio y sus departamentos (idempotente).
import { Resend } from 'resend';
import { stripe, sb, configurado, limpiaDeptos, DEPTO } from './_oficina.js';

export default async function handler(req, res) {
  if (!configurado()) return res.status(503).json({ error: 'Alta no activada' });
  const id = String(req.query.session_id || '');
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ error: 'Sesión no válida' });
  try {
    const s = await stripe(`checkout/sessions/${encodeURIComponent(id)}`);
    if (s.metadata?.app !== 'oficina-saas' || s.mode !== 'subscription' || s.status !== 'complete') return res.status(402).json({ error: 'El pago no está completado' });
    const email = String(s.customer_details?.email || s.customer_email || '').toLowerCase();
    const ids = limpiaDeptos(s.metadata.deptos);
    let [neg] = await sb('of_negocios?on_conflict=stripe_session', {
      metodo: 'POST', prefer: 'resolution=ignore-duplicates,return=representation',
      cuerpo: { nombre: s.metadata.nombre || 'Mi negocio', owner_email: email, importe_mes: Math.round((s.amount_subtotal || 0) / 100), stripe_customer: s.customer, stripe_subscription: s.subscription, stripe_session: s.id },
    }) || [];
    const nuevo = Boolean(neg);
    if (!neg) [neg] = await sb(`of_negocios?stripe_session=eq.${encodeURIComponent(s.id)}&select=*`);
    if (nuevo) {
      await sb('of_departamentos?on_conflict=negocio_id,depto', {
        metodo: 'POST', prefer: 'resolution=ignore-duplicates',
        cuerpo: ids.map((d) => ({ negocio_id: neg.id, depto: d, cupo_n: DEPTO[d].cupo.n, tokens_mes: DEPTO[d].tokensMes })),
      });
      await sb('of_actividad', { metodo: 'POST', cuerpo: [{ negocio_id: neg.id, depto: ids[0], tipo: 'sistema', texto: 'Tu oficina de IA está creada. Completa la puesta en marcha para que tus agentes empiecen a trabajar.' }] });
      if (process.env.RESEND_API_KEY) {
        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: 'Oficina de IA <info@agutidesigns.io>', to: 'info@agutidesigns.io',
          subject: `Nueva oficina de IA: ${neg.nombre} (${neg.importe_mes} €/mes)`,
          text: `${neg.nombre} · ${email}\nDepartamentos: ${ids.map((d) => DEPTO[d].nombre).join(', ')}\nImporte: ${neg.importe_mes} €/mes`,
        }).catch((e) => console.error('[oficina-alta] aviso', e.message));
      }
    }
    return res.status(200).json({ email, nombre: neg.nombre });
  } catch (e) {
    console.error('[oficina-alta]', e.message);
    return res.status(502).json({ error: 'No hemos podido terminar el alta. Escríbenos y lo revisamos.' });
  }
}

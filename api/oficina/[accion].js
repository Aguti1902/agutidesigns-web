// Oficina de IA: una sola función con todas las acciones (/api/oficina/<accion>).
// Públicas: checkout, alta, webhook (Stripe), chat (widget web), whatsapp (Meta), oauth (vuelta), cron.
// Con sesión del cliente: conectar, desconectar, portal, plan, responder, conversacion, tarea.
import crypto from 'node:crypto';
import {
  stripe, sb, uno, configurado, hayBase, hayCifrado, limpiaDeptos, precioOficina, precioAnual, webIncluida, cupoDe, DIAS_PRUEBA, DEPTO, origen, esUuid, actividad, estadoAgente,
  negocioDeSesion, altaDesdeSesion, enviarAcceso, ivaStripe, cifrar, firmarEstado, leerEstado, PROVEEDORES, HERRAMIENTAS_OAUTH, tokenDe,
} from '../_oficina.js';
import { responderCliente, generar } from '../_agente.js';
import { facturaDesdeStripe, pdfFactura, hayHolded } from '../_holded.js';

const json = (res, c, o) => res.status(c).json(o);
const cuerpo = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});

// ---------------- pago y alta ----------------
async function checkout(req, res) {
  if (req.method !== 'POST') return json(res, 405, {});
  if (!configurado()) return json(res, 503, { error: 'El alta online se está activando. Escríbenos a info@agutidesigns.io y te la activamos hoy.' });
  const { deptos, nombre, email, periodo: per } = cuerpo(req);
  const ids = limpiaDeptos(deptos); const anual = per === 'anio'; const nom = String(nombre || '').trim().slice(0, 120); const mail = String(email || '').trim().toLowerCase();
  if (!ids.length) return json(res, 400, { error: 'Elige al menos un departamento.' });
  if (!nom) return json(res, 400, { error: 'Falta el nombre de tu negocio.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return json(res, 400, { error: 'Revisa tu correo.' });
  const base = origen(req);
  const datos = {
    mode: 'subscription', locale: 'es', customer_email: mail, billing_address_collection: 'required', 'tax_id_collection[enabled]': 'true',
    'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': String((anual ? precioAnual(ids.length) : precioOficina(ids.length)) * 100),
    'line_items[0][price_data][recurring][interval]': anual ? 'year' : 'month',
    'line_items[0][price_data][product_data][name]': anual ? `Oficina de IA · plan anual${webIncluida('anio', ids.length) ? ' con web incluida' : ''}` : 'Oficina de IA · plan mensual',
    'metadata[app]': 'oficina-saas', 'metadata[deptos]': ids.join(','), 'metadata[nombre]': nom, 'metadata[periodo]': anual ? 'anio' : 'mes',
    'subscription_data[metadata][app]': 'oficina-saas', 'subscription_data[metadata][deptos]': ids.join(','), 'subscription_data[metadata][periodo]': anual ? 'anio' : 'mes',
    'subscription_data[description]': ids.map((id) => DEPTO[id].nombre).join(' · '), payment_method_collection: 'always',
    ...(anual ? {} : { 'subscription_data[trial_period_days]': String(DIAS_PRUEBA), 'subscription_data[trial_settings][end_behavior][missing_payment_method]': 'cancel' }),
    success_url: `${base}/app/bienvenida?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${base}/oficina-ia#precios`,
  };
  try {
    datos['line_items[0][tax_rates][0]'] = await ivaStripe();
    const s = await stripe('checkout/sessions', { metodo: 'POST', datos }); return json(res, 200, { url: s.url }); }
  catch (e) { console.error('[checkout]', e.message); return json(res, 502, { error: 'No hemos podido abrir el pago. Inténtalo de nuevo en un momento.' }); }
}

async function alta(req, res) {
  if (!configurado()) return json(res, 503, { error: 'Alta no activada' });
  const id = String(req.query.session_id || '');
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) return json(res, 400, { error: 'Sesión no válida' });
  try {
    const s = await stripe(`checkout/sessions/${encodeURIComponent(id)}`);
    const neg = await altaDesdeSesion(s, origen(req));
    if (!neg) return json(res, 402, { error: 'El pago no está completado' });
    return json(res, 200, { email: neg.owner_email, nombre: neg.nombre });
  } catch (e) { console.error('[alta]', e.message); return json(res, 502, { error: 'No hemos podido terminar el alta. Escríbenos y lo revisamos.' }); }
}

// Webhook de Stripe sin secreto compartido: se vuelve a pedir el evento a Stripe por su id, así solo se actúa sobre eventos reales.
const ESTADO = { active: 'activo', trialing: 'activo', past_due: 'impago', unpaid: 'impago', canceled: 'cancelado', incomplete_expired: 'cancelado', paused: 'pausado' };
async function webhook(req, res) {
  if (req.method !== 'POST' || !configurado()) return json(res, 200, { ok: false });
  const idEv = String(cuerpo(req).id || '');
  if (!/^evt_[A-Za-z0-9]+$/.test(idEv)) return json(res, 400, {});
  try {
    const ev = await stripe(`events/${idEv}`); const o = ev.data?.object || {};
    if (ev.type === 'checkout.session.completed') await altaDesdeSesion(o, `https://${req.headers.host}`);
    if (ev.type.startsWith('customer.subscription.') && o.metadata?.app === 'oficina-saas' && ESTADO[o.status]) {
      await sb(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.id)}`, { metodo: 'PATCH', cuerpo: { estado: o.pause_collection && o.status === 'active' ? 'pausado' : ESTADO[o.status] } });
      const neg = o.status === 'active' && !o.pause_collection && await uno(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.id)}&prueba_hasta=not.is.null&select=id`);
      if (neg) { // la prueba ha terminado y ha pagado: cupo completo
        const deps = await sb(`of_departamentos?negocio_id=eq.${neg.id}&activo=eq.true&select=depto`);
        for (const d of deps) await sb(`of_departamentos?negocio_id=eq.${neg.id}&depto=eq.${d.depto}`, { metodo: 'PATCH', cuerpo: cupoDe(d.depto, false) });
        await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { prueba_hasta: null } });
        if (deps[0]) await actividad(neg.id, deps[0].depto, 'Tu prueba ha terminado y tu oficina sigue en marcha con el cupo completo de cada departamento.', 'sistema');
      }
    }
    if (ev.type === 'customer.subscription.updated' && o.metadata?.app === 'oficina-saas') {
      await sb(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.id)}`, { metodo: 'PATCH', cuerpo: { cancela_el: o.cancel_at_period_end || o.cancel_at ? new Date((o.cancel_at || o.current_period_end || o.items?.data?.[0]?.current_period_end) * 1000).toISOString() : null } });
    }
    if (ev.type === 'invoice.paid') await facturaDesdeStripe(o);
    if (ev.type === 'invoice.payment_failed' && o.subscription) await sb(`of_negocios?stripe_subscription=eq.${encodeURIComponent(o.subscription)}`, { metodo: 'PATCH', cuerpo: { estado: 'impago' } });
    return json(res, 200, { ok: true });
  } catch (e) { console.error('[webhook]', e.message); return json(res, 500, {}); }
}

// Pedir enlace de acceso: solo se envía si existe una oficina con ese correo (la respuesta es la misma en ambos casos).
async function acceso(req, res) {
  if (req.method !== 'POST' || !hayBase()) return json(res, 405, {});
  const email = String(cuerpo(req).email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Revisa tu correo.' });
  const neg = await uno(`of_negocios?owner_email=eq.${encodeURIComponent(email)}&estado=neq.cancelado&select=nombre&order=created_at.desc&limit=1`);
  if (neg) await enviarAcceso(email, origen(req), neg.nombre);
  return json(res, 200, { ok: true });
}

// ---------------- cuenta del cliente ----------------
async function portal(req, res, neg) {
  if (!neg.stripe_customer) return json(res, 404, { error: 'Sin suscripción' });
  const p = await stripe('billing_portal/sessions', { metodo: 'POST', datos: { customer: neg.stripe_customer, return_url: `${origen(req)}/app/ajustes`,
    configuration: process.env.STRIPE_OFICINA_PORTAL || 'bpc_1UfMQwFjBSJ299OpPt1ZdCAO' } });
  return json(res, 200, { url: p.url });
}

// Cambiar los departamentos contratados desde el panel: actualiza la suscripción (con prorrateo) y la oficina.
async function plan(req, res, neg) {
  const ids = limpiaDeptos(cuerpo(req).deptos);
  if (!ids.length) return json(res, 400, { error: 'Necesitas al menos un departamento.' });
  if (!neg.stripe_subscription) return json(res, 400, { error: 'Sin suscripción' });
  const sub = await stripe(`subscriptions/${neg.stripe_subscription}`);
  const item = sub.items?.data?.[0];
  const anual = item.price?.recurring?.interval === 'year';
  const euros = anual ? precioAnual(ids.length) : precioOficina(ids.length);
  const prueba = neg.prueba_hasta && new Date(neg.prueba_hasta) > new Date();
  await stripe(`subscriptions/${sub.id}`, { metodo: 'POST', datos: {
    'items[0][id]': item.id, 'items[0][price_data][currency]': 'eur', 'items[0][price_data][product]': typeof item.price.product === 'string' ? item.price.product : item.price.product.id,
    'items[0][price_data][unit_amount]': String(euros * 100), 'items[0][price_data][recurring][interval]': anual ? 'year' : 'month', proration_behavior: 'create_prorations',
    'items[0][tax_rates][0]': await ivaStripe(),
    'metadata[deptos]': ids.join(','), description: ids.map((id) => DEPTO[id].nombre).join(' · ') } });
  await sb(`of_departamentos?negocio_id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { activo: false } });
  await sb('of_departamentos?on_conflict=negocio_id,depto', { metodo: 'POST', prefer: 'resolution=merge-duplicates',
    cuerpo: ids.map((d) => ({ negocio_id: neg.id, depto: d, activo: true, ...cupoDe(d, prueba) })) });
  await sb('of_agentes?on_conflict=negocio_id,depto', { metodo: 'POST', prefer: 'resolution=ignore-duplicates', cuerpo: ids.map((d) => ({ negocio_id: neg.id, depto: d, estado: 'disponible', tarea: 'Recién incorporado a tu oficina' })) });
  const web = neg.web_incluida || webIncluida(anual ? 'anio' : 'mes', ids.length);
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { importe_mes: anual ? Math.round(euros / 12) : euros, web_incluida: web, ...(web && !neg.web_estado ? { web_estado: 'pendiente' } : {}) } });
  await actividad(neg.id, ids[0], `Has cambiado tu oficina: ${ids.map((d) => DEPTO[d].nombre).join(', ')} (${anual ? `${euros} €/año` : `${euros} €/mes`}).`, 'sistema');
  return json(res, 200, { ok: true, importe_mes: anual ? Math.round(euros / 12) : euros, web_incluida: web });
}

// Solicitud de la web incluida en el plan anual.
async function web(req, res, neg) {
  if (!neg.web_incluida) return json(res, 403, { error: 'Tu plan no incluye la web.' });
  const { tiene, url, que } = cuerpo(req);
  const detalle = { tiene: !!tiene, url: String(url || '').slice(0, 300), que: String(que || '').slice(0, 3000), fecha: new Date().toISOString() };
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { web_estado: 'solicitada', web_detalle: detalle } });
  await actividad(neg.id, 'contenido', `Has pedido ${detalle.tiene ? 'el rediseño' : 'el diseño'} de tu web. Te escribimos en menos de 48 h laborables para empezar.`, 'sistema');
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Oficina de IA <info@agutidesigns.io>', to: 'info@agutidesigns.io', reply_to: neg.owner_email,
      subject: `Web incluida (plan anual): ${neg.nombre} · ${detalle.tiene ? 'rediseño' : 'diseño desde cero'}`,
      text: `${neg.nombre} (${neg.owner_email})\n${detalle.tiene ? `Web actual: ${detalle.url}` : 'No tiene web.'}\n\nLo que quiere:\n${detalle.que}` }).catch(() => {});
  }
  return json(res, 200, { ok: true });
}

// ---------------- plan: baja, pausa, reactivar, pasar a anual ----------------
async function cancelar(req, res, neg) {
  const { motivo, comentario } = cuerpo(req);
  if (!neg.stripe_subscription) return json(res, 400, { error: 'Sin suscripción' });
  const sub = await stripe(`subscriptions/${neg.stripe_subscription}`, { metodo: 'POST', datos: { cancel_at_period_end: 'true', 'metadata[motivo_baja]': String(motivo || '').slice(0, 60) } });
  const fin = new Date(((sub.trial_end && sub.status === 'trialing') ? sub.trial_end : (sub.cancel_at || sub.items?.data?.[0]?.current_period_end || sub.current_period_end)) * 1000).toISOString();
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { cancela_el: fin, motivo_baja: `${motivo || ''}${comentario ? `: ${String(comentario).slice(0, 500)}` : ''}` } });
  await actividad(neg.id, 'atencion', `Has cancelado tu suscripción. Tu oficina sigue funcionando hasta el ${new Date(fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} y después se detiene. Puedes reactivarla cuando quieras antes de esa fecha.`, 'sistema');
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Oficina de IA <info@agutidesigns.io>', to: 'info@agutidesigns.io', reply_to: neg.owner_email,
      subject: `Baja: ${neg.nombre} (${motivo || 'sin motivo'})`, text: `${neg.nombre} · ${neg.owner_email}\nMotivo: ${motivo || '-'}\nComentario: ${comentario || '-'}\nTermina el: ${fin}` }).catch(() => {});
  }
  return json(res, 200, { ok: true, cancela_el: fin });
}
async function reactivar(req, res, neg) {
  if (!neg.stripe_subscription) return json(res, 400, { error: 'Sin suscripción' });
  await stripe(`subscriptions/${neg.stripe_subscription}`, { metodo: 'POST', datos: { cancel_at_period_end: 'false', pause_collection: '' } });
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { cancela_el: null, motivo_baja: null, pausa_hasta: null, estado: 'activo' } });
  await actividad(neg.id, 'atencion', '¡Tu oficina vuelve a estar en marcha!', 'sistema');
  return json(res, 200, { ok: true });
}
// Pausa de 1 mes: no se cobra y los agentes se detienen; se reactiva sola.
async function pausar(req, res, neg) {
  if (!neg.stripe_subscription) return json(res, 400, { error: 'Sin suscripción' });
  if (neg.periodo === 'anio') return json(res, 400, { error: 'El plan anual no se puede pausar.' });
  const hasta = new Date(Date.now() + 30 * 864e5);
  await stripe(`subscriptions/${neg.stripe_subscription}`, { metodo: 'POST', datos: { 'pause_collection[behavior]': 'void', 'pause_collection[resumes_at]': String(Math.floor(hasta / 1000)) } });
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { estado: 'pausado', pausa_hasta: hasta.toISOString() } });
  await actividad(neg.id, 'atencion', `Has pausado tu oficina hasta el ${hasta.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}. No se te cobrará nada mientras tanto y después vuelve sola.`, 'sistema');
  return json(res, 200, { ok: true, pausa_hasta: hasta.toISOString() });
}
// Pasar del plan mensual al anual: se cobra ya el año (menos lo no usado del mes) y, desde 3 departamentos, incluye la web.
async function anual(req, res, neg) {
  if (neg.periodo === 'anio') return json(res, 400, { error: 'Ya tienes el plan anual.' });
  const sub = await stripe(`subscriptions/${neg.stripe_subscription}`);
  const item = sub.items?.data?.[0];
  const deps = (await sb(`of_departamentos?negocio_id=eq.${neg.id}&activo=eq.true&select=depto`)).map((d) => d.depto);
  const euros = precioAnual(deps.length);
  await stripe(`subscriptions/${sub.id}`, { metodo: 'POST', datos: {
    'items[0][id]': item.id, 'items[0][price_data][currency]': 'eur', 'items[0][price_data][product]': typeof item.price.product === 'string' ? item.price.product : item.price.product.id,
    'items[0][price_data][unit_amount]': String(euros * 100), 'items[0][price_data][recurring][interval]': 'year', 'items[0][tax_rates][0]': await ivaStripe(),
    proration_behavior: 'always_invoice', billing_cycle_anchor: 'now', ...(sub.status === 'trialing' ? { trial_end: 'now' } : {}), payment_behavior: 'error_if_incomplete', 'metadata[periodo]': 'anio' } });
  const web = webIncluida('anio', deps.length);
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { periodo: 'anio', importe_mes: Math.round(euros / 12), prueba_hasta: null, web_incluida: web || neg.web_incluida, ...(web && !neg.web_estado ? { web_estado: 'pendiente' } : {}) } });
  for (const d of deps) await sb(`of_departamentos?negocio_id=eq.${neg.id}&depto=eq.${d}`, { metodo: 'PATCH', cuerpo: cupoDe(d, false) });
  await actividad(neg.id, deps[0], `¡Te has pasado al plan anual (${euros} €/año)!${web ? ' Tu web va incluida: pídela desde Plan → Tu web.' : ''}`, 'sistema');
  return json(res, 200, { ok: true, web });
}
async function preferencias(req, res, neg) {
  const { avisos_email, resumen_semanal, email_avisos } = cuerpo(req);
  const p = { ...(neg.preferencias || {}), ...(typeof avisos_email === 'boolean' ? { avisos_email } : {}), ...(typeof resumen_semanal === 'boolean' ? { resumen_semanal } : {}),
    ...(email_avisos !== undefined ? { email_avisos: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email_avisos)) ? String(email_avisos).toLowerCase() : null } : {}) };
  await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { preferencias: p } });
  return json(res, 200, { ok: true, preferencias: p });
}

// ---------------- agenda y ventas ----------------
async function cita(req, res, neg) {
  const { id, estado, fecha, mensaje: texto } = cuerpo(req);
  const c = esUuid(id) && await uno(`of_citas?id=eq.${id}&negocio_id=eq.${neg.id}&select=*`);
  if (!c || !['pendiente', 'confirmada', 'cancelada', 'hecha'].includes(estado)) return json(res, 400, {});
  const cuando = fecha ? new Date(fecha) : (c.fecha ? new Date(c.fecha) : null);
  await sb(`of_citas?id=eq.${c.id}`, { metodo: 'PATCH', cuerpo: { estado, ...(fecha ? { fecha: new Date(fecha).toISOString() } : {}), actualizado: new Date().toISOString() } });
  // Aviso al cliente por el mismo canal
  if ((estado === 'confirmada' || estado === 'cancelada') && c.conversacion_id) {
    const conv = await uno(`of_conversaciones?id=eq.${c.conversacion_id}&select=*`);
    const f = cuando ? cuando.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }) : c.cuando_texto;
    const t = String(texto || '').trim() || (estado === 'confirmada' ? `¡Hola${c.nombre ? ` ${c.nombre}` : ''}! Te confirmamos la cita${f ? ` el ${f}` : ''}. ¡Te esperamos en ${neg.nombre}!` : `Hola${c.nombre ? ` ${c.nombre}` : ''}, lo sentimos pero no podemos darte cita${f ? ` el ${f}` : ''}. ¿Te va bien otro día?`);
    if (conv && (conv.canal === 'web' || await enviarWhatsapp(neg, conv.contacto, t))) await mensaje(conv.id, neg.id, 'humano', t);
  }
  // Apuntarla en Google Calendar si está conectado
  if (estado === 'confirmada' && cuando) {
    const con = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.google_calendar&estado=eq.conectada&select=*`);
    const tok = con && await tokenDe(con);
    if (tok) await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: `${c.servicio || 'Cita'} · ${c.nombre || 'Cliente'}`, description: `Reservada por tu Oficina de IA (${c.canal === 'whatsapp' ? `WhatsApp +${c.contacto}` : 'chat de la web'})`,
        start: { dateTime: cuando.toISOString() }, end: { dateTime: new Date(cuando.getTime() + 3600e3).toISOString() } }) }).catch(() => {});
  }
  await actividad(neg.id, 'citas', `${estado === 'confirmada' ? 'Has confirmado' : estado === 'cancelada' ? 'Has rechazado' : 'Has marcado como hecha'} la cita de ${c.nombre || 'un cliente'}`, 'hecho', { cita: c.id });
  return json(res, 200, { ok: true });
}
async function lead(req, res, neg) {
  const { id, etapa, importe, nota } = cuerpo(req);
  if (!esUuid(id)) return json(res, 400, {});
  const cambios = { actualizado: new Date().toISOString() };
  if (['nuevo', 'contactado', 'presupuesto', 'ganado', 'perdido'].includes(etapa)) cambios.etapa = etapa;
  if (importe !== undefined) cambios.importe = importe === '' || importe === null ? null : Number(importe);
  if (nota !== undefined) cambios.nota = String(nota).slice(0, 1000);
  await sb(`of_leads?id=eq.${id}&negocio_id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: cambios });
  if (etapa === 'ganado') await actividad(neg.id, 'ventas', 'Has ganado un cliente nuevo 🎉', 'hecho', { lead: id, resultado: 'ganado' });
  return json(res, 200, { ok: true });
}
// Encargos directos del dueño: «hazme un post sobre…», «escribe un artículo sobre…».
async function encargo(req, res, neg) {
  const { depto, tema } = cuerpo(req); const t = String(tema || '').trim().slice(0, 400);
  if (!t || !['redes', 'contenido'].includes(depto)) return json(res, 400, { error: 'Cuéntanos sobre qué quieres que trabaje.' });
  if (!(await uno(`of_departamentos?negocio_id=eq.${neg.id}&depto=eq.${depto}&activo=eq.true&select=depto`))) return json(res, 403, { error: 'No tienes este departamento.' });
  const o = depto === 'redes'
    ? await generar({ negocio: neg, depto, encargo: { tarea: `Escribiendo un post sobre «${t.slice(0, 50)}»`, fin: 'Post listo para que lo revises',
      prompt: `Escribe una publicación para Instagram y Facebook sobre: «${t}». Con el tono del negocio, 2-4 frases y 3-5 hashtags locales. Sin inventar precios ni ofertas. JSON: {"titulo":"...","texto":"...","idea_imagen":"..."}` } })
    : await generar({ negocio: neg, depto, maxTokens: 2200, encargo: { tarea: `Escribiendo un artículo sobre «${t.slice(0, 50)}»`, fin: 'Artículo listo para que lo revises',
      prompt: `Escribe un artículo para el blog del negocio sobre: «${t}». Pensado para Google y para clientes de la zona. 600-800 palabras con subtítulos. Sin inventar datos. JSON: {"titulo":"...","resumen":"...","texto":"... (markdown)"}` } });
  if (!o?.titulo) return json(res, 409, { error: 'Ahora mismo no se ha podido (puede que se haya acabado el cupo del mes).' });
  await actividad(neg.id, depto, `${depto === 'redes' ? 'Post' : 'Artículo'} listo: «${o.titulo}». Revísalo y apruébalo`, 'pendiente',
    depto === 'redes' ? { accion: 'publicar', red: 'instagram', texto: o.texto, idea_imagen: o.idea_imagen, titulo: o.titulo } : { accion: 'articulo', titulo: o.titulo, texto: o.texto, resumen: o.resumen });
  return json(res, 200, { ok: true });
}
async function factura(req, res, neg) {
  const f = await uno(`of_facturas?id=eq.${cuerpo(req).id}&negocio_id=eq.${neg.id}&select=*`);
  if (!f) return json(res, 404, {});
  if (f.holded_id && hayHolded()) { const pdf = await pdfFactura(f.holded_id).catch(() => null); if (pdf) return json(res, 200, { pdf, nombre: `Factura ${f.numero || f.fecha}.pdf` }); }
  return json(res, 200, { url: f.stripe_url });
}

// ---------------- conexiones ----------------
async function conectar(req, res, neg) {
  const { herramienta, url, usuario, clave, instalado } = cuerpo(req);
  const guardar = (fila) => sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: { negocio_id: neg.id, herramienta, estado: 'conectada', ...fila } });
  if (herramienta === 'web_chat') {
    if (!instalado) return json(res, 400, { error: 'Falta pegar el código' });
    await guardar({ proveedor: 'snippet', cuenta: 'Chat instalado en tu web' });
    return json(res, 200, { conectada: true, cuenta: 'Chat instalado en tu web' });
  }
  if (!hayCifrado()) return json(res, 503, { error: 'Las conexiones se están activando.' });
  if (herramienta === 'wordpress') {
    const base = String(url || '').trim().replace(/\/$/, '');
    if (!/^https:\/\/[^\s/]+/.test(base) || !usuario || !clave) return json(res, 400, { error: 'Revisa la dirección (con https), el usuario y la contraseña de aplicación.' });
    const r = await fetch(`${base}/wp-json/wp/v2/users/me?context=edit`, { headers: { Authorization: `Basic ${Buffer.from(`${usuario}:${String(clave).replace(/\s/g, '')}`).toString('base64')}` } });
    if (!r.ok) return json(res, 400, { error: 'WordPress no ha aceptado ese usuario y contraseña de aplicación.' });
    await guardar({ proveedor: 'clave', cuenta: base, token_cifrado: cifrar(JSON.stringify({ usuario, clave })) });
    return json(res, 200, { conectada: true, cuenta: base });
  }
  const h = HERRAMIENTAS_OAUTH[herramienta]; const p = h && PROVEEDORES[h.p];
  if (!p) return json(res, 400, { error: 'Herramienta desconocida' });
  if (!p.id() || !p.secreto()) return json(res, 503, { error: 'Esta conexión automática se está activando. Pulsa «Pedir ayuda» y te la conectamos nosotros.', ayuda: true });
  const q = new URLSearchParams({ [p.claveId || 'client_id']: p.id(), redirect_uri: `${origen(req)}/api/oficina/oauth`, response_type: 'code',
    scope: h.scopes.join(p.sep || ' '), state: firmarEstado({ n: neg.id, h: herramienta }), ...(p.extra || {}) });
  return json(res, 200, { url: `${p.auth}?${q}` });
}

async function desconectar(req, res, neg) {
  await sb(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.${encodeURIComponent(String(cuerpo(req).herramienta))}`, { metodo: 'DELETE' });
  return json(res, 200, { ok: true });
}

async function ayuda(req, res, neg) {
  const { herramienta, mensaje } = cuerpo(req);
  await actividad(neg.id, 'atencion', `Has pedido ayuda${herramienta ? ` para conectar ${herramienta}` : ''}. Te escribimos en menos de 24 h laborables.`, 'sistema');
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Oficina de IA <info@agutidesigns.io>', to: 'info@agutidesigns.io', reply_to: neg.owner_email,
      subject: `Ayuda: ${neg.nombre}${herramienta ? ` · conectar ${herramienta}` : ''}`, text: `${neg.nombre} (${neg.owner_email})\n${herramienta ? `Conectar: ${herramienta}\n` : ''}${String(mensaje || '').slice(0, 2000)}` }).catch(() => {});
  }
  return json(res, 200, { ok: true });
}

async function cuentaWhatsapp(tok) {
  const app = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
  const d = await (await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${encodeURIComponent(tok)}&access_token=${encodeURIComponent(app)}`)).json();
  const waba = d?.data?.granular_scopes?.find((g) => g.scope === 'whatsapp_business_management')?.target_ids?.[0];
  if (!waba) return {};
  const n = await (await fetch(`https://graph.facebook.com/v21.0/${waba}/phone_numbers?access_token=${encodeURIComponent(tok)}`)).json();
  await fetch(`https://graph.facebook.com/v21.0/${waba}/subscribed_apps`, { method: 'POST', headers: { Authorization: `Bearer ${tok}` } }).catch(() => {});
  const num = n?.data?.[0];
  return num ? { externo_id: num.id, cuenta: num.display_phone_number } : { externo_id: null };
}

async function oauth(req, res) {
  const vuelta = (q) => { res.statusCode = 302; res.setHeader('Location', `${origen(req)}/app/conexiones?${q}`); res.end(); };
  const st = leerEstado(req.query.state);
  if (!st || req.query.error || !req.query.code) return vuelta('error_conexion=1');
  const h = HERRAMIENTAS_OAUTH[st.h]; const p = h && PROVEEDORES[h.p];
  if (!p) return vuelta('error_conexion=1');
  try {
    const r = await fetch(p.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ [p.claveId || 'client_id']: p.id(), client_secret: p.secreto(), code: String(req.query.code), grant_type: 'authorization_code', redirect_uri: `${origen(req)}/api/oficina/oauth` }) });
    const tok = await r.json();
    if (!r.ok || !tok.access_token) throw new Error(`token ${r.status}`);
    let extra = {};
    if (tok.id_token) extra.cuenta = JSON.parse(Buffer.from(tok.id_token.split('.')[1], 'base64url').toString()).email || null;
    if (h.p === 'meta') {
      const me = await (await fetch(`https://graph.facebook.com/v21.0/me?fields=name&access_token=${encodeURIComponent(tok.access_token)}`)).json();
      extra.cuenta = me.name || null;
      if (st.h === 'whatsapp') extra = { ...extra, ...(await cuentaWhatsapp(tok.access_token)) };
    }
    await sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: {
      negocio_id: st.n, herramienta: st.h, proveedor: h.p, estado: 'conectada', ...extra,
      token_cifrado: cifrar(tok.access_token), refresh_cifrado: tok.refresh_token ? cifrar(tok.refresh_token) : null,
      expira: tok.expires_in ? new Date(Date.now() + tok.expires_in * 1000).toISOString() : null, scopes: h.scopes.join(' ') } });
    await actividad(st.n, 'atencion', `Has conectado ${st.h.replace('_', ' ')}${extra.cuenta ? ` (${extra.cuenta})` : ''}.`, 'sistema');
    return vuelta(`conectado=${encodeURIComponent(st.h)}`);
  } catch (e) { console.error('[oauth]', st.h, e.message); return vuelta('error_conexion=1'); }
}

// ---------------- conversaciones ----------------
async function conversacionDe(neg, canal, contacto, nombre) {
  const c = await uno(`of_conversaciones?negocio_id=eq.${neg.id}&canal=eq.${canal}&contacto=eq.${encodeURIComponent(contacto)}&select=*`);
  if (c) return c;
  const [n] = await sb('of_conversaciones?on_conflict=negocio_id,canal,contacto', { metodo: 'POST', prefer: 'resolution=merge-duplicates,return=representation',
    cuerpo: { negocio_id: neg.id, canal, contacto, nombre: nombre || null, estado: 'agente', ultimo: new Date().toISOString() } });
  return n;
}
const mensaje = (conversacion_id, negocio_id, de, texto) => sb('of_mensajes', { metodo: 'POST', cuerpo: [{ conversacion_id, negocio_id, de, texto: String(texto).slice(0, 4000) }] });

const CORS = (res) => { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS'); };

// Widget de chat de la web: GET para configuración y mensajes nuevos, POST para escribir.
async function chat(req, res) {
  CORS(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!hayBase()) return json(res, 503, {});
  const b = req.method === 'POST' ? cuerpo(req) : req.query;
  const oficina = String(b.oficina || ''); const sesion = String(b.sesion || '').slice(0, 64);
  if (!esUuid(oficina)) return json(res, 400, {});
  const neg = await uno(`of_negocios?id=eq.${oficina}&select=*`);
  if (!neg || neg.estado === 'cancelado') return json(res, 404, {});
  if (req.method === 'GET' && !sesion) return json(res, 200, { nombre: neg.nombre, activo: neg.estado === 'activo' });
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(sesion)) return json(res, 400, {});
  const conv = await conversacionDe(neg, 'web', sesion, null);
  if (req.method === 'GET') {
    const desde = /^\d{4}-/.test(String(b.desde || '')) ? b.desde : '1970-01-01';
    const nuevos = await sb(`of_mensajes?conversacion_id=eq.${conv.id}&de=neq.cliente&creado=gt.${encodeURIComponent(desde)}&select=de,texto,creado&order=creado.asc&limit=20`);
    return json(res, 200, { mensajes: nuevos });
  }
  const texto = String(b.texto || '').trim().slice(0, 1500);
  if (!texto) return json(res, 400, {});
  const hora = new Date(Date.now() - 36e5).toISOString();
  const recientes = await sb(`of_mensajes?conversacion_id=eq.${conv.id}&de=eq.cliente&creado=gt.${hora}&select=id`);
  if (recientes.length >= 30) return json(res, 429, { respuesta: 'Has enviado muchos mensajes seguidos. Danos un momento y te contestamos.' });
  await mensaje(conv.id, neg.id, 'cliente', texto);
  await sb(`of_conversaciones?id=eq.${conv.id}`, { metodo: 'PATCH', cuerpo: { ultimo: new Date().toISOString(), leido: false } });
  if (conv.estado === 'humano') return json(res, 200, { esperando: true });
  const r = await responderCliente({ negocio: neg, conversacion: conv, canal: 'web' });
  if (!r?.respuesta) return json(res, 200, { esperando: true });
  await mensaje(conv.id, neg.id, 'agente', r.respuesta);
  return json(res, 200, { respuesta: r.respuesta });
}

async function enviarWhatsapp(neg, para, texto) {
  const con = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.whatsapp&estado=eq.conectada&select=*`);
  const tok = con && await tokenDe(con);
  if (!tok || !con.externo_id) return false;
  const r = await fetch(`https://graph.facebook.com/v21.0/${con.externo_id}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: para, type: 'text', text: { body: texto.slice(0, 4000) } }) });
  if (!r.ok) console.error('[whatsapp envío]', r.status, (await r.text()).slice(0, 200));
  return r.ok;
}

// Webhook de WhatsApp Cloud API (Meta).
async function whatsapp(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.mode'] === 'subscribe' && process.env.META_VERIFY_TOKEN && req.query['hub.verify_token'] === process.env.META_VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).end();
  }
  const b = cuerpo(req);
  if (process.env.META_APP_SECRET) {
    const firma = String(req.headers['x-hub-signature-256'] || '').replace('sha256=', '');
    const calc = crypto.createHmac('sha256', process.env.META_APP_SECRET).update(JSON.stringify(b)).digest('hex');
    if (!firma) return res.status(401).end();
    if (firma !== calc) console.warn('[whatsapp] firma distinta (posible reserialización del cuerpo)');
  }
  try {
    for (const entry of b.entry || []) for (const ch of entry.changes || []) {
      const v = ch.value || {}; const phoneId = v.metadata?.phone_number_id;
      for (const m of v.messages || []) {
        if (m.type !== 'text' || !phoneId) continue;
        const con = await uno(`of_conexiones?herramienta=eq.whatsapp&externo_id=eq.${encodeURIComponent(phoneId)}&select=negocio_id`);
        if (!con) continue;
        const neg = await uno(`of_negocios?id=eq.${con.negocio_id}&select=*`);
        const nombre = v.contacts?.find((c) => c.wa_id === m.from)?.profile?.name;
        const conv = await conversacionDe(neg, 'whatsapp', m.from, nombre);
        if (await uno(`of_mensajes?externo_id=eq.${encodeURIComponent(m.id)}&select=id`)) continue;
        await sb('of_mensajes', { metodo: 'POST', cuerpo: [{ conversacion_id: conv.id, negocio_id: neg.id, de: 'cliente', texto: m.text.body.slice(0, 4000), externo_id: m.id }] });
        await sb(`of_conversaciones?id=eq.${conv.id}`, { metodo: 'PATCH', cuerpo: { ultimo: new Date().toISOString(), leido: false, ...(nombre && !conv.nombre ? { nombre } : {}) } });
        if (conv.estado === 'humano') continue;
        const r = await responderCliente({ negocio: neg, conversacion: { ...conv, nombre: conv.nombre || nombre }, canal: 'whatsapp' });
        if (r?.respuesta && await enviarWhatsapp(neg, m.from, r.respuesta)) await mensaje(conv.id, neg.id, 'agente', r.respuesta);
      }
    }
  } catch (e) { console.error('[whatsapp]', e.message); }
  return res.status(200).json({ ok: true });
}

// El dueño contesta él mismo o devuelve la conversación al agente.
async function responder(req, res, neg) {
  const { conversacion, texto } = cuerpo(req);
  const conv = esUuid(conversacion) && await uno(`of_conversaciones?id=eq.${conversacion}&negocio_id=eq.${neg.id}&select=*`);
  if (!conv) return json(res, 404, {});
  const t = String(texto || '').trim(); if (!t) return json(res, 400, {});
  if (conv.canal === 'whatsapp' && !(await enviarWhatsapp(neg, conv.contacto, t))) return json(res, 502, { error: 'WhatsApp no ha aceptado el mensaje. Si han pasado más de 24 h desde su último mensaje, escríbele desde tu móvil.' });
  await mensaje(conv.id, neg.id, 'humano', t);
  await sb(`of_conversaciones?id=eq.${conv.id}`, { metodo: 'PATCH', cuerpo: { estado: 'humano', necesita: null, leido: true, ultimo: new Date().toISOString() } });
  return json(res, 200, { ok: true });
}
async function conversacion(req, res, neg) {
  const { id, estado, leido } = cuerpo(req);
  if (!esUuid(id)) return json(res, 400, {});
  const cambios = {};
  if (['agente', 'humano', 'cerrada'].includes(estado)) cambios.estado = estado;
  if (typeof leido === 'boolean') cambios.leido = leido;
  if (estado === 'agente' || estado === 'cerrada') cambios.necesita = null;
  await sb(`of_conversaciones?id=eq.${id}&negocio_id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: cambios });
  return json(res, 200, { ok: true });
}

// Bandeja «Te necesitan»: aprobar, descartar o marcar como hecho.
async function tarea(req, res, neg) {
  const { id, decision, texto } = cuerpo(req);
  const t = await uno(`of_actividad?id=eq.${Number(id)}&negocio_id=eq.${neg.id}&select=*`);
  if (!t) return json(res, 404, {});
  const d = t.detalle || {};
  let respuesta = decision === 'descartar' ? 'Descartado' : decision === 'aprobar' ? 'Aprobado' : 'Hecho';
  if (decision === 'aprobar' && d.accion === 'responder_resena' && d.resena) {
    const con = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.google_business&estado=eq.conectada&select=*`);
    const tok = con && await tokenDe(con);
    if (tok) {
      const r = await fetch(`https://mybusiness.googleapis.com/v4/${d.resena}/reply`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: texto || d.texto }) });
      respuesta = r.ok ? 'Publicada en Google' : 'No se ha podido publicar en Google';
    }
  }
  await sb(`of_actividad?id=eq.${t.id}`, { metodo: 'PATCH', cuerpo: { resuelto: true, respuesta, ...(texto ? { detalle: { ...d, texto } } : {}) } });
  return json(res, 200, { ok: true, respuesta });
}

// ---------------- trabajo programado (Vercel Cron, una vez al día) ----------------
async function resenasGoogle(neg) {
  const con = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.google_business&estado=eq.conectada&select=*`);
  const tok = con && await tokenDe(con); if (!tok) return;
  const g = (u) => fetch(u, { headers: { Authorization: `Bearer ${tok}` } }).then((r) => r.json());
  const cuentas = (await g('https://mybusinessaccountmanagement.googleapis.com/v1/accounts')).accounts || [];
  for (const c of cuentas.slice(0, 2)) {
    const locs = (await g(`https://mybusinessbusinessinformation.googleapis.com/v1/${c.name}/locations?readMask=name,title&pageSize=10`)).locations || [];
    for (const l of locs.slice(0, 3)) {
      const rs = (await g(`https://mybusiness.googleapis.com/v4/${c.name}/${l.name}/reviews?pageSize=20`)).reviews || [];
      for (const r of rs.filter((x) => !x.reviewReply).slice(0, 10)) {
        const estrellas = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r.starRating] || 0;
        const ya = await uno(`of_actividad?negocio_id=eq.${neg.id}&detalle->>resena=eq.${encodeURIComponent(r.name)}&select=id`);
        if (ya) continue;
        const o = await generar({ negocio: neg, depto: 'google', encargo: { tarea: `Respondiendo la reseña de ${r.reviewer?.displayName || 'un cliente'}`,
          prompt: `Escribe la respuesta del negocio a esta reseña de Google (${estrellas} estrellas) de ${r.reviewer?.displayName || 'un cliente'}: «${r.comment || '(sin texto)'}». Agradecida, cercana, 2-3 frases, sin inventar nada. Si es negativa, pide disculpas y ofrece hablar en persona. JSON: {"respuesta":"..."}` } });
        if (!o?.respuesta) continue;
        const nombre = r.reviewer?.displayName || 'un cliente';
        if (estrellas <= 3 || o.ajustes?.revisar) {
          await actividad(neg.id, 'google', `Reseña de ${estrellas} ★ de ${nombre}: revisa la respuesta propuesta antes de publicarla`, 'pendiente', { accion: 'responder_resena', resena: r.name, estrellas, texto: o.respuesta, original: r.comment || '' });
        } else {
          const ok = (await fetch(`https://mybusiness.googleapis.com/v4/${r.name}/reply`, { method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: o.respuesta }) })).ok;
          if (ok) await actividad(neg.id, 'google', `Ha respondido una reseña de ${estrellas} estrellas de ${nombre}`, 'hecho', { estrellas, resena: r.name, texto: o.respuesta });
        }
      }
    }
  }
}

// Resumen semanal por correo (lunes): lo que han hecho los agentes los últimos 7 días.
async function resumenSemanal(neg) {
  if (!process.env.RESEND_API_KEY) return;
  const desde = new Date(Date.now() - 7 * 864e5).toISOString();
  const ev = await sb(`of_actividad?negocio_id=eq.${neg.id}&creado=gte.${desde}&tipo=in.(hecho,aviso,pendiente)&select=depto,tipo`);
  if (!ev.length) return;
  const por = {}; for (const e of ev) if (e.tipo === 'hecho') por[e.depto] = (por[e.depto] || 0) + 1;
  const minutos = { atencion: 3, citas: 4, ventas: 6, redes: 20, google: 5, contenido: 90 };
  const horas = Math.round(Object.entries(por).reduce((a, [d, n]) => a + n * (minutos[d] || 0), 0) / 6) / 10;
  const filas = Object.entries(por).map(([d, n]) => `<tr><td style="padding:6px 0;color:#3b3f52">${DEPTO[d]?.nombre || d}</td><td style="padding:6px 0;text-align:right;font-weight:700">${n}</td></tr>`).join('');
  const { Resend } = await import('resend');
  await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Oficina de IA · Agutidesigns <info@agutidesigns.io>', to: neg.preferencias?.email_avisos || neg.owner_email,
    subject: `Tu semana: ${ev.filter((e) => e.tipo === 'hecho').length} tareas hechas por tu oficina de IA`,
    html: `<div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:28px 22px;color:#0d1020"><h1 style="font-size:20px;margin:0 0 6px">Tu semana en ${neg.nombre}</h1>
      <p style="color:#6c7086;margin:0 0 18px">Unas ${horas} h de trabajo que no has tenido que hacer tú (estimación).</p><table style="width:100%;border-collapse:collapse;font-size:15px">${filas}</table>
      ${ev.some((e) => e.tipo !== 'hecho') ? `<p style="margin:18px 0 0">Tienes ${ev.filter((e) => e.tipo !== 'hecho').length} cosas en «Te necesitan».</p>` : ''}
      <a href="https://agutidesigns.io/app/estadisticas" style="display:inline-block;margin-top:22px;background:#0047ff;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Ver mis estadísticas</a></div>` });
}

async function cron(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  if (!hayBase()) return json(res, 200, { ok: false });
  // Pausas que terminan: la oficina vuelve sola
  const vuelven = await sb(`of_negocios?estado=eq.pausado&pausa_hasta=lt.${new Date().toISOString()}&select=id`);
  for (const n of vuelven) { await sb(`of_negocios?id=eq.${n.id}`, { metodo: 'PATCH', cuerpo: { estado: 'activo', pausa_hasta: null } }); await actividad(n.id, 'atencion', 'Tu pausa ha terminado: tu oficina vuelve a estar en marcha.', 'sistema'); }
  const negocios = await sb('of_negocios?estado=eq.activo&select=*');
  const hoy = new Date(); const lunes = hoy.getDay() === 1; const dia1 = hoy.getDate() === 1;
  for (const neg of negocios) {
    const deps = (await sb(`of_departamentos?negocio_id=eq.${neg.id}&activo=eq.true&select=depto,ajustes`)).map((d) => d.depto);
    const listo = neg.sector && neg.horarios;
    try {
      if (deps.includes('google')) await resenasGoogle(neg);
      if (deps.includes('redes') && listo && (lunes || !(await uno(`of_actividad?negocio_id=eq.${neg.id}&depto=eq.redes&detalle->>accion=eq.publicar&select=id`)))) {
        const o = await generar({ negocio: neg, depto: 'redes', encargo: { tarea: 'Preparando las publicaciones de la semana', unidades: 3, fin: 'Publicaciones de la semana listas para que las revises',
          prompt: 'Prepara 3 publicaciones para Instagram y Facebook de esta semana: variadas (servicio, consejo útil, día a día del negocio), con el tono del negocio, 2-4 frases y 3-5 hashtags locales (Cornellà, Baix Llobregat si encaja). Sin precios ni ofertas que no estén en los datos. JSON: {"posts":[{"titulo":"...","texto":"...","idea_imagen":"..."}]}' } });
        for (const p of o?.posts || []) await actividad(neg.id, 'redes', `Post listo: «${p.titulo}». Revísalo y apruébalo`, 'pendiente', { accion: 'publicar', red: 'instagram', texto: p.texto, idea_imagen: p.idea_imagen });
      }
      if (deps.includes('contenido') && listo && (dia1 || !(await uno(`of_actividad?negocio_id=eq.${neg.id}&depto=eq.contenido&select=id&detalle->>accion=eq.articulo`)))) {
        const o = await generar({ negocio: neg, depto: 'contenido', maxTokens: 2200, encargo: { tarea: 'Escribiendo el artículo del mes', fin: 'Artículo del mes listo para revisar',
          prompt: 'Escribe un artículo para el blog del negocio pensado para que lo encuentren en Google personas de Cornellà y alrededores que buscan lo que hace el negocio. 600-800 palabras, útil, con subtítulos. Sin inventar datos. JSON: {"titulo":"...","resumen":"...","texto":"... (markdown)"}' } });
        if (o?.titulo) await actividad(neg.id, 'contenido', `Artículo listo: «${o.titulo}». Revísalo y apruébalo`, 'pendiente', { accion: 'articulo', titulo: o.titulo, texto: o.texto, resumen: o.resumen });
      }
      if (deps.includes('ventas')) {
        const dos = new Date(Date.now() - 2 * 864e5).toISOString();
        const frias = await sb(`of_conversaciones?negocio_id=eq.${neg.id}&tema=eq.presupuesto&estado=neq.cerrada&ultimo=lt.${dos}&seguimiento=is.null&select=id,nombre,canal&limit=10`);
        for (const c of frias) {
          await actividad(neg.id, 'ventas', `${c.nombre || 'Un cliente'} pidió presupuesto hace más de 2 días y no ha vuelto a escribir. Toca hacer seguimiento`, 'aviso', { conversacion: c.id, motivo: 'seguimiento' });
          await sb(`of_conversaciones?id=eq.${c.id}`, { metodo: 'PATCH', cuerpo: { seguimiento: new Date().toISOString() } });
        }
      }
    } catch (e) { console.error('[cron]', neg.id, e.message); }
    for (const d of deps) await estadoAgente(neg.id, d, 'disponible', 'Esperando la siguiente tarea');
    if (lunes && neg.preferencias?.resumen_semanal !== false) await resumenSemanal(neg).catch((e) => console.error('[resumen]', e.message));
  }
  return json(res, 200, { ok: true, negocios: negocios.length });
}

// ---------------- enrutador ----------------
const PUBLICAS = { checkout, alta, webhook, chat, whatsapp, oauth, cron, acceso };
const PRIVADAS = { portal, plan, conectar, desconectar, ayuda, responder, conversacion, tarea, web, cancelar, reactivar, pausar, anual, preferencias, cita, lead, factura, encargo };

export default async function handler(req, res) {
  const accion = String(req.query.accion || '');
  try {
    if (PUBLICAS[accion]) return await PUBLICAS[accion](req, res);
    if (!PRIVADAS[accion]) return json(res, 404, { error: 'No existe' });
    if (req.method !== 'POST') return json(res, 405, {});
    if (!hayBase()) return json(res, 503, { error: 'No disponible' });
    const neg = await negocioDeSesion(req);
    if (!neg) return json(res, 401, { error: 'Tu sesión ha caducado. Vuelve a entrar.' });
    return await PRIVADAS[accion](req, res, neg);
  } catch (e) {
    console.error(`[oficina/${accion}]`, e.message);
    return json(res, 500, { error: 'Algo ha fallado. Inténtalo de nuevo en un momento.' });
  }
}

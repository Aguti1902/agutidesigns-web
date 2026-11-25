// Núcleo de los agentes: llama a la IA con el contexto del negocio, controla el cupo antes de cada llamada y
// registra consumo, actividad y estado en directo. Usa Claude si hay ANTHROPIC_API_KEY; si no, OpenAI.
import { sb, rpc, uno, actividad, estadoAgente, consumo, DEPTO } from './_oficina.js';
import { instruccionesDe } from '../src/data/oficinaAjustes.js';

// USD por millón de tokens: entrada, salida, escritura y lectura de caché (precios de la tarifa pública).
const TARIFAS = {
  'claude-opus-5-5': { i: 4, o: 20, cw: 5, cr: 0.20 },
  'claude-haiku-5-5': { i: 0.10, o: 0.50, cw: 0.125, cr: 0.01 },
  'claude-haiku-4-5': { i: 1, o: 5, cw: 1.25, cr: 0.10 },
  openai: { i: 0.15, o: 0.6 },
};
const tarifaDe = (modelo) => TARIFAS[Object.keys(TARIFAS).find((k) => String(modelo).startsWith(k))] || TARIFAS['claude-haiku-4-5'];
const MODELO = () => process.env.OFICINA_MODELO || 'claude-haiku-5-5';
const RESERVA = 'claude-haiku-4-5-20251001';

async function llamarClaude(modelo, { sistema, mensajes, maxTokens }) {
  // El contexto del negocio va en caché: en una conversación se repite en cada mensaje y así cuesta 10 veces menos.
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: modelo, max_tokens: maxTokens, system: [{ type: 'text', text: sistema, cache_control: { type: 'ephemeral' } }], messages: mensajes }),
  });
}

// El diseño de Redes (historias, posts, carruseles y guiones de vídeo) usa Opus 5.5; el resto, Haiku.
export const MODELO_REDES = () => process.env.OFICINA_MODELO_REDES || 'claude-opus-5-5';

export async function llamarIA({ sistema, mensajes, maxTokens = 600, json = false, modelo: modeloPedido }) {
  if (process.env.ANTHROPIC_API_KEY) {
    let modelo = modeloPedido || MODELO(); let r = await llamarClaude(modelo, { sistema, mensajes, maxTokens }); let j = await r.json();
    // Si el modelo elegido no está disponible en la cuenta, se usa el de reserva (más caro, pero el margen sigue protegido por presupuesto).
    if (!r.ok && (r.status === 404 || /model/i.test(j?.error?.message || '')) && modelo !== RESERVA) { modelo = RESERVA; r = await llamarClaude(modelo, { sistema, mensajes, maxTokens }); j = await r.json(); }
    if (!r.ok) throw new Error(`anthropic ${r.status}: ${j?.error?.message || ''}`);
    const u = j.usage || {}; const t = tarifaDe(modelo);
    const tin = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0); const tout = u.output_tokens || 0;
    const coste = ((u.input_tokens || 0) * t.i + (u.cache_creation_input_tokens || 0) * t.cw + (u.cache_read_input_tokens || 0) * t.cr + tout * t.o) / 1e6;
    return { texto: (j.content || []).map((c) => c.text || '').join(''), tin, tout, modelo, coste };
  }
  if (process.env.OPENAI_API_KEY) {
    const modelo = process.env.OFICINA_MODELO_OPENAI || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: modelo, max_tokens: maxTokens, temperature: 0.4, ...(json ? { response_format: { type: 'json_object' } } : {}),
        messages: [{ role: 'system', content: sistema }, ...mensajes] }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(`openai ${r.status}: ${j?.error?.message || ''}`);
    const tin = j.usage?.prompt_tokens || 0; const tout = j.usage?.completion_tokens || 0;
    return { texto: j.choices?.[0]?.message?.content || '', tin, tout, modelo, coste: (tin * TARIFAS.openai.i + tout * TARIFAS.openai.o) / 1e6 };
  }
  throw new Error('sin_ia');
}

// «2026-12-03T17:00» en hora de Madrid → ISO UTC (tiene en cuenta el horario de verano).
export function fechaMadrid(local) {
  const aprox = new Date(`${local}:00Z`);
  const enMadrid = new Date(aprox.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const enUtc = new Date(aprox.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(aprox.getTime() - (enMadrid - enUtc)).toISOString();
}

export function leerJson(t) {
  const m = String(t || '').match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

// ¿Puede trabajar este departamento? (activo, no pausado, con cupo del mes y del día)
export async function puedeTrabajar(negocio, depto) {
  if (negocio.estado !== 'activo') return { puede: false, motivo: 'inactivo' };
  const dep = await uno(`of_departamentos?negocio_id=eq.${negocio.id}&depto=eq.${depto}&activo=eq.true&select=ajustes`);
  if (!dep) return { puede: false, motivo: 'sin_departamento' };
  if (dep.ajustes?.pausado) return { puede: false, motivo: 'pausado', ajustes: dep.ajustes };
  const [s] = (await rpc('of_saldo', { p_negocio: negocio.id, p_depto: depto })) || [];
  if (!s?.puede) {
    const mes1 = new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const ya = await uno(`of_actividad?negocio_id=eq.${negocio.id}&depto=eq.${depto}&detalle->>aviso=eq.cupo100&creado=gte.${mes1}&select=id`);
    if (!ya && Number(s?.tokens_hoy_restantes) > 0) await actividad(negocio.id, depto, `${DEPTO[depto].nombre} ha agotado su cupo de este mes: ahora solo te pasa los avisos importantes. Puedes ampliarlo +50 % por 25 € + IVA desde tu panel.`, 'aviso', { aviso: 'cupo100' });
    return { puede: false, motivo: 'cupo', ajustes: dep.ajustes };
  }
  if (s.pct >= 0.8) {
    const ya = await uno(`of_actividad?negocio_id=eq.${negocio.id}&depto=eq.${depto}&detalle->>aviso=eq.cupo80&creado=gte.${new Date(new Date().setDate(1)).toISOString().slice(0, 10)}&select=id`);
    if (!ya) await actividad(negocio.id, depto, `${DEPTO[depto].nombre} lleva el ${Math.round(s.pct * 100)} % de su cupo de este mes. Si lo vas a necesitar, amplíalo +50 % por 25 € + IVA desde tu panel.`, 'aviso', { aviso: 'cupo80' });
  }
  return { puede: true, ajustes: dep.ajustes || {} };
}

async function conocimiento(negocio) {
  const filas = await sb(`of_conocimiento?negocio_id=eq.${negocio.id}&select=tipo,pregunta,respuesta,hasta&order=created_at.asc&limit=80`).catch(() => []);
  const hoy = new Date().toISOString().slice(0, 10);
  const faq = filas.filter((f) => f.tipo === 'faq').map((f) => `- P: ${f.pregunta}\n  R: ${f.respuesta}`).join('\n');
  const notas = filas.filter((f) => f.tipo === 'nota' && (!f.hasta || f.hasta >= hoy)).map((f) => `- ${f.respuesta}${f.hasta ? ` (válido hasta ${f.hasta})` : ''}`).join('\n');
  return { faq, notas };
}

export async function fichaNegocio(negocio) {
  const { faq, notas } = await conocimiento(negocio);
  return [
    `NEGOCIO: ${negocio.nombre}${negocio.sector ? ` (${negocio.sector})` : ''}`,
    negocio.direccion && `Dirección: ${negocio.direccion}`, negocio.telefono && `Teléfono: ${negocio.telefono}`,
    negocio.horarios && `Horarios: ${negocio.horarios}`, negocio.precios && `Servicios y precios:\n${negocio.precios}`,
    negocio.tono && `Tono con los clientes: ${negocio.tono}`, negocio.instrucciones && `Nunca hagas esto: ${negocio.instrucciones}`,
    notas && `AVISOS ACTUALES (tienen prioridad):\n${notas}`, faq && `PREGUNTAS FRECUENTES:\n${faq}`,
    `Hoy es ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' })}.`,
  ].filter(Boolean).join('\n');
}

// Responde a un cliente en una conversación (chat web o WhatsApp).
export async function responderCliente({ negocio, conversacion, canal }) {
  const depto = 'atencion';
  const nombreCanal = canal === 'whatsapp' ? 'WhatsApp' : 'el chat de la web';
  const quien = conversacion.nombre || 'un cliente';
  const estado = await puedeTrabajar(negocio, depto);
  if (!estado.puede) {
    const ya = await uno(`of_mensajes?conversacion_id=eq.${conversacion.id}&de=eq.agente&select=id&limit=1`);
    await actividad(negocio.id, depto, `${quien} ha escrito por ${nombreCanal} y no se ha podido contestar (${estado.motivo === 'cupo' ? 'cupo agotado' : estado.motivo === 'pausado' ? 'departamento en pausa' : 'oficina inactiva'}). Contéstale tú.`, 'aviso', { conversacion: conversacion.id });
    return ya ? null : { respuesta: `¡Gracias por escribir a ${negocio.nombre}! Te contestaremos lo antes posible.`, escalar: true, sinIA: true };
  }
  await estadoAgente(negocio.id, depto, 'trabajando', `Contestando a ${quien} por ${nombreCanal}`);
  const historial = await sb(`of_mensajes?conversacion_id=eq.${conversacion.id}&select=de,texto&order=creado.desc&limit=16`);
  const mensajes = historial.reverse().map((m) => ({ role: m.de === 'cliente' ? 'user' : 'assistant', content: m.texto.slice(0, 1500) }));
  while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
  // «Cómo trabaja» de Atención y, si están contratados, de Citas y Ventas (que también hablan por este canal).
  const otros = await sb(`of_departamentos?negocio_id=eq.${negocio.id}&activo=eq.true&depto=in.(citas,ventas)&select=depto,ajustes`).catch(() => []);
  const comoTrabaja = [instruccionesDe('atencion', estado.ajustes), ...otros.map((d) => instruccionesDe(d.depto, d.ajustes))].filter(Boolean).join('\n');
  const sistema = `Eres el departamento de Atención al cliente de un negocio local y contestas por ${nombreCanal} en nombre del negocio.
${await fichaNegocio(negocio)}

REGLAS:
- Responde breve y natural, como lo haría alguien del negocio.
${comoTrabaja}
- Usa SOLO la información de arriba. Si no sabes algo (un precio, una disponibilidad, un dato), no lo inventes: di que lo consultas y que le contestarán enseguida, y marca pasar_a_humano.
- No confirmes citas ni horas concretas: recoge el día y la hora que prefiere y di que se lo confirmáis enseguida (marca pasar_a_humano con motivo "cita").
- Si pide hablar con una persona, se queja, pide un descuento o es un tema delicado, sé amable y marca pasar_a_humano.
- No digas que eres una IA salvo que te lo pregunten; si te lo preguntan, di la verdad: eres el asistente virtual del negocio.
Devuelve SOLO un JSON: {"respuesta": "...", "pasar_a_humano": true|false, "motivo": "cita|presupuesto|queja|persona|duda|otro|", "tema": "precios|horarios|servicios|ubicación|citas|presupuesto|otros", "nombre_cliente": "nombre si lo ha dicho o vacío",
 "cita": {"servicio": "qué quiere o vacío", "cuando": "día y hora que pide, en sus palabras", "fecha_iso": "YYYY-MM-DDTHH:MM si se puede saber con seguridad, si no vacío"} o null si no pide cita,
 "interes": "si pide presupuesto o muestra interés de compra: qué le interesa en pocas palabras; si no, vacío"}`;
  const t0 = Date.now();
  let ia;
  try { ia = await llamarIA({ sistema, mensajes, maxTokens: 400, json: true }); }
  catch (e) {
    console.error('[agente]', e.message);
    await estadoAgente(negocio.id, depto, 'disponible', 'Esperando mensajes');
    await actividad(negocio.id, depto, `No se ha podido contestar a ${quien} por un error técnico. Contéstale tú.`, 'aviso', { conversacion: conversacion.id });
    return { respuesta: `¡Gracias por escribir a ${negocio.nombre}! Te contestamos enseguida.`, escalar: true, sinIA: true };
  }
  const o = leerJson(ia.texto) || { respuesta: ia.texto, pasar_a_humano: false, tema: 'otros' };
  const ms = Date.now() - t0;
  const nombre = String(o.nombre_cliente || '').trim().slice(0, 60) || conversacion.nombre || null;
  const primera = !(await uno(`of_mensajes?conversacion_id=eq.${conversacion.id}&de=eq.agente&select=id&limit=1`));
  await consumo(negocio.id, depto, { ...ia, unidades: primera ? 1 : 0 });
  const quien2 = nombre || 'un cliente';
  const cambios = { ultimo: new Date().toISOString(), tema: o.tema || conversacion.tema, ...(nombre ? { nombre } : {}) };
  if (o.pasar_a_humano) cambios.necesita = o.motivo || 'duda';
  await sb(`of_conversaciones?id=eq.${conversacion.id}`, { metodo: 'PATCH', cuerpo: cambios });
  if (primera) await actividad(negocio.id, depto, `Ha contestado a ${quien2} por ${nombreCanal}${o.tema && o.tema !== 'otros' ? ` (${o.tema})` : ''}`, 'hecho', { canal, ms, tema: o.tema || 'otros', conversacion: conversacion.id });
  // Citas y clientes potenciales: quedan registrados para la Agenda y el embudo de Ventas.
  if (o.cita && (o.cita.cuando || o.cita.servicio)) {
    const yaCita = await uno(`of_citas?conversacion_id=eq.${conversacion.id}&estado=eq.pendiente&select=id`);
    const fecha = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(o.cita.fecha_iso || '') ? fechaMadrid(o.cita.fecha_iso.slice(0, 16)) : null;
    const fila = { nombre: nombre || null, contacto: conversacion.contacto, canal, servicio: String(o.cita.servicio || '').slice(0, 160) || null, cuando_texto: String(o.cita.cuando || '').slice(0, 160) || null, fecha, actualizado: new Date().toISOString() };
    if (yaCita) await sb(`of_citas?id=eq.${yaCita.id}`, { metodo: 'PATCH', cuerpo: fila });
    else await sb('of_citas', { metodo: 'POST', cuerpo: [{ ...fila, negocio_id: negocio.id, conversacion_id: conversacion.id }] });
  }
  if (o.interes || o.tema === 'presupuesto' || o.motivo === 'presupuesto') {
    await sb('of_leads?on_conflict=conversacion_id', { metodo: 'POST', prefer: 'resolution=merge-duplicates',
      cuerpo: [{ negocio_id: negocio.id, conversacion_id: conversacion.id, nombre: nombre || null, contacto: conversacion.contacto, canal, interes: String(o.interes || 'Pide presupuesto').slice(0, 200), actualizado: new Date().toISOString() }] }).catch(() => {});
  }
  if (o.pasar_a_humano) {
    const motivo = { cita: 'quiere cita', presupuesto: 'pide presupuesto', queja: 'tiene una queja', persona: 'quiere hablar contigo', duda: 'pregunta algo que tus agentes no saben' }[o.motivo] || 'necesita que le contestes tú';
    await actividad(negocio.id, o.motivo === 'cita' ? 'citas' : o.motivo === 'presupuesto' ? 'ventas' : depto, `${quien2} ${motivo}. Último mensaje: «${mensajes[mensajes.length - 1]?.content.slice(0, 140) || ''}»`, 'aviso', { conversacion: conversacion.id, motivo: o.motivo });
  }
  await estadoAgente(negocio.id, depto, 'disponible', `Última: ha contestado a ${quien2}`);
  return { respuesta: String(o.respuesta || '').slice(0, 1200), escalar: !!o.pasar_a_humano, ms };
}

// Genera contenido (posts, artículos, respuestas a reseñas) para un departamento.
export async function generar({ negocio, depto, encargo, maxTokens = 900 }) {
  const estado = await puedeTrabajar(negocio, depto);
  if (!estado.puede) return null;
  await estadoAgente(negocio.id, depto, 'trabajando', encargo.tarea);
  try {
    const ia = await llamarIA({ sistema: `Trabajas en el departamento de ${DEPTO[depto].nombre} de este negocio local.\n${await fichaNegocio(negocio)}\n${instruccionesDe(depto, estado.ajustes)}\nNunca inventes precios, ofertas, datos ni testimonios que no estén arriba. Devuelve SOLO el JSON que se te pide.`,
      mensajes: [{ role: 'user', content: encargo.prompt }], maxTokens, json: true, ...(depto === 'redes' ? { modelo: MODELO_REDES() } : {}) });
    await consumo(negocio.id, depto, { ...ia, unidades: encargo.unidades ?? 1 });
    return { ...leerJson(ia.texto), ajustes: estado.ajustes };
  } finally { await estadoAgente(negocio.id, depto, 'disponible', encargo.fin || 'Esperando la siguiente tarea'); }
}

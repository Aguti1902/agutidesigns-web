// Respuestas del equipo en la demo (sin IA): se calculan con los datos del negocio de ejemplo
// según lo que se pregunta, con varias formas de decirlo para que no suene siempre igual.
const una = (arr, sem = Date.now()) => arr[Math.floor(sem / 997) % arr.length];
const horaDe = (f) => new Date(f).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const diaDe = (f) => new Date(f).toLocaleDateString('es-ES', { weekday: 'long' });
const esManana = (f) => { const d = new Date(f); const m = new Date(); m.setDate(m.getDate() + 1); return d.toDateString() === m.toDateString(); };
const esHoy = (f) => new Date(f).toDateString() === new Date().toDateString();

export function respuestaDemo(o, t, historial = []) {
  const x = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const pend = o.eventos.filter((e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto);
  const prox = o.citas.filter((k) => k.estado !== 'cancelada' && k.fecha && new Date(k.fecha) > Date.now()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const dicho = historial.filter((m) => m.de !== 'tu').map((m) => m.texto).join(' ');

  if (/^(hola|buenas|buenos dias|hey|ey)\b/.test(x)) return una(['¡Hola! Dime, ¿qué necesitas?', 'Buenas, aquí estamos. ¿En qué te ayudo?', '¡Hola! Todo en marcha por aquí. ¿Qué quieres saber?']);
  if (/gracias|perfecto|genial|vale$|ok$/.test(x)) return una(['¡A ti! Aquí seguimos.', 'Nada, para eso estamos.', 'Perfecto. Si necesitas algo más, aquí estoy.']);
  if (/manana/.test(x) && /cita|agenda|tengo/.test(x)) {
    const c = prox.filter((k) => esManana(k.fecha));
    return c.length ? `Mañana tienes ${c.length === 1 ? 'una cita' : `${c.length} citas`}: ${c.slice(0, 4).map((k) => `${k.nombre} a las ${horaDe(k.fecha)} para ${k.servicio}`).join(', ')}.` : 'Mañana de momento no tienes citas. Si entra alguna te aviso.';
  }
  if (/hoy/.test(x) && /cita/.test(x)) { const c = prox.filter((k) => esHoy(k.fecha)); return c.length ? `Hoy te quedan ${c.length}: ${c.map((k) => `${k.nombre} a las ${horaDe(k.fecha)}`).join(', ')}.` : 'Hoy ya no te quedan más citas.'; }
  if (/cita|agenda|reserva|hueco/.test(x)) {
    const porConfirmar = o.citas.filter((k) => k.estado === 'pendiente').length;
    const c = prox.slice(0, 3).map((k) => `${k.nombre} el ${diaDe(k.fecha)} a las ${horaDe(k.fecha)}`).join(', ');
    return `${prox.length ? `Las próximas son ${c}.` : 'No tienes citas próximas.'}${porConfirmar ? ` Y hay ${porConfirmar} por confirmar en tu agenda.` : ''}`;
  }
  if (/resen|estrella|google|nota/.test(x)) {
    const r = o.eventos.filter((e) => e.depto === 'google' && e.detalle?.estrellas); const media = r.length ? (r.reduce((a, e) => a + e.detalle.estrellas, 0) / r.length).toFixed(1).replace('.', ',') : null;
    const malas = r.filter((e) => e.detalle.estrellas <= 3 && !e.resuelto).length;
    return `${media ? `La nota media de las reseñas que hemos respondido está en ${media}.` : 'Aún no hay reseñas respondidas.'} ${malas ? `Tienes ${malas === 1 ? 'una delicada' : `${malas} delicadas`} esperando a que revises la respuesta.` : 'No hay ninguna delicada pendiente.'}`;
  }
  if (/presupuesto|venta|cliente potencial|lead|seguimiento/.test(x)) {
    const ab = o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)); const total = ab.reduce((a, l) => a + (l.importe || 0), 0);
    return ab.length ? `Hay ${ab.length} clientes potenciales abiertos${total ? `, unos ${total} euros en juego` : ''}. El más avanzado es ${ab[0].nombre}, que pidió ${ab[0].interes || 'información'}.` : 'Ahora mismo no hay presupuestos abiertos.';
  }
  if (/(haz|hazme|prepara|crea|escribe|pide).*(post|carrusel|historia|reel|tiktok|video|articulo)/.test(x) || /^(un|una) (post|carrusel|historia|reel|articulo)/.test(x)) {
    const que = /articulo/.test(x) ? 'el artículo' : /video|reel|tiktok/.test(x) ? 'el guion del vídeo' : /carrusel/.test(x) ? 'el carrusel' : /historia/.test(x) ? 'la historia' : 'el post';
    return una([`Hecho, me pongo con ${que}. Te lo dejo para revisar en unos minutos.`, `Vale, preparo ${que} y te aviso cuando esté.`, `Apuntado: ${que}. Lo tendrás en «Te necesitan» enseguida.`]) + ' (En la demo no se crea de verdad.)';
  }
  if (/publica|redes|instagram|post|historias|carrusel/.test(x)) {
    const p = o.eventos.filter((e) => e.depto === 'redes' && e.tipo === 'pendiente' && !e.resuelto).length;
    return `Este mes llevamos ${o.uso?.redes?.unidades_mes ?? 'varias'} piezas de redes.${p ? ` Tienes ${p} esperando tu visto bueno.` : ' No hay nada pendiente de aprobar.'}`;
  }
  if (/whatsapp|conversacion|mensaje|clientes escrib|atend/.test(x)) {
    const esperan = o.conversaciones?.filter((c) => c.estado === 'humano' || c.necesita).length || 0;
    return `Hoy hemos atendido ${o.est.hoy.conversaciones} conversaciones.${esperan ? ` ${esperan === 1 ? 'Un cliente te espera' : `${esperan} clientes te esperan`} a ti en Conversaciones.` : ' Nadie está esperando respuesta.'}`;
  }
  if (/pendiente|que tengo|me necesit|por revisar|que hay/.test(x)) {
    return pend.length ? `Tienes ${pend.length} cosas esperándote. Lo primero: ${pend[0].texto.replace(/\.$/, '')}.` : 'Nada pendiente, todo al día.';
  }
  if (/cupo|consumo|plan|gasto|limite/.test(x)) {
    const altos = Object.entries(o.uso || {}).filter(([, u]) => u?.pct >= 0.8).map(([d, u]) => `${{ atencion: 'Atención', citas: 'Citas', ventas: 'Ventas', redes: 'Redes', google: 'Google', contenido: 'Contenido' }[d] || d} va por el ${Math.round(u.pct * 100)} %`);
    return altos.length ? `${altos.join(' y ')} de su cupo. Si lo necesitas, desde Plan amplías solo este mes.` : 'Todos los departamentos van holgados de cupo este mes.';
  }
  if (/semana|resumen|como va|que tal|que habeis hecho|hoy/.test(x)) {
    const opciones = [
      `Hoy llevamos ${o.est.hoy.total} tareas: ${o.est.hoy.conversaciones} clientes atendidos y ${o.est.hoy.citas} gestiones de citas.`,
      `Buen día: ${o.est.hoy.conversaciones} conversaciones, ${o.est.hoy.citas} citas movidas y ${o.est.hoy.google} reseñas contestadas.`,
      `Va todo bien. ${o.est.hoy.total} tareas hechas hoy y ${pend.length} cosas esperándote.`,
    ];
    return opciones.find((r) => !dicho.includes(r.slice(0, 25))) || opciones[0];
  }
  return una(['No te he entendido bien. ¿Me lo dices de otra forma? Puedo contarte citas, reseñas, presupuestos o encargarme de un post.', 'Eso no lo tengo claro. Pregúntame por tus citas, las reseñas, los presupuestos o pídeme una publicación.']);
}

// ---------- demo con IA de verdad: contexto del panel en texto + respuesta del servidor ----------
const f = (d) => new Date(d).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export function contextoPanel(o) {
  const n = o.negocio; const out = [];
  out.push(`NEGOCIO: ${n.nombre} (${n.sector || ''}). Horario: ${n.horarios || '-'}. Dirección: ${n.direccion || '-'}. Precios: ${n.precios || '-'}`);
  out.push(`DEPARTAMENTOS: ${o.deptos.map((d) => d.depto).join(', ')}`);
  out.push(`HOY: ${o.est?.hoy?.total ?? 0} tareas (${o.est?.hoy?.conversaciones ?? 0} conversaciones, ${o.est?.hoy?.citas ?? 0} gestiones de citas, ${o.est?.hoy?.google ?? 0} reseñas)`);
  out.push(`CUPO DEL MES: ${Object.entries(o.uso || {}).map(([d, u]) => `${d} ${u.unidades_mes}/${u.cupo} (${Math.round((u.pct || 0) * 100)} %)`).join(', ')}`);
  const prox = o.citas.filter((k) => k.fecha && new Date(k.fecha) > Date.now() && k.estado !== 'cancelada').sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 12);
  out.push(`CITAS PRÓXIMAS:\n${prox.map((k) => `- ${k.nombre} · ${k.servicio} · ${f(k.fecha)} · ${k.estado}`).join('\n') || '- ninguna'}`);
  out.push(`CLIENTES POTENCIALES:\n${o.leads.map((l) => `- ${l.nombre}: ${l.interes || ''} ${l.importe ? `${l.importe} €` : ''} · ${l.etapa}`).join('\n') || '- ninguno'}`);
  const pend = o.eventos.filter((e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto).slice(0, 12);
  out.push(`PENDIENTE DEL DUEÑO (${pend.length}):\n${pend.map((e) => `- ${e.texto}`).join('\n')}`);
  out.push(`ACTIVIDAD RECIENTE:\n${o.eventos.slice(0, 25).map((e) => `- [${e.depto}] ${f(e.creado)}: ${e.texto}`).join('\n')}`);
  const g = (o.metricas || []).find((m) => m.fuente === 'google_busqueda')?.datos;
  if (g) {
    const s = g.serie || []; const m = Math.floor(s.length / 2); const sum = (a, k) => a.reduce((x, y) => x + (y[k] || 0), 0); const c = sum(s, 'clics'); const i = sum(s, 'impresiones');
    out.push(`SEO EN GOOGLE (28 días): ${c} clics, ${i} impresiones, CTR ${i ? ((c / i) * 100).toFixed(1) : 0} %. Clics últimos 14 días ${sum(s.slice(m), 'clics')} vs ${sum(s.slice(0, m), 'clics')} los 14 anteriores.\nBúsquedas:\n${(g.busquedas || []).map((b) => `- «${b.q}»: posición ${b.posicion}, ${b.clics} clics, ${b.impresiones} impresiones`).join('\n')}`);
  }
  const w = (o.metricas || []).find((m) => m.fuente === 'web')?.datos; if (w) out.push(`WEB (analítica): ${JSON.stringify(w).slice(0, 700)}`);
  const ig = (o.metricas || []).find((m) => m.fuente === 'instagram')?.datos; if (ig) out.push(`INSTAGRAM: ${JSON.stringify(ig).slice(0, 400)}`);
  const r = o.eventos.filter((e) => e.depto === 'google' && e.detalle?.estrellas);
  if (r.length) out.push(`RESEÑAS: ${r.length} respondidas, media ${(r.reduce((a, e) => a + e.detalle.estrellas, 0) / r.length).toFixed(1)} ★`);
  if (o.competidores?.length) out.push(`COMPETENCIA:\n${o.competidores.map((k) => `- ${k.nombre}: ${k.nota ?? '?'} ★, ${k.resenas ?? '?'} reseñas${k.datos?.publica ? `, publica: ${k.datos.publica}` : ''}`).join('\n')}`);
  const vids = o.videos || []; if (vids.length) out.push(`VÍDEOS: ${vids.map((v) => `${v.titulo} (${v.estado})`).join('; ')}`);
  return out.join('\n\n');
}
export async function responderDemo(o, texto, historial = [], { hablado = false, depto = null } = {}) {
  try {
    const r = await fetch('/api/oficina/demo-voz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'ia', texto, historial, contexto: contextoPanel(o), hablado, depto }) });
    const j = await r.json(); if (r.ok && j.respuesta) return j.respuesta;
  } catch { /* sin conexión: respuesta local */ }
  return respuestaDemo(o, texto, historial);
}

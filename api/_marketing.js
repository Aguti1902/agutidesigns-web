// Marketing y análisis de la Oficina de IA: métricas reales de la web (Google Analytics, Search Console) y de redes
// (Instagram, Facebook, TikTok) guardadas cada día, chat con el equipo, vídeos (guion + voz), competencia e informes.
import { sb, uno, actividad, tokenDe, consumo, DEPTO } from './_oficina.js';
import { llamarIA, leerJson, fichaNegocio, generar } from './_agente.js';

const hoyISO = () => new Date().toISOString().slice(0, 10);
const hace = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const conexion = (neg, h) => uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.${h}&estado=eq.conectada&select=*`);
const guardarMetrica = (neg, fuente, datos, fecha = hoyISO()) => sb('of_metricas?on_conflict=negocio_id,fuente,fecha', { metodo: 'POST', prefer: 'resolution=merge-duplicates',
  cuerpo: [{ negocio_id: neg.id, fuente, fecha, datos, actualizado: new Date().toISOString() }] });
const getJ = async (url, tok, opts = {}) => { const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', ...(opts.headers || {}) } }); return r.ok ? r.json() : null; };

// ---------- métricas (una vez al día desde el cron) ----------
async function web(neg) {
  const tok = await tokenDe(await conexion(neg, 'google_analytics')); if (!tok) return;
  const cuentas = await getJ('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', tok);
  const prop = cuentas?.accountSummaries?.flatMap((a) => a.propertySummaries || [])[0]?.property; if (!prop) return;
  const informe = (cuerpo) => getJ(`https://analyticsdata.googleapis.com/v1beta/${prop}:runReport`, tok, { method: 'POST', body: JSON.stringify({ dateRanges: [{ startDate: '27daysAgo', endDate: 'today' }], ...cuerpo }) });
  const [serie, canales, paginas] = await Promise.all([
    informe({ dimensions: [{ name: 'date' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
    informe({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 6 }),
    informe({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 6, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
  ]);
  const v = (r, i) => Number(r.metricValues?.[i]?.value || 0);
  await guardarMetrica(neg, 'web', {
    serie: (serie?.rows || []).map((r) => ({ fecha: r.dimensionValues[0].value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), usuarios: v(r, 0), sesiones: v(r, 1), vistas: v(r, 2) })),
    canales: (canales?.rows || []).map((r) => ({ canal: r.dimensionValues[0].value, sesiones: v(r, 0) })),
    paginas: (paginas?.rows || []).map((r) => ({ ruta: r.dimensionValues[0].value, vistas: v(r, 0) })),
  });
}

async function busqueda(neg) {
  const tok = await tokenDe(await conexion(neg, 'search_console')); if (!tok) return;
  const sitios = (await getJ('https://www.googleapis.com/webmasters/v3/sites', tok))?.siteEntry?.filter((s) => s.permissionLevel !== 'siteUnverifiedUser') || [];
  const sitio = sitios[0]?.siteUrl; if (!sitio) return;
  const q = (cuerpo) => getJ(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(sitio)}/searchAnalytics/query`, tok, { method: 'POST', body: JSON.stringify({ startDate: hace(30), endDate: hace(2), ...cuerpo }) });
  const [busquedas, serie] = await Promise.all([q({ dimensions: ['query'], rowLimit: 15 }), q({ dimensions: ['date'] })]);
  await guardarMetrica(neg, 'google_busqueda', {
    sitio,
    busquedas: (busquedas?.rows || []).map((r) => ({ q: r.keys[0], clics: r.clicks, impresiones: r.impressions, posicion: Math.round(r.position * 10) / 10 })),
    serie: (serie?.rows || []).map((r) => ({ fecha: r.keys[0], clics: r.clicks, impresiones: r.impressions })),
  });
}

async function instagram(neg) {
  const tok = await tokenDe(await conexion(neg, 'instagram')); if (!tok) return;
  const g = (ruta) => getJ(`https://graph.facebook.com/v21.0/${ruta}${ruta.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(tok)}`, tok);
  const pag = (await g('me/accounts?fields=instagram_business_account,name'))?.data?.find((p) => p.instagram_business_account);
  const ig = pag?.instagram_business_account?.id; if (!ig) return;
  const [perfil, media, alcance] = await Promise.all([
    g(`${ig}?fields=username,followers_count,media_count`),
    g(`${ig}/media?fields=caption,like_count,comments_count,timestamp,media_type,media_url,thumbnail_url,permalink&limit=12`),
    g(`${ig}/insights?metric=reach&period=day&since=${Math.floor(Date.now() / 1000) - 28 * 86400}&until=${Math.floor(Date.now() / 1000)}`),
  ]);
  await guardarMetrica(neg, 'instagram', {
    usuario: perfil?.username, seguidores: perfil?.followers_count ?? null, publicaciones: perfil?.media_count ?? null,
    alcance: (alcance?.data?.[0]?.values || []).map((x) => ({ fecha: x.end_time?.slice(0, 10), valor: x.value })),
    posts: (media?.data || []).map((m) => ({ texto: (m.caption || '').slice(0, 140), likes: m.like_count || 0, comentarios: m.comments_count || 0, fecha: m.timestamp, img: m.thumbnail_url || m.media_url, url: m.permalink, tipo: m.media_type })),
  });
}

async function facebook(neg) {
  const tok = await tokenDe(await conexion(neg, 'facebook')); if (!tok) return;
  const pag = (await getJ(`https://graph.facebook.com/v21.0/me/accounts?fields=name,fan_count,followers_count&access_token=${encodeURIComponent(tok)}`, tok))?.data?.[0]; if (!pag) return;
  await guardarMetrica(neg, 'facebook', { pagina: pag.name, seguidores: pag.followers_count ?? pag.fan_count ?? null });
}

async function tiktok(neg) {
  const tok = await tokenDe(await conexion(neg, 'tiktok')); if (!tok) return;
  const u = (await getJ('https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,likes_count,video_count', tok))?.data?.user; if (!u) return;
  await guardarMetrica(neg, 'tiktok', { usuario: u.display_name, seguidores: u.follower_count, likes: u.likes_count, videos: u.video_count });
}

export async function actualizarMetricas(neg) {
  for (const f of [web, busqueda, instagram, facebook, tiktok]) await f(neg).catch((e) => console.error('[metricas]', f.name, neg.id, e.message));
}

// ---------- chat con el equipo ----------
export async function asistente(neg, texto, { hablado = false } = {}) {
  const desde = new Date(Date.now() - 7 * 864e5).toISOString();
  const [deps, ev, citas, leads, pend, hist] = await Promise.all([
    sb(`of_departamentos?negocio_id=eq.${neg.id}&activo=eq.true&select=depto`),
    sb(`of_actividad?negocio_id=eq.${neg.id}&creado=gte.${desde}&tipo=eq.hecho&select=depto,texto,creado&order=creado.desc&limit=60`),
    sb(`of_citas?negocio_id=eq.${neg.id}&estado=in.(pendiente,confirmada)&select=nombre,servicio,fecha,estado&order=fecha.asc&limit=30`),
    sb(`of_leads?negocio_id=eq.${neg.id}&etapa=in.(nuevo,contactado,presupuesto)&select=nombre,interes,importe,etapa&limit=20`),
    sb(`of_actividad?negocio_id=eq.${neg.id}&tipo=in.(aviso,pendiente)&resuelto=eq.false&select=depto,texto&limit=20`),
    sb(`of_chat?negocio_id=eq.${neg.id}&select=de,texto&order=creado.desc&limit=10`),
  ]);
  const mis = deps.map((d) => d.depto);
  const f = (d) => (d ? new Date(d).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }) : 'sin hora');
  const contexto = [
    `DEPARTAMENTOS CONTRATADOS: ${mis.map((d) => DEPTO[d].nombre).join(', ')}`,
    `TRABAJO DE LOS ÚLTIMOS 7 DÍAS (${ev.length} tareas):\n${ev.slice(0, 40).map((e) => `- [${DEPTO[e.depto]?.corto}] ${f(e.creado)}: ${e.texto}`).join('\n') || '- nada'}`,
    `CITAS PRÓXIMAS:\n${citas.map((c) => `- ${c.nombre || 'Cliente'} · ${c.servicio || 'cita'} · ${f(c.fecha)} · ${c.estado}`).join('\n') || '- ninguna'}`,
    `CLIENTES POTENCIALES ABIERTOS:\n${leads.map((l) => `- ${l.nombre || 'Cliente'}: ${l.interes || ''} ${l.importe ? `(${l.importe} €)` : ''} · ${l.etapa}`).join('\n') || '- ninguno'}`,
    `PENDIENTE DEL DUEÑO (${pend.length}):\n${pend.map((p) => `- ${p.texto}`).join('\n') || '- nada'}`,
  ].join('\n\n');
  const mensajes = [...hist.reverse().map((m) => ({ role: m.de === 'tu' ? 'user' : 'assistant', content: m.texto })), { role: 'user', content: texto }];
  while (mensajes.length && mensajes[0].role !== 'user') mensajes.shift();
  const sistema = `Eres el equipo de agentes de la oficina de IA de este negocio y hablas con su dueño. Habla en plural («hemos», «tenemos»), cercano, claro y breve (máximo 6 frases o una lista corta).
${await fichaNegocio(neg)}

DATOS REALES DE LA OFICINA (no inventes nada que no esté aquí; si no lo sabes, dilo):
${contexto}

${hablado ? 'ESTÁS EN UNA LLAMADA DE VOZ: contesta como al teléfono, natural y muy breve (1 a 3 frases cortas), sin listas, sin emojis, sin símbolos ni enlaces. Di las horas y cifras como se dicen en voz alta.\n' : ''}Puedes hacer encargos: un post para redes (si está Redes sociales), un artículo (si está Contenido web) o un vídeo (si está Redes sociales). Si el dueño pide uno, pon la acción y di que os ponéis con ello y que lo tendrá en «Te necesitan» para revisarlo.
Devuelve SOLO JSON: {"respuesta":"...", "accion": null | {"tipo":"post|articulo|video", "tema":"..."}}`;
  const ia = await llamarIA({ sistema, mensajes, maxTokens: hablado ? 220 : 500, json: true });
  if (mis[0]) await consumo(neg.id, mis[0], { ...ia, unidades: 0 });
  const o = leerJson(ia.texto) || { respuesta: ia.texto };
  const permitida = { post: 'redes', video: 'redes', articulo: 'contenido' }[o.accion?.tipo];
  const accion = permitida && mis.includes(permitida) && o.accion?.tema ? o.accion : null;
  await sb('of_chat', { metodo: 'POST', cuerpo: [{ negocio_id: neg.id, de: 'tu', texto: String(texto).slice(0, 2000) }, { negocio_id: neg.id, de: 'equipo', texto: String(o.respuesta || '').slice(0, 3000), detalle: accion ? { accion } : {} }] });
  return { respuesta: o.respuesta, accion };
}

// ---------- vídeos: guion + voz ----------
export const VOCES = ['nova', 'shimmer', 'coral', 'sage', 'alloy', 'ash', 'echo', 'onyx'];
export async function guionVideo(neg, tema, ajustes = {}) {
  const o = await generar({ negocio: neg, depto: 'redes', maxTokens: 900, encargo: { tarea: `Escribiendo el guion de un vídeo sobre «${String(tema).slice(0, 50)}»`, fin: 'Guion del vídeo listo para que lo revises',
    prompt: `Escribe el guion de un vídeo vertical corto (Reels/TikTok, ${ajustes.duracion || 30} segundos) sobre: «${tema}». Estilo: ${ajustes.estilo || 'cercano y dinámico'}. Gancho en los 2 primeros segundos.
Divide en 4-6 escenas: para cada una, lo que dice la voz en off (frases cortas), el texto en pantalla y qué se ve (usa material típico del negocio: local, equipo, servicios, antes y después). Sin inventar precios ni ofertas.
JSON: {"titulo":"...","gancho":"...","escenas":[{"voz":"...","texto":"...","imagen":"..."}],"cierre":"llamada a la acción","texto_post":"...con hashtags"}` } });
  if (!o?.titulo) return null;
  const [v] = await sb('of_videos', { metodo: 'POST', prefer: 'return=representation', cuerpo: [{ negocio_id: neg.id, titulo: o.titulo, guion: o, estado: 'guion', voz: ajustes.voz || VOZ_DEFECTO(), estilo: ajustes.estilo || null }] });
  await actividad(neg.id, 'redes', `Guion de vídeo listo: «${o.titulo}». Revísalo y elige la voz`, 'pendiente', { accion: 'video', video: v.id, titulo: o.titulo });
  return v;
}

// Voz en off: ElevenLabs si está configurado (ELEVENLABS_API_KEY) y la voz es suya; si no, OpenAI (gpt-4o-mini-tts). Devuelve el MP3.
const esVozEleven = (v) => /^[A-Za-z0-9]{18,24}$/.test(String(v || ''));
export const hayEleven = () => Boolean(process.env.ELEVENLABS_API_KEY);
export const VOZ_DEFECTO = () => (hayEleven() ? process.env.ELEVENLABS_VOICE_ID || '851ejYcv2BoNPjrkw93G' : 'nova');
// Lo que cuesta poner voz a un texto (USD): ElevenLabs v4 0,08 $ por 1.000 caracteres; OpenAI mini-tts ≈ 0,015 $ por minuto (~1.000 caracteres).
export const costeVoz = (texto, vozId = VOZ_DEFECTO()) => (String(texto).length / 1000) * (hayEleven() && (esVozEleven(vozId) || !VOCES.includes(vozId)) ? 0.08 : 0.015);
export const COSTE_BUSQUEDA_PLACES = 0.032; // USD por búsqueda de texto (Places API, SKU Pro)
export async function voz(texto, vozId = VOZ_DEFECTO(), instrucciones = '') {
  if (hayEleven() && (esVozEleven(vozId) || !VOCES.includes(vozId))) {
    const id = esVozEleven(vozId) ? vozId : VOZ_DEFECTO();
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, { method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: String(texto).slice(0, 4500), model_id: process.env.ELEVENLABS_MODEL || 'eleven_v4', voice_settings: { stability: 0.35, similarity_boost: 0.7, style: 0, use_speaker_boost: true } }) });
    if (!r.ok) throw new Error(`elevenlabs ${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  }
  if (!process.env.OPENAI_API_KEY) throw new Error('sin_voz');
  const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: VOCES.includes(vozId) ? vozId : 'nova', input: String(texto).slice(0, 3500), instructions: `Habla en castellano de España, natural y cercano. ${instrucciones}`.trim(), response_format: 'mp3' }) });
  if (!r.ok) throw new Error(`voz ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

// Voces de ElevenLabs de la cuenta (con su muestra), primero las de España. Se guardan 1 h en memoria.
let cacheVoces = null;
export async function vocesEleven() {
  if (!hayEleven()) return null;
  if (cacheVoces && cacheVoces.t > Date.now() - 36e5) return cacheVoces.lista;
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } });
  if (!r.ok) return null;
  const j = await r.json();
  const esp = (v) => /spain|castil|españ|peninsular/i.test(JSON.stringify(v.labels || {}) + (v.description || '') + JSON.stringify(v.verified_languages || []));
  const lista = (j.voices || []).filter((v) => v.preview_url).map((v) => ({ id: v.voice_id, nombre: v.name.split(/[-–(]/)[0].trim(),
    detalle: [v.labels?.gender === 'female' ? 'Mujer' : v.labels?.gender === 'male' ? 'Hombre' : null, v.labels?.age, v.labels?.accent, v.labels?.descriptive || v.labels?.description].filter(Boolean).join(' · '),
    muestra: v.preview_url, espana: esp(v) })).sort((a, b) => Number(b.espana) - Number(a.espana)).slice(0, 24);
  cacheVoces = { t: Date.now(), lista };
  return lista;
}

export async function subirArchivo(ruta, buffer, tipo) {
  const base = process.env.VITE_OFICINA_SUPABASE_URL; const clave = process.env.OFICINA_SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${base}/storage/v1/object/oficina-material/${ruta}`, { method: 'POST', headers: { Authorization: `Bearer ${clave}`, apikey: clave, 'Content-Type': tipo, 'x-upsert': 'true' }, body: buffer });
  if (!r.ok) throw new Error(`storage ${r.status}`);
  return ruta;
}

// ---------- competencia (Google Places) ----------
export const hayPlaces = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);
export async function buscarCompetidores(neg) {
  if (!hayPlaces()) throw new Error('sin_places');
  const q = `${neg.sector || neg.nombre} ${neg.direccion?.split(',').slice(-1)[0] || 'Cornellà de Llobregat'}`;
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.websiteUri,places.formattedAddress' },
    body: JSON.stringify({ textQuery: q, languageCode: 'es', maxResultCount: 10 }) });
  const j = await r.json();
  const propios = String(neg.nombre).toLowerCase();
  const lista = (j.places || []).filter((p) => !String(p.displayName?.text || '').toLowerCase().includes(propios)).slice(0, 6);
  for (const p of lista) {
    const ya = await uno(`of_competidores?negocio_id=eq.${neg.id}&place_id=eq.${encodeURIComponent(p.id)}&select=id`);
    const fila = { nombre: p.displayName?.text, web: p.websiteUri || null, direccion: p.formattedAddress || null, nota: p.rating ?? null, resenas: p.userRatingCount ?? null, actualizado: new Date().toISOString() };
    if (ya) await sb(`of_competidores?id=eq.${ya.id}`, { metodo: 'PATCH', cuerpo: fila });
    else await sb('of_competidores', { metodo: 'POST', cuerpo: [{ ...fila, negocio_id: neg.id, place_id: p.id }] });
  }
  return lista.length;
}

// ---------- informe por correo ----------
export async function enviarInforme(neg, periodo = 'semanal', para) {
  if (!process.env.RESEND_API_KEY) return false;
  const dias = { diario: 1, semanal: 7, mensual: 30 }[periodo] || 7;
  const desde = new Date(Date.now() - dias * 864e5).toISOString();
  const [ev, citas, ganados, metricas] = await Promise.all([
    sb(`of_actividad?negocio_id=eq.${neg.id}&creado=gte.${desde}&tipo=in.(hecho,aviso,pendiente)&select=depto,tipo,texto,resuelto&order=creado.desc&limit=500`),
    sb(`of_citas?negocio_id=eq.${neg.id}&creado=gte.${desde}&select=estado`),
    sb(`of_leads?negocio_id=eq.${neg.id}&etapa=eq.ganado&actualizado=gte.${desde}&select=importe`),
    sb(`of_metricas?negocio_id=eq.${neg.id}&fecha=gte.${hace(dias + 1)}&select=fuente,fecha,datos&order=fecha.desc`),
  ]);
  const hechos = ev.filter((e) => e.tipo === 'hecho'); if (!hechos.length && !ev.length) return false;
  const por = {}; for (const e of hechos) por[e.depto] = (por[e.depto] || 0) + 1;
  const minutos = { atencion: 3, citas: 4, ventas: 6, redes: 20, google: 5, contenido: 90 };
  const horas = Math.round(Object.entries(por).reduce((a, [d, n]) => a + n * (minutos[d] || 0), 0) / 6) / 10;
  const pend = ev.filter((e) => e.tipo !== 'hecho' && !e.resuelto).length;
  const ultima = (f) => metricas.find((m) => m.fuente === f)?.datos;
  const webD = ultima('web'); const visitas = webD?.serie?.slice(-dias).reduce((a, x) => a + x.usuarios, 0);
  const ig = ultima('instagram');
  const kpi = (n, t) => `<td style="padding:14px 10px;text-align:center;background:#f4f6fb;border-radius:12px"><div style="font-size:24px;font-weight:800;color:#0d1020">${n}</div><div style="font-size:12px;color:#6c7086;margin-top:2px">${t}</div></td>`;
  const titulo = { diario: 'Tu día', semanal: 'Tu semana', mensual: 'Tu mes' }[periodo];
  const destacados = hechos.slice(0, 8).map((e) => `<li style="margin:0 0 8px;color:#3b3f52"><b style="color:${DEPTO[e.depto]?.color || '#0047ff'}">${DEPTO[e.depto]?.corto || ''}</b> · ${e.texto}</li>`).join('');
  const filas = Object.entries(por).sort((a, b) => b[1] - a[1]).map(([d, n]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eef0f5"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${DEPTO[d]?.color};margin-right:8px"></span>${DEPTO[d]?.nombre || d}</td><td style="padding:8px 0;border-bottom:1px solid #eef0f5;text-align:right;font-weight:700">${n}</td></tr>`).join('');
  const html = `<div style="background:#f6f7f9;padding:24px 12px;font-family:Inter,Arial,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden">
    <div style="background:#0047ff;color:#fff;padding:26px 26px 22px"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Informe ${periodo} · Oficina de IA</div><h1 style="margin:6px 0 0;font-size:24px">${titulo} en ${neg.nombre}</h1>
    <p style="margin:8px 0 0;opacity:.9">Tus agentes han hecho <b>${hechos.length} tareas</b>: unas <b>${horas} h</b> de trabajo que no has tenido que hacer tú (estimación).</p></div>
    <div style="padding:22px 22px 6px"><table style="width:100%;border-collapse:separate;border-spacing:8px 0"><tr>${kpi(hechos.length, 'tareas hechas')}${kpi(citas.length, 'citas')}${kpi(ganados.length, 'clientes ganados')}${visitas != null ? kpi(visitas, 'visitas web') : ig?.seguidores != null ? kpi(ig.seguidores, 'seguidores IG') : kpi(pend, 'te esperan')}</tr></table></div>
    <div style="padding:16px 26px"><h2 style="font-size:15px;margin:10px 0 8px">Por departamento</h2><table style="width:100%;border-collapse:collapse;font-size:14px">${filas}</table>
    <h2 style="font-size:15px;margin:22px 0 10px">Lo más destacado</h2><ul style="padding-left:18px;margin:0;font-size:14px;line-height:1.5">${destacados}</ul>
    ${pend ? `<p style="margin:20px 0 0;padding:12px 14px;background:#fff5e6;border-radius:10px;color:#8a4b00;font-size:14px">Tienes <b>${pend}</b> ${pend === 1 ? 'cosa' : 'cosas'} esperándote en «Te necesitan».</p>` : ''}
    <p style="margin:24px 0 8px"><a href="https://agutidesigns.io/app" style="display:inline-block;background:#0047ff;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Abrir mi oficina</a></p></div>
    <div style="padding:16px 26px 22px;color:#9a9db0;font-size:12px">Puedes cambiar cada cuánto recibes este informe en tu panel, en Informes.</div></div></div>`;
  const { Resend } = await import('resend');
  await new Resend(process.env.RESEND_API_KEY).emails.send({ from: 'Oficina de IA · Agutidesigns <info@agutidesigns.io>', to: para || neg.preferencias?.email_avisos || neg.owner_email,
    subject: `${titulo}: ${hechos.length} tareas hechas por tu oficina de IA`, html });
  return true;
}

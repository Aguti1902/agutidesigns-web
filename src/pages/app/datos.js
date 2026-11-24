// Datos del panel: carga real desde Supabase con tiempo real (o un negocio de ejemplo en modo demo) y estadísticas.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/oficinaSupabase';
import { DEPARTAMENTOS, DEPTO } from '../../data/oficinaSaas';

const DIA = 864e5;
// Minutos que llevaría a una persona cada tarea (para «tiempo que te ahorra», siempre marcado como estimación).
export const MINUTOS_TAREA = { atencion: 3, citas: 4, ventas: 6, redes: 20, google: 5, contenido: 90 };
export const pendiente = (e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto;

// Llamada a la API de la oficina con la sesión del cliente.
export async function api(accion, cuerpo) {
  const { data } = await supabase.auth.getSession();
  const r = await fetch(`/api/oficina/${accion}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` }, body: JSON.stringify(cuerpo || {}) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Algo ha fallado. Inténtalo de nuevo.'), { datos: j });
  return j;
}

// Guarda ajustes de un departamento (en el estado y en la base de datos).
export async function guardarAjustes(o, depto, cambios) {
  const dep = o.deptos.find((d) => d.depto === depto); const nuevo = { ...(dep?.ajustes || {}), ...cambios };
  o.setEstado((s) => ({ ...s, deptos: s.deptos.map((x) => (x.depto === depto ? { ...x, ajustes: nuevo } : x)) }));
  if (!o.demo) {
    const { error } = await supabase.from('of_departamentos').update({ ajustes: nuevo }).eq('negocio_id', o.negocio.id).eq('depto', depto);
    if (error) throw new Error('No se ha podido guardar.');
  }
}


// ---------- negocio de ejemplo ----------
const DEMO_DEPTOS = ['atencion', 'citas', 'ventas', 'redes', 'google', 'contenido'];
export const DEMO_NEG = { id: '00000000-0000-4000-8000-000000000000', nombre: 'Peluquería Marta', owner_email: 'demo@agutidesigns.io', estado: 'activo', importe_mes: 199,
  sector: 'Peluquería y estética', telefono: '600 000 000', direccion: 'Carrer de Sant Ildefons, Cornellà de Llobregat', horarios: 'L-V 9:30-20:00 · S 9:00-14:00',
  precios: 'Corte mujer 22 € · Corte hombre 14 € · Tinte desde 35 € · Mechas desde 60 € · Peinado 18 €', tono: 'Cercano, de tú, con algún emoji', instrucciones: '' };
const TEXTOS = {
  atencion: [['hecho', 'Ha contestado a {n} por {c} (precios)', 'precios'], ['hecho', 'Ha contestado a {n} por {c} (horarios)', 'horarios'],
    ['hecho', 'Ha contestado a {n} por {c} (servicios)', 'servicios'], ['hecho', 'Ha contestado a {n} por {c} (ubicación)', 'ubicación'],
    ['aviso', '{n} quiere hablar contigo sobre un peinado de novia', 'otros']],
  citas: [['hecho', 'Ha recogido la cita que quiere {n}: jueves a las 17:00'], ['hecho', 'Ha enviado los recordatorios de las citas de mañana'], ['aviso', '{n} quiere cita el viernes por la tarde. Confírmasela']],
  ventas: [['hecho', 'Ha contestado la petición de presupuesto de {n} (pack novia)'], ['hecho', '{n} ha aceptado el presupuesto'], ['aviso', '{n} pidió presupuesto hace 2 días y no ha vuelto a escribir. Toca hacer seguimiento']],
  redes: [['hecho', 'Ha publicado en Instagram: «Color de temporada»'], ['pendiente', 'Post listo: «Antes y después de unas mechas». Revísalo y apruébalo']],
  google: [['hecho', 'Ha respondido una reseña de 5 estrellas de {n}'], ['pendiente', 'Reseña de 3 ★ de {n}: revisa la respuesta propuesta antes de publicarla']],
  contenido: [['hecho', 'Ha publicado en tu blog «Cómo cuidar el pelo teñido en invierno»'], ['hecho', 'Ha optimizado el artículo «Mechas balayage: todo lo que debes saber»']],
};
const NOMBRES = ['Laura', 'Jordi', 'Núria', 'Marc', 'Ana', 'Pol', 'Marta', 'Sergi', 'Carla', 'Iván', 'Lucía', 'Àlex', 'Paula', 'David'];
const CHARLAS = [
  ['Laura', 'whatsapp', [['cliente', 'Hola! Cuánto cuestan unas mechas?'], ['agente', '¡Hola Laura! 😊 Las mechas van desde 60 €, según el largo. ¿Quieres que te busquemos un hueco?'], ['cliente', 'Vale, el sábado por la mañana podríais?'], ['agente', '¡Genial! Apunto que prefieres el sábado por la mañana y te lo confirmamos enseguida 🙌']], 'cita'],
  ['Marc', 'web', [['cliente', 'Abrís el lunes?'], ['agente', '¡Hola Marc! Sí, el lunes abrimos de 9:30 a 20:00. ¿Te podemos ayudar en algo más?'], ['cliente', 'No, gracias!']], null],
  ['Núria', 'whatsapp', [['cliente', 'Bona tarda, feu pentinats per a casaments?'], ['agente', 'Bona tarda Núria! Sí, en fem 💍 Per preparar-te un pressupost, ho consulto amb la Marta i et diem alguna cosa de seguida.']], 'presupuesto'],
  ['Pol', 'web', [['cliente', 'Dónde estáis exactamente?'], ['agente', 'Estamos en el Carrer de Sant Ildefons, en Cornellà de Llobregat. ¡Te esperamos!']], null],
];

function generarDemo() {
  let s = 1902; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const ahora = Date.now(); const ev = []; let id = 1;
  const porDia = { atencion: 15, citas: 6, ventas: 3, redes: 0.9, google: 1.4, contenido: 0.12 };
  const horaAt = () => { const x = r(); return x < 0.42 ? 9 + r() * 5 : x < 0.84 ? 16 + r() * 5 : x < 0.95 ? 21 + r() * 3 : 7 + r() * 2; };
  for (let d = 59; d >= 0; d--) {
    const base = new Date(ahora - d * DIA); base.setHours(0, 0, 0, 0);
    const dow = base.getDay(); const factor = (dow === 0 ? 0.35 : dow === 6 ? 0.8 : 1) * (1 + (59 - d) * 0.006);
    for (const dep of DEMO_DEPTOS) {
      const n = Math.round(porDia[dep] * factor * (0.6 + r() * 0.8));
      for (let k = 0; k < n; k++) {
        const t = base.getTime() + (dep === 'atencion' ? horaAt() : 9 + r() * 11) * 36e5; if (t > ahora) continue;
        const raros = TEXTOS[dep].filter((x) => x[0] !== 'hecho'); const normales = TEXTOS[dep].filter((x) => x[0] === 'hecho');
        const lista = raros.length && r() < (dep === 'redes' ? 0.3 : 0.05) ? raros : normales; const pick = lista[Math.floor(r() * lista.length)];
        const canal = r() < 0.72 ? 'WhatsApp' : 'el chat de la web';
        const detalle = dep === 'atencion' ? { canal: canal === 'WhatsApp' ? 'whatsapp' : 'web', ms: Math.round(2500 + r() * 6000), tema: pick[2] }
          : dep === 'google' ? (pick[0] === 'pendiente' ? { accion: 'responder_resena', estrellas: 3, original: 'El corte bien, pero tuve que esperar casi media hora aunque tenía cita.', texto: 'Hola, gracias por contárnoslo y perdona la espera: no es lo normal y lo estamos revisando para que no vuelva a pasar. Nos alegra que te gustara el corte, ¡esperamos verte pronto!' }
            : { estrellas: r() < 0.85 ? 5 : 4, texto: '¡Muchas gracias por tu reseña! Nos alegra mucho que salieras contenta. ¡Te esperamos pronto! 💇‍♀️' })
          : dep === 'redes' && pick[0] === 'pendiente' ? { accion: 'publicar', texto: 'De castaño apagado a un rubio miel luminoso ✨ ¿Te animas a darle luz a tu pelo esta temporada? Pide tu cita por WhatsApp. #Cornellà #mechas #peluqueria' }
          : dep === 'ventas' ? { resultado: pick[1].includes('aceptado') ? 'ganado' : 'abierto' } : {};
        ev.push({ id: id++, depto: dep, tipo: pick[0], creado: new Date(t).toISOString(), resuelto: d > 1, texto: pick[1].replace('{n}', NOMBRES[Math.floor(r() * NOMBRES.length)]).replace('{c}', canal), detalle });
      }
    }
  }
  return ev.sort((a, b) => (a.creado < b.creado ? 1 : -1));
}

// Métricas, vídeos, material, competencia y chat del negocio de ejemplo (datos ilustrativos de la demo).
function demoMarketing(ahora) {
  let s = 77; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const dia = (k) => new Date(ahora - k * DIA).toISOString().slice(0, 10);
  const serieWeb = Array.from({ length: 28 }, (_, i) => { const d = new Date(ahora - (27 - i) * DIA); const f = d.getDay() === 0 ? 0.55 : d.getDay() === 6 ? 0.8 : 1; const u = Math.round((38 + i * 0.9) * f * (0.8 + r() * 0.4)); return { fecha: dia(27 - i), usuarios: u, sesiones: Math.round(u * 1.25), vistas: Math.round(u * 2.6) }; });
  const seguidores = Array.from({ length: 28 }, (_, i) => ({ negocio_id: DEMO_NEG.id, fuente: 'instagram', fecha: dia(27 - i), datos: { seguidores: 1840 + i * 6 + Math.round(r() * 5) } }));
  const metricas = [
    { fuente: 'web', fecha: dia(0), datos: { serie: serieWeb, canales: [{ canal: 'Organic Search', sesiones: 612 }, { canal: 'Direct', sesiones: 298 }, { canal: 'Organic Social', sesiones: 214 }, { canal: 'Referral', sesiones: 61 }],
      paginas: [{ ruta: '/', vistas: 1180 }, { ruta: '/servicios/mechas', vistas: 512 }, { ruta: '/blog/balayage-cornella', vistas: 344 }, { ruta: '/contacto', vistas: 206 }, { ruta: '/precios', vistas: 188 }] } },
    { fuente: 'google_busqueda', fecha: dia(0), datos: { sitio: 'peluqueriamarta.es', serie: serieWeb.map((x) => ({ fecha: x.fecha, clics: Math.round(x.usuarios * 0.45), impresiones: Math.round(x.usuarios * 9) })),
      busquedas: [['peluquería cornellà', 142, 2310, 3.2], ['peluqueria marta', 98, 240, 1.1], ['mechas balayage cornellà', 41, 880, 5.8], ['peluquería cerca de mí', 37, 1920, 8.4], ['corte de pelo mujer cornellà', 22, 610, 6.9], ['keratina cornellà precio', 14, 420, 9.7], ['peinado novia baix llobregat', 9, 380, 12.3]].map(([q, clics, impresiones, posicion]) => ({ q, clics, impresiones, posicion })) } },
    { fuente: 'instagram', fecha: dia(0), datos: { usuario: 'peluqueriamarta', seguidores: 2011, publicaciones: 214, alcance: serieWeb.map((x) => ({ fecha: x.fecha, valor: Math.round(x.usuarios * 7.5) })),
      posts: [['Antes y después: rubio miel ✨', 312, 41], ['Nuestro equipo os desea feliz semana 💇‍♀️', 188, 22], ['3 trucos para que el color dure más', 264, 35], ['Reel: balayage en 30 segundos', 540, 63]].map(([texto, likes, comentarios], i) => ({ texto, likes, comentarios, fecha: new Date(ahora - (i * 3 + 1) * DIA).toISOString(), tipo: i === 3 ? 'VIDEO' : 'IMAGE' })) } },
    { fuente: 'facebook', fecha: dia(0), datos: { pagina: 'Peluquería Marta', seguidores: 860 } },
    ...seguidores,
  ];
  const videos = [
    { id: 'v1', titulo: '3 errores que estropean tus mechas', estado: 'guion', voz: 'nova', estilo: 'dinamico', creado: new Date(ahora - 5 * 36e5).toISOString(),
      guion: { gancho: '¿Tus mechas se apagan a las dos semanas? Seguramente cometes uno de estos 3 errores.', escenas: [{ voz: 'Error uno: lavar con agua muy caliente.', texto: 'Error 1: agua caliente', imagen: 'Lavacabezas del salón' }, { voz: 'Error dos: champú con sulfatos.', texto: 'Error 2: sulfatos', imagen: 'Productos en la estantería' }, { voz: 'Y el tres: no usar protector antes de la plancha.', texto: 'Error 3: sin protector', imagen: 'Marta secando y planchando' }], cierre: 'Pide tu cita por WhatsApp y te asesoramos.', texto_post: 'Que tus mechas duren el doble 💛 #Cornellà #mechas' } },
    { id: 'v2', titulo: 'Un día en Peluquería Marta', estado: 'montaje', voz: 'coral', estilo: 'cercano', creado: new Date(ahora - 2 * DIA).toISOString(), guion: { gancho: 'Así es un martes cualquiera en el salón.', escenas: [] } },
    { id: 'v3', titulo: 'Balayage en 30 segundos', estado: 'publicado', voz: 'shimmer', estilo: 'elegante', creado: new Date(ahora - 6 * DIA).toISOString(), guion: { gancho: 'De castaño a rubio miel en 30 segundos.', escenas: [] } },
  ];
  const material = [['Logo Peluquería Marta', 'logo'], ['Fachada del salón', 'foto'], ['Equipo 2026', 'foto'], ['Antes y después balayage', 'foto'], ['Vídeo del salón por dentro', 'video'], ['Carpeta de Drive: Fotos clientas', 'carpeta']]
    .map(([nombre, tipo], i) => ({ id: `m${i}`, nombre, tipo, creado: new Date(ahora - (i + 1) * 3 * DIA).toISOString(), url: tipo === 'carpeta' ? 'https://drive.google.com/' : null }));
  const competidores = [['Estilistas Cornellà', 4.5, 212, 'estilistascornella.es'], ['Salón Nuria Beauty', 4.7, 389, 'nuriabeauty.com'], ['Pelu Express Centre', 4.1, 96, null], ['Studio Hair Llobregat', 4.6, 154, 'studiohair.es']]
    .map(([nombre, nota, resenas, web], i) => ({ id: `k${i}`, nombre, nota, resenas, web, direccion: 'Cornellà de Llobregat', datos: { publica: ['3 posts/semana en Instagram', 'Sin blog', 'Responde pocas reseñas', 'Ofrece reserva online'][i] } }));
  const chat = [
    { id: 1, de: 'tu', texto: '¿Qué habéis hecho hoy?', creado: new Date(ahora - 50 * 60e3).toISOString() },
    { id: 2, de: 'equipo', texto: 'Hoy hemos atendido a 14 clientes por WhatsApp y el chat, recogido 3 citas (2 te esperan para confirmar) y respondido 2 reseñas de 5 ★. Tienes un post y un guion de vídeo listos para revisar.', creado: new Date(ahora - 49 * 60e3).toISOString() },
  ];
  return { metricas, videos, material, competidores, chat };
}

export function estadoDemo() {
  const eventos = generarDemo(); const ahora = Date.now();
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const uso = {};
  for (const d of DEMO_DEPTOS) { const u = eventos.filter((e) => e.depto === d && new Date(e.creado) >= mes).length; uso[d] = { unidades_mes: u, pct: Math.min(0.95, (u / DEPTO[d].cupo.n) * 0.9) }; }
  const conversaciones = CHARLAS.map(([nombre, canal, msgs, necesita], i) => ({
    id: `c${i}`, canal, nombre, contacto: canal === 'whatsapp' ? `34600${100000 + i}` : `web${i}`, estado: 'agente', necesita, leido: i > 1, tema: necesita || 'otros',
    ultimo: new Date(ahora - (i * 23 + 4) * 60000).toISOString(),
    mensajes: msgs.map(([de, texto], k) => ({ id: `m${i}-${k}`, de, texto, creado: new Date(ahora - (i * 23 + 4 + (msgs.length - k) * 2) * 60000).toISOString() })),
  }));
  const d = (dias, h = 10) => { const x = new Date(ahora + dias * 864e5); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const citas = [
    { id: 'ci1', nombre: 'Laura', canal: 'whatsapp', contacto: '34600100000', servicio: 'Mechas', cuando_texto: 'el sábado por la mañana', fecha: d(4, 10), estado: 'pendiente', conversacion_id: 'c0', creado: d(0, 9) },
    { id: 'ci2', nombre: 'Jordi', canal: 'web', servicio: 'Corte hombre', cuando_texto: 'jueves a las 17:00', fecha: d(2, 17), estado: 'confirmada', creado: d(-1) },
    { id: 'ci3', nombre: 'Carla', canal: 'whatsapp', servicio: 'Tinte', cuando_texto: 'viernes tarde', fecha: d(3, 18), estado: 'confirmada', creado: d(-1) },
    { id: 'ci4', nombre: 'Àlex', canal: 'whatsapp', servicio: 'Peinado', cuando_texto: 'mañana a las 12', fecha: d(1, 12), estado: 'pendiente', creado: d(0, 8) },
    { id: 'ci5', nombre: 'Lucía', canal: 'web', servicio: 'Corte mujer', cuando_texto: 'el martes', fecha: d(-2, 11), estado: 'hecha', creado: d(-4) },
  ];
  const leads = [
    { id: 'l1', nombre: 'Núria', canal: 'whatsapp', interes: 'Peinado y maquillaje de boda', importe: 180, etapa: 'nuevo', conversacion_id: 'c2', creado: d(0) },
    { id: 'l2', nombre: 'Paula', canal: 'web', interes: 'Pack novia con prueba', importe: 250, etapa: 'presupuesto', creado: d(-2) },
    { id: 'l3', nombre: 'Marta G.', canal: 'whatsapp', interes: 'Alisado de keratina', importe: 120, etapa: 'contactado', creado: d(-1) },
    { id: 'l4', nombre: 'Sergi', canal: 'web', interes: 'Bono 5 cortes', importe: 60, etapa: 'ganado', creado: d(-6) },
    { id: 'l5', nombre: 'Ana', canal: 'whatsapp', interes: 'Mechas balayage', importe: 95, etapa: 'ganado', creado: d(-8) },
    { id: 'l6', nombre: 'David', canal: 'web', interes: 'Tratamiento capilar', importe: 70, etapa: 'perdido', creado: d(-10) },
  ];
  const facturas = [0, 1, 2].map((i) => { const f = new Date(); f.setMonth(f.getMonth() - i, 3); return { id: `f${i}`, numero: `${2690 - i * 9}`, fecha: f.toISOString().slice(0, 10), concepto: 'Oficina de IA · plan mensual', base: 199, iva: 41.79, retencion: 29.85, total: 211.94, estado: 'pagada' }; });
  const extras = demoMarketing(ahora);
  // Piezas de demo que esperan tu decisión: artículo, vídeo y seguimiento con mensaje listo.
  eventos.unshift(
    { id: 'p-art', depto: 'contenido', tipo: 'pendiente', creado: new Date(ahora - 3 * 36e5).toISOString(), resuelto: false, texto: 'Artículo listo: «Balayage en Cornellà: precio, duración y cuidados». Revísalo y apruébalo',
      detalle: { accion: 'articulo', titulo: 'Balayage en Cornellà: precio, duración y cuidados', resumen: 'Todo lo que preguntan nuestras clientas antes de hacerse un balayage, explicado claro.', texto: '## ¿Qué es el balayage?\nEs una técnica de coloración a mano alzada que crea un degradado natural…\n\n## ¿Cuánto dura?\nEntre 2 y 3 horas según el largo…\n\n## Cuidados después\nChampú sin sulfatos y una mascarilla a la semana…' } },
    { id: 'p-post', depto: 'redes', tipo: 'pendiente', creado: new Date(ahora - 2 * 36e5).toISOString(), resuelto: false, texto: 'Post listo para el viernes: «Antes y después: rubio miel». Revísalo y apruébalo',
      detalle: { accion: 'publicar', red: 'instagram', dia: 'viernes', idea_imagen: 'Foto del antes y después de Laura con luz natural', texto: 'De castaño apagado a un rubio miel luminoso ✨ ¿Te animas a darle luz a tu pelo esta temporada? Pide tu cita por WhatsApp. #Cornellà #mechas #peluqueria' } },
    { id: 'p-vid', depto: 'redes', tipo: 'pendiente', creado: new Date(ahora - 5 * 36e5).toISOString(), resuelto: false, texto: 'Guion de vídeo listo: «3 errores que estropean tus mechas». Revísalo y elige la voz', detalle: { accion: 'video', video: 'v1', titulo: '3 errores que estropean tus mechas' } },
    { id: 'p-seg', depto: 'ventas', tipo: 'pendiente', creado: new Date(ahora - 7 * 36e5).toISOString(), resuelto: false, texto: 'Paula pidió presupuesto hace más de 2 días y no ha vuelto a escribir. Te he dejado el mensaje de seguimiento listo',
      detalle: { accion: 'seguimiento', conversacion: 'c2', texto: '¡Hola Paula! ¿Pudiste mirar el presupuesto del pack novia? Si quieres, te reservamos la prueba un sábado por la mañana 😊' } },
  );
  return { cargando: false, sesion: null, negocio: DEMO_NEG, eventos, uso, conversaciones, citas, leads, facturas, ...extras,
    deptos: DEMO_DEPTOS.map((d) => ({ depto: d, cupo_n: DEPTO[d].cupo.n, activo: true, ajustes: { revisar: d === 'redes' } })),
    agentes: Object.fromEntries(DEMO_DEPTOS.map((d) => [d, { estado: 'disponible', tarea: 'Esperando la siguiente tarea', actualizado: new Date().toISOString() }])),
    conocimiento: [{ id: 'k1', tipo: 'nota', respuesta: 'El 8 de diciembre cerramos todo el día.', hasta: '2026-12-08' }, { id: 'k2', tipo: 'faq', pregunta: '¿Se puede pagar con Bizum?', respuesta: 'Sí, aceptamos Bizum, tarjeta y efectivo.' }],
    conexiones: [{ herramienta: 'whatsapp', estado: 'conectada', cuenta: '+34 600 000 000' }, { herramienta: 'google_business', estado: 'conectada', cuenta: 'Peluquería Marta · Cornellà' },
      { herramienta: 'google_calendar', estado: 'conectada', cuenta: 'agenda@peluqueriamarta.es' }, { herramienta: 'instagram', estado: 'conectada', cuenta: '@peluqueriamarta' },
      { herramienta: 'google_analytics', estado: 'conectada', cuenta: 'peluqueriamarta.es' }, { herramienta: 'search_console', estado: 'conectada', cuenta: 'peluqueriamarta.es' }, { herramienta: 'facebook', estado: 'conectada', cuenta: 'Peluquería Marta' }] };
}

// ---------- carga real con tiempo real ----------
const VACIO = { cargando: true, sesion: null, negocio: null, deptos: [], uso: {}, eventos: [], conexiones: [], agentes: {}, conversaciones: [], conocimiento: [], citas: [], leads: [], facturas: [], metricas: [], videos: [], material: [], competidores: [], chat: [] };
export function useOficina(demo) {
  const [estado, setEstado] = useState(() => (demo ? estadoDemo() : VACIO));
  useEffect(() => {
    if (demo) return undefined;
    let canal; let vivo = true;
    async function cargar(sesion) {
      if (!sesion) { setEstado({ ...VACIO, cargando: false }); return; }
      const { data: negs } = await supabase.from('of_negocios').select('*').order('created_at', { ascending: false }).limit(1);
      const negocio = negs?.[0] || null;
      if (!negocio) { setEstado({ ...VACIO, cargando: false, sesion }); return; }
      const id = negocio.id; const desde = new Date(Date.now() - 60 * DIA).toISOString();
      const [dep, uso, ev, con, ag, conv, con2, ci, le, fa, me, vi, ma, co, ch] = await Promise.all([
        supabase.from('of_departamentos').select('*').eq('negocio_id', id).eq('activo', true),
        supabase.from('of_uso_mes').select('*').eq('negocio_id', id),
        supabase.from('of_actividad').select('*').eq('negocio_id', id).gte('creado', desde).order('creado', { ascending: false }).limit(5000),
        supabase.from('of_conexiones').select('herramienta, estado, cuenta, created_at').eq('negocio_id', id),
        supabase.from('of_agentes').select('*').eq('negocio_id', id),
        supabase.from('of_conversaciones').select('*').eq('negocio_id', id).order('ultimo', { ascending: false }).limit(150),
        supabase.from('of_conocimiento').select('*').eq('negocio_id', id).order('created_at', { ascending: false }),
        supabase.from('of_citas').select('*').eq('negocio_id', id).order('creado', { ascending: false }).limit(300),
        supabase.from('of_leads').select('*').eq('negocio_id', id).order('actualizado', { ascending: false }).limit(300),
        supabase.from('of_facturas').select('*').eq('negocio_id', id).order('fecha', { ascending: false }).limit(100),
        supabase.from('of_metricas').select('*').eq('negocio_id', id).gte('fecha', new Date(Date.now() - 90 * DIA).toISOString().slice(0, 10)).order('fecha', { ascending: false }).limit(1000),
        supabase.from('of_videos').select('*').eq('negocio_id', id).order('creado', { ascending: false }).limit(100),
        supabase.from('of_material').select('*').eq('negocio_id', id).order('creado', { ascending: false }).limit(500),
        supabase.from('of_competidores').select('*').eq('negocio_id', id).order('resenas', { ascending: false }),
        supabase.from('of_chat').select('*').eq('negocio_id', id).order('creado', { ascending: false }).limit(60),
      ]);
      if (!vivo) return;
      const orden = DEPARTAMENTOS.map((d) => d.id);
      setEstado({ cargando: false, sesion, negocio, eventos: ev.data || [], conexiones: con.data || [], conversaciones: conv.data || [], conocimiento: con2.data || [],
        citas: ci.data || [], leads: le.data || [], facturas: fa.data || [], metricas: me.data || [], videos: vi.data || [], material: ma.data || [], competidores: co.data || [], chat: (ch.data || []).reverse(),
        agentes: Object.fromEntries((ag.data || []).map((a) => [a.depto, a])),
        deptos: (dep.data || []).sort((a, b) => orden.indexOf(a.depto) - orden.indexOf(b.depto)),
        uso: Object.fromEntries((uso.data || []).map((u) => [u.depto, { unidades_mes: u.unidades_mes, pct: u.tokens_mes ? u.tokens_usados / u.tokens_mes : 0 }])) });
      const f = `negocio_id=eq.${id}`;
      canal = supabase.channel(`oficina-${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_actividad', filter: f }, (p) => setEstado((e) => ({ ...e,
          eventos: p.eventType === 'INSERT' ? [p.new, ...e.eventos] : e.eventos.map((x) => (x.id === p.new.id ? p.new : x)) })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_agentes', filter: f }, (p) => setEstado((e) => ({ ...e, agentes: { ...e.agentes, [p.new.depto]: p.new } })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_conversaciones', filter: f }, (p) => setEstado((e) => ({ ...e,
          conversaciones: [p.new, ...e.conversaciones.filter((c) => c.id !== p.new.id)].sort((a, b) => (a.ultimo < b.ultimo ? 1 : -1)) })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_citas', filter: f }, (p) => setEstado((e) => ({ ...e, citas: [p.new, ...e.citas.filter((c) => c.id !== p.new.id)] })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_leads', filter: f }, (p) => setEstado((e) => ({ ...e, leads: [p.new, ...e.leads.filter((c) => c.id !== p.new.id)] })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_videos', filter: f }, (p) => setEstado((e) => ({ ...e, videos: [p.new, ...e.videos.filter((c) => c.id !== p.new.id)] })))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'of_chat', filter: f }, (p) => setEstado((e) => ({ ...e, chat: e.chat.some((c) => c.id === p.new.id) ? e.chat : [...e.chat, p.new] })))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'of_facturas', filter: f }, (p) => setEstado((e) => ({ ...e, facturas: [p.new, ...e.facturas.filter((c) => c.id !== p.new.id)] })))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'of_negocios', filter: `id=eq.${id}` }, (p) => setEstado((e) => ({ ...e, negocio: { ...e.negocio, ...p.new } })))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'of_mensajes', filter: f }, (p) => setEstado((e) => ({ ...e, ultimoMensaje: p.new })))
        .subscribe();
    }
    supabase.auth.getSession().then(({ data }) => cargar(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') cargar(s); });
    return () => { vivo = false; sub.subscription.unsubscribe(); if (canal) supabase.removeChannel(canal); };
  }, [demo]);
  return [estado, setEstado];
}

// ---------- estadísticas ----------
const util = (e) => e.tipo !== 'sistema';
function resumen(evs) {
  const por = (d) => evs.filter((e) => e.depto === d && e.tipo !== 'aviso');
  const at = por('atencion'); const ms = at.map((e) => e.detalle?.ms).filter(Boolean);
  const res = evs.filter((e) => e.depto === 'google').map((e) => e.detalle?.estrellas).filter(Boolean);
  const fuera = at.filter((e) => { const f = new Date(e.creado); const h = f.getHours() + f.getMinutes() / 60; return f.getDay() === 0 || h < 9.5 || h >= 20; }).length;
  return {
    total: evs.filter((e) => e.tipo !== 'aviso').length, conversaciones: at.length, citas: por('citas').length, ventas: por('ventas').length,
    publicaciones: por('redes').length, google: por('google').length, articulos: por('contenido').length, avisos: evs.filter((e) => e.tipo === 'aviso').length,
    minutos: evs.filter((e) => e.tipo !== 'aviso').reduce((s, e) => s + (MINUTOS_TAREA[e.depto] || 0), 0),
    respuesta: ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length / 1000 : null,
    estrellas: res.length ? res.reduce((a, b) => a + b, 0) / res.length : null, resenas: res.length,
    ganados: evs.filter((e) => e.depto === 'ventas' && e.detalle?.resultado === 'ganado').length, fuera,
    canales: { whatsapp: at.filter((e) => e.detalle?.canal === 'whatsapp').length, web: at.filter((e) => e.detalle?.canal === 'web').length },
  };
}

export function estadisticas(eventos, dias, deptos) {
  const ahora = Date.now(); const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
  const ini = hoy0.getTime() - (dias - 1) * DIA; const iniPrev = ini - dias * DIA;
  const ts = (e) => new Date(e.creado).getTime();
  const act = eventos.filter((e) => util(e) && ts(e) >= ini && ts(e) <= ahora);
  const prev = eventos.filter((e) => util(e) && ts(e) >= iniPrev && ts(e) < ini);
  const serie = Array.from({ length: dias }, (_, i) => ({ fecha: new Date(ini + i * DIA), total: 0, ...Object.fromEntries(deptos.map((d) => [d, 0])) }));
  const calor = Array.from({ length: 7 }, () => Array(24).fill(0)); const temas = {};
  for (const e of act) {
    if (e.tipo === 'aviso') continue;
    const i = Math.floor((ts(e) - ini) / DIA); if (serie[i]) { serie[i].total++; serie[i][e.depto] = (serie[i][e.depto] || 0) + 1; }
    if (e.depto === 'atencion') { const f = new Date(e.creado); calor[(f.getDay() + 6) % 7][f.getHours()]++; if (e.detalle?.tema) temas[e.detalle.tema] = (temas[e.detalle.tema] || 0) + 1; }
  }
  const hoy = resumen(eventos.filter((e) => util(e) && ts(e) >= hoy0.getTime()));
  return { serie, calor, hoy, porDepto: deptos.map((d) => ({ depto: d, n: act.filter((e) => e.depto === d && e.tipo !== 'aviso').length })),
    temas: Object.entries(temas).sort((a, b) => b[1] - a[1]), act: resumen(act), prev: resumen(prev), hayPrev: prev.length > 0 };
}
export const variacion = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);

// Última fila de una fuente de métricas (o null) y la serie de un campo a lo largo de los días.
export const metrica = (o, fuente) => (o.metricas || []).find((m) => m.fuente === fuente)?.datos || null;
export const historico = (o, fuente, campo) => (o.metricas || []).filter((m) => m.fuente === fuente && m.datos?.[campo] != null).sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).map((m) => ({ fecha: m.fecha, valor: m.datos[campo] }));

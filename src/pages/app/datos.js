// Datos del panel: carga real desde Supabase (o un negocio de ejemplo en modo demo) y cálculo de estadísticas.
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DEPARTAMENTOS, DEPTO } from '../../data/oficinaSaas';

const DIA = 864e5;
// Minutos que llevaría a una persona cada tarea (para «horas que te ahorra», siempre marcado como estimación).
export const MINUTOS_TAREA = { atencion: 3, citas: 4, ventas: 6, redes: 20, google: 5, contenido: 90 };

// ---------- negocio de ejemplo ----------
const DEMO_DEPTOS = ['atencion', 'citas', 'ventas', 'redes', 'google'];
export const DEMO_NEG = { id: 'demo', nombre: 'Peluquería Marta', owner_email: 'demo@agutidesigns.io', estado: 'activo', importe_mes: 199,
  sector: 'Peluquería y estética', telefono: '600 000 000', direccion: 'Cornellà de Llobregat', horarios: 'L-V 9:30-20:00 · S 9:00-14:00', precios: '', tono: '', instrucciones: '' };

const TEXTOS = {
  atencion: [['hecho', 'Ha contestado a {n} por {c}: precio de mechas y horario del sábado', 'precios'], ['hecho', 'Ha contestado a {n} por {c}: ¿abrís el lunes?', 'horarios'],
    ['hecho', 'Ha resuelto la duda de {n} por {c} sobre tratamientos de keratina', 'servicios'], ['hecho', 'Ha pasado la dirección y cómo aparcar a {n} por {c}', 'ubicación'],
    ['aviso', '{n} quiere hablar contigo sobre un peinado de novia', 'otros']],
  citas: [['hecho', 'Ha dado cita a {n} el jueves a las 17:00 y le ha mandado la confirmación'], ['hecho', 'Ha enviado los recordatorios de las citas de mañana'],
    ['hecho', 'Ha recolocado una cita cancelada con {n}, que estaba en lista de espera'], ['hecho', 'Ha cambiado la cita de {n} al viernes a las 11:00']],
  ventas: [['hecho', 'Ha contestado la petición de presupuesto de {n} (pack novia)'], ['hecho', 'Ha enviado el seguimiento de los 2 días a {n}'],
    ['hecho', '{n} ha aceptado el presupuesto: queda pendiente de cita'], ['aviso', '{n} pregunta por un descuento: te lo pasa a ti']],
  redes: [['hecho', 'Ha publicado en Instagram: «Color de temporada»'], ['pendiente', 'Post del viernes listo: «Antes y después». Esperando tu aprobación'],
    ['hecho', 'Ha programado 3 publicaciones para la semana que viene']],
  google: [['hecho', 'Ha respondido una reseña de 5 estrellas de {n}'], ['hecho', 'Ha publicado la oferta de diciembre en tu ficha de Google'],
    ['aviso', 'Ha llegado una reseña de 2 estrellas de {n}: te propone una respuesta']],
};
const NOMBRES = ['Laura', 'Jordi', 'Núria', 'Marc', 'Ana', 'Pol', 'Marta', 'Sergi', 'Carla', 'Iván', 'Lucía', 'Àlex', 'Paula', 'David'];

function generarDemo() {
  let s = 1902; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const ahora = Date.now(); const ev = []; let id = 0;
  const porDia = { atencion: 15, citas: 6, ventas: 4, redes: 0.9, google: 1.4 };
  const horaAtencion = () => { const x = r(); return x < 0.42 ? 9 + r() * 5 : x < 0.84 ? 16 + r() * 5 : x < 0.95 ? 21 + r() * 3 : 7 + r() * 2; };
  for (let d = 59; d >= 0; d--) {
    const base = new Date(ahora - d * DIA); base.setHours(0, 0, 0, 0);
    const dow = base.getDay(); const factor = (dow === 0 ? 0.35 : dow === 6 ? 0.8 : 1) * (1 + (59 - d) * 0.006);
    for (const dep of DEMO_DEPTOS) {
      const n = Math.round(porDia[dep] * factor * (0.6 + r() * 0.8));
      for (let k = 0; k < n; k++) {
        const h = dep === 'atencion' ? horaAtencion() : 9 + r() * 11;
        const t = base.getTime() + h * 36e5;
        if (t > ahora) continue;
        const raros = TEXTOS[dep].filter((x) => x[0] !== 'hecho'); const normales = TEXTOS[dep].filter((x) => x[0] === 'hecho');
        const lista = raros.length && r() < (dep === 'redes' ? 0.3 : 0.05) ? raros : normales; const pick = lista[Math.floor(r() * lista.length)];
        const canal = r() < 0.72 ? 'WhatsApp' : 'el chat de la web';
        const detalle = dep === 'atencion' ? { canal: canal === 'WhatsApp' ? 'whatsapp' : 'web', ms: Math.round(3000 + r() * 16000), tema: pick[2] }
          : dep === 'google' && pick[1].includes('reseña') ? { estrellas: pick[0] === 'aviso' ? 2 : r() < 0.85 ? 5 : 4 }
          : dep === 'ventas' ? { resultado: pick[1].includes('aceptado') ? 'ganado' : 'abierto' } : {};
        ev.push({ id: `d${id++}`, depto: dep, tipo: pick[0], creado: new Date(t).toISOString(), texto: pick[1].replace('{n}', NOMBRES[Math.floor(r() * NOMBRES.length)]).replace('{c}', canal), detalle });
      }
    }
  }
  return ev.sort((a, b) => (a.creado < b.creado ? 1 : -1));
}

export function estadoDemo() {
  const eventos = generarDemo();
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const uso = {};
  for (const d of DEMO_DEPTOS) {
    const u = eventos.filter((e) => e.depto === d && new Date(e.creado) >= mes && e.tipo !== 'sistema').length;
    uso[d] = { unidades_mes: u, pct: Math.min(0.95, u / DEPTO[d].cupo.n * 0.9) };
  }
  return { cargando: false, sesion: null, negocio: DEMO_NEG, eventos, uso,
    deptos: DEMO_DEPTOS.map((d) => ({ depto: d, cupo_n: DEPTO[d].cupo.n, activo: true, ajustes: { revisar: d === 'redes' } })),
    conexiones: [{ herramienta: 'whatsapp', estado: 'conectada', cuenta: '+34 600 000 000' }, { herramienta: 'google_business', estado: 'conectada', cuenta: 'Peluquería Marta · Cornellà' },
      { herramienta: 'google_calendar', estado: 'conectada', cuenta: 'agenda@peluqueriamarta.es' }, { herramienta: 'instagram', estado: 'conectada', cuenta: '@peluqueriamarta' }] };
}

// ---------- carga real ----------
export function useOficina(demo) {
  const [estado, setEstado] = useState(() => (demo ? estadoDemo() : { cargando: true, sesion: null, negocio: null, deptos: [], uso: {}, eventos: [], conexiones: [] }));
  useEffect(() => {
    if (demo) return undefined;
    let canal; let vivo = true;
    async function cargar(sesion) {
      if (!sesion) { setEstado((e) => ({ ...e, cargando: false, sesion: null })); return; }
      const { data: negs } = await supabase.from('of_negocios').select('*').order('created_at', { ascending: false }).limit(1);
      const negocio = negs?.[0] || null;
      if (!negocio) { setEstado((e) => ({ ...e, cargando: false, sesion, negocio: null })); return; }
      const desde = new Date(Date.now() - 60 * DIA).toISOString();
      const [{ data: deptos }, { data: uso }, { data: eventos }, { data: conexiones }] = await Promise.all([
        supabase.from('of_departamentos').select('*').eq('negocio_id', negocio.id).eq('activo', true),
        supabase.from('of_uso_mes').select('*').eq('negocio_id', negocio.id),
        supabase.from('of_actividad').select('*').eq('negocio_id', negocio.id).gte('creado', desde).order('creado', { ascending: false }).limit(5000),
        supabase.from('of_conexiones').select('herramienta, estado, cuenta, created_at').eq('negocio_id', negocio.id),
      ]);
      if (!vivo) return;
      const orden = DEPARTAMENTOS.map((d) => d.id);
      setEstado({ cargando: false, sesion, negocio, eventos: eventos || [], conexiones: conexiones || [],
        deptos: (deptos || []).sort((a, b) => orden.indexOf(a.depto) - orden.indexOf(b.depto)),
        uso: Object.fromEntries((uso || []).map((u) => [u.depto, { unidades_mes: u.unidades_mes, pct: u.tokens_mes ? u.tokens_usados / u.tokens_mes : 0 }])) });
      canal = supabase.channel(`actividad-${negocio.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'of_actividad', filter: `negocio_id=eq.${negocio.id}` },
          (p) => setEstado((e) => ({ ...e, eventos: [p.new, ...e.eventos] })))
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
  const por = (d) => evs.filter((e) => e.depto === d);
  const at = por('atencion'); const ms = at.map((e) => e.detalle?.ms).filter(Boolean);
  const res = por('google').map((e) => e.detalle?.estrellas).filter(Boolean);
  const ven = por('ventas');
  const fuera = at.filter((e) => { const f = new Date(e.creado); const h = f.getHours() + f.getMinutes() / 60; return f.getDay() === 0 || h < 9.5 || h >= 20; }).length;
  return {
    total: evs.length,
    conversaciones: at.length, citas: por('citas').length, ventas: ven.length, publicaciones: por('redes').length, google: por('google').length, articulos: por('contenido').length,
    avisos: evs.filter((e) => e.tipo === 'aviso').length,
    minutos: evs.reduce((s, e) => s + (MINUTOS_TAREA[e.depto] || 0), 0),
    respuesta: ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length / 1000 : null,
    estrellas: res.length ? res.reduce((a, b) => a + b, 0) / res.length : null, resenas: res.length,
    ganados: ven.filter((e) => e.detalle?.resultado === 'ganado').length,
    fuera, canales: { whatsapp: at.filter((e) => e.detalle?.canal === 'whatsapp').length, web: at.filter((e) => e.detalle?.canal === 'web').length },
  };
}

export function estadisticas(eventos, dias, deptos) {
  const ahora = Date.now(); const ini = ahora - dias * DIA; const iniPrev = ini - dias * DIA;
  const act = eventos.filter((e) => util(e) && new Date(e.creado).getTime() >= ini);
  const prev = eventos.filter((e) => util(e) && new Date(e.creado).getTime() >= iniPrev && new Date(e.creado).getTime() < ini);
  const serie = Array.from({ length: dias }, (_, i) => {
    const d0 = new Date(ini + (i + 1) * DIA); d0.setHours(0, 0, 0, 0);
    return { fecha: d0, total: 0, ...Object.fromEntries(deptos.map((d) => [d, 0])) };
  });
  const idxDe = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return serie.findIndex((s) => s.fecha.getTime() === d.getTime()); };
  const calor = Array.from({ length: 7 }, () => Array(24).fill(0));
  const temas = {};
  for (const e of act) {
    const i = idxDe(e.creado); if (i >= 0) { serie[i].total++; serie[i][e.depto] = (serie[i][e.depto] || 0) + 1; }
    if (e.depto === 'atencion') { const f = new Date(e.creado); calor[(f.getDay() + 6) % 7][f.getHours()]++; if (e.detalle?.tema) temas[e.detalle.tema] = (temas[e.detalle.tema] || 0) + 1; }
  }
  const porDepto = deptos.map((d) => ({ depto: d, n: act.filter((e) => e.depto === d).length }));
  return { serie, calor, porDepto, temas: Object.entries(temas).sort((a, b) => b[1] - a[1]), act: resumen(act), prev: resumen(prev), hayPrev: prev.length > 0 };
}
export const variacion = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);

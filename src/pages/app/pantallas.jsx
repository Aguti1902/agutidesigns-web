// Pantallas principales del panel (versión pro): Inicio, Te necesitan, Conversaciones, Departamentos y Oficina 3D.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, CalendarCheck, CalendarPlus, Check, ChevronRight, Clapperboard, Clock, Copy, Filter, Handshake, Inbox, MessageCircle,
  Minus, Pause, Play, Plus, Search, Send, Sparkles, Star, UserPlus, UserRound, X, Zap,
} from 'lucide-react';
import { DEPTO, DEPARTAMENTOS, AVISO_CUPO } from '../../data/oficinaSaas';
import { api, pendiente, metrica, MINUTOS_TAREA, cupoDe } from './datos';
import { Ampliar } from './ampliar';
import { supabase } from '../../lib/oficinaSupabase';
import { BarrasDia, Medidor, Sparkline } from './graficos';
import { Avatar, Puntos } from './ui';
import { estadoDe, fmt, hora, hace, duracion, SECCION_DE, tipoDe, TIPOS, uid } from './formato';
import { LogoHerramienta } from './marcas';
import { NuevaCita, NuevoCliente } from './vistas2';
import { HablaConTuOficina } from './llamada';
import { montarOficina } from '../../components/oficina/oficinaPanel';
import { EditorOficina } from './editorOficina';
import { NOMBRES_AG, AGENTE_DE } from './oficinaOpciones';
import '../../components/oficina/OficinasCaso.css';

const fechaHoy = () => { const t = new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); return t[0].toUpperCase() + t.slice(1); };
const saludo = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; };
const eur = (n) => `${fmt(n)} €`;

export function Cabecera({ titulo, sub, acciones, kicker }) {
  return (
    <header className="pc-cab">
      <div><p className="pc-cab__k">{kicker || fechaHoy()}</p><h1>{titulo}</h1>{sub && <p className="pc-cab__s">{sub}</p>}</div>
      {acciones && <div className="pc-cab__a">{acciones}</div>}
    </header>
  );
}

export function Caja({ icono: I, titulo, sub, extra, children, className = '', flush }) {
  return (
    <section className={`pc-caja ${flush ? 'is-flush' : ''} ${className}`}>
      {(titulo || extra) && <header className="pc-caja__h">{I && <I size={18} />}<div><h2>{titulo}</h2>{sub && <p>{sub}</p>}</div>{extra}</header>}
      <div className="pc-caja__b">{children}</div>
    </section>
  );
}

export function Kpi({ t, v, sub, icono: I, oscuro, onClick, serie, color }) {
  const C = onClick ? 'button' : 'div';
  return (
    <C type={onClick ? 'button' : undefined} className={`pc-kpi ${oscuro ? 'is-osc' : ''} ${onClick ? 'is-btn' : ''}`} onClick={onClick}>
      <span className="pc-kpi__t">{t}{I && <i><I size={17} /></i>}</span>
      <b>{v}</b>
      <span className="pc-kpi__s">{sub}</span>
      {serie && <Sparkline datos={serie} color={oscuro ? '#e5fc63' : color || 'var(--acento)'} />}
    </C>
  );
}

async function decidir(o, e, decision, texto) {
  if (!o.demo) await api('tarea', { id: e.id, decision, texto });
  o.setEstado((s) => ({ ...s, eventos: s.eventos.map((x) => (x.id === e.id ? { ...x, resuelto: true, respuesta: decision === 'aprobar' ? 'Aprobado' : decision === 'descartar' ? 'Descartado' : 'Hecho' } : x)) }));
}

function Estrellas({ n }) { return <span className="pc-estr" aria-label={`${n} estrellas`}>{'★★★★★'.slice(0, n)}<i>{'★★★★★'.slice(n)}</i></span>; }

function TarjetaPendiente({ e, o }) {
  const tipo = tipoDe(e); const T = TIPOS[tipo]; const d = e.detalle || {};
  const [texto, setTexto] = useState(d.texto || ''); const [editar, setEditar] = useState(false); const [st, setSt] = useState('');
  const conv = d.conversacion && o.conversaciones.find((c) => c.id === d.conversacion);
  async function hacer(decision) { setSt('…'); try { await decidir(o, e, decision, d.texto !== undefined ? texto : undefined); } catch (err) { setSt(err.message); } }
  const quien = (e.texto.match(/^([A-ZÁÉÍÓÚÑ][\wáéíóúñ.]+)/) || [])[1];
  return (
    <article className={`pn pn--${tipo}`} style={{ '--c': T.c }}>
      <header className="pn__h"><span className="pn__i"><T.I size={16} /></span><b>{DEPTO[e.depto]?.corto}</b><span className="muted">· {hace(e.creado)}</span></header>
      {tipo === 'post' && (
        <div className="pn-post">
          <div className="pn-post__img"><span>{d.idea_imagen || 'Imagen del post'}</span>{d.dia && <em>{d.dia}</em>}</div>
          <div className="pn-post__c">
            <p className="pn-post__u"><LogoHerramienta id={d.red || 'instagram'} size={20} plano /> {o.negocio.nombre}</p>
            {editar ? <textarea rows={5} value={texto} onChange={(x) => setTexto(x.target.value)} aria-label="Texto del post" /> : <p className="pn-post__t">{texto}</p>}
          </div>
        </div>
      )}
      {tipo === 'resena' && (<>
        <p className="pn__t"><Estrellas n={d.estrellas || 3} /> {quien ? `Reseña de ${quien}` : 'Reseña nueva'}</p>
        {d.original && <blockquote className="pn-cita">«{d.original}»</blockquote>}
        <label className="pn-resp"><span>Respuesta propuesta</span><textarea rows={3} value={texto} onChange={(x) => setTexto(x.target.value)} /></label>
      </>)}
      {tipo === 'articulo' && (<>
        <p className="pn__t">{d.titulo}</p>{d.resumen && <p className="muted">{d.resumen}</p>}
        {editar && <textarea rows={10} value={texto} onChange={(x) => setTexto(x.target.value)} aria-label="Texto del artículo" />}
      </>)}
      {tipo === 'seguimiento' && (<>
        <p className="pn__t">{e.texto.split('.')[0]}.</p>
        <div className="pn-burbuja"><textarea rows={3} value={texto} onChange={(x) => setTexto(x.target.value)} aria-label="Mensaje de seguimiento" /></div>
      </>)}
      {tipo === 'video' && <><p className="pn__t">{d.titulo || e.texto}</p><p className="muted">El guion está listo. Elige la voz, escúchala y apruébalo: nosotros lo montamos con tu material.</p></>}
      {(tipo === 'conversacion' || tipo === 'cita' || tipo === 'aviso') && (<>
        <p className="pn__t">{e.texto.replace(/ Último mensaje:.*$/, '')}</p>
        {(conv?.ultimo_texto || /Último mensaje: «(.+)»/.exec(e.texto)?.[1]) && <p className="pn-ultimo"><MessageCircle size={13} /> «{conv?.ultimo_texto || /Último mensaje: «(.+)»/.exec(e.texto)[1]}»</p>}
      </>)}
      <footer className="pn__a">
        {tipo === 'post' && <><button className="btn btn--pri btn--sm" onClick={() => hacer('aprobar')}><Check size={14} /> Aprobar</button><button className="btn btn--sec btn--sm" onClick={() => setEditar(!editar)}>{editar ? 'Listo' : 'Editar'}</button><button className="btn btn--sec btn--sm" onClick={() => navigator.clipboard?.writeText(texto).catch(() => {})}><Copy size={14} /></button><button className="btn btn--fan btn--sm" onClick={() => hacer('descartar')}>Descartar</button></>}
        {tipo === 'resena' && <><button className="btn btn--pri btn--sm" onClick={() => hacer('aprobar')}><Check size={14} /> Publicar respuesta</button><button className="btn btn--fan btn--sm" onClick={() => hacer('descartar')}>La contesto yo</button></>}
        {tipo === 'articulo' && <><button className="btn btn--pri btn--sm" onClick={() => hacer('aprobar')}><Check size={14} /> Aprobar</button><button className="btn btn--sec btn--sm" onClick={() => setEditar(!editar)}>{editar ? 'Cerrar' : 'Leer y editar'}</button><button className="btn btn--fan btn--sm" onClick={() => hacer('descartar')}>Descartar</button></>}
        {tipo === 'seguimiento' && <><button className="btn btn--pri btn--sm" onClick={() => hacer('aprobar')}><Send size={14} /> Enviar</button>{d.conversacion && <button className="btn btn--sec btn--sm" onClick={() => o.ir('conversaciones', d.conversacion)}>Ver conversación</button>}<button className="btn btn--fan btn--sm" onClick={() => hacer('descartar')}>No enviar</button></>}
        {tipo === 'video' && <button className="btn btn--pri btn--sm" onClick={() => o.ir('videos', d.video)}><Clapperboard size={14} /> Ver guion y elegir voz</button>}
        {tipo === 'cita' && <button className="btn btn--pri btn--sm" onClick={() => o.ir('agenda')}><CalendarCheck size={14} /> Ir a la agenda</button>}
        {tipo === 'conversacion' && <button className="btn btn--pri btn--sm" onClick={() => o.ir('conversaciones', d.conversacion)}><MessageCircle size={14} /> Contestar</button>}
        {['cita', 'conversacion', 'aviso'].includes(tipo) && <button className="btn btn--sec btn--sm" onClick={() => hacer('hecho')}><Check size={14} /> Hecho</button>}
        {st && <small className="muted">{st}</small>}
      </footer>
    </article>
  );
}

export function TeNecesitan({ o }) {
  const [f, setF] = useState('todo'); const [st, setSt] = useState('');
  const lista = o.eventos.filter(pendiente);
  const por = {}; for (const e of lista) { const t = tipoDe(e); por[t] = (por[t] || 0) + 1; }
  const ver = lista.filter((e) => f === 'todo' || tipoDe(e) === f);
  const posts = lista.filter((e) => tipoDe(e) === 'post');
  async function todos() { setSt('Aprobando…'); for (const e of posts) await decidir(o, e, 'aprobar').catch(() => {}); setSt(`${posts.length} publicaciones aprobadas.`); }
  return (
    <div className="vista">
      <Cabecera titulo="Te necesitan" sub={lista.length ? `${lista.length} ${lista.length === 1 ? 'cosa espera' : 'cosas esperan'} tu decisión. Lo demás tus agentes ya lo han hecho solos.` : 'Nada pendiente. Tus agentes lo tienen todo bajo control.'}
        acciones={posts.length > 1 && <button className="btn btn--pri" onClick={todos}><Check size={16} /> Aprobar las {posts.length} publicaciones</button>} />
      {st && <p className="toast">{st}</p>}
      {lista.length > 0 && (
        <div className="pn-filtros" role="group" aria-label="Filtrar">
          <button aria-pressed={f === 'todo'} onClick={() => setF('todo')}><Inbox size={15} /> Todo <em>{lista.length}</em></button>
          {Object.entries(TIPOS).filter(([k]) => por[k]).map(([k, T]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)} style={{ '--c': T.c }}><T.I size={15} /> {T.t} <em>{por[k]}</em></button>)}
        </div>
      )}
      {ver.length ? <div className="pn-grid">{ver.slice(0, 60).map((e) => <TarjetaPendiente key={e.id} e={e} o={o} />)}</div>
        : <div className="pc-vacio"><span><Check size={30} strokeWidth={2.4} /></span><h2>Todo al día</h2><p>Cuando tus agentes necesiten algo de ti, aparecerá aquí y te avisaremos por correo.</p></div>}
    </div>
  );
}

// ---------- Inicio ----------
function NecesitaAtencion({ o }) {
  const lista = o.eventos.filter(pendiente); const por = {};
  for (const e of lista) { const t = tipoDe(e); por[t] = (por[t] || 0) + 1; }
  const citas = o.citas.filter((c) => c.estado === 'pendiente').length;
  const filas = Object.entries(TIPOS).filter(([k]) => por[k]).map(([k, T]) => ({ k, T, n: por[k] }));
  if (citas && !por.cita) filas.unshift({ k: 'cita', T: TIPOS.cita, n: citas, agenda: true });
  return (
    <Caja icono={AlertTriangle} titulo="Necesita atención" extra={lista.length > 0 && <button className="enlace" onClick={() => o.ir('bandeja')}>Ver todo</button>} flush>
      {filas.length ? <ul className="pc-aten">{filas.map(({ k, T, n, agenda }) => (
        <li key={k}><button onClick={() => o.ir(agenda ? 'agenda' : 'bandeja')} style={{ '--c': T.c }}>
          <span className="pc-aten__i"><T.I size={17} /></span><div><b>{n} · {T.t.toLowerCase()}</b><small>{T.s}</small></div><ChevronRight size={18} />
        </button></li>
      ))}</ul> : <p className="pc-ok"><Check size={16} /> Nada pendiente. Tus agentes lo tienen todo bajo control.</p>}
    </Caja>
  );
}

function EquipoAhora({ o }) {
  return (
    <Caja icono={Zap} titulo="Tu equipo, ahora" extra={<span className="pc-vivo"><i />En directo</span>} flush>
      <ul className="pc-eq">{o.deptos.map(({ depto }) => {
        const st = estadoDe({ depto, agente: o.agentes[depto], ajustes: o.deptos.find((d) => d.depto === depto)?.ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora });
        return (
          <li key={depto}><button onClick={() => o.ir(SECCION_DE[depto] || 'equipo')} style={{ '--c': DEPTO[depto].color }}>
            <Avatar depto={depto} size={36} vivo={st.clave === 'trabajando'} />
            <div><b>{DEPTO[depto].corto}</b><small className={`is-${st.clave}`}>{st.clave === 'trabajando' ? <>{st.tarea}<Puntos /></> : st.tarea}</small></div>
            <span className={`pc-st is-${st.clave}`}>{st.txt}</span>
          </button></li>
        );
      })}</ul>
    </Caja>
  );
}

function Embudo({ o }) {
  const et = [['nuevo', 'Nuevos', '#9aa0b4'], ['contactado', 'Hablando', '#6b7cff'], ['presupuesto', 'Presupuesto enviado', '#d98a3a'], ['ganado', 'Ganados', '#14995a'], ['perdido', 'Perdidos', '#d92d20']];
  const mx = Math.max(1, ...et.map(([k]) => o.leads.filter((l) => l.etapa === k).length));
  return (
    <Caja icono={Filter} titulo="Embudo de clientes" extra={<button className="enlace" onClick={() => o.ir('clientes')}>Tablero</button>}>
      <ul className="pc-emb">{et.map(([k, t, c]) => { const n = o.leads.filter((l) => l.etapa === k).length; return <li key={k}><span><i style={{ background: c }} />{t}<b>{n}</b></span><Medidor valor={n} max={mx} color={c} /></li>; })}</ul>
    </Caja>
  );
}

function Actividad({ o, n = 7 }) {
  return (
    <Caja icono={Zap} titulo="Actividad reciente" extra={<button className="enlace" onClick={() => o.ir('actividad')}>Todo</button>} flush>
      <ol className="pc-act">{o.eventos.filter((e) => e.tipo !== 'sistema').slice(0, n).map((e) => (
        <li key={e.id} style={{ '--c': DEPTO[e.depto]?.color }}><i /><div><p>{e.texto}</p><small>{DEPTO[e.depto]?.nombre} · {hace(e.creado)}</small></div></li>
      ))}</ol>
    </Caja>
  );
}

export function Inicio({ o, extras }) {
  const tiene = (d) => o.deptos.some((x) => x.depto === d);
  const h = o.est.hoy; const pend = o.eventos.filter(pendiente).length;
  const semana = o.ahora + 7 * 864e5;
  const citasSemana = o.citas.filter((c) => c.estado === 'confirmada' && c.fecha && new Date(c.fecha) >= o.ahora - 864e5 && new Date(c.fecha) < semana).length;
  const res = o.eventos.map((e) => (e.depto === 'google' ? e.detalle?.estrellas : null)).filter(Boolean);
  const web = metrica(o, 'web'); const ig = metrica(o, 'instagram');
  const visitas7 = web?.serie?.slice(-7).reduce((a, x) => a + x.usuarios, 0);
  const serie14 = o.est.serie.slice(-14);
  const kpis = [
    <Kpi key="hoy" oscuro t="Hoy" v={fmt(h.total)} sub={h.total ? `tareas hechas · ${duracion(h.minutos)} ahorradas` : 'Aún sin tareas hoy'} icono={Zap} serie={serie14.map((s) => s.total)} />,
    <Kpi key="pend" t="Tu decisión" v={fmt(pend)} sub={pend ? 'Lo demás se hace solo' : 'Nada pendiente'} icono={Inbox} onClick={() => o.ir('bandeja')} />,
    tiene('atencion') && <Kpi key="at" t="Clientes atendidos" v={fmt(o.est.act.conversaciones)} sub={`últimos ${o.est.serie.length} días`} icono={MessageCircle} onClick={() => o.ir('conversaciones')} serie={serie14.map((s) => s.atencion || 0)} color={DEPTO.atencion.color} />,
    tiene('citas') && <Kpi key="ci" t="Citas esta semana" v={fmt(citasSemana)} sub={`${o.citas.filter((c) => c.estado === 'pendiente').length} por confirmar`} icono={CalendarCheck} onClick={() => o.ir('agenda')} />,
    tiene('google') && <Kpi key="go" t="Valoración Google" v={res.length ? `${fmt(res.reduce((a, b) => a + b, 0) / res.length, 1)}★` : '—'} sub={`${fmt(res.length)} reseñas respondidas`} icono={Star} onClick={() => o.ir('resenas')} />,
    web ? <Kpi key="web" t="Visitas web" v={fmt(visitas7)} sub="últimos 7 días" icono={Search} onClick={() => o.ir('analitica', null, 'web')} serie={web.serie.slice(-14).map((x) => x.usuarios)} />
      : ig?.seguidores != null ? <Kpi key="ig" t="Seguidores Instagram" v={fmt(ig.seguidores)} sub={`@${ig.usuario || ''}`} icono={Sparkles} onClick={() => o.ir('analitica', null, 'redes')} /> : null,
    tiene('ventas') && <Kpi key="ve" t="En juego" v={eur(o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)).reduce((a, l) => a + Number(l.importe || 0), 0))} sub="en presupuestos abiertos" icono={Handshake} onClick={() => o.ir('clientes')} />,
  ].filter(Boolean).slice(0, 6);
  return (
    <div className="vista">
      <Cabecera titulo={`${saludo()}, ${o.negocio.nombre}`} acciones={<>
        <button className="btn btn--sec" onClick={() => o.ir('chat')}><MessageCircle size={16} /> Hablar con tu equipo</button>
        {tiene('citas') && <button className="btn btn--sec" onClick={() => o.ir('agenda')}><CalendarCheck size={16} /> Agenda de hoy</button>}
        <button className="btn btn--osc" onClick={() => o.ir('bandeja')}><Inbox size={16} /> Te necesitan{pend ? ` · ${pend}` : ''}</button>
      </>} />
      {extras}
      <div className="pc-kpis">{kpis}</div>
      <HablaConTuOficina o={o} />
      <div className="pc-grid">
        <div className="pc-col">
          <NecesitaAtencion o={o} />
          <Caja icono={Zap} titulo="Trabajo de los últimos 14 días" sub="Tareas hechas por tus agentes cada día">
            <BarrasDia serie={serie14} deptos={o.deptos.map((d) => d.depto)} alto={180} />
          </Caja>
          <Caja titulo="Tu oficina en directo" sub="Tus agentes trabajando, hablando entre ellos y tomándose su café" extra={<button className="enlace" onClick={() => o.ir('oficina')}>Pantalla completa</button>} flush className="pc-3d">
            <OficinaViva o={o} alto={420} />
          </Caja>
        </div>
        <div className="pc-col">
          <EquipoAhora o={o} />
          {tiene('ventas') && o.leads.length > 0 && <Embudo o={o} />}
          <Actividad o={o} />
        </div>
      </div>
    </div>
  );
}

// ---------- Oficina 3D con la estética de la landing ----------
const ZONAS = { ventas: ['atencion', 'citas'], marketing: ['redes', 'contenido'], clientes: ['ventas'], finanzas: ['google'] };
export function OficinaViva({ o, alto = 520, config }) {
  const ref = useRef(null); const ctl = useRef(null);
  const cfg = config || o.negocio.oficina || {}; const cfgKey = JSON.stringify(cfg); const [logoUrl, setLogoUrl] = useState(null); // mapa ruta → enlace
  // Las imágenes del cliente están en su carpeta privada: se piden enlaces temporales.
  const rutas = [cfg.logo_ruta, ...(cfg.fotos || []).map((f) => f?.ruta)].filter(Boolean).join('|');
  useEffect(() => {
    if (!rutas || o.demo) return;
    const lista = rutas.split('|');
    supabase.storage.from('oficina-material').createSignedUrls(lista, 3600).then(({ data }) => setLogoUrl(Object.fromEntries((data || []).map((x, i) => [lista[i], x.signedUrl]))));
  }, [rutas, o.demo]);
  const url = (x) => x?.data || (x?.ruta && logoUrl?.[x.ruta]) || null;
  const mis = o.deptos.map((d) => d.depto).join(',');
  const charla = useMemo(() => {
    const ev = o.eventos.filter((e) => e.tipo === 'hecho').slice(0, 12);
    const quien = AGENTE_DE;
    return ev.length ? ev.map((e) => [quien[e.depto] || 'pipeline', 'ceo', e.texto.replace(/^Ha /, 'He ').slice(0, 70)]) : null;
  }, [o.eventos]);
  useEffect(() => {
    const host = ref.current; if (!host) return undefined;
    const lista = mis.split(',').filter(Boolean);
    const nombreZona = (z) => { const ds = (ZONAS[z] || []).filter((d) => lista.includes(d)); return ds.length ? ds.map((d) => DEPTO[d].corto).join(' · ') : null; };
    // Rótulo de la pared con el nombre del negocio (si no hay logo propio).
    const logoPropio = url({ data: cfg.logo_data, ruta: cfg.logo_ruta });
    const c = document.createElement('canvas'); c.width = 1024; c.height = 282; const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; let tam = 150; g.font = `800 ${tam}px Outfit, Archivo, Inter, Arial`;
    while (g.measureText(o.negocio.nombre).width > 1000 && tam > 50) { tam -= 8; g.font = `800 ${tam}px Outfit, Archivo, Inter, Arial`; }
    g.fillText(o.negocio.nombre, 8, 141);
    const marca = {
      placa: (cfg.placa || o.negocio.nombre).toUpperCase().slice(0, 18), ceo: 'Tú', lema: (cfg.lema || o.negocio.sector || 'TU OFICINA DE IA').toUpperCase().slice(0, 34),
      ...(logoPropio ? { logo: logoPropio, logoColor: cfg.logo_color === 'acento' ? (cfg.colores?.acento || '#0047ff') : (cfg.logo_color || 'original') } : { logo: c.toDataURL('image/png') }),
      logoTam: cfg.logo_tam || (logoPropio ? 'M' : undefined), logoPared: cfg.logo_pared !== false, logoSuelo: !!cfg.logo_suelo, logoRecepcion: !!cfg.logo_recepcion,
      colores: cfg.colores || {}, muebles: { ...(cfg.muebles || {}), ...(cfg.logo_recepcion ? { recepcion: true } : {}) }, estructura: cfg.estructura || {}, luz: cfg.luz, brillo: cfg.brillo,
      ...(cfg.colores?.acento ? { acentoCss: cfg.colores.detalle || '#e5fc63' } : {}),
      neon: cfg.neon || '', neonColor: cfg.neon_color, fotos: (cfg.fotos || []).map(url),
      pantalla: cfg.pantalla || `${o.negocio.nombre.toUpperCase().slice(0, 16)} · EN DIRECTO`, pizarra: [cfg.pizarra || 'Hoy en la oficina', `${o.est?.hoy?.total || 0} tareas hechas`],
      nombres: { ...NOMBRES_AG, ...Object.fromEntries(Object.entries(cfg.nombres || {}).filter(([, v]) => v)) },
      deptos: { direccion: 'Dirección', ventas: nombreZona('ventas') || 'Atención', marketing: nombreZona('marketing') || 'Marketing', clientes: nombreZona('clientes') || 'Ventas', finanzas: nombreZona('finanzas') || 'Reseñas' },
      ...(charla ? { charla } : {}),
    };
    let off = null;
    try { off = montarOficina(host, { marca, interactivo: true, quieto: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches }); } catch { off = null; }
    ctl.current = off;
    return () => off?.();
  }, [mis, o.negocio.nombre, o.negocio.sector, charla, cfgKey, logoUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="oc-lienzo pc-oficina" ref={ref} style={{ height: alto }}>
      <div className="oc-hud">
        <span className="oc-pill"><i style={{ background: '#e5fc63' }} />{o.negocio.nombre} · {o.deptos.length} departamentos</span>
        <span className="oc-ctl"><button type="button" aria-label="Acercar" onClick={() => ctl.current?.zoom?.(-1)}><Plus size={16} /></button><button type="button" aria-label="Alejar" onClick={() => ctl.current?.zoom?.(1)}><Minus size={16} /></button></span>
      </div>
      <p className="oc-pista">Arrastra para girar · lo que se dicen es el trabajo real de hoy</p>
    </div>
  );
}

export function Oficina({ o }) {
  const [editar, setEditar] = useState(false); const [cfg, setCfg] = useState(o.negocio.oficina || {});
  const [vista, setVista] = useState(cfg);
  useEffect(() => { const t = setTimeout(() => setVista(cfg), 350); return () => clearTimeout(t); }, [cfg]);
  return (
    <div className="vista">
      <Cabecera titulo="Tu oficina en 3D" sub="Cada mesa es un agente. Lo que se cuentan entre ellos es lo que han hecho de verdad hoy en tu negocio."
        acciones={<button className="btn btn--osc" onClick={() => setEditar(!editar)}><Sparkles size={16} /> {editar ? 'Cerrar el editor' : 'Personalizar mi oficina'}</button>} />
      <div className={`ed-w ${editar ? 'is-ed' : ''}`}>
        <OficinaViva o={o} alto="min(72vh, 760px)" config={vista} />
        {editar && <EditorOficina o={o} cfg={cfg} setCfg={setCfg} cerrar={() => setEditar(false)} />}
      </div>
      <div className="pc-leyenda">{o.deptos.map(({ depto }) => <span key={depto} style={{ '--c': DEPTO[depto].color }}><i />{DEPTO[depto].nombre}</span>)}</div>
    </div>
  );
}

// ---------- Departamentos: cada uno con su trabajo y sus números ----------
export function Departamentos({ o }) {
  const mis = o.deptos.map((d) => d.depto);
  const desde30 = o.ahora - 30 * 864e5;
  return (
    <div className="vista">
      <Cabecera titulo="Tus departamentos" sub="Qué está haciendo cada uno ahora, lo que ha hecho y cómo rinde." />
      <div className="dp-grid">
        {mis.map((depto) => {
          const info = DEPTO[depto]; const dep = o.deptos.find((d) => d.depto === depto);
          const st = estadoDe({ depto, agente: o.agentes[depto], ajustes: dep?.ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora });
          const hechos = o.eventos.filter((e) => e.depto === depto && e.tipo === 'hecho');
          const mes = hechos.filter((e) => new Date(e.creado).getTime() >= desde30).length;
          const hoyN = o.est.hoy[{ atencion: 'conversaciones', citas: 'citas', ventas: 'ventas', redes: 'publicaciones', google: 'google', contenido: 'articulos' }[depto]] || 0;
          const pend = o.eventos.filter((e) => e.depto === depto && pendiente(e)).length;
          const cu = cupoDe(o, depto); const pct = Math.min(1, cu.pct);
          return (
            <article key={depto} className="dp" style={{ '--c': info.color }}>
              <header className="dp__h">
                <Avatar depto={depto} size={48} vivo={st.clave === 'trabajando'} />
                <div><h2>{info.nombre}</h2><span className={`pc-st is-${st.clave}`}>{st.txt}</span></div>
                <button className="ico" aria-label={`Abrir ${info.nombre}`} onClick={() => o.ir(SECCION_DE[depto] || 'inicio')}><ArrowRight size={18} /></button>
              </header>
              <p className="dp__ahora">{st.clave === 'trabajando' ? <><b>Ahora:</b> {st.tarea}<Puntos /></> : st.tarea}</p>
              <dl className="dp__k">
                <div><dt>Hoy</dt><dd>{fmt(hoyN)}</dd></div><div><dt>30 días</dt><dd>{fmt(mes)}</dd></div>
                <div><dt>Ahorrado</dt><dd>{duracion(mes * (MINUTOS_TAREA[depto] || 0))}</dd></div><div><dt>Para ti</dt><dd className={pend ? 'is-aviso' : ''}>{fmt(pend)}</dd></div>
              </dl>
              <div className="dp__g"><Sparkline datos={o.est.serie.map((s) => s[depto] || 0)} color={info.color} alto={44} /></div>
              <div className="dp__cupo"><span>Cupo del mes · {fmt(cu.usado)} de {fmt(cu.total)} {info.cupo.unidad}{pct >= AVISO_CUPO && <Ampliar o={o} depto={depto} sm texto="Ampliar" />}</span><Medidor valor={pct} color={pct >= AVISO_CUPO ? 'var(--aviso)' : info.color} /></div>
              <ol className="dp__ult">{hechos.slice(0, 3).map((e) => <li key={e.id}><Clock size={12} />{e.texto}<small>{hace(e.creado)}</small></li>)}{!hechos.length && <li className="muted">Todavía sin trabajo.</li>}</ol>
            </article>
          );
        })}
        {DEPARTAMENTOS.filter((d) => !mis.includes(d.id)).map((d) => (
          <button key={d.id} className="dp dp--mas" onClick={() => o.ir(`mejora-${d.id}`)} style={{ '--c': d.color }}>
            <Avatar depto={d.id} size={44} /><h2>{d.nombre}</h2><p>{d.que}</p><span className="enlace"><Plus size={15} /> Añadir a mi oficina</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Conversaciones (3 columnas: lista, chat y ficha del cliente) ----------
const RAPIDAS = ['¡Gracias! Te esperamos 😊', 'Ahora mismo te lo confirmo.', '¿Qué día y hora te va mejor?', 'Te llamo en un momento.'];
const nombreDe = (c) => c.nombre || (c.canal === 'web' ? 'Visitante web' : `+${c.contacto}`);
export function Conversaciones({ o, abrir }) {
  const [sel, setSel] = useState(abrir || o.conversaciones[0]?.id || null);
  const [filtro, setFiltro] = useState('todas'); const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState([]); const [texto, setTexto] = useState(''); const [st, setSt] = useState(''); const [modal, setModal] = useState(null);
  const fin = useRef(null);
  const lista = o.conversaciones.filter((c) => !c.contacto?.startsWith('prueba'))
    .filter((c) => ({ todas: true, necesitan: !!c.necesita, sinleer: !c.leido, whatsapp: c.canal === 'whatsapp', web: c.canal === 'web' }[filtro]))
    .filter((c) => !q || `${c.nombre || ''} ${c.contacto} ${c.ultimo_texto || ''}`.toLowerCase().includes(q.toLowerCase()));
  const conv = o.conversaciones.find((c) => c.id === sel);
  useEffect(() => {
    if (!conv) return;
    if (o.demo) { setMsgs(conv.mensajes || []); return; } // eslint-disable-line react-hooks/set-state-in-effect
    supabase.from('of_mensajes').select('*').eq('conversacion_id', conv.id).order('creado').limit(300).then(({ data }) => setMsgs(data || []));
    if (!conv.leido) api('conversacion', { id: conv.id, leido: true }).catch(() => {});
  }, [conv?.id, o.demo]); // eslint-disable-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const m = o.ultimoMensaje; if (m && m.conversacion_id === sel) setMsgs((x) => (x.some((y) => y.id === m.id) ? x : [...x, m])); }, [o.ultimoMensaje, sel]);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, sel]);
  async function enviar(e, t0) {
    e?.preventDefault(); const t = (t0 ?? texto).trim(); if (!t) return; setTexto(''); setSt('');
    const nuevo = { id: uid('l'), de: 'humano', texto: t, creado: new Date().toISOString() };
    try {
      if (!o.demo) await api('responder', { conversacion: conv.id, texto: t });
      setMsgs((x) => [...x, nuevo]);
      o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado: 'humano', necesita: null, ultimo_texto: t } : c)) }));
    } catch (err) { setSt(err.message); setTexto(t); }
  }
  async function cambiar(estado) {
    if (!o.demo) await api('conversacion', { id: conv.id, estado }).catch(() => {});
    o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado, necesita: null } : c)) }));
  }
  if (!o.conversaciones.length) {
    return <div className="vista"><Cabecera titulo="Conversaciones" /><div className="pc-vacio"><span><MessageCircle size={30} /></span><h2>Aún no hay conversaciones</h2><p>Cuando un cliente escriba por WhatsApp o por el chat de tu web, lo verás aquí en directo y podrás contestar tú cuando quieras.</p><button className="btn btn--pri" onClick={() => o.ir('conexiones')}>Conectar WhatsApp o el chat</button></div></div>;
  }
  const cita = conv && o.citas.find((c) => c.conversacion_id === conv.id);
  const lead = conv && o.leads.find((l) => l.conversacion_id === conv.id);
  const ultimo = (c) => c.ultimo_texto || c.mensajes?.[c.mensajes.length - 1]?.texto || '';
  return (
    <div className="vista">
      <Cabecera titulo="Conversaciones" sub={`${o.conversaciones.filter((c) => c.necesita).length} te necesitan · ${o.conversaciones.filter((c) => !c.leido).length} sin leer`} />
      <div className={`cv ${sel ? 'con-sel' : ''}`}>
        <aside className="cv-l">
          <label className="cv-buscar"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, teléfono o mensaje" /></label>
          <div className="cv-f">{[['todas', 'Todas'], ['necesitan', 'Te necesitan'], ['sinleer', 'Sin leer'], ['whatsapp', 'WhatsApp'], ['web', 'Web']].map(([k, t]) => <button key={k} aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{t}</button>)}</div>
          <ul>{lista.map((c) => (
            <li key={c.id}><button className={`cv-i ${c.id === sel ? 'is-on' : ''} ${!c.leido ? 'is-nuevo' : ''}`} onClick={() => setSel(c.id)}>
              <span className="cv-av">{nombreDe(c).slice(0, 1).toUpperCase()}<LogoHerramienta id={c.canal === 'whatsapp' ? 'whatsapp' : 'web_chat'} size={16} /></span>
              <div><span className="cv-i__t"><b>{nombreDe(c)}</b><small>{hace(c.ultimo)}</small></span><span className="cv-i__m">{ultimo(c) || (c.canal === 'whatsapp' ? 'WhatsApp' : 'Chat de la web')}</span>
                {c.necesita ? <span className="chip chip--mal">Te necesita</span> : c.estado === 'humano' ? <span className="chip">La llevas tú</span> : null}</div>
            </button></li>
          ))}{!lista.length && <p className="muted pad">Nada con ese filtro.</p>}</ul>
        </aside>
        {conv ? (
          <section className="cv-c">
            <header className="cv-c__h"><button className="ico cv-atras" onClick={() => setSel(null)} aria-label="Volver"><ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /></button>
              <span className="cv-av cv-av--g">{nombreDe(conv).slice(0, 1).toUpperCase()}</span>
              <div><b>{nombreDe(conv)}</b><small><LogoHerramienta id={conv.canal === 'whatsapp' ? 'whatsapp' : 'web_chat'} size={14} plano /> {conv.canal === 'whatsapp' ? `WhatsApp · +${conv.contacto}` : 'Chat de tu web'}</small></div>
              {conv.estado === 'humano' ? <button className="btn btn--sec btn--sm" onClick={() => cambiar('agente')}><Play size={14} /> Devolver al agente</button> : <button className="btn btn--sec btn--sm" onClick={() => cambiar('humano')}><Pause size={14} /> Llevarla yo</button>}
            </header>
            <p className={`cv-banda ${conv.estado === 'humano' ? 'is-tu' : ''}`}>{conv.estado === 'humano' ? <><UserRound size={14} /> La llevas tú: tu agente no contestará hasta que se la devuelvas.</> : <><Avatar depto="atencion" size={18} /> La lleva tu agente de Atención. Si escribes, pasas a llevarla tú.</>}</p>
            <div className="cv-m">
              {msgs.map((m, i) => { const sep = !i || new Date(m.creado).toDateString() !== new Date(msgs[i - 1].creado).toDateString(); return (
                <div key={m.id} className="cv-mw">{sep && <p className="cv-dia"><span>{new Date(m.creado).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span></p>}
                  <div className={`cv-b cv-b--${m.de}`}>{m.de === 'agente' && <span className="cv-b__q">Agente de Atención</span>}{m.de === 'humano' && <span className="cv-b__q">Tú</span>}<p>{m.texto}</p><time>{hora(m.creado)}</time></div></div>
              ); })}
              <div ref={fin} />
            </div>
            <div className="cv-rap">{RAPIDAS.map((r) => <button key={r} onClick={() => enviar(null, r)}>{r}</button>)}</div>
            <form className="cv-in" onSubmit={enviar}><input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu respuesta…" aria-label="Tu respuesta" /><button className="btn btn--pri" aria-label="Enviar"><Send size={16} /></button></form>
            {st && <p className="error pad">{st}</p>}
          </section>
        ) : <section className="cv-c cv-c--vacio"><MessageCircle size={28} /><p>Elige una conversación</p></section>}
        {conv && (
          <aside className="cv-p">
            <div className="cv-p__top"><span className="cv-av cv-av--xl">{nombreDe(conv).slice(0, 1).toUpperCase()}</span><b>{nombreDe(conv)}</b>
              <small>{conv.canal === 'whatsapp' ? `+${conv.contacto}` : 'Visitante de tu web'}</small>
              <div className="cv-p__tags">{conv.tema && conv.tema !== 'otros' && <span className="chip">{conv.tema}</span>}{conv.necesita && <span className="chip chip--mal">Quiere: {conv.necesita}</span>}</div></div>
            <dl className="cv-p__d"><div><dt>Canal</dt><dd><LogoHerramienta id={conv.canal === 'whatsapp' ? 'whatsapp' : 'web_chat'} size={16} plano /> {conv.canal === 'whatsapp' ? 'WhatsApp' : 'Chat web'}</dd></div>
              <div><dt>Último mensaje</dt><dd>{hace(conv.ultimo)}</dd></div><div><dt>Mensajes</dt><dd>{msgs.length}</dd></div><div><dt>La lleva</dt><dd>{conv.estado === 'humano' ? 'Tú' : conv.estado === 'cerrada' ? 'Cerrada' : 'Tu agente'}</dd></div></dl>
            {cita ? <div className="cv-p__card" style={{ '--c': DEPTO.citas.color }}><CalendarCheck size={16} /><div><b>Cita {cita.estado === 'pendiente' ? 'por confirmar' : cita.estado}</b><small>{cita.servicio || 'Cita'} · {cita.fecha ? new Date(cita.fecha).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : cita.cuando_texto}</small></div><button className="ico" onClick={() => o.ir('agenda')} aria-label="Ir a la agenda"><ChevronRight size={16} /></button></div>
              : o.deptos.some((d) => d.depto === 'citas') && <button className="btn btn--sec btn--sm" onClick={() => setModal('cita')}><CalendarPlus size={14} /> Apuntar una cita</button>}
            {lead ? <div className="cv-p__card" style={{ '--c': DEPTO.ventas.color }}><Handshake size={16} /><div><b>Cliente potencial</b><small>{lead.interes}{lead.importe ? ` · ${eur(lead.importe)}` : ''}</small></div><button className="ico" onClick={() => o.ir('clientes')} aria-label="Ir a clientes"><ChevronRight size={16} /></button></div>
              : o.deptos.some((d) => d.depto === 'ventas') && <button className="btn btn--sec btn--sm" onClick={() => setModal('lead')}><UserPlus size={14} /> Añadir a clientes potenciales</button>}
            <button className="btn btn--fan btn--sm" onClick={() => cambiar('cerrada')}><X size={14} /> Cerrar conversación</button>
          </aside>
        )}
      </div>
      {modal === 'cita' && <NuevaCita o={o} cerrar={() => setModal(null)} />}
      {modal === 'lead' && <NuevoCliente o={o} cerrar={() => setModal(null)} />}
    </div>
  );
}

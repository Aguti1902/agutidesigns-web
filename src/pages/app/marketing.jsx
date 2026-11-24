// Secciones de marketing y análisis: chat con tu equipo, analítica (web y redes), vídeos, tu material,
// SEO y competencia, e informes por correo. Todo se alimenta solo en cuanto se conectan las cuentas.
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, BarChart3, Check, Clapperboard, CloudUpload, ExternalLink, FileText, FolderOpen, Globe, Image as ImageIcon, Mail, MessageCircle, Mic,
  Plus, Search, Send, Sparkles, Star, Trash2, TrendingUp, Users, Video, Volume2, X,
} from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { DEPTO } from '../../data/oficinaSaas';
import { ajustesDe } from '../../data/oficinaAjustes';
import { api, metrica, historico, guardarAjustes } from './datos';
import { Linea, Medidor } from './graficos';
import { Avatar, Puntos } from './ui';
import { fmt, hace, hora, uid } from './formato';
import { LogoHerramienta } from './marcas';
import { Cabecera, Caja, Kpi } from './pantallas';
import { Estadisticas } from './vistas';

const conectada = (o, id) => o.conexiones.some((c) => c.herramienta === id && c.estado === 'conectada');
function Conectar({ o, ids, titulo, texto }) {
  return (
    <div className="mk-con">
      <div className="mk-con__logos">{ids.map((id) => <LogoHerramienta key={id} id={id} size={46} />)}</div>
      <h2>{titulo}</h2><p>{texto}</p>
      <button className="btn btn--pri" onClick={() => o.ir('conexiones')}>Conectar <ArrowRight size={15} /></button>
      <small className="muted">Un clic, entras con tu cuenta y listo. Solo lectura.</small>
    </div>
  );
}
const suma = (arr, k) => (arr || []).reduce((a, x) => a + (x[k] || 0), 0);

// ---------- Chat con tu equipo ----------
const SUGERENCIAS = ['¿Qué habéis hecho hoy?', '¿Qué citas tengo mañana?', '¿Cómo van las reseñas?', 'Hazme un post sobre la oferta de esta semana', 'Prepárame un vídeo sobre nuestro servicio estrella'];
function respuestaDemo(o, t) {
  const x = t.toLowerCase();
  if (x.includes('cita')) { const c = o.citas.filter((k) => k.estado !== 'cancelada' && k.fecha && new Date(k.fecha) > Date.now()); return `Tienes ${c.length} citas próximas: ${c.slice(0, 3).map((k) => `${k.nombre} (${k.servicio}, ${new Date(k.fecha).toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' })})`).join(', ')}. ${o.citas.filter((k) => k.estado === 'pendiente').length} esperan que las confirmes.`; }
  if (x.includes('reseña')) return 'Este mes hemos respondido todas las reseñas de 4 y 5 ★ y te hemos dejado una de 3 ★ para que revises la respuesta. Tu nota media sigue en 4,8 ★.';
  if (x.includes('post') || x.includes('vídeo') || x.includes('video')) return '¡Hecho! Nos ponemos con ello y en unos minutos lo tienes en «Te necesitan» para revisarlo. (En la demo no se crea de verdad.)';
  return `Hoy llevamos ${o.est.hoy.total} tareas: ${o.est.hoy.conversaciones} clientes atendidos, ${o.est.hoy.citas} gestiones de citas y ${o.est.hoy.google} reseñas. Tienes ${o.eventos.filter((e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto).length} cosas esperándote.`;
}
export function ChatEquipo({ o }) {
  const [t, setT] = useState(''); const [esc, setEsc] = useState(false); const [err, setErr] = useState(''); const fin = useRef(null);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [o.chat.length, esc]);
  async function enviar(e, x0) {
    e?.preventDefault(); const x = (x0 ?? t).trim(); if (!x || esc) return; setT(''); setErr(''); setEsc(true);
    const yo = { id: uid('t'), de: 'tu', texto: x, creado: new Date().toISOString() };
    o.setEstado((s) => ({ ...s, chat: [...s.chat, yo] }));
    try {
      const r = o.demo ? (await new Promise((ok) => setTimeout(ok, 1100)), { respuesta: respuestaDemo(o, x) }) : await api('equipo', { texto: x });
      o.setEstado((s) => ({ ...s, chat: [...s.chat, { id: uid('e'), de: 'equipo', texto: r.respuesta, detalle: r.accion ? { accion: r.accion } : {}, creado: new Date().toISOString() }] }));
    } catch (er) { setErr(er.message); }
    setEsc(false);
  }
  return (
    <div className="vista">
      <Cabecera titulo="Chat con tu equipo" sub="Pregúntales lo que quieras o encárgales trabajo. Contestan con los datos reales de tu oficina." />
      <section className="cq">
        <header className="cq__h"><div className="cq__avs">{o.deptos.map(({ depto }) => <Avatar key={depto} depto={depto} size={32} />)}</div><div><b>Tu equipo</b><small><i />{o.deptos.length} agentes conectados</small></div></header>
        <div className="cq__m">
          {!o.chat.length && <div className="cq__hola"><Sparkles size={26} /><h2>¿En qué te ayudamos?</h2><p>Puedes preguntar cómo va todo o pedir un post, un artículo o un vídeo.</p></div>}
          {o.chat.map((m) => (
            <div key={m.id} className={`cq-b cq-b--${m.de}`}>
              {m.de === 'equipo' && <span className="cq-b__av"><Sparkles size={14} /></span>}
              <div><p>{m.texto}</p>{m.detalle?.accion && <span className="cq-b__acc"><Check size={13} /> Encargo en marcha: {m.detalle.accion.tipo} sobre «{m.detalle.accion.tema}»</span>}<time>{hora(m.creado)}</time></div>
            </div>
          ))}
          {esc && <div className="cq-b cq-b--equipo"><span className="cq-b__av"><Sparkles size={14} /></span><div><p><Puntos /></p></div></div>}
          <div ref={fin} />
        </div>
        <div className="cq__sug">{SUGERENCIAS.map((s) => <button key={s} onClick={() => enviar(null, s)}>{s}</button>)}</div>
        <form className="cq__in" onSubmit={enviar}><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Escribe a tu equipo…" aria-label="Mensaje" /><button className="btn btn--pri" disabled={esc} aria-label="Enviar"><Send size={16} /></button></form>
        {err && <p className="error pad">{err}</p>}
      </section>
    </div>
  );
}

// ---------- Analítica ----------
function AnaliticaWeb({ o }) {
  const w = metrica(o, 'web');
  if (!w) return <Conectar o={o} ids={['google_analytics']} titulo="Conecta Google Analytics" texto="Verás cuánta gente entra en tu web, de dónde viene y qué páginas mira. Se actualiza solo cada día." />;
  const tot = { usuarios: suma(w.serie, 'usuarios'), sesiones: suma(w.serie, 'sesiones'), vistas: suma(w.serie, 'vistas') };
  const totC = suma(w.canales, 'sesiones') || 1; const mxP = Math.max(1, ...(w.paginas || []).map((p) => p.vistas));
  const NOM = { 'Organic Search': 'Google (búsquedas)', Direct: 'Directo', 'Organic Social': 'Redes sociales', Referral: 'Otras webs', 'Paid Search': 'Anuncios Google', Email: 'Correo', Unassigned: 'Sin clasificar', 'Organic Maps': 'Google Maps' };
  return (<>
    <div className="pc-kpis pc-kpis--4">
      <Kpi oscuro t="Visitantes" v={fmt(tot.usuarios)} sub="últimos 28 días" icono={Users} serie={w.serie.map((x) => x.usuarios)} />
      <Kpi t="Visitas" v={fmt(tot.sesiones)} sub="sesiones" icono={Globe} />
      <Kpi t="Páginas vistas" v={fmt(tot.vistas)} sub={`${fmt(tot.vistas / Math.max(1, tot.sesiones), 1)} por visita`} icono={FileText} />
      <Kpi t="Desde Google" v={`${Math.round(((w.canales.find((c) => c.canal === 'Organic Search')?.sesiones || 0) / totC) * 100)} %`} sub="de tus visitas" icono={Search} />
    </div>
    <Caja icono={TrendingUp} titulo="Visitantes por día"><Linea datos={w.serie.map((x) => ({ fecha: x.fecha, valor: x.usuarios }))} /></Caja>
    <div className="fila fila--1-1">
      <Caja icono={Globe} titulo="De dónde vienen"><div className="barras-h">{w.canales.map((c) => <div key={c.canal}><span>{NOM[c.canal] || c.canal}<b>{Math.round((c.sesiones / totC) * 100)} %</b></span><Medidor valor={c.sesiones} max={totC} /></div>)}</div></Caja>
      <Caja icono={FileText} titulo="Lo más visto"><div className="barras-h">{w.paginas.map((p) => <div key={p.ruta}><span className="mk-ruta">{p.ruta === '/' ? 'Página de inicio' : p.ruta}<b>{fmt(p.vistas)}</b></span><Medidor valor={p.vistas} max={mxP} color="#14a3a3" /></div>)}</div></Caja>
    </div>
  </>);
}

function AnaliticaRedes({ o }) {
  const ig = metrica(o, 'instagram'); const fb = metrica(o, 'facebook'); const tk = metrica(o, 'tiktok');
  if (!ig && !fb && !tk) return <Conectar o={o} ids={['instagram', 'facebook', 'tiktok']} titulo="Conecta tus redes" texto="Verás tus seguidores, cuánta gente te ve y qué publicaciones funcionan mejor. Se actualiza solo cada día." />;
  const hist = historico(o, 'instagram', 'seguidores'); const crec = hist.length > 1 ? hist[hist.length - 1].valor - hist[0].valor : null;
  const alcance = suma((ig?.alcance || []).map((a) => ({ v: a.valor })), 'v');
  return (<>
    <div className="pc-kpis pc-kpis--4">
      {ig && <Kpi oscuro t="Seguidores Instagram" v={fmt(ig.seguidores)} sub={crec != null ? `${crec >= 0 ? '+' : ''}${fmt(crec)} en ${hist.length} días` : `@${ig.usuario}`} icono={Users} serie={hist.map((h) => h.valor)} />}
      {ig && <Kpi t="Personas alcanzadas" v={fmt(alcance)} sub="últimos 28 días" icono={TrendingUp} />}
      {fb && <Kpi t="Seguidores Facebook" v={fmt(fb.seguidores)} sub={fb.pagina} icono={Users} />}
      {tk && <Kpi t="Seguidores TikTok" v={fmt(tk.seguidores)} sub={`${fmt(tk.likes)} me gusta`} icono={Video} />}
      {ig && <Kpi t="Publicaciones" v={fmt(ig.publicaciones)} sub="en Instagram" icono={ImageIcon} />}
    </div>
    {ig?.alcance?.length > 0 && <Caja icono={TrendingUp} titulo="Alcance por día en Instagram" sub="Personas distintas que han visto tus publicaciones"><Linea datos={ig.alcance} color="#e1306c" /></Caja>}
    {ig?.posts?.length > 0 && (
      <Caja icono={Star} titulo="Tus últimas publicaciones" sub="Ordenadas por interacción">
        <div className="mk-posts">{[...ig.posts].sort((a, b) => b.likes + b.comentarios - (a.likes + a.comentarios)).slice(0, 8).map((p, i) => (
          <a key={i} className="mk-post" href={p.url || undefined} target="_blank" rel="noreferrer">
            <span className="mk-post__img" style={p.img ? { backgroundImage: `url(${p.img})` } : undefined}>{!p.img && <ImageIcon size={22} />}{p.tipo === 'VIDEO' && <em><Video size={12} /> Reel</em>}{i === 0 && <strong>Mejor</strong>}</span>
            <p>{p.texto || 'Sin texto'}</p><small>♥ {fmt(p.likes)} · 💬 {fmt(p.comentarios)} · {hace(p.fecha)}</small>
          </a>
        ))}</div>
      </Caja>
    )}
  </>);
}

export function Analitica({ o, dias, setDias, inicial }) {
  const [tab, setTab] = useState(inicial && ['web', 'redes'].includes(inicial) ? inicial : 'oficina');
  return (
    <div className="vista">
      <Cabecera titulo="Analítica" sub="Tu oficina, tu web y tus redes en un solo sitio. Todo se actualiza solo." />
      <div className="mk-tabs" role="tablist">{[{ k: 'oficina', t: 'Tu oficina', I: BarChart3 }, { k: 'web', t: 'Tu web', I: Globe }, { k: 'redes', t: 'Tus redes', I: Users }].map((x) => <button key={x.k} role="tab" aria-selected={tab === x.k} onClick={() => setTab(x.k)}><x.I size={16} />{x.t}</button>)}</div>
      {tab === 'oficina' && <Estadisticas o={o} dias={dias} setDias={setDias} />}
      {tab === 'web' && <AnaliticaWeb o={o} />}
      {tab === 'redes' && <AnaliticaRedes o={o} />}
    </div>
  );
}

// ---------- SEO y competencia ----------
export function Seo({ o }) {
  const g = metrica(o, 'google_busqueda'); const [st, setSt] = useState(''); const [nuevo, setNuevo] = useState({ nombre: '', web: '' }); const [abrir, setAbrir] = useState(false);
  const mias = o.eventos.map((e) => (e.depto === 'google' ? e.detalle?.estrellas : null)).filter(Boolean); const miNota = mias.length ? mias.reduce((a, b) => a + b, 0) / mias.length : null;
  async function buscar() { setSt('Buscando tu competencia en Google Maps…'); try { if (o.demo) { await new Promise((r) => setTimeout(r, 900)); setSt('En la demo ya tienes la competencia de ejemplo.'); } else { await api('competencia', { op: 'buscar' }); window.location.reload(); } } catch (e) { setSt(e.message); } }
  async function anadir(e) { e.preventDefault(); try { const c = o.demo ? { id: uid('k'), ...nuevo } : (await api('competencia', { op: 'anadir', ...nuevo })).competidor; o.setEstado((s) => ({ ...s, competidores: [...s.competidores, c] })); setNuevo({ nombre: '', web: '' }); setAbrir(false); } catch (er) { setSt(er.message); } }
  async function quitar(id) { if (!o.demo) await api('competencia', { op: 'quitar', id }).catch(() => {}); o.setEstado((s) => ({ ...s, competidores: s.competidores.filter((c) => c.id !== id) })); }
  const art = o.eventos.filter((e) => e.depto === 'contenido' && (e.detalle?.accion === 'articulo' || e.tipo === 'hecho')).slice(0, 5);
  return (
    <div className="vista">
      <Cabecera titulo="SEO y competencia" sub="Cómo te encuentran en Google y qué hace tu competencia." />
      {g ? (<>
        <div className="pc-kpis pc-kpis--4">
          <Kpi oscuro t="Clics desde Google" v={fmt(suma(g.serie, 'clics'))} sub="últimos 28 días" icono={Search} serie={g.serie.map((x) => x.clics)} />
          <Kpi t="Veces que sales" v={fmt(suma(g.serie, 'impresiones'))} sub="en los resultados de Google" icono={Globe} />
          <Kpi t="Posición media" v={fmt(g.busquedas.reduce((a, b) => a + b.posicion, 0) / Math.max(1, g.busquedas.length), 1)} sub="en tus búsquedas principales" icono={TrendingUp} />
          <Kpi t="En el top 3" v={fmt(g.busquedas.filter((b) => b.posicion <= 3).length)} sub={`de ${g.busquedas.length} búsquedas`} icono={Star} />
        </div>
        <Caja icono={Search} titulo="Por qué búsquedas te encuentran" sub="Los últimos 28 días en Google" flush>
          <div className="tabla-w"><table className="tabla mk-tabla"><thead><tr><th>Búsqueda</th><th>Clics</th><th>Veces que sales</th><th>Posición</th></tr></thead>
            <tbody>{g.busquedas.map((b) => <tr key={b.q}><td>{b.q}</td><td><b>{fmt(b.clics)}</b></td><td>{fmt(b.impresiones)}</td><td><span className={`mk-pos ${b.posicion <= 3 ? 'is-top' : b.posicion <= 10 ? 'is-ok' : ''}`}>{fmt(b.posicion, 1)}</span></td></tr>)}</tbody></table></div>
        </Caja>
      </>) : <Conectar o={o} ids={['search_console']} titulo="Conecta Search Console" texto="Sabrás por qué búsquedas te encuentran en Google, en qué posición sales y qué mejorar." />}
      <Caja icono={Users} titulo="Tu competencia" sub="Negocios como el tuyo en tu zona" extra={<div className="fila-btn"><button className="btn btn--sec btn--sm" onClick={() => setAbrir(!abrir)}><Plus size={14} /> Añadir</button><button className="btn btn--pri btn--sm" onClick={buscar}><Search size={14} /> Buscar automáticamente</button></div>}>
        {abrir && <form className="linea" onSubmit={anadir}><input required value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre del negocio" /><input value={nuevo.web} onChange={(e) => setNuevo({ ...nuevo, web: e.target.value })} placeholder="Su web (opcional)" /><button className="btn btn--pri">Añadir</button></form>}
        {st && <p className="muted">{st}</p>}
        {o.competidores.length ? (
          <div className="mk-comp">
            {miNota != null && <article className="mk-comp__i is-tu"><b>{o.negocio.nombre} (tú)</b><span className="mk-nota">{fmt(miNota, 1)} ★</span><small>{fmt(mias.length)} reseñas respondidas</small></article>}
            {o.competidores.map((c) => (
              <article key={c.id} className="mk-comp__i">
                <button className="ico mk-comp__x" onClick={() => quitar(c.id)} aria-label={`Quitar ${c.nombre}`}><X size={14} /></button>
                <b>{c.nombre}</b>{c.nota != null ? <span className="mk-nota">{fmt(c.nota, 1)} ★</span> : <span className="muted">Sin nota</span>}
                <small>{c.resenas != null ? `${fmt(c.resenas)} reseñas en Google` : 'Reseñas: se actualiza al buscar'}</small>
                {c.datos?.publica && <p className="mk-comp__q"><Sparkles size={13} /> {c.datos.publica}</p>}
                {c.web && <a className="enlace" href={c.web.startsWith('http') ? c.web : `https://${c.web}`} target="_blank" rel="noreferrer">{c.web.replace(/^https?:\/\//, '')} <ExternalLink size={12} /></a>}
              </article>
            ))}
          </div>
        ) : <p className="muted">Pulsa «Buscar automáticamente» y tu agente buscará en Google Maps los negocios como el tuyo de tu zona, con su nota y sus reseñas.</p>}
      </Caja>
      {o.deptos.some((d) => d.depto === 'contenido') && (
        <Caja icono={FileText} titulo="Tu blog" sub="Artículos que escribe tu agente para que te encuentren en Google" extra={<button className="enlace" onClick={() => o.ir('articulos')}>Ver todos</button>} flush>
          <ol className="pc-act">{art.map((e) => <li key={e.id} style={{ '--c': DEPTO.contenido.color }}><i /><div><p>{e.detalle?.titulo || e.texto}</p><small>{e.tipo === 'pendiente' && !e.resuelto ? 'Para revisar' : 'Publicado'} · {hace(e.creado)}</small></div></li>)}</ol>
        </Caja>
      )}
    </div>
  );
}

// ---------- Vídeos ----------
const VOCES = [['nova', 'Nova', 'Mujer · cálida'], ['shimmer', 'Shimmer', 'Mujer · luminosa'], ['coral', 'Coral', 'Mujer · cercana'], ['sage', 'Sage', 'Mujer · serena'], ['alloy', 'Alloy', 'Neutra · clara'], ['ash', 'Ash', 'Hombre · joven'], ['echo', 'Echo', 'Hombre · tranquilo'], ['onyx', 'Onyx', 'Hombre · grave']];
const ESTILOS = [['dinamico', 'Dinámico', 'Cortes rápidos, ritmo alto'], ['cercano', 'Cercano', 'Natural, como hablar con un amigo'], ['elegante', 'Elegante', 'Pausado, cuidado, premium'], ['divertido', 'Divertido', 'Con humor y tendencias'], ['minimal', 'Minimalista', 'Limpio, texto en pantalla']];
const ESTADOS_V = [['guion', 'Guion para revisar'], ['montaje', 'En montaje'], ['revision', 'Listo para revisar'], ['aprobado', 'Aprobado'], ['publicado', 'Publicado']];

function VozBoton({ o, voz, sel, elegir }) {
  const [st, setSt] = useState(''); const audio = useRef(null);
  async function oir(e) {
    e.stopPropagation(); if (o.demo) { setSt('Suena en tu oficina'); return; }
    setSt('…'); try { const { url } = await api('video', { op: 'muestra', voz: voz[0] }); audio.current = new Audio(url); await audio.current.play(); setSt(''); } catch (er) { setSt(er.message.includes('activ') ? 'Se está activando' : 'No disponible'); }
  }
  return (
    <button type="button" className={`vz ${sel ? 'is-on' : ''}`} onClick={() => elegir(voz[0])}>
      <span className="vz__p" role="button" tabIndex={0} onClick={oir} onKeyDown={(e) => e.key === 'Enter' && oir(e)} aria-label={`Escuchar ${voz[1]}`}><Volume2 size={15} /></span>
      <span><b>{voz[1]}</b><small>{st || voz[2]}</small></span>{sel && <Check size={15} className="vz__ok" />}
    </button>
  );
}

function DetalleVideo({ o, v, cerrar }) {
  const [vozSel, setVoz] = useState(v.voz || 'nova'); const [st, setSt] = useState(''); const [audio, setAudio] = useState(null);
  useEffect(() => { if (!o.demo && v.audio_path) api('video', { op: 'audio', id: v.id }).then((r) => setAudio(r.url)).catch(() => {}); }, [v.id, v.audio_path, o.demo]);
  async function aprobar() {
    setSt('Grabando la voz en off…');
    try { const r = o.demo ? (await new Promise((ok) => setTimeout(ok, 1200)), {}) : await api('video', { op: 'aprobar_guion', id: v.id, voz: vozSel }); if (r.audio) setAudio(r.audio);
      o.setEstado((s) => ({ ...s, videos: s.videos.map((x) => (x.id === v.id ? { ...x, estado: 'montaje', voz: vozSel } : x)) })); setSt('¡Aprobado! Voz grabada. Ahora lo montamos con tu material y te avisamos para revisarlo.'); } catch (e) { setSt(e.message); }
  }
  const g = v.guion || {};
  return (
    <div className="panel-l" role="dialog" aria-modal="true" aria-label={v.titulo} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <aside className="panel-l__c vd">
        <header><span className="vd__ic"><Clapperboard size={20} /></span><div><b>{v.titulo}</b><span className="muted">{ESTADOS_V.find(([k]) => k === v.estado)?.[1]} · {hace(v.creado)}</span></div><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        {g.gancho && <p className="vd__gancho">«{g.gancho}»</p>}
        {(g.escenas || []).length > 0 && <ol className="vd__esc">{g.escenas.map((e, i) => <li key={i}><span>{i + 1}</span><div><p><Mic size={13} /> {e.voz}</p>{e.texto && <small>En pantalla: «{e.texto}»</small>}{e.imagen && <small>Se ve: {e.imagen}</small>}</div></li>)}</ol>}
        {g.cierre && <p className="muted"><b>Cierre:</b> {g.cierre}</p>}
        {audio && <audio controls src={audio} className="vd__audio" />}
        {v.estado === 'guion' && (<>
          <h3>Elige la voz</h3>
          <div className="vz-grid">{VOCES.map((x) => <VozBoton key={x[0]} o={o} voz={x} sel={vozSel === x[0]} elegir={setVoz} />)}</div>
          <button className="btn btn--pri btn--ancho" onClick={aprobar}><Check size={16} /> Aprobar guion y grabar la voz</button>
        </>)}
        {st && <p className="tuto-st">{st}</p>}
        {g.texto_post && <><h3>Texto para publicarlo</h3><p className="muted">{g.texto_post}</p></>}
      </aside>
    </div>
  );
}

export function Videos({ o, abrir }) {
  const aj = ajustesDe('redes', o.deptos.find((d) => d.depto === 'redes')?.ajustes);
  const [tema, setTema] = useState(''); const [st, setSt] = useState(''); const [ver, setVer] = useState(abrir || null);
  async function pedir(e) {
    e.preventDefault(); if (!tema.trim()) return; setSt('Tu agente está escribiendo el guion…');
    try { const v = o.demo ? (await new Promise((r) => setTimeout(r, 1200)), { id: uid('v'), titulo: tema, estado: 'guion', voz: aj.voz || 'nova', creado: new Date().toISOString(), guion: { gancho: `¿Sabías esto sobre ${tema.toLowerCase()}?`, escenas: [] } }) : (await api('video', { op: 'nuevo', tema })).video;
      o.setEstado((s) => ({ ...s, videos: [v, ...s.videos] })); setTema(''); setSt(''); setVer(v.id); } catch (er) { setSt(er.message); }
  }
  const ajustar = (c) => guardarAjustes(o, 'redes', c).catch(() => {});
  const v = o.videos.find((x) => x.id === ver);
  return (
    <div className="vista">
      <Cabecera titulo="Vídeos" sub="Reels y TikToks de tu negocio: tu agente escribe el guion, pone la voz que elijas y montamos el vídeo con tu material." />
      <Caja icono={Sparkles} titulo="Pide un vídeo">
        <form className="linea" onSubmit={pedir}><input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej.: 3 consejos para que el color dure más" aria-label="Tema del vídeo" /><button className="btn btn--pri"><Clapperboard size={15} /> Pedir vídeo</button></form>
        {st && <p className="muted">{st}</p>}
      </Caja>
      <div className="vd-col">{ESTADOS_V.filter(([k]) => k !== 'aprobado').map(([k, t]) => {
        const col = o.videos.filter((x) => x.estado === k || (k === 'revision' && x.estado === 'aprobado'));
        return (
          <section key={k} className="vd-col__c"><header><b>{t}</b><span>{col.length}</span></header>
            {col.map((x) => (
              <button key={x.id} className="vd-card" onClick={() => setVer(x.id)}>
                <span className={`vd-card__img is-${x.estilo || 'dinamico'}`}><Clapperboard size={20} /><em>9:16</em></span>
                <b>{x.titulo}</b><small><Mic size={12} /> {VOCES.find((y) => y[0] === x.voz)?.[1] || 'Nova'} · {hace(x.creado)}</small>
              </button>
            ))}{!col.length && <p className="muted vd-vacio">—</p>}
          </section>
        );
      })}</div>
      <div className="fila fila--1-1">
        <Caja icono={Mic} titulo="Tu voz" sub="La voz en off de tus vídeos. Pulsa el altavoz para escucharla.">
          <div className="vz-grid">{VOCES.map((x) => <VozBoton key={x[0]} o={o} voz={x} sel={(aj.voz || 'nova') === x[0]} elegir={(id) => ajustar({ voz: id })} />)}</div>
        </Caja>
        <Caja icono={Video} titulo="Tu estilo" sub="Cómo quieres que sean tus vídeos">
          <div className="es-grid">{ESTILOS.map(([k, t, d]) => <button key={k} className={`es ${(aj.estilo_video || 'dinamico') === k ? 'is-on' : ''}`} onClick={() => ajustar({ estilo_video: k })}><span className={`es__m is-${k}`} /><b>{t}</b><small>{d}</small></button>)}</div>
          <button className="enlace" onClick={() => o.ir('material')}><FolderOpen size={14} /> Sube tus fotos y vídeos para que los usemos</button>
        </Caja>
      </div>
      {v && <DetalleVideo key={v.id} o={o} v={v} cerrar={() => setVer(null)} />}
    </div>
  );
}

// ---------- Tu material ----------
const TIPO_DE = (f) => (f.type.startsWith('image/') ? 'foto' : f.type.startsWith('video/') ? 'video' : 'documento');
export function Material({ o }) {
  const [st, setSt] = useState(''); const [urls, setUrls] = useState({}); const [drive, setDrive] = useState(o.negocio.preferencias?.drive || ''); const [arr, setArr] = useState(false);
  const fotos = o.material.filter((m) => m.ruta && (m.tipo === 'foto' || m.tipo === 'logo'));
  const clave = fotos.map((m) => m.ruta).join('|');
  useEffect(() => {
    if (o.demo || !fotos.length) return;
    supabase.storage.from('oficina-material').createSignedUrls(fotos.map((m) => m.ruta), 3600).then(({ data }) => setUrls(Object.fromEntries((data || []).map((d) => [d.path, d.signedUrl]))));
  }, [clave, o.demo]); // eslint-disable-line react-hooks/exhaustive-deps
  async function subir(files) {
    const lista = [...files].slice(0, 30); if (!lista.length) return;
    for (const [i, f] of lista.entries()) {
      setSt(`Subiendo ${i + 1} de ${lista.length}…`);
      if (f.size > 100 * 1024 * 1024) { setSt(`«${f.name}» pesa más de 100 MB.`); continue; }
      if (o.demo) { o.setEstado((s) => ({ ...s, material: [{ id: uid('m'), nombre: f.name, tipo: TIPO_DE(f), creado: new Date().toISOString() }, ...s.material] })); continue; }
      const ruta = `${o.negocio.id}/${Date.now()}-${f.name.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-80)}`;
      const { error } = await supabase.storage.from('oficina-material').upload(ruta, f, { contentType: f.type || undefined });
      if (error) { setSt(`No se ha podido subir «${f.name}».`); continue; }
      const { data } = await supabase.from('of_material').insert({ negocio_id: o.negocio.id, nombre: f.name, tipo: TIPO_DE(f), ruta, tamano: f.size }).select().single();
      if (data) o.setEstado((s) => ({ ...s, material: [data, ...s.material] }));
    }
    setSt('Listo. Tus agentes ya pueden usarlo.');
  }
  async function borrar(m) {
    if (!o.demo) { if (m.ruta) await supabase.storage.from('oficina-material').remove([m.ruta]); await supabase.from('of_material').delete().eq('id', m.id); }
    o.setEstado((s) => ({ ...s, material: s.material.filter((x) => x.id !== m.id) }));
  }
  async function guardarDrive(e) {
    e.preventDefault(); setSt('');
    try { if (!o.demo) await api('preferencias', { drive }); o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, preferencias: { ...(s.negocio.preferencias || {}), drive } } })); setSt('Carpeta guardada.'); } catch (er) { setSt(er.message); }
  }
  const ICO = { foto: ImageIcon, logo: Star, video: Video, documento: FileText, carpeta: FolderOpen };
  return (
    <div className="vista">
      <Cabecera titulo="Tu material" sub="Fotos, vídeos y logo de tu negocio. Tus agentes los usan para publicaciones, vídeos y artículos." />
      <div className="fila fila--2-1">
        <label className={`mt-drop ${arr ? 'is-on' : ''}`} onDragOver={(e) => { e.preventDefault(); setArr(true); }} onDragLeave={() => setArr(false)} onDrop={(e) => { e.preventDefault(); setArr(false); subir(e.dataTransfer.files); }}>
          <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={(e) => subir(e.target.files)} />
          <CloudUpload size={30} /><b>Arrastra aquí tus fotos y vídeos</b><span>o pulsa para elegirlos · hasta 100 MB cada uno</span>
        </label>
        <Caja icono={FolderOpen} titulo="O comparte una carpeta">
          <form className="form1" onSubmit={guardarDrive}><label className="campo"><span>Enlace de tu carpeta de Google Drive</span><input value={drive} onChange={(e) => setDrive(e.target.value)} placeholder="https://drive.google.com/drive/folders/…" /></label>
            <div className="fila-btn"><button className="btn btn--sec btn--sm">Guardar</button>{!conectada(o, 'google_drive') && <button type="button" className="btn btn--fan btn--sm" onClick={() => o.ir('conexiones')}><LogoHerramienta id="google_drive" size={16} plano /> Conectar Drive</button>}</div></form>
        </Caja>
      </div>
      {st && <p className="toast">{st}</p>}
      <div className="mt-grid">{o.material.map((m) => { const I = ICO[m.tipo] || FileText; const u = m.ruta && urls[m.ruta]; return (
        <article key={m.id} className="mt-i">
          <span className={`mt-i__img is-${m.tipo}`} style={u ? { backgroundImage: `url(${u})` } : undefined}>{!u && <I size={26} />}</span>
          <div><b title={m.nombre}>{m.nombre}</b><small>{{ foto: 'Foto', logo: 'Logo', video: 'Vídeo', documento: 'Documento', carpeta: 'Carpeta' }[m.tipo]} · {hace(m.creado)}</small></div>
          <button className="ico" onClick={() => borrar(m)} aria-label={`Borrar ${m.nombre}`}><Trash2 size={15} /></button>
        </article>
      ); })}</div>
      {!o.material.length && <p className="muted">Aún no has subido nada. Con 10-15 fotos de tu local, tu equipo y tus trabajos, tus publicaciones y vídeos serán mucho mejores.</p>}
    </div>
  );
}

// ---------- Informes por correo ----------
export function Informes({ o }) {
  const actual = o.negocio.preferencias?.informe || (o.negocio.preferencias?.resumen_semanal === false ? 'nunca' : 'semanal');
  const [sel, setSel] = useState(actual); const [st, setSt] = useState('');
  async function cambiar(k) { setSel(k); setSt(''); try { if (!o.demo) await api('preferencias', { informe: k }); o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, preferencias: { ...(s.negocio.preferencias || {}), informe: k } } })); setSt('Guardado.'); } catch (e) { setSt(e.message); } }
  async function prueba() { setSt('Enviando…'); try { if (!o.demo) await api('informe', { periodo: sel === 'nunca' ? 'semanal' : sel }); setSt(o.demo ? 'En la demo no se envía, pero así es como te llega.' : `Enviado a ${o.negocio.owner_email}.`); } catch (e) { setSt(e.message); } }
  const h = o.est.act;
  return (
    <div className="vista">
      <Cabecera titulo="Informes" sub="Un resumen de todo lo que hace tu oficina, en tu correo." />
      <div className="fila fila--1-2">
        <Caja icono={Mail} titulo="Cada cuánto">
          <div className="if-op">{[['diario', 'Cada día', 'A primera hora, lo de ayer'], ['semanal', 'Cada semana', 'Los lunes, lo de la semana'], ['mensual', 'Cada mes', 'El día 1, todo el mes'], ['nunca', 'No quiero informes', 'Solo los avisos importantes']].map(([k, t, d]) => (
            <button key={k} className={sel === k ? 'is-on' : ''} onClick={() => cambiar(k)}><span className="if-op__r" /><div><b>{t}</b><small>{d}</small></div></button>
          ))}</div>
          <button className="btn btn--sec" onClick={prueba}><Send size={15} /> Mandarme uno de prueba ahora</button>
          {st && <p className="muted">{st}</p>}
        </Caja>
        <section className="if-prev" aria-label="Vista previa del informe">
          <header><small>Informe {sel === 'nunca' ? 'semanal' : sel} · Oficina de IA</small><h2>{{ diario: 'Tu día', mensual: 'Tu mes' }[sel] || 'Tu semana'} en {o.negocio.nombre}</h2><p>Tus agentes han hecho <b>{fmt(h.total)} tareas</b>: unas <b>{fmt(h.minutos / 60, 1)} h</b> de trabajo que no has hecho tú.</p></header>
          <div className="if-prev__k">{[[h.total, 'tareas'], [h.citas, 'citas'], [h.ganados, 'clientes ganados'], [o.eventos.filter((e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto).length, 'te esperan']].map(([n, t]) => <div key={t}><b>{fmt(n)}</b><span>{t}</span></div>)}</div>
          <div className="if-prev__b"><h3>Por departamento</h3>{o.est.porDepto.filter((x) => x.n).map((x) => <p key={x.depto}><i style={{ background: DEPTO[x.depto].color }} />{DEPTO[x.depto].nombre}<b>{fmt(x.n)}</b></p>)}
            <h3>Lo más destacado</h3><ul>{o.eventos.filter((e) => e.tipo === 'hecho').slice(0, 4).map((e) => <li key={e.id}><b style={{ color: DEPTO[e.depto]?.color }}>{DEPTO[e.depto]?.corto}</b> · {e.texto}</li>)}</ul>
            <span className="if-prev__btn">Abrir mi oficina</span></div>
        </section>
      </div>
      <p className="muted nota"><MessageCircle size={14} /> Además, cuando algo te necesita te avisamos al momento (puedes cambiarlo en Avisos y cuenta).</p>
    </div>
  );
}

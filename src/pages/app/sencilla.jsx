// Vista sencilla del panel: para quien no entiende de IA. La oficina 3D es lo principal, cada agente tiene nombre y se
// dice en una frase qué está haciendo, lo que te necesita se resuelve con «Sí» o «No», y hay tres botones grandes:
// llamar, escribir y ver la agenda. Sin números ni gráficas. Todo lo demás está en la vista completa.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarCheck, CalendarPlus, Check, ChevronRight, Clapperboard, LayoutGrid, MessageCircle, Phone, Send, Sparkles, Star, X } from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { NuevaCita } from './vistas2';
import { DEPTO } from '../../data/oficinaSaas';
import { api, pendiente, MINUTOS_TAREA } from './datos';
import { estadoDe, duracion, hora, tipoDe, uid } from './formato';
import { Avatar, Puntos } from './ui';
import { OficinaViva, decidir } from './pantallas';
import { Llamada, preguntar, anotar } from './llamada';
import { NOMBRES_AG, AGENTE_DE } from './oficinaOpciones';

const saludo = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; };
const inicioHoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const cosas = (n) => `${n} ${n === 1 ? 'cosa' : 'cosas'}`;

// «Ha contestado a Laura…» → «Vera ha contestado a Laura…»
function enFrase(nombre, texto) {
  const t = String(texto || '').trim();
  if (/^Ha /.test(t)) return `${nombre} ${t.replace(/^Ha /, 'ha ')}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function useNombres(o) {
  const propios = o.negocio.oficina?.nombres || {};
  return (depto) => { const k = AGENTE_DE[depto]; return (k && (propios[k] || NOMBRES_AG[k])) || DEPTO[depto]?.corto || 'Tu equipo'; };
}

// ---------- una cosa que te necesita, en lenguaje llano ----------
function Pendiente({ e, o, nombre, abrir }) {
  const tipo = tipoDe(e); const d = e.detalle || {}; const [st, setSt] = useState('');
  const quien = nombre(e.depto);
  async function hacer(decision) { setSt('…'); try { await decidir(o, e, decision, d.texto); } catch (err) { setSt(err.message || 'No se ha podido. Inténtalo otra vez.'); } }
  const cliente = (e.texto.match(/^([A-ZÁÉÍÓÚÑ][\wáéíóúñ.]+)/) || [])[1];
  const P = {
    post: { q: `${quien} ha preparado una publicación para tus redes. ¿La publicamos?`, ver: d.texto, si: 'Sí, publícala', no: 'No' },
    resena: { q: `${quien} ha escrito la respuesta a una reseña de ${d.estrellas || 3} estrellas${cliente ? ` de ${cliente}` : ''}. ¿La publicamos?`, cita: d.original, ver: d.texto, si: 'Sí, publícala', no: 'La contesto yo' },
    articulo: { q: `${quien} ha escrito un artículo para tu web${d.titulo ? `: «${d.titulo}»` : ''}. ¿Lo publicamos?`, ver: d.resumen, si: 'Sí, publícalo', no: 'No' },
    seguimiento: { q: `${quien} ha escrito un mensaje para un cliente que pidió presupuesto y no ha vuelto a escribir. ¿Se lo enviamos?`, ver: d.texto, si: 'Sí, envíalo', no: 'No' },
    video: { q: `${quien} tiene listo el guion de un vídeo${d.titulo ? `: «${d.titulo}»` : ''}. Solo falta que elijas la voz.`, ir: ['Ver el guion', () => abrir('video', d.video)] },
    cita: { q: e.texto, ir: ['Ver mi agenda', () => abrir('agenda')], hecho: true },
    conversacion: { q: `Un cliente quiere hablar contigo. ${e.texto.replace(/ Último mensaje:.*$/, '')}`, ir: ['Ver y contestar', () => abrir('conv', d.conversacion)], hecho: true },
    aviso: { q: e.texto, hecho: true },
  }[tipo] || { q: e.texto, hecho: true };
  return (
    <article className="sn-pend" style={{ '--c': DEPTO[e.depto]?.color }}>
      <header><Avatar depto={e.depto} size={40} /><p>{P.q}</p></header>
      {P.cita && <blockquote>«{P.cita}»</blockquote>}
      {P.ver && <div className="sn-pend__ver">{P.ver}</div>}
      <footer>
        {P.si && <button className="sn-btn sn-btn--si" onClick={() => hacer('aprobar')}><Check size={20} /> {P.si}</button>}
        {P.no && <button className="sn-btn sn-btn--no" onClick={() => hacer('descartar')}>{P.no}</button>}
        {P.ir && <button className="sn-btn sn-btn--si" onClick={P.ir[1]}>{P.ir[0]} <ChevronRight size={18} /></button>}
        {P.hecho && <button className="sn-btn sn-btn--no" onClick={() => hacer('hecho')}><Check size={18} /> Ya está</button>}
        {st && <small>{st}</small>}
      </footer>
    </article>
  );
}

// ---------- ficha de un agente ----------
function FichaAgente({ o, depto, nombre, cerrar }) {
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') cerrar(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [cerrar]);
  const info = DEPTO[depto]; const dep = o.deptos.find((x) => x.depto === depto);
  const st = estadoDe({ depto, agente: o.agentes[depto], ajustes: dep?.ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora });
  const hoy = o.eventos.filter((e) => e.depto === depto && e.tipo === 'hecho' && new Date(e.creado).getTime() >= inicioHoy());
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={nombre} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="modal__c sn-ficha" style={{ '--c': info.color }}>
        <header><Avatar depto={depto} size={64} vivo={st.clave === 'trabajando'} /><div><h2>{nombre}</h2><p>{info.nombre}</p></div><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={20} /></button></header>
        <p className="sn-ficha__que">{info.que}</p>
        <div className={`sn-ficha__ahora is-${st.clave}`}><b>{st.clave === 'trabajando' ? 'Ahora mismo' : 'Ahora'}</b><span>{st.clave === 'trabajando' ? <>{st.tarea}<Puntos /></> : st.clave === 'listo' ? 'Está libre, esperando trabajo nuevo.' : st.tarea}</span></div>
        <h3>Lo que ha hecho hoy</h3>
        {hoy.length ? <ul className="sn-lista">{hoy.map((e) => <li key={e.id}><time>{hora(e.creado)}</time><span>{e.texto}</span></li>)}</ul>
          : <p className="sn-muted">Hoy todavía no ha tenido trabajo. En cuanto entre algo, lo verás aquí.</p>}
        <button className="sn-btn sn-btn--no sn-btn--ancho" onClick={cerrar}>Cerrar</button>
      </div>
    </div>
  );
}

// ---------- hoja: ventana grande, a pantalla completa en el móvil ----------
function Hoja({ titulo, sub, cerrar, children, pie, ancha }) {
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') cerrar(); }; document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [cerrar]);
  return (
    <div className="sn-hoja" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className={`sn-hoja__c ${ancha ? 'is-ancha' : ''}`}>
        <header className="sn-hoja__h"><div><h2>{titulo}</h2>{sub && <p>{sub}</p>}</div><button type="button" className="sn-cerrar" onClick={cerrar} aria-label="Cerrar"><X size={22} /></button></header>
        <div className="sn-hoja__b">{children}</div>
        {pie && <footer className="sn-hoja__p">{pie}</footer>}
      </div>
    </div>
  );
}

// ---------- escribir a tu equipo ----------
const IDEAS = ['¿Qué habéis hecho hoy?', '¿Qué citas tengo mañana?', '¿Cómo van mis reseñas de Google?', 'Prepárame un post para el fin de semana'];
function ChatSencillo({ o, cerrar, llamar }) {
  const [t, setT] = useState(''); const [esc, setEsc] = useState(false); const fin = useRef(null);
  const msgs = o.chat.filter((m) => !m.depto).slice(-30);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, esc]);
  async function enviar(x0) {
    const x = (x0 ?? t).trim(); if (!x || esc) return; setT(''); setEsc(true); anotar(o, 'tu', x);
    try { const r = await preguntar(o, x, false); anotar(o, 'equipo', r.respuesta, r.accion ? { detalle: { accion: r.accion } } : {}); } catch (er) { anotar(o, 'equipo', er.message || 'No te he podido contestar. Inténtalo otra vez.'); }
    setEsc(false);
  }
  return (
    <Hoja titulo="Escribe a tu equipo" sub="Pregunta lo que quieras o pide trabajo, como en WhatsApp." cerrar={cerrar}
      pie={<form className="sn-escribir" onSubmit={(e) => { e.preventDefault(); enviar(); }}>
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Escribe aquí…" aria-label="Mensaje a tu equipo" />
        <button className="sn-enviar" disabled={esc || !t.trim()} aria-label="Enviar"><Send size={22} /></button>
      </form>}>
      <div className="sn-burbujas">
        {!msgs.length && <p className="sn-muted">Aún no habéis hablado. Prueba con una de estas:</p>}
        {msgs.map((m) => <div key={m.id} className={`sn-bur sn-bur--${m.de === 'tu' ? 'tu' : 'eq'}`}><p>{m.texto}</p><time>{hora(m.creado)}</time></div>)}
        {esc && <div className="sn-bur sn-bur--eq"><p><Puntos /></p></div>}
        <div ref={fin} />
      </div>
      <div className="sn-ideas">{IDEAS.map((x) => <button key={x} type="button" onClick={() => enviar(x)} disabled={esc}>{x}</button>)}</div>
      <button type="button" className="sn-btn sn-btn--no sn-btn--ancho" onClick={llamar}><Phone size={18} /> Prefiero llamar</button>
    </Hoja>
  );
}

// ---------- agenda ----------
const diaDe = (f) => {
  if (!f) return 'Sin día concreto';
  const d = new Date(f); const hoy = new Date(); hoy.setHours(0, 0, 0, 0); const n = Math.round((new Date(d).setHours(0, 0, 0, 0) - hoy) / 864e5);
  const t = n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function CitaSencilla({ c, o }) {
  const [st, setSt] = useState('');
  async function cambiar(estado) {
    setSt('…');
    try { if (!o.demo) await api('cita', { id: c.id, estado }); o.setEstado((s) => ({ ...s, citas: s.citas.map((x) => (x.id === c.id ? { ...x, estado } : x)) })); setSt(''); } catch (e) { setSt(e.message); }
  }
  return (
    <li className={`sn-cita is-${c.estado}`}>
      <div className="sn-cita__h"><b>{c.fecha ? new Date(c.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}</b><div><p><b>{c.nombre || 'Cliente'}</b>{c.servicio ? ` · ${c.servicio}` : ''}</p>{c.estado === 'pendiente' ? <small>{diaDe(c.fecha)}{c.cuando_texto ? ` · pidió «${c.cuando_texto}»` : ''}</small> : c.cuando_texto && <small>Pidió «{c.cuando_texto}»</small>}</div></div>
      {c.estado === 'pendiente' && <div className="sn-cita__a"><button className="sn-btn sn-btn--si" onClick={() => cambiar('confirmada')}><Check size={20} /> Confirmar</button><button className="sn-btn sn-btn--no" onClick={() => cambiar('cancelada')}>No puedo</button></div>}
      {c.estado === 'confirmada' && <small className="sn-cita__ok"><Check size={15} /> Confirmada{c.recordado ? ' · ya le hemos recordado la cita' : ''}</small>}
      {st && <small>{st}</small>}
    </li>
  );
}
function AgendaSencilla({ o, cerrar }) {
  const [nueva, setNueva] = useState(false);
  const pend = o.citas.filter((c) => c.estado === 'pendiente');
  const prox = o.citas.filter((c) => c.estado === 'confirmada' && (!c.fecha || new Date(c.fecha) >= o.ahora - 36e5)).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')).slice(0, 30);
  const dias = []; for (const c of prox) { const k = diaDe(c.fecha); const g = dias.find((x) => x[0] === k); if (g) g[1].push(c); else dias.push([k, [c]]); }
  return (
    <Hoja titulo="Tu agenda" sub="Las citas que te piden tus clientes. Confírmalas y les avisamos solos." cerrar={cerrar}
      pie={<button type="button" className="sn-btn sn-btn--si sn-btn--ancho" onClick={() => setNueva(true)}><CalendarPlus size={20} /> Apuntar una cita</button>}>
      {pend.length > 0 && <section className="sn-hsec"><h3>Por confirmar ({pend.length})</h3><ul className="sn-citas">{pend.map((c) => <CitaSencilla key={c.id} c={c} o={o} />)}</ul></section>}
      <section className="sn-hsec"><h3>Próximas citas</h3>
        {dias.length ? dias.map(([d, cs]) => <div key={d} className="sn-dia"><h4>{d}</h4><ul className="sn-citas">{cs.map((c) => <CitaSencilla key={c.id} c={c} o={o} />)}</ul></div>)
          : <p className="sn-muted">No tienes citas confirmadas próximamente.</p>}
      </section>
      {nueva && <NuevaCita o={o} cerrar={() => setNueva(false)} />}
    </Hoja>
  );
}

// ---------- una conversación con un cliente ----------
function ConversacionSencilla({ o, id, cerrar }) {
  const conv = o.conversaciones.find((c) => c.id === id);
  const [msgs, setMsgs] = useState([]); const [t, setT] = useState(''); const [st, setSt] = useState(''); const fin = useRef(null);
  useEffect(() => {
    if (!conv) return;
    if (o.demo) { setMsgs(conv.mensajes || []); return; } // eslint-disable-line react-hooks/set-state-in-effect
    supabase.from('of_mensajes').select('*').eq('conversacion_id', conv.id).order('creado').limit(200).then(({ data }) => setMsgs(data || []));
    if (!conv.leido) api('conversacion', { id: conv.id, leido: true }).catch(() => {});
  }, [conv?.id, o.demo]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);
  if (!conv) return <Hoja titulo="Conversación" cerrar={cerrar}><p className="sn-muted">Esta conversación ya no está disponible.</p></Hoja>;
  const nombre = conv.nombre || (conv.canal === 'web' ? 'Visitante de tu web' : `+${conv.contacto}`);
  async function enviar(e) {
    e.preventDefault(); const x = t.trim(); if (!x) return; setT(''); setSt('');
    try {
      if (!o.demo) await api('responder', { conversacion: conv.id, texto: x });
      setMsgs((m) => [...m, { id: uid('l'), de: 'humano', texto: x, creado: new Date().toISOString() }]);
      o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado: 'humano', necesita: null, ultimo_texto: x } : c)) }));
    } catch (er) { setSt(er.message); setT(x); }
  }
  async function alAgente() {
    if (!o.demo) await api('conversacion', { id: conv.id, estado: 'agente' }).catch(() => {});
    o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado: 'agente', necesita: null } : c)) })); cerrar();
  }
  return (
    <Hoja titulo={nombre} sub={conv.canal === 'whatsapp' ? 'Por WhatsApp' : 'Por el chat de tu web'} cerrar={cerrar}
      pie={<><form className="sn-escribir" onSubmit={enviar}><input value={t} onChange={(e) => setT(e.target.value)} placeholder={`Escribe a ${nombre.split(' ')[0]}…`} aria-label="Tu respuesta" /><button className="sn-enviar" disabled={!t.trim()} aria-label="Enviar"><Send size={22} /></button></form>
        {st && <small className="sn-muted">{st}</small>}
        {conv.estado === 'humano' && <button type="button" className="sn-btn sn-btn--no sn-btn--ancho" onClick={alAgente}>Que siga contestando mi agente</button>}</>}>
      <div className="sn-burbujas">
        {msgs.map((m) => <div key={m.id} className={`sn-bur ${m.de === 'cliente' ? 'sn-bur--eq' : 'sn-bur--tu'}`}><small>{m.de === 'cliente' ? nombre.split(' ')[0] : m.de === 'humano' ? 'Tú' : 'Tu agente'}</small><p>{m.texto}</p><time>{hora(m.creado)}</time></div>)}
        <div ref={fin} />
      </div>
    </Hoja>
  );
}

// ---------- guion de un vídeo ----------
function VideoSencillo({ o, id, cerrar }) {
  const v = (o.videos || []).find((x) => x.id === id); const [st, setSt] = useState('');
  if (!v) return <Hoja titulo="Vídeo" cerrar={cerrar}><p className="sn-muted">Este vídeo ya no está disponible.</p></Hoja>;
  const g = v.guion || {}; const listo = v.estado !== 'guion' && v.estado !== 'revision';
  async function aprobar() {
    setSt('Grabando la voz…');
    try {
      if (!o.demo) await api('video', { op: 'aprobar_guion', id: v.id, voz: v.voz || 'nova' }); else await new Promise((ok) => setTimeout(ok, 1000));
      o.setEstado((s) => ({ ...s, videos: s.videos.map((x) => (x.id === v.id ? { ...x, estado: 'montaje' } : x)), eventos: s.eventos.map((e) => (e.detalle?.video === v.id ? { ...e, resuelto: true } : e)) }));
      setSt('¡Hecho! Ahora lo montamos con tus fotos y vídeos y te avisamos para que lo veas.');
    } catch (er) { setSt(er.message); }
  }
  return (
    <Hoja titulo={v.titulo} sub="Esto es lo que dirá el vídeo. Si te gusta, lo montamos nosotros." cerrar={cerrar}
      pie={listo || st.startsWith('¡') ? <p className="sn-ok"><Check size={22} /> {st || 'Ya está aprobado. Te avisaremos cuando esté montado.'}</p>
        : <><div className="sn-cita__a"><button className="sn-btn sn-btn--si" onClick={aprobar}><Check size={20} /> Me gusta, adelante</button><button className="sn-btn sn-btn--no" onClick={cerrar}>Ahora no</button></div>{st && <small className="sn-muted">{st}</small>}</>}>
      <ol className="sn-guion">
        {g.gancho && <li><b>Empieza</b><p>«{g.gancho}»</p></li>}
        {(g.escenas || []).map((e, i) => <li key={i}><b>Escena {i + 1}</b><p>«{e.voz}»</p>{e.imagen && <small><Clapperboard size={14} /> Se ve: {e.imagen}</small>}</li>)}
        {g.cierre && <li><b>Termina</b><p>«{g.cierre}»</p></li>}
      </ol>
    </Hoja>
  );
}

// ---------- enseñar algo al equipo ----------
function EnsenarSencillo({ o, cerrar }) {
  const [t, setT] = useState(''); const [st, setSt] = useState('');
  const notas = (o.conocimiento || []).filter((k) => k.tipo === 'nota').slice(0, 6);
  async function guardar(e) {
    e.preventDefault(); const x = t.trim(); if (!x) return; setSt('Guardando…');
    const fila = { tipo: 'nota', datos: {}, respuesta: x, hasta: null };
    if (o.demo) o.setEstado((s) => ({ ...s, conocimiento: [{ ...fila, id: uid('k'), created_at: new Date().toISOString() }, ...s.conocimiento] }));
    else {
      const { data, error } = await supabase.from('of_conocimiento').insert({ ...fila, negocio_id: o.negocio.id }).select().single();
      if (error) { setSt('No se ha podido guardar. Inténtalo otra vez.'); return; }
      o.setEstado((s) => ({ ...s, conocimiento: [data, ...s.conocimiento] }));
    }
    setT(''); setSt('Guardado. Tu equipo ya lo sabe.');
  }
  return (
    <Hoja titulo="Enseña algo a tu equipo" sub="Precios, horarios, promociones, festivos… Lo que escribas aquí lo usarán al hablar con tus clientes." cerrar={cerrar}>
      <form className="sn-ensenar" onSubmit={guardar}>
        <textarea rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="Por ejemplo: el sábado 6 cerramos a las 14:00" aria-label="Lo que debe saber tu equipo" />
        <button className="sn-btn sn-btn--si sn-btn--ancho" disabled={!t.trim()}><Check size={20} /> Guardar</button>
        {st && <p className="sn-muted">{st}</p>}
      </form>
      {notas.length > 0 && <section className="sn-hsec"><h3>Lo último que les has contado</h3><ul className="sn-lista">{notas.map((k) => <li key={k.id}><time>·</time><span>{k.respuesta}</span></li>)}</ul></section>}
    </Hoja>
  );
}

export function Sencilla({ o, vista, abrirPerfil }) {
  const nombre = useNombres(o);
  const [llamada, setLlamada] = useState(false); const [agente, setAgente] = useState(null); const [todas, setTodas] = useState(false); const [feedTodo, setFeedTodo] = useState(false);
  const [hoja, setHoja] = useState(null); const abrir = (t, id) => setHoja({ t, id }); const cerrarHoja = () => setHoja(null);
  const desde = inicioHoy();
  const hechosHoy = useMemo(() => o.eventos.filter((e) => e.tipo === 'hecho' && new Date(e.creado).getTime() >= desde), [o.eventos, desde]);
  const minutos = hechosHoy.reduce((s, e) => s + (MINUTOS_TAREA[e.depto] || 0), 0);
  const pend = o.eventos.filter(pendiente);
  const estados = o.deptos.map(({ depto, ajustes }) => ({ depto, st: estadoDe({ depto, agente: o.agentes[depto], ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora }) }));
  const trabajando = estados.filter((x) => x.st.clave === 'trabajando');
  const tieneCitas = o.deptos.some((d) => d.depto === 'citas');
  const citasPend = o.citas.filter((c) => c.estado === 'pendiente').length;

  return (
    <div className="sn">
      <header className="sn-top">
        <a href="/" className="sn-top__logo"><img src="/images/logo-blanco.png" alt="Agutidesigns" width="118" height="32" /></a>
        <span className="sn-top__neg">{o.negocio.nombre}</span>
        <div className="sn-top__a">
          <button type="button" className="sn-top__vista" onClick={() => vista.setModo('completa')}><LayoutGrid size={16} /> Vista completa</button>
          <button type="button" className="sn-top__yo" onClick={abrirPerfil} aria-label="Mi perfil">{o.negocio.nombre.slice(0, 1).toUpperCase()}</button>
        </div>
      </header>

      <section className="sn-hero">
        <OficinaViva o={o} alto="min(64vh, 660px)" />
        <div className="sn-hero__txt">
          <span className="sn-vivo"><i />{trabajando.length ? `${trabajando.length} ${trabajando.length === 1 ? 'agente trabajando' : 'agentes trabajando'} ahora` : 'Tu equipo está conectado'}</span>
          <h1>{saludo()}, {o.negocio.nombre}</h1>
          <p>{hechosHoy.length ? <>Hoy tu equipo ha hecho <b>{cosas(hechosHoy.length)}</b> por ti y te ha ahorrado <b>{duracion(minutos)}</b> de trabajo.</> : 'Hoy todavía no ha entrado trabajo. Tu equipo está listo y esperando.'}</p>
          {pend.length > 0 && <a className="sn-hero__aviso" href="#te-necesitan">Te {pend.length === 1 ? 'necesitan para 1 cosa' : `necesitan para ${pend.length} cosas`} <ChevronRight size={16} /></a>}
        </div>
      </section>

      <div className="sn-cuerpo">
        <section className="sn-acc" aria-label="Acciones rápidas">
          <button type="button" className="sn-acc__b sn-acc__b--llamar" onClick={() => setLlamada(true)}><span><Phone size={26} /></span><b>Llamar a mi oficina</b><small>Habla con tu equipo como por teléfono</small></button>
          <button type="button" className="sn-acc__b" onClick={() => abrir('chat')}><span><MessageCircle size={26} /></span><b>Escribir a mi equipo</b><small>Pregunta lo que quieras o pide trabajo</small></button>
          {tieneCitas ? <button type="button" className="sn-acc__b" onClick={() => abrir('agenda')}><span><CalendarCheck size={26} /></span><b>Ver mi agenda</b><small>{citasPend ? `${citasPend} ${citasPend === 1 ? 'cita' : 'citas'} por confirmar` : 'Las citas de tus clientes'}</small></button>
            : <button type="button" className="sn-acc__b" onClick={() => abrir('ensenar')}><span><Sparkles size={26} /></span><b>Enseñar a mi equipo</b><small>Precios, horarios y lo que deben saber</small></button>}
        </section>

        <section className="sn-sec" id="te-necesitan">
          <h2>{pend.length ? `Te necesitan (${pend.length})` : 'Te necesitan'}</h2>
          {pend.length ? <><p className="sn-muted">Tu equipo ha preparado esto y quiere tu visto bueno. Solo tienes que decir sí o no.</p>
            <div className="sn-pends">{pend.slice(0, todas ? 40 : 3).map((e) => <Pendiente key={e.id} e={e} o={o} nombre={nombre} abrir={abrir} />)}</div>
            {pend.length > 3 && !todas && <button className="sn-btn sn-btn--no sn-btn--ancho" onClick={() => setTodas(true)}>Ver las {pend.length}</button>}</>
            : <p className="sn-ok"><Check size={22} /> Nada pendiente. Tu equipo lo tiene todo bajo control.</p>}
        </section>

        <section className="sn-sec">
          <h2>Tu equipo</h2>
          <p className="sn-muted">Toca a cualquiera para ver qué ha hecho hoy.</p>
          <div className="sn-eq">{estados.map(({ depto, st }) => {
            const n = hechosHoy.filter((e) => e.depto === depto).length;
            return (
              <button key={depto} type="button" className={`sn-ag is-${st.clave}`} style={{ '--c': DEPTO[depto].color }} onClick={() => setAgente(depto)}>
                <Avatar depto={depto} size={56} vivo={st.clave === 'trabajando'} />
                <b>{nombre(depto)}</b><small>{DEPTO[depto].nombre}</small>
                <p>{st.clave === 'trabajando' ? <>{st.tarea}<Puntos /></> : st.clave === 'listo' ? 'Libre, esperando trabajo' : st.txt}</p>
                <span className="sn-ag__hoy">{n ? `Hoy: ${cosas(n)}` : 'Hoy: nada todavía'}</span>
              </button>
            );
          })}</div>
        </section>

        <section className="sn-sec">
          <h2>Lo que han hecho hoy</h2>
          {hechosHoy.length ? <ul className="sn-feed">{hechosHoy.slice(0, feedTodo ? 200 : 10).map((e) => (
            <li key={e.id} style={{ '--c': DEPTO[e.depto]?.color }}><Avatar depto={e.depto} size={36} /><p>{enFrase(nombre(e.depto), e.texto)}</p><time>{hora(e.creado)}</time></li>
          ))}</ul> : <p className="sn-muted">Aquí irá apareciendo todo lo que haga tu equipo durante el día.</p>}
          {hechosHoy.length > 10 && !feedTodo && <button className="sn-btn sn-btn--no sn-btn--ancho" onClick={() => setFeedTodo(true)}>Ver todo lo de hoy ({hechosHoy.length})</button>}
        </section>

        <p className="sn-pie"><Star size={15} /> ¿Quieres ver números, gráficas y todas las secciones? <button type="button" onClick={() => vista.setModo('completa')}>Cambia a la vista completa</button></p>
      </div>

      {agente && <FichaAgente o={o} depto={agente} nombre={nombre(agente)} cerrar={() => setAgente(null)} />}
      {hoja?.t === 'chat' && <ChatSencillo o={o} cerrar={cerrarHoja} llamar={() => { cerrarHoja(); setLlamada(true); }} />}
      {hoja?.t === 'agenda' && <AgendaSencilla o={o} cerrar={cerrarHoja} />}
      {hoja?.t === 'conv' && <ConversacionSencilla o={o} id={hoja.id} cerrar={cerrarHoja} />}
      {hoja?.t === 'video' && <VideoSencillo o={o} id={hoja.id} cerrar={cerrarHoja} />}
      {hoja?.t === 'ensenar' && <EnsenarSencillo o={o} cerrar={cerrarHoja} />}
      {llamada && <Llamada o={o} cerrar={() => setLlamada(false)} />}
    </div>
  );
}

// Primera vez: el cliente elige cómo quiere ver su oficina.
export function ElegirVista({ vista }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Elige cómo ver tu oficina">
      <div className="modal__c sn-elegir">
        <h2>¿Cómo quieres ver tu oficina?</h2>
        <p className="sn-muted">Puedes cambiarlo cuando quieras desde tu perfil.</p>
        <div className="sn-elegir__op">
          <button type="button" onClick={() => vista.setModo('sencilla')}><span className="sn-elegir__img is-sencilla"><i /><i /><i /></span><b>Sencilla</b><small>Ves a tu equipo trabajando en tu oficina 3D y lo que hace cada uno. Solo dices sí o no. Ideal si no te manejas con la tecnología.</small></button>
          <button type="button" onClick={() => vista.setModo('completa')}><span className="sn-elegir__img is-completa"><i /><i /><i /><i /></span><b>Completa</b><small>Todas las secciones, números, gráficas, SEO y estadísticas. Para controlar cada detalle.</small></button>
        </div>
      </div>
    </div>
  );
}

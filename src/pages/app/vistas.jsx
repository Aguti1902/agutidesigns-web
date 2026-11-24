// Vistas del panel de la Oficina de IA. Lenguaje llano, una acción clara por bloque.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, Copy, ExternalLink, Gift, Globe, MessageCircle, Pause, Play, Plus, Search, Send, Trash2, UserRound, X } from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { DEPARTAMENTOS, DEPTO, AVISO_CUPO, precioOficina, precioAnual, webIncluida, WEB_DESDE } from '../../data/oficinaSaas';
import { api, pendiente, variacion } from './datos';
import { HERRAMIENTAS } from './conexiones';
import { BarrasDia, Donut, Calor, Sparkline, Medidor } from './graficos';
import { Avatar, Tarjeta, Puntos } from './ui';
import { estadoDe, fmt, hora, hace, diaLargo, duracion, CAMPOS } from './formato';
const Oficina3D = lazy(() => import('../../components/oficina/Oficina3D'));


const saludo = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; };

// ---------- Bandeja «Te necesitan» ----------
function Pendiente({ e, o }) {
  const [abierto, setAbierto] = useState(false); const [texto, setTexto] = useState(e.detalle?.texto || ''); const [st, setSt] = useState('');
  const d = DEPTO[e.depto]; const conTexto = Boolean(e.detalle?.texto);
  async function decidir(decision) {
    setSt('…');
    try {
      if (o.demo) await new Promise((r) => setTimeout(r, 300)); else await api('tarea', { id: e.id, decision, texto: conTexto ? texto : undefined });
      o.setEstado((s) => ({ ...s, eventos: s.eventos.map((x) => (x.id === e.id ? { ...x, resuelto: true, respuesta: decision } : x)) }));
    } catch (err) { setSt(err.message); }
  }
  const copiar = () => navigator.clipboard?.writeText(texto).then(() => setSt('Copiado'), () => {});
  return (
    <li className="b-item" style={{ '--c': d?.color }}>
      <Avatar depto={e.depto} size={34} />
      <div className="b-item__c">
        <p><b>{d?.corto}</b> · {hace(e.creado)}</p>
        <span>{e.texto}</span>
        {abierto && conTexto && (
          <div className="b-edit">
            {e.detalle?.original && <blockquote>«{e.detalle.original}»</blockquote>}
            <textarea rows={e.depto === 'contenido' ? 10 : 4} value={texto} onChange={(x) => setTexto(x.target.value)} aria-label="Texto propuesto" />
          </div>
        )}
        <div className="b-acc">
          {e.detalle?.conversacion && <button className="btn btn--sec btn--sm" onClick={() => o.ir('conversaciones', e.detalle.conversacion)}><MessageCircle size={14} /> Ver conversación</button>}
          {conTexto && !abierto && <button className="btn btn--sec btn--sm" onClick={() => setAbierto(true)}>Revisar</button>}
          {conTexto && abierto && <button className="btn btn--sec btn--sm" onClick={copiar}><Copy size={14} /> Copiar</button>}
          {e.tipo === 'pendiente' ? (<>
            <button className="btn btn--pri btn--sm" onClick={() => decidir('aprobar')}><Check size={14} /> Aprobar</button>
            <button className="btn btn--fan btn--sm" onClick={() => decidir('descartar')}>Descartar</button>
          </>) : <button className="btn btn--pri btn--sm" onClick={() => decidir('hecho')}><Check size={14} /> Hecho</button>}
          {st && <small className="muted">{st}</small>}
        </div>
      </div>
    </li>
  );
}
export function Bandeja({ o, max }) {
  const lista = o.eventos.filter(pendiente).slice(0, max || 50);
  if (!lista.length) return <p className="vacio"><Check size={16} /> Nada pendiente. Tus agentes lo tienen todo bajo control.</p>;
  return <ul className="b-lista">{lista.map((e) => <Pendiente key={e.id} e={e} o={o} />)}</ul>;
}

// ---------- El equipo en directo ----------
function Agente({ depto, o, onClick }) {
  const dep = o.deptos.find((d) => d.depto === depto); const info = DEPTO[depto];
  const st = estadoDe({ depto, agente: o.agentes[depto], ajustes: dep?.ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora });
  const hoy = o.est.hoy; const n = { atencion: hoy.conversaciones, citas: hoy.citas, ventas: hoy.ventas, redes: hoy.publicaciones, google: hoy.google, contenido: hoy.articulos }[depto] || 0;
  const u = o.uso[depto] || {}; const pct = Math.min(1, Math.max(u.pct || 0, (u.unidades_mes || 0) / (dep?.cupo_n || 1)));
  return (
    <button type="button" className={`ag is-${st.clave}`} onClick={onClick} style={{ '--c': info.color }}>
      <header><Avatar depto={depto} vivo={st.clave === 'trabajando'} /><div><b>{info.nombre}</b><span className="ag-st"><i />{st.txt}{st.clave === 'trabajando' && <Puntos />}</span></div></header>
      <p className="ag-tarea">{st.tarea}</p>
      <footer><span><b>{fmt(n)}</b> hoy</span><span className="ag-cupo" title={`Cupo del mes: ${Math.round(pct * 100)} %`}><Medidor valor={pct} color={pct >= AVISO_CUPO ? 'var(--aviso)' : info.color} /></span></footer>
    </button>
  );
}

function FichaAgente({ depto, o, cerrar }) {
  const dep = o.deptos.find((d) => d.depto === depto); const info = DEPTO[depto]; const aj = dep?.ajustes || {};
  const u = o.uso[depto] || {}; const evs = o.eventos.filter((e) => e.depto === depto && e.tipo !== 'sistema').slice(0, 8);
  async function ajustar(c) {
    const nuevo = { ...aj, ...c };
    o.setEstado((s) => ({ ...s, deptos: s.deptos.map((x) => (x.depto === depto ? { ...x, ajustes: nuevo } : x)) }));
    if (!o.demo) await supabase.from('of_departamentos').update({ ajustes: nuevo }).eq('negocio_id', o.negocio.id).eq('depto', depto);
  }
  return (
    <div className="panel-l" role="dialog" aria-modal="true" aria-label={info.nombre} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <aside className="panel-l__c">
        <header><Avatar depto={depto} size={44} /><div><b>{info.nombre}</b><span className="muted">{fmt(u.unidades_mes)} de {fmt(dep?.cupo_n)} {info.cupo.unidad} este mes</span></div><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        <p>{info.que}</p>
        <ul className="lista-check">{info.hace.map((h) => <li key={h}><Check size={15} />{h}</li>)}</ul>
        <div className="ajustes">
          <label className="sw"><input type="checkbox" checked={!!aj.revisar} onChange={(e) => ajustar({ revisar: e.target.checked })} /><span /><div><b>Quiero revisarlo antes</b><small>Te enseña lo que va a publicar o responder y espera tu «Aprobar».</small></div></label>
          <label className="sw"><input type="checkbox" checked={!!aj.pausado} onChange={(e) => ajustar({ pausado: e.target.checked })} /><span /><div><b>Pausar</b><small>No hará nada hasta que lo reactives.</small></div></label>
        </div>
        <h3>Lo último que ha hecho</h3>
        <ol className="feed">{evs.length ? evs.map((e) => <Evento key={e.id} e={e} />) : <p className="muted">Todavía nada.</p>}</ol>
      </aside>
    </div>
  );
}

export function Evento({ e }) {
  const d = DEPTO[e.depto];
  return (
    <li className={`ev ev--${e.tipo}`} style={{ '--c': d?.color }}>
      <i /><div><p>{e.texto}</p><span>{d?.corto || 'Oficina'} · {hora(e.creado)}{e.resuelto && e.tipo !== 'hecho' ? ' · resuelto' : ''}</span></div>
    </li>
  );
}

function Oficina3DViva({ o }) {
  const api3d = useRef(null); const visto = useRef(new Set());
  const agentes = useMemo(() => o.deptos.map((d) => ({ ...DEPTO[d.depto], nombre: DEPTO[d.depto].corto })), [o.deptos]);
  const idx = useMemo(() => Object.fromEntries(o.deptos.map((d, i) => [d.depto, i])), [o.deptos]);
  useEffect(() => {
    const nuevos = o.eventos.filter((f) => !visto.current.has(f.id)); const primera = visto.current.size === 0;
    nuevos.forEach((f) => visto.current.add(f.id)); if (primera) return;
    nuevos.slice(0, 4).forEach((f, k) => setTimeout(() => api3d.current?.aviso(idx[f.depto] ?? -1, f.texto), k * 400));
  }, [o.eventos, idx]);
  if (!agentes.length) return null;
  return <div className="of3d"><Suspense fallback={<div className="o3-lienzo" />}><Oficina3D agentes={agentes} apiRef={api3d} titulo={o.negocio.nombre.slice(0, 22)} auto={false} /></Suspense></div>;
}

// ---------- Prueba gratis y web incluida ----------
function Prueba({ o }) {
  const fin = o.negocio.prueba_hasta && new Date(o.negocio.prueba_hasta);
  if (!fin || fin < new Date(o.ahora)) return null;
  const dias = Math.max(1, Math.ceil((fin - o.ahora) / 864e5));
  return (
    <p className="banda-prueba"><Gift size={17} /><span><b>Te {dias === 1 ? 'queda 1 día' : `quedan ${dias} días`} de prueba gratis</b> (hasta el {fin.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}). Mientras tanto cada departamento trabaja con el 25 % de su cupo. No se te cobra nada hasta ese día.</span>
      <button className="enlace" onClick={() => o.ir('ajustes')}>Ver mi plan</button></p>
  );
}

export function WebIncluida({ o, compacta }) {
  const [tiene, setTiene] = useState(true); const [url, setUrl] = useState(''); const [que, setQue] = useState(''); const [st, setSt] = useState('');
  const e = o.negocio.web_estado;
  async function enviar(ev) {
    ev.preventDefault(); setSt('Enviando…');
    try { if (!o.demo) await api('web', { tiene, url, que }); o.setEstado((x) => ({ ...x, negocio: { ...x.negocio, web_estado: 'solicitada', web_detalle: { tiene, url, que } } })); setSt(''); }
    catch (err) { setSt(err.message); }
  }
  if (compacta) {
    return (
      <Tarjeta titulo="Tu web está incluida" extra={<Globe size={18} className="muted" />}>
        <p className="muted">Tu plan anual incluye el diseño de tu web, o el rediseño de la que ya tienes. Cuéntanos qué necesitas y nos ponemos con ella.</p>
        <button className="btn btn--pri centro-izq" onClick={() => o.ir('ajustes', null, 'web')}>Pedir mi web <ArrowRight size={15} /></button>
      </Tarjeta>
    );
  }
  return (
    <Tarjeta titulo="Tu web" id="web" extra={<span className="chip">{{ pendiente: 'Sin pedir', solicitada: 'Pedida', en_curso: 'En marcha', entregada: 'Entregada' }[e] || ''}</span>}>
      {e === 'pendiente' ? (
        <form className="form1" onSubmit={enviar}>
          <p className="muted">Tu plan anual incluye el diseño de tu web, o el rediseño de la que ya tienes. Cuéntanos lo básico y te escribimos en menos de 48 h laborables.</p>
          <div className="seg"><button type="button" aria-pressed={tiene} onClick={() => setTiene(true)}>Ya tengo web</button><button type="button" aria-pressed={!tiene} onClick={() => setTiene(false)}>No tengo web</button></div>
          {tiene && <label className="campo"><span>Dirección de tu web</span><input value={url} onChange={(x) => setUrl(x.target.value)} placeholder="https://tuweb.com" /></label>}
          <label className="campo"><span>¿Qué te gustaría?</span><textarea rows={4} value={que} onChange={(x) => setQue(x.target.value)} placeholder="Qué secciones quieres, webs que te gustan, colores, si quieres reservas online…" /></label>
          <div className="fila-btn"><button className="btn btn--pri">Pedir mi web</button>{st && <span className="muted">{st}</span>}</div>
        </form>
      ) : <p className="muted">{e === 'solicitada' ? 'Ya lo tenemos. Te escribimos en menos de 48 h laborables para empezar.' : e === 'en_curso' ? 'Estamos trabajando en tu web.' : 'Tu web está entregada. Si necesitas algún cambio, escríbenos.'}</p>}
    </Tarjeta>
  );
}

// ---------- Inicio ----------
function PuestaEnMarcha({ o }) {
  const datos = CAMPOS.slice(0, 5).every(([k]) => String(o.negocio[k] || '').trim());
  const necesarias = HERRAMIENTAS.filter((h) => h.proveedor !== 'clave' && h.deptos.some((x) => o.deptos.some((d) => d.depto === x)));
  const conectada = o.conexiones.some((c) => c.estado === 'conectada');
  const probado = o.conversaciones.some((c) => c.contacto?.startsWith('prueba'));
  const pasos = [
    { ok: datos, t: 'Cuéntales cómo es tu negocio', d: 'Horario, servicios y precios. 3 minutos.', ir: 'ensenar' },
    { ok: conectada, t: 'Conecta tus herramientas', d: `${necesarias.slice(0, 3).map((h) => h.nombre).join(', ')}…`, ir: 'conexiones' },
    { ok: probado || o.demo, t: 'Pruébalo tú mismo', d: 'Escríbele como si fueras un cliente.', ir: 'ensenar', ancla: 'probar' },
  ];
  if (pasos.every((p) => p.ok)) return null;
  return (
    <Tarjeta titulo="Pon en marcha tu oficina" extra={<span className="muted">{pasos.filter((p) => p.ok).length} de 3</span>} className="arranque">
      <ol className="pasos">{pasos.map((p, i) => (
        <li key={p.t} className={p.ok ? 'is-ok' : ''}><span className="pasos__n">{p.ok ? <Check size={14} strokeWidth={3} /> : i + 1}</span><div><b>{p.t}</b><small>{p.d}</small></div>
          {!p.ok && <button className="btn btn--pri btn--sm" onClick={() => o.ir(p.ir, null, p.ancla)}>Empezar <ArrowRight size={14} /></button>}</li>
      ))}</ol>
    </Tarjeta>
  );
}

export function Inicio({ o }) {
  const [ficha, setFicha] = useState(null);
  const h = o.est.hoy; const pend = o.eventos.filter(pendiente).length;
  return (
    <div className="vista">
      <header className="hola">
        <h1>{saludo()}, {o.negocio.nombre}</h1>
        <p>{h.total ? <>Hoy tus agentes han hecho <b>{fmt(h.total)} tareas</b> y te han ahorrado unos <b>{duracion(h.minutos)}</b>.</> : 'Hoy todavía no ha habido trabajo. En cuanto entre algo, lo verás aquí al momento.'}{pend > 0 && <> Tienes <b>{pend} {pend === 1 ? 'cosa' : 'cosas'}</b> esperándote.</>}</p>
      </header>
      <Prueba o={o} />
      <PuestaEnMarcha o={o} />
      {o.negocio.web_incluida && o.negocio.web_estado === 'pendiente' && <WebIncluida o={o} compacta />}
      {pend > 0 && <Tarjeta titulo="Te necesitan" extra={<span className="chip chip--aviso">{pend}</span>}><Bandeja o={o} max={4} />{pend > 4 && <button className="enlace" onClick={() => o.ir('actividad', null, 'tuyo')}>Ver las {pend} <ArrowRight size={14} /></button>}</Tarjeta>}
      <section>
        <div className="sec-h"><h2>Tu equipo, ahora mismo</h2><span className="vivo"><i />En directo</span></div>
        <div className="equipo">{o.deptos.map((d) => <Agente key={d.depto} depto={d.depto} o={o} onClick={() => setFicha(d.depto)} />)}</div>
      </section>
      <div className="fila fila--3-2">
        <Tarjeta titulo="Tu oficina" extra={<span className="muted">Arrastra para girarla</span>} className="t-flush"><Oficina3DViva o={o} /></Tarjeta>
        <Tarjeta titulo="Lo último" extra={<button className="enlace" onClick={() => o.ir('actividad')}>Todo <ArrowRight size={14} /></button>}>
          <ol className="feed">{o.eventos.filter((e) => e.tipo !== 'sistema').slice(0, 7).map((e) => <Evento key={e.id} e={e} />)}</ol>
        </Tarjeta>
      </div>
      {ficha && <FichaAgente depto={ficha} o={o} cerrar={() => setFicha(null)} />}
    </div>
  );
}

// ---------- Conversaciones ----------
export function Conversaciones({ o, abrir }) {
  const [sel, setSel] = useState(abrir || o.conversaciones[0]?.id || null);
  const [filtro, setFiltro] = useState('todas'); const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState([]); const [texto, setTexto] = useState(''); const [st, setSt] = useState('');
  const fin = useRef(null);
  const lista = o.conversaciones.filter((c) => !c.contacto?.startsWith('prueba')).filter((c) => (filtro === 'todas' || (filtro === 'necesitan' ? c.necesita : !c.leido)) && (!q || `${c.nombre || ''} ${c.contacto}`.toLowerCase().includes(q.toLowerCase())));
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
  async function enviar(e) {
    e.preventDefault(); const t = texto.trim(); if (!t) return; setTexto(''); setSt('');
    const nuevo = { id: `l${Date.now()}`, de: 'humano', texto: t, creado: new Date().toISOString() };
    try {
      if (!o.demo) await api('responder', { conversacion: conv.id, texto: t });
      setMsgs((x) => [...x, nuevo]);
      o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado: 'humano', necesita: null } : c)) }));
    } catch (err) { setSt(err.message); setTexto(t); }
  }
  async function cambiar(estado) {
    if (!o.demo) await api('conversacion', { id: conv.id, estado }).catch(() => {});
    o.setEstado((s) => ({ ...s, conversaciones: s.conversaciones.map((c) => (c.id === conv.id ? { ...c, estado, necesita: null } : c)) }));
  }
  if (!o.conversaciones.length) {
    return <div className="vista"><Tarjeta><div className="vacio-g"><MessageCircle size={28} /><h2>Aún no hay conversaciones</h2><p>Cuando un cliente escriba por WhatsApp o por el chat de tu web, verás aquí cada conversación en directo y podrás contestar tú cuando quieras.</p><button className="btn btn--pri" onClick={() => o.ir('conexiones')}>Conectar WhatsApp o el chat</button></div></Tarjeta></div>;
  }
  return (
    <div className={`vista conv ${sel ? 'con-sel' : ''}`}>
      <aside className="conv-l a-card">
        <label className="buscar"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" /></label>
        <div className="seg">{[['todas', 'Todas'], ['necesitan', 'Te necesitan'], ['sinleer', 'Sin leer']].map(([k, t]) => <button key={k} aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{t}</button>)}</div>
        <ul>{lista.map((c) => (
          <li key={c.id}><button className={`conv-i ${c.id === sel ? 'is-on' : ''}`} onClick={() => setSel(c.id)}>
            <span className="conv-av">{(c.nombre || '?').slice(0, 1).toUpperCase()}</span>
            <div><b>{c.nombre || (c.canal === 'web' ? 'Visitante web' : `+${c.contacto}`)}</b><small>{c.canal === 'whatsapp' ? 'WhatsApp' : 'Chat web'} · {hace(c.ultimo)}</small></div>
            {c.necesita ? <span className="chip chip--aviso">Te necesita</span> : !c.leido ? <span className="punto" /> : null}
          </button></li>
        ))}{!lista.length && <p className="muted pad">Nada con ese filtro.</p>}</ul>
      </aside>
      {conv && (
        <section className="conv-d a-card">
          <header><button className="ico conv-atras" onClick={() => setSel(null)} aria-label="Volver"><ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /></button>
            <div><b>{conv.nombre || 'Cliente'}</b><small>{conv.canal === 'whatsapp' ? `WhatsApp · +${conv.contacto}` : 'Chat de tu web'}</small></div>
            {conv.estado === 'humano'
              ? <button className="btn btn--sec btn--sm" onClick={() => cambiar('agente')}><Play size={14} /> Devolver al agente</button>
              : <button className="btn btn--sec btn--sm" onClick={() => cambiar('humano')}><Pause size={14} /> Llevarla yo</button>}
          </header>
          <p className={`conv-banda ${conv.estado === 'humano' ? 'is-tu' : ''}`}>{conv.estado === 'humano' ? <><UserRound size={14} /> La llevas tú. Tu agente no contestará hasta que se la devuelvas.</> : <><MessageCircle size={14} /> La lleva tu agente de Atención. Si escribes, pasas a llevarla tú.</>}</p>
          <div className="conv-m">
            {msgs.map((m) => <div key={m.id} className={`bur bur--${m.de}`}><p>{m.texto}</p><span>{m.de === 'agente' ? 'Agente' : m.de === 'humano' ? 'Tú' : conv.nombre || 'Cliente'} · {hora(m.creado)}</span></div>)}
            <div ref={fin} />
          </div>
          <form className="conv-f" onSubmit={enviar}><input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu respuesta…" aria-label="Tu respuesta" /><button className="btn btn--pri" aria-label="Enviar"><Send size={16} /></button></form>
          {st && <p className="error pad">{st}</p>}
        </section>
      )}
    </div>
  );
}

// ---------- Actividad ----------
export function Actividad({ o, inicial }) {
  const [f, setF] = useState(inicial || 'todo'); const [q, setQ] = useState(''); const [n, setN] = useState(60);
  const lista = o.eventos.filter((e) => e.tipo !== 'sistema' || f === 'todo').filter((e) => (f === 'todo' || (f === 'tuyo' ? pendiente(e) : e.depto === f)) && (!q || e.texto.toLowerCase().includes(q.toLowerCase())));
  const grupos = []; for (const e of lista.slice(0, n)) { const k = new Date(e.creado).toDateString(); const g = grupos[grupos.length - 1]; if (g && g.k === k) g.e.push(e); else grupos.push({ k, d: e.creado, e: [e] }); }
  return (
    <div className="vista">
      <div className="filtros">
        <div className="seg seg--scroll">{[['todo', 'Todo'], ['tuyo', 'Te necesitan'], ...o.deptos.map((x) => [x.depto, DEPTO[x.depto].corto])].map(([k, t]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{t}</button>)}</div>
        <label className="buscar"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" /></label>
      </div>
      {f === 'tuyo' ? <Tarjeta><Bandeja o={o} /></Tarjeta> : grupos.map((g) => <Tarjeta key={g.k} titulo={diaLargo(g.d)} extra={<span className="muted">{g.e.length}</span>}><ol className="feed">{g.e.map((e) => <Evento key={e.id} e={e} />)}</ol></Tarjeta>)}
      {f !== 'tuyo' && !lista.length && <p className="vacio">No hay actividad con ese filtro.</p>}
      {f !== 'tuyo' && lista.length > n && <button className="btn btn--sec centro" onClick={() => setN(n + 80)}>Ver más</button>}
    </div>
  );
}

// ---------- Estadísticas ----------
function Kpi({ t, v, d, serie, nota, color }) {
  return (
    <article className="kpi">
      <span>{t}</span><b>{v}</b>
      <footer>{d != null ? <em className={d >= 0 ? 'up' : 'down'}>{d > 0 ? '+' : ''}{d} %</em> : <em>{nota || ''}</em>}{serie && <Sparkline datos={serie} color={color} />}</footer>
    </article>
  );
}
export function Estadisticas({ o, dias, setDias }) {
  const { est } = o; const a = est.act, p = est.prev; const d = (k) => (est.hayPrev ? variacion(a[k], p[k]) : null);
  const tiene = (x) => o.deptos.some((y) => y.depto === x); const ser = (k) => est.serie.map((s) => (k === 'total' ? s.total : s[k] || 0));
  const totCanal = a.canales.whatsapp + a.canales.web || 1; const maxTema = est.temas[0]?.[1] || 1;
  const fila = (k, t) => ({ k, t, a: a[k], p: p[k], d: d(k) });
  const tabla = [fila('total', 'Tareas hechas'), tiene('atencion') && fila('conversaciones', 'Clientes atendidos'), tiene('atencion') && fila('fuera', 'Atendidos fuera de tu horario'),
    tiene('citas') && fila('citas', 'Citas gestionadas'), tiene('ventas') && fila('ganados', 'Presupuestos aceptados'), tiene('google') && fila('resenas', 'Reseñas respondidas'),
    tiene('redes') && fila('publicaciones', 'Tareas de redes'), tiene('contenido') && fila('articulos', 'Artículos'), fila('avisos', 'Veces que te han necesitado')].filter(Boolean);
  return (
    <div className="vista">
      <div className="filtros"><div className="seg">{[[7, '7 días'], [30, '30 días']].map(([k, t]) => <button key={k} aria-pressed={dias === k} onClick={() => setDias(k)}>{t}</button>)}</div><span className="muted">Comparado con los {dias} días anteriores</span></div>
      <div className="kpis">
        <Kpi t="Tareas hechas" v={fmt(a.total)} d={d('total')} serie={ser('total')} />
        {tiene('atencion') && <Kpi t="Clientes atendidos" v={fmt(a.conversaciones)} d={d('conversaciones')} serie={ser('atencion')} color={DEPTO.atencion.color} />}
        <Kpi t="Tiempo que te ahorra" v={duracion(a.minutos)} d={d('minutos')} nota="estimación" />
        {tiene('atencion') && <Kpi t="Responde en" v={a.respuesta != null ? `${fmt(a.respuesta, 1)} s` : '—'} nota="de media" />}
        {tiene('atencion') && <Kpi t="Fuera de tu horario" v={fmt(a.fuera)} d={d('fuera')} nota="clientes atendidos" />}
        {tiene('google') && <Kpi t="Nota de tus reseñas" v={a.estrellas != null ? `${fmt(a.estrellas, 1)} ★` : '—'} nota={`${fmt(a.resenas)} reseñas`} />}
      </div>
      <div className="fila fila--2-1">
        <Tarjeta titulo="Tareas por día"><BarrasDia serie={est.serie} deptos={o.deptos.map((x) => x.depto)} /></Tarjeta>
        <Tarjeta titulo="Quién hace qué"><Donut partes={est.porDepto.filter((x) => x.n)} centro={fmt(a.total)} sub="tareas" /></Tarjeta>
      </div>
      {tiene('atencion') && (
        <div className="fila fila--2-1">
          <Tarjeta titulo="Cuándo te escriben tus clientes"><Calor calor={est.calor} /><p className="muted nota">Fuera de tu horario también se les contesta al momento.</p></Tarjeta>
          <div className="col">
            <Tarjeta titulo="Por dónde llegan"><div className="barras-h">{[['WhatsApp', a.canales.whatsapp, '#22b35e'], ['Chat de tu web', a.canales.web, DEPTO.atencion.color]].map(([t, n, c]) => <div key={t}><span>{t}<b>{Math.round((n / totCanal) * 100)} %</b></span><Medidor valor={n} max={totCanal} color={c} /></div>)}</div></Tarjeta>
            <Tarjeta titulo="Lo que más preguntan">{est.temas.length ? <div className="barras-h">{est.temas.slice(0, 5).map(([t, n]) => <div key={t}><span>{t[0].toUpperCase() + t.slice(1)}<b>{fmt(n)}</b></span><Medidor valor={n} max={maxTema} /></div>)}</div> : <p className="muted">Aún sin datos.</p>}</Tarjeta>
          </div>
        </div>
      )}
      <Tarjeta titulo="Comparativa">
        <div className="tabla-w"><table className="tabla"><thead><tr><th>Indicador</th><th>Ahora</th><th>Antes</th><th>Cambio</th></tr></thead>
          <tbody>{tabla.map((r) => <tr key={r.k}><td>{r.t}</td><td><b>{fmt(r.a)}</b></td><td>{est.hayPrev ? fmt(r.p) : '—'}</td><td>{r.d == null ? '—' : <em className={r.d >= 0 ? 'up' : 'down'}>{r.d > 0 ? '+' : ''}{r.d} %</em>}</td></tr>)}</tbody></table></div>
      </Tarjeta>
      <p className="muted nota">«Tiempo que te ahorra» es una estimación: lo que tardaría una persona en cada tarea (3 min por cliente atendido, 4 por cita, 20 por publicación, 90 por artículo).</p>
    </div>
  );
}

// ---------- Enseñar ----------
function Probar({ o }) {
  const [msgs, setMsgs] = useState([{ de: 'agente', texto: `¡Hola! Soy el agente de Atención de ${o.negocio.nombre}. Escríbeme como si fueras un cliente.` }]);
  const [t, setT] = useState(''); const [esc, setEsc] = useState(false);
  const [sesion] = useState(() => `prueba${Math.random().toString(36).slice(2, 12)}`);
  async function enviar(e) {
    e.preventDefault(); const x = t.trim(); if (!x) return; setT(''); setMsgs((m) => [...m, { de: 'cliente', texto: x }]); setEsc(true);
    let r = 'Esto es la demo: en tu oficina real aquí te contestaría tu agente con los datos de tu negocio.';
    if (!o.demo) { try { const j = await (await fetch('/api/oficina/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oficina: o.negocio.id, sesion, texto: x }) })).json(); r = j.respuesta || (j.esperando ? 'El agente ha pasado esta conversación a ti.' : 'No ha podido contestar.'); } catch { r = 'No ha podido contestar. Inténtalo de nuevo.'; } }
    setEsc(false); setMsgs((m) => [...m, { de: 'agente', texto: r }]);
  }
  return (
    <Tarjeta titulo="Pruébalo tú" id="probar" extra={<span className="muted">Así contesta a tus clientes</span>}>
      <div className="probar">
        <div className="conv-m">{msgs.map((m, i) => <div key={i} className={`bur bur--${m.de}`}><p>{m.texto}</p></div>)}{esc && <div className="bur bur--agente"><p><Puntos /></p></div>}</div>
        <form className="conv-f" onSubmit={enviar}><input value={t} onChange={(e) => setT(e.target.value)} placeholder="¿Cuánto cuesta…? ¿Abrís el sábado?" aria-label="Mensaje de prueba" /><button className="btn btn--pri" aria-label="Enviar"><Send size={16} /></button></form>
      </div>
    </Tarjeta>
  );
}

export function Ensenar({ o }) {
  const [form, setForm] = useState(o.negocio); const [st, setSt] = useState('');
  const [nota, setNota] = useState(''); const [hasta, setHasta] = useState(''); const [pq, setPq] = useState(''); const [rp, setRp] = useState('');
  const hechos = CAMPOS.filter(([k]) => String(o.negocio[k] || '').trim()).length;
  async function guardar(e) {
    e.preventDefault(); const c = Object.fromEntries(CAMPOS.map(([k]) => [k, (form[k] || '').trim()]));
    if (!o.demo) { setSt('Guardando…'); const { error } = await supabase.from('of_negocios').update(c).eq('id', o.negocio.id); if (error) { setSt('No se ha podido guardar.'); return; } }
    o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, ...c } })); setSt('Guardado. Tus agentes ya lo saben.');
  }
  async function anadir(fila) {
    let nueva = { ...fila, id: `l${Date.now()}`, created_at: new Date().toISOString() };
    if (!o.demo) { const { data, error } = await supabase.from('of_conocimiento').insert({ ...fila, negocio_id: o.negocio.id }).select().single(); if (error) return; nueva = data; }
    o.setEstado((s) => ({ ...s, conocimiento: [nueva, ...s.conocimiento] }));
  }
  async function borrar(id) { if (!o.demo) await supabase.from('of_conocimiento').delete().eq('id', id); o.setEstado((s) => ({ ...s, conocimiento: s.conocimiento.filter((k) => k.id !== id) })); }
  const notas = o.conocimiento.filter((k) => k.tipo === 'nota'); const faqs = o.conocimiento.filter((k) => k.tipo === 'faq');
  return (
    <div className="vista">
      <div className="fila fila--1-1">
        <Tarjeta titulo="Avisos de estos días" extra={<span className="muted">Tienen prioridad</span>}>
          <form className="linea" onSubmit={(e) => { e.preventDefault(); if (!nota.trim()) return; anadir({ tipo: 'nota', respuesta: nota.trim(), hasta: hasta || null }); setNota(''); setHasta(''); }}>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: El sábado cerramos a las 14:00" aria-label="Aviso" />
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} aria-label="Válido hasta" title="Hasta (opcional)" />
            <button className="btn btn--pri" aria-label="Añadir aviso"><Plus size={16} /></button>
          </form>
          <ul className="kn">{notas.map((k) => <li key={k.id}><p>{k.respuesta}{k.hasta && <small> · hasta el {new Date(k.hasta).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</small>}</p><button className="ico" onClick={() => borrar(k.id)} aria-label="Borrar"><Trash2 size={15} /></button></li>)}
            {!notas.length && <p className="muted">Vacaciones, festivos, cambios de horario… Tus agentes lo dirán a quien pregunte.</p>}</ul>
        </Tarjeta>
        <Tarjeta titulo="Preguntas frecuentes">
          <form className="faq-f" onSubmit={(e) => { e.preventDefault(); if (!pq.trim() || !rp.trim()) return; anadir({ tipo: 'faq', pregunta: pq.trim(), respuesta: rp.trim() }); setPq(''); setRp(''); }}>
            <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Pregunta: ¿Se puede pagar con Bizum?" aria-label="Pregunta" />
            <div className="linea"><input value={rp} onChange={(e) => setRp(e.target.value)} placeholder="Respuesta: Sí, Bizum, tarjeta y efectivo" aria-label="Respuesta" /><button className="btn btn--pri" aria-label="Añadir pregunta"><Plus size={16} /></button></div>
          </form>
          <ul className="kn">{faqs.map((k) => <li key={k.id}><p><b>{k.pregunta}</b><br />{k.respuesta}</p><button className="ico" onClick={() => borrar(k.id)} aria-label="Borrar"><Trash2 size={15} /></button></li>)}
            {!faqs.length && <p className="muted">Añade lo que más te preguntan y cómo lo contestas tú.</p>}</ul>
        </Tarjeta>
      </div>
      <Tarjeta titulo="Tu negocio" extra={<span className="muted">{hechos} de {CAMPOS.length} completados</span>}>
        <form className="form2" onSubmit={guardar}>
          {CAMPOS.map(([k, l, ph, largo]) => (
            <label key={k} className={`campo ${largo ? 'ancho' : ''}`}><span>{l}{String(o.negocio[k] || '').trim() && <Check size={13} className="ok" />}</span>
              {largo ? <textarea rows={3} value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </label>
          ))}
          <div className="ancho fila-btn"><button className="btn btn--pri">Guardar</button>{st && <span className="muted">{st}</span>}</div>
        </form>
      </Tarjeta>
      <Probar o={o} />
    </div>
  );
}

// ---------- Conexiones ----------
export function Conexiones({ o, aviso }) {
  const [ocupado, setOcupado] = useState(''); const [modal, setModal] = useState(null); const [msg, setMsg] = useState(aviso || '');
  const mis = o.deptos.map((d) => d.depto);
  const usa = (h) => h.deptos.filter((d) => mis.includes(d));
  const lista = [...HERRAMIENTAS].sort((a, b) => usa(b).length - usa(a).length);
  const de = (id) => o.conexiones.find((c) => c.herramienta === id);
  const marcar = (id, cuenta) => o.setEstado((e) => ({ ...e, conexiones: [...e.conexiones.filter((c) => c.herramienta !== id), { herramienta: id, estado: 'conectada', cuenta }] }));
  async function conectar(h, extra) {
    if (h.proveedor === 'snippet' && !extra) { setModal({ h }); return; }
    if (h.proveedor === 'clave' && !extra) { setModal({ h, form: { url: '', usuario: '', clave: '' } }); return; }
    setOcupado(h.id); setMsg('');
    if (o.demo) { setTimeout(() => { marcar(h.id, extra?.url || 'Cuenta de ejemplo'); setOcupado(''); setModal(null); setMsg(`${h.nombre} conectado (demo).`); }, 900); return; }
    try {
      const j = await api('conectar', { herramienta: h.id, ...extra });
      if (j.url) { window.location.assign(j.url); return; }
      if (j.conectada) { marcar(h.id, j.cuenta); setModal(null); setMsg(`${h.nombre} conectado.`); }
    } catch (err) { setMsg(err.message); if (err.datos?.ayuda) setModal({ h, ayuda: true }); }
    setOcupado('');
  }
  async function ayuda(h) { if (!o.demo) await api('ayuda', { herramienta: h.nombre }).catch(() => {}); setModal(null); setMsg(`Hecho. Te escribimos en menos de 24 h laborables para conectar ${h.nombre} contigo.`); }
  async function quitar(h) { o.setEstado((e) => ({ ...e, conexiones: e.conexiones.filter((c) => c.herramienta !== h.id) })); if (!o.demo) await api('desconectar', { herramienta: h.id }).catch(() => {}); }
  const codigo = `<script src="https://agutidesigns.io/oficina-chat.js" data-oficina="${o.negocio.id}" async></script>`;
  return (
    <div className="vista">
      {msg && <p className="toast" role="status">{msg}<button className="ico" onClick={() => setMsg('')} aria-label="Cerrar"><X size={14} /></button></p>}
      <div className="tools">
        {lista.map((h) => {
          const c = de(h.id); const on = c?.estado === 'conectada'; const u = usa(h);
          return (
            <article key={h.id} className={`tool ${on ? 'is-on' : ''}`}>
              <span className="tool__logo" style={{ background: h.color }}>{h.letra}</span>
              <div className="tool__c"><b>{h.nombre}</b><span>{h.que}</span><small>{u.length ? `La usa${u.length > 1 ? 'n' : ''}: ${u.map((d) => DEPTO[d].corto).join(', ')}` : 'Opcional'}</small></div>
              <div className="tool__a">{on ? (<><span className="ok-t"><Check size={14} strokeWidth={3} />{c.cuenta || 'Conectado'}</span><button className="enlace enlace--gris" onClick={() => quitar(h)}>Desconectar</button></>)
                : <button className="btn btn--pri btn--sm" disabled={ocupado === h.id} onClick={() => conectar(h)}>{ocupado === h.id ? 'Conectando…' : 'Conectar'}</button>}</div>
            </article>
          );
        })}
      </div>
      <p className="muted nota"><CircleHelp size={14} /> ¿Te atascas? <button className="enlace" onClick={() => setModal({ h: { nombre: 'mis herramientas' }, ayuda: true })}>Pídenos ayuda</button> y lo conectamos contigo.</p>
      {modal && (
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal__c">
            <header><b>{modal.ayuda ? 'Te ayudamos a conectarlo' : modal.h.nombre}</b><button className="ico" onClick={() => setModal(null)} aria-label="Cerrar"><X size={18} /></button></header>
            {modal.ayuda ? (<><p>Te escribimos en menos de 24 h laborables y conectamos {modal.h.nombre} contigo en una videollamada de 10 minutos.</p><button className="btn btn--pri" onClick={() => ayuda(modal.h)}>Pedir ayuda</button></>)
              : modal.h.proveedor === 'snippet' ? (<>
                <p>Pega este código en tu web, justo antes de <code>&lt;/body&gt;</code>. Si tu web la hicimos nosotros, dínoslo y lo ponemos por ti.</p>
                <pre className="code">{codigo}</pre>
                <div className="fila-btn"><button className="btn btn--sec" onClick={() => navigator.clipboard?.writeText(codigo).then(() => setMsg('Código copiado.'), () => {})}><Copy size={15} /> Copiar código</button><button className="btn btn--pri" onClick={() => conectar(modal.h, { instalado: true })}>Ya lo he pegado</button></div>
              </>) : (
                <form className="form1" onSubmit={(e) => { e.preventDefault(); conectar(modal.h, modal.form); }}>
                  <p>En tu WordPress: <b>Usuarios → Perfil → Contraseñas de aplicación</b>. Crea una llamada «Oficina de IA» y pégala aquí. Se guarda cifrada.</p>
                  {[['url', 'Dirección de tu web', 'https://tuweb.com'], ['usuario', 'Usuario', 'admin'], ['clave', 'Contraseña de aplicación', 'xxxx xxxx xxxx xxxx']].map(([k, l, ph]) => (
                    <label key={k} className="campo"><span>{l}</span><input required value={modal.form[k]} placeholder={ph} type={k === 'clave' ? 'password' : 'text'} onChange={(e) => setModal({ ...modal, form: { ...modal.form, [k]: e.target.value } })} /></label>
                  ))}
                  <button className="btn btn--pri" disabled={ocupado === modal.h.id}>{ocupado === modal.h.id ? 'Conectando…' : 'Conectar'}</button>
                </form>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Ajustes ----------
export function Ajustes({ o }) {
  const [sel, setSel] = useState(o.deptos.map((d) => d.depto)); const [st, setSt] = useState(''); const [conf, setConf] = useState(false);
  const anual = o.negocio.periodo === 'anio'; const precio = (k) => (anual ? precioAnual(k) : precioOficina(k)); const ud = anual ? '€/año' : '€/mes';
  const actual = o.deptos.map((d) => d.depto); const cambia = sel.length !== actual.length || sel.some((x) => !actual.includes(x));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  async function aplicar() {
    setSt('Guardando…');
    try {
      if (!o.demo) await api('plan', { deptos: sel });
      o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, importe_mes: anual ? Math.round(precioAnual(sel.length) / 12) : precioOficina(sel.length), web_incluida: s.negocio.web_incluida || webIncluida(s.negocio.periodo, sel.length), web_estado: s.negocio.web_estado || (webIncluida(s.negocio.periodo, sel.length) ? 'pendiente' : null) }, deptos: sel.map((d) => s.deptos.find((x) => x.depto === d) || { depto: d, cupo_n: DEPTO[d].cupo.n, activo: true, ajustes: {} }) }));
      setSt('Listo. Tu oficina ya está actualizada.'); setConf(false);
    } catch (err) { setSt(err.message); }
  }
  async function portal() { if (o.demo) return; try { const j = await api('portal'); window.location.assign(j.url); } catch (err) { setSt(err.message); } }
  return (
    <div className="vista">
      <Tarjeta titulo="Tus departamentos" extra={<span className="muted">Cambia cuando quieras, se prorratea</span>}>
        <ul className="deps">{DEPARTAMENTOS.map((d) => (
          <li key={d.id}><label className="dep-op"><input type="checkbox" checked={sel.includes(d.id)} onChange={() => toggle(d.id)} /><Avatar depto={d.id} size={34} /><div><b>{d.nombre}</b><small>{fmt(d.cupo.n)} {d.cupo.unidad} al mes</small></div><span className="dep-op__x"><Check size={14} strokeWidth={3} /></span></label></li>
        ))}</ul>
        <div className="plan-pie">
          <p><b>{precio(sel.length || 1)} {ud}</b> <span className="muted">· {sel.length} departamento{sel.length === 1 ? '' : 's'} · sin IVA{anual && !o.negocio.web_incluida && sel.length < WEB_DESDE ? ` · con ${WEB_DESDE} o más, tu web va incluida` : ''}</span></p>
          {cambia && sel.length > 0 && (conf ? <span className="fila-btn"><span className="muted">¿Confirmas el cambio a {precio(sel.length)} {ud}? Se prorratea lo que ya has pagado.</span><button className="btn btn--pri btn--sm" onClick={aplicar}>Sí, cambiar</button><button className="btn btn--fan btn--sm" onClick={() => setConf(false)}>No</button></span>
            : <button className="btn btn--pri" onClick={() => setConf(true)}>Guardar cambios</button>)}
        </div>
        {st && <p className="muted">{st}</p>}
      </Tarjeta>
      {o.negocio.web_incluida && <WebIncluida o={o} />}
      <div className="fila fila--1-1">
        <Tarjeta titulo="Consumo de este mes">
          <div className="cupos">{o.deptos.map((d) => { const u = o.uso[d.depto] || {}; const p = Math.min(1, Math.max(u.pct || 0, (u.unidades_mes || 0) / (d.cupo_n || 1))); return <div key={d.depto}><span>{DEPTO[d.depto].corto}<b>{fmt(u.unidades_mes)} / {fmt(d.cupo_n)}</b></span><Medidor valor={p} color={p >= AVISO_CUPO ? 'var(--aviso)' : DEPTO[d.depto].color} /></div>; })}</div>
          <p className="muted nota">Te avisamos al llegar al 80 %. Nunca te cobramos de más sin que lo sepas.</p>
        </Tarjeta>
        <Tarjeta titulo="Facturación y cuenta">
          <p>Plan {anual ? 'anual' : 'mensual'}: <b>{anual ? `${precioAnual(o.deptos.length)} €/año` : `${o.negocio.importe_mes ?? precioOficina(o.deptos.length)} €/mes`}</b>{o.negocio.prueba_hasta && new Date(o.negocio.prueba_hasta) > new Date(o.ahora) ? <span className="muted"> · prueba gratis hasta el {new Date(o.negocio.prueba_hasta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span> : null}</p>
          <p className="muted">{o.demo ? 'demo@agutidesigns.io' : o.sesion?.user?.email}</p>
          <div className="fila-btn"><button className="btn btn--sec" onClick={portal} disabled={o.demo}><ExternalLink size={15} /> Facturas, tarjeta y baja</button>{!o.demo && <button className="btn btn--fan" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>}</div>
        </Tarjeta>
      </div>
    </div>
  );
}

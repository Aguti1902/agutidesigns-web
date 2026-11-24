// Panel del cliente de la Oficina de IA (/app/:vista) en modo dashboard: resumen con KPIs y gráficas, oficina 3D
// en directo, actividad, estadísticas por departamento, departamentos y cupos, conexiones con un clic,
// datos del negocio y facturación. /app?demo=1 enseña un negocio de ejemplo con actividad simulada.
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowRight, BarChart3, Bell, Box, Check, CircleAlert, Clock, Copy, CreditCard, Layers, LayoutDashboard, LogOut, Mail, Menu, MessageCircle,
  CalendarCheck, Moon, Plug, Search, Sparkles, Star, Store, Timer, TrendingDown, TrendingUp, X, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSeo from '../../hooks/useSeo';
import { DEPARTAMENTOS, DEPTO, AVISO_CUPO, precioOficina } from '../../data/oficinaSaas';
import { useOficina, estadisticas, variacion } from './datos';
import { HERRAMIENTAS, HERRAMIENTA } from './conexiones';
import { BarrasDia, Donut, Calor, Sparkline, Medidor } from './graficos';
import '../../components/oficina/Oficina3D.css';
import './Panel.css';
const Oficina3D = lazy(() => import('../../components/oficina/Oficina3D'));

const fmt = (n, d = 0) => Number(n || 0).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d });
const hora = (d) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const diaLargo = (d) => { const t = new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); return t[0].toUpperCase() + t.slice(1); };

const VISTAS = [
  { id: 'resumen', t: 'Resumen', I: LayoutDashboard },
  { id: 'oficina', t: 'Oficina 3D', I: Box },
  { id: 'actividad', t: 'Actividad', I: Activity },
  { id: 'estadisticas', t: 'Estadísticas', I: BarChart3 },
  { id: 'departamentos', t: 'Departamentos', I: Layers },
  { id: 'conexiones', t: 'Conexiones', I: Plug },
  { id: 'negocio', t: 'Mi negocio', I: Store },
  { id: 'facturacion', t: 'Facturación', I: CreditCard },
];

const CAMPOS = [
  ['sector', 'A qué te dedicas', 'Peluquería y estética'], ['telefono', 'Teléfono de contacto', '600 000 000'], ['direccion', 'Dirección', 'Carrer…, Cornellà de Llobregat'],
  ['horarios', 'Horarios', 'L-V 9:30-20:00 · S 9:00-14:00'], ['precios', 'Servicios y precios que pueden dar los agentes', 'Corte 18 € · Tinte desde 35 €…', true],
  ['tono', 'Cómo hablas con tus clientes', 'Cercano, de tú, con algún emoji'], ['instrucciones', 'Lo que nunca deben hacer o decir', 'No dar descuentos. No prometer horas sin mirar la agenda…', true],
];

// ---------- acceso ----------
function Entrar() {
  const [email, setEmail] = useState(''); const [st, setSt] = useState(''); const [err, setErr] = useState('');
  async function enviar(e) {
    e.preventDefault(); setErr(''); setSt('enviando');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${window.location.origin}/app`, shouldCreateUser: true } });
    if (error) { setErr('No hemos podido enviarte el enlace. Revisa el correo e inténtalo otra vez.'); setSt(''); } else setSt('enviado');
  }
  return (
    <main className="ap-entrar">
      <a href="/" className="ap-logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="120" height="33" /><span>Oficina de IA</span></a>
      <div className="ap-entrar__caja">
        <p className="ap-k"><i /> Tu oficina de IA</p>
        <h1>Entra en tu oficina</h1>
        {st === 'enviado' ? <p className="ap-entrar__ok"><Mail size={18} /> Te hemos enviado un enlace a tu correo. Ábrelo desde este dispositivo para entrar.</p> : (
          <form onSubmit={enviar}>
            <p>Escribe el correo con el que contrataste y te mandamos un enlace para entrar, sin contraseñas.</p>
            <label className="ap-campo"><span>Tu correo</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@negocio.com" /></label>
            <button className="ag-btn ag-btn--primary" disabled={st === 'enviando'}>{st === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}</button>
            {err && <p className="ap-error">{err}</p>}
          </form>
        )}
        <p className="ap-entrar__pie">¿Aún no tienes oficina? <a href="/oficina-ia#precios">Móntala aquí</a> · <a href="/app?demo=1">Ver la demo</a></p>
      </div>
    </main>
  );
}

// ---------- piezas ----------
function Kpi(props) {
  const { I: Icono, t, v, d, serie, color, nota } = props;
  return (
    <article className="db-kpi" style={{ '--c': color }}>
      <header><span className="db-kpi__i"><Icono size={16} /></span>{t}</header>
      <b>{v}</b>
      <footer>
        {d != null ? <span className={`db-delta ${d >= 0 ? 'is-up' : 'is-down'}`}>{d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{d > 0 ? '+' : ''}{d} %</span> : <span className="db-delta">{nota || '—'}</span>}
        {serie && <Sparkline datos={serie} color={color} />}
      </footer>
    </article>
  );
}

function Tarjeta(props) {
  const { t, I: Icono, extra, children, className = '' } = props;
  return (
    <section className={`db-card ${className}`}>
      <header className="db-card__h"><h2>{Icono && <Icono size={17} />}{t}</h2>{extra}</header>
      {children}
    </section>
  );
}

function Evento({ e }) {
  const d = DEPTO[e.depto];
  return (
    <li className={`ap-ev ap-ev--${e.tipo}`} style={{ '--c': d?.color || '#8fb0ff' }}>
      <i /><div><span className="ap-ev__d">{d?.corto || 'Oficina'} · {hora(e.creado)}{e.tipo === 'aviso' ? ' · te necesita' : e.tipo === 'pendiente' ? ' · pendiente de ti' : ''}</span><p>{e.texto}</p></div>
    </li>
  );
}

function OficinaViva({ agentes, api, negocio, alto }) {
  const [sel, setSel] = useState(0); const elegir = useCallback((i) => setSel(i), []);
  const a = agentes[sel] || agentes[0];
  if (!agentes.length) return null;
  return (
    <div className="db-3d" style={alto ? { '--alto': alto } : undefined}>
      <Suspense fallback={<div className="o3-lienzo" />}>
        <Oficina3D agentes={agentes} apiRef={api} onSelect={elegir} seleccionado={sel} titulo={negocio.nombre.slice(0, 22)} auto={false} />
      </Suspense>
      {a && <div className="ap-ficha" style={{ '--c': a.color }}><b>{a.nombre}</b><span>{a.que}</span>
        <div className="o3-chips">{agentes.map((x, i) => <button key={x.id} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}><i style={{ background: x.color }} />{x.corto}</button>)}</div></div>}
    </div>
  );
}

// ---------- vistas ----------
function Resumen({ st, est, dias, eventos, agentes, api, negocio, ir, conexiones, deptos, uso, pasosHechos }) {
  const a = est.act, p = est.prev; const d = (k) => (est.hayPrev ? variacion(a[k], p[k]) : null);
  const ser = (k) => est.serie.map((s) => (k === 'total' ? s.total : s[k] || 0));
  const pend = eventos.filter((e) => e.tipo === 'aviso' || e.tipo === 'pendiente').slice(0, 5);
  const necesarias = HERRAMIENTAS.filter((h) => h.deptos.some((x) => deptos.some((dd) => dd.depto === x)));
  const conectadas = necesarias.filter((h) => conexiones.some((c) => c.herramienta === h.id && c.estado === 'conectada')).length;
  const listo = pasosHechos === CAMPOS.length && conectadas === necesarias.length;
  return (
    <div className="db-vista">
      {!listo && (
        <section className="db-aviso">
          <Zap size={20} />
          <div><b>Termina de poner en marcha tu oficina</b><span>Datos del negocio {pasosHechos}/{CAMPOS.length} · Conexiones {conectadas}/{necesarias.length}</span></div>
          <Medidor valor={pasosHechos + conectadas} max={CAMPOS.length + necesarias.length} color="#e5fc63" />
          <button className="ag-btn ag-btn--primary ag-btn--sm" onClick={() => ir(pasosHechos < CAMPOS.length ? 'negocio' : 'conexiones')}>Continuar <ArrowRight size={15} /></button>
        </section>
      )}
      <div className="db-kpis">
        <Kpi I={Sparkles} t="Tareas hechas" v={fmt(a.total)} d={d('total')} serie={ser('total')} color="#5b8cff" />
        <Kpi I={MessageCircle} t="Clientes atendidos" v={fmt(a.conversaciones)} d={d('conversaciones')} serie={ser('atencion')} color="#3d7bff" />
        <Kpi I={CalendarCheck} t="Citas gestionadas" v={fmt(a.citas)} d={d('citas')} serie={ser('citas')} color="#9d7ff0" />
        <Kpi I={Clock} t="Horas que te ahorra" v={`${fmt(a.minutos / 60)} h`} d={d('minutos')} color="#e5fc63" nota="estimación" />
        <Kpi I={Timer} t="Respuesta media" v={a.respuesta != null ? `${fmt(a.respuesta)} s` : '—'} color="#3ee0a1" nota={a.respuesta != null ? 'a tus clientes' : 'sin datos aún'} />
        <Kpi I={Moon} t="Atendidos fuera de horario" v={fmt(a.fuera)} d={d('fuera')} color="#ff8a6b" />
      </div>
      <div className="db-fila db-fila--2-1">
        <Tarjeta t={`Actividad de los últimos ${dias} días`} I={BarChart3} extra={<button className="db-mas" onClick={() => ir('estadisticas')}>Ver estadísticas <ArrowRight size={14} /></button>}>
          <BarrasDia serie={est.serie} deptos={deptos.map((x) => x.depto)} />
        </Tarjeta>
        <Tarjeta t="Quién hace qué" I={Layers}>
          <Donut partes={est.porDepto.filter((x) => x.n)} centro={fmt(a.total)} sub="tareas" />
        </Tarjeta>
      </div>
      <div className="db-fila db-fila--3-2">
        <Tarjeta t="Tu oficina, en directo" I={Box} extra={<span className="ap-vivo">En vivo</span>} className="db-card--flush">
          <OficinaViva agentes={agentes} api={api} negocio={negocio} alto="420px" />
        </Tarjeta>
        <div className="db-col">
          <Tarjeta t="Te necesitan" I={Bell} extra={<span className="db-chip">{pend.length}</span>}>
            {pend.length ? <ol className="db-lista">{pend.map((e) => <Evento key={e.id} e={e} />)}</ol> : <p className="ap-mute">Nada pendiente. Tus agentes lo tienen todo bajo control.</p>}
          </Tarjeta>
          <Tarjeta t="Lo último" I={Activity} extra={<button className="db-mas" onClick={() => ir('actividad')}>Todo <ArrowRight size={14} /></button>}>
            <ol className="db-lista">{eventos.slice(0, 5).map((e) => <Evento key={e.id} e={e} />)}</ol>
          </Tarjeta>
        </div>
      </div>
      <Tarjeta t="Cupo del mes" I={CircleAlert} extra={<button className="db-mas" onClick={() => ir('departamentos')}>Departamentos <ArrowRight size={14} /></button>}>
        <div className="db-cupos">
          {deptos.map((x) => { const info = DEPTO[x.depto]; const u = uso[x.depto] || {}; const pct = Math.min(1, Math.max(u.pct || 0, (u.unidades_mes || 0) / (x.cupo_n || 1)));
            return <div key={x.depto} className="db-cupo"><span><i style={{ background: info.color }} />{info.corto}<b>{fmt(u.unidades_mes)} / {fmt(x.cupo_n)}</b></span><Medidor valor={pct} color={pct >= AVISO_CUPO ? '#e5fc63' : info.color} /></div>; })}
        </div>
      </Tarjeta>
      {st.demo && <p className="db-nota">Datos de ejemplo de un negocio ficticio.</p>}
    </div>
  );
}

function Estadisticas({ est, deptos, dias }) {
  const a = est.act, p = est.prev; const tiene = (d) => deptos.some((x) => x.depto === d);
  const fila = (k, t) => ({ k, t, a: a[k], p: p[k], d: est.hayPrev ? variacion(a[k], p[k]) : null });
  const tabla = [fila('total', 'Tareas hechas'), tiene('atencion') && fila('conversaciones', 'Clientes atendidos'), tiene('atencion') && fila('fuera', 'Atendidos fuera de horario'),
    tiene('citas') && fila('citas', 'Citas gestionadas'), tiene('ventas') && fila('ventas', 'Gestiones de ventas'), tiene('ventas') && fila('ganados', 'Presupuestos aceptados'),
    tiene('google') && fila('resenas', 'Reseñas respondidas'), tiene('redes') && fila('publicaciones', 'Tareas de redes'), tiene('contenido') && fila('articulos', 'Artículos'),
    fila('avisos', 'Avisos que te han pasado')].filter(Boolean);
  const totCanal = a.canales.whatsapp + a.canales.web || 1;
  const maxTema = est.temas[0]?.[1] || 1;
  return (
    <div className="db-vista">
      <Tarjeta t={`Comparativa: últimos ${dias} días frente a los ${dias} anteriores`} I={BarChart3}>
        <div className="db-tabla-w"><table className="db-tabla"><thead><tr><th>Indicador</th><th>Ahora</th><th>Antes</th><th>Cambio</th></tr></thead>
          <tbody>{tabla.map((r) => <tr key={r.k}><td>{r.t}</td><td><b>{fmt(r.a)}</b></td><td>{est.hayPrev ? fmt(r.p) : '—'}</td><td>{r.d == null ? '—' : <span className={`db-delta ${r.d >= 0 ? 'is-up' : 'is-down'}`}>{r.d > 0 ? '+' : ''}{r.d} %</span>}</td></tr>)}</tbody></table></div>
      </Tarjeta>
      {tiene('atencion') && (
        <div className="db-fila db-fila--2-1">
          <Tarjeta t="Cuándo te escriben tus clientes" I={MessageCircle}><Calor calor={est.calor} /><p className="ap-mute db-pie">Cuanto más intenso, más mensajes. Fuera de tu horario los atiende igual tu departamento de Atención.</p></Tarjeta>
          <div className="db-col">
            <Tarjeta t="Por dónde llegan" I={Plug}>
              <div className="db-barras-h">
                {[['WhatsApp', a.canales.whatsapp, '#25d366'], ['Chat de la web', a.canales.web, '#3d7bff']].map(([t, n, c]) => <div key={t}><span>{t}<b>{fmt(n)} · {Math.round((n / totCanal) * 100)} %</b></span><Medidor valor={n} max={totCanal} color={c} /></div>)}
              </div>
            </Tarjeta>
            <Tarjeta t="Lo que más preguntan" I={Search}>
              {est.temas.length ? <div className="db-barras-h">{est.temas.slice(0, 5).map(([t, n]) => <div key={t}><span>{t[0].toUpperCase() + t.slice(1)}<b>{fmt(n)}</b></span><Medidor valor={n} max={maxTema} color="#5b8cff" /></div>)}</div> : <p className="ap-mute">Aún sin datos.</p>}
            </Tarjeta>
          </div>
        </div>
      )}
      <div className="db-kpis db-kpis--3">
        {tiene('atencion') && <Kpi I={Timer} t="Tiempo medio de respuesta" v={a.respuesta != null ? `${fmt(a.respuesta, 1)} s` : '—'} color="#3ee0a1" nota="por mensaje" />}
        {tiene('google') && <Kpi I={Star} t="Nota media de tus reseñas" v={a.estrellas != null ? `${fmt(a.estrellas, 1)} ★` : '—'} color="#e0a100" nota={`${fmt(a.resenas)} reseñas`} />}
        {tiene('ventas') && <Kpi I={TrendingUp} t="Presupuestos aceptados" v={fmt(a.ganados)} color="#0a8f5a" d={est.hayPrev ? variacion(a.ganados, p.ganados) : null} />}
        {tiene('citas') && <Kpi I={CalendarCheck} t="Citas gestionadas" v={fmt(a.citas)} color="#9d7ff0" d={est.hayPrev ? variacion(a.citas, p.citas) : null} />}
        <Kpi I={Clock} t="Horas que te ahorra" v={`${fmt(a.minutos / 60)} h`} color="#e5fc63" nota="estimación" />
      </div>
      <Tarjeta t="Actividad por día y departamento" I={Activity}><BarrasDia serie={est.serie} deptos={deptos.map((x) => x.depto)} alto={260} /></Tarjeta>
      <p className="db-nota">«Horas que te ahorra» es una estimación: minutos que llevaría a una persona cada tarea (3 min por cliente atendido, 4 por cita, 20 por publicación…).</p>
    </div>
  );
}

function Actividad({ eventos, deptos }) {
  const [f, setF] = useState('todo'); const [q, setQ] = useState(''); const [n, setN] = useState(60);
  const lista = eventos.filter((e) => (f === 'todo' || (f === 'tuyo' ? (e.tipo === 'aviso' || e.tipo === 'pendiente') : e.depto === f)) && (!q || e.texto.toLowerCase().includes(q.toLowerCase())));
  const grupos = []; for (const e of lista.slice(0, n)) { const k = new Date(e.creado).toDateString(); const g = grupos[grupos.length - 1]; if (g && g.k === k) g.e.push(e); else grupos.push({ k, d: e.creado, e: [e] }); }
  return (
    <div className="db-vista">
      <div className="db-filtros">
        <div className="o3-chips" role="group" aria-label="Filtrar">
          {[['todo', 'Todo'], ['tuyo', 'Te necesitan'], ...deptos.map((x) => [x.depto, DEPTO[x.depto].corto])].map(([k, t]) => <button key={k} type="button" aria-pressed={f === k} onClick={() => setF(k)}>{DEPTO[k] && <i style={{ background: DEPTO[k].color }} />}{t}</button>)}
        </div>
        <label className="db-buscar"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en la actividad" /></label>
      </div>
      {grupos.map((g) => (
        <Tarjeta key={g.k} t={diaLargo(g.d)} extra={<span className="db-chip">{g.e.length}</span>}><ol className="db-lista">{g.e.map((e) => <Evento key={e.id} e={e} />)}</ol></Tarjeta>
      ))}
      {!lista.length && <p className="ap-mute">No hay actividad con ese filtro.</p>}
      {lista.length > n && <button className="ag-btn ag-btn--ghost db-cargar" onClick={() => setN(n + 80)}>Ver más</button>}
    </div>
  );
}

function Departamentos({ deptos, uso, demo, negocio, setEstado }) {
  const faltan = DEPARTAMENTOS.filter((x) => !deptos.some((d) => d.depto === x.id));
  async function ajustar(dep, cambios) {
    const nuevo = { ...(dep.ajustes || {}), ...cambios };
    setEstado((e) => ({ ...e, deptos: e.deptos.map((x) => (x.depto === dep.depto ? { ...x, ajustes: nuevo } : x)) }));
    if (!demo) await supabase.from('of_departamentos').update({ ajustes: nuevo }).eq('negocio_id', negocio.id).eq('depto', dep.depto);
  }
  return (
    <div className="db-vista">
      <div className="db-deps">
        {deptos.map((x) => {
          const info = DEPTO[x.depto]; const u = uso[x.depto] || {}; const pct = Math.min(1, Math.max(u.pct || 0, (u.unidades_mes || 0) / (x.cupo_n || 1)));
          const aj = x.ajustes || {};
          return (
            <article key={x.depto} className="db-card db-dep" style={{ '--c': info.color }}>
              <header><i /><b>{info.nombre}</b><span className={`db-estado ${aj.pausado ? 'is-off' : ''}`}>{aj.pausado ? 'En pausa' : 'Trabajando'}</span></header>
              <p className="ap-mute">{info.que}</p>
              <div className="db-cupo db-cupo--grande"><span>Cupo del mes<b>{fmt(u.unidades_mes)} de {fmt(x.cupo_n)} {info.cupo.unidad}</b></span><Medidor valor={pct} color={pct >= AVISO_CUPO ? '#e5fc63' : info.color} /></div>
              {pct >= AVISO_CUPO && <p className="ap-dep__aviso"><CircleAlert size={14} /> Llevas el {Math.round(pct * 100)} % del cupo de este mes</p>}
              <ul className="db-checks">{info.hace.map((h) => <li key={h}><Check size={14} />{h}</li>)}</ul>
              <div className="db-ajustes">
                <label className="db-switch"><input type="checkbox" checked={!!aj.revisar} onChange={(e) => ajustar(x, { revisar: e.target.checked })} /><span />Revisar yo antes de que salga</label>
                <label className="db-switch"><input type="checkbox" checked={!!aj.pausado} onChange={(e) => ajustar(x, { pausado: e.target.checked })} /><span />Pausar este departamento</label>
              </div>
              <p className="db-con">Usa: {HERRAMIENTAS.filter((h) => h.deptos.includes(x.depto)).map((h) => h.nombre).join(' · ')}</p>
            </article>
          );
        })}
      </div>
      {faltan.length > 0 && (<>
        <h2 className="ap-h2">Añade más departamentos</h2>
        <div className="db-deps">
          {faltan.map((info) => (
            <article key={info.id} className="db-card db-dep db-dep--nuevo" style={{ '--c': info.color }}>
              <header><i /><b>{info.nombre}</b></header>
              <p className="ap-mute">{info.que}</p>
              <p className="db-precio">+{precioOficina(deptos.length + 1) - precioOficina(deptos.length)} €/mes · {fmt(info.cupo.n)} {info.cupo.unidad}</p>
              <a className="ag-btn ag-btn--primary ag-btn--sm" href={demo ? '/oficina-ia#precios' : `mailto:info@agutidesigns.io?subject=${encodeURIComponent(`Añadir ${info.nombre} a ${negocio.nombre}`)}`}>Añadir</a>
            </article>
          ))}
        </div>
      </>)}
    </div>
  );
}

function Conexiones({ deptos, conexiones, demo, negocio, setEstado, aviso }) {
  const [ocupado, setOcupado] = useState(''); const [modal, setModal] = useState(null); const [msg, setMsg] = useState(aviso || '');
  const mis = deptos.map((d) => d.depto);
  const lista = [...HERRAMIENTAS].sort((a, b) => Number(b.deptos.some((d) => mis.includes(d))) - Number(a.deptos.some((d) => mis.includes(d))));
  const estadoDe = (id) => conexiones.find((c) => c.herramienta === id);
  const necesarias = lista.filter((h) => h.deptos.some((d) => mis.includes(d)));
  const hechas = necesarias.filter((h) => estadoDe(h.id)?.estado === 'conectada').length;
  const marcar = (id, cuenta) => setEstado((e) => ({ ...e, conexiones: [...e.conexiones.filter((c) => c.herramienta !== id), { herramienta: id, estado: 'conectada', cuenta }] }));

  async function conectar(h, extra) {
    if (h.proveedor === 'snippet' && !extra) { setModal({ h }); return; }
    if (h.proveedor === 'clave' && !extra) { setModal({ h, form: { url: '', usuario: '', clave: '' } }); return; }
    setOcupado(h.id); setMsg('');
    if (demo) { setTimeout(() => { marcar(h.id, h.proveedor === 'clave' ? extra.url : 'Cuenta de ejemplo'); setOcupado(''); setModal(null); setMsg(`${h.nombre} conectado (demo).`); }, 1100); return; }
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch('/api/oficina-conectar', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ herramienta: h.id, ...extra }) });
      const j = await r.json().catch(() => ({}));
      if (j.url) { window.location.assign(j.url); return; }
      if (r.ok && j.conectada) { marcar(h.id, j.cuenta); setModal(null); setMsg(`${h.nombre} conectado.`); }
      else setMsg(j.error || 'No se ha podido conectar. Inténtalo de nuevo.');
    } catch { setMsg('No se ha podido conectar. Inténtalo de nuevo.'); }
    setOcupado('');
  }
  async function desconectar(h) {
    setEstado((e) => ({ ...e, conexiones: e.conexiones.filter((c) => c.herramienta !== h.id) }));
    if (demo) return;
    const { data } = await supabase.auth.getSession();
    await fetch('/api/oficina-conectar', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ herramienta: h.id }) });
  }
  const codigo = `<script src="https://agutidesigns.io/oficina-chat.js" data-oficina="${negocio.id}" async></script>`;
  return (
    <div className="db-vista">
      <section className="db-aviso db-aviso--azul">
        <Plug size={20} />
        <div><b>{hechas} de {necesarias.length} conexiones que necesitan tus departamentos</b><span>Pulsa «Conectar», inicia sesión en la herramienta y acepta los permisos. Nada más.</span></div>
        <Medidor valor={hechas} max={necesarias.length || 1} color="#e5fc63" />
      </section>
      {msg && <p className="db-msg" role="status">{msg}<button onClick={() => setMsg('')} aria-label="Cerrar"><X size={14} /></button></p>}
      <div className="db-conex">
        {lista.map((h) => {
          const c = estadoDe(h.id); const usa = h.deptos.filter((d) => mis.includes(d)); const on = c?.estado === 'conectada';
          return (
            <article key={h.id} className={`db-card db-tool ${on ? 'is-on' : ''} ${usa.length ? '' : 'is-opc'}`}>
              <header><span className="db-tool__logo" style={{ background: h.color }}>{h.letra}</span><div><b>{h.nombre}</b><small>{usa.length ? `La usa${usa.length > 1 ? 'n' : ''}: ${usa.map((d) => DEPTO[d].corto).join(', ')}` : 'Opcional'}</small></div></header>
              <p className="ap-mute">{h.que}</p>
              {on ? (
                <footer><span className="db-ok"><Check size={14} strokeWidth={3} /> {c.cuenta || 'Conectada'}</span><button className="db-link" onClick={() => desconectar(h)}>Desconectar</button></footer>
              ) : (
                <footer><button className="ag-btn ag-btn--primary ag-btn--sm" disabled={ocupado === h.id} onClick={() => conectar(h)}>{ocupado === h.id ? 'Conectando…' : 'Conectar'}</button></footer>
              )}
            </article>
          );
        })}
      </div>
      {modal && (
        <div className="db-modal" role="dialog" aria-modal="true" aria-label={modal.h.nombre} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="db-modal__caja">
            <header><b>{modal.h.nombre}</b><button className="db-link" onClick={() => setModal(null)} aria-label="Cerrar"><X size={18} /></button></header>
            {modal.h.proveedor === 'snippet' ? (<>
              <p className="ap-mute">Pega este código en tu web, justo antes de <code>&lt;/body&gt;</code>. Si tu web la llevamos nosotros, lo hacemos por ti.</p>
              <pre className="db-code">{codigo}</pre>
              <div className="ap-fila">
                <button className="ag-btn ag-btn--primary ag-btn--sm" onClick={() => { navigator.clipboard?.writeText(codigo).then(() => setMsg('Código copiado.'), () => {}); }}><Copy size={14} /> Copiar código</button>
                <button className="ag-btn ag-btn--ghost ag-btn--sm" onClick={() => conectar(modal.h, { instalado: true })}>Ya lo he pegado</button>
              </div>
            </>) : (
              <form className="db-form" onSubmit={(e) => { e.preventDefault(); conectar(modal.h, modal.form); }}>
                <p className="ap-mute">En tu WordPress ve a Usuarios → Perfil → Contraseñas de aplicación, crea una llamada «Oficina de IA» y pégala aquí. Se guarda cifrada.</p>
                {[['url', 'Dirección de tu web', 'https://tuweb.com'], ['usuario', 'Usuario de WordPress', 'admin'], ['clave', 'Contraseña de aplicación', 'xxxx xxxx xxxx xxxx']].map(([k, l, ph]) => (
                  <label key={k} className="ap-campo"><span>{l}</span><input required value={modal.form[k]} placeholder={ph} type={k === 'clave' ? 'password' : 'text'} onChange={(e) => setModal({ ...modal, form: { ...modal.form, [k]: e.target.value } })} /></label>
                ))}
                <button className="ag-btn ag-btn--primary ag-btn--sm" disabled={ocupado === modal.h.id}>{ocupado === modal.h.id ? 'Conectando…' : 'Conectar'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiNegocio({ negocio, demo, setEstado }) {
  const [form, setForm] = useState(negocio); const [st, setSt] = useState('');
  async function guardar(e) {
    e.preventDefault();
    const cambios = Object.fromEntries(CAMPOS.map(([k]) => [k, (form[k] || '').trim()]));
    if (!demo) { setSt('Guardando…'); const { error } = await supabase.from('of_negocios').update(cambios).eq('id', negocio.id); if (error) { setSt('No se ha podido guardar.'); return; } }
    setEstado((s) => ({ ...s, negocio: { ...s.negocio, ...cambios } })); setSt(demo ? 'Guardado (en la demo no se guarda de verdad)' : 'Guardado');
  }
  return (
    <div className="db-vista">
      <Tarjeta t="Lo que saben tus agentes de tu negocio" I={Store}>
        <p className="ap-mute">Tus agentes solo usan lo que pongas aquí: nunca se inventan precios, horarios ni promociones. Cuanto más completo, mejor trabajan.</p>
        <form className="db-form db-form--2" onSubmit={guardar}>
          {CAMPOS.map(([k, l, ph, largo]) => (
            <label key={k} className={`ap-campo ${largo ? 'is-ancho' : ''}`}><span>{l} {String(negocio[k] || '').trim() ? <Check size={13} className="db-ok-i" /> : null}</span>
              {largo ? <textarea rows={4} value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
            </label>
          ))}
          <div className="ap-fila is-ancho"><button className="ag-btn ag-btn--primary">Guardar</button>{st && <small className="ap-mute">{st}</small>}</div>
        </form>
      </Tarjeta>
    </div>
  );
}

function Facturacion({ negocio, deptos, uso, demo, portal }) {
  return (
    <div className="db-vista">
      <div className="db-fila db-fila--1-1">
        <Tarjeta t="Tu plan" I={CreditCard}>
          <p className="db-plan"><b>{negocio.importe_mes ?? precioOficina(deptos.length)} €</b>/mes · {deptos.length} departamento{deptos.length === 1 ? '' : 's'}</p>
          <ul className="db-checks">{deptos.map((d) => <li key={d.depto}><Check size={14} />{DEPTO[d.depto].nombre} · {fmt(d.cupo_n)} {DEPTO[d.depto].cupo.unidad}/mes</li>)}</ul>
          <p className="ap-mute">Sin permanencia. Precios sin IVA.</p>
          <button className="ag-btn ag-btn--primary ag-btn--sm" onClick={portal} disabled={demo}>Facturas, tarjeta y baja</button>
          {demo && <p className="ap-mute">En la demo no hay facturas.</p>}
        </Tarjeta>
        <Tarjeta t="Consumo de IA este mes" I={Zap}>
          <p className="ap-mute">Cada departamento tiene su presupuesto de IA incluido. Te avisamos al 80 % y nunca te cobramos de más sin que lo sepas.</p>
          <div className="db-cupos">{deptos.map((d) => { const p = uso[d.depto]?.pct || 0; return <div key={d.depto} className="db-cupo"><span><i style={{ background: DEPTO[d.depto].color }} />{DEPTO[d.depto].corto}<b>{Math.round(p * 100)} %</b></span><Medidor valor={p} color={p >= AVISO_CUPO ? '#e5fc63' : DEPTO[d.depto].color} /></div>; })}</div>
        </Tarjeta>
      </div>
    </div>
  );
}

// ---------- panel ----------
export default function Panel() {
  const qs = new URLSearchParams(window.location.search);
  const demo = qs.has('demo');
  const { vista: v } = useParams(); const vista = VISTAS.some((x) => x.id === v) ? v : 'resumen';
  const nav = useNavigate();
  const ir = (id) => { nav(`/app/${id}${demo ? '?demo=1' : ''}`); window.scrollTo(0, 0); };
  useSeo({ title: demo ? 'Demo del panel · Oficina de IA | Agutidesigns' : 'Tu oficina de IA | Agutidesigns', description: 'Panel de tu oficina de IA.', path: '/app', noindex: true });
  const [estado, setEstado] = useOficina(demo);
  const { cargando, sesion, negocio, deptos, uso, eventos, conexiones } = estado;
  const [dias, setDias] = useState(30); const [menu, setMenu] = useState(false);
  const api = useRef(null); const visto = useRef(new Set());
  const agentes = useMemo(() => deptos.map((d) => ({ ...DEPTO[d.depto], nombre: DEPTO[d.depto].corto })), [deptos]);
  const idx = useMemo(() => Object.fromEntries(deptos.map((d, i) => [d.depto, i])), [deptos]);
  const est = useMemo(() => estadisticas(eventos || [], dias, deptos.map((d) => d.depto)), [eventos, dias, deptos]);
  const aviso = qs.get('conectado') ? `${HERRAMIENTA[qs.get('conectado')]?.nombre || 'Herramienta'} conectada.` : qs.get('error_conexion') ? 'No se ha completado la conexión. Inténtalo de nuevo.' : '';

  useEffect(() => {
    const nuevos = (eventos || []).filter((f) => !visto.current.has(f.id)); const primera = visto.current.size === 0;
    nuevos.forEach((f) => visto.current.add(f.id)); if (primera) return;
    nuevos.slice(0, 4).forEach((f, k) => setTimeout(() => api.current?.aviso(idx[f.depto] ?? -1, f.texto), k * 400));
  }, [eventos, idx]);

  useEffect(() => {
    if (!demo) return undefined;
    const plant = [['atencion', 'hecho', 'Ha contestado a Laura por WhatsApp: precio de mechas', { canal: 'whatsapp', ms: 6200, tema: 'precios' }], ['citas', 'hecho', 'Ha dado cita a Jordi el jueves a las 17:00', {}],
      ['google', 'hecho', 'Ha respondido una reseña de 5 estrellas de Núria', { estrellas: 5 }], ['atencion', 'hecho', 'Ha contestado a Marc por el chat de la web: ¿abrís el lunes?', { canal: 'web', ms: 4100, tema: 'horarios' }],
      ['ventas', 'hecho', 'Ha enviado el seguimiento de los 2 días a Carla', { resultado: 'abierto' }], ['redes', 'pendiente', 'Post del sábado listo: «Recogidos de fiesta». Esperando tu aprobación', {}]];
    let n = 0;
    const id = setInterval(() => {
      const [depto, tipo, texto, detalle] = plant[n % plant.length]; n += 1;
      setEstado((e) => ({ ...e, eventos: [{ id: `v${n}-${Date.now()}`, depto, tipo, texto, detalle, creado: new Date().toISOString() }, ...e.eventos],
        uso: { ...e.uso, [depto]: { ...e.uso[depto], unidades_mes: (e.uso[depto]?.unidades_mes || 0) + 1 } } }));
    }, 4500);
    return () => clearInterval(id);
  }, [demo, setEstado]);

  async function portal() {
    if (demo) return;
    const { data } = await supabase.auth.getSession();
    const r = await fetch('/api/oficina-portal', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    const j = await r.json().catch(() => ({})); if (j.url) window.location.assign(j.url);
  }

  if (cargando) return <main className="ap-carga"><span className="ap-spin" /> Abriendo tu oficina…</main>;
  if (!demo && !sesion) return <Entrar />;
  if (!demo && !negocio) {
    return (
      <main className="ap-entrar"><div className="ap-entrar__caja">
        <h1>No encontramos tu oficina</h1>
        <p>Has entrado con <b>{sesion.user.email}</b>, pero no hay ninguna oficina a ese correo. Si la contrataste con otro, sal y entra con ese.</p>
        <div className="ap-fila"><a className="ag-btn ag-btn--primary" href="/oficina-ia#precios">Montar mi oficina</a><button className="ag-btn ag-btn--ghost" onClick={() => supabase.auth.signOut()}>Salir</button></div>
      </div></main>
    );
  }

  const pend = (eventos || []).filter((e) => e.tipo === 'aviso' || e.tipo === 'pendiente').length;
  const pasosHechos = CAMPOS.filter(([k]) => String(negocio[k] || '').trim()).length;
  const necesarias = HERRAMIENTAS.filter((h) => h.deptos.some((x) => deptos.some((d) => d.depto === x)));
  const conectadas = necesarias.filter((h) => conexiones.some((c) => c.herramienta === h.id && c.estado === 'conectada')).length;
  const activo = negocio.estado === 'activo';
  const insignia = { actividad: pend || null, conexiones: necesarias.length - conectadas || null, negocio: CAMPOS.length - pasosHechos || null };
  const titulo = VISTAS.find((x) => x.id === vista).t;
  const props = { st: { demo }, est, dias, eventos: eventos || [], agentes, api, negocio, ir, conexiones, deptos, uso, pasosHechos, demo, setEstado, portal };

  return (
    <div className={`db ${menu ? 'is-menu' : ''}`}>
      {demo && <div className="ap-demo">Demo con un negocio de ejemplo y actividad simulada. <a href="/oficina-ia#precios">Monta la tuya <ArrowRight size={14} /></a></div>}
      <aside className="db-side">
        <div className="db-side__top">
          <a href="/" className="ap-logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="120" height="33" /></a>
          <button className="db-side__x" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>
        <div className="db-neg"><span className="db-neg__av">{negocio.nombre.slice(0, 1)}</span><div><b>{negocio.nombre}</b><small><i className={activo ? '' : 'is-off'} />{activo ? 'Oficina en marcha' : negocio.estado === 'impago' ? 'Pago pendiente' : 'Pausada'}</small></div></div>
        <nav className="db-nav" aria-label="Secciones">
          {/* eslint-disable-next-line no-unused-vars */}
          {VISTAS.map(({ id, t, ...x }) => (
            <button key={id} type="button" className={vista === id ? 'is-on' : ''} aria-current={vista === id ? 'page' : undefined} onClick={() => { ir(id); setMenu(false); }}>
              <x.I size={18} />{t}{insignia[id] ? <em>{insignia[id]}</em> : null}
            </button>
          ))}
        </nav>
        <div className="db-side__pie">
          <span>{demo ? 'demo@agutidesigns.io' : sesion.user.email}</span>
          {!demo && <button className="ap-link" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> Salir</button>}
        </div>
      </aside>
      <div className="db-velo" onClick={() => setMenu(false)} aria-hidden="true" />
      <div className="db-main">
        <header className="db-top">
          <button className="db-burger" onClick={() => setMenu(true)} aria-label="Abrir menú"><Menu size={22} /></button>
          <div className="db-top__t"><h1>{titulo}</h1><span>{diaLargo(new Date())} · <i className="db-punto" /> en directo</span></div>
          {(vista === 'resumen' || vista === 'estadisticas') && (
            <div className="db-periodo" role="group" aria-label="Periodo">{[7, 14, 30].map((d) => <button key={d} type="button" aria-pressed={dias === d} onClick={() => setDias(d)}>{d} días</button>)}</div>
          )}
          <button className="db-campana" onClick={() => ir('actividad')} aria-label={`${pend} avisos`}><Bell size={19} />{pend > 0 && <em>{pend > 9 ? '9+' : pend}</em>}</button>
        </header>
        <main className="db-cont">
          {vista === 'resumen' && <Resumen {...props} />}
          {vista === 'oficina' && (
            <div className="db-vista db-fila db-fila--3-2">
              <Tarjeta t="Tu oficina, en directo" I={Box} extra={<span className="ap-vivo">En vivo</span>} className="db-card--flush"><OficinaViva agentes={agentes} api={api} negocio={negocio} alto="clamp(420px, 62vh, 680px)" /></Tarjeta>
              <Tarjeta t="Lo que están haciendo" I={Sparkles} className="db-card--scroll"><ol className="db-lista">{(eventos || []).slice(0, 25).map((e) => <Evento key={e.id} e={e} />)}</ol></Tarjeta>
            </div>
          )}
          {vista === 'actividad' && <Actividad eventos={eventos || []} deptos={deptos} />}
          {vista === 'estadisticas' && <Estadisticas est={est} deptos={deptos} dias={dias} />}
          {vista === 'departamentos' && <Departamentos {...props} />}
          {vista === 'conexiones' && <Conexiones {...props} aviso={aviso} />}
          {vista === 'negocio' && <MiNegocio {...props} />}
          {vista === 'facturacion' && <Facturacion {...props} />}
        </main>
      </div>
    </div>
  );
}

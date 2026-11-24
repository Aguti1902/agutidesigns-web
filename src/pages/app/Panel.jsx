// Panel del cliente de la Oficina de IA (/app): su oficina 3D con los departamentos que paga, lo que hacen
// los agentes en directo, el cupo de cada departamento y la puesta en marcha guiada.
// /app?demo=1 enseña un negocio de ejemplo con actividad simulada (no son datos reales).
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, LogOut, Mail, Plug, Settings2, Sparkles, Bell, CircleAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSeo from '../../hooks/useSeo';
import { DEPARTAMENTOS, DEPTO, AVISO_CUPO } from '../../data/oficinaSaas';
import '../../components/oficina/Oficina3D.css';
import './Panel.css';
const Oficina3D = lazy(() => import('../../components/oficina/Oficina3D'));

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');
const hora = (d) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

// ---------- datos de ejemplo (modo demo) ----------
const DEMO_DEPTOS = ['atencion', 'citas', 'redes', 'google'];
const DEMO_NEG = { id: 'demo', nombre: 'Peluquería Marta', owner_email: 'demo@agutidesigns.io', estado: 'activo', importe_mes: 169, sector: 'Peluquería', telefono: '600 000 000', direccion: 'Cornellà de Llobregat', horarios: 'L-V 9:30-20:00 · S 9:00-14:00', precios: '', tono: '', instrucciones: '' };
const DEMO_USO = { atencion: [312, 0.58], citas: [141, 0.44], redes: [19, 0.61], google: [27, 0.83] };
const DEMO_FEED = [
  ['atencion', 'hecho', 'Ha contestado a Laura por WhatsApp: precio de mechas y horario del sábado'],
  ['citas', 'hecho', 'Ha dado cita a Jordi el jueves a las 17:00 y le ha mandado la confirmación'],
  ['google', 'hecho', 'Ha respondido una reseña de 5 estrellas de Núria'],
  ['atencion', 'aviso', 'Un cliente quiere hablar contigo sobre un tratamiento para novia'],
  ['redes', 'pendiente', 'Post del viernes listo: «Nuevo color de temporada». Esperando tu aprobación'],
  ['citas', 'hecho', 'Ha enviado 9 recordatorios para las citas de mañana'],
  ['atencion', 'hecho', 'Ha contestado a Marc por el chat de la web: ¿abrís el lunes?'],
  ['google', 'hecho', 'Ha publicado la oferta de diciembre en tu ficha de Google'],
  ['redes', 'hecho', 'Ha programado 3 publicaciones para la semana que viene'],
  ['citas', 'hecho', 'Ha recolocado la cita cancelada de las 12:00 con una clienta en espera'],
];

// ---------- carga de datos reales ----------
function estadoDemo() {
  const ahora = Date.now();
  return { cargando: false, sesion: null, negocio: DEMO_NEG,
    deptos: DEMO_DEPTOS.map((d) => ({ depto: d, cupo_n: DEPTO[d].cupo.n, activo: true })),
    uso: Object.fromEntries(DEMO_DEPTOS.map((d) => [d, { unidades_mes: DEMO_USO[d][0], pct: DEMO_USO[d][1] }])),
    feed: DEMO_FEED.slice(0, 5).map(([depto, tipo, texto], i) => ({ id: `d${i}`, depto, tipo, texto, creado: new Date(ahora - (i + 1) * 7 * 60000).toISOString() })) };
}

function useOficina(demo) {
  const [estado, setEstado] = useState(() => (demo ? estadoDemo() : { cargando: true, sesion: null, negocio: null, deptos: [], uso: {}, feed: [] }));
  useEffect(() => {
    if (demo) return undefined;
    let canal; let vivo = true;
    async function cargar(sesion) {
      if (!sesion) { setEstado((e) => ({ ...e, cargando: false, sesion: null })); return; }
      const { data: negs } = await supabase.from('of_negocios').select('*').order('created_at', { ascending: false }).limit(1);
      const negocio = negs?.[0] || null;
      if (!negocio) { setEstado((e) => ({ ...e, cargando: false, sesion, negocio: null })); return; }
      const [{ data: deptos }, { data: uso }, { data: feed }] = await Promise.all([
        supabase.from('of_departamentos').select('*').eq('negocio_id', negocio.id).eq('activo', true),
        supabase.from('of_uso_mes').select('*').eq('negocio_id', negocio.id),
        supabase.from('of_actividad').select('*').eq('negocio_id', negocio.id).order('creado', { ascending: false }).limit(40),
      ]);
      if (!vivo) return;
      const orden = DEPARTAMENTOS.map((d) => d.id);
      setEstado({ cargando: false, sesion, negocio,
        deptos: (deptos || []).sort((a, b) => orden.indexOf(a.depto) - orden.indexOf(b.depto)),
        uso: Object.fromEntries((uso || []).map((u) => [u.depto, { unidades_mes: u.unidades_mes, pct: u.tokens_mes ? u.tokens_usados / u.tokens_mes : 0 }])),
        feed: feed || [] });
      canal = supabase.channel(`actividad-${negocio.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'of_actividad', filter: `negocio_id=eq.${negocio.id}` },
          (p) => setEstado((e) => ({ ...e, feed: [p.new, ...e.feed].slice(0, 60) })))
        .subscribe();
    }
    supabase.auth.getSession().then(({ data }) => cargar(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') cargar(s); });
    return () => { vivo = false; sub.subscription.unsubscribe(); if (canal) supabase.removeChannel(canal); };
  }, [demo]);
  return [estado, setEstado];
}

// ---------- entrar ----------
function Entrar({ aviso }) {
  const [email, setEmail] = useState('');
  const [st, setSt] = useState(aviso ? 'enviado' : '');
  const [err, setErr] = useState('');
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
        {st === 'enviado' ? (
          <p className="ap-entrar__ok"><Mail size={18} /> {aviso || 'Te hemos enviado un enlace a tu correo.'} Ábrelo desde este dispositivo para entrar.</p>
        ) : (
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

// ---------- puesta en marcha ----------
const PASOS = [
  { id: 'negocio', t: 'Tu negocio', campos: [['sector', 'A qué te dedicas', 'Peluquería y estética'], ['telefono', 'Teléfono de contacto', '600 000 000'], ['direccion', 'Dirección', 'Carrer…, Cornellà de Llobregat']] },
  { id: 'horario', t: 'Horarios y precios', campos: [['horarios', 'Horarios', 'L-V 9:30-20:00 · S 9:00-14:00'], ['precios', 'Servicios y precios que pueden dar los agentes', 'Corte 18 € · Tinte desde 35 €…', true]] },
  { id: 'tono', t: 'Tu forma de hablar', campos: [['tono', 'Cómo hablas con tus clientes', 'Cercano, de tú, con algún emoji'], ['instrucciones', 'Lo que nunca deben hacer o decir', 'No dar descuentos. No prometer horas sin mirar la agenda…', true]] },
];
const pasoHecho = (neg, p) => p.campos.every(([k]) => String(neg?.[k] || '').trim());

function PuestaEnMarcha({ negocio, deptos, demo, onGuardado }) {
  const [abierto, setAbierto] = useState(() => PASOS.find((p) => !pasoHecho(negocio, p))?.id || null);
  const [form, setForm] = useState(negocio);
  const [st, setSt] = useState('');
  const conexiones = [...new Set(deptos.flatMap((d) => DEPTO[d.depto]?.conexiones || []))];
  const hechos = PASOS.filter((p) => pasoHecho(negocio, p)).length;
  async function guardar(p) {
    const cambios = Object.fromEntries(p.campos.map(([k]) => [k, (form[k] || '').trim()]));
    if (demo) { onGuardado(cambios); setSt('Guardado (en la demo no se guarda de verdad)'); return; }
    setSt('Guardando…');
    const { error } = await supabase.from('of_negocios').update(cambios).eq('id', negocio.id);
    if (error) { setSt('No se ha podido guardar. Inténtalo otra vez.'); return; }
    onGuardado(cambios); setSt('Guardado'); setAbierto(PASOS.find((x) => x.id !== p.id && !pasoHecho({ ...negocio, ...cambios }, x))?.id || null);
  }
  return (
    <section className="ap-card ap-puesta" id="puesta">
      <header className="ap-card__h"><h2><Settings2 size={18} /> Puesta en marcha</h2><span className="ap-prog"><b style={{ width: `${(hechos / (PASOS.length + 1)) * 100}%` }} /></span><small>{hechos} de {PASOS.length + 1}</small></header>
      <p className="ap-mute">Cuanto mejor conozcan tus agentes tu negocio, mejor trabajan. Solo usan lo que pongas aquí: nunca se inventan precios ni horarios.</p>
      <ol className="ap-pasos">
        {PASOS.map((p) => {
          const ok = pasoHecho(negocio, p);
          return (
            <li key={p.id} className={`ap-paso ${ok ? 'is-ok' : ''} ${abierto === p.id ? 'is-open' : ''}`}>
              <button type="button" className="ap-paso__h" onClick={() => setAbierto(abierto === p.id ? null : p.id)} aria-expanded={abierto === p.id}>
                <span className="ap-paso__n">{ok ? <Check size={14} strokeWidth={3} /> : PASOS.indexOf(p) + 1}</span>{p.t}<em>{ok ? 'Hecho' : 'Pendiente'}</em>
              </button>
              {abierto === p.id && (
                <form className="ap-paso__f" onSubmit={(e) => { e.preventDefault(); guardar(p); }}>
                  {p.campos.map(([k, l, ph, largo]) => (
                    <label key={k} className="ap-campo"><span>{l}</span>
                      {largo ? <textarea rows={3} value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                        : <input value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
                    </label>
                  ))}
                  <div className="ap-fila"><button className="ag-btn ag-btn--primary ag-btn--sm">Guardar</button>{st && <small className="ap-mute">{st}</small>}</div>
                </form>
              )}
            </li>
          );
        })}
        <li className={`ap-paso ${abierto === 'conectar' ? 'is-open' : ''}`}>
          <button type="button" className="ap-paso__h" onClick={() => setAbierto(abierto === 'conectar' ? null : 'conectar')} aria-expanded={abierto === 'conectar'}>
            <span className="ap-paso__n">{PASOS.length + 1}</span>Conecta tus cuentas<em>Pendiente</em>
          </button>
          {abierto === 'conectar' && (
            <div className="ap-paso__f">
              <ul className="ap-conex">{conexiones.map((c) => <li key={c}><Plug size={15} />{c}<span>Por conectar</span></li>)}</ul>
              <p className="ap-mute">Estamos activando la conexión automática. Mientras, escríbenos a <b>info@agutidesigns.io</b> y lo conectamos contigo en una videollamada corta.</p>
            </div>
          )}
        </li>
      </ol>
    </section>
  );
}

// ---------- panel ----------
export default function Panel() {
  const demo = new URLSearchParams(window.location.search).has('demo');
  useSeo({ title: demo ? 'Demo del panel · Oficina de IA | Agutidesigns' : 'Tu oficina de IA | Agutidesigns', description: 'Panel de tu oficina de IA: tus departamentos trabajando en directo.', path: '/app', noindex: true });
  const [{ cargando, sesion, negocio, deptos, uso, feed }, setEstado] = useOficina(demo);
  const [sel, setSel] = useState(0);
  const api = useRef(null);
  const visto = useRef(new Set());

  const agentes = useMemo(() => deptos.map((d) => ({ ...DEPTO[d.depto], nombre: DEPTO[d.depto].corto })), [deptos]);
  const idx = useMemo(() => Object.fromEntries(deptos.map((d, i) => [d.depto, i])), [deptos]);
  const elegir = useCallback((i) => setSel(i), []);

  // cada actividad nueva viaja de su mesa al panel en la oficina 3D
  useEffect(() => {
    const nuevos = feed.filter((f) => !visto.current.has(f.id));
    const primera = visto.current.size === 0;
    nuevos.forEach((f) => visto.current.add(f.id));
    if (primera) return;
    nuevos.forEach((f, k) => setTimeout(() => api.current?.aviso(idx[f.depto] ?? -1, f.texto), k * 400));
  }, [feed, idx]);

  // demo: actividad simulada cada pocos segundos
  useEffect(() => {
    if (!demo) return undefined;
    let n = 5;
    const id = setInterval(() => {
      const [depto, tipo, texto] = DEMO_FEED[n % DEMO_FEED.length]; n += 1;
      setEstado((e) => ({ ...e, feed: [{ id: `d${n}-${Date.now()}`, depto, tipo, texto, creado: new Date().toISOString() }, ...e.feed].slice(0, 30),
        uso: { ...e.uso, [depto]: { ...e.uso[depto], unidades_mes: (e.uso[depto]?.unidades_mes || 0) + 1 } } }));
    }, 4200);
    return () => clearInterval(id);
  }, [demo, setEstado]);

  async function portal() {
    if (demo) return;
    const { data } = await supabase.auth.getSession();
    const r = await fetch('/api/oficina-portal', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    const j = await r.json().catch(() => ({}));
    if (j.url) window.location.href = j.url;
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

  const a = agentes[sel] || agentes[0];
  const pendientes = feed.filter((f) => f.tipo === 'aviso' || f.tipo === 'pendiente').slice(0, 3);
  const activo = negocio.estado === 'activo';

  return (
    <div className="ap">
      {demo && <div className="ap-demo">Estás viendo una demo con un negocio de ejemplo y actividad simulada. <a href="/oficina-ia#precios">Monta la tuya <ArrowRight size={14} /></a></div>}
      <header className="ap-top">
        <div className="ap-wrap ap-top__in">
          <a href="/" className="ap-logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="120" height="33" /><span>Oficina de IA</span></a>
          <div className="ap-top__neg"><b>{negocio.nombre}</b><span className={`ap-estado ${activo ? '' : 'is-off'}`}>{activo ? 'En marcha' : negocio.estado === 'impago' ? 'Pago pendiente' : 'Pausada'}</span></div>
          <nav className="ap-top__acc">
            {!demo && <button type="button" onClick={portal} className="ap-link">Suscripción y facturas</button>}
            {!demo && <button type="button" onClick={() => supabase.auth.signOut()} className="ap-link" aria-label="Salir"><LogOut size={16} /></button>}
          </nav>
        </div>
      </header>

      <main className="ap-wrap ap-main">
        <section className="ap-hero">
          <div>
            <p className="ap-k"><i /> En directo · {hora(new Date())}</p>
            <h1>Tu oficina de IA</h1>
            <p className="ap-mute">{deptos.length} departamento{deptos.length === 1 ? '' : 's'} trabajando para {negocio.nombre}{negocio.importe_mes ? ` · ${negocio.importe_mes} €/mes` : ''}</p>
          </div>
          {pendientes.length > 0 && (
            <ul className="ap-alertas">{pendientes.map((p) => <li key={p.id}><Bell size={15} /><span>{p.texto}</span></li>)}</ul>
          )}
        </section>

        <div className="ap-grid">
          <section className="ap-card ap-3d">
            <Suspense fallback={<div className="o3-lienzo" />}>
              {agentes.length > 0 && <Oficina3D agentes={agentes} apiRef={api} onSelect={elegir} seleccionado={sel} titulo={negocio.nombre.slice(0, 22)} auto={false} />}
            </Suspense>
            {a && (
              <div className="ap-ficha" style={{ '--c': a.color }}>
                <b>{a.nombre}</b><span>{a.que}</span>
                <div className="o3-chips">{agentes.map((x, i) => <button key={x.id} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}><i style={{ background: x.color }} />{x.corto}</button>)}</div>
              </div>
            )}
          </section>

          <section className="ap-card ap-feed" aria-live="polite">
            <header className="ap-card__h"><h2><Sparkles size={18} /> Lo que están haciendo</h2><span className="ap-vivo">En vivo</span></header>
            {feed.length === 0 ? <p className="ap-mute">Aún no hay actividad. En cuanto termines la puesta en marcha, aquí verás cada cosa que hagan tus agentes.</p> : (
              <ol>
                {feed.slice(0, 14).map((f) => {
                  const d = DEPTO[f.depto];
                  return (
                    <li key={f.id} className={`ap-ev ap-ev--${f.tipo}`} style={{ '--c': d?.color || '#8fb0ff' }}>
                      <i /><div><span className="ap-ev__d">{d?.corto || 'Oficina'} · {hora(f.creado)}{f.tipo === 'aviso' ? ' · te necesita' : f.tipo === 'pendiente' ? ' · pendiente de ti' : ''}</span><p>{f.texto}</p></div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <section className="ap-deptos">
          <h2 className="ap-h2">Tus departamentos y su cupo del mes</h2>
          <div className="ap-deptos__grid">
            {deptos.map((d) => {
              const info = DEPTO[d.depto]; const u = uso[d.depto] || {};
              const pct = Math.min(1, Math.max(u.pct || 0, (u.unidades_mes || 0) / (d.cupo_n || 1)));
              const alto = pct >= AVISO_CUPO;
              return (
                <article key={d.depto} className="ap-card ap-dep" style={{ '--c': info.color }}>
                  <header><i /><b>{info.nombre}</b></header>
                  <p className="ap-dep__n"><b>{fmt(u.unidades_mes)}</b> de {fmt(d.cupo_n)} {info.cupo.unidad}</p>
                  <span className={`ap-barra ${alto ? 'is-alto' : ''}`}><b style={{ width: `${pct * 100}%` }} /></span>
                  {alto && <p className="ap-dep__aviso"><CircleAlert size={14} /> Llevas el {Math.round(pct * 100)} % del cupo de este mes</p>}
                  <ul>{info.hace.map((h) => <li key={h}><Check size={14} />{h}</li>)}</ul>
                </article>
              );
            })}
            <a className="ap-card ap-dep ap-dep--mas" href={demo ? '/oficina-ia#precios' : 'mailto:info@agutidesigns.io?subject=A%C3%B1adir%20departamento%20a%20mi%20oficina'}>
              <b>+ Añadir departamento</b><span>{DEPARTAMENTOS.filter((x) => !deptos.some((d) => d.depto === x.id)).map((x) => x.corto).join(' · ') || 'Ya tienes todos'}</span>
            </a>
          </div>
        </section>

        <PuestaEnMarcha negocio={negocio} deptos={deptos} demo={demo} onGuardado={(c) => setEstado((e) => ({ ...e, negocio: { ...e.negocio, ...c } }))} />
      </main>
    </div>
  );
}

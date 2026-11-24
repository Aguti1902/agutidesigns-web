// Panel del cliente de la Oficina de IA (/app/:vista). Minimalista y en directo: el equipo de agentes trabajando,
// lo que te necesita, conversaciones, actividad, estadísticas, lo que saben tus agentes, conexiones y ajustes.
// /app?demo=1 enseña un negocio de ejemplo con actividad simulada.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, BarChart3, BookOpen, Home, LogOut, Mail, Menu, MessageCircle, Plug, Settings, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useSeo from '../../hooks/useSeo';
import { DEPTO } from '../../data/oficinaSaas';
import { useOficina, estadisticas, pendiente } from './datos';
import { HERRAMIENTA } from './conexiones';
import { Inicio, Conversaciones, Actividad, Estadisticas, Ensenar, Conexiones, Ajustes } from './vistas';
import { CAMPOS } from './formato';
import '../../components/oficina/Oficina3D.css';
import './Panel.css';

const VISTAS = [
  { id: 'inicio', t: 'Inicio', I: Home },
  { id: 'conversaciones', t: 'Conversaciones', I: MessageCircle },
  { id: 'actividad', t: 'Actividad', I: Activity },
  { id: 'estadisticas', t: 'Estadísticas', I: BarChart3 },
  { id: 'ensenar', t: 'Lo que saben', I: BookOpen },
  { id: 'conexiones', t: 'Conexiones', I: Plug },
  { id: 'ajustes', t: 'Ajustes', I: Settings },
];
const SUB = {
  conversaciones: 'Lo que hablan tus agentes con tus clientes. Entra cuando quieras.',
  actividad: 'Todo lo que hacen tus agentes, al momento.',
  estadisticas: 'Cómo está rindiendo tu oficina.',
  ensenar: 'Tus agentes solo usan lo que pongas aquí. Nunca se inventan precios, horarios ni promociones.',
  conexiones: 'Pulsa «Conectar», entra con tu cuenta y acepta los permisos. Tus contraseñas no pasan por nosotros.',
  ajustes: 'Departamentos, consumo y facturación.',
};

function Entrar() {
  const [email, setEmail] = useState(''); const [st, setSt] = useState(''); const [err, setErr] = useState('');
  async function enviar(e) {
    e.preventDefault(); setErr(''); setSt('enviando');
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${window.location.origin}/app`, shouldCreateUser: true } });
    if (error) { setErr('No hemos podido enviarte el enlace. Revisa el correo e inténtalo otra vez.'); setSt(''); } else setSt('enviado');
  }
  return (
    <main className="acceso">
      <a href="/" className="acceso__logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="132" height="36" /></a>
      <div className="acceso__c">
        <h1>Entra en tu oficina</h1>
        {st === 'enviado' ? <p className="acceso__ok"><Mail size={18} /> Te hemos enviado un enlace a <b>{email}</b>. Ábrelo para entrar.</p> : (
          <form onSubmit={enviar}>
            <p className="muted">Te mandamos un enlace a tu correo. Sin contraseñas.</p>
            <label className="campo"><span>Tu correo</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@negocio.com" /></label>
            <button className="btn btn--pri btn--ancho" disabled={st === 'enviando'}>{st === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}</button>
            {err && <p className="error">{err}</p>}
          </form>
        )}
        <p className="acceso__pie">¿Aún no tienes oficina? <a href="/oficina-ia#precios">Móntala</a> · <a href="/app?demo=1">Ver la demo</a></p>
      </div>
    </main>
  );
}

// Actividad simulada para la demo: los agentes «trabajan» y aparecen tareas nuevas.
const SIM = [
  ['atencion', 'Contestando a Laura por WhatsApp', 'Ha contestado a Laura por WhatsApp (precios)', { canal: 'whatsapp', ms: 4200, tema: 'precios' }],
  ['citas', 'Recogiendo la cita que quiere Jordi', 'Ha recogido la cita que quiere Jordi: jueves a las 17:00', {}],
  ['google', 'Respondiendo una reseña de Núria', 'Ha respondido una reseña de 5 estrellas de Núria', { estrellas: 5 }],
  ['atencion', 'Contestando a Marc por el chat de la web', 'Ha contestado a Marc por el chat de la web (horarios)', { canal: 'web', ms: 3100, tema: 'horarios' }],
  ['ventas', 'Contestando la petición de presupuesto de Carla', 'Ha contestado la petición de presupuesto de Carla (pack novia)', {}],
  ['redes', 'Escribiendo el post del viernes', 'Ha programado el post del viernes en Instagram', {}],
];

export default function Panel() {
  const qs = new URLSearchParams(window.location.search); const demo = qs.has('demo');
  const { vista: v } = useParams(); const vista = VISTAS.some((x) => x.id === v) ? v : 'inicio';
  const nav = useNavigate();
  const [extra, setExtra] = useState({}); const [menu, setMenu] = useState(false); const [dias, setDias] = useState(30);
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setAhora(Date.now()), 15000); return () => clearInterval(t); }, []);
  const ir = (id, abrir, filtro) => { setExtra({ abrir, filtro }); setMenu(false); nav(`/app/${id}${demo ? '?demo=1' : ''}`); if (filtro === 'probar') setTimeout(() => document.getElementById('probar')?.scrollIntoView({ behavior: 'smooth' }), 150); else window.scrollTo(0, 0); };
  useSeo({ title: demo ? 'Demo · Oficina de IA | Agutidesigns' : 'Tu oficina de IA | Agutidesigns', description: 'Panel de tu oficina de IA.', path: '/app', noindex: true });
  const [estado, setEstado] = useOficina(demo);
  const deptoIds = useMemo(() => estado.deptos.map((d) => d.depto), [estado.deptos]);
  const est = useMemo(() => estadisticas(estado.eventos || [], dias, deptoIds), [estado.eventos, dias, deptoIds]);
  const aviso = qs.get('conectado') ? `${HERRAMIENTA[qs.get('conectado')]?.nombre || 'Herramienta'} conectada. Tus agentes ya pueden usarla.` : qs.get('error_conexion') ? 'No se ha completado la conexión. Inténtalo de nuevo o pídenos ayuda.' : '';

  useEffect(() => {
    if (!demo) return undefined;
    let n = 0; const tiempos = [];
    const id = setInterval(() => {
      const [depto, tarea, texto, detalle] = SIM[n % SIM.length]; n += 1;
      setEstado((e) => ({ ...e, agentes: { ...e.agentes, [depto]: { estado: 'trabajando', tarea, actualizado: new Date().toISOString() } } }));
      tiempos.push(setTimeout(() => setEstado((e) => ({ ...e,
        agentes: { ...e.agentes, [depto]: { estado: 'disponible', tarea: 'Esperando la siguiente tarea', actualizado: new Date().toISOString() } },
        eventos: [{ id: Date.now(), depto, tipo: 'hecho', texto, detalle, creado: new Date().toISOString(), resuelto: true }, ...e.eventos],
        uso: { ...e.uso, [depto]: { ...e.uso[depto], unidades_mes: (e.uso[depto]?.unidades_mes || 0) + 1 } } })), 2600));
    }, 4200);
    return () => { clearInterval(id); tiempos.forEach(clearTimeout); };
  }, [demo, setEstado]);

  const { cargando, sesion, negocio } = estado;
  if (cargando) return <main className="acceso"><span className="spin" /></main>;
  if (!demo && !sesion) return <Entrar />;
  if (!demo && !negocio) {
    return (
      <main className="acceso"><div className="acceso__c">
        <h1>No encontramos tu oficina</h1>
        <p className="muted">Has entrado con <b>{sesion.user.email}</b>, pero no hay ninguna oficina con ese correo. Si la contrataste con otro, sal y entra con ese.</p>
        <div className="fila-btn"><a className="btn btn--pri" href="/oficina-ia#precios">Montar mi oficina</a><button className="btn btn--sec" onClick={() => supabase.auth.signOut()}>Salir</button></div>
      </div></main>
    );
  }

  const pend = (estado.eventos || []).filter(pendiente).length;
  const sinLeer = (estado.conversaciones || []).filter((c) => !c.leido || c.necesita).length;
  const faltanDatos = CAMPOS.slice(0, 5).some(([k]) => !String(negocio[k] || '').trim());
  const insignia = { actividad: pend, conversaciones: sinLeer, ensenar: faltanDatos ? '!' : 0, conexiones: estado.conexiones.some((c) => c.estado === 'conectada') ? 0 : '!' };
  const activo = negocio.estado === 'activo';
  const o = { ...estado, demo, est, ir, setEstado, ahora: Math.max(ahora, ...Object.values(estado.agentes || {}).map((a) => new Date(a.actualizado).getTime() || 0)) };
  const titulo = VISTAS.find((x) => x.id === vista).t;
  const trabajando = Object.values(estado.agentes || {}).filter((a) => a.estado === 'trabajando' && o.ahora - new Date(a.actualizado).getTime() < 180e3).length;

  return (
    <div className={`app ${menu ? 'menu-on' : ''}`}>
      {demo && <div className="demo-b">Estás viendo una demo con un negocio de ejemplo. <a href="/oficina-ia#precios">Monta la tuya →</a></div>}
      <aside className="lado">
        <div className="lado__top"><a href="/" className="lado__logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="118" height="32" /></a><button className="ico lado__x" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
        <div className="neg"><span className="neg__av">{negocio.nombre.slice(0, 1).toUpperCase()}</span><div><b>{negocio.nombre}</b><small className={activo ? '' : 'is-off'}><i />{activo ? (trabajando ? `${trabajando} trabajando ahora` : 'Oficina en marcha') : negocio.estado === 'impago' ? 'Pago pendiente' : 'Pausada'}</small></div></div>
        <nav aria-label="Secciones">
          {VISTAS.map((x) => { const Icono = x.I; return (
            <button key={x.id} type="button" className={vista === x.id ? 'is-on' : ''} aria-current={vista === x.id ? 'page' : undefined} onClick={() => ir(x.id)}>
              <Icono size={18} strokeWidth={1.9} />{x.t}{insignia[x.id] ? <em className={insignia[x.id] === '!' ? 'is-tarea' : ''}>{insignia[x.id]}</em> : null}
            </button>
          ); })}
        </nav>
        <div className="lado__pie">
          <div className="equipo-mini">{estado.deptos.map((d) => <span key={d.depto} title={DEPTO[d.depto].nombre} style={{ background: DEPTO[d.depto].color }} />)}</div>
          <small>{estado.deptos.length} departamento{estado.deptos.length === 1 ? '' : 's'}{negocio.importe_mes ? ` · ${negocio.importe_mes} €/mes` : ''}</small>
          {!demo && <button className="enlace enlace--gris" onClick={() => supabase.auth.signOut()}><LogOut size={14} /> Salir</button>}
        </div>
      </aside>
      <div className="velo" onClick={() => setMenu(false)} aria-hidden="true" />
      <div className="prin">
        <header className="cab">
          <button className="ico cab__menu" onClick={() => setMenu(true)} aria-label="Abrir menú"><Menu size={22} /></button>
          {vista !== 'inicio' ? <div className="cab__t"><h1>{titulo}</h1><p>{SUB[vista]}</p></div> : <span className="cab__marca">Oficina de IA</span>}
        </header>
        <main className="cont">
          {vista === 'inicio' && <Inicio o={o} />}
          {vista === 'conversaciones' && <Conversaciones o={o} abrir={extra.abrir} />}
          {vista === 'actividad' && <Actividad o={o} inicial={extra.filtro === 'tuyo' ? 'tuyo' : undefined} />}
          {vista === 'estadisticas' && <Estadisticas o={o} dias={dias} setDias={setDias} />}
          {vista === 'ensenar' && <Ensenar o={o} />}
          {vista === 'conexiones' && <Conexiones o={o} aviso={aviso} />}
          {vista === 'ajustes' && <Ajustes o={o} />}
        </main>
      </div>
    </div>
  );
}

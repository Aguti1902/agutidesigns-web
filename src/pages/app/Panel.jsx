// Panel del cliente de la Oficina de IA (/app/:vista). Minimalista y en directo: el equipo de agentes trabajando,
// lo que te necesita, conversaciones, actividad, estadísticas, lo que saben tus agentes, conexiones y ajustes.
// /app?demo=1 enseña un negocio de ejemplo con actividad simulada.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, BarChart3, Database, Bell, BookOpen, Box, CalendarCheck, CalendarPlus, Clapperboard, CreditCard, FolderOpen, Handshake, Home, Inbox, LayoutGrid, LogOut, Mail, Megaphone, Menu, MessageCircle, MessagesSquare, PenLine, Plug, Plus, Receipt, Search, Settings, Star, TrendingUp, X, LifeBuoy } from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import useSeo from '../../hooks/useSeo';
import { DEPTO } from '../../data/oficinaSaas';
import { useOficina, estadisticas, pendiente } from './datos';
import { HERRAMIENTA } from './conexiones';
import { Actividad, Ensenar, Conexiones } from './vistas';
import { Inicio, TeNecesitan, Conversaciones, Departamentos, Oficina } from './pantallas';
import { Analitica, Videos, Material, Informes } from './marketing';
import { ChatEquipo, Seo, Publicaciones, Articulos, Resenas, Crm } from './consola';
import { Agenda, Clientes, Mejora, Plan, Facturas, Avisos, SugerenciaMejora } from './vistas2';
import { CabeceraDepto } from './departamentos';
import { Tutorial } from './ayuda';
import { LoQueSaben } from './saben';
import { CentroAyuda, VideosAyuda, Soporte } from './soporte';
import { AvisosCupo } from './ampliar';
import { CAMPOS } from './formato';
import { MenuNegocio, MenuAyuda, MenuUsuario, Perfil, Configuracion, useTema, useVistaPanel } from './menus';
import { Sencilla, ElegirVista } from './sencilla';
import '../../components/oficina/Oficina3D.css';
import './Panel.css';
import './PanelPro.css';
import './Consola.css';

// Menú por grupos. `depto`: solo aparece activo si ese departamento está contratado (si no, se ofrece como mejora).
const GRUPOS = [
  { t: null, items: [
    { id: 'inicio', t: 'Inicio', I: Home },
    { id: 'bandeja', t: 'Te necesitan', I: Inbox },
    { id: 'chat', t: 'Chat con tu equipo', I: MessagesSquare },
    { id: 'conversaciones', t: 'Conversaciones', I: MessageCircle, depto: 'atencion' },
  ] },
  { t: 'Tu equipo', items: [
    { id: 'equipo', t: 'Departamentos', I: LayoutGrid },
    { id: 'oficina', t: 'Oficina 3D', I: Box },
    { id: 'publicaciones', t: 'Publicaciones', I: Megaphone, depto: 'redes' },
    { id: 'videos', t: 'Vídeos', I: Clapperboard, depto: 'redes' },
    { id: 'resenas', t: 'Reseñas', I: Star, depto: 'google' },
    { id: 'articulos', t: 'Blog', I: PenLine, depto: 'contenido' },
    { id: 'seo', t: 'SEO y competencia', I: TrendingUp, depto: ['contenido', 'google'] },
  ] },
  { t: 'Clientes', items: [
    { id: 'crm', t: 'Tu CRM', I: Database },
    { id: 'agenda', t: 'Agenda', I: CalendarCheck, depto: 'citas' },
    { id: 'clientes', t: 'Clientes potenciales', I: Handshake, depto: 'ventas' },
  ] },
  { t: 'Resultados', items: [
    { id: 'analitica', t: 'Analítica', I: BarChart3 },
    { id: 'informes', t: 'Informes', I: Mail },
    { id: 'actividad', t: 'Actividad', I: Activity },
  ] },
  { t: 'Configuración', oculto: true, items: [
    { id: 'ensenar', t: 'Lo que saben tus agentes', I: BookOpen },
    { id: 'material', t: 'Tu material', I: FolderOpen },
    { id: 'conexiones', t: 'Conexiones', I: Plug },
  ] },
  { t: 'Cuenta', oculto: true, items: [
    { id: 'configuracion', t: 'Configuración', I: Settings },
    { id: 'plan', t: 'Plan', I: CreditCard },
    { id: 'facturas', t: 'Facturas', I: Receipt },
    { id: 'ajustes', t: 'Avisos y cuenta', I: Settings },
    { id: 'ayuda', t: 'Centro de ayuda', I: LifeBuoy },
    { id: 'videos-ayuda', t: 'Vídeos tutoriales', I: LifeBuoy },
    { id: 'soporte', t: 'Escríbenos', I: LifeBuoy },
  ] },
];
const VISTAS = GRUPOS.flatMap((g) => g.items);
const DEPARTAMENTOS_IDS = ['atencion', 'citas', 'ventas', 'redes', 'google', 'contenido'];
// Vistas que aún usan la cabecera sencilla (las nuevas traen la suya).
const VIEJAS = ['actividad', 'agenda', 'clientes', 'publicaciones', 'resenas', 'articulos', 'mejora', 'ensenar', 'conexiones', 'plan', 'facturas', 'ajustes'];

// Buscador global (⌘K): clientes, conversaciones, citas y lo que han hecho los agentes.
function Buscador({ o }) {
  const [q, setQ] = useState(''); const [abierto, setAbierto] = useState(false); const ref = useRef(null);
  useEffect(() => { const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus(); } if (e.key === 'Escape') { setAbierto(false); ref.current?.blur(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const t = q.trim().toLowerCase();
  const res = t.length < 2 ? [] : [
    ...o.conversaciones.filter((c) => `${c.nombre || ''} ${c.contacto || ''} ${c.ultimo_texto || ''}`.toLowerCase().includes(t)).slice(0, 4).map((c) => ({ k: `c${c.id}`, I: MessageCircle, t: c.nombre || `+${c.contacto}`, s: c.ultimo_texto || 'Conversación', ir: () => o.ir('conversaciones', c.id) })),
    ...o.citas.filter((c) => `${c.nombre || ''} ${c.servicio || ''}`.toLowerCase().includes(t)).slice(0, 3).map((c) => ({ k: `ci${c.id}`, I: CalendarCheck, t: `${c.nombre || 'Cita'} · ${c.servicio || ''}`, s: c.fecha ? new Date(c.fecha).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Cita', ir: () => o.ir('agenda') })),
    ...o.leads.filter((l) => `${l.nombre || ''} ${l.interes || ''}`.toLowerCase().includes(t)).slice(0, 3).map((l) => ({ k: `l${l.id}`, I: Handshake, t: l.nombre || 'Cliente', s: l.interes || 'Cliente potencial', ir: () => o.ir('clientes') })),
    ...o.eventos.filter((e) => e.texto.toLowerCase().includes(t)).slice(0, 4).map((e) => ({ k: `e${e.id}`, I: Activity, t: e.texto, s: DEPTO[e.depto]?.nombre || 'Oficina', ir: () => o.ir('actividad') })),
  ];
  return (
    <div className="top__buscar">
      <Search size={17} /><input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setAbierto(true); }} onFocus={() => setAbierto(true)} onBlur={() => setTimeout(() => setAbierto(false), 150)} placeholder="Buscar cliente, teléfono, cita, mensaje…" aria-label="Buscar" /><kbd>⌘K</kbd>
      {abierto && t.length >= 2 && (
        <div className="top__res" role="listbox">{res.length ? res.map((r) => <button key={r.k} type="button" onMouseDown={() => { r.ir(); setQ(''); }}><r.I size={16} /><span><b>{r.t}</b><small>{r.s}</small></span></button>) : <p className="muted">Nada con «{q}».</p>}</div>
      )}
    </div>
  );
}
const SUB = {
  agenda: 'Las citas que piden tus clientes. Confírmalas con un clic y se les avisa solo.',
  clientes: 'Quién te ha pedido presupuesto y en qué punto está cada uno.',
  publicaciones: 'Historias, posts y carruseles que prepara tu agente de Redes. Tú apruebas y se publican solos.',
  resenas: 'Tus reseñas de Google y lo que les ha respondido tu agente.',
  articulos: 'Los artículos para tu web que escribe tu agente de Contenido.',
  plan: 'Tu plan, tus departamentos y tu consumo del mes.',
  facturas: 'Todas tus facturas, listas para descargar.',
  actividad: 'Todo lo que hacen tus agentes, al momento.',
  ensenar: 'Tus agentes solo usan lo que pongas aquí. Nunca se inventan precios, horarios ni promociones.',
  conexiones: 'Pulsa «Conectar», entra con tu cuenta y acepta los permisos. Tus contraseñas no pasan por nosotros.',
  ajustes: 'Cuándo te avisamos por correo y tu cuenta.',
  ayuda: 'Vídeos cortos, el tutorial de bienvenida y una persona del equipo si la necesitas.',
};

function Entrar() {
  const [email, setEmail] = useState(''); const [st, setSt] = useState(''); const [err, setErr] = useState('');
  async function enviar(e) {
    e.preventDefault(); setErr(''); setSt('enviando');
    const r = await fetch('/api/oficina/acceso', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase() }) }).catch(() => null);
    if (!r?.ok) { setErr('No hemos podido enviarte el enlace. Revisa el correo e inténtalo otra vez.'); setSt(''); } else setSt('enviado');
  }
  return (
    <main className="acceso">
      <a href="/" className="acceso__logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="132" height="36" /></a>
      <div className="acceso__c">
        <h1>Entra en tu oficina</h1>
        {st === 'enviado' ? <p className="acceso__ok"><Mail size={18} /><span>Si <b>{email}</b> tiene una oficina, te acabamos de enviar el enlace para entrar. Mira también en spam.</span></p> : (
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

// /app/entrar?t=… : valida el enlace del correo y abre el panel.
function useEnlaceAcceso() {
  const [st, setSt] = useState(() => (window.location.pathname === '/app/entrar' ? 'validando' : ''));
  useEffect(() => {
    if (st !== 'validando') return;
    const t = new URLSearchParams(window.location.search).get('t');
    if (!t) { setSt('error'); return; } // eslint-disable-line react-hooks/set-state-in-effect
    supabase.auth.verifyOtp({ token_hash: t, type: 'magiclink' }).then(({ error }) => {
      if (error) setSt('error'); else { window.history.replaceState(null, '', '/app'); setSt(''); }
    });
  }, [st]);
  return st;
}

export default function Panel() {
  const accesoSt = useEnlaceAcceso();
  const qs = new URLSearchParams(window.location.search); const demo = qs.has('demo');
  const { vista: v } = useParams(); const mejoraDe = v?.startsWith('mejora-') ? v.slice(7) : null;
  const vista = VISTAS.some((x) => x.id === v) ? v : mejoraDe ? 'mejora' : 'inicio';
  const nav = useNavigate();
  const [extra, setExtra] = useState({}); const [menu, setMenu] = useState(false); const [dias, setDias] = useState(30);
  const [ahora, setAhora] = useState(() => Date.now());
  const [tutoAbierto, setTutoAbierto] = useState(() => qs.has('tutorial'));
  const tema = useTema(); const vistaPanel = useVistaPanel(); const [perfil, setPerfil] = useState(false);
  useEffect(() => { const t = setInterval(() => setAhora(Date.now()), 15000); return () => clearInterval(t); }, []);
  const ir = (id, abrir, filtro) => { setExtra({ abrir, filtro }); setMenu(false); nav(`/app/${id}${demo ? '?demo=1' : ''}`); if (filtro === 'probar' || filtro === 'web') setTimeout(() => document.getElementById(filtro)?.scrollIntoView({ behavior: 'smooth' }), 150); else window.scrollTo(0, 0); };
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
  if (accesoSt === 'validando' || cargando) return <main className="acceso"><span className="spin" /></main>;
  if (accesoSt === 'error') return <main className="acceso"><div className="acceso__c"><h1>Este enlace ya no vale</h1><p className="muted">Los enlaces caducan en una hora y solo sirven una vez. Pide uno nuevo y entras en un momento.</p><a className="btn btn--pri" href="/app">Pedir un enlace nuevo</a></div></main>;
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
  const tiene = (d) => !d || (Array.isArray(d) ? d : [d]).some((y) => estado.deptos.some((x) => x.depto === y));
  const citasPend = (estado.citas || []).filter((c) => c.estado === 'pendiente').length;
  const leadsNuevos = (estado.leads || []).filter((l) => l.etapa === 'nuevo').length;
  const videosPend = (estado.videos || []).filter((v) => v.estado === 'guion' || v.estado === 'revision').length;
  const insignia = { bandeja: pend, conversaciones: sinLeer, agenda: citasPend, clientes: leadsNuevos, videos: videosPend, ensenar: faltanDatos ? '!' : 0, conexiones: estado.conexiones.some((c) => c.estado === 'conectada') ? 0 : '!' };
  const urgente = { conversaciones: (estado.conversaciones || []).some((c) => c.necesita) };
  // Si se entra en una sección de un departamento no contratado, se enseña la mejora.
  const vistaReal = (() => { const it = VISTAS.find((x) => x.id === vista); return it?.depto && !tiene(it.depto) ? 'mejora' : vista; })();
  const deptoMejora = mejoraDe || [VISTAS.find((x) => x.id === vista)?.depto].flat()[0];
  const activo = negocio.estado === 'activo';
  const fechaL = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  const banners = (<>
    {negocio.cancela_el && <p className="banda-prueba banda--aviso"><X size={17} /><span><b>Tu suscripción termina el {fechaL(negocio.cancela_el)}.</b> Hasta entonces todo sigue funcionando.</span><button className="enlace" onClick={() => ir('plan')}>Reactivar</button></p>}
    {negocio.estado === 'pausado' && <p className="banda-prueba banda--aviso"><X size={17} /><span><b>Tu oficina está en pausa{negocio.pausa_hasta ? ` hasta el ${fechaL(negocio.pausa_hasta)}` : ''}.</b> Tus agentes no trabajan.</span><button className="enlace" onClick={() => ir('plan')}>Reactivar</button></p>}
    {negocio.estado === 'impago' && <p className="banda-prueba banda--aviso"><X size={17} /><span><b>No hemos podido cobrar tu último pago.</b> Actualiza tu tarjeta para que tus agentes sigan trabajando.</span><button className="enlace" onClick={() => ir('plan')}>Actualizar tarjeta</button></p>}
  </>);
  const o = { ...estado, demo, est, ir, setEstado, banners, sugerencia: null, ahora: Math.max(ahora, ...Object.values(estado.agentes || {}).map((a) => new Date(a.actualizado).getTime() || 0)) };
  const deptoVista = VISTAS.find((x) => x.id === vistaReal)?.depto;
  const verTuto = tutoAbierto || (!demo && !negocio.onboarding?.tutorial);
  const titulo = vistaReal === 'mejora' ? 'Mejora tu oficina' : VISTAS.find((x) => x.id === vista).t;
  const trabajando = Object.values(estado.agentes || {}).filter((a) => a.estado === 'trabajando' && o.ahora - new Date(a.actualizado).getTime() < 180e3).length;

  const sinContratar = DEPARTAMENTOS_IDS.filter((d) => !tiene(d));
  const perfilModal = perfil && <Perfil o={o} tema={tema} ir={ir} vista={vistaPanel} cerrar={() => setPerfil(false)} />;
  const tutoModal = verTuto && <Tutorial o={o} cerrar={() => { setTutoAbierto(false); ir('inicio'); }} />;
  // Vista sencilla: la oficina 3D como protagonista, sin menú lateral ni números.
  if (vistaPanel.sencilla && vistaReal === 'inicio') {
    return (
      <div className={`app app--pro app--facil ${tema.clase}`}>
        {demo && <div className="demo-b">Estás viendo una demo con un negocio de ejemplo. <a href="/oficina-ia#precios">Monta la tuya →</a></div>}
        {banners}
        <Sencilla o={o} vista={vistaPanel} abrirPerfil={() => setPerfil(true)} />
        {perfilModal}{tutoModal}
      </div>
    );
  }
  return (
    <div className={`app app--pro ${tema.clase} ${menu ? 'menu-on' : ''}`}>
      {demo && <div className="demo-b">Estás viendo una demo con un negocio de ejemplo. <a href="/oficina-ia#precios">Monta la tuya →</a></div>}
      <aside className="lado">
        <div className="lado__top"><a href="/" className="lado__logo"><img src={tema.oscuro ? '/images/logo-blanco.png' : '/images/logoazul.png'} alt="Agutidesigns" width="118" height="32" /></a><span className="lado__tag">Oficina IA</span><button className="ico lado__x" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
        <MenuNegocio o={o} ir={ir} faltan={faltanDatos} />
        <nav aria-label="Secciones">
          {GRUPOS.filter((g) => !g.oculto).map((g) => {
            const items = g.items.filter((x) => tiene(x.depto));
            if (!items.length) return null;
            return (
              <div key={g.t || 'g'} className="nav-g">
                {g.t && <p className="nav-g__t">{g.t}</p>}
                {items.map((x) => { const Icono = x.I; const on = vista === x.id; return (
                  <button key={x.id} type="button" className={on ? 'is-on' : ''} aria-current={on ? 'page' : undefined} onClick={() => ir(x.id)}>
                    <Icono size={18} strokeWidth={1.8} />{x.t}{insignia[x.id] ? <em className={insignia[x.id] === '!' ? 'is-tarea' : urgente[x.id] ? 'is-mal' : ''}>{insignia[x.id]}</em> : null}
                  </button>
                ); })}
              </div>
            );
          })}
          {sinContratar.length > 0 && <button type="button" className={`nav-mas ${vistaReal === 'mejora' ? 'is-on' : ''}`} onClick={() => ir(`mejora-${sinContratar[0]}`)}><Plus size={16} /> Añadir departamentos <span>{sinContratar.length}</span></button>}
        </nav>
        <div className="lado__pie">
          <p className="lado__vivo"><i />{trabajando ? `${trabajando} agente${trabajando > 1 ? 's' : ''} trabajando ahora` : 'Agentes conectados'}</p>
          <MenuAyuda ir={ir} tutorial={() => setTutoAbierto(true)} />
          <MenuUsuario o={o} ir={ir} abrirPerfil={() => setPerfil(true)} />
        </div>
      </aside>
      <div className="velo" onClick={() => setMenu(false)} aria-hidden="true" />
      <div className="prin">
        <header className="top">
          <button className="ico top__menu" onClick={() => setMenu(true)} aria-label="Abrir menú"><Menu size={22} /></button>
          <Buscador o={o} />
          <div className="top__a">
            {tiene('citas') && <button className="btn btn--osc btn--sm top__btn" onClick={() => ir('agenda')}><CalendarPlus size={15} /> Agenda</button>}
            <button className="btn btn--sec btn--sm top__btn" onClick={() => ir('chat')}><MessagesSquare size={15} /> Tu equipo</button>
            <button className="btn btn--sec btn--sm top__btn" onClick={() => { vistaPanel.setModo('sencilla'); ir('inicio'); }} title="Tu oficina en 3D, sin números ni gráficas"><Box size={15} /> Vista sencilla</button>
            <button className="ico top__campana" onClick={() => ir('bandeja')} aria-label={`Te necesitan: ${pend}`}><Bell size={20} />{pend > 0 && <em>{pend > 99 ? '99+' : pend}</em>}</button>
            <button type="button" className="top__yo" onClick={() => setPerfil(true)} aria-label="Mi perfil"><span className="neg__av">{negocio.nombre.slice(0, 1).toUpperCase()}</span><b>{negocio.nombre}</b></button>
          </div>
        </header>
        <main className="cont">
          {vistaPanel.sencilla && <button type="button" className="sn-volver" onClick={() => ir('inicio')}>← Volver a mi oficina</button>}
          {vistaReal !== 'inicio' && vistaReal !== 'plan' && <div className="banners-top">{banners}<AvisosCupo o={o} /></div>}
          {VIEJAS.includes(vistaReal) && <div className="pc-cab pc-cab--simple"><div><p className="pc-cab__k">{GRUPOS.find((g) => g.items.some((x) => x.id === vista))?.t || 'Oficina de IA'}</p><h1>{titulo}</h1>{SUB[vistaReal] && <p className="pc-cab__s">{SUB[vistaReal]}</p>}</div></div>}
          {typeof deptoVista === 'string' && VIEJAS.includes(vistaReal) && <CabeceraDepto key={deptoVista} o={o} depto={deptoVista} />}
          {vistaReal === 'inicio' && <Inicio o={o} extras={<>{banners}<AvisosCupo o={o} /><SugerenciaMejora o={o} /></>} />}
          {vistaReal === 'bandeja' && <TeNecesitan o={o} />}
          {vistaReal === 'chat' && <ChatEquipo o={o} />}
          {vistaReal === 'conversaciones' && <Conversaciones o={o} abrir={extra.abrir} />}
          {vistaReal === 'equipo' && <Departamentos o={o} />}
          {vistaReal === 'oficina' && <Oficina o={o} />}
          {vistaReal === 'actividad' && <Actividad o={o} inicial={extra.filtro === 'tuyo' ? 'tuyo' : undefined} />}
          {vistaReal === 'crm' && <Crm o={o} />}
          {vistaReal === 'agenda' && <Agenda o={o} />}
          {vistaReal === 'clientes' && <Clientes o={o} />}
          {vistaReal === 'publicaciones' && <Publicaciones o={o} />}
          {vistaReal === 'videos' && <Videos o={o} abrir={extra.abrir} />}
          {vistaReal === 'resenas' && <Resenas o={o} />}
          {vistaReal === 'articulos' && <Articulos o={o} />}
          {vistaReal === 'seo' && <Seo o={o} />}
          {vistaReal === 'mejora' && deptoMejora && <Mejora key={deptoMejora} o={o} depto={deptoMejora} />}
          {vistaReal === 'analitica' && <Analitica key={extra.filtro || 'a'} o={o} dias={dias} setDias={setDias} inicial={extra.filtro} />}
          {vistaReal === 'informes' && <Informes o={o} />}
          {vistaReal === 'ensenar' && <LoQueSaben o={o} />}
          {vistaReal === 'material' && <Material o={o} />}
          {vistaReal === 'conexiones' && <Conexiones o={o} aviso={aviso} />}
          {vistaReal === 'plan' && <Plan o={o} />}
          {vistaReal === 'facturas' && <Facturas o={o} />}
          {vistaReal === 'ajustes' && <Avisos o={o} />}
          {vistaReal === 'configuracion' && <Configuracion o={o} ir={ir} abrirPerfil={() => setPerfil(true)} />}
          {vistaReal === 'ayuda' && <CentroAyuda o={o} ir={ir} abrirTutorial={() => setTutoAbierto(true)} abrirPerfil={() => setPerfil(true)} />}
          {vistaReal === 'videos-ayuda' && <VideosAyuda o={o} ir={ir} />}
          {vistaReal === 'soporte' && <Soporte o={o} ir={ir} />}
        </main>
      </div>
      {perfilModal}{tutoModal}
      {!vistaPanel.modo && !verTuto && vistaReal === 'inicio' && <ElegirVista vista={vistaPanel} />}
    </div>
  );
}

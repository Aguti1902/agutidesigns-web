// Menús de la barra lateral al estilo de un software de gestión: negocio arriba (configuración y suscripción),
// ayuda y perfil abajo, y la página de Configuración con buscador y categorías.
import { useEffect, useRef, useState } from 'react';
import {
  BellRing, BookOpen, LayoutGrid, Building2, ChevronDown, ChevronRight, CreditCard, Database, FolderOpen, GraduationCap, LifeBuoy, LogOut, Mail, MessageCircle,
  Monitor, Moon, PlayCircle, Plug, Receipt, Search, Settings, Sun, User, X,
} from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { urlWeb } from '../../lib/panelRuta';

// ---------- tema (claro, oscuro o el del sistema) ----------
const CLAVE_TEMA = 'oficina-tema';
export function useTema() {
  const [tema, setTemaSt] = useState(() => { try { return localStorage.getItem(CLAVE_TEMA) || 'sistema'; } catch { return 'sistema'; } });
  const [sisOscuro, setSis] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches || false);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-color-scheme: dark)'); if (!m) return undefined;
    const f = (e) => setSis(e.matches); m.addEventListener?.('change', f); return () => m.removeEventListener?.('change', f);
  }, []);
  const setTema = (t) => { setTemaSt(t); try { localStorage.setItem(CLAVE_TEMA, t); } catch { /* sin almacenamiento */ } };
  const oscuro = tema === 'oscuro' || (tema === 'sistema' && sisOscuro);
  return { tema, setTema, oscuro, clase: tema === 'oscuro' ? 'tema-oscuro' : tema === 'claro' ? 'tema-claro' : '' };
}

// ---------- vista del panel: sencilla (para quien no entiende de IA) o completa ----------
const CLAVE_VISTA = 'oficina-vista';
export function useVistaPanel() {
  const [modo, setModoSt] = useState(() => {
    const q = new URLSearchParams(window.location.search).get('vista');
    if (q === 'sencilla' || q === 'completa') return q;
    try { return localStorage.getItem(CLAVE_VISTA) || ''; } catch { return ''; }
  });
  const setModo = (m) => { setModoSt(m); try { localStorage.setItem(CLAVE_VISTA, m); } catch { /* sin almacenamiento */ } };
  return { modo, setModo, sencilla: modo === 'sencilla' };
}

// ---------- menú flotante ----------
function Flota({ abierto, cerrar, children, lado = 'arriba', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!abierto) return undefined;
    const f = (e) => { if (ref.current && !ref.current.parentElement.contains(e.target)) cerrar(); };
    const k = (e) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('mousedown', f); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', f); document.removeEventListener('keydown', k); };
  }, [abierto, cerrar]);
  if (!abierto) return null;
  return <div ref={ref} className={`mn mn--${lado} ${className}`} role="menu">{children}</div>;
}
const Item = ({ I, t, onClick, sub }) => <button type="button" role="menuitem" className="mn__i" onClick={onClick}><I size={15} /><span>{t}</span>{sub && <small>{sub}</small>}</button>;

// Negocio (arriba): todo lo de la cuenta y la suscripción.
export function MenuNegocio({ o, ir, faltan }) {
  const [ab, setAb] = useState(false); const n = o.negocio; const go = (v) => { setAb(false); ir(v); };
  const sinCon = !o.conexiones.some((c) => c.estado === 'conectada'); const aviso = sinCon || faltan;
  return (
    <div className="mn-w">
      <button type="button" className="lado__neg" onClick={() => setAb(!ab)} aria-expanded={ab} aria-haspopup="menu">
        <span className="neg__av">{n.nombre.slice(0, 1).toUpperCase()}</span>
        <span><b>{n.nombre}</b><small>{n.periodo === 'anio' ? 'Plan anual' : 'Plan mensual'} · {o.deptos.length} dpto{o.deptos.length === 1 ? '' : 's'}</small></span>
        {aviso ? <i className="lado__punto" title="Te falta configurar algo" /> : <ChevronDown size={15} />}
      </button>
      <Flota abierto={ab} cerrar={() => setAb(false)} lado="abajo">
        <Item I={Settings} t="Configuración" onClick={() => go('configuracion')} />
        <Item I={Building2} t="Lo que saben tus agentes" sub={faltan ? 'Faltan datos de tu negocio' : undefined} onClick={() => go('ensenar')} />
        <Item I={CreditCard} t="Plan y suscripción" onClick={() => go('plan')} />
        <Item I={Receipt} t="Facturas" onClick={() => go('facturas')} />
        <hr />
        <Item I={Plug} t="Conexiones" sub={sinCon ? 'Aún no has conectado nada' : undefined} onClick={() => go('conexiones')} />
        <Item I={Database} t="Tu CRM" onClick={() => go('crm')} />
      </Flota>
    </div>
  );
}

// Ayuda y soporte (abajo).
export function MenuAyuda({ ir, tutorial }) {
  const [ab, setAb] = useState(false); const go = (v) => { setAb(false); ir(v); };
  return (
    <div className="mn-w">
      <button type="button" className="lado__fila" onClick={() => setAb(!ab)} aria-expanded={ab} aria-haspopup="menu"><LifeBuoy size={16} /><span>Ayuda y soporte</span><ChevronRight size={15} /></button>
      <Flota abierto={ab} cerrar={() => setAb(false)} lado="lado">
        <Item I={BookOpen} t="Centro de ayuda" onClick={() => go('ayuda')} />
        <Item I={PlayCircle} t="Vídeos tutoriales" onClick={() => go('videos-ayuda')} />
        <Item I={GraduationCap} t="Tutorial guiado" onClick={() => { setAb(false); tutorial(); }} />
        <hr />
        <Item I={MessageCircle} t="Escríbenos" sub="Te contestamos en menos de 24 h laborables" onClick={() => go('soporte')} />
      </Flota>
    </div>
  );
}

// Usuario (abajo del todo).
export function MenuUsuario({ o, abrirPerfil, ir }) {
  const [ab, setAb] = useState(false); const email = o.sesion?.user?.email || 'demo@agutidesigns.io';
  return (
    <div className="mn-w">
      <button type="button" className="lado__fila lado__yo" onClick={() => setAb(!ab)} aria-expanded={ab} aria-haspopup="menu"><span className="lado__ini">{email.slice(0, 2).toUpperCase()}</span><span>{email}</span><ChevronRight size={15} /></button>
      <Flota abierto={ab} cerrar={() => setAb(false)} lado="lado">
        <Item I={User} t="Mi perfil" onClick={() => { setAb(false); abrirPerfil(); }} />
        <Item I={BellRing} t="Avisos y notificaciones" onClick={() => { setAb(false); ir('ajustes'); }} />
        <hr />
        {!o.demo && <Item I={LogOut} t="Cerrar sesión" onClick={() => supabase.auth.signOut()} />}
        {o.demo && <Item I={LogOut} t="Salir de la demo" onClick={() => { window.location.href = urlWeb('/oficina-ia'); }} />}
      </Flota>
    </div>
  );
}

// Perfil de usuario: cuenta, apariencia, notificaciones y acceso.
function CambiarClave() {
  const [abierto, setAbierto] = useState(false); const [c, setC] = useState(''); const [st, setSt] = useState('');
  async function guardar(e) {
    e.preventDefault(); if (c.length < 8) { setSt('Mínimo 8 caracteres.'); return; }
    setSt('Guardando…'); const { error } = await supabase.auth.updateUser({ password: c });
    setSt(error ? 'No se ha podido cambiar. Vuelve a entrar e inténtalo otra vez.' : 'Contraseña guardada.'); if (!error) setC('');
  }
  if (!abierto) return <button type="button" className="btn btn--sec btn--sm" onClick={() => setAbierto(true)}>Crear o cambiar mi contraseña</button>;
  return (
    <form onSubmit={guardar} className="pf__clave">
      <input type="password" value={c} onChange={(e) => setC(e.target.value)} placeholder="Nueva contraseña (mínimo 8)" autoComplete="new-password" aria-label="Nueva contraseña" />
      <button className="btn btn--pri btn--sm">Guardar</button>
      {st && <small>{st}</small>}
    </form>
  );
}

export function Perfil({ o, tema, cerrar, ir, vista }) {
  const email = o.sesion?.user?.email || 'demo@agutidesigns.io';
  useEffect(() => { const k = (e) => { if (e.key === 'Escape') cerrar(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [cerrar]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Perfil de usuario" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="modal__c pf">
        <header><b>Perfil de usuario</b><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        <section className="pf__s">
          <div className="pf__yo"><span className="lado__ini lado__ini--g">{email.slice(0, 2).toUpperCase()}</span><div><b>{email}</b><small>Propietario de {o.negocio.nombre}</small></div></div>
        </section>
        <section className="pf__s">
          <h3><Monitor size={14} /> Apariencia</h3>
          <p>Elige cómo quieres ver el panel. «Sistema» sigue el modo de tu ordenador o tu móvil.</p>
          <div className="pf__temas" role="radiogroup" aria-label="Tema">
            {[['claro', 'Claro', Sun], ['oscuro', 'Oscuro', Moon], ['sistema', 'Sistema', Monitor]].map(([k, t, I]) => (
              <button key={k} type="button" role="radio" aria-checked={tema.tema === k} className={`pf__tema is-${k} ${tema.tema === k ? 'is-on' : ''}`} onClick={() => tema.setTema(k)}>
                <span className="pf__muestra"><i /><i /><i /></span><span><I size={14} /> {t}</span>
              </button>
            ))}
          </div>
        </section>
        {vista && <section className="pf__s">
          <h3><LayoutGrid size={14} /> Vista del panel</h3>
          <p>«Sencilla» enseña tu oficina y lo que hace cada agente, sin números ni gráficas. «Completa» lo enseña todo.</p>
          <div className="pf__vistas" role="radiogroup" aria-label="Vista del panel">
            {[['sencilla', 'Sencilla', 'Tu oficina en 3D y botones grandes'], ['completa', 'Completa', 'Todas las secciones, números y gráficas']].map(([k, t, s]) => (
              <button key={k} type="button" role="radio" aria-checked={(vista.modo || 'completa') === k} className={(vista.modo || 'completa') === k ? 'is-on' : ''} onClick={() => { vista.setModo(k); cerrar(); ir('inicio'); }}><b>{t}</b><small>{s}</small></button>
            ))}
          </div>
        </section>}
        <section className="pf__s">
          <h3><Mail size={14} /> Notificaciones</h3>
          <p>Avisos cuando te necesiten tus agentes y el resumen de la semana por correo.</p>
          {!vista?.sencilla && <button className="btn btn--sec btn--sm" onClick={() => { cerrar(); ir('ajustes'); }}>Configurar avisos</button>}
        </section>
        <section className="pf__s">
          <h3><User size={14} /> Acceso</h3>
          <p>Entras con Google, con tu correo y contraseña o con un enlace que te mandamos al correo.</p>
          {!o.demo && <CambiarClave />}
          {!o.demo && <button className="btn btn--sec btn--sm" onClick={() => supabase.auth.signOut()}><LogOut size={13} /> Cerrar sesión</button>}
        </section>
      </div>
    </div>
  );
}

// Configuración: buscador y categorías, como un centro de ajustes.
const CATEGORIAS = [
  { id: 'ensenar', I: BookOpen, t: 'Lo que saben tus agentes', d: 'Datos del negocio, precios, horarios, servicios y preguntas frecuentes.', k: 'negocio precios horarios servicios faq preguntas datos' },
  { id: 'conexiones', I: Plug, t: 'Conexiones', d: 'WhatsApp, Google, Instagram, calendario, correo y tu web.', k: 'whatsapp google instagram facebook tiktok calendario gmail web wordpress' },
  { id: 'crm', I: Database, t: 'Tu CRM', d: 'Conecta tu programa de gestión: HubSpot, Pipedrive, Booksy, Gesden…', k: 'crm hubspot pipedrive booksy gesden webhook zapier make' },
  { id: 'material', I: FolderOpen, t: 'Tu material', d: 'Fotos, vídeos, logos y documentos que usan tus agentes.', k: 'fotos videos logo documentos archivos' },
  { id: 'equipo', I: Settings, t: 'Departamentos', d: 'Cómo trabaja cada agente: tono, horarios, aprobaciones y límites.', k: 'departamentos agentes tono como trabaja aprobar' },
  { id: 'plan', I: CreditCard, t: 'Plan y suscripción', d: 'Departamentos contratados, consumo del mes, ampliaciones, pausa y baja.', k: 'plan precio suscripcion consumo cupo ampliar bolsa pausar baja anual tarjeta' },
  { id: 'facturas', I: Receipt, t: 'Facturas', d: 'Descarga tus facturas con IVA y retención.', k: 'facturas pdf iva irpf' },
  { id: 'ajustes', I: BellRing, t: 'Avisos y notificaciones', d: 'Qué te avisamos, por dónde y el resumen semanal.', k: 'avisos notificaciones correo email resumen' },
  { id: 'perfil', I: Monitor, t: 'Perfil y apariencia', d: 'Tu cuenta y el modo claro u oscuro del panel.', k: 'perfil tema oscuro claro modo apariencia cuenta' },
];
export function Configuracion({ o, ir, abrirPerfil }) {
  const [q, setQ] = useState(''); const x = q.trim().toLowerCase();
  const lista = CATEGORIAS.filter((c) => !x || `${c.t} ${c.d} ${c.k}`.toLowerCase().includes(x));
  return (
    <div className="vista">
      <header className="pc-cab"><div><p className="pc-cab__k">{o.negocio.nombre}</p><h1>Configuración</h1></div>
        <label className="cfg-busca"><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en ajustes…" aria-label="Buscar en ajustes" /></label></header>
      <div className="cfg">{lista.map((c) => (
        <button key={c.id} type="button" className="cfg__c" onClick={() => (c.id === 'perfil' ? abrirPerfil() : ir(c.id))}>
          <span className="cfg__i"><c.I size={18} /></span><span><b>{c.t}</b><small>{c.d}</small></span><ChevronRight size={16} />
        </button>
      ))}{!lista.length && <p className="muted">No hay ajustes con «{q}».</p>}</div>
    </div>
  );
}

// Secciones por departamento (Agenda, Clientes, Publicaciones, Reseñas, Artículos), mejoras del plan,
// plan y baja, facturas y avisos. Cada sección solo aparece si el departamento está contratado.
import { useMemo, useState } from 'react';
import { ajustesDe } from '../../data/oficinaAjustes';
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarPlus, UserPlus, Link2, Check, Copy, Download, ExternalLink, Lock, MessageCircle, PauseCircle, Plus, Sparkles, Star, X } from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { DEPARTAMENTOS, DEPTO, AVISO_CUPO, precioOficina, precioAnual, webIncluida, WEB_DESDE, BOLSA_EXTRA, unidadesBolsa } from '../../data/oficinaSaas';
import { api, pendiente, cupoDe } from './datos';
import { Ampliar } from './ampliar';
import { Calendario, PanelCita } from './calendario';
import { Medidor } from './graficos';
import { Avatar, Tarjeta } from './ui';
import { fmt, hace } from './formato';
import { WebIncluida } from './vistas';
import { SECCION_DE } from './formato';

const fechaCorta = (d) => new Date(d).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const aLocal = (d) => { if (!d) return ''; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
const eur = (n) => `${fmt(n, Number(n) % 1 ? 2 : 0)} €`;

function Vacio({ icono: Icono, titulo, texto, children }) {
  return <Tarjeta><div className="vacio-g">{Icono && <Icono size={28} />}<h2>{titulo}</h2><p>{texto}</p>{children}</div></Tarjeta>;
}

// ---------- Agenda (Citas y reservas) ----------
function Cita({ c, o }) {
  const [fecha, setFecha] = useState(aLocal(c.fecha)); const [st, setSt] = useState('');
  async function cambiar(estado) {
    setSt('…');
    try {
      if (!o.demo) await api('cita', { id: c.id, estado, fecha: fecha ? new Date(fecha).toISOString() : undefined });
      o.setEstado((s) => ({ ...s, citas: s.citas.map((x) => (x.id === c.id ? { ...x, estado, fecha: fecha ? new Date(fecha).toISOString() : x.fecha } : x)) })); setSt('');
    } catch (e) { setSt(e.message); }
  }
  return (
    <li className={`cita is-${c.estado}`}>
      <div className="cita__h"><span className="conv-av">{(c.nombre || '?').slice(0, 1)}</span><div><b>{c.nombre || 'Cliente'}</b><small>{c.servicio || 'Cita'} · {{ whatsapp: 'WhatsApp', web: 'Chat web', manual: 'Apuntada por ti' }[c.canal] || 'Apuntada por ti'} · {hace(c.creado)}</small></div>
        <span className={`chip ${c.estado === 'pendiente' ? 'chip--aviso' : ''}`}>{{ pendiente: 'Por confirmar', confirmada: c.recordado ? 'Confirmada · recordada' : 'Confirmada', cancelada: 'Rechazada', hecha: 'Hecha' }[c.estado]}</span></div>
      <p className="cita__cuando"><CalendarCheck size={15} /> {c.fecha ? fechaCorta(c.fecha) : 'Sin hora concreta'}{c.cuando_texto && <span className="muted"> · pidió «{c.cuando_texto}»</span>}</p>
      {c.estado === 'pendiente' && (
        <div className="cita__acc">
          <label className="campo campo--linea"><span>Día y hora</span><input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
          <button className="btn btn--pri btn--sm" onClick={() => cambiar('confirmada')} disabled={!fecha}><Check size={14} /> Confirmar y avisarle</button>
          <button className="btn btn--fan btn--sm" onClick={() => cambiar('cancelada')}>No puedo</button>
        </div>
      )}
      {c.estado === 'confirmada' && <div className="cita__acc"><button className="btn btn--sec btn--sm" onClick={() => cambiar('hecha')}>Marcar como hecha</button><button className="btn btn--fan btn--sm" onClick={() => cambiar('cancelada')}>Anular</button></div>}
      {c.conversacion_id && <button className="enlace" onClick={() => o.ir('conversaciones', c.conversacion_id)}><MessageCircle size={14} /> Ver la conversación</button>}
      {st && <small className="muted">{st}</small>}
    </li>
  );
}
export function NuevaCita({ o, cerrar }) {
  const servicios = String(ajustesDe('citas', o.deptos.find((d) => d.depto === 'citas')?.ajustes).servicios || '').split('\n').map((x) => x.split('·')[0].trim()).filter(Boolean);
  const [f, setF] = useState({ nombre: '', telefono: '', servicio: '', fecha: '' }); const [st, setSt] = useState('');
  async function guardar(e) {
    e.preventDefault(); setSt('Guardando…');
    try {
      const nueva = { ...f, fecha: f.fecha ? new Date(f.fecha).toISOString() : '' };
      const c = o.demo ? { id: `ci${Date.now()}`, ...nueva, canal: f.telefono ? 'whatsapp' : 'manual', estado: 'confirmada', creado: new Date().toISOString() } : (await api('cita', { nueva })).cita;
      o.setEstado((s) => ({ ...s, citas: [c, ...s.citas] })); cerrar();
    } catch (err) { setSt(err.message); }
  }
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Apuntar una cita" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <form className="modal__c form1" onSubmit={guardar}>
        <header><b>Apuntar una cita</b><button type="button" className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        <p className="muted">Para las que te piden por teléfono o en persona. Si pones el móvil, tu agente le mandará el recordatorio.</p>
        <label className="campo"><span>Nombre</span><input required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Laura" /></label>
        <label className="campo"><span>Móvil (opcional)</span><input type="tel" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} placeholder="600 000 000" /></label>
        <label className="campo"><span>Servicio</span><input list="servicios-cita" value={f.servicio} onChange={(e) => setF({ ...f, servicio: e.target.value })} placeholder="Corte" />
          <datalist id="servicios-cita">{servicios.map((x) => <option key={x} value={x} />)}</datalist></label>
        <label className="campo"><span>Día y hora</span><input required type="datetime-local" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
        <div className="fila-btn"><button className="btn btn--pri"><Check size={15} /> Apuntar cita</button>{st && <span className="muted">{st}</span>}</div>
      </form>
    </div>
  );
}
export function Agenda({ o }) {
  const [vista, setVista] = useState('calendario'); const [tab, setTab] = useState('pendiente'); const [nueva, setNueva] = useState(false); const [sel, setSel] = useState(null);
  const ahora = o.ahora;
  const grupos = {
    pendiente: o.citas.filter((c) => c.estado === 'pendiente'),
    proximas: o.citas.filter((c) => c.estado === 'confirmada' && (!c.fecha || new Date(c.fecha) >= ahora - 36e5)).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')),
    pasadas: o.citas.filter((c) => ['hecha', 'cancelada'].includes(c.estado) || (c.estado === 'confirmada' && c.fecha && new Date(c.fecha) < ahora - 36e5)),
  };
  const calendario = o.conexiones.some((c) => c.herramienta === 'google_calendar' && c.estado === 'conectada');
  const citaSel = sel && o.citas.find((c) => c.id === sel);
  return (
    <div className="vista">
      {!calendario && <p className="banda-prueba"><CalendarCheck size={17} /><span>Conecta tu <b>Google Calendar</b> y cada cita que confirmes se apuntará sola en tu agenda.</span><button className="enlace" onClick={() => o.ir('conexiones')}>Conectar</button></p>}
      {grupos.pendiente.length > 0 && vista === 'calendario' && (
        <section className="cal-pend"><b>{grupos.pendiente.length} {grupos.pendiente.length === 1 ? 'cita espera' : 'citas esperan'} que las confirmes</b>
          {grupos.pendiente.map((c) => <button key={c.id} onClick={() => setSel(c.id)}><span className="conv-av">{(c.nombre || '?').slice(0, 1)}</span><span><b>{c.nombre || 'Cliente'}</b><small>{c.servicio || 'Cita'} · {c.fecha ? fechaCorta(c.fecha) : c.cuando_texto}</small></span></button>)}</section>
      )}
      <div className="filtros"><div className="seg">{[['calendario', 'Calendario'], ['lista', 'Lista']].map(([k, t]) => <button key={k} aria-pressed={vista === k} onClick={() => setVista(k)}>{t}</button>)}</div>
        {vista === 'lista' && <button className="btn btn--pri btn--sm" onClick={() => setNueva(true)}><CalendarPlus size={15} /> Apuntar una cita</button>}</div>
      {vista === 'calendario' ? <Calendario o={o} abrirCita={(c) => setSel(c.id)} nueva={() => setNueva(true)} /> : (<>
        <div className="seg">{[['pendiente', `Por confirmar (${grupos.pendiente.length})`], ['proximas', `Próximas (${grupos.proximas.length})`], ['pasadas', 'Pasadas']].map(([k, t]) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)}>{t}</button>)}</div>
        {grupos[tab].length ? <ul className="citas">{grupos[tab].map((c) => <Cita key={c.id} c={c} o={o} />)}</ul>
          : <Vacio icono={CalendarCheck} titulo={tab === 'pendiente' ? 'Ninguna cita por confirmar' : 'Nada por aquí'} texto="Cuando un cliente pida cita por WhatsApp o por el chat, tu agente le pedirá el día y la hora y te la dejará aquí para que la confirmes con un clic." />}
      </>)}
      {nueva && <NuevaCita o={o} cerrar={() => setNueva(false)} />}
      {citaSel && <PanelCita c={citaSel} cerrar={() => setSel(null)}><ul className="citas"><Cita c={citaSel} o={o} /></ul></PanelCita>}
    </div>
  );
}

// ---------- Clientes potenciales (Ventas) ----------
const ETAPAS = [['nuevo', 'Nuevos'], ['contactado', 'Hablando'], ['presupuesto', 'Presupuesto enviado'], ['ganado', 'Ganados'], ['perdido', 'Perdidos']];
export function NuevoCliente({ o, cerrar }) {
  const [f, setF] = useState({ nombre: '', telefono: '', interes: '', importe: '' }); const [st, setSt] = useState('');
  async function guardar(e) {
    e.preventDefault(); setSt('Guardando…');
    try {
      const l = o.demo ? { id: `l${Date.now()}`, ...f, importe: f.importe || null, canal: 'manual', etapa: 'nuevo', creado: new Date().toISOString() } : (await api('lead', { nuevo: f })).lead;
      o.setEstado((s) => ({ ...s, leads: [l, ...s.leads] })); cerrar();
    } catch (err) { setSt(err.message); }
  }
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Añadir cliente" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <form className="modal__c form1" onSubmit={guardar}>
        <header><b>Añadir un cliente potencial</b><button type="button" className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        <label className="campo"><span>Nombre</span><input required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Paula" /></label>
        <label className="campo"><span>Móvil (opcional)</span><input type="tel" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} placeholder="600 000 000" /></label>
        <label className="campo"><span>Qué le interesa</span><input value={f.interes} onChange={(e) => setF({ ...f, interes: e.target.value })} placeholder="Pack novia con prueba" /></label>
        <label className="campo"><span>Importe aproximado (€)</span><input type="number" min="0" value={f.importe} onChange={(e) => setF({ ...f, importe: e.target.value })} /></label>
        <div className="fila-btn"><button className="btn btn--pri"><Check size={15} /> Añadir</button>{st && <span className="muted">{st}</span>}</div>
      </form>
    </div>
  );
}
export function Clientes({ o }) {
  const [abierto, setAbierto] = useState(null); const [nuevo, setNuevo] = useState(false);
  const modal = nuevo && <NuevoCliente o={o} cerrar={() => setNuevo(false)} />;
  const boton = <button className="btn btn--pri btn--sm" onClick={() => setNuevo(true)}><UserPlus size={15} /> Añadir cliente</button>;
  const total = o.leads.length; const ganados = o.leads.filter((l) => l.etapa === 'ganado');
  const cerrados = ganados.length + o.leads.filter((l) => l.etapa === 'perdido').length;
  async function mover(l, cambios) {
    o.setEstado((s) => ({ ...s, leads: s.leads.map((x) => (x.id === l.id ? { ...x, ...cambios } : x)) }));
    if (!o.demo) await api('lead', { id: l.id, ...cambios }).catch(() => {});
  }
  if (!total) return <div className="vista"><Vacio icono={Sparkles} titulo="Aún no hay clientes potenciales" texto="Cada persona que pida presupuesto o muestre interés en comprar aparecerá aquí, y tu agente de Ventas le hará el seguimiento. También puedes añadirlos tú.">{boton}</Vacio>{modal}</div>;
  return (
    <div className="vista">
      <div className="filtros"><span className="muted">Mueve cada cliente con las flechas o márcalo como ganado o perdido.</span>{boton}</div>
      {modal}
      <div className="kpis">
        <article className="kpi"><span>En marcha</span><b>{fmt(o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)).length)}</b><footer><em>{eur(o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)).reduce((a, l) => a + Number(l.importe || 0), 0))} en juego</em></footer></article>
        <article className="kpi"><span>Ganados</span><b>{fmt(ganados.length)}</b><footer><em>{eur(ganados.reduce((a, l) => a + Number(l.importe || 0), 0))}</em></footer></article>
        <article className="kpi"><span>Tasa de cierre</span><b>{cerrados ? `${Math.round((ganados.length / cerrados) * 100)} %` : '—'}</b><footer><em>de los ya decididos</em></footer></article>
      </div>
      <div className="embudo">
        {ETAPAS.map(([k, t], i) => {
          const col = o.leads.filter((l) => l.etapa === k);
          return (
            <section key={k} className={`embudo__col is-${k}`}>
              <header><b>{t}</b><span>{col.length}{col.some((l) => l.importe) ? ` · ${eur(col.reduce((a, l) => a + Number(l.importe || 0), 0))}` : ''}</span></header>
              {col.map((l) => (
                <article key={l.id} className="lead">
                  <button className="lead__c" onClick={() => setAbierto(abierto === l.id ? null : l.id)}><b>{l.nombre || 'Cliente'}</b><span>{l.interes}</span><small>{{ whatsapp: 'WhatsApp', web: 'Web', manual: 'Añadido por ti' }[l.canal] || 'Web'} · {hace(l.creado)}{l.importe ? ` · ${eur(l.importe)}` : ''}</small></button>
                  {abierto === l.id && (
                    <div className="lead__d">
                      <label className="campo campo--linea"><span>Importe (€)</span><input type="number" min="0" defaultValue={l.importe ?? ''} onBlur={(e) => mover(l, { importe: e.target.value })} /></label>
                      <label className="campo"><span>Notas</span><textarea rows={2} defaultValue={l.nota || ''} onBlur={(e) => mover(l, { nota: e.target.value })} placeholder="Lo hablado, cuándo volver a llamar…" /></label>
                      {l.contacto && l.canal !== 'web' && <small className="muted">Móvil: +{l.contacto}</small>}
                      {l.conversacion_id && <button className="enlace" onClick={() => o.ir('conversaciones', l.conversacion_id)}><MessageCircle size={14} /> Conversación</button>}
                    </div>
                  )}
                  <footer>
                    {i > 0 && <button className="ico" aria-label="Etapa anterior" onClick={() => mover(l, { etapa: ETAPAS[i - 1][0] })}><ArrowLeft size={15} /></button>}
                    {k !== 'ganado' && k !== 'perdido' && <button className="btn btn--sec btn--sm" onClick={() => mover(l, { etapa: 'ganado' })}>Ganado</button>}
                    {k !== 'perdido' && k !== 'ganado' && <button className="btn btn--fan btn--sm" onClick={() => mover(l, { etapa: 'perdido' })}>Perdido</button>}
                    {i < 2 && <button className="ico" aria-label="Siguiente etapa" onClick={() => mover(l, { etapa: ETAPAS[i + 1][0] })}><ArrowRight size={15} /></button>}
                  </footer>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Publicaciones (Redes) y Artículos (Contenido) ----------
function Encargo({ o, depto, placeholder }) {
  const [t, setT] = useState(''); const [st, setSt] = useState('');
  async function pedir(e) {
    e.preventDefault(); if (!t.trim()) return; setSt('Tu agente se ha puesto con ello…');
    try {
      if (o.demo) await new Promise((r) => setTimeout(r, 900)); else await api('encargo', { depto, tema: t });
      setT(''); setSt('¡Listo! Lo tienes abajo para revisarlo.');
    } catch (err) { setSt(err.message); }
  }
  return (
    <Tarjeta titulo={depto === 'redes' ? 'Pide un post' : 'Pide un artículo'}>
      <form className="linea" onSubmit={pedir}><input value={t} onChange={(e) => setT(e.target.value)} placeholder={placeholder} aria-label="Sobre qué" /><button className="btn btn--pri"><Sparkles size={15} /> Pedir</button></form>
      {st && <p className="muted">{st}</p>}
    </Tarjeta>
  );
}
function Pieza({ e, o, largo }) {
  const [ver, setVer] = useState(false); const [texto, setTexto] = useState(e.detalle?.texto || '');
  const pend = pendiente(e);
  async function decidir(decision) {
    if (!o.demo) await api('tarea', { id: e.id, decision, texto }).catch(() => {});
    o.setEstado((s) => ({ ...s, eventos: s.eventos.map((x) => (x.id === e.id ? { ...x, resuelto: true, respuesta: decision === 'aprobar' ? 'Aprobado' : 'Descartado' } : x)) }));
  }
  const titulo = e.detalle?.titulo || (e.texto.match(/«(.+?)»/) || [])[1] || e.texto;
  return (
    <li className="pieza">
      <div className="pieza__h"><div><b>{titulo}</b><small>{e.detalle?.dia ? `Para el ${e.detalle.dia} · ` : ''}{hace(e.creado)} · {pend ? 'Esperando tu aprobación' : e.respuesta || 'Hecho'}</small></div>
        <span className={`chip ${pend ? 'chip--aviso' : ''}`}>{pend ? 'Por revisar' : e.respuesta === 'Descartado' ? 'Descartado' : 'Aprobado'}</span></div>
      {texto && (ver || !largo) && <textarea className="pieza__t" rows={largo ? 14 : 4} value={texto} onChange={(x) => setTexto(x.target.value)} readOnly={!pend} aria-label="Texto" />}
      {e.detalle?.idea_imagen && <p className="muted nota">Idea de imagen: {e.detalle.idea_imagen}</p>}
      <div className="b-acc">
        {largo && texto && <button className="btn btn--sec btn--sm" onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Leer'}</button>}
        {texto && <button className="btn btn--sec btn--sm" onClick={() => navigator.clipboard?.writeText(texto).catch(() => {})}><Copy size={14} /> Copiar</button>}
        {pend && <><button className="btn btn--pri btn--sm" onClick={() => decidir('aprobar')}><Check size={14} /> Aprobar</button><button className="btn btn--fan btn--sm" onClick={() => decidir('descartar')}>Descartar</button></>}
      </div>
    </li>
  );
}
export function Publicaciones({ o }) {
  const piezas = o.eventos.filter((e) => e.depto === 'redes' && (e.detalle?.texto || e.tipo === 'pendiente'));
  const hechas = o.eventos.filter((e) => e.depto === 'redes' && e.tipo === 'hecho' && !e.detalle?.texto);
  const red = ['instagram', 'facebook', 'tiktok'].filter((h) => o.conexiones.some((c) => c.herramienta === h && c.estado === 'conectada'));
  return (
    <div className="vista">
      {!red.length && <p className="banda-prueba"><Sparkles size={17} /><span>Conecta <b>Instagram o Facebook</b> y los posts que apruebes se publicarán solos. Mientras, puedes copiarlos y publicarlos tú.</span><button className="enlace" onClick={() => o.ir('conexiones')}>Conectar</button></p>}
      <Encargo o={o} depto="redes" placeholder="Ej.: la promoción de Navidad, el nuevo tratamiento de keratina…" />
      <Tarjeta titulo="Posts preparados" extra={<span className="muted">{piezas.filter(pendiente).length} por revisar</span>}>
        {piezas.length ? <ul className="piezas">{piezas.slice(0, 30).map((e) => <Pieza key={e.id} e={e} o={o} />)}</ul> : <p className="muted">Cada lunes tu agente prepara las publicaciones de la semana. También puedes pedirle una ahora.</p>}
      </Tarjeta>
      {hechas.length > 0 && <Tarjeta titulo="Publicado"><ol className="feed">{hechas.slice(0, 10).map((e) => <li key={e.id} className="ev" style={{ '--c': DEPTO.redes.color }}><i /><div><p>{e.texto}</p><span>{hace(e.creado)}</span></div></li>)}</ol></Tarjeta>}
    </div>
  );
}
export function Articulos({ o }) {
  const piezas = o.eventos.filter((e) => e.depto === 'contenido' && e.detalle?.accion === 'articulo');
  return (
    <div className="vista">
      <Encargo o={o} depto="contenido" placeholder="Ej.: cómo cuidar el pelo teñido en verano" />
      <Tarjeta titulo="Artículos" extra={<span className="muted">{piezas.length}</span>}>
        {piezas.length ? <ul className="piezas">{piezas.map((e) => <Pieza key={e.id} e={e} o={o} largo />)}</ul> : <p className="muted">Cada mes tu agente escribe un artículo pensado para que te encuentren en Google. También puedes pedirle uno ahora.</p>}
      </Tarjeta>
    </div>
  );
}

// ---------- Reseñas (Google) ----------
function PedirResenas({ o }) {
  const aj = ajustesDe('google', o.deptos.find((d) => d.depto === 'google')?.ajustes); const [st, setSt] = useState('');
  const texto = `¡Gracias por venir a ${o.negocio.nombre}! Si te ha gustado, nos ayudas muchísimo dejándonos una reseña en Google: ${aj.enlace_resenas || '[tu enlace]'}`;
  const copiar = (t) => navigator.clipboard?.writeText(t).then(() => setSt('Copiado. Pégalo en WhatsApp o donde quieras.'), () => setSt('Selecciónalo y cópialo a mano.'));
  return (
    <Tarjeta titulo="Consigue más reseñas" extra={<Link2 size={17} className="muted" />}>
      {aj.enlace_resenas ? (<>
        <p className="muted">Mándale este mensaje a tus clientes contentos (después de la cita, por ejemplo). Cuantas más reseñas, más arriba sales en Google Maps.</p>
        <blockquote className="cita-t">{texto}</blockquote>
        <div className="fila-btn"><button className="btn btn--pri btn--sm" onClick={() => copiar(texto)}><Copy size={14} /> Copiar mensaje</button><button className="btn btn--sec btn--sm" onClick={() => copiar(aj.enlace_resenas)}>Copiar solo el enlace</button>{st && <span className="muted">{st}</span>}</div>
      </>) : <p className="muted">Pon tu enlace para pedir reseñas en <b>Cómo trabaja</b> (arriba) y aquí tendrás el mensaje listo para mandar a tus clientes. Lo encuentras en tu ficha de Google, en «Pedir reseñas».</p>}
    </Tarjeta>
  );
}
export function Resenas({ o }) {
  const res = o.eventos.filter((e) => e.depto === 'google' && e.detalle?.estrellas);
  const media = res.length ? res.reduce((a, e) => a + e.detalle.estrellas, 0) / res.length : null;
  const dist = [5, 4, 3, 2, 1].map((n) => [n, res.filter((e) => e.detalle.estrellas === n).length]);
  const conectado = o.conexiones.some((c) => c.herramienta === 'google_business' && c.estado === 'conectada');
  return (
    <div className="vista">
      {!conectado && <p className="banda-prueba"><Star size={17} /><span>Conecta tu <b>Perfil de Empresa de Google</b> para que tu agente responda tus reseñas.</span><button className="enlace" onClick={() => o.ir('conexiones')}>Conectar</button></p>}
      <PedirResenas o={o} />
      <div className="fila fila--1-2">
        <Tarjeta titulo="Tu nota"><div className="nota-g"><b>{media ? fmt(media, 1) : '—'}</b><span className="estrellas">{'★★★★★'.slice(0, Math.round(media || 0))}<i>{'★★★★★'.slice(Math.round(media || 0))}</i></span><small>{fmt(res.length)} reseñas respondidas</small></div>
          <div className="barras-h">{dist.map(([n, c]) => <div key={n}><span>{n} ★<b>{c}</b></span><Medidor valor={c} max={Math.max(1, res.length)} color="#e0a100" /></div>)}</div></Tarjeta>
        <Tarjeta titulo="Últimas reseñas">
          {res.length ? <ul className="piezas">{res.slice(0, 15).map((e) => (
            <li key={e.id} className="pieza"><div className="pieza__h"><div><b>{'★'.repeat(e.detalle.estrellas)}<span className="muted">{'★'.repeat(5 - e.detalle.estrellas)}</span></b><small>{e.texto} · {hace(e.creado)}</small></div>{pendiente(e) && <span className="chip chip--aviso">Por revisar</span>}</div>
              {e.detalle.original && <blockquote className="cita-t">«{e.detalle.original}»</blockquote>}{e.detalle.texto && <p className="resp"><b>Tu respuesta:</b> {e.detalle.texto}</p>}
              {pendiente(e) && <button className="btn btn--pri btn--sm centro-izq" onClick={() => o.ir('actividad', null, 'tuyo')}>Revisar respuesta</button>}</li>
          ))}</ul> : <p className="muted">Aún no hay reseñas respondidas.</p>}
        </Tarjeta>
      </div>
    </div>
  );
}

// ---------- Mejora: departamento no contratado ----------
export function Mejora({ o, depto }) {
  const info = DEPTO[depto]; const n = o.deptos.length; const anual = o.negocio.periodo === 'anio';
  const extra = anual ? precioAnual(n + 1) - precioAnual(n) : precioOficina(n + 1) - precioOficina(n);
  const [conf, setConf] = useState(false); const [st, setSt] = useState('');
  async function anadir() {
    setSt('Añadiendo…');
    try {
      const sel = [...o.deptos.map((d) => d.depto), depto];
      if (!o.demo) await api('plan', { deptos: sel });
      o.setEstado((s) => ({ ...s, deptos: [...s.deptos, { depto, cupo_n: info.cupo.n, activo: true, ajustes: {} }] }));
      setSt(''); o.ir(SECCION_DE[depto] || 'inicio');
    } catch (e) { setSt(e.message); }
  }
  return (
    <div className="vista">
      <section className="mejora a-card" style={{ '--c': info.color }}>
        <Avatar depto={depto} size={56} />
        <div><span className="chip"><Lock size={12} /> No incluido en tu plan</span><h2>{info.nombre}</h2><p>{info.que}</p>
          <ul className="lista-check">{info.hace.map((h) => <li key={h}><Check size={15} />{h}</li>)}</ul>
          <p className="mejora__precio"><b>+{extra} €</b> {anual ? 'al año' : 'al mes'} · {fmt(info.cupo.n)} {info.cupo.unidad} incluidas · se prorratea desde hoy</p>
          {conf ? <div className="fila-btn"><button className="btn btn--pri" onClick={anadir}>Sí, añadir por {extra} € {anual ? '/año' : '/mes'}</button><button className="btn btn--fan" onClick={() => setConf(false)}>Cancelar</button></div>
            : <button className="btn btn--pri" onClick={() => setConf(true)}><Plus size={16} /> Añadir a mi oficina</button>}
          {st && <p className="muted">{st}</p>}</div>
      </section>
    </div>
  );
}

// Sugerencia de mejora contextual para Inicio.
export function SugerenciaMejora({ o }) {
  const tiene = (d) => o.deptos.some((x) => x.depto === d);
  const pidenCita = o.conversaciones.filter((c) => c.tema === 'citas' || c.necesita === 'cita').length;
  let s = null;
  if (!tiene('citas') && pidenCita) s = { depto: 'citas', t: `${pidenCita} cliente${pidenCita > 1 ? 's han' : ' ha'} pedido cita últimamente`, d: 'Con Citas y reservas tu agente les da hora y les manda el recordatorio.' };
  else if (!tiene('google')) s = { depto: 'google', t: 'Que no se te escape ninguna reseña', d: 'Con Google y reseñas tu agente las responde todas y mantiene viva tu ficha.' };
  else if (o.negocio.periodo !== 'anio' && o.deptos.length >= 2) s = { anual: true, t: `Ahorra ${precioOficina(o.deptos.length) * 12 - precioAnual(o.deptos.length)} € al año`, d: `Pásate al plan anual${o.deptos.length >= WEB_DESDE ? ' y llévate tu web hecha' : ''}.` };
  if (!s) return null;
  return (
    <div className="sugerencia" style={{ '--c': s.depto ? DEPTO[s.depto].color : 'var(--acento)' }}>
      {s.depto ? <Avatar depto={s.depto} size={36} /> : <span className="sugerencia__i"><Sparkles size={18} /></span>}
      <div><b>{s.t}</b><span>{s.d}</span></div>
      <button className="btn btn--sec btn--sm" onClick={() => o.ir(s.anual ? 'plan' : `mejora-${s.depto}`)}>{s.anual ? 'Ver plan anual' : 'Ver cómo'} <ArrowRight size={14} /></button>
    </div>
  );
}

// ---------- Plan: departamentos, anual, web, pausa y baja ----------
const MOTIVOS = [
  ['caro', 'Me sale caro'], ['poco_uso', 'No lo uso lo suficiente'], ['falta', 'Le falta algo que necesito'], ['calidad', 'No me convence cómo trabaja'],
  ['otra', 'Me voy a otra herramienta'], ['negocio', 'Cierro o paro el negocio'], ['otro', 'Otro motivo'],
];
function Baja({ o, cerrar }) {
  const [paso, setPaso] = useState(1); const [motivo, setMotivo] = useState(''); const [coment, setComent] = useState(''); const [st, setSt] = useState('');
  const anual = o.negocio.periodo === 'anio'; const prueba = o.negocio.prueba_hasta && new Date(o.negocio.prueba_hasta) > o.ahora;
  const oferta = {
    caro: o.deptos.length > 1 ? { t: 'Quédate solo con lo que más usas', d: `Si quitas departamentos pagas menos. Con 1 departamento serían ${anual ? `${precioAnual(1)} €/año` : `${precioOficina(1)} €/mes`}.`, b: 'Ajustar mis departamentos', a: 'deptos' } : (!anual ? { t: 'Páusala un mes', d: 'No te cobramos nada durante 30 días y vuelve sola. Sin perder nada de lo configurado.', b: 'Pausar 1 mes', a: 'pausa' } : null),
    poco_uso: !anual ? { t: 'Páusala un mes', d: 'No te cobramos nada durante 30 días y vuelve sola, sin perder lo configurado.', b: 'Pausar 1 mes', a: 'pausa' } : { t: 'Te ayudamos a sacarle partido', d: 'Una videollamada de 20 minutos para dejar tu oficina funcionando al 100 %.', b: 'Quiero esa llamada', a: 'ayuda' },
    falta: { t: 'Cuéntanos qué te falta', d: 'Muchas cosas se pueden configurar o las estamos preparando. Te contestamos en menos de 24 h laborables.', b: 'Hablar con Agutidesigns', a: 'ayuda' },
    calidad: { t: 'Déjanos ajustarlo contigo', d: 'Casi siempre se arregla completando «Lo que saben». Lo revisamos juntos en una llamada corta.', b: 'Quiero que lo revisemos', a: 'ayuda' },
    otra: null, otro: null,
    negocio: !anual ? { t: 'Páusala en lugar de cancelarla', d: 'No pagas nada durante 30 días y la recuperas tal cual cuando vuelvas.', b: 'Pausar 1 mes', a: 'pausa' } : null,
  }[motivo];
  async function hacer(accion) {
    setSt('…');
    try {
      if (accion === 'deptos') { cerrar(); setTimeout(() => document.getElementById('deptos')?.scrollIntoView({ behavior: 'smooth' }), 100); return; }
      if (accion === 'ayuda') { if (!o.demo) await api('ayuda', { mensaje: `Quiere darse de baja (${motivo}). ${coment}` }); setPaso(4); return; }
      if (accion === 'pausa') { const j = o.demo ? { pausa_hasta: new Date(Date.now() + 30 * 864e5).toISOString() } : await api('pausar'); o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, estado: 'pausado', pausa_hasta: j.pausa_hasta } })); setPaso(5); return; }
      const j = o.demo ? { cancela_el: new Date(Date.now() + 20 * 864e5).toISOString() } : await api('cancelar', { motivo, comentario: coment });
      o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, cancela_el: j.cancela_el } })); setPaso(6);
    } catch (e) { setSt(e.message); }
  }
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Cancelar suscripción" onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="modal__c">
        <header><b>{paso >= 4 ? 'Hecho' : 'Cancelar tu suscripción'}</b><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        {paso === 1 && (<>
          <p>Sentimos que quieras irte. ¿Nos dices por qué? Nos ayuda a mejorar.</p>
          <div className="motivos">{MOTIVOS.map(([k, t]) => <label key={k} className={`motivo ${motivo === k ? 'is-on' : ''}`}><input type="radio" name="motivo" checked={motivo === k} onChange={() => setMotivo(k)} />{t}</label>)}</div>
          <label className="campo"><span>¿Algo más? (opcional)</span><textarea rows={2} value={coment} onChange={(e) => setComent(e.target.value)} /></label>
          <div className="fila-btn"><button className="btn btn--pri" disabled={!motivo} onClick={() => setPaso(oferta ? 2 : 3)}>Continuar</button><button className="btn btn--fan" onClick={cerrar}>Mejor no</button></div>
        </>)}
        {paso === 2 && oferta && (<>
          <div className="oferta"><b>{oferta.t}</b><p>{oferta.d}</p><button className="btn btn--pri" onClick={() => hacer(oferta.a)}>{oferta.b}</button></div>
          <button className="enlace enlace--gris" onClick={() => setPaso(3)}>No, gracias. Quiero cancelar</button>
        </>)}
        {paso === 3 && (<>
          <p>{prueba ? 'Estás en la prueba gratis: si cancelas ahora, no se te cobrará nada y tu oficina se detendrá al terminar la prueba.'
            : anual ? 'Tu plan anual ya está pagado: tu oficina seguirá funcionando hasta el final del año contratado y no se renovará.'
              : 'Tu oficina seguirá funcionando hasta el final del mes que ya has pagado y después se detendrá. No se te cobrará nada más.'}</p>
          <p className="muted">Hasta esa fecha puedes reactivarla con un clic.</p>
          <div className="fila-btn"><button className="btn btn--peligro" onClick={() => hacer('cancelar')}>Confirmar la cancelación</button><button className="btn btn--sec" onClick={cerrar}>Me quedo</button></div>
        </>)}
        {paso === 4 && <p>Te escribimos en menos de 24 h laborables. Mientras, tu oficina sigue funcionando igual.</p>}
        {paso === 5 && <p>Tu oficina está en pausa hasta el {new Date(o.negocio.pausa_hasta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}. No se te cobrará nada y volverá sola. Puedes reactivarla antes desde Plan.</p>}
        {paso === 6 && <p>Hecho. Tu oficina seguirá funcionando hasta el {new Date(o.negocio.cancela_el).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}. Si cambias de idea, puedes reactivarla desde Plan.</p>}
        {st && <p className="muted">{st}</p>}
      </div>
    </div>
  );
}

export function Plan({ o }) {
  const [sel, setSel] = useState(o.deptos.map((d) => d.depto)); const [st, setSt] = useState(''); const [conf, setConf] = useState(false); const [baja, setBaja] = useState(false); const [confAnual, setConfAnual] = useState(false);
  const n = o.negocio; const anual = n.periodo === 'anio'; const precio = (k) => (anual ? precioAnual(k) : precioOficina(k)); const ud = anual ? '€/año' : '€/mes';
  const actual = o.deptos.map((d) => d.depto); const cambia = sel.length !== actual.length || sel.some((x) => !actual.includes(x));
  const prueba = n.prueba_hasta && new Date(n.prueba_hasta) > o.ahora; const fecha = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  async function aplicar() {
    setSt('Guardando…');
    try {
      if (!o.demo) await api('plan', { deptos: sel });
      o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, importe_mes: anual ? Math.round(precioAnual(sel.length) / 12) : precioOficina(sel.length), web_incluida: s.negocio.web_incluida || webIncluida(s.negocio.periodo, sel.length) },
        deptos: sel.map((d) => s.deptos.find((x) => x.depto === d) || { depto: d, cupo_n: DEPTO[d].cupo.n, activo: true, ajustes: {} }) }));
      setSt('Listo. Tu oficina ya está actualizada.'); setConf(false);
    } catch (e) { setSt(e.message); }
  }
  async function pasarAnual() {
    setSt('Pasando al plan anual…');
    try { if (!o.demo) await api('anual'); o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, periodo: 'anio', prueba_hasta: null, web_incluida: s.negocio.web_incluida || s.deptos.length >= WEB_DESDE, web_estado: s.negocio.web_estado || (s.deptos.length >= WEB_DESDE ? 'pendiente' : null) } })); setSt('¡Ya tienes el plan anual!'); setConfAnual(false); }
    catch (e) { setSt(e.message); }
  }
  async function reactivar() { setSt('…'); try { if (!o.demo) await api('reactivar'); o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, cancela_el: null, pausa_hasta: null, estado: 'activo' } })); setSt('¡Tu oficina sigue en marcha!'); } catch (e) { setSt(e.message); } }
  async function portal() { if (o.demo) return; try { const j = await api('portal'); window.location.assign(j.url); } catch (e) { setSt(e.message); } }
  const ahorro = precioOficina(o.deptos.length) * 12 - precioAnual(o.deptos.length);
  const hoyD = new Date(o.ahora); const dMes = new Date(hoyD.getFullYear(), hoyD.getMonth() + 1, 0).getDate(); const diaMes = hoyD.getDate();
  return (
    <div className="vista">
      {n.cancela_el && <p className="banda-prueba banda--aviso"><X size={17} /><span><b>Tu suscripción termina el {fecha(n.cancela_el)}.</b> Hasta entonces todo sigue funcionando.</span><button className="btn btn--pri btn--sm" onClick={reactivar}>Reactivar</button></p>}
      {n.estado === 'pausado' && <p className="banda-prueba banda--aviso"><PauseCircle size={17} /><span><b>Tu oficina está en pausa{n.pausa_hasta ? ` hasta el ${fecha(n.pausa_hasta)}` : ''}.</b> Tus agentes no trabajan y no se te cobra nada.</span><button className="btn btn--pri btn--sm" onClick={reactivar}>Reactivar ahora</button></p>}
      <div className="fila fila--2-1">
        <section className="cx">
          <header className="cx__h"><h2>Tu plan</h2><span className={`cx-st ${n.estado === 'pausado' || n.cancela_el ? 'is-aviso' : 'is-ok'}`}><i />{n.estado === 'pausado' ? 'En pausa' : n.cancela_el ? 'Se cancela' : prueba ? 'Prueba gratis' : 'Activo'}</span></header>
          <div className="cx-plan">
            <div><div className="cx-plan__p">{anual ? precioAnual(o.deptos.length) : precioOficina(o.deptos.length)} €<small> {anual ? '/año' : '/mes'} + IVA</small></div>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{anual ? 'Anual' : 'Mensual'} · {o.deptos.length} departamento{o.deptos.length === 1 ? '' : 's'}{prueba ? ` · primer cobro el ${fecha(n.prueba_hasta)}` : ''}</p>
              <div className="cx-row" style={{ marginTop: 10 }}>{o.deptos.map((d) => <span key={d.depto} className="cx-st"><span style={{ width: 7, height: 7, borderRadius: 2, background: DEPTO[d.depto].color }} />{DEPTO[d.depto].corto}</span>)}</div></div>
            <div className="cx-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}><button className="btn btn--sec btn--sm" onClick={portal} disabled={o.demo}><ExternalLink size={13} /> Tarjeta y facturación</button><button className="btn btn--sec btn--sm" onClick={() => o.ir('facturas')}>Ver facturas</button></div>
          </div>
        </section>
        {!anual ? (
          <Tarjeta titulo="Plan anual" className="upsell">
            <p>{ahorro > 0 ? <><b>Ahorra {ahorro} € al año</b> pagando una vez al año (20 % de descuento).</> : <>Paga una vez al año. Con 2 departamentos o más, además, <b>te ahorras el 20 %</b>.</>}{o.deptos.length >= WEB_DESDE ? <> Y <b>te diseñamos tu web</b> o rediseñamos la que tienes.</> : <> Con {WEB_DESDE} departamentos o más, tu web va incluida.</>}</p>
            {confAnual ? <div className="fila-btn"><span className="muted">Se cobran {precioAnual(o.deptos.length)} € + IVA − IRPF hoy (descontando lo que no hayas usado de este mes).</span><button className="btn btn--pri btn--sm" onClick={pasarAnual}>Confirmar</button><button className="btn btn--fan btn--sm" onClick={() => setConfAnual(false)}>No</button></div>
              : <button className="btn btn--pri centro-izq" onClick={() => setConfAnual(true)}>Pasarme al anual <ArrowRight size={15} /></button>}
          </Tarjeta>
        ) : <Tarjeta titulo="Plan anual"><p className="muted">Ya tienes el mejor precio. {n.web_incluida ? 'Tu web va incluida.' : `Con ${WEB_DESDE} departamentos o más, tu web va incluida.`}</p></Tarjeta>}
      </div>
      {n.web_incluida && <WebIncluida o={o} />}
      <Tarjeta titulo="Tus departamentos" id="deptos" extra={<span className="muted">Añade o quita cuando quieras · se prorratea</span>}>
        <ul className="deps">{DEPARTAMENTOS.map((d) => (
          <li key={d.id}><label className="dep-op"><input type="checkbox" checked={sel.includes(d.id)} onChange={() => toggle(d.id)} /><Avatar depto={d.id} size={34} /><div><b>{d.nombre}</b><small>{fmt(d.cupo.n)} {d.cupo.unidad} al mes</small></div><span className="dep-op__x"><Check size={14} strokeWidth={3} /></span></label></li>
        ))}</ul>
        <div className="plan-pie">
          <p><b>{precio(sel.length || 1)} {ud}</b> <span className="muted">· {sel.length} departamento{sel.length === 1 ? '' : 's'} · más IVA</span></p>
          {cambia && sel.length > 0 && (conf ? <span className="fila-btn"><span className="muted">¿Cambiar a {precio(sel.length)} {ud}?</span><button className="btn btn--pri btn--sm" onClick={aplicar}>Sí, cambiar</button><button className="btn btn--fan btn--sm" onClick={() => setConf(false)}>No</button></span>
            : <button className="btn btn--pri" onClick={() => setConf(true)}>Guardar cambios</button>)}
        </div>
        {st && <p className="muted">{st}</p>}
      </Tarjeta>
      <section className="cx" id="consumo">
        <header className="cx__h"><h2>Consumo de este mes</h2><small>día {diaMes} de {dMes}</small><span className="cx-sp" /><span className="cx-legend"><span><i style={{ '--c': 'var(--acento)' }} />Usado</span><span><i style={{ '--c': '#9aa3b5' }} />Previsión a fin de mes</span></span></header>
        {o.deptos.map((d) => {
          const c = cupoDe(o, d.depto); const info = DEPTO[d.depto]; const p = Math.min(1, c.pct); const proy = Math.round((c.usado / Math.max(1, diaMes)) * dMes); const pp = proy / Math.max(1, c.total);
          const diaFinX = c.usado > 0 ? Math.ceil(c.total / (c.usado / Math.max(1, diaMes))) : null; const diaFin = c.pct >= 1 ? diaMes : diaFinX && diaFinX < dMes ? diaFinX : null;
          return (
            <div key={d.depto} className="cx-uso">
              <Avatar depto={d.depto} size={28} />
              <div className="cx-uso__n"><b>{info.nombre}</b><small>{fmt(c.total)} {info.cupo.unidad} al mes</small></div>
              <div className="cx-uso__m">
                <div className={`cx-meter ${p >= 1 ? 'is-mal' : p >= AVISO_CUPO ? 'is-aviso' : ''}`} style={{ '--c': info.color }}><s style={{ width: `${Math.min(100, pp * 100)}%`, background: 'var(--linea2)' }} /><s style={{ width: `${p * 100}%` }} /></div>
                <small><span>{fmt(c.usado)} de {fmt(c.total)} · {Math.round(c.pct * 100)} %</span><span>{c.pct >= 1 ? 'Cupo agotado este mes' : diaFin ? `Al ritmo actual se acaba el día ${diaFin}` : `Previsión: ${fmt(proy)} (${Math.round(pp * 100)} %)`}</span></small>
              </div>
              <span className="cx-uso__p">{diaFin ? <span className="cx-st is-aviso"><i />Se quedará corto</span> : <span className="cx-st is-ok"><i />Va bien</span>}</span>
              <Ampliar o={o} depto={d.depto} sm texto={`+${fmt(unidadesBolsa(d.depto))} · ${BOLSA_EXTRA.precio} €`} />
            </div>
          );
        })}
        <footer className="cx__f"><small className="muted">Te avisamos al llegar al 80 % y al 100 %. Si un departamento se queda corto, amplíalo solo este mes: +50 % de su cupo por {BOLSA_EXTRA.precio} € + IVA. Para que rinda más, completa «Lo que saben»: cuantas más respuestas tengan, menos vueltas da cada conversación.</small></footer>
      </section>
      {o.bolsas?.length > 0 && <section className="cx"><header className="cx__h"><h2>Ampliaciones de este mes</h2></header><ul className="cx-list">{o.bolsas.slice(0, 8).map((b) => <li key={b.id}><Avatar depto={b.depto} size={24} /><div className="cx-list__m"><b>+{fmt(b.unidades)} {DEPTO[b.depto]?.cupo.unidad} en {DEPTO[b.depto]?.nombre}</b><small>{new Date(b.creado).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</small></div><span className="cx-uso__p">{fmt(b.importe)} € + IVA</span></li>)}</ul></section>}
      {!n.cancela_el && <p className="nota muted">¿Quieres irte? <button className="enlace enlace--gris" onClick={() => setBaja(true)}>Cancelar la suscripción</button></p>}
      {baja && <Baja o={o} cerrar={() => setBaja(false)} />}
    </div>
  );
}

// ---------- Facturas ----------
export function Facturas({ o }) {
  const [st, setSt] = useState('');
  async function descargar(f) {
    if (o.demo) { setSt('En la demo no hay facturas reales.'); return; }
    setSt('Preparando…');
    try {
      const j = await api('factura', { id: f.id });
      if (j.pdf) { const a = document.createElement('a'); a.href = `data:application/pdf;base64,${j.pdf}`; a.download = j.nombre; a.click(); setSt(''); }
      else if (j.url) { window.open(j.url, '_blank', 'noopener'); setSt(''); } else setSt('Aún se está generando. Vuelve a probar en un minuto.');
    } catch (e) { setSt(e.message); }
  }
  const total = useMemo(() => o.facturas.filter((f) => f.estado === 'pagada').reduce((a, f) => a + Number(f.total || 0), 0), [o.facturas]);
  return (
    <div className="vista">
      <Tarjeta titulo="Tus facturas" extra={<span className="muted">{o.facturas.length ? `${eur(total)} en total` : ''}</span>}>
        {o.facturas.length ? (
          <div className="tabla-w"><table className="tabla"><thead><tr><th>Fecha</th><th>Nº</th><th>Concepto</th><th>Base</th><th>IVA</th><th>IRPF</th><th>Total</th><th /></tr></thead>
            <tbody>{o.facturas.map((f) => <tr key={f.id}><td>{new Date(f.fecha).toLocaleDateString('es-ES')}</td><td>{f.numero || '—'}</td><td>{f.concepto || 'Oficina de IA'}</td><td>{eur(f.base)}</td><td>{eur(f.iva)}</td><td>{Number(f.retencion) ? `−${eur(f.retencion)}` : '—'}</td><td><b>{eur(f.total)}</b></td>
              <td>{f.estado === 'pagada' ? <button className="btn btn--sec btn--sm" onClick={() => descargar(f)}><Download size={14} /> PDF</button> : <span className="chip">{f.estado === 'error' ? 'En revisión' : 'Generando'}</span>}</td></tr>)}</tbody></table></div>
        ) : <p className="muted">Aquí aparecerá cada factura en cuanto se haga un cobro. También te llega cada una por correo.</p>}
        {st && <p className="muted">{st}</p>}
      </Tarjeta>
    </div>
  );
}

// ---------- Ajustes: avisos y cuenta ----------
export function Avisos({ o }) {
  const p = o.negocio.preferencias || {}; const [email, setEmail] = useState(p.email_avisos || ''); const [st, setSt] = useState('');
  async function guardar(c) {
    o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, preferencias: { ...(s.negocio.preferencias || {}), ...c } } }));
    if (!o.demo) await api('preferencias', c).catch(() => {});
    setSt('Guardado');
  }
  return (
    <div className="vista">
      <Tarjeta titulo="Avisos por correo">
        <div className="ajustes">
          <label className="sw"><input type="checkbox" checked={p.avisos_email !== false} onChange={(e) => guardar({ avisos_email: e.target.checked })} /><span /><div><b>Cuando te necesiten</b><small>Un correo cuando un cliente quiera hablar contigo, pida cita o haya algo que aprobar.</small></div></label>
          <label className="sw"><input type="checkbox" checked={p.resumen_semanal !== false} onChange={(e) => guardar({ resumen_semanal: e.target.checked })} /><span /><div><b>Resumen de la semana</b><small>Cada lunes, lo que han hecho tus agentes y el tiempo que te han ahorrado.</small></div></label>
        </div>
        <form className="linea" onSubmit={(e) => { e.preventDefault(); guardar({ email_avisos: email }); }}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`Enviar a otro correo (ahora: ${o.negocio.owner_email})`} aria-label="Correo para avisos" /><button className="btn btn--sec">Guardar</button></form>
        {st && <p className="muted">{st}</p>}
      </Tarjeta>
      <Tarjeta titulo="Tu cuenta">
        <p>Entras con <b>{o.demo ? 'demo@agutidesigns.io' : o.sesion?.user?.email}</b>. Sin contraseñas: te mandamos un enlace cada vez.</p>
        <div className="fila-btn">{!o.demo && <button className="btn btn--sec" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>}<button className="btn btn--fan" onClick={() => o.ir('conexiones', null, 'ayuda')}>Hablar con Agutidesigns</button></div>
      </Tarjeta>
    </div>
  );
}


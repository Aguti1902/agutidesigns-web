// Guía interactiva de instalación del Kit Oficina de IA: la ven los compradores después de pagar (página de gracias)
// y en /kit-oficina-ia/instalar para volver cuando quieran. Pasos con ilustraciones animadas, progreso guardado en
// este navegador, agentes según el plan y soluciones a los problemas típicos. Complementa la guía en PDF del kit.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, FolderOpen, FileText, File, LayoutDashboard, Sparkles, Paperclip, ChevronDown, Mail, ArrowRight, Clock, Plug, CircleCheck, RotateCcw } from 'lucide-react';
import './GuiaInteractiva.css';

export const AGENTES_KIT = [
  { id: 'webleads', n: 'Nora', p: 'Recepción', archivo: '01-recepcion', cuando: 'Cada hora', con: 'Gmail', que: 'Contesta al momento a cada cliente nuevo que escribe y lo apunta en el panel.', c: '#5b86ff', desde: 4, primero: true },
  { id: 'pipeline', n: 'Sara', p: 'Ventas', archivo: '02-ventas-seguimiento', cuando: 'Cada día, 10:00', con: 'Gmail', que: 'Sigue cada presupuesto con una secuencia corta hasta que dicen sí o no.', c: '#b48cff', desde: 4, primero: true },
  { id: 'contenido', n: 'Marta', p: 'Redes sociales', archivo: '03-redes-sociales', cuando: 'Lunes', con: '—', que: 'Prepara los posts de la semana para que los apruebes.', c: '#ff7a68', desde: 4 },
  { id: 'resumen', n: 'Clara', p: 'Informe diario', archivo: '08-informe-diario', cuando: 'Cada día, 8:30', con: 'Gmail', que: 'Te resume cada mañana qué ha pasado y qué te toca.', c: '#e5fc63', desde: 4, primero: true },
  { id: 'produccion', n: 'Diego', p: 'Vídeos', archivo: '04-videos', cuando: 'Lunes y jueves', con: '—', que: 'Escribe guiones de vídeos cortos listos para grabar.', c: '#3ee0a1', desde: 8 },
  { id: 'seo', n: 'Rafa', p: 'Blog y SEO', archivo: '05-blog-seo', cuando: 'Miércoles', con: '—', que: 'Un artículo a la semana para que te encuentren en Google.', c: '#6ee7b7', desde: 8 },
  { id: 'publicador', n: 'Pablo', p: 'Google Business', archivo: '06-google-business', cuando: 'Martes y viernes', con: 'Gmail', que: 'Publicaciones para tu ficha y respuestas a reseñas.', c: '#ffc65c', desde: 8 },
  { id: 'cs', n: 'Elena', p: 'Reseñas y clientes', archivo: '07-resenas-clientes', cuando: 'Cada día, 18:00', con: 'Gmail', que: 'Pide reseña a los clientes nuevos y propone cómo recuperar a los antiguos.', c: '#f4a7c0', desde: 8 },
  { id: 'ads', n: 'Álex', p: 'Anuncios', archivo: '09-anuncios', cuando: 'Lunes y jueves', con: 'Gmail', que: 'Revisa tus campañas y te propone mejoras para aprobar. Nunca gasta solo.', c: '#ff9f6b', desde: 12 },
  { id: 'analista', n: 'Leo', p: 'Analista', archivo: '10-analista', cuando: 'Lunes, 9:00', con: '—', que: 'Cada lunes, qué canal te trae clientes y qué hacer esta semana.', c: '#9db8ff', desde: 12 },
  { id: 'finanzas', n: 'Max', p: 'Cobros y facturas', archivo: '11-cobros', cuando: 'Miércoles', con: 'Gmail', que: 'Detecta lo que falta por facturar o cobrar y prepara recordatorios amables.', c: '#7ee0c9', desde: 12 },
  { id: 'semanal', n: 'Iris', p: 'Newsletter', archivo: '12-newsletter', cuando: '1.er lunes del mes', con: 'Gmail', que: 'Prepara el correo mensual a tus clientes para que lo apruebes.', c: '#d9a7ff', desde: 12 },
];
export const PLANES_KIT = { starter: { nombre: 'Starter', agentes: 4 }, pro: { nombre: 'Pro', agentes: 8 }, empresa: { nombre: 'Empresa', agentes: 12 } };

const PASOS = ['antes', 'descomprime', 'ficha', 'instalador', 'agentes', 'panel'];
const CLAVE = 'kit-guia-hecho';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch { return []; } };
const guardar = (v) => { try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const reduce = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useVisible(ref, umbral = 0.3) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    if (reduce() || !('IntersectionObserver' in window)) { setV(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold: umbral });
    io.observe(el); return () => io.disconnect();
  }, [ref, umbral]);
  return v;
}

function Copiar({ texto }) {
  const [ok, setOk] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* el texto queda seleccionable */ }
  };
  return (
    <div className="gi-copia">
      <p>{texto}</p>
      <button type="button" onClick={copiar}>{ok ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}</button>
    </div>
  );
}

/* ---------- Ilustraciones animadas de cada paso ---------- */
function IlArchivos({ plan }) {
  const ref = useRef(null); const on = useVisible(ref);
  const ags = AGENTES_KIT.filter((a) => a.desde <= plan.agentes);
  const filas = [
    { I: FileText, t: 'EMPIEZA-AQUI.md', d: 'Léelo primero' },
    { I: File, t: 'GUIA-DE-INSTALACION.pdf', d: 'La guía en PDF' },
    { I: Sparkles, t: 'INSTALAR-CON-CLAUDE.md', d: 'Lo que pegas en Claude', dest: true },
    { I: FileText, t: 'mi-negocio.md', d: 'La ficha de tu negocio', dest: true },
    { I: FolderOpen, t: 'panel/', d: 'panel.html, tu oficina 3D' },
    { I: FolderOpen, t: 'agentes/', d: `${ags.length} archivos, uno por agente` },
  ];
  return (
    <div ref={ref} className={`gi-il gi-files ${on ? 'is-on' : ''}`} aria-hidden="true">
      <div className="gi-win"><i /><i /><i /><b>Kit-Oficina-IA-{plan.nombre}</b></div>
      <ul>{filas.map(({ I, t, d, dest }, k) => <li key={t} style={{ '--k': k }} className={dest ? 'dest' : ''}><I size={17} /><span>{t}</span><em>{d}</em></li>)}</ul>
    </div>
  );
}

const FICHA = [['Nombre del negocio', 'Estudio Lumen'], ['A qué te dedicas', 'Fotografía de bodas y eventos'], ['Ciudad', 'Valencia'], ['Siguiente paso', 'Llamada de 15 minutos'], ['Tono', 'Cercano, de tú']];
function IlFicha() {
  const ref = useRef(null); const on = useVisible(ref);
  return (
    <div ref={ref} className={`gi-il gi-ficha ${on ? 'is-on' : ''}`} aria-hidden="true">
      <div className="gi-win"><i /><i /><i /><b>mi-negocio.md</b></div>
      <div className="gi-ficha__c">
        {FICHA.map(([k, v], i) => <div key={k} className="gi-campo" style={{ '--k': i }}><span>{k}</span><b><span>{v}</span></b></div>)}
        <p className="gi-ficha__nota" style={{ '--k': FICHA.length }}>Ejemplo inventado. Pon los datos de tu negocio.</p>
      </div>
    </div>
  );
}

const CHAT = [
  { de: 'tu', t: 'Eres el instalador de mi oficina de IA. Te he adjuntado un kit con…', adj: true },
  { de: 'claude', t: 'He leído tu ficha. Me faltan 2 datos: ¿tu email para el informe diario y el enlace para reservar?' },
  { de: 'tu', t: 'info@minegocio.com · minegocio.com/reservar' },
  { de: 'claude', t: 'Perfecto. He configurado tu panel con tu nombre y tus colores y lo he publicado ✓' },
  { de: 'claude', t: '¿Qué agentes activamos? Te recomiendo empezar por Recepción, Ventas e Informe diario.' },
];
function IlChat() {
  const ref = useRef(null); const on = useVisible(ref, 0.4);
  const [n, setN] = useState(reduce() ? CHAT.length : 0);
  useEffect(() => {
    if (!on || reduce()) return undefined;
    let k = 0; const id = setInterval(() => { k += 1; setN(k); if (k >= CHAT.length) clearInterval(id); }, 1100);
    return () => clearInterval(id);
  }, [on]);
  return (
    <div ref={ref} className="gi-il gi-chat" aria-hidden="true">
      <div className="gi-win"><i /><i /><i /><b>Claude</b></div>
      <div className="gi-chat__c">
        {CHAT.slice(0, n).map((m, i) => (
          <div key={i} className={`gi-msg gi-msg--${m.de}`}>
            {m.adj && <span className="gi-adj"><Paperclip size={13} /> Kit-Oficina-IA (todos los archivos)</span>}
            <p>{m.t}</p>
          </div>
        ))}
        {n < CHAT.length && on && <div className="gi-escribe"><i /><i /><i /></div>}
      </div>
    </div>
  );
}

function IlPanel() {
  const ref = useRef(null); const on = useVisible(ref);
  const [aprob, setAprob] = useState(false);
  return (
    <div ref={ref} className={`gi-il gi-panel ${on ? 'is-on' : ''}`}>
      <div className="gi-win"><i /><i /><i /><b>Tu panel</b><span className="gi-vivo">En marcha</span></div>
      <div className="gi-panel__c">
        <div className="gi-panel__of" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ '--k': i }} />)}</div>
        <p className="gi-panel__t">Esperan tu visto bueno</p>
        <div className={`gi-apr ${aprob ? 'ok' : ''}`}>
          <div><b>Post de Instagram para mañana</b><span>Marta · Redes sociales</span></div>
          <button type="button" onClick={() => setAprob((x) => !x)}>{aprob ? <><Check size={14} /> Aprobado</> : 'Aprobar'}</button>
        </div>
        <div className="gi-apr gi-apr--b"><div><b>Llamar a Laura (pidió precio)</b><span>Tarea para ti</span></div><em>Pendiente</em></div>
      </div>
      <p className="gi-il__pista">Pruébalo: pulsa «Aprobar».</p>
    </div>
  );
}

function Agentes({ plan }) {
  const ags = AGENTES_KIT.filter((a) => a.desde <= plan.agentes);
  const [sel, setSel] = useState(ags[0].id);
  const a = ags.find((x) => x.id === sel) || ags[0];
  return (
    <div className="gi-ags">
      <div className="gi-ags__l" role="group" aria-label="Tus agentes">
        {ags.map((x) => (
          <button key={x.id} type="button" aria-pressed={x.id === sel} onClick={() => setSel(x.id)} style={{ '--c': x.c }}>
            <i />{x.n}<span>{x.p}</span>{x.primero && <em>Empieza</em>}
          </button>
        ))}
      </div>
      <div className="gi-ags__f" style={{ '--c': a.c }} aria-live="polite">
        <p className="gi-ags__n"><i />{a.n} · {a.p}</p>
        <p>{a.que}</p>
        <ul>
          <li><Clock size={15} /> {a.cuando}</li>
          <li><Plug size={15} /> {a.con === '—' ? 'No necesita conectores' : `Necesita: ${a.con}`}</li>
          <li><FileText size={15} /> agentes/{a.archivo}.md</li>
        </ul>
      </div>
    </div>
  );
}

const PERSONALIZA = [
  'Cambia la tarea de Sara para que el segundo seguimiento sea a los 3 días y proponga reservar cita en mi web en vez de una llamada.',
  'Cambia el horario de Marta para que prepare los posts los domingos por la tarde.',
  'Crea un agente nuevo para mi oficina, con el mismo formato que los del kit: «Lucas, de atención por WhatsApp», que…',
  'Cambia el color de mi panel a #0f766e y vuelve a publicarlo.',
];

const PROBLEMAS = [
  { q: 'Claude no me deja crear tareas programadas', a: 'Tu plan de Claude tiene que incluir tareas programadas. Compruébalo en claude.ai. Si no las tienes, el instalador te dará el texto de cada agente para que lo lances a mano cuando quieras.' },
  { q: 'El panel enseña datos de ejemplo', a: 'Eso pasa si abres panel.html en tu ordenador. Tus datos reales aparecen cuando el instalador lo publica como página de Claude con base de datos. Pídele: «Publica panel/panel.html como artefacto con las capacidades db y user y dame el enlace».' },
  { q: 'Un agente no hace nada', a: 'Ábrelo en tus tareas programadas y lánzalo a mano una vez. Lee su última línea de resumen: suele decir qué le falta (normalmente un conector como Gmail o un dato de tu ficha).' },
  { q: 'No sé conectar Gmail', a: 'En Claude, ve a la configuración de conectores, busca Gmail y conéctalo con tu cuenta. Después dile al instalador «ya está conectado» y seguirá.' },
  { q: 'Quiero cambiar lo que dice un agente', a: 'Pídeselo a Claude con tus palabras (tienes ejemplos arriba). Cada agente es un texto: no tienes que tocar nada técnico.' },
];

/* ---------- La guía ---------- */
export default function GuiaInteractiva({ planId = 'pro', elegirPlan = true }) {
  const [pid, setPid] = useState(PLANES_KIT[planId] ? planId : 'pro');
  const plan = PLANES_KIT[pid];
  const [hecho, setHecho] = useState([]);
  useEffect(() => { setHecho(leer()); }, []);
  useEffect(() => { if (PLANES_KIT[planId]) setPid(planId); }, [planId]);
  const marcar = (id) => setHecho((h) => { const v = h.includes(id) ? h.filter((x) => x !== id) : [...h, id]; guardar(v); return v; });
  const pct = Math.round((hecho.filter((x) => PASOS.includes(x)).length / PASOS.length) * 100);
  const [req, setReq] = useState({});

  const pasos = useMemo(() => [
    { id: 'antes', t: 'Antes de empezar', d: 'Tres cosas y listo. Si te falta alguna, resuélvela primero: te ahorrará atascos.', body: (
      <ul className="gi-check">
        {[['claude', 'Tengo una cuenta de Claude de pago con tareas programadas y conectores'], ['gmail', 'Tengo Gmail o Google Workspace para conectarlo'], ['tiempo', 'Tengo entre 30 y 60 minutos tranquilos']].map(([k, t]) => (
          <li key={k}><label><input type="checkbox" checked={!!req[k]} onChange={() => setReq((r) => ({ ...r, [k]: !r[k] }))} /><span className="gi-box"><Check size={14} /></span>{t}</label></li>
        ))}
      </ul>
    ) },
    { id: 'descomprime', t: 'Descomprime el kit', d: 'Haz doble clic en el .zip que has descargado. Dentro tienes todo esto. Los dos archivos marcados son los que vas a usar ahora.', il: <IlArchivos plan={plan} /> },
    { id: 'ficha', t: 'Rellena la ficha de tu negocio', d: 'Abre mi-negocio.md con cualquier editor de texto y completa lo que puedas: qué vendes, tu ciudad, el siguiente paso que quieres que propongan tus agentes, tu email y tu tono. Es lo único que saben tus agentes: lo que no pongas, no lo dirán. ¿Te da pereza? Sáltatelo: Claude te lo preguntará.', il: <IlFicha /> },
    { id: 'instalador', t: 'Pega el instalador en Claude', d: 'Abre Claude (web, escritorio o Claude Code), adjunta todos los archivos del kit, abre INSTALAR-CON-CLAUDE.md, copia el texto desde «Eres el instalador» hasta el final y pégalo. Claude te hará unas preguntas, configurará tu panel con tu nombre y tus colores y lo publicará.', il: <IlChat /> },
    { id: 'agentes', t: 'Activa a tus agentes', d: 'Claude te preguntará cuáles quieres. No los actives todos el primer día: empieza por los marcados y añade los demás cuando funcionen. Toca cada uno para ver cuándo trabaja y qué necesita.', il: <Agentes plan={plan} /> },
    { id: 'panel', t: 'Abre tu panel cada día', d: 'Guarda el enlace del panel en favoritos. Cada día, cinco minutos: aprueba o descarta lo que te proponen, haz las tareas que te dejan y mira cómo van tus clientes. El informe diario te llega también por correo.', il: <IlPanel /> },
  ], [plan, req]);

  return (
    <div className="gi">
      <div className="gi-barra">
        <div className="ag-wrap gi-barra__in">
          <span><b>{pct} %</b> de tu instalación</span>
          <span className="gi-barra__p"><span style={{ width: `${pct}%` }} /></span>
          {pct > 0 && <button type="button" onClick={() => { setHecho([]); guardar([]); }} aria-label="Empezar de cero"><RotateCcw size={15} /></button>}
        </div>
      </div>

      <section className="gi-intro">
        <div className="ag-wrap">
          <p className="gi-k">Guía de instalación</p>
          <h2 className="gi-h2">Monta tu oficina<br /><span>paso a paso.</span></h2>
          <p className="gi-lead">Sigue los pasos en orden y márcalos al terminar: tu progreso se guarda en este navegador. Tienes lo mismo, con más detalle, en el PDF del kit.</p>
          {elegirPlan && (
            <div className="gi-plan" role="group" aria-label="Tu plan">
              <span>Tu plan:</span>
              {Object.entries(PLANES_KIT).map(([k, p]) => <button key={k} type="button" aria-pressed={k === pid} onClick={() => setPid(k)}>{p.nombre} · {p.agentes} agentes</button>)}
            </div>
          )}
        </div>
      </section>

      <ol className="gi-pasos ag-wrap">
        {pasos.map((p, i) => {
          const ok = hecho.includes(p.id);
          return (
            <li key={p.id} className={`gi-paso ${ok ? 'ok' : ''} ${p.il ? '' : 'gi-paso--solo'}`} id={`paso-${p.id}`}>
              <div className="gi-paso__n" aria-hidden="true">{ok ? <Check size={20} /> : i}</div>
              <div className="gi-paso__txt">
                <p className="gi-paso__k">{i === 0 ? 'Paso previo' : `Paso ${i}`}</p>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                {p.body}
                <button type="button" className={`gi-hecho ${ok ? 'ok' : ''}`} onClick={() => marcar(p.id)} aria-pressed={ok}>
                  {ok ? <><CircleCheck size={17} /> Hecho</> : <>Marcar como hecho</>}
                </button>
              </div>
              {p.il && <div className="gi-paso__il">{p.il}</div>}
            </li>
          );
        })}
      </ol>

      {pct === 100 && (
        <section className="gi-fin"><div className="ag-wrap"><p className="gi-k">Lo tienes</p><h2 className="gi-h2">Tu oficina de IA<br /><span>ya está trabajando.</span></h2><p className="gi-lead">Mañana por la mañana te llegará tu primer informe. Dale unos días a tus agentes y, cuando te fíes, dales más libertad.</p></div></section>
      )}

      <section className="gi-sec">
        <div className="ag-wrap">
          <p className="gi-k">Hazlo tuyo</p>
          <h2 className="gi-h3">Personalízalo pidiéndoselo a Claude</h2>
          <p className="gi-lead">Cada agente es un texto. Copia un ejemplo, cámbialo a tu gusto y pégalo en Claude.</p>
          <div className="gi-copias">{PERSONALIZA.map((t) => <Copiar key={t} texto={t} />)}</div>
        </div>
      </section>

      <section className="gi-sec gi-sec--b">
        <div className="ag-wrap">
          <p className="gi-k">Si algo falla</p>
          <h2 className="gi-h3">Soluciones rápidas</h2>
          <div className="gi-prob">
            {PROBLEMAS.map((p) => (
              <details key={p.q}><summary>{p.q}<ChevronDown size={18} /></summary><p>{p.a}</p></details>
            ))}
          </div>
          <div className="gi-ayuda">
            <div><Mail size={20} /><p>¿Atascado? Escríbenos a <b>info@agutidesigns.io</b> con el correo de tu compra y te ayudamos.</p></div>
            <a href="/oficina-ia" className="gi-link">¿Prefieres que te la montemos a medida? <ArrowRight size={15} /></a>
          </div>
          <p className="gi-nota"><LayoutDashboard size={14} /> Los ejemplos de esta guía son ilustrativos: tu panel y tus agentes trabajan con los datos de tu negocio.</p>
        </div>
      </section>
    </div>
  );
}

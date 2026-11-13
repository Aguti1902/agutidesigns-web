// Landing de venta del «Kit Oficina de IA» (producto descargable, 3 planes con pago único en Stripe).
// Llega tráfico de anuncios y de los comentarios «OFICINA» de los vídeos: móvil primero, mucho movimiento
// y la oficina real de Agutidesigns en directo de fondo.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Download, Lock, Box, FileText, Wand2, LayoutDashboard, Users, MessageCircle, Repeat, Instagram, Video, PenLine, MapPin, Star, Sun, Megaphone, BarChart3, Receipt, Mail, Coffee, Moon, Infinity as Siempre } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Faq } from '../components/site/Sections';
import useSeo from '../hooks/useSeo';
import { useAparecer, useSalidaHero, FraseScroll, RompeElNo, Balanza } from '../components/oficina/Animado';
import '../components/oficina/Animado.css';
import { Cinta, PanelEnVivo } from '../components/oficina/Ilustraciones';
import '../components/oficina/Ilustraciones.css';
import './OficinaIA.css';
import './KitOficina.css';
const OficinaHero3D = lazy(() => import('../components/oficina/OficinaHero3D'));

// Planes y enlaces de pago de Stripe (Payment Links). Tras pagar, Stripe redirige a /kit-oficina-ia/gracias?session_id=…
export const PLANES = [
  { id: 'starter', nombre: 'Starter', precio: 29, agentes: 4, stripe: 'https://buy.stripe.com/aFa5kDa1D7MJcsIbeY9EI0h',
    pitch: 'Para empezar: que ningún cliente se quede sin respuesta y tus redes no paren.' },
  { id: 'pro', nombre: 'Pro', precio: 47, agentes: 8, stripe: 'https://buy.stripe.com/bJeeVd7Tv4AxgIY82M9EI0g', rec: true,
    pitch: 'La oficina del vídeo: ventas, contenido, Google y clientes, todo en marcha.' },
  { id: 'empresa', nombre: 'Empresa', precio: 80, agentes: 12, stripe: 'https://buy.stripe.com/28E5kD8Xz8QNfEUaaU9EI0i',
    pitch: 'La plantilla completa: también anuncios, números, cobros y newsletter.' },
];
export const KIT_STRIPE = PLANES[1].stripe;

// n = desde qué plan lo tienes: 4 Starter, 8 Pro, 12 Empresa
const EQUIPO = [
  { Icon: MessageCircle, n: 'Nora', p: 'Recepción', d: 'Contesta al momento a cada cliente nuevo que te escribe.', c: '#5b86ff', desde: 4 },
  { Icon: Repeat, n: 'Sara', p: 'Ventas', d: 'Sigue cada presupuesto hasta que te dicen sí o no.', c: '#b48cff', desde: 4 },
  { Icon: Instagram, n: 'Marta', p: 'Redes sociales', d: 'Te deja los posts de la semana listos para aprobar.', c: '#ff7a68', desde: 4 },
  { Icon: Sun, n: 'Clara', p: 'Informe diario', d: 'Cada mañana te dice qué ha pasado y qué te toca hoy.', c: '#e5fc63', desde: 4 },
  { Icon: Video, n: 'Diego', p: 'Vídeos', d: 'Escribe guiones de vídeos cortos para grabar en 5 minutos.', c: '#3ee0a1', desde: 8 },
  { Icon: PenLine, n: 'Rafa', p: 'Blog y SEO', d: 'Un artículo a la semana para que te encuentren en Google.', c: '#6ee7b7', desde: 8 },
  { Icon: MapPin, n: 'Pablo', p: 'Google Business', d: 'Publicaciones para tu ficha y respuestas a tus reseñas.', c: '#ffc65c', desde: 8 },
  { Icon: Star, n: 'Elena', p: 'Reseñas y clientes', d: 'Pide la reseña a cada cliente contento y cuida a los de siempre.', c: '#f4a7c0', desde: 8 },
  { Icon: Megaphone, n: 'Álex', p: 'Anuncios', d: 'Revisa tus campañas y te propone mejoras. Nunca gasta un euro solo.', c: '#ff9f6b', desde: 12 },
  { Icon: BarChart3, n: 'Leo', p: 'Analista', d: 'Cada lunes te cuenta qué canal te trae clientes y qué hacer.', c: '#9db8ff', desde: 12 },
  { Icon: Receipt, n: 'Max', p: 'Cobros y facturas', d: 'Avisa de lo que falta por facturar o cobrar y prepara el recordatorio.', c: '#7ee0c9', desde: 12 },
  { Icon: Mail, n: 'Iris', p: 'Newsletter', d: 'Prepara el correo mensual a tus clientes para que lo apruebes.', c: '#d9a7ff', desde: 12 },
];

const ROTA = ['contestan a tus clientes', 'siguen tus presupuestos', 'preparan tus redes', 'escriben tu blog', 'cuidan tu ficha de Google', 'te hacen el informe cada mañana'];

const INCLUYE = [
  { Icon: LayoutDashboard, t: 'Tu panel con la oficina en 3D', d: 'Con tu nombre y tus colores. Ves a tus agentes trabajar y, debajo, lo que importa: clientes, aprobaciones y tareas.' },
  { Icon: Users, t: 'Tus agentes de IA, listos', d: 'Cada uno con su tarea, su horario y sus reglas firmes. Tú solo les cuentas tu negocio.' },
  { Icon: Wand2, t: 'Instalación con un solo mensaje', d: 'Pegas el instalador en Claude y él te pregunta lo necesario, configura el panel y programa a tus agentes.' },
  { Icon: FileText, t: 'La ficha de tu negocio', d: 'Lo que vendes, a quién y cómo hablas. Lo que no esté ahí, tus agentes no lo dicen.' },
  { Icon: Box, t: 'Guía en PDF paso a paso', d: 'Por dónde empezar, cómo personalizarlo y qué hacer si algo falla.' },
];

const OBJECIONES = [
  { pero: 'No sé nada de IA ni de programar', resp: 'No hace falta. Lo instalas pegando un mensaje en Claude: él te hace las preguntas, configura el panel y programa a tus agentes. Si sabes escribir un correo, sabes instalarlo.', si: 'En unos 30-60 minutos lo tienes funcionando la primera vez.', ojo: 'Necesitas una cuenta de Claude de pago con tareas programadas y conectores. No va incluida en el kit.' },
  { pero: 'Por este precio, ¿dónde está la trampa?', resp: 'No hay cuotas ni suscripciones nuestras: pagas una vez y el kit es tuyo. Es el mismo sistema con el que trabajamos en Agutidesigns, empaquetado para que lo montes tú.', si: 'Lo puedes cambiar entero: nombres, horarios, tareas y el panel.', ojo: 'Es un kit para montarlo tú, no un servicio. Si quieres que lo hagamos nosotros, existe la Oficina de IA a medida.' },
  { pero: 'Mi negocio es distinto', resp: 'Por eso tus agentes trabajan con la ficha de tu negocio: qué vendes, a quién, cómo hablas y qué no deben decir nunca. Consultas, clínicas, academias, tiendas, profesionales…', si: 'Hablan con tu tono y proponen tu siguiente paso: llamada, cita o compra.', ojo: 'Saben lo que les cuentes. Si tu ficha es pobre, sus respuestas también.' },
  { pero: 'No quiero que una IA hable sola con mis clientes', resp: 'Tú decides. Posts, guiones, artículos y respuestas a reseñas esperan tu visto bueno en el panel. Recepción y Ventas contestan a quien te escribe, con reglas firmes: sin inventar precios, descuentos ni plazos.', si: 'Todo queda en el panel: ves qué ha dicho cada agente y a quién.', ojo: 'Al principio conviene revisar más, hasta que veas cómo responden.' },
  { pero: '¿Y si se equivoca?', resp: 'Si un agente duda, no actúa: te deja una tarea en el panel. Y nunca escribe en frío a desconocidos, solo a quien te escribió primero.', si: 'Si algo no te gusta, le cambias la regla con una frase y no se repite.', ojo: 'La IA puede equivocarse, como una persona. Por eso lo delicado lo decides tú.' },
  { pero: 'No tengo tiempo para montarlo', resp: 'Es una tarde. Y luego, cada día, cinco minutos en el panel para aprobar lo que te proponen. El resto lo hacen ellos.', si: 'Recuperas las horas que hoy se van en contestar lo mismo y perseguir presupuestos.', ojo: 'Los conectores que uses (Gmail, redes…) pueden tener sus propios límites.' },
];

const VENTAJAS = ['Pago único: sin cuotas nuestras', 'Trabajan cada día, también cuando tú no estás', 'Lo ves todo en un panel con tu oficina en 3D', 'Tú decides qué sale solo y qué revisas', 'Es tuyo: lo cambias como quieras', 'El mismo sistema que usamos en Agutidesigns'];
const DESVENTAJAS = ['Necesitas Claude de pago (no incluido)', 'Lo montas tú: no es un servicio', 'Al principio conviene revisar lo que hacen', 'No sustituye el trato humano en lo delicado', 'Saben solo lo que pongas en tu ficha'];
const TABLA = {
  cols: ['Kit Oficina de IA', 'Contratar a alguien', 'Hacerlo tú todo'],
  filas: [
    ['Coste', 'Desde 29 €, una vez', 'Sueldo cada mes', 'Tus horas'],
    ['Trabaja cada día', true, 'Su jornada', 'Cuando puedes'],
    ['Vacaciones y bajas', 'No tiene', 'Sí', 'Te toca a ti'],
    ['Seguimientos sin olvidos', true, 'Depende', false],
    ['Todo visible en un panel', true, false, false],
    ['Trato humano en lo delicado', 'Lo haces tú', true, true],
  ],
};

const FAQ = [
  { q: '¿Qué plan me conviene?', a: 'Si empiezas, Starter: que nadie se quede sin respuesta y tus redes no paren. Si quieres la oficina del vídeo (ventas, contenido, vídeos, blog, Google y reseñas), Pro. Si además haces anuncios, quieres números cada semana y controlar cobros, Empresa.' },
  { q: '¿Necesito saber programar?', a: 'No. Lo instalas pegando un texto en Claude: él te hace las preguntas, configura el panel y programa los agentes.' },
  { q: '¿Qué necesito para que funcione?', a: 'Una cuenta de Claude de pago que incluya tareas programadas y conectores (compruébalo en claude.ai: el precio y lo que incluye cada plan lo pone Claude), y tu Gmail conectado para los agentes que leen y contestan correos. El kit no incluye la suscripción a Claude.' },
  { q: '¿Hay cuotas?', a: 'No. Pagas el kit una vez y es tuyo. Lo único recurrente es tu plan de Claude y las herramientas que conectes, que contratas tú.' },
  { q: '¿Puedo modificarlo?', a: 'Sí, es tuyo. Cambia nombres, horarios y tareas, crea agentes nuevos o cambia el panel. La guía te enseña a hacerlo pidiéndoselo a Claude con tus palabras.' },
  { q: '¿Puedo empezar con Starter y luego ampliar?', a: 'Sí: con la guía puedes crear tus propios agentes. Si prefieres los 12 ya hechos, compra el plan que necesites; si ya has comprado uno, escríbenos a info@agutidesigns.io antes de hacerlo.' },
  { q: '¿Cómo lo recibo?', a: 'Nada más pagar te llevamos a la página de descarga y te enviamos el enlace por correo. Es un archivo .zip con todo el kit.' },
  { q: '¿Puedo devolverlo?', a: 'Es un producto digital que se descarga al momento: al comprarlo aceptas que la entrega es inmediata y que, una vez descargado, pierdes el derecho de desistimiento. Si tienes cualquier problema con la instalación, escríbenos a info@agutidesigns.io y te ayudamos.' },
  { q: '¿Y si prefiero que me lo montéis vosotros?', a: 'También lo hacemos: instalamos oficinas de IA a medida, conectadas a tu web, tus campañas y tu agenda. Lo tienes en agutidesigns.io/oficina-ia.' },
];

const reduce = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const euros = (n) => `${n} €`;

function Hero() {
  const [listo, setListo] = useState(false);
  const [i, setI] = useState(0);
  const marcarListo = useCallback(() => setListo(true), []);
  const ref = useRef(null);
  useSalidaHero(ref);
  useEffect(() => {
    if (reduce()) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % ROTA.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <header ref={ref} className={`oh kt2-hero ${listo ? 'oh--listo' : ''}`}>
      <Suspense fallback={null}><OficinaHero3D onListo={marcarListo} /></Suspense>
      <div className="oh-velo" aria-hidden="true" />
      <div className="ag-wrap oh-wrap">
        <p className="oh-live"><i aria-hidden="true" /> Agutidesigns · en directo ahora mismo</p>
        <h1 className="oh-h1">
          <span className="oh-l"><span>Tu propia</span></span>
          <span className="oh-l"><span>empresa de IA,</span></span>
          <span className="oh-l"><span><em>esta tarde.</em></span></span>
        </h1>
        <p className="oh-rota" aria-live="off">
          <span className="oh-rota__fijo">Agentes que</span>{' '}
          <span className="oh-rota__caja">
            {ROTA.map((t, n) => <span key={t} className={`oh-rota__w ${n === i ? 'is-on' : ''}`} aria-hidden={n !== i}>{t}</span>)}
          </span>
        </p>
        <p className="oh-lead">Lo que ves detrás es la oficina de Agutidesigns trabajando. Este kit te da la tuya: agentes de IA que atienden tu negocio cada día y un panel con tu oficina en 3D para verlo todo. Se instala con Claude pegando un solo mensaje.</p>
        <div className="ag-actions oh-actions">
          <a href="#planes" className="ag-btn ag-btn--primary kt2-brillo">Ver los planes · desde 29 € <ArrowRight size={18} /></a>
          <a href="#equipo" className="ag-btn oh-btn-ghost">Conoce al equipo</a>
        </div>
        <ul className="oh-trust">
          <li><Check size={16} /> Pago único, sin cuotas</li>
          <li><Download size={16} /> Descarga inmediata</li>
          <li><Lock size={16} /> Pago seguro con Stripe</li>
        </ul>
      </div>
      <p className="oh-pie">Oficina real de Agutidesigns · actividad ilustrativa</p>
      <a href="#equipo" className="oh-baja" aria-label="Seguir bajando"><ChevronDown size={22} /></a>
    </header>
  );
}

/* Avisos que van saltando, como en el panel: la oficina «trabajando» mientras lees. */
const AVISOS = [
  ['Nora', 'Ha contestado a Laura, que pedía precio', '#5b86ff'],
  ['Marta', 'Posts de la semana listos para aprobar', '#ff7a68'],
  ['Sara', 'Segundo seguimiento enviado a Carlos', '#b48cff'],
  ['Rafa', 'Artículo nuevo para el blog, listo', '#6ee7b7'],
  ['Pablo', 'Respuesta preparada para una reseña de 5★', '#ffc65c'],
  ['Clara', 'Tu informe de hoy ya está en el panel', '#e5fc63'],
  ['Elena', 'Ha pedido reseña a 3 clientes contentos', '#f4a7c0'],
  ['Diego', 'Guion del vídeo de mañana: 30 segundos', '#3ee0a1'],
];
function Avisos() {
  const [n, setN] = useState(0);
  useEffect(() => { if (reduce()) return undefined; const id = setInterval(() => setN((x) => x + 1), 2600); return () => clearInterval(id); }, []);
  const vis = [0, 1, 2].map((k) => AVISOS[(n + k) % AVISOS.length]);
  return (
    <div className="kt2-avisos" aria-hidden="true">
      {vis.map(([a, t, c], k) => (
        <div key={`${n}-${k}`} className={`kt2-aviso ${k === 0 ? 'nuevo' : ''}`} style={{ '--c': c }}>
          <span className="kt2-aviso__av">{a[0]}</span>
          <span><b>{a}</b>{t}</span>
          <span className="kt2-aviso__ok"><Check size={13} /></span>
        </div>
      ))}
    </div>
  );
}

/* La plantilla: eliges plan y se «contratan» los agentes que entran. */
function Plantilla() {
  const [plan, setPlan] = useState(8);
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current?.querySelector('.kt2-grid'); if (!el) return undefined;
    if (reduce() || !('IntersectionObserver' in window)) { setVisto(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisto(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const p = PLANES.find((x) => x.agentes === plan);
  return (
    <section className="kt2-plantilla" id="equipo" ref={ref}>
      <div className="ag-wrap">
        <div className="kt2-head">
          <p className="kt2-k">Tu plantilla</p>
          <h2 className="kt2-h2">Contrata a tu equipo.<br /><span>Sin entrevistas.</span></h2>
          <p className="kt2-lead">Cada agente tiene su puesto, su horario y sus reglas. Elige cuántos quieres y mira quién entra a trabajar.</p>
        </div>
        <div className="kt2-sel" role="group" aria-label="Elige tu plan">
          {PLANES.map((x) => (
            <button key={x.id} type="button" aria-pressed={plan === x.agentes} onClick={() => setPlan(x.agentes)} className={x.rec ? 'rec' : ''}>
              <b>{x.nombre}</b><span>{x.agentes} agentes · {euros(x.precio)}</span>
            </button>
          ))}
        </div>
        <div className={`kt2-grid ${visto ? 'is-on' : ''}`}>
          {EQUIPO.map(({ Icon, n, p: puesto, d, c, desde }, i) => {
            const dentro = desde <= plan;
            return (
              <article key={n} className={`kt2-ag ${dentro ? 'in' : 'out'}`} style={{ '--c': c, '--i': i }}>
                <div className="kt2-ag__top">
                  <span className="kt2-ag__av"><Icon size={20} /></span>
                  <span className={`kt2-ag__st ${dentro ? 'on' : ''}`}>{dentro ? 'Contratada/o' : `Plan ${desde === 8 ? 'Pro' : 'Empresa'}`}</span>
                </div>
                <h3>{n} <span>· {puesto}</span></h3>
                <p>{d}</p>
              </article>
            );
          })}
        </div>
        <div className="kt2-nomina">
          <div><Coffee size={20} /><b>0 €</b><span>de sueldo al mes</span></div>
          <div><Moon size={20} /><b>0</b><span>días de vacaciones</span></div>
          <div><Siempre size={20} /><b>Cada día</b><span>sin horarios</span></div>
          <div className="kt2-nomina__p"><span>{p.agentes} agentes por</span><b>{euros(p.precio)}</b><span>una sola vez</span></div>
        </div>
        <div className="kt2-centro"><a href={`#plan-${p.id}`} className="ag-btn ag-btn--primary kt2-brillo">Quiero el plan {p.nombre} <ArrowRight size={18} /></a></div>
      </div>
    </section>
  );
}

function Incluye() {
  return (
    <section className="kt2-incluye ag-section" id="incluye">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split"><h2 className="ag-h2">Qué hay dentro del kit</h2><p className="ag-lead">Todo en un archivo. Lo descargas, lo pegas en Claude y tu oficina empieza a trabajar.</p></div>
        <div className="kt-incluye">
          {INCLUYE.map(({ Icon, t, d }) => <article key={t} className="kt-card"><span className="kt-ico"><Icon size={22} /></span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
        <figure className="kt2-shot"><img src="/img/kit-panel.webp" alt="El panel del kit: oficina 3D, aprobaciones, clientes potenciales, tareas y equipo" width="1400" height="875" loading="lazy" /><figcaption>El panel del kit, con datos de ejemplo. El tuyo lleva tu nombre y tus colores.</figcaption></figure>
      </div>
    </section>
  );
}

function Pasos() {
  return (
    <section className="kt2-pasos">
      <div className="ag-wrap">
        <div className="kt2-head">
          <p className="kt2-k">Instalación</p>
          <h2 className="kt2-h2">Funcionando<br /><span>en 3 pasos.</span></h2>
          <p className="kt2-lead">Sin programar. Unos 30-60 minutos la primera vez.</p>
        </div>
        <ol className="kt2-pasos__l">
          <li style={{ '--i': 0 }}><span>1</span><div><h3>Descarga y rellena tu ficha</h3><p>Cuéntale a tus agentes qué vendes, a quién y cómo hablas. Si te cuesta, Claude te lo pregunta.</p></div></li>
          <li style={{ '--i': 1 }}><span>2</span><div><h3>Pega el instalador en Claude</h3><p>Adjuntas el kit, pegas un mensaje y Claude configura tu panel y programa a tus agentes.</p></div></li>
          <li style={{ '--i': 2 }}><span>3</span><div><h3>Abre tu panel cada día</h3><p>Aprueba lo que te proponen, haz tus tareas y deja que tu equipo trabaje el resto.</p></div></li>
        </ol>
      </div>
    </section>
  );
}

function Planes() {
  return (
    <section className="kt2-planes" id="planes">
      <div className="ag-wrap">
        <div className="kt2-head">
          <p className="kt2-k">Elige tu oficina</p>
          <h2 className="kt2-h2">Pagas una vez.<br /><span>Es tuya para siempre.</span></h2>
          <p className="kt2-lead">Los tres llevan el panel con la oficina 3D, el instalador para Claude y la guía. Cambia cuántos agentes trabajan para ti.</p>
        </div>
        <div className="kt2-planes__g">
          {PLANES.map((p) => (
            <article key={p.id} id={`plan-${p.id}`} className={`kt2-plan ${p.rec ? 'kt2-plan--rec' : ''}`} aria-label={`Plan ${p.nombre}`}>
              {p.rec && <span className="kt2-plan__badge">El más elegido</span>}
              <h3 className="kt2-plan__n">{p.nombre}</h3>
              <p className="kt2-plan__ag">{p.agentes} agentes de IA</p>
              <p className="kt2-plan__p"><b>{p.precio}</b><span>€</span></p>
              <p className="kt2-plan__s">Pago único · IVA incluido · {(p.precio / p.agentes).toFixed(2).replace('.', ',')} € por agente</p>
              <p className="kt2-plan__pitch">{p.pitch}</p>
              <ul className="kt2-plan__eq">
                {EQUIPO.filter((a) => a.desde <= p.agentes).map((a) => <li key={a.n} style={{ '--c': a.c }}><i />{a.n} <span>· {a.p}</span></li>)}
              </ul>
              <ul className="kt2-plan__inc">
                <li><Check size={16} />Panel con tu oficina en 3D</li>
                <li><Check size={16} />Instalador de un mensaje para Claude</li>
                <li><Check size={16} />Ficha de tu negocio y guía en PDF</li>
              </ul>
              <a href={p.stripe} className={`ag-btn ${p.rec ? 'ag-btn--primary kt2-brillo' : 'kt2-btn'}`} rel="noopener">Comprar {p.nombre} · {euros(p.precio)} <ArrowRight size={18} /></a>
            </article>
          ))}
        </div>
        <p className="kt2-legal"><Lock size={14} /> Pago seguro con Stripe. Necesitas una cuenta de Claude de pago con tareas programadas y conectores (no incluida). Al comprar aceptas que es contenido digital de entrega inmediata y que, una vez descargado, no hay derecho de desistimiento.</p>
      </div>
    </section>
  );
}

function Cierre() {
  return (
    <section className="cierre">
      <div className="ag-wrap cierre__in">
        <p className="cierre__k">Última duda</p>
        <h2 className="cierre__h">¿Sigue siendo<br /><span>un no?</span></h2>
        <p className="cierre__p">Por lo que cuesta una cena, esta tarde puedes tener tu propia oficina de IA trabajando. Y mañana, tu primer informe en el panel.</p>
        <a href="#planes" className="ag-btn ag-btn--primary cierre__btn kt2-brillo">Elegir mi plan <ArrowRight size={18} /></a>
      </div>
    </section>
  );
}

function BotonFlotante() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const on = () => {
      const pl = document.getElementById('planes');
      const b = pl?.getBoundingClientRect();
      const enPlanes = b && b.top < window.innerHeight * 0.85 && b.bottom > window.innerHeight * 0.2;
      setVer(window.scrollY > window.innerHeight * 0.9 && !enPlanes);
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <div className={`flota ${ver ? 'is-on' : ''}`} aria-hidden={!ver}>
      <span className="flota__t"><span className="flota__x">Kit Oficina de IA · </span>desde 29 €</span>
      <a href="#planes" className="ag-btn ag-btn--primary ag-btn--sm" tabIndex={ver ? 0 : -1}>Ver planes</a>
    </div>
  );
}

const jsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Kit Oficina de IA',
  description: 'Kit descargable para montar tu propia oficina de agentes de IA con Claude: panel con oficina 3D, agentes listos y guía de instalación.',
  brand: { '@type': 'Brand', name: 'Agutidesigns' },
  offers: PLANES.map((p) => ({ '@type': 'Offer', name: `${p.nombre} (${p.agentes} agentes)`, price: p.precio, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: 'https://agutidesigns.io/kit-oficina-ia' })),
});

export default function KitOficina() {
  useSeo({
    title: 'Kit Oficina de IA: tu propia empresa de agentes de IA, desde 29 € | Agutidesigns',
    description: 'Monta tu propia oficina de IA esta tarde: agentes que contestan a tus clientes, siguen presupuestos y preparan tu contenido, y un panel con tu oficina en 3D. Se instala con Claude. Desde 29 €, pago único.',
    path: '/kit-oficina-ia',
    jsonLd: jsonLd(),
  });
  const raiz = useRef(null);
  useAparecer(raiz);
  return (
    <div className="ag oi-page kt kt2" ref={raiz}>
      <Navbar minimal cta={{ label: 'Ver planes', href: '#planes' }} />
      <main>
        <Hero />
        <section className="kt2-vivo">
          <div className="ag-wrap kt2-vivo__in">
            <div>
              <p className="kt2-k">Mientras lees esto</p>
              <h2 className="kt2-h2 kt2-h2--s">Tu oficina no para.<br /><span>Tú decides.</span></h2>
            </div>
            <Avisos />
          </div>
        </section>
        <FraseScroll texto="Lo que viste en el vídeo no es un truco. Es la empresa con la que trabaja Agutidesigns cada día. Ahora puedes montar la tuya por menos de lo que cuesta una cena." destacadas={['truco', 'Agutidesigns', 'tuya', 'cena']} />
        <Cinta filas={[['Contesta a clientes', 'Sigue presupuestos', 'Prepara posts', 'Escribe guiones', 'Escribe el blog', 'Publica en Google'], ['Pide reseñas', 'Te hace el informe', 'Revisa anuncios', 'Vigila cobros', 'Prepara la newsletter', 'Te pide aprobación']]} />
        <Plantilla />
        <PanelEnVivo />
        <Incluye />
        <Pasos />
        <Planes />
        <RompeElNo items={OBJECIONES} />
        <Balanza ventajas={VENTAJAS} desventajas={DESVENTAJAS} tabla={TABLA} />
        <Faq items={FAQ} title="Preguntas sobre el kit" />
        <Cierre />
      </main>
      <BotonFlotante />
      <Footer />
    </div>
  );
}

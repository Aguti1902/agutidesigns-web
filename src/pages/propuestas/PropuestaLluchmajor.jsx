// Propuesta interactiva para Clínica Dental Lluchmajor (Raúl Mayor).
// Todo lo que se dice de la clínica sale de su web (clinicalluchmajor.es, 12-nov-2026).
// Las únicas cifras de resultados son las de Vela-Segalà (+20.000 € en 3 meses, +80 %).
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Clock, MessageCircle, FileText, Star, Users, Bell, LayoutDashboard, CalendarCheck, Moon, ShieldCheck, Megaphone, PenLine, Lock, Compass } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { LeadSection } from '../../components/site/Sections';
import useSeo from '../../hooks/useSeo';
import { useAparecer } from '../../components/oficina/Animado';
import { Cuenta } from '../CasoIA';
import { CONTACT } from '../../data/site';
import '../../components/oficina/Animado.css';
import '../CasoIA.css';
import './Propuesta.css';

const OficinasCaso = lazy(() => import('../../components/oficina/OficinasCasoLazy'));

const C = {
  nombre: 'Clínica Dental Lluchmajor',
  contacto: 'Raúl',
  logo: '/img/logo-lluchmajor.webp',
  fecha: '12 de noviembre de 2026',
};

const NOMBRES = { ceo: 'Dirección', prospector: 'Clara', demos: 'Pau', redactor: 'Laia', seguimiento: 'Jordi', recontacto: 'Marta', finanzas: 'Xavi', cartera: 'Anna', semanal: 'Rosa', resumen: 'Toni', webleads: 'Núria', pipeline: 'Montse', contenido: 'Lluís', publicador: 'Eva', analista: 'Joan', ads: 'Mar', cs: 'Elisa', produccion: 'Oriol', seo: 'Neus' };

const CASO_3D = {
  nombre: C.nombre,
  fondo: 'radial-gradient(90% 80% at 50% 30%, #0f4a55 0%, #04181c 75%)',
  marca: {
    tema: 'clinica', acento: 0x009eba, acentoCss: '#009eba', inicial: 'L', pantallaA: '#062a31', pantallaB: '#009eba',
    placa: 'LLUCHMAJOR', ceo: 'Dirección', logo: C.logo, lema: 'ODONTOLOGÍA · PASSEIG DE VALLDAURA', pantalla: 'LLUCHMAJOR · EN DIRECTO',
    pizarra: ['Hoy en la clínica', 'Ninguna cita sin respuesta'], nombres: NOMBRES,
    deptos: { direccion: 'Dirección', ventas: 'Citas', marketing: 'Google', clientes: 'Pacientes', finanzas: 'Presupuestos' },
    charla: [
      ['webleads', 'pipeline', 'Petición de primera visita gratuita desde la web: implantes.'],
      ['pipeline', 'ceo', 'Contestada por WhatsApp con dos huecos de agenda.'],
      ['seguimiento', 'redactor', 'Presupuesto de implante sin respuesta: toca seguimiento.'],
      ['cs', 'produccion', 'Paciente de ortodoncia pregunta por su próxima revisión.'],
      ['seo', 'contenido', 'Nueva reseña de 5 estrellas: respuesta lista para aprobar.'],
      ['recontacto', 'ceo', '12 pacientes llevan más de 6 meses sin higiene.'],
      ['ceo', 'todos', 'Foco de hoy: ninguna petición de cita sin respuesta.'],
    ],
  },
};

const VISTO = [
  { Icon: CalendarCheck, t: 'La primera visita gratis es vuestra mejor puerta', d: 'Estudio, radiografía y diagnóstico sin coste. Es una oferta muy potente… si nadie se queda esperando a que le llamen.' },
  { Icon: Moon, t: 'Muchas peticiones llegan con la clínica cerrada', d: 'Abrís de lunes a jueves hasta las 19:00 y el viernes hasta las 14:00. Lo que llega el viernes por la tarde o el fin de semana espera al lunes.' },
  { Icon: FileText, t: 'Implantes, cigomáticos y estética: presupuestos altos', d: 'Son decisiones que el paciente piensa. Un buen seguimiento del presupuesto es donde más facturación se recupera.' },
  { Icon: Star, t: 'Vuestras reseñas de Google ya venden', d: 'Las mostráis en la web. Un agente puede pedir la reseña después de cada visita y preparar la respuesta a cada una.' },
  { Icon: Users, t: 'Diez personas y una sola recepción', d: 'Llamadas, WhatsApp, formulario y correo pasan por las mismas manos. La oficina se queda con lo repetitivo y vuestro equipo con los pacientes.' },
];

const MOTIVOS = [
  { id: 'impl', l: 'Información sobre implantes dentales', p: 'Hola, me falta una muela desde hace tiempo y querría saber si me podéis poner un implante.',
    r: ['¡Hola! Soy el asistente de Clínica Dental Lluchmajor. Claro que sí: los implantes y la cirugía oral son una de nuestras especialidades.', 'Lo primero es una primera visita gratuita: estudio, radiografía y diagnóstico de tu caso, sin coste ni compromiso. Después te damos un presupuesto cerrado y opciones de financiación.'] },
  { id: 'cigo', l: 'Caso con poco hueso (cigomáticos)', p: 'Me dijeron en otra clínica que no tengo hueso suficiente para implantes. ¿Vosotros lo tratáis?',
    r: ['¡Hola! Gracias por escribirnos. Los casos con poco hueso los valora nuestro equipo de cirugía oral e implantología.', 'Para saber qué opción encaja contigo, lo mejor es una primera visita gratuita con estudio y diagnóstico, sin compromiso. Si tienes pruebas de la otra clínica, tráelas.'] },
  { id: 'seg', l: 'Segunda opinión / revisar presupuesto', p: 'Tengo un presupuesto de otra clínica y me parece caro. ¿Me lo podéis revisar?',
    r: ['¡Hola! Por supuesto, hacemos segundas opiniones.', 'En una primera visita gratuita revisamos tu caso y tu presupuesto, y te explicamos cada opción con un presupuesto cerrado. Sin compromiso.'] },
  { id: 'urg', l: 'Urgencia dental', p: 'Me duele muchísimo una muela desde esta tarde. ¿Qué hago?',
    r: ['Siento mucho que estés así. Soy el asistente de la clínica: no puedo darte un diagnóstico, pero sí avisar a nuestro equipo ahora mismo.', 'He marcado tu mensaje como urgencia y te llamaremos en cuanto abramos. Si el dolor es muy intenso, hay fiebre o hinchazón que va a más, acude a urgencias.'] },
  { id: 'otro', l: 'Otro tratamiento', p: 'Hola, querría información sobre ortodoncia invisible para mi hija de 15 años.',
    r: ['¡Hola! Trabajamos la ortodoncia invisible y también la ortodoncia infantil y juvenil.', 'Lo ideal es una primera visita gratuita para valorar su caso con nuestra ortodoncista y ver qué técnica le encaja mejor.'] },
];
const HUECOS = ['Lunes 9:30', 'Lunes 16:00', 'Martes 11:15'];

function Simulador() {
  const [m, setM] = useState(0);
  const [paso, setPaso] = useState(0); // 0 nada, 1 paciente, 2..n respuestas, luego huecos
  const [hueco, setHueco] = useState(null);
  const cuerpo = useRef(null);
  const mot = MOTIVOS[m];
  const urg = mot.id === 'urg';
  useEffect(() => {
    setPaso(0); setHueco(null);
    const red = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const total = 1 + mot.r.length + (urg ? 0 : 1);
    if (red) { setPaso(total); return undefined; }
    const ts = [];
    for (let k = 1; k <= total; k += 1) ts.push(setTimeout(() => setPaso(k), 500 + k * 1100));
    return () => ts.forEach(clearTimeout);
  }, [m, mot.r.length, urg]);
  useEffect(() => { const el = cuerpo.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [paso, hueco]);
  const escribiendo = paso >= 1 && paso < 1 + mot.r.length + (urg ? 0 : 1);
  return (
    <section className="ag-section ag-section--white pz-sim" id="pruebalo">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">Pruébalo: es viernes, 21:40</h2>
          <p className="ag-lead">La clínica está cerrada y entra un mensaje por WhatsApp. Elige qué pide el paciente, con las mismas opciones de vuestro formulario, y mira qué haría vuestra oficina de IA.</p>
        </div>
        <div className="pz-sim__grid">
          <div className="pz-sim__ops" role="group" aria-label="¿Qué necesita el paciente?">
            <p className="pz-mini">¿Qué necesita el paciente?</p>
            {MOTIVOS.map((x, i) => (
              <button key={x.id} type="button" aria-pressed={i === m} onClick={() => setM(i)}>{x.l}</button>
            ))}
            <ul className="pz-reglas">
              <li><ShieldCheck size={16} /> No da precios ni diagnósticos</li>
              <li><ShieldCheck size={16} /> Solo ofrece huecos reales de vuestra agenda</li>
              <li><ShieldCheck size={16} /> Las urgencias pasan a vuestro equipo</li>
            </ul>
          </div>
          <div className="pz-movil" aria-live="polite">
            <div className="pz-movil__top">
              <span className="pz-av"><img src={C.logo} alt="" /></span>
              <span><b>Clínica Dental Lluchmajor</b><small>{escribiendo ? 'escribiendo…' : 'en línea'}</small></span>
            </div>
            <div className="pz-movil__body" ref={cuerpo}>
              <p className="pz-dia">Viernes</p>
              {paso >= 1 && <p className="pz-b pz-b--yo">{mot.p}<time>21:40</time></p>}
              {mot.r.map((t, i) => paso >= 2 + i && <p key={t} className="pz-b">{t}<time>21:40</time></p>)}
              {!urg && paso >= 2 + mot.r.length && (
                <div className="pz-b pz-b--huecos">
                  <span>¿Te va bien alguno de estos huecos para tu primera visita en Passeig de Valldaura, 250?</span>
                  <div>{HUECOS.map((h) => <button key={h} type="button" aria-pressed={hueco === h} onClick={() => setHueco(h)}>{h}</button>)}</div>
                  <time>21:41</time>
                </div>
              )}
              {hueco && <p className="pz-b pz-b--yo">{hueco}, perfecto<time>21:41</time></p>}
              {hueco && <p className="pz-b">¡Hecho! Te espero el {hueco.toLowerCase()}. El día antes te enviaremos un recordatorio por aquí. ¿Me dices tu nombre y apellidos para la ficha?<time>21:41</time></p>}
            </div>
          </div>
          <div className="pz-panel">
            <p className="pz-mini"><LayoutDashboard size={15} /> Lo que veis el lunes en el panel</p>
            <ul>
              <li className={paso >= 1 ? 'is-on' : ''}><span>21:40</span>Nuevo mensaje por WhatsApp · {mot.l.toLowerCase()}</li>
              <li className={paso >= 2 ? 'is-on' : ''}><span>21:40</span>{urg ? 'Marcado como URGENCIA · llamar a primera hora' : 'Contestado al momento con la primera visita gratuita'}</li>
              {!urg && <li className={hueco ? 'is-on' : ''}><span>21:41</span>{hueco ? `Primera visita reservada · ${hueco}` : 'Esperando a que elija hueco…'}</li>}
              {!urg && <li className={hueco ? 'is-on' : ''}><span>auto</span>Recordatorio programado 24 h antes</li>}
              <li className={paso >= 2 ? 'is-on' : ''}><span>lunes</span>{urg ? 'Recepción llama al paciente a las 9:00' : 'Recepción solo tiene que revisarla'}</li>
            </ul>
          </div>
        </div>
        <p className="oi-extra">Simulación de ejemplo: los huecos y los textos los ajustamos con vosotros, con vuestra agenda y vuestro tono.</p>
      </div>
    </section>
  );
}

const AREAS = [
  { k: 'Pacientes', l: 'Que ninguna petición ni ningún presupuesto se pierda', items: [
    { Icon: MessageCircle, t: 'Recepción 24 h', d: 'Contesta al momento cada petición que llega por la web y por WhatsApp, explica la primera visita gratuita y propone hueco de vuestra agenda.' },
    { Icon: FileText, t: 'Seguimiento de presupuestos', d: 'Cuando un paciente se lleva un presupuesto de implantes, ortodoncia o estética, le escribe en los días que decidáis, resuelve dudas y propone volver a hablar.' },
    { Icon: Bell, t: 'Recordatorios y revisiones', d: 'Recuerda cada cita el día antes y avisa a quien le toca higiene, revisión o mantenimiento periodontal.' },
  ] },
  { k: 'Captación', l: 'Que os encuentren más pacientes nuevos', items: [
    { Icon: Megaphone, t: 'Campañas de publicidad', d: 'Lleva vuestras campañas de Google y Meta: quita lo que gasta sin traer pacientes, refuerza lo que funciona y nunca pasa del tope que le pongáis.' },
    { Icon: PenLine, t: 'SEO y blog', d: 'Escribe artículos sobre implantes, cigomáticos, ortodoncia invisible o estética dental que responden a lo que la gente busca en Google en Barcelona.' },
    { Icon: Star, t: 'Google y reseñas', d: 'Pide la reseña después de cada visita, prepara la respuesta a cada una para que la aprobéis y mantiene viva vuestra ficha de Google.' },
  ] },
  { k: 'Control', l: 'Que la dirección lo tenga todo bajo control', items: [
    { Icon: Lock, t: 'Seguridad de la web', d: 'Vigila cada día que la web esté en marcha, actualizada y protegida, y avisa antes de que un problema os cueste pacientes.' },
    { Icon: Compass, t: 'Estrategia digital', d: 'Cruza lo que hacen todos los agentes y os propone cada mes qué tratamientos empujar, dónde invertir y qué mejorar.' },
  ] },
];


function Calculadora() {
  const [n, setN] = useState(8);
  const [imp, setImp] = useState(1800);
  const [pct, setPct] = useState(15);
  const res = useMemo(() => Math.round(n * imp * (pct / 100)), [n, imp, pct]);
  const fmt = (x) => x.toLocaleString('es-ES', { useGrouping: 'always' });
  return (
    <section className="ag-section pz-calc">
      <div className="ag-wrap pz-calc__grid">
        <div>
          <p className="pz-k">Haz tus números</p>
          <h2 className="ag-h2">¿Cuánto vale un presupuesto que no se pierde?</h2>
          <p className="ag-lead">Mueve los valores con las cifras reales de la clínica. Los de inicio son solo un ejemplo; aquí no hay promesas, solo cuentas.</p>
        </div>
        <div className="pz-calc__box">
          <label>Presupuestos al mes que hoy no se aceptan <b>{n}</b>
            <input type="range" min="1" max="40" value={n} onChange={(e) => setN(+e.target.value)} /></label>
          <label>Importe medio de esos presupuestos <b>{fmt(imp)} €</b>
            <input type="range" min="300" max="8000" step="100" value={imp} onChange={(e) => setImp(+e.target.value)} /></label>
          <label>De ellos, los que se recuperan con seguimiento <b>{pct} %</b>
            <input type="range" min="0" max="50" value={pct} onChange={(e) => setPct(+e.target.value)} /></label>
          <div className="pz-calc__res">
            <span>Facturación recuperada al mes</span>
            <strong>{fmt(res)} €</strong>
            <small>Solo con los presupuestos recuperados, la cuota de la Oficina completa (990 €/mes){res >= 990 ? ` se cubriría ${res >= 1980 ? `${Math.floor(res / 990)} veces` : 'de sobra'}.` : ' no se cubriría todavía: aquí no cuentan los pacientes nuevos de campañas, SEO y Google.'}</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PropuestaLluchmajor() {
  useSeo({ title: `Propuesta: oficina de IA para ${C.nombre} | Agutidesigns`, description: `Propuesta personalizada de oficina de IA para ${C.nombre}.`, path: '/propuesta/clinica-lluchmajor', noindex: true });
  const raiz = useRef(null);
  useAparecer(raiz);
  return (
    <div className="ag oi-page cs pz" ref={raiz}>
      <Navbar minimal cta={{ label: 'Reservar 30 minutos', href: '#propuesta' }} />
      <main>
        <header className="pz-hero">
          <div className="ag-wrap pz-hero__in">
            <div className="pz-logos">
              <img src={C.logo} alt={C.nombre} width="1000" height="214" />
            </div>
            <p className="pz-k">Propuesta para {C.nombre} · {C.fecha}</p>
            <h1 className="pz-h1">{C.contacto}, esta sería la <em>oficina de IA</em> de vuestra clínica.</h1>
            <p className="pz-lead">Un equipo de agentes que atiende a cada paciente al momento, también con la clínica cerrada, sigue cada presupuesto, os trae pacientes nuevos con campañas, SEO y Google, y vigila vuestra web. Vosotros lo veis todo en un panel y decidís qué revisáis.</p>
            <ul className="pz-notis" aria-hidden="true">
              <li><span>Viernes 21:40</span><b>Nueva petición por WhatsApp</b>Primera visita · implantes</li>
              <li><span>21:40</span><b>Contestada al momento</b>Con la primera visita gratuita</li>
              <li><span>21:41</span><b>Cita reservada · lunes 9:30</b>Recordatorio programado</li>
            </ul>
            <div className="ag-actions">
              <a href="#pruebalo" className="ag-btn ag-btn--primary">Pruébalo en 1 minuto <ArrowRight size={18} /></a>
              <a href="#inversion" className="ag-btn ag-btn--ghost">Ver la inversión</a>
            </div>
          </div>
        </header>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">Lo que hemos visto en vuestra clínica</h2>
              <p className="ag-lead">Hemos estudiado clinicalluchmajor.es: vuestros tratamientos, cómo se pide cita y cómo trabajáis. Esto es lo que una oficina de IA puede mejorar.</p>
            </div>
            <div className="pz-visto">
              {VISTO.map(({ Icon, t, d }, i) => (
                <article key={t} className="pz-visto__c"><span className="pz-n">{String(i + 1).padStart(2, '0')}</span><Icon size={22} /><h3>{t}</h3><p>{d}</p></article>
              ))}
            </div>
          </div>
        </section>

        <Simulador />

        <section className="ag-section pz-ags">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">Todo lo que podría tener vuestra clínica</h2>
              <p className="ag-lead">Ocho agentes en tres áreas: cuidar a cada paciente, atraer pacientes nuevos y que la dirección lo controle todo desde un solo panel.</p>
            </div>
            <div className="pz-areas">
              {AREAS.map((ar, n) => (
                <div key={ar.k} className="pz-area">
                  <div className="pz-area__head"><span>{String(n + 1).padStart(2, '0')}</span><div><p className="pz-ag__tag">{ar.k}</p><h3>{ar.l}</h3></div></div>
                  <div className="pz-ags__grid">
                    {ar.items.map(({ Icon, t, d }) => (
                      <article key={t} className="pz-ag"><span className="pz-ag__ico"><Icon size={22} /></span><h3>{t}</h3><p>{d}</p></article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="pz-dir"><LayoutDashboard size={22} /><p><b>Y un panel único para la dirección.</b> Qué ha entrado, qué se ha contestado, qué presupuestos siguen abiertos, cómo van las campañas, el estado de la web y lo que espera vuestra aprobación. Todo en una pantalla.</p></div>
          </div>
        </section>

        <section className="cs-ofi pz-ofi">
          <div className="ag-wrap">
            <div className="cs-ofi__head">
              <p className="cs-k">Vuestra oficina por dentro</p>
              <h2 className="cs-h2">Así trabajaría el equipo digital de Lluchmajor.</h2>
              <p>Con vuestro logo y vuestros colores. Gírala y mira a cada agente en su mesa: atienden pacientes, siguen presupuestos y se pasan el trabajo entre ellos.</p>
            </div>
            <Suspense fallback={<div className="oc-lienzo" />}><OficinasCaso caso={CASO_3D} /></Suspense>
            <p className="cs-nota">Representación ilustrativa. Los nombres de los agentes y sus mensajes son de ejemplo.</p>
          </div>
        </section>

        <Calculadora />

        <section className="ag-section ag-section--white pz-caso">
          <div className="ag-wrap pz-caso__in">
            <div>
              <p className="pz-k">Ya funciona en clínicas dentales</p>
              <h2 className="ag-h2">Clínicas Vela-Segalà</h2>
              <p className="ag-lead">Dos clínicas dentales y dos centros de estética, cada uno con su propia web. Unificamos todas sus webs en un mismo panel para tener el control total, y les pusimos agentes de IA que llevan sus campañas de publicidad, el SEO y el blog, la seguridad de las webs y la estrategia digital.</p>
              <a href="/casos/vela-segala" className="ag-btn ag-btn--ghost">Ver el caso completo <ArrowRight size={18} /></a>
            </div>
            <div className="pz-caso__cifras">
              <div><strong><Cuenta v={20000} pre="+" suf=" €" /></strong><span>facturados en 3 meses</span></div>
              <div><strong><Cuenta v={80} pre="+" suf=" %" /></strong><span>de facturación</span></div>
            </div>
          </div>
        </section>

        <section className="ag-section" id="inversion">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">La inversión</h2>
              <p className="ag-lead">Una puesta en marcha para diseñar e instalar vuestros agentes y una cuota mensual para mantenerlos y mejorarlos.</p>
            </div>
            <div className="sx-plans pz-planes">
              <article className="sx-plan sx-plan--rec">
                <span className="sx-plan__badge">Lo que os recomendamos</span>
                <h3 className="sx-plan__name">Oficina completa</h3>
                <p className="sx-plan__price"><b>990 €</b><span>/mes</span></p>
                <p className="sx-plan__setup">+ desde 12.000 € de puesta en marcha</p>
                <p className="sx-plan__pitch">Los 8 agentes de esta propuesta en las tres áreas, con su panel único.</p>
                <ul className="ag-checks">
                  <li><Check size={16} />Pacientes: recepción 24 h, presupuestos y recordatorios</li>
                  <li><Check size={16} />Captación: campañas, SEO y blog, Google y reseñas</li>
                  <li><Check size={16} />Control: seguridad de la web y estrategia digital</li>
                  <li><Check size={16} />Integraciones con vuestras herramientas (agenda, CRM, facturación)</li>
                  <li><Check size={16} />Formación para vuestro equipo</li>
                  <li><Check size={16} />Soporte prioritario</li>
                </ul>
                <a href="#propuesta" className="ag-btn ag-btn--primary">Quiero la oficina completa</a>
              </article>
              <article className="sx-plan">
                <h3 className="sx-plan__name">Oficina de IA</h3>
                <p className="sx-plan__price"><b>590 €</b><span>/mes</span></p>
                <p className="sx-plan__setup">+ 6.900 € de puesta en marcha</p>
                <p className="sx-plan__pitch">Si preferís empezar por un área: hasta 4 agentes coordinados, y ampliar cuando os compense.</p>
                <ul className="ag-checks">
                  <li><Check size={16} />Hasta 4 agentes a elegir de esta propuesta</li>
                  <li><Check size={16} />Panel propio con lo que hace cada agente</li>
                  <li><Check size={16} />Aprobaciones: decidís qué sale solo y qué revisáis</li>
                  <li><Check size={16} />Mantenimiento, mejoras y un agente nuevo al año</li>
                </ul>
                <a href="#propuesta" className="ag-btn ag-btn--ghost">Empezar con 4 agentes</a>
              </article>
            </div>
            <p className="oi-extra">Precios sin IVA. Las licencias de IA y de las herramientas necesarias van a nombre de la clínica y se pagan aparte.</p>
          </div>
        </section>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">Cómo lo montamos</h2><p className="ag-lead">Vuestra parte es una llamada y aprobar qué hará cada agente. El resto lo hacemos nosotros.</p></div>
            <ol className="pz-pasos">
              {[
                ['Llamada de diagnóstico', 'Vemos vuestra agenda, cómo entran hoy las peticiones y qué presupuestos se quedan por el camino.'],
                ['Diseño de vuestra oficina', 'Os proponemos qué dirá cada agente, sus reglas y lo que tendréis que aprobar vosotros.'],
                ['Instalación y pruebas', 'Lo conectamos a vuestra web, WhatsApp, Google y campañas, y lo probamos con casos reales antes de dejarlo solo.'],
                ['Funcionando y mejorando', 'Los agentes trabajan cada día, lo veis en el panel y lo ajustamos cada mes.'],
              ].map(([t, d], i) => <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
            </ol>
            <div className="pz-honesto">
              <h3><Clock size={18} /> Lo que tenéis que saber</h3>
              <ul>
                <li>Hay una puesta en marcha: no funciona el primer día.</li>
                <li>Al principio conviene revisar lo que contestan, hasta que veáis cómo hablan con vuestros pacientes.</li>
                <li>No sustituye a vuestro equipo en lo delicado ni da diagnósticos: eso sigue siendo vuestro.</li>
                <li>Revisamos con vosotros la protección de datos de los pacientes antes de poner a trabajar cada agente.</li>
              </ul>
            </div>
          </div>
        </section>

        <LeadSection fuente="propuesta-clinica-lluchmajor" title={`${C.contacto}, ¿lo vemos en 30 minutos?`} lead={`Te enseño el panel funcionando y vemos juntos cómo quedaría en ${C.nombre}. Si en vuestra clínica no tiene sentido, te lo diré. También puedes escribirme a ${CONTACT.email}.`} />
      </main>
      <Footer />
    </div>
  );
}

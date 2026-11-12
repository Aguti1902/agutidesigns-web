// Propuesta interactiva para Clínica Dental Lluchmajor (Raúl Mayor).
// Todo lo que se dice de la clínica sale de su web (clinicalluchmajor.es, 12-nov-2026).
// Las únicas cifras de resultados son las de Vela-Segalà (+20.000 € en 3 meses, +80 %).
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Clock, MessageCircle, FileText, Star, Users, Bell, LayoutDashboard, CalendarCheck, Moon, ShieldCheck, Megaphone, PenLine, Lock, Compass, Video, MapPin, Brain, Zap, BarChart3, Play, Pause } from 'lucide-react';
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
    pizarra: ['Estrategia de noviembre', 'Implantes + Google + redes'], nombres: NOMBRES,
    deptos: { direccion: 'Estrategia', ventas: 'Pacientes', marketing: 'Redes · SEO · Google', clientes: 'Atención', finanzas: 'Presupuestos' },
    charla: [
      ['analista', 'todos', 'Plan de hoy: vídeo de implantes, artículo de cigomáticos y 2 posts en Google.'],
      ['produccion', 'publicador', 'El vídeo «¿Duele un implante?» está montado.'],
      ['publicador', 'todos', 'Publicado en Instagram, TikTok y YouTube.'],
      ['webleads', 'pipeline', 'Petición de primera visita gratuita desde la web: implantes.'],
      ['pipeline', 'ceo', 'Contestada por WhatsApp con dos huecos de agenda.'],
      ['seguimiento', 'redactor', 'Presupuesto de implante sin respuesta: toca seguimiento.'],
      ['cs', 'produccion', 'Paciente de ortodoncia pregunta por su próxima revisión.'],
      ['seo', 'contenido', 'Nueva reseña de 5 estrellas: respuesta lista para aprobar.'],
      ['recontacto', 'ceo', '12 pacientes llevan más de 6 meses sin higiene.'],
      ['ads', 'ceo', 'Campaña de implantes ajustada, dentro del tope.'],
      ['ceo', 'todos', 'Aprobada la estrategia de la semana.'],
    ],
  },
};

const VISTO = [
  { Icon: CalendarCheck, t: 'La primera visita gratis es vuestra mejor puerta', d: 'Estudio, radiografía y diagnóstico sin coste. Es una oferta muy potente… si nadie se queda esperando a que le llamen.' },
  { Icon: Moon, t: 'Muchas peticiones llegan con la clínica cerrada', d: 'Abrís de lunes a jueves hasta las 19:00 y el viernes hasta las 14:00. Lo que llega el viernes por la tarde o el fin de semana espera al lunes.' },
  { Icon: FileText, t: 'Implantes, cigomáticos y estética: presupuestos altos', d: 'Son decisiones que el paciente piensa. Un buen seguimiento del presupuesto es donde más facturación se recupera.' },
  { Icon: Star, t: 'Vuestras reseñas de Google ya venden', d: 'Las mostráis en la web. Un agente puede pedir la reseña después de cada visita y preparar la respuesta a cada una.' },
  { Icon: Users, t: 'Diez personas y una sola recepción', d: 'Llamadas, WhatsApp, formulario y correo pasan por las mismas manos. La empresa de IA se queda con lo repetitivo y vuestro equipo con los pacientes.' },
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
          <h2 className="ag-h2">Un ejemplo, en directo: viernes, 21:40</h2>
          <p className="ag-lead">Una de las cosas que ejecuta vuestra empresa de IA. La clínica está cerrada y entra un WhatsApp: elige qué pide el paciente, con las mismas opciones de vuestro formulario, y mira qué pasa.</p>
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
  { k: 'Piensa', l: 'Traza la estrategia digital de la clínica', items: [
    { Icon: Compass, t: 'Estrategia digital', d: 'Con los datos de la clínica traza el plan de cada mes: qué tratamientos empujar, dónde invertir, qué publicar y en qué canal. Y lo reparte entre los agentes, día a día.' },
  ] },
  { k: 'Ejecuta, 24/7', l: 'Sigue el plan paso a paso, cada día, sin vacaciones', items: [
    { Icon: Video, t: 'Redes sociales y vídeos', d: 'Prepara guion, voz, animación y portada, y programa los vídeos y posts en Instagram, TikTok, YouTube y Facebook.' },
    { Icon: PenLine, t: 'SEO y blog', d: 'Escribe artículos sobre implantes, cigomáticos, ortodoncia invisible o estética dental que responden a lo que la gente busca en Google en Barcelona.' },
    { Icon: MapPin, t: 'Google Business y reseñas', d: 'Publica en vuestra ficha de Google cada semana, pide la reseña después de cada visita y prepara la respuesta a cada una.' },
    { Icon: Megaphone, t: 'Campañas de publicidad', d: 'Lleva vuestras campañas de Google y Meta: quita lo que gasta sin traer pacientes, refuerza lo que funciona y nunca pasa del tope que le pongáis.' },
    { Icon: MessageCircle, t: 'Recepción 24 h', d: 'Contesta al momento cada petición que llega por la web y por WhatsApp, explica la primera visita gratuita y propone hueco de vuestra agenda.' },
    { Icon: FileText, t: 'Seguimiento de presupuestos', d: 'Cuando un paciente se lleva un presupuesto de implantes, ortodoncia o estética, le escribe en los días que decidáis, resuelve dudas y propone volver a hablar.' },
    { Icon: Bell, t: 'Recordatorios y revisiones', d: 'Recuerda cada cita el día antes y avisa a quien le toca higiene, revisión o mantenimiento periodontal.' },
    { Icon: Lock, t: 'Seguridad de la web', d: 'Vigila cada día que la web esté en marcha, actualizada y protegida, y avisa antes de que un problema os cueste pacientes.' },
  ] },
  { k: 'Rinde cuentas', l: 'Todo a la vista de la dirección', items: [
    { Icon: LayoutDashboard, t: 'Panel en directo', d: 'Qué ha hecho cada agente, qué se ha publicado, qué pacientes han entrado, cómo van las campañas y lo que espera vuestra aprobación.' },
    { Icon: BarChart3, t: 'Informe y ajuste cada mes', d: 'Cada mes, qué ha funcionado y qué no. La estrategia se ajusta con lo aprendido y vuelta a empezar.' },
  ] },
];

const DIA = [
  { h: 0, a: 'Seguridad web', Icon: Lock, t: 'Revisa que la web siga en marcha, actualizada y protegida.' },
  { h: 3, a: 'SEO y blog', Icon: PenLine, t: 'Analiza qué buscan hoy en Barcelona sobre implantes y estética dental.' },
  { h: 7, a: 'Estrategia', Icon: Compass, t: 'Reparte el plan del día entre los agentes y lo deja en el panel.' },
  { h: 9, a: 'Campañas', Icon: Megaphone, t: 'Revisa las campañas de ayer, quita lo que no trae pacientes y respeta el tope.' },
  { h: 10, a: 'Google Business', Icon: MapPin, t: 'Publica en la ficha de Google y prepara la respuesta a las reseñas nuevas.' },
  { h: 12, a: 'Presupuestos', Icon: FileText, t: 'Escribe a los pacientes con un presupuesto abierto, en los días que habéis decidido.' },
  { h: 13, a: 'Redes y vídeos', Icon: Video, t: 'Publica el vídeo del día en Instagram, TikTok y YouTube.' },
  { h: 16, a: 'SEO y blog', Icon: PenLine, t: 'Publica el artículo de la semana sobre cigomáticos.' },
  { h: 18, a: 'Recordatorios', Icon: Bell, t: 'Envía los recordatorios de las citas de mañana y avisa a quien le toca higiene.' },
  { h: 20, a: 'Redes y vídeos', Icon: Video, t: 'Prepara los vídeos de mañana: guion, voz y portada.' },
  { h: 21, a: 'Recepción 24 h', Icon: MessageCircle, t: 'Contesta un WhatsApp con la clínica cerrada y reserva la primera visita.' },
  { h: 23, a: 'Estrategia', Icon: BarChart3, t: 'Resume el día en el panel: lo hecho, los resultados y lo que espera vuestra aprobación.' },
];

function DiaEmpresa() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const raiz = useRef(null);
  useEffect(() => {
    if (!auto || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 });
    if (raiz.current) io.observe(raiz.current);
    const id = setInterval(() => { if (visible) setI((n) => (n + 1) % DIA.length); }, 2200);
    return () => { clearInterval(id); io.disconnect(); };
  }, [auto]);
  const ev = DIA[i];
  const ang = (ev.h / 24) * 360;
  const elegir = (n) => { setAuto(false); setI(n); };
  return (
    <section className="ag-section ag-section--white pz-dia" id="dia" ref={raiz}>
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">Un día en vuestra empresa de IA</h2>
          <p className="ag-lead">Mientras la clínica abre, atiende y cierra, los agentes siguen el plan. Son 24 horas, todos los días del año. Toca cualquier hora del reloj.</p>
        </div>
        <div className="pz-dia__grid">
          <div className="pz-reloj">
            <svg viewBox="-170 -170 340 340" role="group" aria-label="Reloj de 24 horas">
              <circle r="150" className="pz-reloj__aro" />
              <path d={`M 0 -150 A 150 150 0 0 1 ${150 * Math.cos(((9 / 24) * 360 - 90) * Math.PI / 180)} ${150 * Math.sin(((9 / 24) * 360 - 90) * Math.PI / 180)}`} className="pz-reloj__noche" />
              <path d={`M ${150 * Math.cos(((19 / 24) * 360 - 90) * Math.PI / 180)} ${150 * Math.sin(((19 / 24) * 360 - 90) * Math.PI / 180)} A 150 150 0 0 1 0 -150`} className="pz-reloj__noche" />
              {Array.from({ length: 24 }, (_, h) => { const a = ((h / 24) * 360 - 90) * Math.PI / 180; return <text key={h} x={Math.cos(a) * 112} y={Math.sin(a) * 112 + 4} className={`pz-reloj__h ${h % 6 === 0 ? 'is-b' : ''}`}>{h}</text>; })}
              <circle r="150" className="pz-reloj__prog" pathLength="360" strokeDasharray={`${Math.max(ang, 0.5)} 360`} transform="rotate(-90)" />
              {DIA.map((d, n) => { const a = ((d.h / 24) * 360 - 90) * Math.PI / 180; return (
                <g key={d.h + d.a} className={`pz-reloj__ev ${n === i ? 'is-on' : ''}`} transform={`translate(${Math.cos(a) * 150} ${Math.sin(a) * 150})`} onClick={() => elegir(n)} role="button" tabIndex={0} aria-label={`${d.h}:00 ${d.a}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && elegir(n)}>
                  <circle r={n === i ? 13 : 9} />
                </g>
              ); })}
            </svg>
            <div className="pz-reloj__txt"><b>{String(ev.h).padStart(2, '0')}:00</b><span>{ev.h >= 19 || ev.h < 9 ? 'Clínica cerrada' : 'Clínica abierta'}</span></div>
          </div>
          <div className="pz-dia__lista">
            <div className="pz-dia__now" key={i}>
              <span className="pz-ag__ico"><ev.Icon size={22} /></span>
              <div><p className="pz-ag__tag">{String(ev.h).padStart(2, '0')}:00 · {ev.a}</p><p className="pz-dia__t">{ev.t}</p></div>
            </div>
            <ol>
              {DIA.map((d, n) => (
                <li key={d.h + d.a}><button type="button" aria-pressed={n === i} onClick={() => elegir(n)}><span>{String(d.h).padStart(2, '0')}:00</span>{d.a}</button></li>
              ))}
            </ol>
            <button type="button" className="pz-dia__auto" onClick={() => setAuto((x) => !x)}>{auto ? <><Pause size={15} /> Pausar el día</> : <><Play size={15} /> Ver el día solo</>}</button>
          </div>
        </div>
        <p className="oi-extra">Jornada de ejemplo: los horarios y las tareas los fijamos con vosotros en la estrategia.</p>
      </div>
    </section>
  );
}



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
            <small>Solo con los presupuestos recuperados, la cuota de la empresa de IA completa (990 €/mes){res >= 990 ? ` se cubriría ${res >= 1980 ? `${Math.floor(res / 990)} veces` : 'de sobra'}.` : ' no se cubriría todavía: aquí no cuentan los pacientes nuevos que traen redes, SEO, Google y campañas.'}</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PropuestaLluchmajor() {
  useSeo({ title: `Propuesta: empresa de IA para ${C.nombre} | Agutidesigns`, description: `Propuesta personalizada de empresa de IA para ${C.nombre}.`, path: '/propuesta/clinica-lluchmajor', noindex: true });
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
            <h1 className="pz-h1">{C.contacto}, vuestra clínica con su propia <em>empresa de IA</em>, 24/7.</h1>
            <p className="pz-lead">Un equipo de agentes que traza la estrategia digital de Lluchmajor y la sigue paso a paso cada día: redes sociales, SEO, Google Business, campañas, atención a pacientes y presupuestos. Sin horarios ni vacaciones. Vosotros lo veis todo en un panel y decidís.</p>
            <ul className="pz-notis" aria-hidden="true">
              <li><span>07:00 · Estrategia</span><b>Plan del día repartido</b>Vídeo, artículo y 2 posts en Google</li>
              <li><span>13:00 · Redes</span><b>Vídeo publicado</b>Instagram, TikTok y YouTube</li>
              <li><span>21:40 · Recepción</span><b>Cita reservada · lunes 9:30</b>WhatsApp con la clínica cerrada</li>
            </ul>
            <div className="ag-actions">
              <a href="#dia" className="ag-btn ag-btn--primary">Ver un día de trabajo <ArrowRight size={18} /></a>
              <a href="#inversion" className="ag-btn ag-btn--ghost">Ver la inversión</a>
            </div>
          </div>
        </header>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">Lo que hemos visto en vuestra clínica</h2>
              <p className="ag-lead">Hemos estudiado clinicalluchmajor.es: vuestros tratamientos, cómo se pide cita y cómo trabajáis. Esto es lo que una empresa de IA puede mejorar.</p>
            </div>
            <div className="pz-visto">
              {VISTO.map(({ Icon, t, d }, i) => (
                <article key={t} className="pz-visto__c"><span className="pz-n">{String(i + 1).padStart(2, '0')}</span><Icon size={22} /><h3>{t}</h3><p>{d}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="ag-section pz-ags">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">Piensa, ejecuta y rinde cuentas</h2>
              <p className="ag-lead">Una empresa de IA no es un chatbot: es un equipo que traza la estrategia digital de la clínica, la ejecuta cada día y os enseña los resultados. Esto es todo lo que podría tener Lluchmajor.</p>
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
            <div className="pz-dir"><Zap size={22} /><p><b>Vosotros decidís.</b> Lo delicado espera vuestra aprobación en el panel: ningún agente da precios, diagnósticos ni descuentos que no hayáis fijado.</p></div>
          </div>
        </section>

        <DiaEmpresa />

        <Simulador />

        <section className="cs-ofi pz-ofi">
          <div className="ag-wrap">
            <div className="cs-ofi__head">
              <p className="cs-k">Vuestra empresa de IA por dentro</p>
              <h2 className="cs-h2">Así trabajaría el equipo digital de Lluchmajor.</h2>
              <p>Con vuestro logo y vuestros colores. Gírala y mira a cada agente en su mesa: la estrategia reparte el trabajo, y redes, SEO, Google, campañas y pacientes lo ejecutan y se lo pasan entre ellos.</p>
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
                <p className="sx-plan__pitch">Vuestra empresa de IA completa: estrategia, los 8 agentes que la ejecutan 24/7 y el panel.</p>
                <ul className="ag-checks">
                  <li><Check size={16} />Estrategia digital mensual y plan diario</li>
                  <li><Check size={16} />Redes y vídeos, SEO y blog, Google Business y campañas</li>
                  <li><Check size={16} />Recepción 24 h, presupuestos y recordatorios</li>
                  <li><Check size={16} />Seguridad de la web, panel e informe mensual</li>
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
                <p className="sx-plan__pitch">Si preferís empezar por una parte: hasta 4 agentes coordinados, y ampliar cuando os compense.</p>
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
                ['Diseño de vuestra empresa de IA', 'Os proponemos qué hará cada agente, sus reglas y lo que tendréis que aprobar vosotros.'],
                ['Estrategia e instalación', 'Trazamos con vosotros la primera estrategia, conectamos los agentes a vuestra web, WhatsApp, redes, Google y campañas, y los probamos con casos reales.'],
                ['Funcionando 24/7', 'Los agentes ejecutan el plan cada día, lo veis en el panel y cada mes ajustamos la estrategia.'],
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

        <LeadSection fuente="propuesta-clinica-lluchmajor" title={`${C.contacto}, ¿lo vemos en 30 minutos?`} lead={`Te enseño una empresa de IA funcionando y vemos juntos cómo quedaría en ${C.nombre}. Si en vuestra clínica no tiene sentido, te lo diré. También puedes escribirme a ${CONTACT.email}.`} />
      </main>
      <Footer />
    </div>
  );
}

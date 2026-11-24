import { ArrowRight, Check, Bot, CalendarCheck, PenLine, MapPin, Headphones, Share2, LayoutDashboard, Gauge, ChevronDown } from 'lucide-react';
import Configurador from '../components/oficina/Configurador';
import { DEPARTAMENTOS, PRECIO_SUELTO, precioOficina, DIAS_PRUEBA, WEB_DESDE } from '../data/oficinaSaas';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CookieBanner from '../components/ui/LazyCookieBanner';
import { Process, Faq, LeadSection } from '../components/site/Sections';
import { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import useSeo from '../hooks/useSeo';
const OficinaHero3D = lazy(() => import('../components/oficina/OficinaHero3D'));
const Oficina3D = lazy(() => import('../components/oficina/Oficina3D'));
import { AGENTES } from '../components/oficina/agentes';
import '../components/oficina/Oficina3D.css';
import { useAparecer, useSalidaHero, FraseScroll, RompeElNo, Balanza, Cierre, BotonFlotante } from '../components/oficina/Animado';
import '../components/oficina/Animado.css';
import { AgentesIlustrados, Cinta, PanelEnVivo, DiaEnLaOficina, VideoComercial } from '../components/oficina/Ilustraciones';
import '../components/oficina/Ilustraciones.css';
import { CASOS_IA } from '../data/casosIA';
import { Cuenta } from './CasoIA';
import './CasoIA.css';
import './OficinaIA.css';

const SEO = {
  title: `Oficina de IA para tu negocio desde ${PRECIO_SUELTO} €/mes | Agutidesigns`,
  description: `Elige los departamentos de IA que necesita tu negocio (atención al cliente, citas, ventas, redes, Google y contenido) y míralos trabajar en directo desde tu panel. Sin puesta en marcha ni permanencia, desde ${PRECIO_SUELTO} €/mes.`,
};

const ICONOS = { atencion: Headphones, citas: CalendarCheck, ventas: Bot, redes: Share2, google: MapPin, contenido: PenLine };
const PILLARS = DEPARTAMENTOS.map((d) => ({ Icon: ICONOS[d.id], t: d.nombre, d: d.que }));

const OBJECIONES = [
  { pero: 'Es caro', resp: `Un departamento cuesta ${PRECIO_SUELTO} € al mes, con la IA incluida y sin puesta en marcha. Compáralo con las horas que hoy se van en contestar lo mismo, perseguir presupuestos y publicar.`, si: 'Empiezas por el área que más te duele y añades más cuando quieras.', ojo: 'Cada departamento tiene un cupo al mes. Si se te queda corto, lo amplías desde el panel.' },
  { pero: 'No me fío de que una IA hable con mis clientes', resp: 'Cada agente trabaja con reglas firmes y tú decides qué sale solo y qué pasa antes por ti. Lo delicado se queda pendiente de tu aprobación.', si: 'Todo queda registrado en el panel: ves qué ha dicho cada agente y a quién.', ojo: 'Al principio conviene revisar más, hasta que veas cómo responde con tus clientes.' },
  { pero: 'Mi negocio es distinto', resp: 'Por eso no hay plantillas: diseñamos la oficina con tu sector, tu tono y las herramientas que ya usas.', si: 'Los agentes aprenden tu forma de hablar y tus reglas, no las de otro.', ojo: 'No todo se puede automatizar. En la llamada te decimos con claridad qué no tiene sentido en tu caso.' },
  { pero: 'No tengo tiempo para montarlo', resp: 'La puesta en marcha la haces tú desde el panel en unos minutos: tus horarios, tus precios, tu tono y conectar tus cuentas, paso a paso.', si: 'No tienes que aprender nada técnico: el panel te guía y nosotros te ayudamos si te atascas.', ojo: 'Hay que conectar tus cuentas (WhatsApp, Google, redes) con los permisos que tú decidas.' },
  { pero: '¿Y si se equivoca?', resp: 'Los agentes no dan precios, plazos ni descuentos que no hayas fijado tú, y lo importante pasa por tu aprobación.', si: 'Si algo no te gusta, ajustamos sus reglas y no se repite.', ojo: 'La IA puede equivocarse, como una persona. Por eso lo delicado siempre lo decides tú.' },
  { pero: 'Mis clientes notarán que es una máquina', resp: 'Los agentes escriben con tu tono y se encargan de lo repetitivo. Lo personal sigue siendo tuyo.', si: 'Tus clientes reciben respuesta antes, también cuando tú no estás.', ojo: 'No sustituye el trato humano en las conversaciones delicadas, y no debería.' },
  { pero: 'Ya tengo mis herramientas', resp: 'Mejor: los agentes se conectan a lo que ya usas en lugar de obligarte a cambiar.', si: 'No migras nada ni cambias tu forma de trabajar.', ojo: 'Si alguna herramienta no permite conectarse, te lo decimos antes de empezar.' },
];

const VENTAJAS = ['Trabaja cada día, sin vacaciones ni bajas', 'Sin puesta en marcha ni permanencia', 'IA incluida, con un cupo claro cada mes', 'Lo ves todo en tu panel, en directo', 'Añades o quitas departamentos cuando quieras', 'Lo usamos cada día en Agutidesigns'];
const DESVENTAJAS = ['Hay que dedicarle unos minutos a configurarlo', 'Cada departamento tiene un cupo al mes', 'Al principio conviene revisar lo que hace', 'No sustituye a las personas en lo delicado', 'Depende de que tus cuentas se puedan conectar'];
const TABLA = {
  cols: ['Oficina de IA', 'Contratar a alguien', 'Seguir como ahora'],
  filas: [
    ['Coste', `Desde ${PRECIO_SUELTO} €/mes`, 'Sueldo + Seguridad Social', 'Tus horas'],
    ['Trabaja cada día', true, 'Su jornada', 'Cuando puedes'],
    ['Vacaciones y bajas', 'No tiene', 'Sí', 'Te toca a ti'],
    ['Seguimientos sin olvidos', true, 'Depende', false],
    ['Todo visible en un panel', true, false, false],
    ['Trato humano en lo delicado', 'Lo haces tú', true, true],
  ],
};

const PROCESS = [
  { t: 'Elige tus departamentos', d: 'Marca los que necesita tu negocio y ve el precio al momento. Sin puesta en marcha ni permanencia.' },
  { t: 'Paga y entra en tu panel', d: 'Pagas con tarjeta y recibes el acceso a tu oficina en tu correo.' },
  { t: 'Cuéntale cómo es tu negocio', d: 'Horarios, precios, servicios y tu forma de hablar. El panel te guía paso a paso.' },
  { t: 'Conecta y míralos trabajar', d: 'Conectas tu WhatsApp, tu Google o tus redes, y ves a tus agentes trabajar en directo.' },
];

const FAQ = [
  { q: '¿Necesito saber de inteligencia artificial?', a: 'No. Eliges tus departamentos, rellenas los datos de tu negocio y el panel te guía para conectar tus cuentas. Si te atascas, te ayudamos.' },
  { q: '¿Hay permanencia o puesta en marcha?', a: 'No. En el plan mensual pagas cada mes y puedes añadir, quitar departamentos o darte de baja desde tu panel cuando quieras.' },
  { q: '¿Puedo probarlo gratis?', a: `Sí. El plan mensual tiene ${DIAS_PRUEBA} días gratis con los departamentos que elijas (con el 25 % de su cupo). Te pedimos la tarjeta, pero no te cobramos nada hasta el día ${DIAS_PRUEBA + 1}, y si cancelas antes no pagas nada.` },
  { q: '¿Qué incluye el plan anual?', a: `Lo mismo que el mensual con un 20 % de descuento, en un solo pago al año. Y a partir de ${WEB_DESDE} departamentos incluye el diseño de tu web, o el rediseño de la que ya tienes.` },
  { q: '¿Qué pasa si se me acaba el cupo del mes?', a: 'Te avisamos al llegar al 80 %. Si se acaba, el departamento solo te pasa los avisos importantes hasta que lo amplíes o empiece el mes siguiente. Nunca te cobramos de más sin que lo sepas.' },
  { q: '¿Qué pasa si un agente se equivoca?', a: 'Cada agente tiene reglas firmes (por ejemplo, no dar precios ni plazos que no hayas fijado tú, o no publicar sin tu permiso si así lo quieres). Lo delicado queda pendiente de tu aprobación y todo queda registrado en el panel.' },
  { q: '¿Qué herramientas necesito?', a: 'Las que ya usas: tu WhatsApp Business, tu web, tus redes y tu ficha de Google. La IA va incluida en la cuota.' },
  { q: '¿Y mis datos?', a: 'Los agentes trabajan con tus propias cuentas y solo con los permisos que les des. Revisamos contigo la protección de datos de cada agente antes de ponerlo a trabajar.' },
  { q: '¿Sustituye a mi equipo?', a: 'No. Le quita el trabajo repetitivo (contestar lo de siempre, publicar, hacer seguimientos) para que tu equipo se dedique a lo que de verdad vende.' },
];

const jsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Service', name: 'Oficina de IA: agentes de IA para empresas', serviceType: 'Implantación de agentes de inteligencia artificial', provider: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io' }, areaServed: 'ES', url: 'https://agutidesigns.io/oficina-ia',
      offers: [1, 3, 6].map((k) => ({ '@type': 'Offer', name: `Oficina de IA · ${k} departamento${k > 1 ? 's' : ''}`, price: String(precioOficina(k)), priceCurrency: 'EUR' })) },
    { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
});

const ROTA = ['trazan tu estrategia digital', 'la ejecutan cada día', 'llevan tus redes sociales', 'posicionan tu web en Google', 'cuidan tu ficha de Google', 'atienden a tus clientes'];

function OficinaInteractiva() {
  const [sel, setSel] = useState(0);
  const elegir = useCallback((i) => setSel(i), []);
  const a = AGENTES[sel];
  return (
    <section className="ag-section ag-section--white" id="oficina-3d">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">Entra en la oficina</h2>
          <p className="ag-lead">Así trabaja un equipo de agentes de IA: cada uno en su mesa, con su tarea, y todo lo que hacen llega al panel. Gírala y toca a cualquier agente.</p>
        </div>
        <div className="o3-grid">
          <Suspense fallback={<div className="o3-lienzo" />}>
            <Oficina3D onSelect={elegir} seleccionado={sel} />
          </Suspense>
          <aside className="o3-ficha" aria-live="polite">
            <span className="o3-ficha__tag"><i style={{ background: a.color }} /> Agente de {a.nombre.toLowerCase()}</span>
            <h3 className="ag-h3">{a.nombre}</h3>
            <p>{a.que}</p>
            <ul>{a.tareas.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="o3-chips" role="group" aria-label="Elige un agente">
              {AGENTES.map((x, i) => <button key={x.id} type="button" aria-pressed={i === sel} onClick={() => setSel(i)}><i style={{ background: x.color }} />{x.nombre}</button>)}
            </div>
          </aside>
        </div>
        <p className="oi-extra">Escena ilustrativa: en tu empresa elegimos juntos qué agentes tiene la oficina.</p>
      </div>
    </section>
  );
}

function HeroOficina() {
  const [listo, setListo] = useState(false);
  const [i, setI] = useState(0);
  const marcarListo = useCallback(() => setListo(true), []);
  const hRef = useRef(null);
  useSalidaHero(hRef);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % ROTA.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <header ref={hRef} className={`oh ${listo ? 'oh--listo' : ''}`}>
      <Suspense fallback={null}><OficinaHero3D onListo={marcarListo} /></Suspense>
      <div className="oh-velo" aria-hidden="true" />
      <div className="ag-wrap oh-wrap">
        <p className="oh-live"><i aria-hidden="true" /> Oficina de IA · en directo</p>
        <h1 className="oh-h1">
          <span className="oh-l"><span>Una empresa</span></span>
          <span className="oh-l"><span>de IA para</span></span>
          <span className="oh-l"><span><em>la tuya, 24/7</em></span></span>
        </h1>
        <p className="oh-rota" aria-live="off">
          <span className="oh-rota__fijo">Agentes que</span>{' '}
          <span className="oh-rota__caja">
            {ROTA.map((t, n) => <span key={t} className={`oh-rota__w ${n === i ? 'is-on' : ''}`} aria-hidden={n !== i}>{t}</span>)}
          </span>
        </p>
        <p className="oh-lead">Elige los departamentos que necesita tu negocio: atención al cliente, citas, ventas, redes, Google y contenido. Trabajan cada día, sin horarios ni vacaciones, y tú los ves en directo desde tu panel.</p>
        <div className="ag-actions oh-actions">
          <a href="#precios" className="ag-btn ag-btn--primary">Monta tu oficina · desde {PRECIO_SUELTO} €/mes</a>
          <a href="/app?demo=1" className="ag-btn oh-btn-ghost">Ver el panel por dentro</a>
        </div>
        <ul className="oh-trust">
          <li><Check size={16} /> {DIAS_PRUEBA} días gratis</li>
          <li><Check size={16} /> Sin permanencia</li>
          <li><Check size={16} /> IA incluida</li>
        </ul>
      </div>
      <p className="oh-pie">Esta es la oficina real de Agutidesigns · actividad ilustrativa</p>
      <a href="#agentes-intro" className="oh-baja" aria-label="Seguir bajando"><ChevronDown size={22} /></a>
    </header>
  );
}

function CasosExito() {
  return (
    <section className="ce" id="casos">
      <div className="ag-wrap">
        <div className="ce-head">
          <p className="pv-k">Casos de éxito</p>
          <h2 className="pv-h">No es una promesa.<br /><span>Ya está funcionando.</span></h2>
        </div>
        <div className="ce-grid">
          {CASOS_IA.map((c) => (
            <a key={c.slug} href={`/casos/${c.slug}`} className={`ce-card ce-card--${c.slug}`}>
              <div className="ce-logo"><img src={c.logo} alt={c.nombre} width="400" height="150" /></div>
              <p className="ce-sector">{c.sector}</p>
              <p className="ce-num"><Cuenta {...c.cifra} /></p>
              <p className="ce-num-l">{c.cifra.l}{c.cifra2 ? ` · ${c.cifra2.pre}${c.cifra2.v} ${c.cifra2.suf.trim()} ${c.cifra2.l}` : ''}</p>
              <h3>{c.titular}</h3>
              <p className="ce-txt">{c.resumen}</p>
              <span className="ce-ver">Ver el caso y su oficina 3D <ArrowRight size={18} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OficinaIA() {
  useSeo({ ...SEO, path: '/oficina-ia', image: '/img/og-home.jpg', jsonLd: jsonLd() });
  const raiz = useRef(null);
  useAparecer(raiz);
  return (
    <div className="ag oi-page" ref={raiz}>
      <Navbar minimal cta={{ label: 'Monta tu oficina', href: '#precios' }} />
      <main>
        <HeroOficina />
        <div id="agentes-intro" />
        <FraseScroll texto="Una estrategia digital solo funciona si alguien la ejecuta cada día. Una empresa de IA la traza, la sigue paso a paso las 24 horas y te enseña los resultados. Tú solo decides." destacadas={['empresa', 'IA', '24', 'decides']} />

        <VideoComercial />
        <Cinta filas={[['Contesta presupuestos', 'Hace seguimiento', 'Propone llamadas', 'Escribe el blog', 'Prepara posts de LinkedIn', 'Hace vídeos', 'Programa redes'], ['Publica en Google', 'Atiende a clientes', 'Anota cambios', 'Revisa anuncios', 'Respeta tu tope de gasto', 'Te pide aprobación', 'Lo deja todo en el panel']]} />
        <OficinaInteractiva />
        <PanelEnVivo />

        <AgentesIlustrados id="agentes" title="Tu oficina de IA, departamento a departamento" lead="Elige los que necesitas. Cada uno tiene su tarea, sus reglas y su cupo del mes, y todos trabajan coordinados." items={PILLARS}>
          <div className="oi-real">
            <article><LayoutDashboard size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Un panel para verlo todo</h3><p>Qué ha hecho cada agente, qué está pendiente de tu aprobación y qué viene después.</p></article>
            <article><Gauge size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Consumo bajo control</h3><p>Cada departamento tiene su cupo del mes y ves en tu panel cuánto lleva gastado. Sin sorpresas.</p></article>
            <article><Check size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Probado en casa</h3><p>Es el mismo sistema con el que funciona Agutidesigns: lo usamos cada día antes de ofrecértelo a ti.</p></article>
          </div>
        </AgentesIlustrados>

        <DiaEnLaOficina />
        <CasosExito />
        <RompeElNo items={OBJECIONES} />
        <Balanza ventajas={VENTAJAS} desventajas={DESVENTAJAS} tabla={TABLA} />

        <Configurador />

        <Process title="Tu oficina, funcionando hoy mismo" items={PROCESS} white />
        <Faq items={FAQ} title="Preguntas sobre la Oficina de IA" />
        <Cierre />
        <LeadSection fuente="landing-oficina-ia" title="¿Prefieres que te lo enseñemos?" lead="Si tienes dudas sobre qué departamentos elegir, te enseñamos el panel funcionando y lo vemos juntos. 30 minutos, sin compromiso." />
      </main>
      <BotonFlotante />
      <Footer />
      <CookieBanner />
    </div>
  );
}

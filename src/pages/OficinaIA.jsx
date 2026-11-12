import { ArrowRight, Check, Bot, Video, PenLine, MapPin, Headphones, Megaphone, LayoutDashboard, Wrench, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
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
  title: 'Oficina de IA: agentes de IA para tu empresa | Agutidesigns',
  description: 'Instalamos en tu empresa un equipo de agentes de IA que contestan a tus clientes, hacen tu contenido y vídeos, cuidan tu ficha de Google y te enseñan todo en un panel. Pide una demo.',
};

const PILLARS = [
  { Icon: Bot, t: 'Agente de ventas', d: 'Contesta a quien pide presupuesto o información, le hace seguimiento por correo y te avisa cuando alguien quiere una llamada.' },
  { Icon: Video, t: 'Agente de vídeos y redes', d: 'Prepara guion, voz, animación, portada y descripciones, y programa los vídeos en Instagram, TikTok, YouTube y LinkedIn.' },
  { Icon: PenLine, t: 'Agente de contenido', d: 'Escribe los artículos del blog y los posts de LinkedIn con tu tono, y los deja publicados o listos para revisar.' },
  { Icon: MapPin, t: 'Agente de Google Business', d: 'Mantiene viva tu ficha de Google con publicaciones regulares y te prepara las respuestas a las reseñas.' },
  { Icon: Headphones, t: 'Agente de atención a clientes', d: 'Responde las dudas de tus clientes por correo y anota lo que piden para que no se pierda nada.' },
  { Icon: Megaphone, t: 'Agente de publicidad', d: 'Revisa tus campañas de Google Ads, quita lo que gasta sin traer clientes y nunca pasa del tope que tú le pongas.' },
];

const PLANES = [
  { id: 'agente', name: 'Un agente', setup: '2.900', monthly: '290', pitch: 'Para empezar por lo que más te duele: un agente para un área concreta.',
    includes: ['1 agente a medida (ventas, contenido, vídeos o clientes)', 'Conectado a tu correo, tu web o tus redes', 'Reglas claras de lo que puede y no puede hacer', 'Mantenimiento y ajustes cada mes'] },
  { id: 'oficina', name: 'Oficina de IA', setup: '6.900', monthly: '590', recommended: true, pitch: 'Un equipo de agentes que trabaja coordinado y un panel donde lo ves todo.',
    includes: ['Hasta 4 agentes coordinados entre sí', 'Panel propio con lo que hace cada agente', 'Aprobaciones: tú decides qué sale solo y qué revisas', 'Mantenimiento, mejoras y un agente nuevo al año'] },
  { id: 'completa', name: 'Oficina completa', setup: 'Desde 12.000', monthly: '990', pitch: 'Para empresas con varias áreas, sedes o equipos que quieren automatizar a fondo.',
    includes: ['Todos los agentes que necesites', 'Integraciones con tus herramientas (CRM, agenda, facturación)', 'Formación para tu equipo', 'Soporte prioritario'] },
];

const OBJECIONES = [
  { pero: 'Es caro', resp: 'Compáralo con las horas que hoy se van en contestar lo mismo, perseguir presupuestos y publicar. Puedes empezar con un solo agente y ampliar solo si te compensa.', si: 'Empiezas por el área que más te duele, sin montar toda la oficina de golpe.', ojo: 'Hay una puesta en marcha y las licencias de IA se pagan aparte, a nombre de tu empresa.' },
  { pero: 'No me fío de que una IA hable con mis clientes', resp: 'Cada agente trabaja con reglas firmes y tú decides qué sale solo y qué pasa antes por ti. Lo delicado se queda pendiente de tu aprobación.', si: 'Todo queda registrado en el panel: ves qué ha dicho cada agente y a quién.', ojo: 'Al principio conviene revisar más, hasta que veas cómo responde con tus clientes.' },
  { pero: 'Mi negocio es distinto', resp: 'Por eso no hay plantillas: diseñamos la oficina con tu sector, tu tono y las herramientas que ya usas.', si: 'Los agentes aprenden tu forma de hablar y tus reglas, no las de otro.', ojo: 'No todo se puede automatizar. En la llamada te decimos con claridad qué no tiene sentido en tu caso.' },
  { pero: 'No tengo tiempo para montarlo', resp: 'Lo instalamos y lo mantenemos nosotros. Tu parte es una llamada de diagnóstico y aprobar qué hará cada agente.', si: 'No tienes que aprender nada técnico: solo mirar el panel.', ojo: 'Necesitamos acceso a tus cuentas (correo, web, redes) con los permisos que tú decidas.' },
  { pero: '¿Y si se equivoca?', resp: 'Los agentes no dan precios, plazos ni descuentos que no hayas fijado tú, y lo importante pasa por tu aprobación.', si: 'Si algo no te gusta, ajustamos sus reglas y no se repite.', ojo: 'La IA puede equivocarse, como una persona. Por eso lo delicado siempre lo decides tú.' },
  { pero: 'Mis clientes notarán que es una máquina', resp: 'Los agentes escriben con tu tono y se encargan de lo repetitivo. Lo personal sigue siendo tuyo.', si: 'Tus clientes reciben respuesta antes, también cuando tú no estás.', ojo: 'No sustituye el trato humano en las conversaciones delicadas, y no debería.' },
  { pero: 'Ya tengo mis herramientas', resp: 'Mejor: los agentes se conectan a lo que ya usas en lugar de obligarte a cambiar.', si: 'No migras nada ni cambias tu forma de trabajar.', ojo: 'Si alguna herramienta no permite conectarse, te lo decimos antes de empezar.' },
];

const VENTAJAS = ['Trabaja cada día, sin vacaciones ni bajas', 'No se olvida de ningún seguimiento', 'Lo ves todo en un panel, en tiempo real', 'Tú decides qué sale solo y qué revisas', 'Crece contigo: añades agentes cuando quieras', 'Lo usamos cada día en Agutidesigns'];
const DESVENTAJAS = ['Necesita una puesta en marcha: no es instantáneo', 'Las licencias de IA se pagan aparte', 'Al principio conviene revisar lo que hace', 'No sustituye a las personas en lo delicado', 'Depende de que tus herramientas se puedan conectar'];
const TABLA = {
  cols: ['Oficina de IA', 'Contratar a alguien', 'Seguir como ahora'],
  filas: [
    ['Coste', 'Puesta en marcha + cuota', 'Sueldo + Seguridad Social', 'Tus horas'],
    ['Trabaja cada día', true, 'Su jornada', 'Cuando puedes'],
    ['Vacaciones y bajas', 'No tiene', 'Sí', 'Te toca a ti'],
    ['Seguimientos sin olvidos', true, 'Depende', false],
    ['Todo visible en un panel', true, false, false],
    ['Trato humano en lo delicado', 'Lo haces tú', true, true],
  ],
};

const PROCESS = [
  { t: 'Llamada de diagnóstico', d: 'Vemos qué tareas se repiten en tu empresa y cuáles puede llevar ya un agente. Gratis y sin compromiso.' },
  { t: 'Diseño de tu oficina', d: 'Te proponemos qué agentes, qué hará cada uno, qué reglas seguirá y qué tendrás que aprobar tú.' },
  { t: 'Instalación y pruebas', d: 'Conectamos los agentes a tus herramientas y los probamos con casos reales antes de dejarlos trabajar solos.' },
  { t: 'Funcionando y mejorando', d: 'Los agentes trabajan cada día, tú lo ves en el panel y nosotros los ajustamos cada mes.' },
];

const FAQ = [
  { q: '¿Necesito saber de inteligencia artificial?', a: 'No. Nosotros lo instalamos y lo mantenemos. Tú ves lo que hacen los agentes en el panel y apruebas lo que quieras revisar.' },
  { q: '¿Qué pasa si un agente se equivoca?', a: 'Cada agente tiene reglas firmes (por ejemplo, no dar precios ni plazos que no hayas fijado tú, o no publicar sin tu permiso si así lo quieres). Lo delicado queda pendiente de tu aprobación y todo queda registrado en el panel.' },
  { q: '¿Qué herramientas necesito?', a: 'Las que ya usas: tu correo, tu web, tus redes y tu ficha de Google. Las licencias de IA y de las herramientas que haga falta contratar van a nombre de tu empresa y aparte de la cuota.' },
  { q: '¿Y mis datos?', a: 'Los agentes trabajan con tus propias cuentas y solo con los permisos que les des. Revisamos contigo la protección de datos de cada agente antes de ponerlo a trabajar.' },
  { q: '¿Sustituye a mi equipo?', a: 'No. Le quita el trabajo repetitivo (contestar lo de siempre, publicar, hacer seguimientos) para que tu equipo se dedique a lo que de verdad vende.' },
];

const jsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Service', name: 'Oficina de IA: agentes de IA para empresas', serviceType: 'Implantación de agentes de inteligencia artificial', provider: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io' }, areaServed: 'ES', url: 'https://agutidesigns.io/oficina-ia',
      offers: PLANES.filter((p) => /^\d/.test(p.setup)).map((p) => ({ '@type': 'Offer', name: p.name, price: p.monthly, priceCurrency: 'EUR' })) },
    { '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
});

const ROTA = ['contestan a tus clientes', 'siguen cada presupuesto', 'hacen tus vídeos', 'escriben tu blog', 'cuidan tu ficha de Google'];

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
          <span className="oh-l"><span>Tu empresa,</span></span>
          <span className="oh-l"><span>con su propia</span></span>
          <span className="oh-l"><span><em>oficina de IA</em></span></span>
        </h1>
        <p className="oh-rota" aria-live="off">
          <span className="oh-rota__fijo">Agentes que</span>{' '}
          <span className="oh-rota__caja">
            {ROTA.map((t, n) => <span key={t} className={`oh-rota__w ${n === i ? 'is-on' : ''}`} aria-hidden={n !== i}>{t}</span>)}
          </span>
        </p>
        <p className="oh-lead">Instalamos en tu empresa un equipo de agentes de IA que trabaja cada día. Tú lo ves todo en un panel y decides qué revisas.</p>
        <div className="ag-actions oh-actions">
          <a href="#propuesta" className="ag-btn ag-btn--primary">Pide una demo</a>
          <a href="#precios" className="ag-btn oh-btn-ghost">Ver precios</a>
        </div>
        <ul className="oh-trust">
          <li><Check size={16} /> Lo usamos cada día en Agutidesigns</li>
          <li><Check size={16} /> Instalado y mantenido por nosotros</li>
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
      <Navbar minimal cta={{ label: 'Pide una demo', href: '#propuesta' }} />
      <main>
        <HeroOficina />
        <div id="agentes-intro" />
        <FraseScroll texto="Cada día tu empresa pierde horas contestando lo mismo, persiguiendo presupuestos y publicando cuando hay tiempo. Una oficina de IA hace ese trabajo por ti. Tú solo decides." destacadas={['oficina', 'IA', 'decides']} />

        <VideoComercial />
        <Cinta filas={[['Contesta presupuestos', 'Hace seguimiento', 'Propone llamadas', 'Escribe el blog', 'Prepara posts de LinkedIn', 'Hace vídeos', 'Programa redes'], ['Publica en Google', 'Atiende a clientes', 'Anota cambios', 'Revisa anuncios', 'Respeta tu tope de gasto', 'Te pide aprobación', 'Lo deja todo en el panel']]} />
        <OficinaInteractiva />
        <PanelEnVivo />

        <AgentesIlustrados id="agentes" title="Tu oficina de IA, agente a agente" lead="Elige los que necesitas. Cada uno tiene su tarea, sus reglas y su horario, y todos trabajan coordinados." items={PILLARS}>
          <div className="oi-real">
            <article><LayoutDashboard size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Un panel para verlo todo</h3><p>Qué ha hecho cada agente, qué está pendiente de tu aprobación y qué viene después.</p></article>
            <article><Wrench size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Hecho a medida</h3><p>Lo adaptamos a tu sector, a tu forma de trabajar y a las herramientas que ya usas.</p></article>
            <article><Check size={22} /><h3 className="ag-h3" style={{ marginTop: 10 }}>Probado en casa</h3><p>Es el mismo sistema con el que funciona Agutidesigns: lo usamos cada día antes de instalártelo a ti.</p></article>
          </div>
        </AgentesIlustrados>

        <DiaEnLaOficina />
        <CasosExito />
        <RompeElNo items={OBJECIONES} />
        <Balanza ventajas={VENTAJAS} desventajas={DESVENTAJAS} tabla={TABLA} />

        <section id="precios" className="ag-section">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split">
              <h2 className="ag-h2">Precios de la Oficina de IA</h2>
              <p className="ag-lead">Una puesta en marcha para diseñar e instalar tus agentes y una cuota mensual para mantenerlos y mejorarlos.</p>
            </div>
            <div className="sx-plans">
              {PLANES.map((p) => (
                <article key={p.id} className={`sx-plan ${p.recommended ? 'sx-plan--rec' : ''}`} aria-label={`Plan ${p.name}`}>
                  {p.recommended && <span className="sx-plan__badge">El más elegido</span>}
                  <h3 className="sx-plan__name">{p.name}</h3>
                  <p className="sx-plan__price"><b>{p.monthly} €</b><span>/mes</span></p>
                  <p className="sx-plan__setup">+ {p.setup} € de puesta en marcha</p>
                  <p className="sx-plan__pitch">{p.pitch}</p>
                  <ul className="ag-checks">{p.includes.map((i) => <li key={i}><Check size={16} />{i}</li>)}</ul>
                  <a href="#propuesta" className={`ag-btn ${p.recommended ? 'ag-btn--primary' : 'ag-btn--ghost'}`}>Quiero {p.name.toLowerCase()}</a>
                </article>
              ))}
            </div>
            <p className="oi-extra">Precios sin IVA. Las licencias de IA y de las herramientas necesarias van a nombre de tu empresa y se pagan aparte.</p>
          </div>
        </section>

        <Process title="Cómo montamos tu oficina de IA" items={PROCESS} white />
        <Faq items={FAQ} title="Preguntas sobre la Oficina de IA" />
        <Cierre />
        <LeadSection fuente="landing-oficina-ia" title="Pide una demo de tu oficina de IA" lead="Te enseñamos el panel funcionando y vemos juntos qué agentes tendrían más sentido en tu empresa. 30 minutos, sin compromiso." />
      </main>
      <BotonFlotante />
      <Footer />
      <AIChatbot />
      <CookieBanner />
    </div>
  );
}

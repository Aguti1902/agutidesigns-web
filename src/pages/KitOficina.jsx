// Landing de venta del «Kit Oficina de IA» (producto descargable, 47 €, pago con Stripe).
// Llega tráfico de anuncios y de los comentarios «OFICINA» de los vídeos: móvil primero, rápido y claro.
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Download, Box, Users, FileText, Wand2, LayoutDashboard, MessageCircle, Repeat, Instagram, Video, PenLine, MapPin, Star, Sun, ShieldCheck, Lock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Faq } from '../components/site/Sections';
import useSeo from '../hooks/useSeo';
import { useAparecer } from '../components/oficina/Animado';
import '../components/oficina/Animado.css';
import './KitOficina.css';

// Enlace de pago de Stripe (Payment Link). Tras pagar, Stripe redirige a /kit-oficina-ia/gracias?session_id=…
export const KIT_STRIPE = ''; // ← enlace de pago de Stripe (Payment Link). Vacío = el pago aún no está activado.
const KIT_PAGO = KIT_STRIPE || '#precio';
const PRECIO = '47 €';

const INCLUYE = [
  { Icon: LayoutDashboard, t: 'Tu panel con la oficina en 3D', d: 'Con tu nombre y tus colores. Ves a tus agentes trabajar y, debajo, lo que importa: clientes, aprobaciones y tareas.' },
  { Icon: Users, t: '8 agentes de IA listos', d: 'Recepción, ventas, redes, vídeos, blog, Google Business, reseñas e informe diario. Cada uno con su tarea, su horario y sus reglas.' },
  { Icon: Wand2, t: 'Instalación con un solo mensaje', d: 'Pegas el texto del instalador en Claude y él te pregunta lo necesario, configura el panel y programa los agentes.' },
  { Icon: FileText, t: 'La ficha de tu negocio', d: 'Una plantilla para contarle a tus agentes qué vendes, a quién y cómo hablas. Lo que no esté ahí, no lo dicen.' },
  { Icon: Box, t: 'Guía de instalación en PDF', d: 'Paso a paso, con capturas, por dónde empezar, cómo personalizarlo y qué hacer si algo falla.' },
];

const AGENTES = [
  { Icon: MessageCircle, n: 'Nora', p: 'Recepción', d: 'Contesta al momento a cada cliente nuevo que te escribe.' },
  { Icon: Repeat, n: 'Sara', p: 'Ventas', d: 'Sigue cada presupuesto hasta que te dicen sí o no.' },
  { Icon: Instagram, n: 'Marta', p: 'Redes sociales', d: 'Te deja los posts de la semana listos para aprobar.' },
  { Icon: Video, n: 'Diego', p: 'Vídeos', d: 'Escribe guiones de vídeos cortos para grabar en 5 minutos.' },
  { Icon: PenLine, n: 'Rafa', p: 'Blog y SEO', d: 'Un artículo a la semana para que te encuentren en Google.' },
  { Icon: MapPin, n: 'Pablo', p: 'Google Business', d: 'Publicaciones para tu ficha y respuestas a tus reseñas.' },
  { Icon: Star, n: 'Elena', p: 'Reseñas', d: 'Pide la reseña a cada cliente contento.' },
  { Icon: Sun, n: 'Clara', p: 'Informe diario', d: 'Cada mañana te dice qué ha pasado y qué te toca hoy.' },
];

const FAQ = [
  { q: '¿Necesito saber programar?', a: 'No. Lo instalas pegando un texto en Claude: él te hace las preguntas, configura el panel y programa los agentes. Si sabes escribir un correo, sabes instalarlo.' },
  { q: '¿Qué necesito para que funcione?', a: 'Una cuenta de Claude de pago que incluya tareas programadas y conectores (compruébalo en claude.ai, porque el precio y lo que incluye cada plan lo pone Claude), y tu Gmail conectado para los agentes que contestan correos. El kit no incluye la suscripción a Claude.' },
  { q: '¿Funciona para mi negocio?', a: 'Está pensado para emprendedores y pequeños negocios que venden servicios o productos y reciben clientes por correo, web o redes: consultas, clínicas, academias, tiendas, agencias, profesionales… Tú le cuentas tu negocio en una ficha y los agentes trabajan con eso.' },
  { q: '¿Puedo modificarlo?', a: 'Sí, es tuyo. Cambia los nombres, horarios y tareas de los agentes, crea agentes nuevos o cambia el panel. La guía te enseña a hacerlo pidiéndoselo a Claude con tus palabras.' },
  { q: '¿Los agentes van a escribir a mis clientes sin que yo lo vea?', a: 'Los de Recepción y Ventas contestan a quien te escribe (para eso están), con reglas firmes: no inventan precios, no dan descuentos ni plazos y, si dudan, te dejan una tarea. Posts, guiones, artículos y respuestas a reseñas pasan antes por tu visto bueno en el panel.' },
  { q: '¿Cómo lo recibo?', a: 'Nada más pagar te llevamos a la página de descarga y te enviamos el enlace por correo. Es un archivo .zip con todo el kit.' },
  { q: '¿Puedo devolverlo?', a: 'Es un producto digital que se descarga al momento: al comprarlo aceptas que la entrega es inmediata y que, una vez descargado, pierdes el derecho de desistimiento. Si tienes cualquier problema con la instalación, escríbenos a info@agutidesigns.io y te ayudamos.' },
  { q: '¿Y si prefiero que me lo montéis vosotros?', a: 'También lo hacemos: instalamos oficinas de IA a medida, conectadas a tu web, tu WhatsApp, tus campañas y tu agenda. Lo tienes en agutidesigns.io/oficina-ia.' },
];

function BotonComprar({ className = '', children }) {
  return (
    <a href={KIT_PAGO} className={`ag-btn ag-btn--primary kt-comprar ${className}`} rel="noopener">
      {children || <>Comprar el kit · {PRECIO} <ArrowRight size={18} /></>}
    </a>
  );
}

function BarraMovil() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const on = () => { const p = document.getElementById('precio'); const enPrecio = p && p.getBoundingClientRect().top < window.innerHeight && p.getBoundingClientRect().bottom > 0; setVer(window.scrollY > 500 && !enPrecio); };
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <div className={`kt-barra ${ver ? 'is-on' : ''}`} aria-hidden={!ver}>
      <span><b>Kit Oficina de IA</b><small>{PRECIO} · descarga inmediata</small></span>
      <a href={KIT_PAGO} className="ag-btn ag-btn--primary ag-btn--sm" tabIndex={ver ? 0 : -1}>Comprar</a>
    </div>
  );
}

export default function KitOficina() {
  useSeo({
    title: 'Kit Oficina de IA: monta tu equipo de agentes de IA con Claude | Agutidesigns',
    description: 'Descarga el kit para montar tu propia oficina de IA: panel con oficina 3D, 8 agentes listos y guía de instalación con Claude. 47 €, pago único.',
    path: '/kit-oficina-ia',
  });
  const raiz = useRef(null);
  useAparecer(raiz);
  return (
    <div className="ag oi-page kt" ref={raiz}>
      <Navbar minimal cta={{ label: `Comprar · ${PRECIO}`, href: KIT_PAGO }} />
      <main>
        <header className="kt-hero">
          <div className="ag-wrap kt-hero__in">
            <p className="kt-k">Kit descargable · {PRECIO}</p>
            <h1 className="kt-h1">Monta tu propia <em>oficina de IA</em> esta tarde.</h1>
            <p className="kt-lead">El sistema de agentes con el que trabajo en Agutidesigns, listo para tu negocio: 8 agentes de IA que contestan a tus clientes, siguen tus presupuestos y preparan tu contenido, y un panel con tu oficina en 3D para verlo todo. Se instala con Claude pegando un solo mensaje.</p>
            <div className="ag-actions"><BotonComprar /><a href="#incluye" className="ag-btn ag-btn--ghost">Qué incluye</a></div>
            <ul className="kt-mini"><li><Download size={15} /> Descarga inmediata</li><li><Lock size={15} /> Pago seguro con Stripe</li><li><Check size={15} /> Pago único, sin cuotas</li></ul>
          </div>
          <div className="ag-wrap"><figure className="kt-hero__img"><img src="/img/kit-oficina.webp" alt="La oficina 3D del panel del kit, con los agentes trabajando en sus mesas" width="1600" height="658" fetchPriority="high" /></figure></div>
        </header>

        <section className="ag-section ag-section--white kt-video">
          <div className="ag-wrap kt-video__in">
            <p className="kt-k">Lo que viste en el vídeo</p>
            <h2 className="ag-h2">Una empresa con empleados que no son humanos. Ahora, la tuya.</h2>
            <p className="ag-lead">En Agutidesigns cada puesto lo ocupa un agente de IA: uno contesta a cada cliente que pide presupuesto, otro escribe el blog, otros preparan el contenido y cuidan la ficha de Google, y yo lo veo todo en un panel. Este kit es esa misma idea, empaquetada para que la montes tú en tu negocio.</p>
          </div>
        </section>

        <section className="ag-section" id="incluye">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">Qué incluye el kit</h2><p className="ag-lead">Todo lo que necesitas para tener tu equipo de agentes trabajando, en un solo archivo.</p></div>
            <div className="kt-incluye">
              {INCLUYE.map(({ Icon, t, d }) => <article key={t} className="kt-card"><span className="kt-ico"><Icon size={22} /></span><h3>{t}</h3><p>{d}</p></article>)}
            </div>
          </div>
        </section>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">Tu equipo: 8 agentes</h2><p className="ag-lead">Empieza con tres (Recepción, Ventas e Informe diario) y añade los demás cuando quieras. Cambia sus nombres, horarios y tareas cuando te apetezca.</p></div>
            <div className="kt-agentes">
              {AGENTES.map(({ Icon, n, p, d }) => <article key={n} className="kt-ag"><span className="kt-ico"><Icon size={20} /></span><div><h3>{n} <span>· {p}</span></h3><p>{d}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="ag-section kt-panel">
          <div className="ag-wrap kt-panel__in">
            <div>
              <p className="kt-k">Tu panel</p>
              <h2 className="ag-h2">Lo ves todo en una pantalla.</h2>
              <p className="ag-lead">Qué clientes han escrito y en qué punto están, qué te proponen tus agentes para que lo apruebes con un clic, qué tareas te dejan y qué ha hecho cada uno.</p>
              <ul className="ag-checks">
                <li><Check size={16} />Aprueba o descarta posts, guiones y respuestas</li>
                <li><Check size={16} />Clientes potenciales con su estado</li>
                <li><Check size={16} />Tareas que solo puedes hacer tú</li>
                <li><Check size={16} />Tu oficina en 3D, con tu marca</li>
              </ul>
            </div>
            <figure className="kt-shot"><img src="/img/kit-panel.webp" alt="El panel del kit: aprobaciones, clientes potenciales, tareas y equipo" width="1400" height="875" loading="lazy" /></figure>
          </div>
        </section>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">Funcionando en 3 pasos</h2><p className="ag-lead">Sin programar. Unos 30-60 minutos la primera vez.</p></div>
            <ol className="kt-pasos">
              <li><span>1</span><h3>Descarga y rellena tu ficha</h3><p>Cuéntale a tus agentes qué vendes, a quién y cómo hablas. Si te cuesta, Claude te lo pregunta.</p></li>
              <li><span>2</span><h3>Pega el instalador en Claude</h3><p>Adjuntas el kit, pegas un mensaje y Claude configura tu panel y programa tus agentes.</p></li>
              <li><span>3</span><h3>Revisa tu panel cada día</h3><p>Aprueba lo que te proponen, haz tus tareas y deja que tu equipo trabaje el resto.</p></li>
            </ol>
          </div>
        </section>

        <section className="ag-section">
          <div className="ag-wrap kt-honesto">
            <div className="kt-hon kt-hon--si"><h3>Es para ti si…</h3><ul>
              <li><Check size={16} />Llevas tu negocio y no te da la vida para contestar, seguir presupuestos y publicar</li>
              <li><Check size={16} />Te apetece montarlo tú y adaptarlo a tu manera</li>
              <li><Check size={16} />Ya usas Claude o estás dispuesto a usarlo</li>
            </ul></div>
            <div className="kt-hon kt-hon--ojo"><h3>Lo que tienes que saber</h3><ul>
              <li><ShieldCheck size={16} />Funciona dentro de Claude: necesitas un plan de pago con tareas programadas y conectores (no incluido)</li>
              <li><ShieldCheck size={16} />Es un kit para montarlo tú, no un servicio: si quieres que lo hagamos nosotros, mira la <a href="/oficina-ia">Oficina de IA a medida</a></li>
              <li><ShieldCheck size={16} />Tus agentes saben lo que les cuentes: al principio, revisa lo que hacen</li>
            </ul></div>
          </div>
        </section>

        <section className="ag-section ag-section--white" id="precio">
          <div className="ag-wrap">
            <div className="kt-precio">
              <p className="kt-k">Kit Oficina de IA</p>
              <p className="kt-precio__n">{PRECIO}</p>
              <p className="kt-precio__s">Pago único · IVA incluido · descarga inmediata</p>
              <ul className="ag-checks">
                <li><Check size={16} />Panel con tu oficina en 3D</li>
                <li><Check size={16} />8 agentes de IA listos para personalizar</li>
                <li><Check size={16} />Instalador de un solo mensaje para Claude</li>
                <li><Check size={16} />Ficha de tu negocio y guía de instalación en PDF</li>
              </ul>
              {KIT_STRIPE ? <BotonComprar className="kt-comprar--grande" /> : <p className="kt-pronto">El pago se activa en unas horas. Vuelve pronto a esta página.</p>}
              <p className="kt-precio__l"><Lock size={14} /> Pago seguro con Stripe. Al comprar aceptas que es contenido digital de entrega inmediata y que, una vez descargado, no hay derecho de desistimiento.</p>
            </div>
          </div>
        </section>

        <Faq items={FAQ} title="Preguntas sobre el kit" />
      </main>
      <Footer />
      <BarraMovil />
    </div>
  );
}

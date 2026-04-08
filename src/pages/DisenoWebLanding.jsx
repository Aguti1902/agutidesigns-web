import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight, Check, Globe, ShoppingCart, FileText, Smartphone,
  Star, Zap, Search, MessageCircle, Rocket, Users,
  ChevronDown, ChevronUp, ArrowUpRight, Sparkles, Code2,
  Palette, HeartHandshake, TrendingUp, Award, MapPin,
  Coffee, Monitor, ExternalLink, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import AIChatbot from '../components/chat/AIChatbot';
import CookieBanner from '../components/ui/CookieBanner';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import './DisenoWebLanding.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

function useReveal(threshold = 0.12) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold });
  return [ref, inView];
}

/* ── Data ── */
const SERVICES = [
  { num: '01', icon: <FileText size={26} />, title: 'Landing Page', desc: 'Una página enfocada al 100% en convertir visitas en clientes o leads.', features: ['Diseño a medida', 'Formulario de contacto', 'SEO básico', 'Responsive'], color: 'primary' },
  { num: '02', icon: <Globe size={26} />, title: 'Web Corporativa', desc: 'Presencia profesional con todas las páginas que tu negocio necesita.', features: ['Hasta 7 páginas', 'Blog integrado', 'SEO avanzado', 'CMS fácil'], color: 'accent', popular: true },
  { num: '03', icon: <ShoppingCart size={26} />, title: 'Tienda Online', desc: 'Vende tus productos o servicios con una tienda rápida y segura.', features: ['Productos ilimitados', 'Pasarela de pago', 'Gestión de pedidos', 'Panel admin'], color: 'primary' },
  { num: '04', icon: <Smartphone size={26} />, title: 'Portfolio', desc: 'Muestra tu trabajo de forma impactante y consigue más clientes.', features: ['Galería de proyectos', 'Sección de servicios', 'Formulario de contacto', 'Animaciones'], color: 'accent' },
];

const PORTFOLIO = [
  { id: 'stay4days', img: '/portfolio/stay4days.png', label: 'Stay4Days', url: 'stay4days.com', type: 'Alquiler Vacacional', href: 'https://stay4days.com' },
  { id: 'spaorganic', img: '/portfolio/spaorganic.png', label: 'Spa Organic', url: 'spaorganic.es', type: 'Spa & Belleza', href: 'https://spaorganic.es' },
  { id: 'lgolegal', img: '/portfolio/lgolegal.png', label: 'LGO Legal', url: 'lgolegal.com', type: 'Asesoría Legal', href: 'https://lgolegal.com' },
  { id: 'rusinol', img: '/portfolio/rusinol.png', label: 'Gestoría Rusiñol', url: 'gestoriarusinol.com', type: 'Gestoría Online', href: 'https://gestoriarusinol.com' },
  { id: 'lagraciosavins', img: '/portfolio/lagraciosavins.png', label: 'La Graciosa Vins', url: 'lagraciosavins.com', type: 'Club de Vino', href: 'https://lagraciosavins.com' },
  { id: 'nexgent', img: '/portfolio/nexgent.png', label: 'NexGent', url: 'nexgent.io', type: 'Startup IA', href: 'https://nexgent.io' },
  { id: 'hellonails', img: '/portfolio/hellonails.png', label: 'Hello Nails', url: 'hellonails.com', type: 'Belleza & Franquicia', href: 'https://hellonails.com' },
  { id: 'meinzerandmoray', img: '/portfolio/meinzerandmoray.png', label: 'Meinzer & Moray', url: 'meinzerandmoray.com', type: 'Inversiones', href: 'https://www.meinzerandmoray.com' },
];

const PROCESS = [
  { step: '01', icon: <MessageCircle size={24} />, title: 'Briefing', desc: 'Hablamos sobre tu negocio, tus objetivos y lo que necesitas. Entendemos tu proyecto antes de diseñar.' },
  { step: '02', icon: <Palette size={24} />, title: 'Diseño', desc: 'Creamos la propuesta visual de tu web. Te presentamos el diseño y ajustamos hasta que te encante.' },
  { step: '03', icon: <Code2 size={24} />, title: 'Desarrollo', desc: 'Construimos tu web con código limpio, rápida y optimizada para buscadores desde el primer día.' },
  { step: '04', icon: <Rocket size={24} />, title: 'Lanzamiento', desc: 'Publicamos tu web, te enseñamos a gestionarla y te damos soporte continuo después.' },
];

const INCLUDES = [
  { icon: <Palette size={22} />, title: 'Diseño 100% a medida', desc: 'Sin plantillas, sin temas genéricos. Tu web es única.' },
  { icon: <Monitor size={22} />, title: 'Responsive total', desc: 'Perfecta en móvil, tablet y escritorio desde el primer día.' },
  { icon: <Search size={22} />, title: 'SEO básico incluido', desc: 'Meta tags, sitemap, velocidad y Google Search Console.' },
  { icon: <MessageCircle size={22} />, title: 'Formulario de contacto', desc: 'Recibe consultas directamente en tu bandeja de entrada.' },
  { icon: <Zap size={22} />, title: 'Carga ultrarrápida', desc: 'Optimizada para cargar en menos de 2 segundos.' },
  { icon: <Star size={22} />, title: 'Google Analytics', desc: 'Sabe cuántas visitas tienes y de dónde vienen.' },
  { icon: <Code2 size={22} />, title: 'Código limpio', desc: 'Desarrollada con tecnología moderna, sin plugins innecesarios.' },
  { icon: <Sparkles size={22} />, title: 'Animaciones y efectos', desc: 'Transiciones suaves que dan vida a tu web.' },
  { icon: <Globe size={22} />, title: 'Dominio y hosting', desc: 'Te ayudo a configurar y publicar tu web online.' },
  { icon: <HeartHandshake size={22} />, title: '1 mes de soporte', desc: 'Resuelvo cualquier incidencia tras el lanzamiento.' },
  { icon: <TrendingUp size={22} />, title: 'Diseño orientado a ventas', desc: 'Cada sección pensada para convertir visitas en clientes.' },
  { icon: <Rocket size={22} />, title: 'Entrega rápida', desc: 'Tu web lista en 1–3 semanas según el proyecto.' },
];

const REVIEWS = [
  { name: 'María García', role: 'Fundadora · Stay4Days', avatar: 'MG', stars: 5, text: 'Guti transformó completamente nuestra presencia online. La web es rápida, preciosa y en pocas semanas ya notamos más reservas. 100% recomendable.' },
  { name: 'Lucía Fernández', role: 'Directora · Spa Organic', avatar: 'LF', stars: 5, text: 'Desde que estrenamos la nueva web, las reservas online han aumentado un 40%. El diseño transmite exactamente la esencia de nuestro spa. Muy profesional.' },
  { name: 'Carlos Lardón', role: 'Socio · LGO Legal', avatar: 'CL', stars: 5, text: 'Necesitábamos una web que transmitiera confianza y seriedad. Guti lo entendió a la primera. El proceso fue rápido, claro y el resultado superó nuestras expectativas.' },
  { name: 'Ramón Rusiñol', role: 'Gerente · Gestoría Rusiñol', avatar: 'RR', stars: 5, text: 'Teníamos una web antigua que no convertía nada. Ahora recibimos consultas cada semana gracias al formulario y al posicionamiento en Google. Excelente trabajo.' },
  { name: 'Marc Bosch', role: 'CEO · NexGent', avatar: 'MB', stars: 5, text: 'Para una startup de IA era clave tener una web que impresionara. Guti nos entregó algo que enseñamos con orgullo a inversores y clientes. Muy recomendable.' },
  { name: 'Sofía Torres', role: 'Franquiciada · Hello Nails', avatar: 'ST', stars: 5, text: 'Rapidez, profesionalidad y un resultado espectacular. La web de mi franquicia se ve increíble en móvil y ya tenemos citas online funcionando perfectamente.' },
];

const FAQS = [
  { q: '¿Cuánto tarda en estar lista mi web?', a: 'Depende del tipo de proyecto. Una landing page tarda aproximadamente 1 semana, una web corporativa 2 semanas y una tienda online 3-4 semanas. Siempre te doy una fecha de entrega clara antes de empezar.' },
  { q: '¿Puedo modificar mi web yo mismo después?', a: 'Sí. Todas las webs incluyen un panel de administración sencillo donde puedes editar textos, imágenes y añadir contenido sin saber programar. También te enseño a usarlo.' },
  { q: '¿Qué incluye el mantenimiento mensual?', a: 'Actualizaciones de seguridad, copias de seguridad automáticas, hosting de alta velocidad, soporte técnico y pequeños cambios de contenido. Tu web siempre estará activa y protegida.' },
  { q: '¿Necesito pagar el diseño completo por adelantado?', a: 'No. Trabajamos con un 50% al inicio del proyecto y el 50% restante al entregar la web. Así aseguramos el compromiso de ambas partes.' },
  { q: '¿Hacéis el diseño desde cero o usáis plantillas?', a: 'Todo el diseño es 100% a medida. No uso plantillas ni temas de WordPress. Cada web es única y diseñada específicamente para tu negocio y tus objetivos.' },
  { q: '¿Aparecerá mi web en Google?', a: 'Sí. Todas las webs incluyen SEO básico on-page: estructura semántica correcta, velocidad optimizada, meta tags, sitemap y registrada en Google Search Console desde el primer día.' },
];

const WHY_US = [
  { icon: <Palette size={22} />, title: 'Diseño 100% a medida', desc: 'Sin plantillas. Cada web es única y diseñada para tu negocio.' },
  { icon: <Zap size={22} />, title: 'Ultra rápida', desc: 'Optimizadas para cargar en menos de 2 segundos. Mejor SEO y UX.' },
  { icon: <Search size={22} />, title: 'SEO incluido', desc: 'Todas las webs vienen optimizadas para posicionar en Google desde el día 1.' },
  { icon: <HeartHandshake size={22} />, title: 'Soporte continuo', desc: 'No desaparezco tras la entrega. Estoy contigo después del lanzamiento.' },
  { icon: <Monitor size={22} />, title: 'Responsive total', desc: 'Perfecta en móvil, tablet y escritorio. El 70% del tráfico es móvil.' },
  { icon: <TrendingUp size={22} />, title: 'Enfocado en resultados', desc: 'Diseño orientado a que los visitantes se conviertan en clientes.' },
];

/* ── Portfolio card — desktop browser frame ── */
function PortfolioCard({ item, active }) {
  return (
    <a className={`pm-card ${active ? 'pm-card--active' : ''}`} href={item.href} target="_blank" rel="noopener noreferrer">
      <div className="pm-card__browser">
        <div className="pm-card__bar">
          <div className="pm-card__dots"><span /><span /><span /></div>
          <div className="pm-card__url">{item.url}</div>
          <ExternalLink size={10} className="pm-card__ext" />
        </div>
        <div className="pm-card__screen">
          <img src={item.img} alt={item.label} className="pm-card__img" loading="lazy" />
          <div className="pm-card__overlay">
            <span className="pm-card__visit"><ExternalLink size={14} /> Ver web</span>
          </div>
        </div>
      </div>
      <div className="pm-card__label">
        <span className="pm-card__name">{item.label}</span>
        <span className="pm-card__type">{item.type}</span>
      </div>
    </a>
  );
}

/* ── iPhone frame card — mobile ── */

/* ── Portfolio Carousel ── */
function PortfolioCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideW, setSlideW] = useState(0);
  const [perPage, setPerPage] = useState(4);
  const wrapRef = useRef(null);
  const total = PORTFOLIO.length;

  useLayoutEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const w = window.innerWidth;
      const pv = w < 640 ? 1 : w < 1024 ? 2 : 4;
      setPerPage(pv);
      setSlideW(wrapRef.current.offsetWidth / pv);
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const maxActive = Math.max(0, total - perPage);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(a => a >= maxActive ? 0 : a + 1), 3500);
    return () => clearInterval(t);
  }, [paused, maxActive]);

  const go = (idx) => {
    const clamped = Math.max(0, Math.min(idx, maxActive));
    setActive(clamped);
    setPaused(true);
    setTimeout(() => setPaused(false), 7000);
  };

  return (
    <div
      className="port-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="port-carousel__inner">
        <button className="port-arr port-arr--l" onClick={() => go(active - 1)} aria-label="Anterior">
          <ChevronLeft size={22} />
        </button>
        <div className="port-carousel__wrap" ref={wrapRef}>
          <motion.div
            className="port-carousel__track"
            animate={{ x: slideW > 0 ? -(active * slideW) : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.8 }}
          >
            {PORTFOLIO.map((item, i) => (
              <div key={item.id} className="port-slide" style={{ width: slideW || undefined }}>
                <PortfolioCard item={item} active={i === active} />
              </div>
            ))}
          </motion.div>
        </div>
        <button className="port-arr port-arr--r" onClick={() => go(active + 1)} aria-label="Siguiente">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ── DOTS ── */}
      <div className="port-dots">
        {Array.from({ length: maxActive + 1 }).map((_, i) => (
          <button
            key={i}
            className={`port-dot ${i === active ? 'port-dot--on' : ''}`}
            onClick={() => go(i)}
            aria-label={`Proyecto ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`}>
      <button className="faq-item__q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <motion.p className="faq-item__a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {a}
        </motion.p>
      )}
    </div>
  );
}

/* ── Main ── */
export default function DisenoWebLanding() {
  const [heroRef, heroInView] = useReveal();
  const [servRef, servInView] = useReveal();
  const [portRef, portInView] = useReveal();
  const [aboutRef, aboutInView] = useReveal();
  const [whyRef, whyInView] = useReveal();
  const [procRef, procInView] = useReveal();
  const [includesRef, includesInView] = useReveal();
  const [reviewsRef, reviewsInView] = useReveal();
  const [faqRef, faqInView] = useReveal();

  return (
    <div className="dw-landing">
      <div className="noise-overlay" />
      <Navbar />

      {/* ── HERO ── */}
      <section id="hero" className="dw-hero">
        <div className="dw-hero__bg">
          <div className="dw-hero__grid" />
          <div className="dw-hero__glow dw-hero__glow--1" />
          <div className="dw-hero__glow dw-hero__glow--2" />
          <div className="dw-hero__glow dw-hero__glow--3" />
        </div>

        <div className="container dw-hero__container">
          <motion.div ref={heroRef} variants={stagger} initial="hidden" animate={heroInView ? 'visible' : 'hidden'} className="dw-hero__content">
            <motion.div variants={fadeUp} className="badge badge--primary">
              <Sparkles size={13} /><span>Diseño Web Profesional · Barcelona</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="dw-hero__title">
              Tu negocio merece<br />
              una web que<br />
              <span className="text-primary">venda sola</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="dw-hero__subtitle">
              Diseño y desarrollo páginas web a medida para negocios que quieren crecer.
              Sin plantillas. Sin excusas. Solo resultados.
            </motion.p>

            {/* Mobile-only CSS animated preview */}
            <motion.div variants={fadeUp} className="dw-hero__mobile-preview">
              <div className="dw-hero__mp-bar">
                <div className="dw-hero__mp-dots"><span /><span /><span /></div>
                <div className="dw-hero__mp-url">tunegocio.com</div>
                <div className="dw-hero__mp-live"><span className="dw-hero__mp-dot" />LIVE</div>
              </div>
              <div className="dw-hero__mp-screen">
                <div className="dw-hero__mp-bg" />
                <div className="dw-hero__mp-sitenav">
                  <div className="dw-hero__mp-sitelogo" />
                  <div className="dw-hero__mp-sitelinks"><span /><span /><span /></div>
                </div>
                <div className="dw-hero__mp-sitecontent">
                  <div className="dw-hero__mp-sitebadge" />
                  <div className="dw-hero__mp-siteline dw-hero__mp-siteline--xl" />
                  <div className="dw-hero__mp-siteline dw-hero__mp-siteline--lg" />
                  <div className="dw-hero__mp-siteline dw-hero__mp-siteline--sm" />
                  <div className="dw-hero__mp-siteline dw-hero__mp-siteline--sm dw-hero__mp-siteline--short" />
                  <div className="dw-hero__mp-sitecta" />
                </div>
                <div className="dw-hero__mp-sitecards">
                  <div className="dw-hero__mp-sitecard" />
                  <div className="dw-hero__mp-sitecard" />
                  <div className="dw-hero__mp-sitecard" />
                </div>
              </div>
              <div className="dw-hero__mp-badges">
                <span className="dw-hero__mp-tag"><Zap size={10} /> 2 semanas</span>
                <span className="dw-hero__mp-tag dw-hero__mp-tag--green"><Star size={10} /> 5★ Google</span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="dw-hero__cta">
              <Button variant="primary" size="lg" href="/calculadora" iconRight={<ArrowRight size={18} />}>
                Calcular precio de mi web
              </Button>
              <Button variant="ghost" size="lg" href="#portfolio">
                Ver trabajos
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="dw-hero__stats">
              <div className="dw-hero__stat">
                <span className="dw-hero__stat-num">200+</span>
                <span className="dw-hero__stat-label">Webs entregadas</span>
              </div>
              <div className="dw-hero__stat-divider" />
              <div className="dw-hero__stat">
                <span className="dw-hero__stat-num"><Star size={15} className="dw-hero__star" />4.9</span>
                <span className="dw-hero__stat-label">Valoración media</span>
              </div>
              <div className="dw-hero__stat-divider" />
              <div className="dw-hero__stat">
                <span className="dw-hero__stat-num">2 sem</span>
                <span className="dw-hero__stat-label">Tiempo de entrega</span>
              </div>
              <div className="dw-hero__stat-divider" />
              <div className="dw-hero__stat">
                <span className="dw-hero__stat-num">100%</span>
                <span className="dw-hero__stat-label">A medida</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="dw-hero__visual" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <div className="dw-hero__mockup">
              <div className="dw-hero__mockup-bar">
                <div className="dw-hero__mockup-dots"><span /><span /><span /></div>
                <div className="dw-hero__mockup-url">tunegocio.com</div>
              </div>
              <div className="dw-hero__mockup-body">
                <div className="dw-hero__mockup-nav-row" />
                <div className="dw-hero__mockup-hero-block">
                  <div className="dw-hero__mockup-line dw-hero__mockup-line--big" />
                  <div className="dw-hero__mockup-line dw-hero__mockup-line--med" />
                  <div className="dw-hero__mockup-line dw-hero__mockup-line--sm" />
                  <div className="dw-hero__mockup-cta-row">
                    <div className="dw-hero__mockup-btn-primary" />
                    <div className="dw-hero__mockup-btn-ghost" />
                  </div>
                </div>
                <div className="dw-hero__mockup-cards">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="dw-hero__mockup-card" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="dw-hero__float dw-hero__float--1"><Zap size={13} /> Lanzada en 2 sem</div>
            <div className="dw-hero__float dw-hero__float--2"><TrendingUp size={13} /> +280% visitas</div>
            <div className="dw-hero__float dw-hero__float--3"><Award size={13} /> 5★ Google</div>
          </motion.div>
        </div>

        <div className="dw-hero__scroll">
          <div className="dw-hero__scroll-line" />
        </div>
      </section>

      {/* ── VÍDEO ── */}
      <section className="dw-video section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="dw-video__inner"
          >
            <div className="dw-video__label">
              <span className="dw-video__dot" />
              Mira cómo trabajo
            </div>
            <div className="dw-video__frame">
              <div className="dw-video__ratio">
                <iframe
                  src="https://player.vimeo.com/video/1049518388?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  allowFullScreen
                  title="Agutidesigns — cómo trabajo"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="dw-services section">
        <div className="container">
          <motion.div ref={servRef} variants={stagger} initial="hidden" animate={servInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Servicios</span>
              <h2 className="dw-section-title">¿Qué tipo de web <span className="text-primary">necesitas?</span></h2>
              <p className="dw-section-desc">Desde una landing de alto impacto hasta una tienda online completa. Cada web, hecha a medida.</p>
            </motion.div>
            <div className="dw-services__grid">
              {SERVICES.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className={`dw-service-card ${s.popular ? 'dw-service-card--popular' : ''}`}>
                  {s.popular && <div className="dw-service-card__popular-badge">Más popular</div>}
                  <div className="dw-service-card__top">
                    <span className="dw-service-card__num">{s.num}</span>
                    <div className={`dw-service-card__icon dw-service-card__icon--${s.color}`}>{s.icon}</div>
                  </div>
                  <h3 className="dw-service-card__title">{s.title}</h3>
                  <p className="dw-service-card__desc">{s.desc}</p>
                  <ul className="dw-service-card__features">
                    {s.features.map((f, j) => <li key={j}><Check size={13} />{f}</li>)}
                  </ul>
                  <a href="/calculadora" className={`dw-service-card__cta ${s.popular ? 'dw-service-card__cta--popular' : ''}`}>
                    Calcular precio <ArrowRight size={14} />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="dw-portfolio section">
        <div className="container">
          <motion.div ref={portRef} variants={stagger} initial="hidden" animate={portInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Portfolio</span>
              <h2 className="dw-section-title">Webs que he <span className="text-primary">diseñado</span></h2>
              <p className="dw-section-desc">Cada proyecto es único. Aquí algunos ejemplos de lo que puedo hacer para tu negocio.</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <PortfolioCarousel />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SOBRE MÍ ── */}
      <section id="sobre-mi" className="dw-about section">
        <div className="container">
          <motion.div ref={aboutRef} variants={stagger} initial="hidden" animate={aboutInView ? 'visible' : 'hidden'} className="dw-about__inner">

            {/* Contenido */}
            <motion.div variants={fadeUp} className="dw-about__content">
              <span className="badge">Sobre mí</span>

              <h2 className="dw-about__title">
                Hola, soy <span className="text-primary">Guti</span> 👋
              </h2>

              <p className="dw-about__text">
                Diseñador y desarrollador web freelance con más de 5 años de experiencia.
                Creo páginas web a medida para negocios que quieren una presencia online que de verdad funcione y venda.
              </p>
              <p className="dw-about__text">
                No soy una agencia con 20 empleados — soy una sola persona responsable de tu proyecto de principio a fin.
                Comunicación directa, entregas rápidas y resultados que te van a gustar.
              </p>

              <div className="dw-about__stats">
                <div className="dw-about__stat">
                  <span className="dw-about__stat-num">5+</span>
                  <span className="dw-about__stat-label">Años de<br/>experiencia</span>
                </div>
                <div className="dw-about__stat-sep" />
                <div className="dw-about__stat">
                  <span className="dw-about__stat-num">200+</span>
                  <span className="dw-about__stat-label">Webs<br/>entregadas</span>
                </div>
                <div className="dw-about__stat-sep" />
                <div className="dw-about__stat">
                  <span className="dw-about__stat-num">98%</span>
                  <span className="dw-about__stat-label">Clientes<br/>satisfechos</span>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="dw-about__cta">
                <Button variant="primary" size="md" href="/calculadora" iconRight={<ArrowRight size={16} />}>
                  Trabajemos juntos
                </Button>
              </div>
            </motion.div>

            {/* Foto */}
            <motion.div variants={fadeUp} className="dw-about__photo-col">
              <div className="dw-about__photo-frame">
                <img src="/ImagenGuti copia.png" alt="Guti" className="dw-about__photo" />
                <div className="dw-about__photo-overlay" />
              </div>
              <div className="dw-about__photo-tags">
                <span className="dw-about__photo-tag dw-about__photo-tag--green"><Code2 size={13} /> Developer</span>
                <span className="dw-about__photo-tag dw-about__photo-tag--coral"><Palette size={13} /> Designer</span>
                <span className="dw-about__photo-tag dw-about__photo-tag--blue"><MapPin size={13} /> Barcelona</span>
              </div>
            </motion.div>

            {/* Mobile-only CTA (after photo) */}
            <motion.div variants={fadeUp} className="dw-about__cta dw-about__cta--mobile-only">
              <Button variant="primary" size="md" href="/calculadora" iconRight={<ArrowRight size={16} />}>
                Trabajemos juntos
              </Button>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRME ── */}
      <section className="dw-why section">
        <div className="container">
          <motion.div ref={whyRef} variants={stagger} initial="hidden" animate={whyInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Por qué elegirme</span>
              <h2 className="dw-section-title">Diseño con <span className="text-primary">propósito</span></h2>
            </motion.div>
            <div className="dw-why__grid">
              {WHY_US.map((w, i) => (
                <motion.div key={i} variants={fadeUp} className="dw-why__card">
                  <div className="dw-why__icon">{w.icon}</div>
                  <h4 className="dw-why__title">{w.title}</h4>
                  <p className="dw-why__desc">{w.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section id="proceso" className="dw-process section">
        <div className="container">
          <motion.div ref={procRef} variants={stagger} initial="hidden" animate={procInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Cómo trabajo</span>
              <h2 className="dw-section-title">Del briefing al <span className="text-primary">lanzamiento</span></h2>
              <p className="dw-section-desc">Un proceso claro y transparente para que sepas en todo momento en qué punto está tu proyecto.</p>
            </motion.div>
            <div className="dw-process__steps">
              {PROCESS.map((p, i) => (
                <motion.div key={i} variants={fadeUp} className="dw-process__step">
                  <div className="dw-process__step-num">{p.step}</div>
                  <div className="dw-process__step-icon">{p.icon}</div>
                  <h4 className="dw-process__step-title">{p.title}</h4>
                  <p className="dw-process__step-desc">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <section id="packs" className="dw-includes section">
        <div className="container">
          <motion.div ref={includesRef} variants={stagger} initial="hidden" animate={includesInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Todo incluido</span>
              <h2 className="dw-section-title">Lo que lleva <span className="text-primary">tu web</span></h2>
              <p className="dw-section-desc">Sin sorpresas. Cada web que entrego viene completa desde el primer día.</p>
            </motion.div>
            <div className="dw-includes__grid">
              {INCLUDES.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="dw-include-card">
                  <div className="dw-include-card__icon">{item.icon}</div>
                  <div>
                    <h4 className="dw-include-card__title">{item.title}</h4>
                    <p className="dw-include-card__desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RESEÑAS ── */}
      <section className="dw-reviews section">
        <div className="container">
          <motion.div ref={reviewsRef} variants={stagger} initial="hidden" animate={reviewsInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">Testimonios</span>
              <h2 className="dw-section-title">Lo que dicen mis <span className="text-primary">clientes</span></h2>
              <p className="dw-section-desc">Negocios reales que ya tienen la web que merecen.</p>
            </motion.div>
            <div className="dw-reviews__grid">
              {REVIEWS.map((r, i) => (
                <motion.div key={i} variants={fadeUp} className="dw-review-card">
                  <div className="dw-review-card__stars">
                    {Array.from({ length: r.stars }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                  </div>
                  <p className="dw-review-card__text">"{r.text}"</p>
                  <div className="dw-review-card__author">
                    <div className="dw-review-card__avatar">{r.avatar}</div>
                    <div>
                      <span className="dw-review-card__name">{r.name}</span>
                      <span className="dw-review-card__role">{r.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA CALCULADORA ── */}
      <section id="presupuesto" className="dw-cta-calc section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="dw-cta-calc__inner">
            <div className="dw-cta-calc__icon"><Zap size={32} /></div>
            <h2 className="dw-cta-calc__title">¿Cuánto cuesta tu web?</h2>
            <p className="dw-cta-calc__desc">Configura lo que necesitas en 2 minutos y descubre tu precio personalizado al instante. Sin llamadas, sin esperas.</p>
            <div className="dw-cta-calc__features">
              <span><Check size={14} /> Precio al instante</span>
              <span><Check size={14} /> Sin compromisos</span>
              <span><Check size={14} /> 100% personalizado</span>
            </div>
            <Button variant="primary" size="xl" href="/calculadora" iconRight={<ArrowUpRight size={20} />}>
              Calcular mi precio ahora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="dw-faq section">
        <div className="container">
          <motion.div ref={faqRef} variants={stagger} initial="hidden" animate={faqInView ? 'visible' : 'hidden'}>
            <motion.div variants={fadeUp} className="dw-section-header">
              <span className="badge">FAQ</span>
              <h2 className="dw-section-title">Preguntas <span className="text-primary">frecuentes</span></h2>
            </motion.div>
            <motion.div variants={fadeUp} className="dw-faq__list">
              {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ── Widgets flotantes ── */}
      <AIChatbot />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  );
}

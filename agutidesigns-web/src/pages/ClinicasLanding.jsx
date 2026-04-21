import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight, Check, Globe, Search, MessageCircle, Rocket,
  Star, Zap, TrendingUp, ChevronDown, ChevronUp, Sparkles,
  Calendar, Users, Phone, Bot, MapPin, X, CheckCircle,
  Clock, Shield, Award, HeartHandshake, Monitor, ExternalLink,
  MousePointer, BarChart2, Activity,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import AIChatbot from '../components/chat/AIChatbot';
import CookieBanner from '../components/ui/CookieBanner';
import './ClinicasLanding.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

function useReveal(threshold = 0.1) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold });
  return [ref, inView];
}

/* ── Data ── */
const MARQUEE_ITEMS = [
  'Más citas online', 'Top Google', 'IA 24/7', 'Carga en 1s',
  'Diseño a medida', '100% Responsive', 'Web segura', 'Sin plantillas',
  'Analytics incluido', 'Chat con IA', 'SEO local', 'Entrega en 2 semanas',
];

const PAINS = [
  { icon: <X size={22} />, title: 'Web anticuada', desc: 'Tu web se ve vieja, carga lenta y espanta a los pacientes antes de que lean quién eres.' },
  { icon: <X size={22} />, title: 'No apareces en Google', desc: 'Cuando alguien busca "dentista en [tu ciudad]" aparece la competencia. Tú, invisible.' },
  { icon: <X size={22} />, title: 'Llamadas perdidas', desc: 'Fuera de horario nadie atiende. Los pacientes llaman, no hay respuesta y se van a otra clínica.' },
  { icon: <X size={22} />, title: 'Sin citas online', desc: 'Obligas a los pacientes a llamar para reservar. El 60% prefiere hacerlo online y a cualquier hora.' },
];

const SOLUTIONS = [
  {
    icon: <Globe size={30} />,
    num: '01',
    title: 'Web que convierte',
    desc: 'Diseñamos tu web desde cero pensando en un solo objetivo: que cada visita acabe reservando una cita.',
    features: ['Diseño a medida', 'Ultra rápida (<2s)', 'Formulario de cita', 'Responsive total'],
    color: 'primary',
  },
  {
    icon: <Search size={30} />,
    num: '02',
    title: 'SEO local #1',
    desc: 'Te posicionamos en el top de Google cuando alguien busca dentista en tu zona. Pacientes que llegan solos.',
    features: ['Google My Business', 'SEO on-page', 'Palabras clave locales', 'Reseñas optimizadas'],
    color: 'accent',
    popular: true,
  },
  {
    icon: <Bot size={30} />,
    num: '03',
    title: 'IA 24/7',
    desc: 'Un asistente inteligente que atiende a tus pacientes, responde preguntas y agenda citas automáticamente.',
    features: ['Responde en <1 segundo', 'Reserva citas sola', 'Multiidioma', 'Disponible 24/7'],
    color: 'primary',
  },
];

const CHAT_MESSAGES = [
  { type: 'user', text: 'Hola, ¿tenéis disponibilidad esta semana?' },
  { type: 'typing', text: '' },
  { type: 'bot', text: '¡Hola! 👋 Tenemos huecos el miércoles y el jueves.' },
  { type: 'user', text: 'El jueves perfecto, ¿a qué hora?' },
  { type: 'typing', text: '' },
  { type: 'bot', text: 'A las 10:00, 12:00 o 17:00. ¿Cuál prefieres? 🗓️' },
  { type: 'user', text: 'A las 10:00 h, gracias' },
  { type: 'bot', text: '✅ ¡Cita confirmada el jueves a las 10:00! Te envío recordatorio.' },
];

const STATS = [
  { value: 40, suffix: '%', label: 'Más citas en 90 días', icon: <Calendar size={28} /> },
  { value: 3, suffix: '', prefix: 'Top ', label: 'Google búsquedas locales', icon: <Search size={28} /> },
  { value: 87, suffix: '%', label: 'Pacientes desde móvil', icon: <Monitor size={28} /> },
  { value: 0, suffix: '', label: 'Llamadas perdidas con IA', icon: <Phone size={28} /> },
];

const PROCESS = [
  { step: '01', icon: <MessageCircle size={24} />, title: 'Consulta gratuita', desc: 'Analizamos tu clínica, tu competencia local y definimos la estrategia para conseguir más pacientes.' },
  { step: '02', icon: <Globe size={24} />, title: 'Diseño y desarrollo', desc: 'Creamos tu web a medida, optimizada para conversión y lista para posicionar en Google desde el día 1.' },
  { step: '03', icon: <Search size={24} />, title: 'SEO local activo', desc: 'Optimizamos tu ficha de Google, construimos tu presencia local y empezamos a subir posiciones.' },
  { step: '04', icon: <Bot size={24} />, title: 'IA conectada', desc: 'Activamos tu asistente de IA. Desde ese momento, tu clínica atiende pacientes y agenda citas sola.' },
];

const PRICING = [
  {
    name: 'Web + Mantenimiento',
    monthly: '149',
    setup: '990',
    desc: 'Tu web profesional activa y mantenida mes a mes. Sin preocupaciones técnicas.',
    monthlyIncludes: [
      'Hosting y dominio incluido',
      'Actualizaciones y seguridad',
      'Copias de seguridad diarias',
      'Soporte técnico prioritario',
      'Cambios de contenido incluidos',
    ],
    setupIncludes: [
      'Diseño web a medida',
      'SEO básico on-page',
      'Formulario de cita online',
      'Google Analytics configurado',
    ],
    cta: 'Empezar proyecto',
    color: '',
  },
  {
    name: 'Web + SEO + SEM',
    monthly: '349',
    setup: '1.490',
    desc: 'Domina Google con SEO local continuo y campañas de publicidad gestionadas.',
    monthlyIncludes: [
      'Todo lo de Mantenimiento',
      'SEO local mensual activo',
      'Google My Business optimizado',
      'Gestión Google Ads (SEM)',
      'Informe mensual de resultados',
      'Estrategia de palabras clave',
    ],
    setupIncludes: [
      'Web a medida completa',
      'Auditoría SEO inicial',
      'Configuración Google Ads',
      'Integración Google Reviews',
    ],
    cta: 'Quiero ser el #1',
    color: 'popular',
    badge: 'Más contratado',
  },
  {
    name: 'IA 360° Total',
    monthly: '599',
    setup: '1.990',
    desc: 'La clínica más avanzada de tu zona: web, SEO, SEM e IA que trabaja sola.',
    monthlyIncludes: [
      'Todo lo de SEO + SEM',
      'IA activa 24/7 en tu web',
      'Citas automáticas sin intervención',
      'IA multiidioma personalizada',
      'Reportes IA + pacientes nuevos',
      'Optimización continua de IA',
    ],
    setupIncludes: [
      'Web premium a medida',
      'Configuración completa IA',
      'Integración con tu agenda',
      'Formación del equipo incluida',
    ],
    cta: 'Activar mi IA',
    color: '',
  },
];

const REVIEWS = [
  { name: 'Dra. Laura Martínez', role: 'Directora · Clínica DentPlus Barcelona', avatar: 'LM', stars: 5, title: 'De 4 a 20 pacientes nuevos en 3 meses', text: 'En 3 meses pasamos de 4 nuevos pacientes al mes a más de 20. La web convierte muchísimo y el SEO nos puso en el top de Google. Mejor inversión que hemos hecho.' },
  { name: 'Dr. Jordi Puig', role: 'Titular · Clínica Puig Dental', avatar: 'JP', stars: 5, title: 'La IA ha cambiado nuestra clínica', text: 'La IA ha cambiado nuestra clínica. Ya no perdemos llamadas fuera de horario. Los pacientes reservan solos a las 11 de la noche y nosotros llegamos con la agenda llena.' },
  { name: 'Dra. Ana Soto', role: 'Socia · OrthoSmile Madrid', avatar: 'AS', stars: 5, title: 'Primeros en Google en menos de 60 días', text: 'Teníamos una web de 2015 que no servía para nada. Ahora somos los primeros en Google cuando alguien busca "ortodoncia Madrid centro". El retorno ha sido increíble.' },
  { name: 'Dr. Marc Ferrer', role: 'Gerente · Ferrer Clínica Dental', avatar: 'MF', stars: 5, title: 'Entrega en 2 semanas, resultados en 60 días', text: 'Guti entendió perfectamente lo que necesitaba: una web seria, rápida y que atrajera pacientes de implantes. En 2 semanas estaba online y en 60 días ya notamos el cambio.' },
];

const FAQS = [
  { q: '¿Cuánto tarda en estar lista la web de mi clínica?', a: 'Una web dental completa tarda entre 2 y 3 semanas. Si además incluimos el setup de SEO local y la IA, sumamos 1 semana más. Siempre te damos una fecha de entrega confirmada al inicio.' },
  { q: '¿En cuánto tiempo veo resultados en Google?', a: 'El SEO local suele dar resultados visibles en 30-90 días. Google My Business optimizado puede dar resultados en 2-4 semanas. Depende de la competencia en tu zona, pero siempre vemos mejora.' },
  { q: '¿Cómo funciona la IA para reservar citas?', a: 'Instalamos un asistente de IA en tu web que conversa con los pacientes, responde sus preguntas sobre precios y tratamientos, y les ayuda a reservar cita. Se sincroniza con tu agenda y envía confirmaciones automáticas.' },
  { q: '¿Necesito saber programar para gestionar la web?', a: 'No. Te entregamos la web con un panel de administración sencillo donde puedes editar textos, añadir fotos y gestionar el blog sin saber programación. También te hacemos una formación en videollamada.' },
  { q: '¿La IA habla con pacientes en otros idiomas?', a: 'Sí. Nuestro asistente de IA detecta automáticamente el idioma del paciente y responde en consecuencia. Ideal para clínicas en zonas turísticas o con pacientes internacionales.' },
  { q: '¿Qué pasa si tengo dudas después del lanzamiento?', a: 'Todos los planes incluyen soporte después del lanzamiento. Puedes contactarnos por WhatsApp o email y te respondemos en menos de 24h. Los planes Pro e IA 360° incluyen mantenimiento mensual incluido.' },
];

/* ── Trustpilot star SVG ── */
function TpStar({ size = 20, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={filled ? '#00B67A' : '#DCDCE6'}
        d="M12 2l2.582 5.23L20 8.168l-4 3.897.944 5.503L12 14.896l-4.944 2.672L8 12.065 4 8.168l5.418-.938L12 2z"
      />
    </svg>
  );
}

/* ── Trustpilot Logo SVG ── */
function TrustpilotLogo({ height = 22 }) {
  return (
    <svg height={height} viewBox="0 0 122 24" fill="none" aria-label="Trustpilot" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.76 0l2.79 5.65L21 6.89l-4.62 4.5 1.09 6.35L12 14.7l-5.47 2.96 1.09-6.35L3 6.89l6.45-.94L11.76 0z" fill="#00B67A"/>
      <path d="M16.26 12.45l-.39 2.29L12 12.7l-3.87 2.04.37-2.17L12 10.36l4.26 2.09z" fill="#005128"/>
      <text x="27" y="17" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#191919">Trustpilot</text>
    </svg>
  );
}

/* ── Animated Counter ── */
function AnimatedCounter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inViewRef, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (!inView) return;
    if (end === 0) { setCount(0); return; }
    let start = 0;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.round(start));
    }, interval);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <span ref={inViewRef} className="stat-num">
      {prefix}{count}{suffix}
    </span>
  );
}

/* ── Dashboard Preview (animated mockup) ── */
const DB_BARS = [
  { day: 'L', h: 52 }, { day: 'M', h: 74 }, { day: 'X', h: 61 },
  { day: 'J', h: 89 }, { day: 'V', h: 100 }, { day: 'S', h: 78 }, { day: 'D', h: 43 },
];
const DB_SPARKS = [22, 35, 28, 46, 38, 55, 48, 67, 60, 76];

function DashboardPreview() {
  return (
    <div className="db-mockup">
      {/* Browser chrome */}
      <div className="db-chrome">
        <div className="db-chrome__dots"><span /><span /><span /></div>
        <span className="db-chrome__url">panel.agutidesigns.com/dentplus</span>
      </div>

      {/* Dashboard body */}
      <div className="db-body">
        {/* Top bar */}
        <div className="db-topbar">
          <div>
            <div className="db-topbar__name">Panel de Control</div>
            <div className="db-topbar__clinic">Clínica DentPlus · Barcelona</div>
          </div>
          <div className="db-live"><span className="db-live__dot" />En vivo</div>
        </div>

        {/* KPI row */}
        <div className="db-kpis">
          <div className="db-kpi">
            <div className="db-kpi__ico db-kpi__ico--blue"><TrendingUp size={11} /></div>
            <div className="db-kpi__val">2.847</div>
            <div className="db-kpi__lbl">Visitas / sem</div>
            <div className="db-kpi__trend">↑ 23%</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi__ico db-kpi__ico--green"><Users size={11} /></div>
            <div className="db-kpi__val">127</div>
            <div className="db-kpi__lbl">Nuevos pacientes</div>
            <div className="db-kpi__trend">↑ 40%</div>
          </div>
          <div className="db-kpi db-kpi--hl">
            <div className="db-kpi__ico db-kpi__ico--yellow"><Search size={11} /></div>
            <div className="db-kpi__val">#1</div>
            <div className="db-kpi__lbl">Google local</div>
            <div className="db-kpi__trend">↑ 5 pos</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi__ico db-kpi__ico--purple"><Zap size={11} /></div>
            <div className="db-kpi__val">8.4%</div>
            <div className="db-kpi__lbl">Conversión</div>
            <div className="db-kpi__trend">↑ 2.1%</div>
          </div>
        </div>

        {/* Chart */}
        <div className="db-chart">
          <div className="db-chart__hdr">
            <span className="db-chart__title"><BarChart2 size={11} /> Visitas últimos 7 días</span>
            <span className="db-chart__sub">Esta semana</span>
          </div>
          <div className="db-chart__area">
            {/* Animated SVG line overlay */}
            <svg className="db-chart__svg" viewBox="0 0 280 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dbLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0047FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0047FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill under the line */}
              <path
                className="db-line-area"
                d="M0,52 C25,48 45,36 80,32 C110,28 130,16 160,11 C185,7 210,4 240,3 C255,2 270,4 280,3 L280,60 L0,60 Z"
                fill="url(#dbLineGrad)"
              />
              {/* Ascending line */}
              <path
                className="db-line-path"
                d="M0,52 C25,48 45,36 80,32 C110,28 130,16 160,11 C185,7 210,4 240,3 C255,2 270,4 280,3"
                fill="none"
                stroke="#0047FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Moving dot on the line */}
              <circle className="db-line-dot" r="3" fill="#0047FF" />
            </svg>

            {DB_BARS.map((b, i) => (
              <div key={i} className="db-chart__col">
                <div
                  className={`db-chart__bar${i === 4 ? ' db-chart__bar--hl' : ''}`}
                  style={{ '--bh': `${b.h}%`, '--bi': i }}
                />
                <span className="db-chart__day">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="db-widgets">
          {/* IA */}
          <div className="db-widget">
            <div className="db-widget__hdr"><Bot size={11} /> IA 24/7</div>
            <div className="db-widget__rows">
              <div className="db-widget__row"><span>Consultas</span><strong>1.234</strong></div>
              <div className="db-widget__row"><span>Citas auto</span><strong className="db-widget__strong--blue">89</strong></div>
              <div className="db-widget__row"><span>Resp. media</span><strong>&lt;1s</strong></div>
            </div>
          </div>

          {/* SEO ring */}
          <div className="db-widget db-widget--center">
            <div className="db-widget__hdr"><Search size={11} /> SEO Score</div>
            <div className="db-ring">
              <svg viewBox="0 0 64 64" className="db-ring__svg">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(0,71,255,0.12)" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none" stroke="#0047FF" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="163.4"
                  className="db-ring__arc"
                />
              </svg>
              <span className="db-ring__score">94</span>
            </div>
            <div className="db-widget__sub">de 100 pts</div>
          </div>

          {/* Clicks */}
          <div className="db-widget">
            <div className="db-widget__hdr"><MousePointer size={11} /> Clicks Google</div>
            <div className="db-widget__big">3.421</div>
            <div className="db-sparkline">
              {DB_SPARKS.map((h, i) => (
                <span key={i} className="db-spark" style={{ '--sh': `${h}%`, '--si': i }} />
              ))}
            </div>
            <div className="db-widget__uptag">↑ +18% vs mes anterior</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI Chat Demo ── */
function AIChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < CHAT_MESSAGES.length) {
      const delay = CHAT_MESSAGES[visibleCount]?.type === 'typing' ? 600 : 900;
      const timer = setTimeout(() => setVisibleCount(v => v + 1), delay);
      return () => clearTimeout(timer);
    } else {
      const reset = setTimeout(() => setVisibleCount(0), 3000);
      return () => clearTimeout(reset);
    }
  }, [visibleCount]);

  // Tag each message with its original index so keys stay stable when filtering
  const visibleMessages = CHAT_MESSAGES
    .slice(0, visibleCount)
    .map((msg, idx) => ({ ...msg, idx }))
    // Show typing only when it's the last visible message (hides it once bot replies)
    .filter(({ type }, i, arr) => type !== 'typing' || i === arr.length - 1);

  return (
    <div className="ai-chat-demo">
      <div className="ai-chat-demo__header">
        <div className="ai-chat-demo__avatar"><Bot size={16} /></div>
        <div>
          <div className="ai-chat-demo__name">Asistente IA · DentPlus</div>
          <div className="ai-chat-demo__status"><span className="ai-status-dot" />En línea</div>
        </div>
      </div>
      <div className="ai-chat-demo__messages">
        {visibleMessages.map(({ idx, type, text }) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`chat-bubble chat-bubble--${type}`}
          >
            {type === 'typing' ? (
              <span className="typing-dots"><span /><span /><span /></span>
            ) : text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`cl-faq-item ${open ? 'cl-faq-item--open' : ''}`}>
      <button className="cl-faq-item__q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <motion.p
          className="cl-faq-item__a"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

/* ── Main ── */
export default function ClinicasLanding() {
  const [heroRef, heroInView] = useReveal();
  const [painRef, painInView] = useReveal();
  const [solRef, solInView] = useReveal();
  const [aiRef, aiInView] = useReveal();
  const [statsRef, statsInView] = useReveal();
  const [procRef, procInView] = useReveal();
  const [priceRef, priceInView] = useReveal();
  const [revRef, revInView] = useReveal();
  const [faqRef, faqInView] = useReveal();

  return (
    <div className="cl-landing">
      <div className="noise-overlay" />
      <Navbar />

      {/* ── HERO ── */}
      <section className="cl-hero">
        <div className="cl-hero__bg-grid" />
        <div className="cl-hero__glow" />
        <div className="cl-hero__orb cl-hero__orb--1" aria-hidden="true" />
        <div className="cl-hero__orb cl-hero__orb--2" aria-hidden="true" />

        <div className="container cl-hero__container">
          {/* LEFT — text */}
          <motion.div
            ref={heroRef}
            className="cl-hero__content"
            variants={stagger}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-hero__badge">
              <Sparkles size={14} />
              <span>Especialistas en clínicas dentales · Barcelona</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="cl-hero__h1">
              Tu clínica dental<br />
              <span className="cl-hero__h1-blue">llena de pacientes.</span><br />
              <span className="cl-hero__h1-outline">Tú, durmiendo.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="cl-hero__sub">
              Diseñamos webs para clínicas dentales que aparecen en el <strong>top de Google</strong>,
              convierten visitas en citas y tienen una <strong>IA que atiende 24/7</strong> mientras tú descansas.
            </motion.p>

            <motion.div variants={fadeUp} className="cl-hero__ctas">
              <a href="https://wa.me/34600000000?text=Hola%2C+me+interesa+una+web+para+mi+cl%C3%ADnica+dental" target="_blank" rel="noopener noreferrer">
                <button className="cl-btn-primary">
                  Consulta gratuita por WhatsApp <ArrowRight size={18} />
                </button>
              </a>
              <a href="#soluciones">
                <button className="cl-btn-ghost">Ver soluciones</button>
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="cl-hero__trust">
              <div className="cl-trust-item"><CheckCircle size={16} /><span>Sin permanencia</span></div>
              <div className="cl-trust-item"><CheckCircle size={16} /><span>Resultados en 90 días</span></div>
              <div className="cl-trust-item"><CheckCircle size={16} /><span>+20 clínicas satisfechas</span></div>
            </motion.div>
          </motion.div>

          {/* RIGHT — animated clinic dashboard */}
          <motion.div
            className="cl-hero__visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Dashboard card */}
            <div className="cl-dash">
              <div className="cl-dash__bar">
                <span className="cl-dash__dot cl-dash__dot--r" />
                <span className="cl-dash__dot cl-dash__dot--y" />
                <span className="cl-dash__dot cl-dash__dot--g" />
                <span className="cl-dash__url">tuclinica.com</span>
                <span className="cl-dash__live"><span className="cl-dash__live-dot" />LIVE</span>
              </div>
              <div className="cl-dash__body">
                <div className="cl-dash__metric">
                  <div className="cl-dash__metric-left">
                    <Calendar size={14} />
                    <span>Citas este mes</span>
                  </div>
                  <div className="cl-dash__metric-right">
                    <span className="cl-dash__metric-val">47</span>
                    <span className="cl-dash__metric-up"><TrendingUp size={12} /> +42%</span>
                  </div>
                </div>
                <div className="cl-dash__metric">
                  <div className="cl-dash__metric-left">
                    <Search size={14} />
                    <span>Google ranking</span>
                  </div>
                  <div className="cl-dash__metric-right">
                    <span className="cl-dash__metric-val">#1</span>
                    <span className="cl-dash__metric-up"><TrendingUp size={12} /> subiendo</span>
                  </div>
                </div>
                <div className="cl-dash__metric">
                  <div className="cl-dash__metric-left">
                    <Star size={14} />
                    <span>Valoración Google</span>
                  </div>
                  <div className="cl-dash__metric-right">
                    <span className="cl-dash__metric-val">4.9</span>
                    <span className="cl-dash__metric-stars">★★★★★</span>
                  </div>
                </div>
                <div className="cl-dash__chart" aria-hidden="true">
                  {[35,55,42,70,58,85,72,90].map((h, i) => (
                    <div key={i} className="cl-dash__bar-item" style={{ '--h': `${h}%`, '--d': `${i * 0.08}s` }} />
                  ))}
                </div>
                <div className="cl-dash__chart-label">
                  <span>Pacientes últimas 8 semanas</span>
                  <span className="cl-dash__chart-up"><TrendingUp size={12} /> +40%</span>
                </div>
              </div>
            </div>

            {/* Floating notification badges */}
            <motion.div
              className="cl-hero-badge cl-hero-badge--1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="cl-hero-badge__icon"><Calendar size={16} /></div>
              <div>
                <div className="cl-hero-badge__title">Nueva cita reservada</div>
                <div className="cl-hero-badge__sub">Laura G. · Limpieza · Hoy 16:00</div>
              </div>
              <div className="cl-hero-badge__pulse" />
            </motion.div>

            <motion.div
              className="cl-hero-badge cl-hero-badge--2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              <div className="cl-hero-badge__icon cl-hero-badge__icon--g"><Search size={14} /></div>
              <div>
                <div className="cl-hero-badge__title">Google · Posición #1</div>
                <div className="cl-hero-badge__sub">"dentista barcelona centro"</div>
              </div>
            </motion.div>

            <motion.div
              className="cl-hero-badge cl-hero-badge--3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              <div className="cl-hero-badge__icon cl-hero-badge__icon--ai"><Bot size={14} /></div>
              <div>
                <div className="cl-hero-badge__title">IA respondiendo</div>
                <div className="cl-hero-badge__sub">3 conversaciones activas</div>
              </div>
              <div className="cl-hero-badge__ai-dots"><span/><span/><span/></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mini stats strip */}
        <div className="cl-hero__mini-stats">
          <div className="cl-mini-stat"><span className="cl-mini-stat__num">+40%</span><span>citas</span></div>
          <div className="cl-mini-stat__divider" />
          <div className="cl-mini-stat"><span className="cl-mini-stat__num">#1</span><span>Google local</span></div>
          <div className="cl-mini-stat__divider" />
          <div className="cl-mini-stat"><span className="cl-mini-stat__num">24/7</span><span>IA activa</span></div>
          <div className="cl-mini-stat__divider" />
          <div className="cl-mini-stat"><span className="cl-mini-stat__num">2 sem</span><span>entrega</span></div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="cl-marquee" aria-hidden="true">
        <div className="cl-marquee__track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="cl-marquee__item">
              <CheckCircle size={12} className="cl-marquee__icon" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── PAIN POINTS ── */}
      <section className="cl-pain section" id="problemas">
        <div className="container">
          <motion.div
            ref={painRef}
            variants={stagger}
            initial="hidden"
            animate={painInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-section-label">¿Te suena familiar?</motion.div>
            <motion.h2 variants={fadeUp} className="cl-section-title">
              Estos problemas están costándote<br />
              <span className="text-primary">pacientes cada día</span>
            </motion.h2>

            <motion.div variants={stagger} className="cl-pain__grid">
              {PAINS.map((p, i) => (
                <motion.div key={i} variants={fadeUp} className="cl-pain-card">
                  <div className="cl-pain-card__icon">{p.icon}</div>
                  <h3 className="cl-pain-card__title">{p.title}</h3>
                  <p className="cl-pain-card__desc">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="cl-pain__solve">
              <div className="cl-pain__solve-inner">
                <div className="cl-pain__solve-label">La solución existe</div>
                <p className="cl-pain__solve-text">
                  Trabajamos exclusivamente con clínicas dentales para que dominen Google,
                  reciban más citas y nunca más pierdan un paciente por falta de respuesta.
                </p>
                <a href="#soluciones">
                  <button className="cl-btn-primary">Ver cómo lo hacemos <ArrowRight size={16} /></button>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="cl-video section">
        <div className="container">
          <div className="cl-video__label">
            <Sparkles size={14} /> Resultados reales
          </div>
          <h2 className="cl-section-title cl-section-title--light">
            Mira cómo transformamos<br />
            <span className="cl-video__title-blue">clínicas dentales</span>
          </h2>
          <p className="cl-video__sub">
            De una web invisible a liderar Google en menos de 90 días.
          </p>

          <div className="cl-video__frame-wrap">
            <div className="cl-video__frame">
              <iframe
                src="https://player.vimeo.com/video/1049518388?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="Agutidesigns para clínicas dentales"
              />
            </div>

            {/* Floating result badges */}
            <div className="cl-video__badge cl-video__badge--1">
              <TrendingUp size={16} />
              <div>
                <strong>+40%</strong>
                <span>nuevos pacientes</span>
              </div>
            </div>
            <div className="cl-video__badge cl-video__badge--2">
              <Search size={16} />
              <div>
                <strong>Top 3</strong>
                <span>en Google local</span>
              </div>
            </div>
            <div className="cl-video__badge cl-video__badge--3">
              <Bot size={16} />
              <div>
                <strong>IA activa</strong>
                <span>citas 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ── */}
      <section className="cl-solutions section" id="soluciones">
        <div className="container">
          <motion.div
            ref={solRef}
            variants={stagger}
            initial="hidden"
            animate={solInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-section-label">Nuestras soluciones</motion.div>
            <motion.h2 variants={fadeUp} className="cl-section-title">
              Todo lo que necesita<br />
              <span className="text-primary">tu clínica dental</span>
            </motion.h2>

            <motion.div variants={stagger} className="cl-sol__grid">
              {SOLUTIONS.map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`cl-sol-card ${s.popular ? 'cl-sol-card--popular' : ''}`}
                >
                  {s.popular && <div className="cl-sol-card__badge"><Award size={12} /> Más contratado</div>}
                  <div className="cl-sol-card__num">{s.num}</div>
                  <div className="cl-sol-card__icon">{s.icon}</div>
                  <h3 className="cl-sol-card__title">{s.title}</h3>
                  <p className="cl-sol-card__desc">{s.desc}</p>
                  <ul className="cl-sol-card__features">
                    {s.features.map((f, j) => (
                      <li key={j}><Check size={14} />{f}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── AI SHOWCASE ── */}
      <section className="cl-ai section" id="ia" ref={aiRef}>
        <div className="container">
          <div className="cl-ai__inner">
            <motion.div
              className="cl-ai__text"
              variants={stagger}
              initial="hidden"
              animate={aiInView ? 'visible' : 'hidden'}
            >
              <motion.div variants={fadeUp} className="cl-section-label cl-section-label--light">
                Inteligencia Artificial
              </motion.div>
              <motion.h2 variants={fadeUp} className="cl-section-title cl-section-title--light">
                Tu clínica atendiendo<br />
                <span className="cl-ai__title-blue">mientras duermes</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="cl-ai__desc">
                Nuestro asistente de IA personalizado para tu clínica responde preguntas,
                informa sobre precios y tratamientos, y <strong>reserva citas automáticamente</strong>.
                Sin intervención humana. Sin llamadas perdidas.
              </motion.p>

              <motion.div variants={stagger} className="cl-ai__feats">
                {[
                  { icon: <Zap size={18} />, text: 'Responde en menos de 1 segundo' },
                  { icon: <Clock size={18} />, text: 'Disponible 24 horas, 7 días a semana' },
                  { icon: <Globe size={18} />, text: 'Habla en español, inglés, catalán y más' },
                  { icon: <Calendar size={18} />, text: 'Sincronizado con tu agenda real' },
                  { icon: <Shield size={18} />, text: 'Cumple normativa RGPD' },
                  { icon: <HeartHandshake size={18} />, text: 'Personalizado con el tono de tu clínica' },
                ].map((f, i) => (
                  <motion.div key={i} variants={fadeUp} className="cl-ai__feat">
                    <div className="cl-ai__feat-icon">{f.icon}</div>
                    <span>{f.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                <a href="https://wa.me/34600000000?text=Quiero+saber+más+sobre+la+IA+para+mi+clínica" target="_blank" rel="noopener noreferrer">
                  <button className="cl-btn-primary">Quiero esta IA en mi clínica <ArrowRight size={16} /></button>
                </a>
              </motion.div>
            </motion.div>

            {/* Animated chat demo */}
            <div className="cl-ai__demo">
              <div className="cl-ai__demo-glow" />
              <AIChatDemo />
              <div className="cl-ai__demo-stats">
                <div className="cl-ai__demo-stat">
                  <span className="cl-ai__demo-stat-num">{'<1s'}</span>
                  <span>respuesta</span>
                </div>
                <div className="cl-ai__demo-stat">
                  <span className="cl-ai__demo-stat-num">24/7</span>
                  <span>disponible</span>
                </div>
                <div className="cl-ai__demo-stat">
                  <span className="cl-ai__demo-stat-num">∞</span>
                  <span>conversaciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="cl-stats section" ref={statsRef}>
        <div className="container">
          <div className="cl-stats__label">Resultados medibles</div>
          <h2 className="cl-section-title cl-section-title--light">
            Números que hablan<br />
            <span className="cl-stats__title-accent">por sí solos</span>
          </h2>
          <div className="cl-stats__grid">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                className="cl-stat-card"
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <div className="cl-stat-card__icon">{s.icon}</div>
                <div className="cl-stat-card__num">
                  {s.value === 0
                    ? <span className="stat-num">0</span>
                    : <AnimatedCounter end={s.value} suffix={s.suffix} prefix={s.prefix || ''} />
                  }
                </div>
                <div className="cl-stat-card__label">{s.label}</div>
                <div className="cl-stat-card__shimmer" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PANEL DE CONTROL ── */}
      <section className="cl-panel section">
        <div className="container">
          <div className="cl-panel__inner">
            {/* Left: copy */}
            <div className="cl-panel__copy">
              <div className="cl-section-label"><Activity size={14} /> Panel de control</div>
              <h2 className="cl-section-title">
                Monitoriza todo<br />
                <span className="text-primary">en tiempo real</span>
              </h2>
              <p className="cl-panel__sub">
                Con cada plan tienes acceso a tu propio panel de control donde ves exactamente qué está pasando con tu clínica online: visitas, pacientes nuevos, posición en Google, clics y mucho más.
              </p>
              <ul className="cl-panel__feats">
                {[
                  { icon: <TrendingUp size={16} />, title: 'Visitas en tiempo real', desc: 'Cuántas personas visitan tu web cada día y de dónde vienen.' },
                  { icon: <Users size={16} />, title: 'Pacientes nuevos captados', desc: 'Cuántos contactos nuevos genera tu web cada semana.' },
                  { icon: <Search size={16} />, title: 'Posicionamiento SEO', desc: 'En qué posición apareces en Google para cada búsqueda clave.' },
                  { icon: <MousePointer size={16} />, title: 'Clics y conversiones', desc: 'Qué botones pulsan, cuántas citas solicitan, qué convierte.' },
                  { icon: <Bot size={16} />, title: 'Rendimiento de la IA', desc: 'Cuántas consultas responde sola y qué citas agenda tu IA.' },
                  { icon: <BarChart2 size={16} />, title: 'Informes mensuales', desc: 'Recibe un informe automático con todos los resultados del mes.' },
                ].map((f, i) => (
                  <li key={i} className="cl-panel__feat">
                    <div className="cl-panel__feat-ico">{f.icon}</div>
                    <div>
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: animated dashboard */}
            <div className="cl-panel__visual">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="cl-process section" id="proceso">
        <div className="container">
          <motion.div
            ref={procRef}
            variants={stagger}
            initial="hidden"
            animate={procInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-section-label">¿Cómo funciona?</motion.div>
            <motion.h2 variants={fadeUp} className="cl-section-title">
              De cero a clínica<br />
              <span className="text-primary">digital en 4 pasos</span>
            </motion.h2>

            <motion.div variants={stagger} className="cl-proc__grid">
              {PROCESS.map((p, i) => (
                <motion.div key={i} variants={fadeUp} className="cl-proc-step">
                  <div className="cl-proc-step__connector" />
                  <div className="cl-proc-step__icon-wrap">
                    <div className="cl-proc-step__icon">{p.icon}</div>
                    <div className="cl-proc-step__num">{p.step}</div>
                  </div>
                  <h3 className="cl-proc-step__title">{p.title}</h3>
                  <p className="cl-proc-step__desc">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="cl-pricing section" id="precios">
        <div className="container">
          <motion.div
            ref={priceRef}
            variants={stagger}
            initial="hidden"
            animate={priceInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-section-label">Planes y precios</motion.div>
            <motion.h2 variants={fadeUp} className="cl-section-title">
              Inversión mensual,<br />
              <span className="text-primary">resultados continuos</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="cl-pricing__sub">
              Setup único para lanzar tu proyecto + mensualidad que mantiene tu clínica creciendo cada mes.
            </motion.p>

            {/* Why monthly banner */}
            <motion.div variants={fadeUp} className="cl-pricing__why">
              {[
                { icon: <TrendingUp size={18} />, text: 'SEO y SEM optimizados cada mes' },
                { icon: <Shield size={18} />, text: 'Web siempre segura y actualizada' },
                { icon: <Bot size={18} />, text: 'IA mejorando continuamente' },
                { icon: <HeartHandshake size={18} />, text: 'Acompañamiento mes a mes' },
              ].map((w, i) => (
                <div key={i} className="cl-pricing__why-item">
                  <div className="cl-pricing__why-icon">{w.icon}</div>
                  <span>{w.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={stagger} className="cl-price__grid">
              {PRICING.map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`cl-price-card ${plan.color === 'popular' ? 'cl-price-card--popular' : ''}`}
                >
                  {plan.badge && <div className="cl-price-card__badge">{plan.badge}</div>}
                  <div className="cl-price-card__name">{plan.name}</div>

                  {/* Monthly — big number */}
                  <div className="cl-price-card__monthly">
                    <span className="cl-price-card__euro">€</span>
                    <span className="cl-price-card__num">{plan.monthly}</span>
                    <span className="cl-price-card__per">/mes</span>
                  </div>

                  {/* Setup — smaller */}
                  <div className="cl-price-card__setup">
                    <span>+ Setup único</span>
                    <strong>€{plan.setup}</strong>
                  </div>

                  <p className="cl-price-card__desc">{plan.desc}</p>

                  {/* Monthly includes */}
                  <div className="cl-price-card__section-label">
                    <span className="cl-price-tag cl-price-tag--monthly">Mensualidad incluye</span>
                  </div>
                  <ul className="cl-price-card__features">
                    {plan.monthlyIncludes.map((f, j) => (
                      <li key={j}><Check size={13} />{f}</li>
                    ))}
                  </ul>

                  {/* Setup includes */}
                  <div className="cl-price-card__section-label">
                    <span className="cl-price-tag cl-price-tag--setup">Setup incluye</span>
                  </div>
                  <ul className="cl-price-card__features cl-price-card__features--setup">
                    {plan.setupIncludes.map((f, j) => (
                      <li key={j}><Check size={13} />{f}</li>
                    ))}
                  </ul>

                  <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer" className="cl-price-card__cta-wrap">
                    <button className={`cl-price-card__cta ${plan.color === 'popular' ? 'cl-price-card__cta--popular' : ''}`}>
                      {plan.cta} <ArrowRight size={15} />
                    </button>
                  </a>
                </motion.div>
              ))}
            </motion.div>

            <motion.p variants={fadeUp} className="cl-pricing__note">
              ¿Quieres un presupuesto personalizado?{' '}
              <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer">
                Hablamos gratis por WhatsApp →
              </a>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── REVIEWS (Trustpilot style) ── */}
      <section className="cl-reviews section" id="testimonios">
        <div className="container">
          <motion.div
            ref={revRef}
            variants={stagger}
            initial="hidden"
            animate={revInView ? 'visible' : 'hidden'}
          >
            {/* Trustpilot overall score header */}
            <motion.div variants={fadeUp} className="cl-tp-header">
              <div className="cl-tp-header__score">
                <span className="cl-tp-header__num">4.9</span>
                <div className="cl-tp-header__stars">
                  {[...Array(5)].map((_, i) => <TpStar key={i} size={28} />)}
                </div>
                <span className="cl-tp-header__label">Excelente</span>
              </div>
              <div className="cl-tp-header__divider" />
              <div className="cl-tp-header__brand">
                <span className="cl-tp-header__powered">Opiniones verificadas en</span>
                <TrustpilotLogo height={36} />
                <span className="cl-tp-header__count">Basado en 47 opiniones</span>
              </div>
            </motion.div>

            <motion.div variants={stagger} className="cl-reviews__grid">
              {REVIEWS.map((r, i) => (
                <motion.div key={i} variants={fadeUp} className="cl-tp-card">
                  <div className="cl-tp-card__top">
                    <div className="cl-tp-card__stars">
                      {[...Array(r.stars)].map((_, j) => <TpStar key={j} size={18} />)}
                    </div>
                    <span className="cl-tp-card__verified">
                      <CheckCircle size={12} /> Verificado
                    </span>
                  </div>
                  <p className="cl-tp-card__title">{r.title || 'Resultados increíbles'}</p>
                  <p className="cl-tp-card__text">{r.text}</p>
                  <div className="cl-tp-card__footer">
                    <div className="cl-tp-card__avatar">{r.avatar}</div>
                    <div>
                      <div className="cl-tp-card__name">{r.name}</div>
                      <div className="cl-tp-card__role">{r.role}</div>
                    </div>
                    <TrustpilotLogo height={20} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="cl-faq section" id="faq">
        <div className="container">
          <motion.div
            ref={faqRef}
            variants={stagger}
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="cl-section-label">Preguntas frecuentes</motion.div>
            <motion.h2 variants={fadeUp} className="cl-section-title">
              Todo lo que necesitas<br />
              <span className="text-primary">saber antes de empezar</span>
            </motion.h2>

            <motion.div variants={fadeUp} className="cl-faq__list">
              {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cl-cta">
        <div className="cl-cta__bg-grid" />
        <div className="cl-cta__glow" />
        <div className="container">
          <motion.div
            className="cl-cta__content"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cl-cta__badge">
              <Sparkles size={14} /> Consulta gratuita · Sin compromiso
            </div>
            <h2 className="cl-cta__title">
              ¿Listo para tener la clínica<br />
              <span className="cl-cta__title-blue">más visible de tu ciudad?</span>
            </h2>
            <p className="cl-cta__sub">
              Analizamos tu clínica gratis, te decimos qué está fallando y qué haríamos
              para que llenes tu agenda en menos de 90 días.
            </p>

            <div className="cl-cta__actions">
              <a
                href="https://wa.me/34600000000?text=Hola%2C+me+interesa+una+web+para+mi+cl%C3%ADnica+dental"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="cl-cta-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hablar por WhatsApp ahora
                </button>
              </a>
              <a href="/calculadora">
                <button className="cl-cta-btn-ghost">Calcular precio de mi web →</button>
              </a>
            </div>

            <div className="cl-cta__trust">
              <div><CheckCircle size={15} /> Respuesta en menos de 2h</div>
              <div><CheckCircle size={15} /> Análisis gratuito de tu web actual</div>
              <div><CheckCircle size={15} /> Sin compromiso de contratación</div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <AIChatbot />
      <CookieBanner />
    </div>
  );
}

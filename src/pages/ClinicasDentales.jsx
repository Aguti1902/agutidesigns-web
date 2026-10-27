import { Check, LayoutTemplate, MapPin, Bot, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
import CookieBanner from '../components/ui/LazyCookieBanner';
import { HeroClinic } from '../components/site/Visuals';
import { Problems, Pillars, CaseVela, Plans, Process, Reviews, Faq, LeadSection, Portfolio } from '../components/site/Sections';
import { REVIEWS_CLINICAS, FAQ_CLINICAS, PLANS } from '../data/site';
import { landings } from '../data/content';
import { CLINICAS_CHATBOT_PROMPT, CLINICAS_INITIAL_MESSAGE } from '../data/prompts';
import useSeo from '../hooks/useSeo';

const CLINICAS_SEO = {
  title: 'Diseño web para clínicas dentales y marketing dental | Agutidesigns',
  description: 'Diseño web para clínicas dentales con SEO local, Google Maps y asistente IA que agenda citas 24/7. Caso real en Viladecans: +20.000 € en 3 meses. Desde 190 €/mes.',
};

const PROBLEMS = [
  { t: 'Pacientes que llaman fuera de horario y no vuelven a llamar', d: 'Mucha gente busca dentista por la noche o el fin de semana. Si solo se puede pedir cita por teléfono, esa persona acaba en la clínica de al lado.' },
  { t: 'No apareces cuando buscan “dentista” en tu zona', d: 'El paciente nuevo elige entre los primeros resultados de Google Maps. Sin una ficha y una web trabajadas, no entras en esa lista.' },
  { t: 'Una web que no está pensada para pedir cita', d: 'Si el botón de cita no se ve en el móvil o el formulario pide diez campos, se pierden pacientes cada semana sin que lo notes.' },
  { t: 'Huecos en la agenda por citas olvidadas', d: 'Los recordatorios a mano dependen de que recepción tenga tiempo. Cada ausencia es una hora de sillón perdida.' },
];

const PILLARS = [
  { Icon: LayoutTemplate, t: 'Web dental que convierte', d: 'Una página por tratamiento (implantes, ortodoncia, estética dental…), equipo, opiniones y cita online en un clic desde el móvil.' },
  { Icon: MapPin, t: 'SEO local y Google Maps', d: 'Optimizamos tu ficha de Google Business y tu web para “dentista en tu ciudad” y para cada tratamiento que más factura.' },
  { Icon: Star, t: 'Reseñas en piloto automático', d: 'Después de cada visita, el paciente recibe un mensaje para valorar la clínica. Más opiniones, mejor posición en Google.' },
  { Icon: Bot, t: 'Asistente IA que agenda 24/7', d: 'Responde en la web y en WhatsApp, propone hueco y envía recordatorios. Deriva a recepción todo lo clínico.' },
];

const PROCESS = [
  { t: 'Análisis gratuito', d: 'Revisamos tu web, tu ficha de Google y a tus competidores en tu zona.' },
  { t: 'Demo de tu nueva web', d: 'Te enseñamos cómo quedaría la web de tu clínica antes de que decidas nada.' },
  { t: 'Lanzamiento en 2–3 semanas', d: 'Web, ficha de Google, reserva online y, si toca, el asistente IA conectado a tu agenda.' },
  { t: 'Más pacientes cada mes', d: 'SEO local, reseñas e informe mensual con las citas que llegan y de dónde.' },
];

const jsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Service', name: 'Diseño web y marketing para clínicas dentales', serviceType: 'Diseño web para clínicas dentales', provider: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io' }, areaServed: 'ES', url: 'https://agutidesigns.io/clinicas-dentales',
      offers: PLANS.map((p) => ({ '@type': 'Offer', name: `Plan ${p.name}`, price: p.monthly.replace('.', ''), priceCurrency: 'EUR', description: p.pitch })) },
    { '@type': 'FAQPage', mainEntity: FAQ_CLINICAS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://agutidesigns.io/' },
      { '@type': 'ListItem', position: 2, name: 'Clínicas dentales', item: 'https://agutidesigns.io/clinicas-dentales' }] },
  ],
});

export default function ClinicasDentales() {
  useSeo({ ...CLINICAS_SEO, path: '/clinicas-dentales', image: '/img/og-clinicas.jpg', jsonLd: jsonLd() });
  const dentalCities = landings.filter((l) => l.nicho === 'dental');

  return (
    <div className="ag">
      <Navbar cta={{ label: 'Consulta gratuita', href: '#propuesta' }} />
      <main>
        <header className="ag-hero">
          <div className="ag-wrap ag-hero__grid">
            <div className="ag-hero__copy">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Clínicas dentales</span></nav>
              <h1 className="ag-h1">Diseño web para clínicas dentales que llena tu agenda</h1>
              <p className="ag-lead">Web, Google Maps y un asistente IA que responde y agenda citas por WhatsApp a cualquier hora. Marketing dental hecho para que tu clínica reciba pacientes nuevos cada semana.</p>
              <div className="ag-actions">
                <a href="#propuesta" className="ag-btn ag-btn--primary">Pide tu consulta gratuita</a>
                <a href="#caso" className="ag-btn ag-btn--ghost">Ver el caso Vela-Segalà</a>
              </div>
              <ul className="ag-hero__trust">
                <li><Check size={16} /> +20.000 € en 3 meses en Viladecans</li>
                <li><Check size={16} /> Desde 190 €/mes</li>
                <li><Check size={16} /> Lista en 2–3 semanas</li>
              </ul>
            </div>
            <HeroClinic />
          </div>
        </header>

        <Problems title="Lo que hace perder pacientes a una clínica dental" lead="No es la calidad de tu trabajo. Es lo que pasa antes de que el paciente llegue a la silla." items={PROBLEMS} />

        <Pillars id="servicios" title="Marketing dental completo, en un solo equipo" lead="Todo conectado: la web lleva a la cita, Google lleva a la web y el asistente no deja ninguna consulta sin respuesta." items={PILLARS}>
          {dentalCities.length > 0 && (
            <div className="sx-chips">
              <span>Por ciudad</span>
              {dentalCities.map((l) => <a key={l.slug} href={`/diseno-web/${l.slug}`}>Clínicas dentales en {l.ciudad}</a>)}
            </div>
          )}
        </Pillars>

        <CaseVela full />
        <Plans title="Planes para clínicas dentales" audience="tu clínica" />
        <Process title="Del primer contacto a la agenda llena" items={PROCESS} />
        <Reviews items={REVIEWS_CLINICAS} title="Clínicas dentales que confían en nosotros" white />
        <Portfolio limit={4} title="Otras webs que hemos diseñado" />
        <Faq items={FAQ_CLINICAS} title="Preguntas sobre diseño web dental" white />
        <LeadSection fuente="landing-clinicas" sector="dental" title="Consulta gratuita para tu clínica" lead="Analizamos tu web y tu posición en Google y te enseñamos una demo de la nueva web de tu clínica. 20 minutos, sin compromiso." />
      </main>
      <Footer />
      <AIChatbot systemPrompt={CLINICAS_CHATBOT_PROMPT} initialMessage={CLINICAS_INITIAL_MESSAGE} />
      <CookieBanner />
    </div>
  );
}

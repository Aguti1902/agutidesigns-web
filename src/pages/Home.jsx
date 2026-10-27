import { Check, LayoutTemplate, MapPin, Bot, CalendarClock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
import CookieBanner from '../components/ui/LazyCookieBanner';
import { HeroGuti } from '../components/site/Visuals';
import { SectorStrip, Pillars, CaseVela, Portfolio, Plans, Process, AboutGuti, Reviews, Faq, LeadSection } from '../components/site/Sections';
import { REVIEWS_GENERAL, FAQ_GENERAL, PLANS } from '../data/site';
import useSeo from '../hooks/useSeo';

const HOME_SEO = {
  title: 'Diseño web en Barcelona que consigue clientes | Agutidesigns',
  description: 'Diseño web a medida en Barcelona para negocios de todos los sectores: webs que venden, posicionamiento en Google y asistente IA en WhatsApp. Pide tu propuesta gratis.',
};

const PILLARS = [
  { Icon: LayoutTemplate, t: 'Diseño web a medida', d: 'Sin plantillas. Una web rápida, pensada para el móvil y con el botón de cita o contacto siempre a mano.', tag: 'En todos los planes' },
  { Icon: MapPin, t: 'Posicionamiento en Google', d: 'SEO local y ficha de Google Business trabajados cada mes para que aparezcas cuando buscan tu servicio en tu ciudad.', tag: 'Desde el plan Crecimiento' },
  { Icon: Bot, t: 'Asistente IA en web y WhatsApp', d: 'Responde al momento las dudas habituales, a cualquier hora, y propone cita. Te pasa los casos que necesitan a una persona.', tag: 'Plan IA' },
  { Icon: CalendarClock, t: 'Citas y recordatorios automáticos', d: 'Reservas online, recordatorios antes de cada cita y peticiones de reseña después. Menos ausencias, más opiniones.', tag: 'Plan IA' },
];

const homeJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      name: 'Agutidesigns',
      url: 'https://agutidesigns.io/',
      image: 'https://agutidesigns.io/img/og-home.jpg',
      telephone: '+34625204337',
      email: 'info@agutidesigns.io',
      address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
      areaServed: 'ES',
      founder: { '@type': 'Person', name: 'Alejandro Gutiérrez' },
      description: HOME_SEO.description,
      makesOffer: PLANS.map((p) => ({ '@type': 'Offer', name: `Plan ${p.name}`, description: p.pitch, priceCurrency: 'EUR', price: p.monthly.replace('.', ''), priceSpecification: { '@type': 'UnitPriceSpecification', price: p.monthly.replace('.', ''), priceCurrency: 'EUR', unitText: 'MON' } })),
    },
    { '@type': 'FAQPage', mainEntity: FAQ_GENERAL.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
});

export default function Home() {
  useSeo({ ...HOME_SEO, path: '/', jsonLd: homeJsonLd() });

  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero">
          <div className="ag-wrap ag-hero__grid">
            <div className="ag-hero__copy">
              <h1 className="ag-h1">Diseño web en Barcelona que te trae clientes, no solo visitas</h1>
              <p className="ag-lead">Webs a medida, posicionamiento en Google y un asistente IA que responde y agenda por ti. Para clínicas, despachos, alojamientos, comercios y empresas que quieren más clientes cada mes.</p>
              <div className="ag-actions">
                <a href="#propuesta" className="ag-btn ag-btn--primary">Pide tu propuesta gratis</a>
                <a href="/casos" className="ag-btn ag-btn--ghost">Ver casos reales</a>
              </div>
              <ul className="ag-hero__trust">
                <li><Check size={16} /> Caso real: +20.000 € en 3 meses</li>
                <li><Check size={16} /> Web lista en 2–3 semanas</li>
                <li><Check size={16} /> Hablas siempre con Guti</li>
              </ul>
            </div>
            <HeroGuti />
          </div>
          <div className="ag-wrap sx-clients">
            <p>Negocios que ya trabajan con nosotros</p>
            <ul>{['Vela-Segalà', 'Estética Segalà', 'Stay4Days', 'Lanzarote Experience Tours', 'Spa Organic', 'LGO Legal', 'Gestoría Rusiñol', 'La Graciosa Vins', 'Black AI', 'NexGent', 'DEPRO'].map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </header>

        <Pillars title="Todo lo que necesita tu negocio para conseguir clientes por internet" lead="Una web bonita no basta. La conectamos con Google, WhatsApp y tu agenda para que cada visita tenga un camino claro hasta la cita o la compra." items={PILLARS}>
        </Pillars>

        <SectorStrip />

        <CaseVela />
        <Portfolio limit={4} lead="Cada web es distinta porque cada negocio lo es. Estas están online y puedes visitarlas." />
        <Plans />
        <Process photo="reunion" photoAlt="Revisando el diseño de la nueva web de una clínica con su responsable" />
        <AboutGuti />
        <Reviews items={REVIEWS_GENERAL} />
        <Faq items={FAQ_GENERAL} white />
        <LeadSection fuente="web:home" />
      </main>
      <Footer />
      <AIChatbot />
      <CookieBanner />
    </div>
  );
}

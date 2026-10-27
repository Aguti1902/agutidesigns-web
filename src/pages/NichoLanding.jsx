import { useParams, Navigate } from 'react-router-dom';
import { Check, LayoutTemplate, Bot, MapPin, CalendarClock, LineChart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
import { SectorMock } from '../components/site/Visuals';
import { Problems, Pillars, CaseVela, Plans, Faq, LeadSection } from '../components/site/Sections';
import { getLanding, landings } from '../data/content';
import { sectorOf } from '../data/sectors';
import useSeo from '../hooks/useSeo';

const ICONS = [LayoutTemplate, Bot, MapPin, CalendarClock, LineChart];

function landingJsonLd(l) {
  const url = `https://agutidesigns.io/diseno-web/${l.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', name: l.h1, serviceType: 'Diseño web y marketing digital', areaServed: { '@type': 'City', name: l.ciudad }, provider: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io' }, url, description: l.metaDescription },
      { '@type': 'FAQPage', mainEntity: l.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://agutidesigns.io/' },
        { '@type': 'ListItem', position: 2, name: 'Diseño web por sector', item: 'https://agutidesigns.io/diseno-web' },
        { '@type': 'ListItem', position: 3, name: l.h1, item: url }] },
    ],
  };
}

export default function NichoLanding() {
  const { slug } = useParams();
  const l = getLanding(slug);
  useSeo(l ? { title: l.metaTitle, description: l.metaDescription, path: `/diseno-web/${l.slug}`, image: '/img/og-sectores.jpg', jsonLd: landingJsonLd(l) } : {});
  if (!l) return <Navigate to="/diseno-web" replace />;

  const related = [
    ...landings.filter((x) => x.nicho === l.nicho && x.slug !== l.slug),
    ...landings.filter((x) => x.ciudad === l.ciudad && x.nicho !== l.nicho),
  ].slice(0, 8);
  const pillars = l.solucion.map((s, i) => ({ Icon: ICONS[i % ICONS.length], t: s.t, d: s.d }));
  const who = l.h1.replace(/^Diseño web para /, '').replace(` en ${l.ciudad}`, '');

  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero">
          <div className="ag-wrap ag-hero__grid">
            <div className="ag-hero__copy">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/diseno-web">Sectores</a><span aria-hidden="true">/</span><span>{l.ciudad}</span></nav>
              <h1 className="ag-h1">{l.h1}</h1>
              <p className="ag-lead">{l.intro}</p>
              <div className="ag-actions">
                <a href="#propuesta" className="ag-btn ag-btn--primary">Pide tu propuesta gratis</a>
                <a href="#caso" className="ag-btn ag-btn--ghost">Ver un caso real</a>
              </div>
              <ul className="ag-hero__trust">
                <li><Check size={16} /> Demo de tu web antes de decidir</li>
                <li><Check size={16} /> Lista en 2–3 semanas</li>
              </ul>
            </div>
            <SectorMock nicho={l.nicho} ciudad={l.ciudad} />
          </div>
        </header>

        <Problems title={`Lo que frena hoy a tu ${sectorOf(l.nicho).label.toLowerCase()} en ${l.ciudad}`} items={l.problemas} />
        <Pillars title="Lo que montamos para ti" lead={l.nota} items={pillars} />
        <CaseVela />
        <Plans audience="tu negocio" />
        <Faq items={l.faqs} title={`Preguntas sobre diseño web para ${who}`} white />
        {related.length > 0 && (
          <section className="ag-section ag-section--tight">
            <div className="ag-wrap">
              <h2 className="ag-h3">También trabajamos en</h2>
              <div className="sx-chips" style={{ marginTop: 16 }}>
                {related.map((r) => <a key={r.slug} href={`/diseno-web/${r.slug}`}>{r.h1.replace('Diseño web para ', '').replace(/^./, (c) => c.toUpperCase())}</a>)}
              </div>
            </div>
          </section>
        )}
        <LeadSection fuente={`web:${l.slug}`} ciudad={l.ciudad} sector={l.nicho} />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}

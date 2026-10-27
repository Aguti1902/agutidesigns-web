import { useParams, Navigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Check, MapPin, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/AIChatbot';
import WebLeadForm from '../components/forms/WebLeadForm';
import CaseVela from '../components/sections/CaseVela';
import { getLanding, landings } from '../data/content';
import useSeo from '../hooks/useSeo';
import './NichoLanding.css';

export function landingJsonLd(l) {
  const url = `https://agutidesigns.io/diseno-web/${l.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: l.h1,
        serviceType: 'Diseño web y marketing digital',
        areaServed: { '@type': 'City', name: l.ciudad },
        provider: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io' },
        url,
        description: l.metaDescription,
      },
      {
        '@type': 'FAQPage',
        mainEntity: l.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://agutidesigns.io/' },
          { '@type': 'ListItem', position: 2, name: 'Diseño web', item: 'https://agutidesigns.io/diseno-web' },
          { '@type': 'ListItem', position: 3, name: l.h1, item: url },
        ],
      },
    ],
  };
}

export default function NichoLanding() {
  const { slug } = useParams();
  const l = getLanding(slug);
  useSeo(l ? { title: l.metaTitle, description: l.metaDescription, path: `/diseno-web/${l.slug}`, jsonLd: landingJsonLd(l) } : {});
  if (!l) return <Navigate to="/diseno-web" replace />;

  const sameNiche = landings.filter((x) => x.nicho === l.nicho && x.slug !== l.slug);
  const sameCity = landings.filter((x) => x.ciudad === l.ciudad && x.nicho !== l.nicho);
  const related = [...sameNiche, ...sameCity].slice(0, 6);
  const toForm = (e) => { e.preventDefault(); document.getElementById('propuesta')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  return (
    <div className="nl">
      <Navbar />
      <header className="nl-hero">
        <div className="container nl-hero__grid">
          <div>
            <nav className="nl-crumbs" aria-label="Migas de pan">
              <a href="/">Inicio</a> / <a href="/diseno-web">Diseño web</a> / <span>{l.ciudad}</span>
            </nav>
            <span className="nl-pill"><MapPin size={14} /> {l.ciudad}</span>
            <h1 className="nl-hero__title">{l.h1}</h1>
            <p className="nl-hero__intro">{l.intro}</p>
            <div className="nl-hero__ctas">
              <a href="#propuesta" onClick={toForm} className="nl-btn">Quiero mi propuesta <ArrowRight size={16} /></a>
              <a href="/casos" className="nl-btn nl-btn--ghost">Ver casos reales</a>
            </div>
          </div>
          <WebLeadForm fuente={`web:${l.slug}`} ciudad={l.ciudad} sector={l.nicho} />
        </div>
      </header>

      <section className="container nl-sec">
        <h2 className="nl-h2">Lo que está frenando a tu negocio</h2>
        <div className="nl-cards">
          {l.problemas.map((p) => (
            <article key={p.t} className="nl-card">
              <AlertCircle size={22} strokeWidth={1.7} className="nl-card__ic nl-card__ic--warn" />
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="nl-solution">
        <div className="container">
          <h2 className="nl-h2">Lo que montamos para ti</h2>
          <p className="nl-lead">{l.nota}</p>
          <ol className="nl-steps">
            {l.solucion.map((s, i) => (
              <li key={s.t}>
                <span className="nl-steps__n">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{s.t}</h3><p>{s.d}</p></div>
                <Check size={20} className="nl-steps__ok" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container nl-sec"><CaseVela compact /></div>

      <section className="container nl-sec nl-faq">
        <h2 className="nl-h2">Preguntas frecuentes</h2>
        {l.faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}<ChevronDown size={18} /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      {related.length > 0 && (
        <section className="container nl-sec">
          <h2 className="nl-h3">También trabajamos con</h2>
          <div className="nl-related">
            {related.map((r) => <a key={r.slug} href={`/diseno-web/${r.slug}`}>{r.h1.replace('Diseño web para ', '')} <ArrowRight size={14} /></a>)}
          </div>
        </section>
      )}

      <Footer />
      <AIChatbot />
    </div>
  );
}

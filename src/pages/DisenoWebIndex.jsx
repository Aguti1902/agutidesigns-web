import { Check, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
import { LeadSection } from '../components/site/Sections';
import Photo from '../components/site/Photo';
import { landings } from '../data/content';
import { sectorOf } from '../data/sectors';
import { SECTOR_GROUPS } from '../data/sectorGroups';
import { PORTFOLIO } from '../data/portfolio';
import useSeo from '../hooks/useSeo';
import './DisenoWebIndex.css';

const SEO = {
  title: 'Diseño web por sectores: clínicas, despachos, turismo y más | Agutidesigns',
  description: 'Webs que venden para clínicas, spas, despachos, alojamientos turísticos, hostelería y startups. Mira cómo trabajamos cada sector y las webs reales que hemos diseñado.',
};

const client = (c) => (typeof c === 'string' ? (({ label, img, href, type }) => ({ name: label, img, href, type }))(PORTFOLIO.find((p) => p.id === c)) : c);

export default function DisenoWebIndex() {
  useSeo({ ...SEO, path: '/diseno-web', image: '/img/og-sectores.jpg' });

  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero dwi-hero">
          <div className="ag-wrap ag-hero__grid">
            <div className="dwi__copy">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Sectores</span></nav>
              <h1 className="ag-h1">Diseño web para cada sector</h1>
              <p className="ag-lead">Clínicas, despachos, spas, alojamientos, bodegas y startups. Cada negocio vende de una forma distinta, y su web también debería hacerlo.</p>
              <nav className="dwi-jump" aria-label="Ir a un sector">
                {SECTOR_GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}
              </nav>
            </div>
            <div className="dwi-collage" aria-hidden="true">
              {['dental', 'belleza', 'despacho', 'alojamiento', 'vino'].map((p, i) => (
                <div key={p} className={`dwi-collage__item dwi-collage__item--${i}`}><Photo name={p} alt="" sizes="320px" priority={i < 3} /></div>
              ))}
            </div>
          </div>
        </header>

        {SECTOR_GROUPS.map((g, i) => {
          const clients = (g.clients || []).map(client).filter(Boolean);
          const cityLinks = g.nichos ? landings.filter((l) => g.nichos.includes(l.nicho)) : [];
          return (
            <section key={g.id} id={g.id} className={`ag-section dwi-sector ${i % 2 ? 'dwi-sector--flip' : 'ag-section--white'}`}>
              <div className="ag-wrap dwi-sector__grid">
                <div className="dwi-sector__visual">
                  <div className="dwi-sector__photo"><Photo name={g.photo} alt={`${g.title}: ejemplo de negocio para el que diseñamos webs`} sizes="(max-width: 900px) 92vw, 600px" /></div>
                  {clients.length > 0 && (
                    <div className="dwi-sector__devices">
                      {clients.slice(0, 2).map((c) => (
                        <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer" className={`dwi-device ${c.wide ? 'dwi-device--wide' : ''}`} aria-label={`Ver la web de ${c.name}`}>
                          <img src={c.img} alt={`Web de ${c.name}`} loading="lazy" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="dwi-sector__copy">
                  <h2 className="ag-h2">{g.title}</h2>
                  <p className="ag-lead">{g.lead}</p>
                  <ul className="ag-checks">{g.points.map((p) => <li key={p}><Check size={16} />{p}</li>)}</ul>
                  {g.proof && (
                    <figure className="dwi-proof">
                      <figcaption>{g.proof.label}</figcaption>
                      <blockquote>{g.proof.text}</blockquote>
                      {g.proof.href && <a className="ag-link" href={g.proof.href}>Ver el caso completo</a>}
                    </figure>
                  )}
                  {clients.length > 0 && (
                    <p className="dwi-clients">
                      <span>Webs reales:</span>
                      {clients.map((c) => <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer">{c.name} <ArrowUpRight size={14} /></a>)}
                    </p>
                  )}
                  {(cityLinks.length > 0 || g.main) && (
                    <div className="dwi-cities">
                      {g.main && <a className="dwi-cities__main" href={g.main.href}>{g.main.label}</a>}
                      {cityLinks.map((l) => (
                        <a key={l.slug} href={`/diseno-web/${l.slug}`} style={{ '--hue': sectorOf(l.nicho).hue }}>{l.h1.replace('Diseño web para ', '').replace(/^./, (ch) => ch.toUpperCase())}</a>
                      ))}
                    </div>
                  )}
                  <a href="#propuesta" className="ag-btn ag-btn--primary">Quiero una web para mi negocio</a>
                </div>
              </div>
            </section>
          );
        })}

        <LeadSection fuente="web:diseno-web" title="¿Tu sector no está en la lista?" lead="Hemos hecho webs para negocios muy distintos. Cuéntanos el tuyo y te enseñamos una demo de cómo quedaría tu nueva web." />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}

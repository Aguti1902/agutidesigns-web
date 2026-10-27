import { ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WebLeadForm from '../components/forms/WebLeadForm';
import { landings } from '../data/content';
import useSeo from '../hooks/useSeo';
import './NichoLanding.css';

export default function DisenoWebIndex() {
  useSeo({
    title: 'Diseño web por sector y ciudad | Agutidesigns',
    description: 'Webs con asistente IA, Google Maps y citas online para clínicas y negocios locales. Elige tu sector y tu ciudad.',
    path: '/diseno-web',
  });
  const cities = [...new Set(landings.map((l) => l.ciudad))];
  return (
    <div className="nl">
      <Navbar />
      <header className="nl-hero">
        <div className="container">
          <span className="nl-pill">Sectores y ciudades</span>
          <h1 className="nl-hero__title">Diseño web para negocios que viven de sus clientes locales</h1>
          <p className="nl-hero__intro">Web, asistente IA 24/7, posicionamiento en Google y recordatorios automáticos. Elige tu sector y tu ciudad.</p>
        </div>
      </header>
      {cities.map((c) => (
        <section key={c} className="container nl-sec" style={{ paddingTop: 0 }}>
          <h2 className="nl-h3">{c}</h2>
          <div className="nl-index">
            {landings.filter((l) => l.ciudad === c).map((l) => (
              <a key={l.slug} href={`/diseno-web/${l.slug}`}>
                <span>{l.ciudad}</span>
                <b>{l.h1}</b>
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
        </section>
      ))}
      <section className="container nl-sec" style={{ maxWidth: 760 }}>
        <WebLeadForm fuente="web:diseno-web" title="¿No ves tu sector? Cuéntanos" />
      </section>
      <Footer />
    </div>
  );
}

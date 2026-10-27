import { ArrowUpRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/AIChatbot';
import WebLeadForm from '../components/forms/WebLeadForm';
import CaseVela from '../components/sections/CaseVela';
import { PORTFOLIO } from '../data/portfolio';
import useSeo from '../hooks/useSeo';
import './NichoLanding.css';
import './Casos.css';

export default function Casos() {
  useSeo({
    title: 'Casos de éxito y webs reales | Agutidesigns',
    description: 'Clínica Dental Vela-Segalà: más de 20.000 € facturados en 3 meses (+80 %). Mira el antes y después y las webs que hemos diseñado.',
    path: '/casos',
  });
  return (
    <div className="nl">
      <Navbar />
      <header className="nl-hero">
        <div className="container">
          <span className="nl-pill">Resultados reales</span>
          <h1 className="nl-hero__title">Casos y webs reales</h1>
          <p className="nl-hero__intro">Nada de plantillas ni promesas: negocios reales, con webs que puedes visitar ahora mismo.</p>
        </div>
      </header>

      <div className="container"><CaseVela /></div>

      <section className="container nl-sec">
        <h2 className="nl-h2">Webs que hemos diseñado</h2>
        <div className="cs-grid">
          {PORTFOLIO.map((p) => (
            <a key={p.id} className="cs-item" href={p.href} target="_blank" rel="noopener noreferrer">
              <div className="cs-item__img"><img src={p.img} alt={`Web de ${p.label}`} loading="lazy" /></div>
              <div className="cs-item__meta">
                <div><b>{p.label}</b><span>{p.type}</span></div>
                <ArrowUpRight size={18} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="container nl-sec" style={{ maxWidth: 760, paddingTop: 0 }}>
        <WebLeadForm fuente="web:casos" title="¿Quieres resultados como estos?" />
      </section>
      <Footer />
      <AIChatbot />
    </div>
  );
}

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AIChatbot from '../components/chat/LazyChatbot';
import { CaseVela, Portfolio, Reviews, LeadSection } from '../components/site/Sections';
import { REVIEWS_GENERAL } from '../data/site';
import useSeo from '../hooks/useSeo';
import Photo from '../components/site/Photo';
import './DisenoWebIndex.css';

const CASOS_SEO = {
  title: 'Casos de éxito en diseño web: +20.000 € en 3 meses | Agutidesigns',
  description: 'Clínica Dental Vela-Segalà facturó más de 20.000 € en 3 meses (+80 %) con su nueva web, Google y asistente IA. Mira el antes y después y las webs que hemos diseñado.',
};

export default function Casos() {
  useSeo({ ...CASOS_SEO, path: '/casos', image: '/img/og-casos.jpg' });
  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero ag-hero--short">
          <div className="ag-wrap ag-hero__grid">
            <div className="dwi__copy">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Casos</span></nav>
              <h1 className="ag-h1 dwi__title">Casos de éxito y webs reales</h1>
              <p className="ag-lead">Resultados de negocios reales, con webs que puedes visitar ahora mismo.</p>
            </div>
            <div className="ag-hero__photo"><Photo name="negocio" alt="Dueña de un negocio local recibiendo una reserva en el móvil" priority /></div>
          </div>
        </header>
        <CaseVela full />
        <Portfolio title="Todas las webs que hemos diseñado" lead="Desde clínicas y despachos hasta alquiler vacacional y startups. Toca cualquiera para visitarla." />
        <Reviews items={REVIEWS_GENERAL} white />
        <LeadSection fuente="web:casos" title="¿Quieres resultados como estos?" />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}

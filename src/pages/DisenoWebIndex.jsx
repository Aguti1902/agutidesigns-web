import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { LeadSection } from '../components/site/Sections';
import { landings } from '../data/content';
import { sectorOf } from '../data/sectors';
import useSeo from '../hooks/useSeo';
import './DisenoWebIndex.css';

const INDEX_SEO = {
  title: 'Diseño web por sector y ciudad | Agutidesigns',
  description: 'Diseño web para clínicas dentales, podólogos, fisioterapeutas, clínicas estéticas y nutricionistas en Barcelona y alrededores. Web, Google y asistente IA.',
};

export default function DisenoWebIndex() {
  useSeo({ ...INDEX_SEO, path: '/diseno-web', image: '/img/og-sectores.jpg' });
  const groups = Object.entries(landings.reduce((acc, l) => { (acc[l.nicho] ||= []).push(l); return acc; }, {}));
  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero ag-hero--short">
          <div className="ag-wrap">
            <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Sectores</span></nav>
            <h1 className="ag-h1 dwi__title">Diseño web por sector y ciudad</h1>
            <p className="ag-lead">Cada sector tiene sus búsquedas, sus dudas y su forma de pedir cita. Elige el tuyo y mira cómo lo trabajamos en tu ciudad.</p>
          </div>
        </header>
        <section className="ag-section ag-section--white">
          <div className="ag-wrap dwi">
            {groups.map(([nicho, items]) => {
              const s = sectorOf(nicho);
              return (
                <div key={nicho} className="dwi__group" style={{ '--hue': s.hue }}>
                  <h2 className="ag-h3">{s.label}</h2>
                  <ul>
                    {items.map((l) => (
                      <li key={l.slug}><a href={`/diseno-web/${l.slug}`}><span>{l.ciudad}</span><small>{l.h1}</small></a></li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="dwi__group" style={{ '--hue': '#0047ff' }}>
              <h2 className="ag-h3">Clínicas dentales (página principal)</h2>
              <ul><li><a href="/clinicas-dentales"><span>España</span><small>Diseño web y marketing para clínicas dentales</small></a></li></ul>
            </div>
          </div>
        </section>
        <LeadSection fuente="web:diseno-web" title="¿No ves tu sector o tu ciudad?" lead="Trabajamos con negocios locales de toda España. Cuéntanos el tuyo y te enseñamos cómo quedaría tu web." />
      </main>
      <Footer />
    </div>
  );
}

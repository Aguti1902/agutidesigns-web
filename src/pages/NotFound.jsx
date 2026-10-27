import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';

export default function NotFound() {
  useSeo({ title: 'Página no encontrada | Agutidesigns', description: 'La página que buscas no existe. Vuelve al inicio de Agutidesigns.', path: '/404', noindex: true });
  return (
    <div className="ag">
      <Navbar />
      <main className="ag-hero" style={{ minHeight: '70vh' }}>
        <div className="ag-wrap" style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
          <p className="ag-kicker" style={{ margin: 0 }}>Error 404</p>
          <h1 className="ag-h1" style={{ maxWidth: '14ch' }}>Esta página no existe</h1>
          <p className="ag-lead">Puede que el enlace esté mal escrito o que la página se haya movido. Estas te pueden servir:</p>
          <div className="ag-actions">
            <a className="ag-btn ag-btn--primary" href="/">Ir al inicio</a>
            <a className="ag-btn ag-btn--ghost" href="/clinicas-dentales">Clínicas dentales</a>
            <a className="ag-btn ag-btn--ghost" href="/blog">Blog</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

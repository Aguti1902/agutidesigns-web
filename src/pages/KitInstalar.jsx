// Guía interactiva de instalación del Kit Oficina de IA, para volver a ella cuando quieras (enlace del correo de compra).
import { useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';
import GuiaInteractiva from '../components/kit/GuiaInteractiva';
import './OficinaIA.css';
import './KitOficina.css';

export default function KitInstalar() {
  useSeo({ title: 'Guía de instalación · Kit Oficina de IA | Agutidesigns', description: 'Instala tu Kit Oficina de IA con Claude, paso a paso.', path: '/kit-oficina-ia/instalar', noindex: true });
  const plan = useMemo(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('plan') : null) || 'pro', []);
  return (
    <div className="ag oi-page kt kt2">
      <Navbar minimal cta={{ label: 'Ayuda', href: 'mailto:info@agutidesigns.io' }} />
      <main className="kt2-instalar"><GuiaInteractiva planId={plan} /></main>
      <Footer />
    </div>
  );
}

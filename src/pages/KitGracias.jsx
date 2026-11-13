// Página tras pagar el kit: comprueba la compra con /api/kit-descarga y da el enlace de descarga.
import { useEffect, useState } from 'react';
import { Download, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';
import './KitOficina.css';

export default function KitGracias() {
  useSeo({ title: 'Gracias por tu compra · Kit Oficina de IA | Agutidesigns', description: 'Descarga tu Kit Oficina de IA.', path: '/kit-oficina-ia/gracias', noindex: true });
  const [estado, setEstado] = useState({ fase: 'cargando' });
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id');
    if (!id) { setEstado({ fase: 'error', msg: 'No encontramos tu compra en este enlace.' }); return; }
    let primera = true;
    try { primera = !sessionStorage.getItem(`kit-${id}`); sessionStorage.setItem(`kit-${id}`, '1'); } catch { /* sin almacenamiento */ }
    fetch(`/api/kit-descarga?session_id=${encodeURIComponent(id)}${primera ? '&enviar=1' : ''}`)
      .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'No pudimos comprobar tu compra.'); return j; })
      .then((j) => setEstado({ fase: 'ok', url: j.url, email: j.email }))
      .catch((e) => setEstado({ fase: 'error', msg: e.message }));
  }, []);
  return (
    <div className="ag oi-page kt">
      <Navbar minimal />
      <main className="kt-gracias">
        <div className="ag-wrap kt-gracias__in">
          {estado.fase === 'cargando' && <><Loader2 className="kt-spin" size={36} /><h1 className="kt-h1 kt-h1--s">Comprobando tu compra…</h1></>}
          {estado.fase === 'ok' && <>
            <p className="kt-k">Compra completada</p>
            <h1 className="kt-h1 kt-h1--s">¡Tu oficina de IA ya es tuya!</h1>
            <p className="kt-lead">Descarga el kit y abre primero <b>EMPIEZA-AQUI.md</b> y la guía en PDF. En unos 30-60 minutos lo tienes funcionando con Claude.</p>
            <a href={estado.url} className="ag-btn ag-btn--primary kt-comprar--grande"><Download size={18} /> Descargar el kit</a>
            {estado.email && <p className="kt-nota"><Mail size={15} /> También te lo hemos enviado a <b>{estado.email}</b>. El enlace caduca en 7 días: guárdalo en tu ordenador.</p>}
          </>}
          {estado.fase === 'error' && <>
            <h1 className="kt-h1 kt-h1--s">Algo no ha ido bien</h1>
            <p className="kt-lead">{estado.msg} Si has pagado, escríbenos a <b>info@agutidesigns.io</b> con el correo de la compra y te lo enviamos enseguida.</p>
          </>}
          <a href="/oficina-ia" className="kt-link">¿Prefieres que te la montemos a medida? <ArrowRight size={15} /></a>
        </div>
      </main>
      <Footer />
    </div>
  );
}

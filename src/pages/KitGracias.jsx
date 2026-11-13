// Página tras pagar el kit: comprueba la compra con /api/kit-descarga, da el enlace de descarga
// y debajo muestra la guía interactiva de instalación del plan comprado.
import { useEffect, useState } from 'react';
import { Download, Mail, Loader2, ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';
import GuiaInteractiva from '../components/kit/GuiaInteractiva';
import './OficinaIA.css';
import './KitOficina.css';

export default function KitGracias() {
  useSeo({ title: 'Gracias por tu compra · Kit Oficina de IA | Agutidesigns', description: 'Descarga tu Kit Oficina de IA y sigue la guía de instalación.', path: '/kit-oficina-ia/gracias', noindex: true });
  const [estado, setEstado] = useState({ fase: 'cargando' });
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id');
    if (!id) { setEstado({ fase: 'error', msg: 'No encontramos tu compra en este enlace.' }); return; }
    if (id === 'demo') { setEstado({ fase: 'ok', url: '#', email: 'tucorreo@ejemplo.com', plan: 'Pro', agentes: 8 }); return; } // vista previa sin compra (sin descarga real)
    let primera = true;
    try { primera = !sessionStorage.getItem(`kit-${id}`); sessionStorage.setItem(`kit-${id}`, '1'); } catch { /* sin almacenamiento */ }
    fetch(`/api/kit-descarga?session_id=${encodeURIComponent(id)}${primera ? '&enviar=1' : ''}`)
      .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'No pudimos comprobar tu compra.'); return j; })
      .then((j) => setEstado({ fase: 'ok', url: j.url, email: j.email, plan: j.plan, agentes: j.agentes }))
      .catch((e) => setEstado({ fase: 'error', msg: e.message }));
  }, []);
  return (
    <div className="ag oi-page kt kt2">
      <Navbar minimal cta={false} />
      <main>
        <header className="kt2-gracias">
          <div className="ag-wrap kt2-gracias__in">
            {estado.fase === 'cargando' && <><Loader2 className="kt-spin" size={36} /><h1 className="kt2-h2 kt2-h2--s">Comprobando tu compra…</h1></>}
            {estado.fase === 'ok' && <>
              <p className="kt2-k">Compra completada{estado.plan ? ` · Plan ${estado.plan} · ${estado.agentes} agentes` : ''}</p>
              <h1 className="kt2-h2">¡Tu oficina de IA<br /><span>ya es tuya!</span></h1>
              <p className="kt2-lead">Descarga el kit y sigue la guía de aquí abajo, paso a paso. En unos 30-60 minutos lo tienes funcionando con Claude.</p>
              <div className="ag-actions">
                <a href={estado.url} className="ag-btn ag-btn--primary kt2-brillo"><Download size={18} /> Descargar el kit</a>
                <a href="#guia" className="ag-btn oh-btn-ghost">Ver la guía <ChevronDown size={18} /></a>
              </div>
              {estado.email && <p className="kt2-nota"><Mail size={15} /><span>También te lo hemos enviado a <b>{estado.email}</b>, con el enlace a esta guía. La descarga caduca en 7 días: guarda el kit en tu ordenador.</span></p>}
            </>}
            {estado.fase === 'error' && <>
              <h1 className="kt2-h2 kt2-h2--s">Algo no ha ido bien</h1>
              <p className="kt2-lead">{estado.msg} Si has pagado, escríbenos a <b>info@agutidesigns.io</b> con el correo de la compra y te lo enviamos enseguida.</p>
            </>}
          </div>
        </header>
        {estado.fase === 'ok' && <div id="guia"><GuiaInteractiva planId={(estado.plan || 'pro').toLowerCase()} elegirPlan={false} /></div>}
      </main>
      <Footer />
    </div>
  );
}

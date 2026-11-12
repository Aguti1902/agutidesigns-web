import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';
import { SPA, VELA_IA } from '../data/casosIA';
import { useAparecer } from '../components/oficina/Animado';
import '../components/oficina/Animado.css';
import './CasoIA.css';

const OficinasCaso = lazy(() => import('../components/oficina/OficinasCasoLazy'));

/* Número que cuenta hasta su valor al aparecer en pantalla */
export function Cuenta({ v, pre = '', suf = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setN(v); return undefined; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const paso = (t) => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 4); setN(Math.round(v * ease)); if (k < 1) raf = requestAnimationFrame(paso); };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [v]);
  return <span ref={ref}>{pre}{n.toLocaleString('es-ES')}{suf}</span>;
}

function CasoIA({ caso }) {
  const raiz = useRef(null);
  useAparecer(raiz);
  useSeo({
    title: `Caso de éxito: ${caso.nombre} y su oficina de IA | Agutidesigns`,
    description: caso.resumen,
    path: `/casos/${caso.slug}`,
    image: '/img/og-casos.jpg',
  });
  const bloque = !!caso.oficinas;
  return (
    <div className="ag oi-page cs" ref={raiz}>
      <Navbar minimal cta={{ label: 'Quiero mi oficina de IA', href: '/oficina-ia#propuesta' }} />
      <main>
        <header className="cs-hero">
          <div className="ag-wrap cs-hero__in">
            <a className="cs-volver" href="/oficina-ia">Oficina de IA</a>
            <div className={`cs-logo ${caso.logoClaro ? '' : 'cs-logo--osc'}`}><img src={caso.logo} alt={caso.nombre} width="400" height="150" /></div>
            <p className="cs-k">Caso de éxito · {caso.sector}</p>
            <h1 className="cs-h1">{caso.titular}</h1>
            <div className="cs-cifras">
              <div className="cs-cifra"><b><Cuenta {...caso.cifra} /></b><span>{caso.cifra.l}</span></div>
              {caso.cifra2 && <div className="cs-cifra"><b><Cuenta {...caso.cifra2} /></b><span>{caso.cifra2.l}</span></div>}
            </div>
            <p className="cs-res">{caso.resumen}</p>
          </div>
        </header>

        <section className="ag-section cs-hist">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">La historia</h2><p className="ag-lead">De dónde venía {caso.nombre}, qué le montamos y qué ha cambiado.</p></div>
            <ol className="cs-linea">
              {caso.historia.map((h, i) => (
                <li key={h.k} className="cs-paso" style={{ '--i': i }}>
                  <span className="cs-paso__k">{h.k}</span>
                  <h3>{h.t}</h3>
                  <p>{h.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cs-ofi">
          <div className="ag-wrap">
            <div className="cs-ofi__head">
              <p className="cs-k">{bloque ? 'Su bloque de oficinas' : 'Su oficina de IA'}</p>
              <h2 className="cs-h2">{bloque ? 'Cuatro negocios, cuatro oficinas, un solo panel.' : `Así trabaja el equipo digital de ${caso.nombre}.`}</h2>
              <p>{bloque ? 'Cada negocio tiene su propia oficina con sus agentes. Toca cualquiera para entrar y verla por dentro.' : 'Cada agente tiene su mesa y su tarea. Gira la oficina y míralos trabajar.'}</p>
            </div>
            <Suspense fallback={<div className="oc-lienzo" />}><OficinasCaso caso={caso} /></Suspense>
            <p className="cs-nota">Representación ilustrativa de la oficina de IA. Los nombres de los agentes y sus mensajes son de ejemplo.</p>
          </div>
        </section>

        <section className="ag-section ag-section--white">
          <div className="ag-wrap">
            <div className="ag-head ag-head--split"><h2 className="ag-h2">Antes y después</h2><p className="ag-lead">Lo que cambió en el día a día del negocio.</p></div>
            <div className="cs-tabla ve-tabla" role="region" aria-label="Antes y después" tabIndex={0}>
              <table>
                <thead><tr><th scope="col"><span className="sr">Qué</span></th><th scope="col">Antes</th><th scope="col" className="yo">Con su oficina de IA</th></tr></thead>
                <tbody>{caso.filas.map((f) => <tr key={f.k}><th scope="row">{f.k}</th><td>{f.a}</td><td className="yo">{f.d}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="cs-web">Visita su web: <a href={caso.url} target="_blank" rel="noopener noreferrer">{caso.web} <ArrowUpRight size={15} /></a></p>
          </div>
        </section>

        <section className="cierre">
          <div className="ag-wrap cierre__in">
            <p className="cierre__k">Tu turno</p>
            <h2 className="cierre__h">¿Y si el próximo<br /><span>caso es el tuyo?</span></h2>
            <p className="cierre__p">Te enseñamos cómo funciona una oficina de IA y vemos qué agentes tendrían sentido en tu negocio. 30 minutos, sin compromiso.</p>
            <a href="/oficina-ia#propuesta" className="ag-btn ag-btn--primary cierre__btn">Pide una demo <ArrowRight size={18} /></a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function CasoSpaOrganic() { return <CasoIA caso={SPA} />; }
export function CasoVelaSegala() { return <CasoIA caso={VELA_IA} />; }

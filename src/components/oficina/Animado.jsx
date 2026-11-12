// Piezas animadas de la landing «Oficina de IA» (estilo presentación de producto):
// aparición al hacer scroll, frase que se ilumina palabra a palabra, tarjetas que se apilan,
// comparativa honesta y botón flotante. Todo respeta «reducir movimiento».
import { useEffect, useRef, useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

const reduce = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* Aparición al entrar en pantalla: marca solos los bloques de la página y los anima en cascada. */
export function useAparecer(raiz) {
  useEffect(() => {
    const r = raiz.current;
    if (!r || reduce() || !('IntersectionObserver' in window)) return undefined;
    const sel = ['.ag-head', '.ag-section article', '.sx-plan', '.ag-steps > *', '.ag-faq details', '.oi-real article', '.o3-grid', '.ve-col', '.ve-tabla', '.cierre > *', '.ag-lead-form', '.ag-section .ag-h2'];
    const els = [...r.querySelectorAll(sel.join(','))].filter((e) => !e.closest('.oh') && !e.closest('.no-stack'));
    els.forEach((e) => {
      e.classList.add('rv');
      const hermanos = [...(e.parentElement?.children || [])].filter((x) => x.classList.contains('rv'));
      e.style.setProperty('--rv-d', `${Math.min(hermanos.indexOf(e), 5) * 90}ms`);
    });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [raiz]);
}

/* Progreso de scroll (0→1) de un bloque alto con contenido «sticky». */
function useProgreso(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (reduce()) { setP(1); return undefined; }
    let raf = 0;
    const calc = () => { raf = 0; const b = el.getBoundingClientRect(); const total = b.height - window.innerHeight; setP(Math.max(0, Math.min(1, -b.top / Math.max(1, total)))); };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

/* Frase grande que se va encendiendo palabra a palabra mientras bajas. */
export function FraseScroll({ texto, destacadas = [] }) {
  const ref = useRef(null);
  const p = useProgreso(ref);
  const palabras = texto.split(' ');
  const encendidas = Math.round(p * 1.15 * palabras.length);
  return (
    <section ref={ref} className="fs" aria-label={texto}>
      <div className="fs-pega">
        <p className="fs-txt" aria-hidden="true">
          {palabras.map((w, i) => (
            <span key={i} className={`${i < encendidas ? 'on' : ''} ${destacadas.includes(w.replace(/[.,]/g, '')) ? 'dest' : ''}`}>{w} </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* «Ya, pero…»: cada objeción en una tarjeta que se apila sobre la anterior. */
export function RompeElNo({ items }) {
  const ref = useRef(null);
  useEffect(() => {
    const cont = ref.current;
    if (!cont || reduce()) return undefined;
    const cards = [...cont.querySelectorAll('.no-card')];
    let raf = 0;
    const calc = () => {
      raf = 0;
      cards.forEach((c, i) => {
        const sig = cards[i + 1];
        if (!sig) { c.style.setProperty('--k', 0); return; }
        const a = c.getBoundingClientRect(), b = sig.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, 1 - (b.top - a.top) / Math.max(1, a.height)));
        c.style.setProperty('--k', k.toFixed(3));
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="no" id="dudas">
      <div className="ag-wrap">
        <div className="no-head">
          <p className="no-kicker">Lo que nos dicen antes de empezar</p>
          <h2 className="no-h2">«Ya, pero…»</h2>
          <p className="no-lead">Todas las dudas son razonables. Aquí van las respuestas, con lo bueno y con lo que tienes que saber.</p>
        </div>
        <div className="no-stack" ref={ref}>
          {items.map((o, i) => (
            <article key={o.pero} className="no-card" style={{ '--i': i, top: `calc(96px + ${i * 12}px)` }}>
              <div className="no-card__in">
                <p className="no-card__n">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="no-card__pero">«{o.pero}»</h3>
                <p className="no-card__resp">{o.resp}</p>
                <div className="no-card__pc">
                  <p className="pc pc--si"><Check size={18} /><span><b>Ventaja</b>{o.si}</span></p>
                  <p className="pc pc--ojo"><span className="pc__ico" aria-hidden="true">!</span><span><b>Lo que tienes que saber</b>{o.ojo}</span></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Ventajas y desventajas sin letra pequeña + comparativa con las alternativas. */
export function Balanza({ ventajas, desventajas, tabla }) {
  return (
    <section className="ve ag-section" id="ventajas">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">Sin letra pequeña</h2>
          <p className="ag-lead">Una oficina de IA no es magia. Esto es lo que gana tu empresa y esto es lo que debes tener en cuenta antes de decir que sí.</p>
        </div>
        <div className="ve-cols">
          <div className="ve-col ve-col--si">
            <h3>Ventajas</h3>
            <ul>{ventajas.map((v) => <li key={v}><Check size={18} />{v}</li>)}</ul>
          </div>
          <div className="ve-col ve-col--no">
            <h3>Desventajas</h3>
            <ul>{desventajas.map((v) => <li key={v}><X size={18} />{v}</li>)}</ul>
          </div>
        </div>
        <div className="ve-tabla" role="region" aria-label="Comparativa" tabIndex={0}>
          <table>
            <thead><tr><th scope="col"><span className="sr">Qué comparamos</span></th>{tabla.cols.map((c, i) => <th key={c} scope="col" className={i === 0 ? 'yo' : ''}>{c}</th>)}</tr></thead>
            <tbody>
              {tabla.filas.map(([k, ...vals]) => (
                <tr key={k}><th scope="row">{k}</th>{vals.map((v, i) => <td key={i} className={i === 0 ? 'yo' : ''}>{v === true ? <Check size={18} className="ok" /> : v === false ? <X size={18} className="ko" /> : v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* Cierre oscuro: «¿Sigue siendo un no?» */
export function Cierre() {
  return (
    <section className="cierre">
      <div className="ag-wrap cierre__in">
        <p className="cierre__k">Última duda</p>
        <h2 className="cierre__h">¿Sigue siendo<br /><span>un no?</span></h2>
        <p className="cierre__p">Te enseñamos la oficina de Agutidesigns funcionando y vemos tu caso en 30 minutos. Si en tu empresa no tiene sentido, te lo diremos.</p>
        <a href="#propuesta" className="ag-btn ag-btn--primary cierre__btn">Pide una demo <ArrowRight size={18} /></a>
      </div>
    </section>
  );
}

/* Botón flotante que aparece al dejar atrás la cabecera. */
export function BotonFlotante() {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const on = () => {
      const lead = document.getElementById('propuesta');
      const enLead = lead && lead.getBoundingClientRect().top < window.innerHeight * 0.9;
      setVer(window.scrollY > window.innerHeight * 0.9 && !enLead);
    };
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <div className={`flota ${ver ? 'is-on' : ''}`} aria-hidden={!ver}>
      <span className="flota__t">Oficina de IA · desde 290 €/mes</span>
      <a href="#propuesta" className="ag-btn ag-btn--primary ag-btn--sm" tabIndex={ver ? 0 : -1}>Pide una demo</a>
    </div>
  );
}

/* La cabecera se aleja suavemente al bajar. */
export function useSalidaHero(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce()) return undefined;
    let raf = 0;
    const calc = () => { raf = 0; const h = el.offsetHeight || 1; const p = Math.max(0, Math.min(1, window.scrollY / h)); el.style.setProperty('--sal', p.toFixed(3)); };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc(); window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, [ref]);
}

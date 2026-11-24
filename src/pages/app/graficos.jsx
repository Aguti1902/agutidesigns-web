// Gráficas SVG ligeras del panel (sin librerías). Colores: los de cada departamento.
import { useEffect, useRef, useState } from 'react';
import { DEPTO } from '../../data/oficinaSaas';

const fDia = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function Sparkline({ datos, color = '#5b8cff', alto = 34 }) {
  const W = 120; const mx = Math.max(1, ...datos);
  const pts = datos.map((v, i) => `${(i / Math.max(1, datos.length - 1)) * W},${alto - 3 - (v / mx) * (alto - 6)}`).join(' ');
  return <svg className="gr-spark" viewBox={`0 0 ${W} ${alto}`} preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>;
}

// Barras apiladas por día y departamento, con detalle al pasar el ratón.
function useAncho(inicial) {
  const ref = useRef(null); const [w, setW] = useState(inicial);
  useEffect(() => { const el = ref.current; if (!el) return undefined; const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width)))); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w];
}

export function BarrasDia({ serie, deptos, alto = 220 }) {
  const [h, setH] = useState(null);
  const [ref, W] = useAncho(720); const pad = 26; const mx = Math.max(1, ...serie.map((s) => s.total));
  const paso = (W - pad) / serie.length; const ancho = Math.max(3, paso * 0.62);
  const marcas = [0, 0.5, 1].map((k) => Math.round(mx * k));
  const sel = h != null ? serie[h] : null;
  return (
    <div className="gr-barras" ref={ref}>
      <svg viewBox={`0 0 ${W} ${alto + 22}`} width={W} height={alto + 22} role="img" aria-label="Actividad por día" onMouseLeave={() => setH(null)}>
        {marcas.map((m) => { const y = alto - (m / mx) * (alto - 10); return <g key={m}><line x1={pad} x2={W} y1={y} y2={y} className="gr-rej" /><text x={0} y={y + 4} className="gr-eje">{m}</text></g>; })}
        {serie.map((s, i) => {
          let y = alto; const x = pad + i * paso + (paso - ancho) / 2;
          return (
            <g key={i} onMouseEnter={() => setH(i)} opacity={h == null || h === i ? 1 : 0.45}>
              <rect x={pad + i * paso} y={0} width={paso} height={alto} fill="transparent" />
              {deptos.map((d) => { const v = s[d] || 0; if (!v) return null; const hh = (v / mx) * (alto - 10); y -= hh; return <rect key={d} x={x} y={y} width={ancho} height={Math.max(0, hh - 1)} rx={Math.min(3, ancho / 3)} fill={DEPTO[d].color} />; })}
              {((i % Math.ceil(serie.length / (W < 500 ? 4 : 7)) === 0 && i < serie.length - Math.ceil(serie.length / (W < 500 ? 6 : 12))) || i === serie.length - 1) && <text x={i === serie.length - 1 ? x + ancho : x + ancho / 2} y={alto + 16} textAnchor={i === serie.length - 1 ? 'end' : 'middle'} className="gr-eje">{fDia(s.fecha)}</text>}
            </g>
          );
        })}
      </svg>
      {sel && (
        <div className="gr-tip"><b>{fDia(sel.fecha)} · {sel.total} tareas</b>
          {deptos.filter((d) => sel[d]).map((d) => <span key={d}><i style={{ background: DEPTO[d].color }} />{DEPTO[d].corto} {sel[d]}</span>)}
        </div>
      )}
    </div>
  );
}

export function Donut({ partes, centro, sub }) {
  const total = partes.reduce((a, p) => a + p.n, 0) || 1; const R = 52; const C = 2 * Math.PI * R;
  const offs = partes.map((_, i) => partes.slice(0, i).reduce((a, p) => a + (p.n / total) * C, 0));
  return (
    <div className="gr-donut">
      <svg viewBox="0 0 140 140" role="img" aria-label="Reparto por departamento">
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="16" />
        {partes.map((p, i) => { const l = (p.n / total) * C; return <circle key={p.depto} cx="70" cy="70" r={R} fill="none" stroke={DEPTO[p.depto].color} strokeWidth="16" strokeDasharray={`${Math.max(0, l - 2)} ${C}`} strokeDashoffset={-offs[i]} transform="rotate(-90 70 70)" />; })}
        <text x="70" y="68" textAnchor="middle" className="gr-donut__n">{centro}</text>
        <text x="70" y="86" textAnchor="middle" className="gr-donut__s">{sub}</text>
      </svg>
      <ul>{partes.map((p) => <li key={p.depto}><i style={{ background: DEPTO[p.depto].color }} />{DEPTO[p.depto].corto}<b>{Math.round((p.n / total) * 100)} %</b></li>)}</ul>
    </div>
  );
}

// Mapa de calor: cuándo te escriben tus clientes (día de la semana × hora).
export function Calor({ calor }) {
  const mx = Math.max(1, ...calor.flat()); const horas = Array.from({ length: 17 }, (_, i) => i + 7);
  return (
    <div className="gr-calor" role="img" aria-label="Mapa de calor de mensajes por día y hora">
      <span />{horas.map((h) => <span key={h} className="gr-calor__h">{h % 3 === 0 ? h : ''}</span>)}
      {calor.map((fila, d) => [<span key={`d${d}`} className="gr-calor__d">{DIAS[d]}</span>, ...horas.map((h) => {
        const v = fila[h]; return <span key={`${d}-${h}`} className="gr-calor__c" title={`${DIAS[d]} ${h}:00 · ${v} mensajes`} style={{ '--a': v / mx }} />;
      })])}
    </div>
  );
}

export function Medidor({ valor, max = 1, color = '#5b8cff' }) {
  return <span className="gr-medidor"><b style={{ width: `${Math.min(100, (valor / max) * 100)}%`, background: color }} /></span>;
}

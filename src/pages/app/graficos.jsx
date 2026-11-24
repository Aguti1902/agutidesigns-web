// Gráficas SVG ligeras del panel (sin librerías). Colores: los de cada departamento; el resto sale de las variables CSS.
import { useEffect, useRef, useState } from 'react';
import { DEPTO } from '../../data/oficinaSaas';

const fDia = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function useAncho(inicial) {
  const ref = useRef(null); const [w, setW] = useState(inicial);
  useEffect(() => { const el = ref.current; if (!el) return undefined; const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width)))); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w];
}

export function Sparkline({ datos, color = 'var(--acento)', alto = 28 }) {
  const W = 96; const mx = Math.max(1, ...datos);
  const pts = datos.map((v, i) => `${(i / Math.max(1, datos.length - 1)) * W},${alto - 3 - (v / mx) * (alto - 6)}`).join(' ');
  return <svg className="g-spark" viewBox={`0 0 ${W} ${alto}`} preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></svg>;
}

// Barras apiladas por día y departamento, con detalle al pasar el ratón o tocar.
export function BarrasDia({ serie, deptos, alto = 200 }) {
  const [h, setH] = useState(null); const [ref, W] = useAncho(700);
  const pad = 28; const mx = Math.max(4, ...serie.map((s) => s.total));
  const paso = (W - pad) / serie.length; const ancho = Math.max(3, Math.min(26, paso * 0.6));
  const sel = h != null ? serie[h] : null; const salto = Math.ceil(serie.length / (W < 500 ? 4 : 7));
  return (
    <div className="g-barras" ref={ref}>
      <svg width={W} height={alto + 22} viewBox={`0 0 ${W} ${alto + 22}`} role="img" aria-label="Tareas por día" onMouseLeave={() => setH(null)}>
        {[0, 0.5, 1].map((k) => { const y = alto - k * (alto - 8); return <g key={k}><line x1={pad} x2={W} y1={y} y2={y} className="g-rej" /><text x={0} y={y + 4} className="g-eje">{Math.round(mx * k)}</text></g>; })}
        {serie.map((s, i) => {
          let y = alto; const x = pad + i * paso + (paso - ancho) / 2;
          return (
            <g key={i} onMouseEnter={() => setH(i)} onClick={() => setH(i)} opacity={h == null || h === i ? 1 : 0.4}>
              <rect x={pad + i * paso} y={0} width={paso} height={alto} fill="transparent" />
              {deptos.map((d) => { const v = s[d] || 0; if (!v) return null; const hh = (v / mx) * (alto - 8); y -= hh; return <rect key={d} x={x} y={y} width={ancho} height={Math.max(0, hh - 1.5)} rx={Math.min(3, ancho / 3)} fill={DEPTO[d].color} />; })}
              {((i % salto === 0 && i < serie.length - salto / 1.5) || i === serie.length - 1) && <text x={i === serie.length - 1 ? x + ancho : x + ancho / 2} y={alto + 17} textAnchor={i === serie.length - 1 ? 'end' : 'middle'} className="g-eje">{i === serie.length - 1 ? 'Hoy' : fDia(s.fecha)}</text>}
            </g>
          );
        })}
      </svg>
      {sel && <div className="g-tip"><b>{fDia(sel.fecha)} · {sel.total} tareas</b>{deptos.filter((d) => sel[d]).map((d) => <span key={d}><i style={{ background: DEPTO[d].color }} />{DEPTO[d].corto} {sel[d]}</span>)}</div>}
    </div>
  );
}

export function Donut({ partes, centro, sub }) {
  const total = partes.reduce((a, p) => a + p.n, 0) || 1; const R = 52; const C = 2 * Math.PI * R;
  const offs = partes.map((_, i) => partes.slice(0, i).reduce((a, p) => a + (p.n / total) * C, 0));
  return (
    <div className="g-donut">
      <svg viewBox="0 0 140 140" role="img" aria-label="Reparto por departamento">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--suave)" strokeWidth="14" />
        {partes.map((p, i) => { const l = (p.n / total) * C; return <circle key={p.depto} cx="70" cy="70" r={R} fill="none" stroke={DEPTO[p.depto].color} strokeWidth="14" strokeDasharray={`${Math.max(0, l - 2)} ${C}`} strokeDashoffset={-offs[i]} transform="rotate(-90 70 70)" />; })}
        <text x="70" y="69" textAnchor="middle" className="g-donut__n">{centro}</text>
        <text x="70" y="86" textAnchor="middle" className="g-donut__s">{sub}</text>
      </svg>
      <ul>{partes.map((p) => <li key={p.depto}><i style={{ background: DEPTO[p.depto].color }} />{DEPTO[p.depto].corto}<b>{Math.round((p.n / total) * 100)} %</b></li>)}</ul>
    </div>
  );
}

// Mapa de calor: cuándo escriben los clientes (día de la semana × hora).
export function Calor({ calor }) {
  const mx = Math.max(1, ...calor.flat()); const horas = Array.from({ length: 17 }, (_, i) => i + 7);
  return (
    <div className="g-calor" role="img" aria-label="Mensajes por día y hora">
      <span />{horas.map((h) => <span key={h} className="g-calor__h">{h % 3 === 0 ? `${h}h` : ''}</span>)}
      {calor.map((fila, d) => [<span key={`d${d}`} className="g-calor__d">{DIAS[d]}</span>, ...horas.map((h) => <span key={`${d}-${h}`} className="g-calor__c" title={`${DIAS[d]} ${h}:00 · ${fila[h]} mensajes`} style={{ '--a': fila[h] / mx }} />)])}
    </div>
  );
}

export function Medidor({ valor, max = 1, color = 'var(--acento)' }) {
  return <span className="g-medidor" role="meter" aria-valuenow={Math.round((valor / (max || 1)) * 100)} aria-valuemin={0} aria-valuemax={100}><b style={{ width: `${Math.min(100, (valor / (max || 1)) * 100)}%`, background: color }} /></span>;
}

// Línea con área (series diarias: visitas, alcance, seguidores…), con detalle al pasar el ratón.
export function Linea({ datos, color = 'var(--acento)', alto = 190, formato = (v) => v.toLocaleString('es-ES') }) {
  const [h, setH] = useState(null); const [ref, W] = useAncho(700);
  if (!datos?.length) return null;
  const pad = 34; const vals = datos.map((d) => d.valor); const mx = Math.max(1, ...vals); const mn = Math.min(...vals) * (Math.min(...vals) > mx * 0.6 ? 0.92 : 0);
  const x = (i) => pad + (i / Math.max(1, datos.length - 1)) * (W - pad - 6); const y = (v) => 8 + (1 - (v - mn) / Math.max(1, mx - mn)) * (alto - 16);
  const pts = datos.map((d, i) => `${x(i)},${y(d.valor)}`).join(' ');
  const id = `gl${Math.round(mx)}${datos.length}`;
  return (
    <div className="g-barras" ref={ref}>
      <svg width={W} height={alto + 22} viewBox={`0 0 ${W} ${alto + 22}`} role="img" aria-label="Evolución" onMouseLeave={() => setH(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.round(((e.clientX - r.left - pad) / (W - pad - 6)) * (datos.length - 1)); setH(Math.max(0, Math.min(datos.length - 1, i))); }}>
        <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".22" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, 0.5, 1].map((k) => { const v = mn + (mx - mn) * k; return <g key={k}><line x1={pad} x2={W} y1={y(v)} y2={y(v)} className="g-rej" /><text x={0} y={y(v) + 4} className="g-eje">{Math.round(v).toLocaleString('es-ES')}</text></g>; })}
        <polygon points={`${x(0)},${alto} ${pts} ${x(datos.length - 1)},${alto}`} fill={`url(#${id})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {h != null && <g><line x1={x(h)} x2={x(h)} y1={4} y2={alto} className="g-rej" /><circle cx={x(h)} cy={y(datos[h].valor)} r="5" fill={color} stroke="#fff" strokeWidth="2" /></g>}
        {[0, Math.floor(datos.length / 2), datos.length - 1].map((i) => <text key={i} x={x(i)} y={alto + 17} textAnchor={i === 0 ? 'start' : i === datos.length - 1 ? 'end' : 'middle'} className="g-eje">{fDia(new Date(datos[i].fecha))}</text>)}
      </svg>
      {h != null && <div className="g-tip"><b>{fDia(new Date(datos[h].fecha))}</b><span>{formato(datos[h].valor)}</span></div>}
    </div>
  );
}

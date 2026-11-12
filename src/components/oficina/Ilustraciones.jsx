// Ilustraciones animadas (SVG + CSS) y secciones visuales de la landing «Oficina de IA».
// Todas son escenas ilustrativas: no muestran datos reales de ningún cliente.
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useProgreso } from './Animado';

const B = '#0047FF', INK = '#0b1433', LIME = '#e5fc63', SOFT = '#e8eeff', LINE = '#dfe4f2';

/* ---------- Escenas de cada agente (viewBox 320×200) ---------- */
export function IlVentas() {
  return (
    <svg viewBox="0 0 320 200" className="il il-ventas" aria-hidden="true">
      <rect x="60" y="26" width="200" height="150" rx="16" fill="#fff" stroke={LINE} />
      <rect x="60" y="26" width="200" height="30" rx="16" fill={SOFT} /><rect x="60" y="42" width="200" height="14" fill={SOFT} />
      <circle cx="78" cy="41" r="4" fill={B} /><rect x="90" y="37" width="70" height="8" rx="4" fill="#b9c6ec" />
      <g className="il-sobre"><rect x="80" y="70" width="120" height="34" rx="10" fill="#fff" stroke={LINE} /><path d="M92 79l14 10 14-10" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="130" y="80" width="56" height="6" rx="3" fill="#c9d2ea" /><rect x="130" y="91" width="38" height="6" rx="3" fill="#e1e6f4" /></g>
      <g className="il-resp"><rect x="118" y="116" width="126" height="40" rx="14" fill={B} /><path d="M232 156l8 10-1-10z" fill={B} /><rect x="132" y="128" width="72" height="6" rx="3" fill="#fff" opacity=".9" /><rect x="132" y="139" width="48" height="6" rx="3" fill="#fff" opacity=".6" /><circle cx="226" cy="136" r="8" fill={LIME} /><path d="M222 136l3 3 5-6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" /></g>
      <g className="il-escribe"><circle cx="128" cy="136" r="3" fill={B} /><circle cx="138" cy="136" r="3" fill={B} /><circle cx="148" cy="136" r="3" fill={B} /></g>
    </svg>
  );
}
export function IlVideos() {
  return (
    <svg viewBox="0 0 320 200" className="il il-videos" aria-hidden="true">
      <defs><linearGradient id="ilv-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={B} /><stop offset="1" stopColor="#7aa0ff" /></linearGradient></defs>
      <rect x="112" y="14" width="96" height="172" rx="18" fill={INK} />
      <rect x="118" y="22" width="84" height="156" rx="13" fill="url(#ilv-g)" />
      <circle className="il-sol" cx="176" cy="62" r="12" fill={LIME} />
      <path d="M118 140l26-30 22 22 14-12 22 20v38h-84z" fill="#0b1f6e" opacity=".55" />
      <path d="M152 84l20 12-20 12z" fill="#fff" className="il-play" />
      <rect x="126" y="166" width="68" height="4" rx="2" fill="#ffffff55" /><rect className="il-barra" x="126" y="166" width="68" height="4" rx="2" fill="#fff" />
      {[['#ff6b8b', 0], ['#111', 1], ['#ff3b30', 2], ['#0a66c2', 3]].map(([c, i]) => (
        <g key={i} transform={`translate(${236} ${44 + i * 36})`}><g className="il-red" style={{ '--i': i }}><circle r="13" fill={c} /><path d="M-5 0l3.5 3.5 6.5-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></g></g>
      ))}
      <g className="il-cal"><rect x="40" y="70" width="56" height="60" rx="10" fill="#fff" stroke={LINE} /><rect x="40" y="70" width="56" height="16" rx="8" fill={B} /><rect x="40" y="78" width="56" height="8" fill={B} /><text x="68" y="116" textAnchor="middle" fontFamily="Inter,Arial" fontWeight="800" fontSize="22" fill={INK}>3</text></g>
    </svg>
  );
}
export function IlContenido() {
  return (
    <svg viewBox="0 0 320 200" className="il il-contenido" aria-hidden="true">
      <rect x="70" y="18" width="180" height="168" rx="14" fill="#fff" stroke={LINE} />
      <rect x="88" y="36" width="96" height="12" rx="6" fill={INK} />
      <rect x="88" y="58" width="144" height="46" rx="8" fill={SOFT} /><circle cx="112" cy="81" r="10" fill={LIME} /><path d="M126 100l22-24 18 18 12-10 26 20" fill="none" stroke={B} strokeWidth="3" strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => <rect key={i} className="il-linea" style={{ '--i': i }} x="88" y={116 + i * 14} width={[144, 130, 140, 84][i]} height="7" rx="3.5" fill="#c9d2ea" />)}
      <rect className="il-cursor" x="176" y="157" width="2.5" height="11" fill={B} />
      <g className="il-pub"><rect x="196" y="14" width="96" height="30" rx="15" fill={B} /><circle cx="214" cy="29" r="7" fill={LIME} /><path d="M210.5 29l2.5 2.5 4.5-5" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" /><rect x="228" y="25" width="50" height="7" rx="3.5" fill="#fff" /></g>
    </svg>
  );
}
export function IlGoogle() {
  return (
    <svg viewBox="0 0 320 200" className="il il-google" aria-hidden="true">
      <rect x="20" y="20" width="280" height="160" rx="16" fill="#eef2fb" />
      <path d="M20 120c60-20 90 20 150 0s90-30 130-10" fill="none" stroke="#fff" strokeWidth="14" />
      <path d="M110 20v160M220 20v160" stroke="#fff" strokeWidth="8" />
      <rect x="40" y="40" width="50" height="36" rx="6" fill="#dbe4f7" /><rect x="236" y="130" width="46" height="34" rx="6" fill="#dbe4f7" />
      <circle className="il-onda" cx="160" cy="112" r="10" fill="none" stroke={B} strokeWidth="2" />
      <g className="il-pin"><path d="M160 112c-14-18-22-28-22-40a22 22 0 0 1 44 0c0 12-8 22-22 40z" fill={B} /><circle cx="160" cy="72" r="8" fill="#fff" /></g>
      <g className="il-post"><rect x="196" y="36" width="96" height="58" rx="10" fill="#fff" stroke={LINE} /><rect x="206" y="46" width="34" height="38" rx="6" fill={SOFT} /><circle cx="223" cy="60" r="6" fill={LIME} /><rect x="248" y="50" width="34" height="6" rx="3" fill={INK} /><rect x="248" y="62" width="30" height="5" rx="2.5" fill="#c9d2ea" /><rect x="248" y="72" width="22" height="5" rx="2.5" fill="#c9d2ea" /></g>
    </svg>
  );
}
export function IlClientes() {
  return (
    <svg viewBox="0 0 320 200" className="il il-clientes" aria-hidden="true">
      <g className="il-b il-b1"><rect x="40" y="24" width="150" height="38" rx="16" fill="#fff" stroke={LINE} /><rect x="56" y="36" width="92" height="6" rx="3" fill="#b9c3dd" /><rect x="56" y="47" width="60" height="6" rx="3" fill="#d6dcec" /></g>
      <g className="il-b il-b2"><rect x="128" y="74" width="152" height="40" rx="16" fill={B} /><rect x="144" y="87" width="100" height="6" rx="3" fill="#fff" opacity=".9" /><rect x="144" y="98" width="64" height="6" rx="3" fill="#fff" opacity=".6" /></g>
      <g className="il-b il-b3"><rect x="40" y="126" width="120" height="34" rx="16" fill="#fff" stroke={LINE} /><rect x="56" y="139" width="70" height="6" rx="3" fill="#b9c3dd" /></g>
      <g className="il-b il-b4"><rect x="178" y="130" width="102" height="44" rx="12" fill={LIME} /><rect x="190" y="142" width="54" height="6" rx="3" fill={INK} /><rect x="190" y="154" width="72" height="5" rx="2.5" fill={INK} opacity=".45" /><path d="M262 143l3 3 6-7" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" /></g>
    </svg>
  );
}
export function IlAnuncios() {
  return (
    <svg viewBox="0 0 320 200" className="il il-anuncios" aria-hidden="true">
      <rect x="30" y="20" width="260" height="160" rx="16" fill="#fff" stroke={LINE} />
      <line x1="50" y1="64" x2="270" y2="64" stroke="#d4533f" strokeWidth="2" strokeDasharray="6 6" />
      <rect x="226" y="50" width="44" height="18" rx="9" fill="#fde5e1" /><text x="248" y="63" textAnchor="middle" fontFamily="Inter,Arial" fontWeight="700" fontSize="10" fill="#c2412d">TOPE</text>
      {[60, 92, 74, 100, 82, 96].map((h, i) => <rect key={i} className="il-barra2" style={{ '--i': i, '--h': h }} x={56 + i * 36} y={160 - h} width="22" height={h} rx="6" fill={i === 3 ? B : '#b9c9f5'} />)}
      <line x1="50" y1="160" x2="270" y2="160" stroke={LINE} strokeWidth="2" />
    </svg>
  );
}
const ILUS = [IlVentas, IlVideos, IlContenido, IlGoogle, IlClientes, IlAnuncios];

/* ---------- Agentes con su escena ---------- */
export function AgentesIlustrados({ id, title, lead, items, children }) {
  return (
    <section className="ag-section ag-section--white ai" id={id}>
      <div className="ag-wrap">
        <div className="ag-head ag-head--split"><h2 className="ag-h2">{title}</h2><p className="ag-lead">{lead}</p></div>
        <div className="ai-grid">
          {items.map((it, i) => { const Il = ILUS[i % ILUS.length]; return (
            <article key={it.t} className="ai-card">
              <div className="ai-card__il"><Il /></div>
              <div className="ai-card__tx"><span className="ai-card__ico"><it.Icon size={18} /></span><h3 className="ag-h3">{it.t}</h3><p>{it.d}</p></div>
            </article>
          ); })}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ---------- Cinta de tareas en movimiento ---------- */
export function Cinta({ filas }) {
  return (
    <div className="cinta" aria-hidden="true">
      {filas.map((f, n) => (
        <div key={n} className={`cinta__fila ${n % 2 ? 'cinta__fila--inv' : ''}`}>
          {[0, 1].map((k) => <div key={k} className="cinta__set">{f.map((t) => <span key={t} className="cinta__chip"><i />{t}</span>)}</div>)}
        </div>
      ))}
    </div>
  );
}

/* ---------- El panel que se levanta al hacer scroll: estadísticas animadas ---------- */
const FEED = [
  ['Ventas', 'Ha contestado a una petición de presupuesto', B],
  ['Contenido', 'Artículo del blog listo para revisar', '#0a8f5a'],
  ['Vídeos', 'Vídeos de mañana programados', '#e2553f'],
  ['Google Business', 'Publicación nueva en la ficha', '#c98a00'],
  ['Clientes', 'Ha respondido una duda y anotado un cambio', '#8a6bff'],
  ['Publicidad', 'Campañas revisadas dentro del tope', '#1a9bb0'],
];
const SEMANA = [38, 52, 47, 66, 74, 61, 88];
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const REPARTO = [['Ventas', 34, '#3d7bff'], ['Contenido', 22, '#3ee0a1'], ['Vídeos', 18, '#ff7a68'], ['Clientes', 14, '#b48cff'], ['Google', 12, '#ffc65c']];
const AG_ESTADO = [['Ventas', 'Trabajando', 82, '#3d7bff'], ['Vídeos', 'Trabajando', 64, '#ff7a68'], ['Contenido', 'En cola', 40, '#3ee0a1'], ['Clientes', 'Trabajando', 71, '#b48cff']];

function usaVisible(ref) {
  const [v, setV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return undefined; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold: 0.25 }); io.observe(el); return () => io.disconnect(); }, [ref]);
  return v;
}
function Contador({ v, on, suf = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => { if (!on) return undefined; let raf = 0; const t0 = performance.now(); const paso = (t) => { const k = Math.min(1, (t - t0) / 1500); setN(Math.round(v * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(paso); }; raf = requestAnimationFrame(paso); return () => cancelAnimationFrame(raf); }, [on, v]);
  return <>{n.toLocaleString('es-ES')}{suf}</>;
}
export function PanelEnVivo() {
  const ref = useRef(null), disp = useRef(null);
  const p = useProgreso(ref);
  const on = usaVisible(disp);
  const [n, setN] = useState(3);
  useEffect(() => { const id = setInterval(() => setN((x) => x + 1), 2400); return () => clearInterval(id); }, []);
  const vis = Array.from({ length: 4 }, (_, k) => FEED[(n - k + FEED.length * 10) % FEED.length]);
  const e = Math.min(1, p * 1.6);
  // gráfica de área
  const W = 520, H = 170, mx = Math.max(...SEMANA) * 1.15;
  const pts = SEMANA.map((v, i) => [12 + (i * (W - 24)) / (SEMANA.length - 1), H - 14 - (v / mx) * (H - 34)]);
  const linea = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${linea} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`;
  // donut
  let acc = 0; const R = 54, C = 2 * Math.PI * R;
  return (
    <section ref={ref} className="pv">
      <div className="pv-pega">
        <div className="ag-wrap pv-in">
          <div className="pv-head">
            <p className="pv-k">Tu panel</p>
            <h2 className="pv-h">Todo lo que hacen,<br /><span>en una sola pantalla.</span></h2>
          </div>
          <div ref={disp} className={`pv-disp ${on ? 'is-on' : ''}`} style={{ transform: `perspective(1400px) rotateX(${(1 - e) * 30}deg) scale(${0.86 + e * 0.14}) translateY(${(1 - e) * 40}px)`, opacity: 0.35 + e * 0.65 }}>
            <div className="pv-bar"><i /><i /><i /><b>Panel de la oficina</b><span className="pv-tabs"><em className="on">Hoy</em><em>Semana</em><em>Mes</em></span><span className="pv-live">En marcha</span></div>
            <div className="pv-dash">
              <div className="pv-kpis">
                {[['Tareas hechas esta semana', 426, '', '+18 %', '#3d7bff'], ['Respuestas a clientes', 128, '', '+24 %', '#3ee0a1'], ['Contenidos publicados', 21, '', '+3', '#ff7a68'], ['Horas que te ahorra', 37, ' h', 'esta semana', '#e5fc63']].map(([k, v, suf, d, c], i) => (
                  <div key={k} className="pv-kpi" style={{ '--c': c, '--i': i }}>
                    <span>{k}</span>
                    <b><Contador v={v} on={on} suf={suf} /></b>
                    <small>{d}</small>
                    <svg viewBox="0 0 100 26" className="pv-spark" aria-hidden="true"><polyline points={[0, 18, 14, 20, 28, 12, 42, 15, 56, 8, 70, 11, 84, 4, 100, 6].join(',')} fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" /></svg>
                  </div>
                ))}
              </div>
              <div className="pv-graf">
                <div className="pv-card pv-card--area">
                  <div className="pv-card__h"><b>Actividad de la semana</b><span>tareas al día</span></div>
                  <svg viewBox={`0 0 ${W} ${H}`} className="pv-area" aria-hidden="true">
                    <defs><linearGradient id="pv-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d7bff" stopOpacity=".55" /><stop offset="1" stopColor="#3d7bff" stopOpacity="0" /></linearGradient></defs>
                    {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#1d2a5e" strokeDasharray="3 5" />)}
                    <path d={area} fill="url(#pv-g)" className="pv-area__fill" />
                    <path d={linea} fill="none" stroke="#7aa0ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="pv-area__line" pathLength="1" />
                    {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 6 : 3.5} fill={i === pts.length - 1 ? '#e5fc63' : '#7aa0ff'} className="pv-area__pt" style={{ '--i': i }} />)}
                  </svg>
                  <div className="pv-dias">{DIAS.map((d) => <span key={d}>{d}</span>)}</div>
                </div>
                <div className="pv-card pv-card--donut">
                  <div className="pv-card__h"><b>Trabajo por agente</b></div>
                  <div className="pv-donut">
                    <svg viewBox="0 0 140 140" aria-hidden="true">
                      <circle cx="70" cy="70" r={R} fill="none" stroke="#16224f" strokeWidth="16" />
                      {REPARTO.map(([k, v, c], i) => { const len = (v / 100) * C, off = acc; acc += len; return <circle key={k} cx="70" cy="70" r={R} fill="none" stroke={c} strokeWidth="16" strokeDasharray={`${on ? len - 2 : 0} ${C}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" style={{ transition: `stroke-dasharray 1.2s cubic-bezier(.2,.8,.2,1) ${0.2 + i * 0.15}s` }} />; })}
                      <text x="70" y="66" textAnchor="middle" className="pv-donut__n">6</text>
                      <text x="70" y="86" textAnchor="middle" className="pv-donut__l">agentes</text>
                    </svg>
                    <ul>{REPARTO.map(([k, v, c]) => <li key={k}><i style={{ background: c }} />{k}<b>{v} %</b></li>)}</ul>
                  </div>
                </div>
              </div>
              <div className="pv-bajo">
                <div className="pv-card">
                  <div className="pv-card__h"><b>Agentes ahora</b><span>4 de 6 trabajando</span></div>
                  <ul className="pv-est">
                    {AG_ESTADO.map(([a, st, v, c], i) => <li key={a}><span className="pv-est__a"><i style={{ background: c }} />{a}</span><span className="pv-est__b"><span style={{ width: on ? `${v}%` : 0, background: c, transitionDelay: `${0.3 + i * 0.12}s` }} /></span><em className={st === 'Trabajando' ? 'w' : ''}>{st}</em></li>)}
                  </ul>
                </div>
                <div className="pv-card">
                  <div className="pv-card__h"><b>Lo último</b><span>en directo</span></div>
                  <ul className="pv-feed">
                    {vis.map(([a, t, c], k) => (
                      <li key={`${n}-${k}`} className={k === 0 ? 'nuevo' : ''}><span className="pv-dot" style={{ background: c }} /><span className="pv-a">{a}</span><span className="pv-t">{t}</span><span className="pv-ok"><Check size={13} /></span></li>
                    ))}
                  </ul>
                  <div className="pv-apr"><span>¿Publicamos el artículo de hoy?</span><span className="pv-btns"><em>Revisar</em><b>Aprobar</b></span></div>
                </div>
              </div>
            </div>
          </div>
          <p className="pv-nota">Ilustración del panel con datos de ejemplo. Cada empresa tiene el suyo, con sus agentes.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Un día en tu oficina (desplazamiento horizontal) ---------- */
const DIA = [
  { h: 'Por la mañana', t: 'El blog y LinkedIn, escritos', d: 'El agente de contenido escribe el artículo y el post del día con tu tono.', Il: IlContenido },
  { h: 'Entra un presupuesto', t: 'Respuesta sin esperas', d: 'El agente de ventas contesta, resuelve dudas y propone una llamada en tu agenda.', Il: IlVentas },
  { h: 'A mediodía', t: 'Los vídeos de mañana, listos', d: 'Guion, voz, animación y portada, programados en cada red.', Il: IlVideos },
  { h: 'Por la tarde', t: 'Tus clientes, atendidos', d: 'Responde lo de siempre y anota lo que piden para que nada se pierda.', Il: IlClientes },
  { h: 'Al acabar el día', t: 'Tú solo apruebas', d: 'Abres el panel, miras lo que han hecho y das el OK a lo que querías revisar.', Il: IlGoogle },
];
export function DiaEnLaOficina() {
  const ref = useRef(null), pista = useRef(null);
  const p = useProgreso(ref);
  const [dx, setDx] = useState(0);
  useEffect(() => {
    const calc = () => { const el = pista.current; if (el) setDx(Math.max(0, el.scrollWidth - window.innerWidth + 32)); };
    calc(); window.addEventListener('resize', calc); return () => window.removeEventListener('resize', calc);
  }, []);
  return (
    <section ref={ref} className="dia" style={{ height: `calc(100vh + ${dx}px)` }}>
      <div className="dia-pega">
        <div className="ag-wrap dia-head">
          <p className="pv-k">Un día cualquiera</p>
          <h2 className="dia-h">Así trabaja tu oficina<br /><span>mientras tú haces lo tuyo.</span></h2>
        </div>
        <div className="dia-pista" ref={pista} style={{ transform: `translate3d(${-p * dx}px,0,0)` }}>
          {DIA.map(({ h, t, d, Il }, i) => (
            <article key={h} className="dia-card" style={{ '--i': i }}>
              <div className="dia-card__il"><Il /></div>
              <p className="dia-card__h"><span>{String(i + 1).padStart(2, '0')}</span>{h}</p>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
        <div className="dia-prog"><span style={{ transform: `scaleX(${p})` }} /></div>
      </div>
    </section>
  );
}

/* ---------- Vídeo comercial: crece al hacer scroll y se reproduce al verse ---------- */
export function VideoComercial() {
  const ref = useRef(null), vid = useRef(null);
  const p = useProgreso(ref);
  const [mudo, setMudo] = useState(true);
  const sonido = () => { const v = vid.current; if (!v) return; v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play?.().catch(() => {}); } setMudo(v.muted); };
  useEffect(() => {
    const v = vid.current; if (!v) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play?.().catch(() => {}); else v.pause?.(); }, { threshold: 0.35 });
    io.observe(v); return () => io.disconnect();
  }, []);
  const e = Math.min(1, p * 1.8);
  return (
    <section ref={ref} className="vc" id="video">
      <div className="vc-pega">
        <div className="ag-wrap vc-in">
          <div className="vc-head">
            <p className="pv-k">En 40 segundos</p>
            <h2 className="pv-h">Mira tu oficina de IA<br /><span>funcionando.</span></h2>
          </div>
          <div className="vc-marco" style={{ transform: `scale(${0.78 + e * 0.22})`, borderRadius: `${36 - e * 12}px` }}>
            <video ref={vid} src="/video/oficina-ia.mp4" poster="/video/oficina-ia-poster.jpg" muted loop playsInline controls preload="metadata" aria-label="Vídeo: qué es una oficina de IA y casos de éxito" onVolumeChange={(e) => setMudo(e.currentTarget.muted)} />
            {mudo && <button type="button" className="vc-sonido" onClick={sonido}><span aria-hidden="true">🔊</span> Activar sonido</button>}
          </div>
        </div>
      </div>
    </section>
  );
}

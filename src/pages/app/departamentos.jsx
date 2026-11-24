// Piezas comunes de las secciones de departamento: cabecera (estado en directo, cupo y resultados del mes),
// «Cómo trabaja» (ajustes propios que usa el agente) y el reproductor de vídeos de ayuda.
import { useEffect, useRef, useState } from 'react';
import { Check, PlayCircle, SlidersHorizontal, X } from 'lucide-react';
import { DEPTO, AVISO_CUPO } from '../../data/oficinaSaas';
import { AJUSTES, COMUNES, ajustesDe } from '../../data/oficinaAjustes';
import { MINUTOS_TAREA, pendiente, guardarAjustes } from './datos';
import { Medidor } from './graficos';
import { Avatar, Puntos } from './ui';
import { estadoDe, fmt, duracion } from './formato';
import { VIDEOS } from './videos';

function Campo({ c, v, cambiar, guardarTexto }) {
  if (c.tipo === 'sw') {
    return (
      <label className="sw"><input type="checkbox" checked={!!v} onChange={(e) => cambiar(c.k, e.target.checked)} /><span />
        <div><b>{c.l}</b>{c.ayuda && <small>{c.ayuda}</small>}</div></label>
    );
  }
  return (
    <div className="aj-campo">
      <span className="aj-campo__l">{c.l}</span>
      {c.tipo === 'sel' && <div className="seg seg--wrap" role="group" aria-label={c.l}>{c.ops.map(([k, t]) => <button type="button" key={k} aria-pressed={String(v) === k} onClick={() => cambiar(c.k, k)}>{t}</button>)}</div>}
      {c.tipo === 'multi' && <div className="chips" role="group" aria-label={c.l}>{c.ops.map(([k, t]) => { const on = (v || []).includes(k); return <button type="button" key={k} className={`chip-b ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => cambiar(c.k, on ? v.filter((x) => x !== k) : [...(v || []), k])}>{on && <Check size={13} strokeWidth={3} />}{t}</button>; })}</div>}
      {c.tipo === 'texto' && <input defaultValue={v || ''} placeholder={c.ph} onBlur={(e) => guardarTexto(c.k, e.target.value)} aria-label={c.l} />}
      {c.tipo === 'area' && <textarea rows={3} defaultValue={v || ''} placeholder={c.ph} onBlur={(e) => guardarTexto(c.k, e.target.value)} aria-label={c.l} />}
      {c.ayuda && <small className="muted">{c.ayuda}</small>}
    </div>
  );
}

// Formulario «Cómo trabaja»: se guarda solo al cambiar cada cosa.
export function AjustesDepto({ o, depto, sinComunes }) {
  const dep = o.deptos.find((d) => d.depto === depto); const a = ajustesDe(depto, dep?.ajustes);
  const [st, setSt] = useState('');
  async function cambiar(k, v) {
    setSt('Guardando…');
    try { await guardarAjustes(o, depto, { [k]: v }); setSt('Guardado'); } catch (e) { setSt(e.message); }
  }
  const guardarTexto = (k, v) => { if ((a[k] || '') !== v.trim()) cambiar(k, v.trim()); };
  return (
    <div className="aj">
      {(AJUSTES[depto] || []).map((c) => <Campo key={c.k} c={c} v={a[c.k]} cambiar={cambiar} guardarTexto={guardarTexto} />)}
      {!sinComunes && <div className="ajustes">{COMUNES.map((c) => <Campo key={c.k} c={c} v={a[c.k]} cambiar={cambiar} guardarTexto={guardarTexto} />)}</div>}
      <p className={`aj-st ${st === 'Guardado' ? 'is-ok' : ''}`} role="status">{st === 'Guardado' ? <><Check size={13} strokeWidth={3} /> Guardado. Tu agente ya trabaja así.</> : st}</p>
    </div>
  );
}

// Reproductor de vídeo en ventana.
export function VideoModal({ id, cerrar }) {
  const v = VIDEOS[id]; const ref = useRef(null);
  useEffect(() => { const k = (e) => e.key === 'Escape' && cerrar(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [cerrar]);
  if (!v) return null;
  return (
    <div className="modal modal--video" role="dialog" aria-modal="true" aria-label={v.t} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="modal__c">
        <header><b>{v.t}</b><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        <video ref={ref} src={v.src} poster={v.poster} controls autoPlay playsInline muted className="video" />
        <p className="muted">{v.d}</p>
      </div>
    </div>
  );
}

// Tarjeta de vídeo (miniatura + título) que abre el reproductor.
export function VideoTarjeta({ id, abrir, visto }) {
  const v = VIDEOS[id];
  return (
    <button type="button" className="vt" onClick={() => abrir(id)}>
      <span className="vt__img"><img src={v.poster} alt="" loading="lazy" /><PlayCircle size={34} /><em>{v.dur}</em></span>
      <b>{v.t}{visto && <Check size={14} className="ok" />}</b><small>{v.d}</small>
    </button>
  );
}

// Resultados del departamento en los últimos 30 días + uno propio de cada departamento.
function resultados(o, depto) {
  const desde = o.ahora - 30 * 864e5;
  const evs = o.eventos.filter((e) => e.depto === depto && new Date(e.creado).getTime() >= desde);
  const hechos = evs.filter((e) => e.tipo === 'hecho'); const pend = o.eventos.filter((e) => e.depto === depto && pendiente(e)).length;
  const extra = {
    atencion: () => { const ms = hechos.map((e) => e.detalle?.ms).filter(Boolean); return ['Contesta en', ms.length ? `${fmt(ms.reduce((x, y) => x + y, 0) / ms.length / 1000, 1)} s` : '—']; },
    citas: () => ['Por confirmar', fmt(o.citas.filter((c) => c.estado === 'pendiente').length)],
    ventas: () => ['En juego', `${fmt(o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)).reduce((x, l) => x + Number(l.importe || 0), 0))} €`],
    redes: () => ['Por revisar', fmt(pend)],
    google: () => { const r = o.eventos.map((e) => (e.depto === 'google' ? e.detalle?.estrellas : null)).filter(Boolean); return ['Tu nota', r.length ? `${fmt(r.reduce((x, y) => x + y, 0) / r.length, 1)} ★` : '—']; },
    contenido: () => ['Por revisar', fmt(pend)],
  }[depto]();
  return { hechos: hechos.length, minutos: hechos.length * (MINUTOS_TAREA[depto] || 0), extra };
}

export function CabeceraDepto({ o, depto }) {
  const [panel, setPanel] = useState(false); const [video, setVideo] = useState(null);
  const dep = o.deptos.find((d) => d.depto === depto); const info = DEPTO[depto];
  if (!dep) return null;
  const st = estadoDe({ depto, agente: o.agentes[depto], ajustes: dep.ajustes, conexiones: o.conexiones, eventos: o.eventos, ahora: o.ahora });
  const u = o.uso[depto] || {}; const usadas = u.unidades_mes || 0; const pct = Math.min(1, usadas / (dep.cupo_n || 1));
  const r = resultados(o, depto);
  return (
    <section className="dcab a-card" style={{ '--c': info.color }}>
      <div className="dcab__ag">
        <Avatar depto={depto} size={46} vivo={st.clave === 'trabajando'} />
        <div><b>{info.nombre}</b><span className={`ag-st is-${st.clave}`}><i />{st.txt}{st.clave === 'trabajando' && <Puntos />}</span><small>{st.tarea}</small></div>
      </div>
      <dl className="dcab__k">
        <div><dt>Este mes</dt><dd>{fmt(usadas)} <small>de {fmt(dep.cupo_n)} {info.cupo.unidad}</small></dd><Medidor valor={pct} color={pct >= AVISO_CUPO ? 'var(--aviso)' : info.color} /></div>
        <div><dt>Te ha ahorrado</dt><dd>{duracion(r.minutos)}</dd><small className="muted">últimos 30 días</small></div>
        <div><dt>{r.extra[0]}</dt><dd>{r.extra[1]}</dd></div>
      </dl>
      <div className="dcab__b">
        <button className="btn btn--sec btn--sm" onClick={() => setPanel(true)}><SlidersHorizontal size={15} /> Cómo trabaja</button>
        <button className="btn btn--fan btn--sm" onClick={() => setVideo(depto)}><PlayCircle size={15} /> Vídeo</button>
      </div>
      {panel && (
        <div className="panel-l" role="dialog" aria-modal="true" aria-label={`Cómo trabaja ${info.nombre}`} onClick={(e) => { if (e.target === e.currentTarget) setPanel(false); }}>
          <aside className="panel-l__c">
            <header><Avatar depto={depto} size={40} /><div><b>Cómo trabaja</b><span className="muted">{info.nombre}</span></div><button className="ico" onClick={() => setPanel(false)} aria-label="Cerrar"><X size={18} /></button></header>
            <p className="muted">Lo que cambies aquí lo aplica tu agente desde ese momento.</p>
            <AjustesDepto o={o} depto={depto} />
          </aside>
        </div>
      )}
      {video && <VideoModal id={video} cerrar={() => setVideo(null)} />}
    </section>
  );
}

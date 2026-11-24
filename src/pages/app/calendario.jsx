// Agenda en calendario: vista de semana y de día por horas (como un Google Calendar sencillo) y vista de lista.
import { useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ajustesDe } from '../../data/oficinaAjustes';
import { DEPTO } from '../../data/oficinaSaas';

const ALTO = 54; // px por hora
const lunesDe = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const mismoDia = (a, b) => a.toDateString() === b.toDateString();
const hm = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

// «Corte · 30 min», «Tinte · 1 h 30 min» → minutos por servicio.
function duraciones(o) {
  const txt = ajustesDe('citas', o.deptos.find((d) => d.depto === 'citas')?.ajustes).servicios || '';
  const m = {};
  for (const l of String(txt).split('\n')) {
    const [n, t] = l.split(/[·\-–:|]/); if (!n || !t) continue;
    const h = /(\d+)\s*h/.exec(t); const mi = /(\d+)\s*min/.exec(t);
    const total = (h ? Number(h[1]) * 60 : 0) + (mi ? Number(mi[1]) : 0);
    if (total) m[n.trim().toLowerCase()] = total;
  }
  return m;
}

export function Calendario({ o, abrirCita, nueva }) {
  const [modo, setModo] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 760 ? 'dia' : 'semana'));
  const [base, setBase] = useState(() => new Date(o.ahora));
  const dur = useMemo(() => duraciones(o), [o]);
  const dias = modo === 'semana' ? Array.from({ length: 7 }, (_, i) => { const d = lunesDe(base); d.setDate(d.getDate() + i); return d; }) : [(() => { const d = new Date(base); d.setHours(0, 0, 0, 0); return d; })()];
  const citas = o.citas.filter((c) => c.fecha && c.estado !== 'cancelada').map((c) => {
    const ini = new Date(c.fecha); const min = dur[String(c.servicio || '').trim().toLowerCase()] || 60;
    return { ...c, ini, fin: new Date(ini.getTime() + min * 60e3) };
  });
  const visibles = citas.filter((c) => dias.some((d) => mismoDia(d, c.ini)));
  const hIni = Math.min(8, ...visibles.map((c) => c.ini.getHours())); const hFin = Math.max(21, ...visibles.map((c) => c.fin.getHours() + 1));
  const horas = Array.from({ length: hFin - hIni }, (_, i) => hIni + i);
  const mover = (k) => { const d = new Date(base); d.setDate(d.getDate() + k * (modo === 'semana' ? 7 : 1)); setBase(d); };
  const hoy = new Date(o.ahora);
  const rango = modo === 'semana'
    ? `${dias[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${dias[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : dias[0].toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const ahoraY = (hoy.getHours() + hoy.getMinutes() / 60 - hIni) * ALTO;
  return (
    <section className="cal">
      <header className="cal__h">
        <div className="cal__nav"><button className="btn btn--sec btn--sm" onClick={() => setBase(new Date(o.ahora))}>Hoy</button>
          <button className="ico" onClick={() => mover(-1)} aria-label="Anterior"><ChevronLeft size={18} /></button><button className="ico" onClick={() => mover(1)} aria-label="Siguiente"><ChevronRight size={18} /></button>
          <b className="cal__rango">{rango}</b></div>
        <div className="cal__acc"><div className="seg">{[['dia', 'Día'], ['semana', 'Semana']].map(([k, t]) => <button key={k} aria-pressed={modo === k} onClick={() => setModo(k)}>{t}</button>)}</div>
          {nueva && <button className="btn btn--pri btn--sm" onClick={nueva}><CalendarPlus size={15} /> Apuntar una cita</button>}</div>
      </header>
      <div className="cal__w">
        <div className={`cal__g cal__g--${modo}`} style={{ '--n': dias.length }}>
          <div className="cal__esq" />
          {dias.map((d) => <div key={d} className={`cal__dia ${mismoDia(d, hoy) ? 'is-hoy' : ''}`}><span>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span><b>{d.getDate()}</b></div>)}
          <div className="cal__horas">{horas.map((h) => <span key={h} style={{ height: ALTO }}>{`${h}:00`}</span>)}</div>
          {dias.map((d) => (
            <div key={d} className="cal__col" style={{ height: horas.length * ALTO }}>
              {horas.map((h) => <i key={h} style={{ top: (h - hIni) * ALTO }} />)}
              {mismoDia(d, hoy) && ahoraY > 0 && ahoraY < horas.length * ALTO && <em className="cal__ahora" style={{ top: ahoraY }} />}
              {visibles.filter((c) => mismoDia(d, c.ini)).map((c) => {
                const top = (c.ini.getHours() + c.ini.getMinutes() / 60 - hIni) * ALTO; const alto = Math.max(26, ((c.fin - c.ini) / 36e5) * ALTO - 3);
                return (
                  <button key={c.id} className={`cal__c is-${c.estado}`} style={{ top, height: alto }} onClick={() => abrirCita(c)} title={`${hm(c.ini)} · ${c.nombre || 'Cliente'} · ${c.servicio || 'Cita'}`}>
                    <b>{hm(c.ini)} {c.nombre || 'Cliente'}</b>{alto > 34 && <span>{c.servicio || 'Cita'}{c.estado === 'pendiente' ? ' · por confirmar' : ''}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <footer className="cal__ley"><span><i className="is-confirmada" />Confirmada</span><span><i className="is-pendiente" />Por confirmar</span><span><i className="is-hecha" />Hecha</span>
        <small className="muted">La duración sale de tus servicios en «Cómo trabaja» (si no, 1 hora).</small></footer>
    </section>
  );
}

export function PanelCita({ c, cerrar, children }) {
  return (
    <div className="panel-l" role="dialog" aria-modal="true" aria-label={`Cita de ${c.nombre || 'cliente'}`} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <aside className="panel-l__c" style={{ '--c': DEPTO.citas.color }}>
        <header><div><b>Cita de {c.nombre || 'cliente'}</b><span className="muted">{c.servicio || 'Cita'}</span></div><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
        {children}
      </aside>
    </div>
  );
}

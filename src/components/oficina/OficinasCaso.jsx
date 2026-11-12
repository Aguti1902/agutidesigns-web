// Oficinas 3D de los casos de éxito: una oficina con la marca del cliente (Spa Organic)
// y un bloque de oficinas en el que se entra en cada negocio (Vela-Segalà).
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, Minus, MousePointerClick } from 'lucide-react';
import { montarOficina } from './oficinaPanel';
import { montarEdificio } from './edificio';

const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function OficinaMarca({ marca, titulo, color = '#e5fc63' }) {
  const ref = useRef(null), ctl = useRef(null);
  useEffect(() => {
    const host = ref.current; if (!host) return undefined;
    let off = null;
    try { off = montarOficina(host, { marca, interactivo: true, quieto: reduce() }); } catch { off = null; }
    ctl.current = off;
    return () => off?.();
  }, [marca]);
  return (
    <div className="oc-lienzo" ref={ref}>
      <div className="oc-hud">
        <span className="oc-pill"><i style={{ background: color }} />{titulo}</span>
        <span className="oc-ctl"><button type="button" aria-label="Acercar" onClick={() => ctl.current?.zoom?.(-1)}><Plus size={16} /></button><button type="button" aria-label="Alejar" onClick={() => ctl.current?.zoom?.(1)}><Minus size={16} /></button></span>
      </div>
      <p className="oc-pista">Arrastra para girar · los agentes trabajan, hablan entre ellos y se toman su café</p>
    </div>
  );
}

export function BloqueOficinas({ caso }) {
  const ref = useRef(null), ctl = useRef(null);
  const [dentro, setDentro] = useState(-1);
  useEffect(() => {
    if (dentro >= 0) return undefined;
    const host = ref.current; if (!host) return undefined;
    let off = null;
    try { off = montarEdificio(host, { oficinas: caso.oficinas, centro: caso.centro, onEntrar: (i) => setDentro(i), quieto: reduce() }); } catch { off = null; }
    ctl.current = off;
    return () => off?.();
  }, [dentro, caso]);
  const o = dentro >= 0 ? caso.oficinas[dentro] : null;
  return (
    <div className="bq">
      <div className="bq-tabs" role="group" aria-label="Elige una oficina">
        <button type="button" aria-pressed={dentro < 0} onClick={() => setDentro(-1)}>Todo el bloque</button>
        {caso.oficinas.map((x, i) => <button key={x.nombre} type="button" aria-pressed={dentro === i} onClick={() => setDentro(i)}><i style={{ background: x.color }} />{x.corto}</button>)}
      </div>
      {o ? (
        <div className="bq-dentro" key={dentro}>
          <OficinaMarca marca={o.marca} titulo={`${o.nombre} · ${o.tipo}`} color={o.color} />
          <button type="button" className="bq-volver" onClick={() => setDentro(-1)}><ArrowLeft size={16} /> Volver al bloque</button>
        </div>
      ) : (
        <div className="oc-lienzo oc-lienzo--bloque" ref={ref}>
          <div className="oc-hud">
            <span className="oc-pill"><i style={{ background: '#e5fc63' }} />4 negocios · 4 oficinas · 1 panel</span>
            <span className="oc-ctl"><button type="button" aria-label="Acercar" onClick={() => ctl.current?.zoom?.(-1)}><Plus size={16} /></button><button type="button" aria-label="Alejar" onClick={() => ctl.current?.zoom?.(1)}><Minus size={16} /></button></span>
          </div>
          <p className="oc-pista"><MousePointerClick size={15} /> Toca una oficina para entrar</p>
        </div>
      )}
    </div>
  );
}

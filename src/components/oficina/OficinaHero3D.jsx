// La oficina 3D del panel de Agutidesigns como fondo del hero: sin interacción, la cámara recorre la oficina sola y
// los agentes trabajan, se levantan y se pasan mensajes. Actividad ilustrativa: no muestra datos reales.
import { useEffect, useRef } from 'react';
import { montarOficina } from './oficinaPanel';

export default function OficinaHero3D({ onListo }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return undefined;
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let desmontar = null;
    try { desmontar = montarOficina(host, { quieto }); } catch { desmontar = null; }
    if (desmontar) requestAnimationFrame(() => onListo?.());
    return () => desmontar?.();
  }, [onListo]);
  return <div ref={ref} className="oh-lienzo" aria-hidden="true" />;
}

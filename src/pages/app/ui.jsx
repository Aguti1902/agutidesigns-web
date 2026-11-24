// Piezas pequeñas compartidas por las vistas del panel.
import { DEPTO } from '../../data/oficinaSaas';
import { ICONO } from './formato';
import { Headphones } from 'lucide-react';

export function Avatar({ depto, size = 40, vivo }) {
  const I = ICONO[depto] || Headphones; const c = DEPTO[depto]?.color || '#0047ff';
  return <span className={`a-av ${vivo ? 'is-vivo' : ''}`} style={{ '--c': c, width: size, height: size }}><I size={Math.round(size * 0.45)} strokeWidth={2} /></span>;
}

export function Tarjeta({ titulo, extra, children, className = '', id }) {
  return (
    <section className={`a-card ${className}`} id={id}>
      {(titulo || extra) && <header className="a-card__h">{titulo && <h2>{titulo}</h2>}{extra}</header>}
      {children}
    </section>
  );
}

export function Puntos() { return <span className="a-puntos" aria-hidden="true"><i /><i /><i /></span>; }

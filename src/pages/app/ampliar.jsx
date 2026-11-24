// Ampliaciones de cupo (bolsa extra de un mes): botón con confirmación y avisos cuando un departamento se acerca a su límite.
import { useState } from 'react';
import { AlertTriangle, Plus, X, Zap } from 'lucide-react';
import { DEPTO, BOLSA_EXTRA, unidadesBolsa, impuestos, IVA, IRPF, AVISO_CUPO } from '../../data/oficinaSaas';
import { api, cupoDe } from './datos';
import { fmt } from './formato';

const eur = (n) => `${fmt(n, Number(n) % 1 ? 2 : 0)} €`;

export function Ampliar({ o, depto, sm, texto }) {
  const [abierto, setAbierto] = useState(false); const [st, setSt] = useState('');
  const info = DEPTO[depto]; const n = unidadesBolsa(depto); const imp = impuestos(BOLSA_EXTRA.precio);
  const prueba = o.negocio.prueba_hasta && new Date(o.negocio.prueba_hasta) > new Date(o.ahora);
  async function comprar() {
    setSt('Cobrando…');
    try {
      if (!o.demo) await api('bolsa', { depto });
      o.setEstado((s) => ({ ...s, uso: { ...s.uso, [depto]: { ...(s.uso[depto] || {}), cupo: (s.uso[depto]?.cupo || info.cupo.n) + n } },
        bolsas: [{ id: `b${s.bolsas.length}`, depto, unidades: n, importe: BOLSA_EXTRA.precio, creado: new Date().toISOString() }, ...(s.bolsas || [])] }));
      setSt('¡Hecho! Ya tienes el cupo ampliado.'); setTimeout(() => setAbierto(false), 1400);
    } catch (e) { setSt(e.message); }
  }
  return (
    <>
      <button className={`btn btn--pri ${sm ? 'btn--sm' : ''}`} onClick={() => { setSt(''); setAbierto(true); }}><Plus size={15} /> {texto || `Ampliar +${fmt(n)}`}</button>
      {abierto && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={`Ampliar ${info.nombre}`} onClick={(e) => { if (e.target === e.currentTarget) setAbierto(false); }}>
          <div className="modal__c am">
            <header><b>Ampliar {info.nombre}</b><button className="ico" onClick={() => setAbierto(false)} aria-label="Cerrar"><X size={18} /></button></header>
            <div className="am__big" style={{ '--c': info.color }}><Zap size={22} /><div><b>+{fmt(n)} {info.cupo.unidad}</b><span>para lo que queda de este mes</span></div></div>
            {prueba ? <p>Durante la prueba gratis trabajas con el 25 % del cupo. Si lo necesitas ya completo, empieza tu plan desde <b>Plan</b>.</p> : (<>
              <dl className="am__cuentas"><div><dt>Ampliación</dt><dd>{eur(imp.base)}</dd></div><div><dt>IVA ({IVA} %)</dt><dd>{eur(imp.iva)}</dd></div><div><dt>Retención IRPF ({IRPF} %)</dt><dd>−{eur(imp.irpf)}</dd></div><div className="total"><dt>Se cobra hoy</dt><dd>{eur(imp.total)}</dd></div></dl>
              <p className="muted">Pago único con la tarjeta de tu suscripción. El mes que viene vuelves a tu cupo normal: no se renueva sola. Te llega la factura por correo.</p>
              <button className="btn btn--pri btn--ancho" onClick={comprar} disabled={st === 'Cobrando…'}>{st === 'Cobrando…' ? 'Cobrando…' : `Ampliar por ${eur(imp.total)}`}</button>
            </>)}
            {st && st !== 'Cobrando…' && <p className={st.startsWith('¡') ? 'am__ok' : 'error'}>{st}</p>}
          </div>
        </div>
      )}
    </>
  );
}

// Avisos de cupo para lo alto de cada pantalla: al 80 % (naranja) y al 100 % (rojo), con botón para ampliar.
export function AvisosCupo({ o }) {
  const lista = o.deptos.map(({ depto }) => ({ depto, ...cupoDe(o, depto) })).filter((x) => x.pct >= AVISO_CUPO).sort((a, b) => b.pct - a.pct);
  if (!lista.length) return null;
  return lista.slice(0, 2).map((x) => {
    const info = DEPTO[x.depto]; const lleno = x.pct >= 1;
    return (
      <p key={x.depto} className={`banda-prueba ${lleno ? 'banda--mal' : 'banda--aviso'}`}><AlertTriangle size={17} />
        <span><b>{lleno ? `${info.nombre} ha agotado su cupo de este mes` : `${info.nombre} lleva el ${Math.round(x.pct * 100)} % de su cupo`}</b> ({fmt(x.usado)} de {fmt(x.total)} {info.cupo.unidad}).{' '}
          {lleno ? 'Ahora solo te pasa los avisos importantes.' : 'Al llegar al 100 % solo te pasará los avisos importantes.'} Amplía +{fmt(unidadesBolsa(x.depto))} por {BOLSA_EXTRA.precio} € + IVA, solo este mes.</span>
        <Ampliar o={o} depto={x.depto} sm texto="Ampliar" />
      </p>
    );
  });
}

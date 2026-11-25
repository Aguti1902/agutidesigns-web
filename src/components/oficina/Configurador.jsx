// Configurador de la Oficina de IA (modo SaaS): el negocio elige sus departamentos, ve el precio al momento
// y paga la suscripción mensual en Stripe. Sin puesta en marcha ni permanencia.
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Gift, Globe, Lock } from 'lucide-react';
import { DEPARTAMENTOS, precioOficina, precioAnual, PRECIO_SUELTO, DIAS_PRUEBA, WEB_DESDE, webIncluida } from '../../data/oficinaSaas';
import './Configurador.css';

const fmt = (n) => n.toLocaleString('es-ES');

export default function Configurador() {
  const [sel, setSel] = useState(['atencion', 'google']);
  const [periodo, setPeriodo] = useState('mes');
  const n = sel.length;
  const anual = periodo === 'anio';
  const total = anual ? precioAnual(n) : precioOficina(n);
  const ahorro = anual ? precioOficina(n) * 12 - total : n * PRECIO_SUELTO - total;
  const web = webIncluida(periodo, n);
  const elegidos = useMemo(() => DEPARTAMENTOS.filter((d) => sel.includes(d.id)), [sel]);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const destino = `/oficina-ia/contratar?deptos=${sel.join(',')}&plan=${periodo}`;
  function seguir(e) {
    e.preventDefault();
    if (n) window.location.assign(destino);
  }

  return (
    <section id="precios" className="cf">
      <div className="ag-wrap">
        <div className="cf-head">
          <p className="cf-k">Monta tu oficina</p>
          <h2 className="cf-h">Elige tus departamentos.<br /><span>Paga solo por lo que usas.</span></h2>
          <p className="cf-lead">Sin puesta en marcha y con la IA incluida. Pruébalo {DIAS_PRUEBA} días gratis en el plan mensual, o ahorra un 20 % con el anual desde 2 departamentos y llévate tu web hecha.</p>
        </div>
        <div className="cf-grid">
          <ul className="cf-lista" role="group" aria-label="Departamentos">
            {DEPARTAMENTOS.map((d) => {
              const on = sel.includes(d.id);
              return (
                <li key={d.id}>
                  <button type="button" className={`cf-dep ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(d.id)} style={{ '--c': d.color }}>
                    <span className="cf-dep__check" aria-hidden="true">{on && <Check size={16} strokeWidth={3} />}</span>
                    <span className="cf-dep__txt">
                      <b>{d.nombre}</b>
                      <span>{d.que}</span>
                      <em>Incluye {fmt(d.cupo.n)} {d.cupo.unidad} al mes</em>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <form className="cf-caja" onSubmit={seguir}>
            <div className="cf-periodo" role="group" aria-label="Forma de pago">
              <button type="button" aria-pressed={!anual} onClick={() => setPeriodo('mes')}>Mensual</button>
              <button type="button" aria-pressed={anual} onClick={() => setPeriodo('anio')}>Anual <em>−20 %</em></button>
            </div>
            <p className="cf-precio"><b>{n ? `${anual ? Math.round(total / 12) : total} €` : '—'}</b><span>/mes + IVA</span></p>
            <p className="cf-sub">{!n ? 'Elige al menos un departamento' : anual ? `${total} € al año · ahorras ${ahorro} €` : `${n} departamento${n > 1 ? 's' : ''}${ahorro > 0 ? ` · ahorras ${ahorro} € al mes` : ''}`}</p>
            {!anual && n > 0 && <p className="cf-extra"><Gift size={16} /><span><b>{DIAS_PRUEBA} días gratis.</b> No te cobramos nada hasta el día {DIAS_PRUEBA + 1} y cancelas cuando quieras.</span></p>}
            {anual && n > 0 && (web
              ? <p className="cf-extra"><Globe size={16} /><span><b>Web incluida.</b> Te diseñamos tu web, o te rediseñamos la que tienes.</span></p>
              : <p className="cf-extra cf-extra--suave"><Globe size={16} /><span>Con {WEB_DESDE} departamentos o más en plan anual, <b>tu web va incluida</b>.</span></p>)}
            <ul className="cf-resumen">
              {elegidos.map((d) => <li key={d.id}><i style={{ background: d.color }} />{d.nombre}<small>{fmt(d.cupo.n)} {d.cupo.unidad}</small></li>)}
            </ul>
            <div className="cf-escala" aria-label="Precio según el número de departamentos">
              {[1, 2, 3, 4, 5, 6].map((k) => <span key={k} className={k === n ? 'on' : ''}><b>{k}</b>{anual ? Math.round(precioAnual(k) / 12) : precioOficina(k)} €</span>)}
            </div>
            <button className="ag-btn ag-btn--primary cf-pagar" disabled={!n}>{anual ? 'Continuar con el plan anual' : `Empezar ${DIAS_PRUEBA} días gratis`} <ArrowRight size={18} /></button>
            <p className="cf-nota"><Lock size={13} /> {anual ? 'Pago seguro con Stripe. Un solo pago al año. Precios + IVA.' : 'Hoy no pagas nada. Sin permanencia. Precios + IVA.'}</p>
            <a className="cf-demo" href="/app?demo=1">Ver cómo es el panel por dentro <ArrowRight size={14} /></a>
          </form>
        </div>
        <p className="cf-pie">Cada departamento trae su cupo mensual. Al llegar al 80 % te avisamos, y si se acaba el agente solo te pasa los avisos importantes hasta que amplíes o empiece el mes siguiente. Nunca pagas de más sin saberlo.</p>
      </div>
    </section>
  );
}

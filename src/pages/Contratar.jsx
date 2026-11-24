// Compra de la Oficina de IA en 3 pasos (/oficina-ia/contratar): equipo → forma de pago → datos, con el pedido
// siempre a la vista (base, IVA y lo que se paga hoy). Acepta ?deptos=a,b&plan=anio para llegar preseleccionado.
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Gift, Globe, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Headphones, CalendarCheck, Handshake, Megaphone, Star, PenLine } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import { DEPARTAMENTOS, DEPTO, precioOficina, precioAnual, PRECIO_SUELTO, DIAS_PRUEBA, WEB_DESDE, webIncluida, impuestos, IVA, IRPF } from '../data/oficinaSaas';
import './Contratar.css';

const ICONO = { atencion: Headphones, citas: CalendarCheck, ventas: Handshake, redes: Megaphone, google: Star, contenido: PenLine };
const eur = (n) => `${n.toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;
const PACKS = [
  { id: 'belleza', t: 'Peluquería y estética', d: ['atencion', 'citas', 'google', 'redes'] },
  { id: 'salud', t: 'Clínica y salud', d: ['atencion', 'citas', 'google'] },
  { id: 'restauracion', t: 'Restaurante o bar', d: ['atencion', 'citas', 'google', 'redes'] },
  { id: 'tienda', t: 'Tienda', d: ['atencion', 'redes', 'google'] },
  { id: 'servicios', t: 'Reformas y servicios', d: ['atencion', 'ventas', 'google'] },
  { id: 'profesional', t: 'Despacho profesional', d: ['atencion', 'ventas', 'contenido'] },
];

export default function Contratar() {
  useSeo({ title: 'Monta tu oficina de IA | Agutidesigns', description: `Elige los departamentos de tu oficina de IA y empieza hoy. ${DIAS_PRUEBA} días gratis en el plan mensual.`, path: '/oficina-ia/contratar' });
  const qs = new URLSearchParams(window.location.search);
  const [sel, setSel] = useState(() => { const d = (qs.get('deptos') || '').split(',').filter((x) => DEPTO[x]); return d.length ? d : ['atencion', 'google']; });
  const [plan, setPlan] = useState(qs.get('plan') === 'anio' ? 'anio' : 'mes');
  const [paso, setPaso] = useState(1);
  const [pack, setPack] = useState('');
  const [nombre, setNombre] = useState(''); const [email, setEmail] = useState(''); const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState({ cargando: false, error: '' });
  const n = sel.length; const anual = plan === 'anio';
  const base = anual ? precioAnual(n) : precioOficina(n);
  const listaMes = n * PRECIO_SUELTO; const lista = anual ? listaMes * 12 : listaMes;
  const descPack = anual ? (listaMes - precioOficina(n)) * 12 : listaMes - precioOficina(n);
  const descAnual = anual ? precioOficina(n) * 12 - precioAnual(n) : 0;
  const { iva, irpf, total } = impuestos(base);
  const web = webIncluida(plan, n);
  const ahorroAnual = precioOficina(n) * 12 - precioAnual(n);
  const finPrueba = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + DIAS_PRUEBA); return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }); }, []);
  const toggle = (id) => { setPack(''); setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); };

  async function pagar(e) {
    e.preventDefault();
    if (!acepto) return setEstado({ cargando: false, error: 'Acepta las condiciones para continuar.' });
    setEstado({ cargando: true, error: '' });
    try {
      const r = await fetch('/api/oficina/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deptos: sel, nombre, email, periodo: plan }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw new Error(j.error || 'No hemos podido abrir el pago.');
      window.location.assign(j.url);
    } catch (err) { setEstado({ cargando: false, error: err.message }); }
  }

  return (
    <div className="ct">
      <header className="ct-top">
        <a href="/oficina-ia" className="ct-volver"><ArrowLeft size={16} /> Oficina de IA</a>
        <img src="/images/logoazul.png" alt="Agutidesigns" width="130" height="36" />
        <span className="ct-seguro"><Lock size={14} /> Pago seguro</span>
      </header>
      <ol className="ct-pasos" aria-label="Pasos">
        {['Tu equipo', 'Cómo pagas', 'Tus datos'].map((t, i) => (
          <li key={t} className={paso === i + 1 ? 'is-on' : paso > i + 1 ? 'is-ok' : ''}>
            <button type="button" onClick={() => (i + 1 < paso || (i === 1 && n) || (i === 2 && n)) && setPaso(i + 1)} disabled={!n && i > 0}>
              <span>{paso > i + 1 ? <Check size={14} strokeWidth={3} /> : i + 1}</span>{t}
            </button>
          </li>
        ))}
      </ol>
      <main className="ct-main">
        <section className="ct-izq">
          {paso === 1 && (<>
            <h1>¿Qué necesita tu negocio?</h1>
            <p className="ct-lead">Elige tus departamentos. Cada uno es un agente de IA con su tarea y su cupo del mes. Puedes cambiarlos cuando quieras desde tu panel.</p>
            <div className="ct-packs" role="group" aria-label="Recomendado según tu sector">
              <span>Recomendado para:</span>
              {PACKS.map((p) => <button key={p.id} type="button" aria-pressed={pack === p.id} onClick={() => { setPack(p.id); setSel(p.d); }}>{p.t}</button>)}
            </div>
            <ul className="ct-deps">
              {DEPARTAMENTOS.map((d) => { const on = sel.includes(d.id); const I = ICONO[d.id]; return (
                <li key={d.id}>
                  <button type="button" className={`ct-dep ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(d.id)} style={{ '--c': d.color }}>
                    <span className="ct-dep__i"><I size={20} /></span>
                    <span className="ct-dep__t"><b>{d.nombre}{d.id === 'atencion' && <em>El más elegido</em>}</b><span>{d.que}</span><small>{d.cupo.n.toLocaleString('es-ES')} {d.cupo.unidad} al mes</small></span>
                    <span className="ct-dep__x">{on && <Check size={15} strokeWidth={3} />}</span>
                  </button>
                </li>
              ); })}
            </ul>
            <div className="ct-nav"><span className="ct-mini">{n ? `${n} departamento${n > 1 ? 's' : ''} · desde ${eur(precioOficina(n))}/mes` : 'Elige al menos uno'}</span><button className="ct-btn" disabled={!n} onClick={() => setPaso(2)}>Continuar <ArrowRight size={17} /></button></div>
          </>)}
          {paso === 2 && (<>
            <h1>¿Cómo prefieres pagar?</h1>
            <p className="ct-lead">Sin permanencia en el mensual. En el anual pagas una vez y te ahorras el 20 %.</p>
            <div className="ct-planes">
              <button type="button" className={`ct-plan ${!anual ? 'is-on' : ''}`} aria-pressed={!anual} onClick={() => setPlan('mes')}>
                <span className="ct-plan__k">Mensual</span>
                <b>{eur(precioOficina(n))}<small>/mes + IVA</small></b>
                <ul><li><Gift size={15} /> {DIAS_PRUEBA} días gratis para probarlo</li><li><Check size={15} /> Cancelas cuando quieras</li><li><Check size={15} /> Añade o quita departamentos cuando quieras</li></ul>
                <span className="ct-plan__pie">Hoy pagas 0 €. Primer cobro el {finPrueba}.</span>
              </button>
              <button type="button" className={`ct-plan ${anual ? 'is-on' : ''}`} aria-pressed={anual} onClick={() => setPlan('anio')}>
                <span className="ct-plan__k">Anual <em>Ahorras {eur(ahorroAnual)}</em></span>
                <b>{eur(Math.round(precioAnual(n) / 12))}<small>/mes + IVA</small></b>
                <ul><li><Check size={15} /> 20 % de descuento</li><li className={n >= WEB_DESDE ? '' : 'off'}><Globe size={15} /> {n >= WEB_DESDE ? 'Diseño o rediseño de tu web incluido' : `Web incluida a partir de ${WEB_DESDE} departamentos`}</li><li><Check size={15} /> Un solo pago al año</li></ul>
                <span className="ct-plan__pie">{eur(precioAnual(n))} al año + IVA</span>
              </button>
            </div>
            {anual && n < WEB_DESDE && <p className="ct-aviso"><Sparkles size={16} /> Añade {WEB_DESDE - n} departamento{WEB_DESDE - n > 1 ? 's' : ''} más y tu web va incluida. <button type="button" onClick={() => setPaso(1)}>Elegir más</button></p>}
            <div className="ct-nav"><button className="ct-btn ct-btn--sec" onClick={() => setPaso(1)}><ArrowLeft size={17} /> Atrás</button><button className="ct-btn" onClick={() => setPaso(3)}>Continuar <ArrowRight size={17} /></button></div>
          </>)}
          {paso === 3 && (
            <form onSubmit={pagar}>
              <h1>Ya casi está</h1>
              <p className="ct-lead">Con estos datos creamos tu oficina. En el siguiente paso pagas con tarjeta en Stripe, donde pones el NIF y los datos fiscales de tu empresa para la factura.</p>
              <div className="ct-form">
                <label><span>Nombre de tu negocio</span><input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Peluquería Marta" autoComplete="organization" /></label>
                <label><span>Tu correo</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@negocio.com" autoComplete="email" /><small>Aquí te llegará el acceso a tu panel y las facturas.</small></label>
                <label className="ct-check"><input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} /><span>Acepto las condiciones del servicio y la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</span></label>
              </div>
              {estado.error && <p className="ct-error" role="alert">{estado.error}</p>}
              <div className="ct-nav"><button type="button" className="ct-btn ct-btn--sec" onClick={() => setPaso(2)}><ArrowLeft size={17} /> Atrás</button>
                <button className="ct-btn" disabled={estado.cargando}>{estado.cargando ? 'Abriendo el pago…' : anual ? `Pagar ${eur(total)}` : `Empezar mis ${DIAS_PRUEBA} días gratis`} <ArrowRight size={17} /></button></div>
            </form>
          )}
        </section>
        <aside className="ct-pedido" aria-label="Tu pedido">
          <h2>Tu pedido</h2>
          <ul className="ct-lineas">
            {sel.map((d) => <li key={d}><span><i style={{ background: DEPTO[d].color }} />{DEPTO[d].nombre}</span></li>)}
            {!n && <li className="muted">Ningún departamento todavía</li>}
          </ul>
          {n > 0 && (<>
            <dl className="ct-cuentas">
              <div><dt>{n} departamento{n > 1 ? 's' : ''} × {eur(PRECIO_SUELTO)}{anual ? ' × 12 meses' : ''}</dt><dd>{eur(lista)}</dd></div>
              {descPack > 0 && <div className="ahorro"><dt>Descuento por {n} departamentos</dt><dd>−{eur(descPack)}</dd></div>}
              {descAnual > 0 && <div className="ahorro"><dt>Descuento plan anual (20 %)</dt><dd>−{eur(descAnual)}</dd></div>}
              <div className="sub"><dt>Base imponible</dt><dd>{eur(base)}</dd></div>
              {web && <div className="ahorro"><dt>Diseño de tu web</dt><dd>Incluido</dd></div>}
              <div><dt>IVA ({IVA} %)</dt><dd>{eur(iva)}</dd></div>
              {IRPF > 0 && <div><dt>Retención IRPF ({IRPF} %)</dt><dd>−{eur(irpf)}</dd></div>}
              <div className="total"><dt>{anual ? 'A pagar hoy' : 'A pagar cada mes'}</dt><dd>{eur(total)}</dd></div>
            </dl>
            {!anual && <p className="ct-hoy"><Gift size={16} /><span><b>Hoy pagas 0 €.</b> Prueba {DIAS_PRUEBA} días gratis; el primer cobro es el {finPrueba} y puedes cancelar antes sin coste.</span></p>}
          </>)}
          <ul className="ct-garantias">
            <li><ShieldCheck size={16} /> Pago con Stripe. No guardamos tu tarjeta.</li>
            <li><Check size={16} /> {anual ? 'Factura con IVA y retención a nombre de tu empresa.' : 'Sin permanencia. Factura con IVA y retención cada mes.'}</li>
            <li><Check size={16} /> Equipo humano en Cornellà para ayudarte a ponerla en marcha.</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}

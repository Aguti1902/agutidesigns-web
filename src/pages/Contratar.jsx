// Compra de la Oficina de IA en 3 pasos (/oficina-ia/contratar): equipo → forma de pago → datos, con el pedido
// siempre a la vista (base, IVA y lo que se paga hoy). Acepta ?deptos=a,b&plan=anio para llegar preseleccionado.
import { eventoPixel } from '../utils/metaPixel';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/oficinaSupabase';
import { loadStripe } from '@stripe/stripe-js';
import BotonGoogle from '../components/ui/BotonGoogle';
import { urlWeb } from '../lib/panelRuta';
import { ArrowLeft, ArrowRight, Check, Gift, Globe, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { MessageCircle, Headphones, CalendarCheck, Handshake, Megaphone, Star, PenLine } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import { DEPARTAMENTOS, DEPTO, precioOficina, precioAnual, PRECIO_SUELTO, DIAS_PRUEBA, WEB_DESDE, webIncluida, impuestos, IVA, IRPF } from '../data/oficinaSaas';
import './Contratar.css';

const CLAVE_REGISTRO = 'oficina-registro';
const CLAVE_STRIPE = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
let stripePromesa = null;
const cargarStripe = () => (stripePromesa ||= loadStripe(CLAVE_STRIPE));
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
  // Lo elegido se guarda antes de ir a Google, para seguir donde estabas al volver.
  const guardado = (() => { try { return JSON.parse(sessionStorage.getItem(CLAVE_REGISTRO) || 'null'); } catch { return null; } })();
  const [sel, setSel] = useState(() => { if (guardado?.sel?.length) return guardado.sel; const d = (qs.get('deptos') || '').split(',').filter((x) => DEPTO[x]); return d.length ? d : ['atencion', 'google']; });
  const [plan, setPlan] = useState(guardado?.plan || (qs.get('plan') === 'anio' ? 'anio' : 'mes'));
  const [paso, setPaso] = useState(guardado ? 3 : 1);
  const [pack, setPack] = useState('');
  const [nombre, setNombre] = useState(guardado?.nombre || ''); const [email, setEmail] = useState(''); const [clave, setClave] = useState(''); const [acepto, setAcepto] = useState(!!guardado?.acepto);
  const [cuenta, setCuenta] = useState(null); // sesión de Google, si te has registrado con Google
  useEffect(() => {
    try { sessionStorage.removeItem(CLAVE_REGISTRO); } catch { /* sin almacenamiento */ }
    supabase.auth.getSession().then(({ data }) => { const u = data.session?.user; if (u?.email) { setCuenta(u); setEmail(u.email); } });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, ses) => { const u = ses?.user; setCuenta(u?.email ? u : null); if (u?.email) setEmail(u.email); });
    return () => sub.subscription.unsubscribe();
  }, []);
  const recordar = () => { try { sessionStorage.setItem(CLAVE_REGISTRO, JSON.stringify({ sel, plan, nombre, acepto })); } catch { /* sin almacenamiento */ } };
  const [estado, setEstado] = useState({ cargando: false, error: '' });
  const [pagoEmb, setPagoEmb] = useState(false); const checkoutRef = useRef(null);
  useEffect(() => () => checkoutRef.current?.destroy(), []);
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
      // Sin Google: se crea la cuenta con correo y contraseña y se entra ya, antes de pagar.
      if (!cuenta) {
        const r0 = await fetch('/api/oficina/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: clave }) });
        const j0 = await r0.json().catch(() => ({}));
        if (!r0.ok && r0.status !== 409) throw new Error(j0.error || 'No hemos podido crear tu cuenta.');
        const { data: ses, error: e0 } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: clave });
        if (e0 || !ses?.session) throw new Error(r0.status === 409 ? 'Ese correo ya tiene cuenta. Pon su contraseña o entra con Google.' : 'No hemos podido entrar en tu cuenta. Inténtalo otra vez.');
        setCuenta(ses.session.user);
      }
      eventoPixel('InitiateCheckout', { content_name: 'Oficina de IA', num_items: sel.length });
      const embebido = !!CLAVE_STRIPE;
      const r = await fetch('/api/oficina/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deptos: sel, nombre, email, periodo: plan, embebido }) });
      const j = await r.json().catch(() => ({}));
      if (!embebido) { if (!r.ok || !j.url) throw new Error(j.error || 'No hemos podido abrir el pago.'); window.location.assign(j.url); return; }
      if (!r.ok || !j.client_secret) throw new Error(j.error || 'No hemos podido abrir el pago.');
      const st = await cargarStripe(); if (!st) throw new Error('No hemos podido cargar el pago seguro. Recarga la página.');
      checkoutRef.current?.destroy();
      setPagoEmb(true); setEstado({ cargando: false, error: '' });
      const co = await st.initEmbeddedCheckout({ fetchClientSecret: async () => j.client_secret });
      checkoutRef.current = co; co.mount('#ct-stripe'); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setEstado({ cargando: false, error: err.message }); }
  }

  return (
    <div className="ct">
      <header className="ct-top">
        <a href={urlWeb('/oficina-ia')} className="ct-volver"><ArrowLeft size={16} /> Oficina de IA</a>
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
            <p className="ct-lead">Sin permanencia en el mensual. En el anual pagas una vez y, desde 2 departamentos, te ahorras el 20 %.</p>
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
                <ul><li className={n >= 2 ? '' : 'off'}><Check size={15} /> {n >= 2 ? '20 % de descuento' : 'Descuento del 20 % desde 2 departamentos'}</li><li className={n >= WEB_DESDE ? '' : 'off'}><Globe size={15} /> {n >= WEB_DESDE ? 'Diseño o rediseño de tu web incluido' : `Web incluida a partir de ${WEB_DESDE} departamentos`}</li><li><Check size={15} /> Un solo pago al año</li></ul>
                <span className="ct-plan__pie">{eur(precioAnual(n))} al año + IVA</span>
              </button>
            </div>
            {anual && n < WEB_DESDE && <p className="ct-aviso"><Sparkles size={16} /> Añade {WEB_DESDE - n} departamento{WEB_DESDE - n > 1 ? 's' : ''} más y tu web va incluida. <button type="button" onClick={() => setPaso(1)}>Elegir más</button></p>}
            <div className="ct-nav"><button className="ct-btn ct-btn--sec" onClick={() => setPaso(1)}><ArrowLeft size={17} /> Atrás</button><button className="ct-btn" onClick={() => setPaso(3)}>Continuar <ArrowRight size={17} /></button></div>
          </>)}
          {paso === 3 && pagoEmb && (
            <div className="ct-pago">
              <h1>Pago seguro</h1>
              <p className="ct-lead">{anual ? 'Pon tu tarjeta y los datos fiscales de tu empresa para la factura.' : `Pon tu tarjeta y los datos fiscales para la factura. Hoy no se te cobra nada: el primer cobro es el ${finPrueba}.`}</p>
              <div className="ct-stripe" id="ct-stripe" />
              <div className="ct-confianza"><span><ShieldCheck size={15} /><span>Pago cifrado con <b>Stripe</b>. Nunca vemos tu tarjeta.</span></span></div>
              <button type="button" className="ct-atras" onClick={() => { checkoutRef.current?.destroy(); checkoutRef.current = null; setPagoEmb(false); }}><ArrowLeft size={15} /> Cambiar mis datos</button>
            </div>
          )}
          {paso === 3 && !pagoEmb && (
            <form onSubmit={pagar} className="ct-pago">
              <h1>{anual ? 'Crea tu oficina' : `Empieza tus ${DIAS_PRUEBA} días gratis`}</h1>
              <p className="ct-lead">{anual ? 'Dos datos y pasas al pago seguro con Stripe, donde pones los datos fiscales de tu empresa para la factura.' : 'Dos datos y pasas al pago seguro. Hoy no se te cobra nada.'}</p>

              <section className="ct-caja" aria-labelledby="ct-cuenta-t">
                <header><span className="ct-caja__n">1</span><h2 id="ct-cuenta-t">Tu cuenta</h2></header>
                {cuenta ? (
                  <div className="ct-yo">
                    {cuenta.user_metadata?.avatar_url ? <img src={cuenta.user_metadata.avatar_url} alt="" width="44" height="44" referrerPolicy="no-referrer" /> : <span className="ct-yo__ini">{(cuenta.user_metadata?.full_name || cuenta.email).slice(0, 1).toUpperCase()}</span>}
                    <div><b>{cuenta.user_metadata?.full_name || cuenta.email.split('@')[0]}</b><small>{cuenta.email}</small></div>
                    <span className="ct-yo__g"><Check size={14} strokeWidth={3} /> Google</span>
                    <button type="button" className="ct-yo__c" onClick={() => supabase.auth.signOut().then(() => { setCuenta(null); setEmail(''); })}>Cambiar</button>
                  </div>
                ) : (<>
                  <BotonGoogle texto="Continuar con Google" antes={recordar} />
                  <p className="bg-o">o con tu correo</p>
                  <label className="ct-campo"><span>Tu correo</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@negocio.com" autoComplete="email" /><small>Aquí te llegan las facturas.</small></label>
                  <label className="ct-campo"><span>Crea una contraseña</span><input required type="password" minLength={8} value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" /><small>Con tu correo y esta contraseña entrarás en tu panel.</small></label>
                </>)}
              </section>

              <section className="ct-caja" aria-labelledby="ct-neg-t">
                <header><span className="ct-caja__n">2</span><h2 id="ct-neg-t">Tu negocio</h2></header>
                <label className="ct-campo"><span>Nombre de tu negocio</span><input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Peluquería Marta" autoComplete="organization" /><small>Sale en tu panel y en la pared de tu oficina 3D.</small></label>
              </section>

              {!anual && (
                <section className="ct-caja ct-caja--linea" aria-labelledby="ct-prueba-t">
                  <header><span className="ct-caja__n">3</span><h2 id="ct-prueba-t">Así funciona tu prueba</h2></header>
                  <ol className="ct-tl">
                    <li className="is-hoy"><i /><div><b>Hoy · 0 €</b><span>Pones tu tarjeta y tu oficina empieza a trabajar.</span></div></li>
                    <li><i /><div><b>Durante {DIAS_PRUEBA} días</b><span>Tus agentes trabajan con una parte de su cupo. Cancelas desde tu panel cuando quieras.</span></div></li>
                    <li><i /><div><b>{finPrueba} · {eur(total)}</b><span>Primer cobro si sigues. Después, cada mes. Sin permanencia.</span></div></li>
                  </ol>
                </section>
              )}

              <label className="ct-acepto"><input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} /><span>Acepto las <a href={urlWeb('/condiciones')} target="_blank" rel="noopener">condiciones del servicio</a> y la <a href={urlWeb('/privacidad')} target="_blank" rel="noopener">política de privacidad</a>.</span></label>
              {estado.error && <p className="ct-error" role="alert">{estado.error}</p>}
              <button className="ct-pagar" disabled={estado.cargando}><Lock size={18} /> {estado.cargando ? 'Abriendo el pago seguro…' : anual ? `Pagar ${eur(total)} con tarjeta` : 'Continuar al pago seguro'}</button>
              <div className="ct-confianza">
                <span className="ct-tarjetas" aria-label="Tarjetas aceptadas"><em className="visa">VISA</em><em className="mc"><i /><i /></em><em className="amex">AMEX</em></span>
                <span><ShieldCheck size={15} /><span>Pago cifrado con <b>Stripe</b>. Nunca vemos tu tarjeta.</span></span>
              </div>
              <button type="button" className="ct-atras" onClick={() => setPaso(2)}><ArrowLeft size={15} /> Volver a cómo pagas</button>
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
            <li><MessageCircle size={16} /> Los mensajes de WhatsApp van a tu propia cuenta de WhatsApp Business: Meta te da 1.000 respuestas gratis al mes y, si pasas de ahí, te las cobra directamente a ti (unos 0,02 € cada una).</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}

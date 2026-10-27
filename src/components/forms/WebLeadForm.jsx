import { useState } from 'react';
import { ArrowRight, CheckCircle2, Calendar, MessageCircle } from 'lucide-react';
import './WebLeadForm.css';

const CALENDLY_URL = 'https://calendly.com/agutidesigns/reunion';
const WA_URL = 'https://wa.me/34625204337';

/**
 * Formulario de captación genérico para las páginas SEO.
 * Envía a /api/web-lead (Supabase + aviso por email) con `fuente` = página de origen,
 * para que el agente de sincronización lo pase al panel.
 */
export default function WebLeadForm({ fuente, ciudad = '', sector = '', title = 'Pide tu propuesta personalizada' }) {
  const [f, setF] = useState({ nombre: '', negocio: '', ciudad, email: '', telefono: '', web: '', mensaje: '' });
  const [hp, setHp] = useState(''); // honeypot anti-spam
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (hp) return;
    if (!f.nombre.trim() || !f.negocio.trim()) return setError('Dinos tu nombre y el de tu negocio.');
    if (!/^\S+@\S+\.\S+$/.test(f.email) && f.telefono.replace(/\D/g, '').length < 9)
      return setError('Déjanos un email o un teléfono válido para poder contestarte.');
    setError('');
    setSending(true);
    let ok = false;
    try {
      const r = await fetch('/api/web-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          fuente,
          situacion: [sector && `Sector: ${sector}`, f.mensaje.trim()].filter(Boolean).join(' · '),
        }),
      });
      ok = r.ok;
    } catch { ok = false; }
    setSending(false);
    if (!ok) return setError('No se ha podido enviar. Escríbenos a info@agutidesigns.io o por WhatsApp.');
    setDone(true);
  };

  if (done) {
    const cal = `${CALENDLY_URL}?name=${encodeURIComponent(f.nombre)}&email=${encodeURIComponent(f.email)}`;
    return (
      <div className="wlf wlf--done" id="propuesta">
        <CheckCircle2 size={40} strokeWidth={1.6} />
        <h3>¡Recibido, {f.nombre.split(' ')[0]}!</h3>
        <p>Preparamos una propuesta para {f.negocio} con una demo de cómo quedaría tu web. Te escribimos en menos de 24 h laborables.</p>
        <div className="wlf__done-ctas">
          <a className="wlf__btn" href={cal} target="_blank" rel="noopener noreferrer"><Calendar size={16} /> Reservar llamada ahora</a>
          <a className="wlf__btn wlf__btn--ghost" href={WA_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <form className="wlf" id="propuesta" onSubmit={submit} noValidate>
      <h3 className="wlf__title">{title}</h3>
      <p className="wlf__sub">Gratis y sin compromiso. Te enseñamos una demo de tu nueva web antes de decidir nada.</p>
      <div className="wlf__grid">
        <label>Tu nombre<input value={f.nombre} onChange={set('nombre')} autoComplete="name" required /></label>
        <label>Negocio<input value={f.negocio} onChange={set('negocio')} autoComplete="organization" required /></label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Teléfono<input type="tel" value={f.telefono} onChange={set('telefono')} autoComplete="tel" /></label>
        <label>Ciudad<input value={f.ciudad} onChange={set('ciudad')} autoComplete="address-level2" /></label>
        <label>Web actual (si tienes)<input value={f.web} onChange={set('web')} placeholder="tuweb.com" /></label>
        <label className="wlf__full">¿Qué te gustaría mejorar?<textarea rows={3} value={f.mensaje} onChange={set('mensaje')} /></label>
        <input className="wlf__hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" />
      </div>
      {error && <p className="wlf__error" role="alert">{error}</p>}
      <button className="wlf__btn" type="submit" disabled={sending}>
        {sending ? 'Enviando…' : <>Quiero mi propuesta <ArrowRight size={16} /></>}
      </button>
      <p className="wlf__legal">Usaremos tus datos solo para contestarte. Nada de spam.</p>
    </form>
  );
}

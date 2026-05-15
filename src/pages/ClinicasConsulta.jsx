import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Globe, Search, Bot,
  BarChart2, Megaphone, Sparkles, Check, CheckCircle,
  Loader2, Mail, Lock, MessageCircle, Calendar,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './CalculadoraLanding.css';
import './ClinicasConsulta.css';

const CALENDLY_URL = 'https://calendly.com/agutidesigns/reunion';

const SERVICIOS = [
  { id: 'web',      label: 'Web profesional para clínica', desc: 'Diseño moderno, rápido y adaptado a móvil',     icon: <Globe size={22} /> },
  { id: 'seo',      label: 'SEO local en Google',          desc: 'Aparecer en los primeros puestos de tu ciudad', icon: <Search size={22} /> },
  { id: 'ia',       label: 'Chatbot IA en la web',          desc: 'Responde preguntas y capta leads 24/7',         icon: <Bot size={22} /> },
  { id: 'ads',      label: 'Google / Meta Ads',            desc: 'Campañas de captación de nuevos pacientes',     icon: <Megaphone size={22} /> },
  { id: 'panel',    label: 'Panel de métricas',            desc: 'Control total de visitas, SEO y conversiones',  icon: <BarChart2 size={22} /> },
  { id: 'completo', label: 'Pack completo',                desc: 'Todo lo anterior · Mejor precio garantizado',   icon: <Sparkles size={22} />, popular: true },
];

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Servicios', 'Tu clínica', 'Tus datos'];

export default function ClinicasConsulta() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Recuperar estado desde URL params al recargar
  const initialDone    = searchParams.get('reserva') === '1';
  const initialNombre  = searchParams.get('nombre')  || '';
  const initialClinica = searchParams.get('clinica') || '';
  const initialEmail   = searchParams.get('email')   || '';

  const [step, setStep]         = useState(initialDone ? 4 : 1);
  const [servicios, setServicios] = useState([]);
  const [clinica, setClinica]   = useState(initialClinica);
  const [ciudad, setCiudad]     = useState('');
  const [webActual, setWebActual] = useState('');
  const [nombre, setNombre]     = useState(initialNombre);
  const [email, setEmail]       = useState(initialEmail);
  const [telefono, setTelefono] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(initialDone);

  const progress = ((Math.min(step, TOTAL_STEPS) - 1) / (TOTAL_STEPS - 1)) * 100;

  const toggle = (id) => {
    if (id === 'completo') { setServicios(['completo']); return; }
    setServicios(prev => {
      const without = prev.filter(v => v !== 'completo');
      return without.includes(id) ? without.filter(v => v !== id) : [...without, id];
    });
  };

  const validate = () => {
    setError('');
    if (step === 1 && servicios.length === 0) { setError('Selecciona al menos un servicio para continuar.'); return false; }
    if (step === 2 && !clinica.trim())         { setError('Escribe el nombre de tu clínica.'); return false; }
    if (step === 3) {
      if (!nombre.trim())        { setError('Introduce tu nombre.'); return false; }
      if (!email.includes('@'))  { setError('Introduce un email válido.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await supabase.from('clinicas_leads').insert({
        nombre, clinica, ciudad, email, telefono,
        web_actual: webActual,
        pacientes_objetivo: null,
        situacion: servicios,
        fuente: 'landing-clinicas',
      });
    } catch (_) { /* continúa aunque falle */ }
    setSubmitting(false);

    // Conversión Google Ads — envío de formulario para clientes potenciales
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18145697321/xhZPCNfgk6kcEKm8xcxD',
        value: 1.0,
        currency: 'EUR',
      });
    }

    // Navegar a la misma página con params para que el refresco no pierda el estado
    const params = new URLSearchParams({
      reserva: '1',
      nombre,
      clinica,
      email,
    });
    navigate(`/clinicas-dentales/consulta?${params.toString()}`, { replace: true });
    setDone(true);
    setStep(4);
  };

  const calendlyUrl = `${CALENDLY_URL}?name=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&a1=${encodeURIComponent(clinica)}`;

  const serviciosLabel = servicios
    .map(id => SERVICIOS.find(s => s.id === id)?.label || id)
    .join(', ');

  const waMessage = encodeURIComponent(
    `Hola Alejandro 👋\n\nAcabo de rellenar el formulario en tu web y me gustaría hablar contigo.\n\n` +
    `🏥 Clínica: ${clinica}${ciudad ? ` (${ciudad})` : ''}\n` +
    `👤 Nombre: ${nombre}\n` +
    `📧 Email: ${email}\n` +
    `🛠️ Servicios que me interesan: ${serviciosLabel}${webActual ? `\n🌐 Web actual: ${webActual}` : ''}\n\n` +
    `¿Podemos agendar una llamada?`
  );
  const waUrl = `https://wa.me/34625204337?text=${waMessage}`;

  return (
    <div className="calc-landing">

      {/* ── Header idéntico al de la calculadora ── */}
      <header className="calc-header">
        <a href="/clinicas-dentales" className="calc-header__logo" onClick={e => { e.preventDefault(); navigate('/clinicas-dentales'); }}>
          <img src="/images/logoazul.png" alt="AgutiDesigns" className="calc-header__logo-img" />
        </a>
        <a href="/clinicas-dentales" className="calc-header__back" onClick={e => { e.preventDefault(); navigate('/clinicas-dentales'); }}>
          ← Volver a la web
        </a>
      </header>

      <main className={`calc-main${done ? ' calc-main--top' : ''}`}>
        <AnimatePresence mode="wait">

          {/* ── Formulario (pasos 1-3) ── */}
          {!done && (
            <motion.div key="form" className="calc-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <div className="calc-form__top">
                <span className="calc-badge"><Sparkles size={12} /> Consulta estratégica gratuita</span>
                <h1 className="calc-form__title">¿Cómo podemos<span className="text-primary"> ayudar a tu clínica?</span></h1>
                <p className="calc-form__subtitle">Responde {TOTAL_STEPS} preguntas y reserva tu llamada de 30 min gratis.</p>
              </div>

              {/* Progress (igual que calculadora) */}
              <div className="calc-progress">
                <div className="calc-progress__bar">
                  <div className="calc-progress__fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="calc-progress__steps">
                  {STEP_LABELS.map((label, i) => (
                    <span key={i} className={`calc-progress__step ${step > i + 1 ? 'calc-progress__step--done' : ''} ${step === i + 1 ? 'calc-progress__step--active' : ''}`}>
                      <span className="calc-progress__step-dot">{step > i + 1 ? <Check size={8} /> : i + 1}</span>
                      <span className="calc-progress__step-label">{label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pasos */}
              <AnimatePresence mode="wait">
                <motion.div key={step} className="calc-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                  {/* PASO 1: Servicios */}
                  {step === 1 && (
                    <>
                      <h2 className="calc-step__title">¿Qué necesita tu clínica?</h2>
                      <p className="calc-step__desc">Selecciona todo lo que te interese. Puedes elegir varios.</p>
                      <div className="calc-types">
                        {SERVICIOS.map(s => (
                          <button
                            key={s.id}
                            className={`calc-type ${servicios.includes(s.id) ? 'calc-type--active' : ''}`}
                            onClick={() => toggle(s.id)}
                            type="button"
                          >
                            <div className="calc-type__icon">{s.icon}</div>
                            <div className="calc-type__info">
                              <span className="calc-type__label">
                                {s.label}
                                {s.popular && <span className="calc-type__popular">Popular</span>}
                              </span>
                              <span className="calc-type__desc">{s.desc}</span>
                            </div>
                            {servicios.includes(s.id) && <Check size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* PASO 2: Clínica */}
                  {step === 2 && (
                    <>
                      <h2 className="calc-step__title">Cuéntanos sobre tu clínica</h2>
                      <p className="calc-step__desc">Dos datos para personalizar tu consulta estratégica.</p>

                      <div className="calc-field">
                        <label className="calc-field__label">Nombre de la clínica *</label>
                        <input className="calc-input" type="text" placeholder="Ej. Clínica Dental Sonrisa" value={clinica} onChange={e => setClinica(e.target.value)} />
                      </div>
                      <div className="calc-field">
                        <label className="calc-field__label">Ciudad</label>
                        <input className="calc-input" type="text" placeholder="Ej. Barcelona" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                      </div>
                      <div className="calc-field">
                        <label className="calc-field__label">Web actual <span style={{ fontWeight: 400, color: 'var(--color-gray-500)' }}>(opcional)</span></label>
                        <input className="calc-input" type="url" placeholder="https://tuclinica.com" value={webActual} onChange={e => setWebActual(e.target.value)} />
                      </div>
                    </>
                  )}

                  {/* PASO 3: Datos de contacto */}
                  {step === 3 && (
                    <>
                      <h2 className="calc-step__title">Último paso: tus datos</h2>
                      <p className="calc-step__desc">Solo necesitamos tu nombre y email para mostrarte disponibilidad.</p>

                      <div className="calc-field">
                        <label className="calc-field__label">Tu nombre *</label>
                        <input className="calc-input" type="text" placeholder="¿Cómo te llamas?" value={nombre} onChange={e => setNombre(e.target.value)} />
                      </div>
                      <div className="calc-field">
                        <label className="calc-field__label">Email *</label>
                        <div className="calc-input-wrap">
                          <Mail size={16} className="calc-input-wrap__icon" />
                          <input className="calc-input calc-input--icon" type="email" placeholder="tu@clinica.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>
                      </div>
                      <div className="calc-field">
                        <label className="calc-field__label">Teléfono / WhatsApp <span style={{ fontWeight: 400, color: 'var(--color-gray-500)' }}>(opcional)</span></label>
                        <input className="calc-input" type="tel" placeholder="+34 600 000 000" value={telefono} onChange={e => setTelefono(e.target.value)} />
                      </div>
                      <div className="calc-privacy"><Lock size={12} /><span>Sin spam. Solo te enviamos la confirmación de tu llamada.</span></div>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              {error && <p className="calc-error">{error}</p>}

              {/* Navegación (igual que calculadora) */}
              <div className="calc-nav">
                {step > 1 && <button className="calc-btn calc-btn--ghost" onClick={prev}><ArrowLeft size={16} /> Anterior</button>}
                <div className="calc-nav__spacer" />
                {step < TOTAL_STEPS
                  ? <button className="calc-btn calc-btn--primary" onClick={next}>Siguiente <ArrowRight size={16} /></button>
                  : <button className="calc-btn calc-btn--primary calc-btn--lg" onClick={handleSubmit} disabled={submitting}>
                      {submitting
                        ? <><Loader2 size={18} className="cc-spin" /> Enviando...</>
                        : <><Sparkles size={18} /> Ver disponibilidad</>}
                    </button>}
              </div>

            </motion.div>
          )}

          {/* ── Resultado (paso 4) ── */}
          {done && (
            <motion.div key="done" className="cc-done-page" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

              {/* Header */}
              <div className="cc-done-header">
                <div className="calc-result__check"><CheckCircle size={48} /></div>
                <h1 className="calc-result__greeting">¡Gracias, {nombre.split(' ')[0]}!</h1>
                <p className="calc-result__sub">
                  Hemos recibido tu solicitud para <strong>{clinica}</strong>.<br />
                  Elige cómo prefieres que nos pongamos en contacto:
                </p>
              </div>

              {/* Dos opciones */}
              <div className="cc-contact-options">

                {/* WhatsApp */}
                <div className="cc-contact-card cc-contact-card--wa">
                  <div className="cc-contact-card__icon">
                    <MessageCircle size={28} />
                  </div>
                  <div className="cc-contact-card__body">
                    <h3>Escríbeme por WhatsApp</h3>
                    <p>Respondo en menos de 2 horas. Tu mensaje incluye automáticamente todos los datos del formulario.</p>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-contact-btn cc-contact-btn--wa"
                    >
                      <MessageCircle size={18} /> Abrir WhatsApp
                    </a>
                  </div>
                </div>

                {/* Calendly */}
                <div className="cc-contact-card cc-contact-card--cal">
                  <div className="cc-contact-card__icon">
                    <Calendar size={28} />
                  </div>
                  <div className="cc-contact-card__body">
                    <h3>Reserva una videollamada</h3>
                    <p>Elige el hueco que mejor te venga. 30 minutos para analizar tu clínica y ver cómo podemos ayudarte.</p>
                    <button
                      className="cc-contact-btn cc-contact-btn--cal"
                      onClick={() => document.getElementById('cc-calendly-section').scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Calendar size={18} /> Ver disponibilidad
                    </button>
                  </div>
                </div>

              </div>

              {/* Calendly iframe */}
              <div id="cc-calendly-section" className="cc-calendly-wrap">
                <div className="cc-calendly-label">
                  <Calendar size={14} /> Selecciona fecha y hora
                </div>
                <iframe src={calendlyUrl} title="Reservar llamada" className="cc-calendly-iframe" frameBorder="0" />
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="calc-footer">
        <span>© {new Date().getFullYear()} AgutiDesigns · <a href="/clinicas-dentales" onClick={e => { e.preventDefault(); navigate('/clinicas-dentales'); }}>Volver a la web</a></span>
      </footer>

    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Globe, Search, Bot,
  BarChart2, Megaphone, Sparkles, User, Building,
  Phone, Mail, CheckCircle, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './ClinicasLeadForm.css';

const CALENDLY_URL = 'https://calendly.com/alejandro-agutidesigns/reunion';

const SERVICIOS = [
  { value: 'web',       label: 'Web profesional',         desc: 'Diseño + desarrollo',   icon: Globe },
  { value: 'seo',       label: 'SEO local en Google',     desc: 'Aparecer en el top 3',  icon: Search },
  { value: 'ia',        label: 'Chatbot IA en la web',    desc: 'Responde preguntas 24/7', icon: Bot },
  { value: 'ads',       label: 'Google / Meta Ads',       desc: 'Publicidad online',      icon: Megaphone },
  { value: 'panel',     label: 'Panel de métricas',       desc: 'Control total',          icon: BarChart2 },
  { value: 'completo',  label: 'Pack completo',           desc: 'Todo lo anterior',       icon: Sparkles },
];

const STEPS = [
  { id: 1, title: 'Servicios', icon: <Sparkles size={16} /> },
  { id: 2, title: 'Tu clínica', icon: <Building size={16} /> },
  { id: 3, title: 'Tus datos',  icon: <User size={16} /> },
];

export default function ClinicasLeadForm({ onClose }) {
  const [step, setStep]         = useState(1);
  const [servicios, setServicios] = useState([]);
  const [clinica, setClinica]   = useState('');
  const [ciudad, setCiudad]     = useState('');
  const [webActual, setWebActual] = useState('');
  const [nombre, setNombre]     = useState('');
  const [email, setEmail]       = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);

  const toggle = (val) => setServicios(prev =>
    prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
  );

  const validate = () => {
    setError('');
    if (step === 1 && servicios.length === 0) { setError('Selecciona al menos un servicio.'); return false; }
    if (step === 2 && !clinica.trim())         { setError('Escribe el nombre de tu clínica.'); return false; }
    if (step === 3) {
      if (!nombre.trim())  { setError('Escribe tu nombre.'); return false; }
      if (!email.includes('@')) { setError('Introduce un email válido.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    const { error: dbErr } = await supabase.from('clinicas_leads').insert({
      nombre,
      clinica,
      ciudad,
      email,
      telefono,
      web_actual:         webActual,
      pacientes_objetivo: null,
      situacion:          servicios,
      fuente:             'landing-clinicas',
    });
    setSubmitting(false);
    if (dbErr) { setError('Algo salió mal. Inténtalo de nuevo.'); return; }
    setDone(true);
    setStep(4);
  };

  const calendlyUrl = `${CALENDLY_URL}?name=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&a1=${encodeURIComponent(clinica)}`;

  return (
    <div className="clf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="clf-modal">

        {/* Header */}
        <div className="clf-header">
          <div>
            <p className="clf-header__pre">Consulta estratégica gratuita · 30 min</p>
            <h2 className="clf-header__title">
              {step === 4 ? `¡Listo, ${nombre.split(' ')[0]}! Reserva tu llamada` : 'Cuéntanos qué necesitas'}
            </h2>
          </div>
          <button className="clf-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        {step <= 3 && (
          <div className="clf-progress">
            <div className="quote__progress">
              {STEPS.map(s => (
                <div
                  key={s.id}
                  className={`quote__progress-step ${s.id === step ? 'quote__progress-step--active' : ''} ${s.id < step ? 'quote__progress-step--done' : ''}`}
                >
                  <div className="quote__progress-icon">{s.icon}</div>
                  <span className="quote__progress-label">{s.title}</span>
                </div>
              ))}
              <div className="quote__progress-bar">
                <div className="quote__progress-fill" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="clf-body">
          <AnimatePresence mode="wait">

            {/* Step 1: Servicios */}
            {step === 1 && (
              <motion.div key="s1" className="quote__step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h3 className="quote__step-title">¿Qué necesita tu clínica?</h3>
                <p className="quote__step-desc">Selecciona todo lo que te interese. Puedes elegir varios.</p>
                <div className="clf-servicios-grid">
                  {SERVICIOS.map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      className={`clf-servicio-card ${servicios.includes(value) ? 'clf-servicio-card--active' : ''}`}
                      onClick={() => toggle(value)}
                    >
                      <div className="clf-servicio-card__icon"><Icon size={22} /></div>
                      <span className="clf-servicio-card__label">{label}</span>
                      <span className="clf-servicio-card__desc">{desc}</span>
                      {servicios.includes(value) && (
                        <div className="clf-servicio-card__check"><CheckCircle size={16} /></div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Clínica */}
            {step === 2 && (
              <motion.div key="s2" className="quote__step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h3 className="quote__step-title">Cuéntanos sobre tu clínica</h3>
                <p className="quote__step-desc">Dos datos rápidos para personalizar la llamada.</p>
                <div className="quote__fields">
                  <div className="quote__field">
                    <label>Nombre de la clínica *</label>
                    <input type="text" className="quote__input" placeholder="Ej. Clínica Dental Sonrisa" value={clinica} onChange={e => setClinica(e.target.value)} />
                  </div>
                  <div className="quote__field">
                    <label>Ciudad</label>
                    <input type="text" className="quote__input" placeholder="Ej. Barcelona" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                  </div>
                  <div className="quote__field">
                    <label>Web actual (si tienes)</label>
                    <input type="url" className="quote__input" placeholder="https://tuclínica.com" value={webActual} onChange={e => setWebActual(e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Datos de contacto */}
            {step === 3 && (
              <motion.div key="s3" className="quote__step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h3 className="quote__step-title">¿Con quién hablamos?</h3>
                <p className="quote__step-desc">Último paso — reserva tu llamada gratuita al enviar.</p>
                <div className="quote__fields">
                  <div className="quote__field">
                    <label>Tu nombre *</label>
                    <input type="text" className="quote__input" placeholder="Nombre y apellido" value={nombre} onChange={e => setNombre(e.target.value)} />
                  </div>
                  <div className="quote__field">
                    <label>Email *</label>
                    <input type="email" className="quote__input" placeholder="tu@clinica.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="quote__field">
                    <label>Teléfono / WhatsApp</label>
                    <input type="tel" className="quote__input" placeholder="+34 600 000 000" value={telefono} onChange={e => setTelefono(e.target.value)} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Calendly */}
            {step === 4 && (
              <motion.div key="s4" className="quote__step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="clf-success-badge">
                  <CheckCircle size={28} />
                  <div>
                    <strong>Solicitud recibida</strong>
                    <p>Elige el hueco que mejor te venga. Te llevo el análisis de <strong>{clinica}</strong> preparado.</p>
                  </div>
                </div>
                <div className="clf-calendly-wrap">
                  <iframe src={calendlyUrl} title="Reservar llamada" className="clf-calendly-iframe" frameBorder="0" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p className="quote__error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              {error}
            </motion.p>
          )}
        </div>

        {/* Footer */}
        {step <= 3 && (
          <div className="quote__actions clf-footer-actions">
            {step > 1
              ? <button className="btn btn--ghost btn--md" onClick={prev}><ArrowLeft size={16} /> Anterior</button>
              : <span />}
            {step < 3
              ? <button className="btn btn--primary btn--md" onClick={next}>Siguiente <ArrowRight size={16} /></button>
              : <button className="btn btn--primary btn--lg clf-btn-submit" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={17} className="spin" /> Enviando...</>
                    : <>Ver disponibilidad <ArrowRight size={16} /></>}
                </button>}
          </div>
        )}

      </div>
    </div>
  );
}

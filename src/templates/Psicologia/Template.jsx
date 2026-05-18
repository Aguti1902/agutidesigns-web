import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, ArrowRight, Heart } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const DEFAULT_SERVICES = [
  { name: 'Terapia Individual', price: '60€/sesión', description: 'Espacio seguro para trabajar tus emociones y pensamientos' },
  { name: 'Terapia de Pareja', price: '80€/sesión', description: 'Mejora la comunicación y el vínculo con tu pareja' },
  { name: 'Psicología Infantil', price: '55€/sesión', description: 'Apoyo especializado para niños y adolescentes' },
];

export default function PsicologiaTemplate({ businessData = {} }) {
  const {
    businessName = 'Tu Consulta de Psicología',
    description = 'Ofrezco un espacio seguro y de confianza donde trabajaremos juntos para mejorar tu bienestar emocional. Mi enfoque es integrador, centrado en tus necesidades únicas.',
    services = DEFAULT_SERVICES,
    phone = '612 345 678', email = 'consulta@psicologia.com', address = 'Calle Serena 8, Madrid', schedule = 'Lun–Vie 9:00–20:00',
    logoPreview = null, primaryColor = '#6B5B95', secondaryColor = '#F5F0FF', photosPreviews = [],
  } = businessData;

  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;
  const photos = photosPreviews.length > 0 ? photosPreviews : [];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    .psi { font-family: 'Inter', sans-serif; color: #2A1F3D; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; }
    .psi * { box-sizing: border-box; margin: 0; padding: 0; }
    .psi-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; background: #fff; border-bottom: 1px solid #f0eaf8; position: sticky; top: 0; z-index: 100; }
    .psi-nav-name { font-family: 'Lora', serif; font-size: 18px; font-weight: 700; color: var(--p); display: flex; align-items: center; gap: 10px; }
    .psi-nav-name img { height: 40px; border-radius: 50%; object-fit: contain; }
    .psi-nav-links { display: flex; gap: 28px; font-size: 14px; color: #666; }
    .psi-nav-cta { background: var(--p); color: #fff; padding: 10px 22px; border-radius: 40px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .psi-hero { background: var(--s); padding: 100px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .psi-hero-eyebrow { font-size: 13px; font-weight: 600; color: var(--p); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; display: flex; align-items: center; gap: 6px; }
    .psi-hero h1 { font-family: 'Lora', serif; font-size: clamp(34px, 4vw, 54px); font-weight: 700; color: #2A1F3D; line-height: 1.2; margin-bottom: 20px; }
    .psi-hero p { font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 36px; }
    .psi-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .psi-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--p); color: #fff; padding: 14px 28px; border-radius: 40px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: opacity .2s; }
    .psi-btn:hover { opacity: .88; }
    .psi-btn-g { display: inline-flex; align-items: center; gap: 8px; color: var(--p); font-weight: 600; font-size: 14px; cursor: pointer; background: none; border: none; }
    .psi-hero-img { border-radius: 24px; overflow: hidden; aspect-ratio: 3/4; box-shadow: 0 20px 60px rgba(107,91,149,.15); background: linear-gradient(160deg, #d8cbf5, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .psi-hero-img img { width: 100%; height: 100%; object-fit: cover; }
    .psi-section { padding: 80px 60px; }
    .psi-alt { background: var(--s); }
    .psi-tag { font-size: 13px; font-weight: 600; color: var(--p); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: block; }
    .psi-title { font-family: 'Lora', serif; font-size: clamp(26px, 3vw, 40px); font-weight: 700; color: #2A1F3D; line-height: 1.25; margin-bottom: 14px; }
    .psi-sub { font-size: 16px; color: #666; line-height: 1.8; max-width: 540px; }
    .psi-header { margin-bottom: 52px; }
    .psi-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .psi-card { background: #fff; border-radius: 20px; padding: 32px; border: 1.5px solid rgba(107,91,149,.1); transition: all .3s; }
    .psi-card:hover { border-color: var(--p); box-shadow: 0 12px 40px rgba(107,91,149,.12); transform: translateY(-4px); }
    .psi-card-emoji { font-size: 36px; margin-bottom: 18px; }
    .psi-card-name { font-family: 'Lora', serif; font-size: 19px; font-weight: 700; margin-bottom: 10px; }
    .psi-card-desc { font-size: 14px; color: #777; line-height: 1.6; margin-bottom: 16px; }
    .psi-card-price { color: var(--p); font-weight: 700; font-size: 15px; }
    .psi-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .psi-step { text-align: center; padding: 32px 20px; }
    .psi-step-num { width: 52px; height: 52px; background: var(--p); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Lora', serif; font-size: 22px; font-weight: 700; margin: 0 auto 18px; }
    .psi-step-title { font-family: 'Lora', serif; font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .psi-step-desc { font-size: 14px; color: #777; line-height: 1.6; }
    .psi-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
    .psi-contact-info { display: flex; flex-direction: column; gap: 14px; }
    .psi-ci { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--s); border-radius: 14px; }
    .psi-ci-icon { color: var(--p); flex-shrink: 0; }
    .psi-ci-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 2px; }
    .psi-ci-value { font-size: 14px; font-weight: 500; color: #2A1F3D; }
    .psi-form { display: flex; flex-direction: column; gap: 14px; }
    .psi-field label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
    .psi-field input, .psi-field textarea { width: 100%; border: 1.5px solid #e8dff5; border-radius: 12px; padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 14px; background: var(--s); outline: none; transition: border-color .2s; resize: none; }
    .psi-field input:focus, .psi-field textarea:focus { border-color: var(--p); background: #fff; }
    .psi-submit { background: var(--p); color: #fff; border: none; padding: 14px; border-radius: 40px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .psi-footer { background: #2A1F3D; color: rgba(255,255,255,.4); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 13px; }
    .psi-footer-logo { font-family: 'Lora', serif; font-size: 16px; font-weight: 700; color: #fff; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="psi">
        <nav className="psi-nav">
          <div className="psi-nav-name">
            {logoPreview && <img src={logoPreview} alt={businessName} />}
            {businessName}
          </div>
          <div className="psi-nav-links">
            <a href="#servicios">Especialidades</a>
            <a href="#como">Cómo funciona</a>
            <a href="#contacto">Contacto</a>
          </div>
          <button className="psi-nav-cta">Primera cita</button>
        </nav>

        <section className="psi-hero">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="psi-hero-eyebrow" variants={fadeUp}><Heart size={14} />Psicología · Bienestar · Crecimiento</motion.div>
            <motion.h1 variants={fadeUp}>Un espacio seguro para ti</motion.h1>
            <motion.p variants={fadeUp}>{description.slice(0, 180)}{description.length > 180 ? '…' : ''}</motion.p>
            <motion.div className="psi-hero-actions" variants={fadeUp}>
              <button className="psi-btn"><Phone size={14} /> Concertar cita</button>
              <button className="psi-btn-g">Conocer más <ArrowRight size={14} /></button>
            </motion.div>
          </motion.div>
          <motion.div className="psi-hero-img" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            {photos[0] && photos[0].startsWith('data:') ? <img src={photos[0]} alt={businessName} /> : '🧠'}
          </motion.div>
        </section>

        <section className="psi-section" id="servicios">
          <motion.div className="psi-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="psi-tag" variants={fadeUp}>Especialidades</motion.span>
            <motion.h2 className="psi-title" variants={fadeUp}>¿En qué puedo ayudarte?</motion.h2>
            <motion.p className="psi-sub" variants={fadeUp}>Cada persona es única. Adaptamos el tratamiento a tus necesidades.</motion.p>
          </motion.div>
          <motion.div className="psi-cards" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="psi-card" variants={fadeUp}>
                <div className="psi-card-emoji">{['🧠', '💑', '👶', '😰', '🌙', '🌱'][i % 6]}</div>
                <div className="psi-card-name">{s.name}</div>
                <div className="psi-card-desc">{s.description || 'Atención psicológica personalizada y profesional.'}</div>
                {s.price && <div className="psi-card-price">{s.price}</div>}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="psi-section psi-alt" id="como">
          <motion.div className="psi-header" style={{ textAlign: 'center' }} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="psi-tag" variants={fadeUp}>El proceso</motion.span>
            <motion.h2 className="psi-title" variants={fadeUp}>¿Cómo empezamos?</motion.h2>
          </motion.div>
          <motion.div className="psi-steps" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[
              { s: '1', t: 'Primer contacto', d: 'Me escribes o llamas y acordamos una primera sesión exploratoria sin compromiso.' },
              { s: '2', t: 'Evaluación inicial', d: 'Hablamos de tu situación y definimos juntos los objetivos del proceso.' },
              { s: '3', t: 'Proceso terapéutico', d: 'Sesiones regulares adaptadas a tu ritmo donde trabajamos hacia tu bienestar.' },
              { s: '4', t: 'Alta terapéutica', d: 'Cuando alcanzas tus objetivos, cerramos con herramientas para el futuro.' },
            ].map((step, i) => (
              <motion.div key={i} className="psi-step" variants={fadeUp}>
                <div className="psi-step-num">{step.s}</div>
                <div className="psi-step-title">{step.t}</div>
                <div className="psi-step-desc">{step.d}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="psi-section" id="contacto">
          <motion.div className="psi-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="psi-tag" variants={fadeUp}>Contacto</motion.span>
            <motion.h2 className="psi-title" variants={fadeUp}>Da el primer paso</motion.h2>
            <motion.p className="psi-sub" variants={fadeUp}>Estoy aquí para ayudarte. No esperes más.</motion.p>
          </motion.div>
          <div className="psi-contact-grid">
            <div className="psi-contact-info">
              {[{ icon: <Phone size={17} />, label: 'Teléfono', value: phone }, { icon: <Mail size={17} />, label: 'Email', value: email }, { icon: <MapPin size={17} />, label: 'Consulta', value: address }, { icon: <Clock size={17} />, label: 'Horario', value: schedule }].filter(i => i.value).map((item, i) => (
                <div key={i} className="psi-ci">
                  <span className="psi-ci-icon">{item.icon}</span>
                  <div><div className="psi-ci-label">{item.label}</div><div className="psi-ci-value">{item.value}</div></div>
                </div>
              ))}
            </div>
            <form className="psi-form" onSubmit={e => e.preventDefault()}>
              <div className="psi-field"><label>Nombre</label><input type="text" placeholder="Tu nombre" /></div>
              <div className="psi-field"><label>Email o teléfono</label><input type="text" placeholder="Para contactarte" /></div>
              <div className="psi-field"><label>¿Qué te trae aquí?</label><textarea rows={4} placeholder="Cuéntame brevemente (opcional)..." /></div>
              <button className="psi-submit" type="submit"><Heart size={14} /> Solicitar primera cita</button>
            </form>
          </div>
        </section>

        <footer className="psi-footer">
          <div className="psi-footer-logo">🧠 {businessName}</div>
          <span>© {new Date().getFullYear()} {businessName}. Consulta confidencial.</span>
        </footer>
      </div>
    </>
  );
}

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Check, ArrowRight } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const DEFAULT_SERVICES = [
  { name: 'Fisioterapia Manual', price: '55€/sesión', description: 'Técnicas manuales para alivio del dolor y recuperación' },
  { name: 'Rehabilitación Deportiva', price: '60€/sesión', description: 'Tratamiento especializado para lesiones deportivas' },
  { name: 'Electroterapia', price: '35€/sesión', description: 'Ultrasonidos, TENS y corrientes de baja frecuencia' },
];

export default function FisioterapiaTemplate({ businessData = {} }) {
  const {
    businessName = 'Tu Clínica de Fisioterapia',
    description = 'Somos especialistas en fisioterapia y rehabilitación física. Ayudamos a nuestros pacientes a recuperar su movilidad y bienestar con técnicas avanzadas y tratamientos personalizados.',
    services = DEFAULT_SERVICES,
    phone = '612 345 678', email = 'info@tufisio.com', address = 'Calle Principal 10, Madrid', schedule = 'Lun–Vie 8:00–21:00',
    logoPreview = null, primaryColor = '#2D9E4F', secondaryColor = '#E8F5EC', photosPreviews = [],
  } = businessData;

  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;
  const photos = photosPreviews.length > 0 ? photosPreviews : [];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .ft { font-family: 'Inter', sans-serif; color: #1A2E1A; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; }
    .ft * { box-sizing: border-box; margin: 0; padding: 0; }
    .ft-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; background: #fff; box-shadow: 0 1px 0 #eee; position: sticky; top: 0; z-index: 100; }
    .ft-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--p); }
    .ft-nav-logo img { height: 40px; border-radius: 6px; object-fit: contain; }
    .ft-nav-links { display: flex; gap: 28px; font-size: 14px; color: #444; }
    .ft-nav-cta { background: var(--p); color: #fff; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .ft-hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 580px; }
    .ft-hero-left { background: linear-gradient(160deg, var(--p) 0%, #1a6e34 100%); padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; }
    .ft-hero-right { position: relative; overflow: hidden; background: linear-gradient(135deg, #a8e6bf 0%, var(--p) 100%); display: flex; align-items: center; justify-content: center; font-size: 120px; }
    .ft-hero-right img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
    .ft-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.15); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-bottom: 20px; }
    .ft-hero h1 { font-size: clamp(32px, 4vw, 52px); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 20px; }
    .ft-hero p { color: rgba(255,255,255,.85); font-size: 16px; line-height: 1.7; margin-bottom: 36px; }
    .ft-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .ft-btn-w { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: var(--p); padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; }
    .ft-btn-g { display: inline-flex; align-items: center; gap: 8px; border: 2px solid rgba(255,255,255,.5); color: #fff; padding: 12px 26px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; background: transparent; }
    .ft-section { padding: 80px 60px; }
    .ft-alt { background: var(--s); }
    .ft-tag { display: inline-block; background: var(--s); color: var(--p); font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .ft-title { font-size: clamp(26px, 3vw, 40px); font-weight: 800; color: #1A2E1A; margin-bottom: 14px; line-height: 1.2; }
    .ft-sub { font-size: 16px; color: #555; line-height: 1.7; max-width: 540px; }
    .ft-header { margin-bottom: 52px; }
    .ft-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
    .ft-card { border: 1.5px solid #e8f5ec; border-radius: 16px; padding: 28px; background: #fafff9; transition: all .3s; }
    .ft-card:hover { border-color: var(--p); box-shadow: 0 8px 30px rgba(45,158,79,.1); transform: translateY(-4px); }
    .ft-card-emoji { font-size: 36px; margin-bottom: 16px; }
    .ft-card-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .ft-card-desc { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 14px; }
    .ft-card-price { background: var(--s); color: var(--p); display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .ft-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .ft-photos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .ft-photo { border-radius: 12px; overflow: hidden; aspect-ratio: 1; background: linear-gradient(135deg, #a8e6bf, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 36px; }
    .ft-photo img { width: 100%; height: 100%; object-fit: cover; }
    .ft-points { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
    .ft-point { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #333; }
    .ft-point-dot { width: 20px; height: 20px; background: var(--p); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ft-point-dot svg { color: #fff; }
    .ft-contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .ft-contact-card { background: var(--s); border-radius: 14px; padding: 24px; display: flex; align-items: flex-start; gap: 14px; }
    .ft-ci { width: 44px; height: 44px; background: var(--p); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ft-ci svg { color: #fff; }
    .ft-cl { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .ft-cv { font-size: 14px; font-weight: 600; color: #1A2E1A; }
    .ft-footer { background: #1A2E1A; color: rgba(255,255,255,.5); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 13px; }
    .ft-footer-logo { font-weight: 700; font-size: 16px; color: #fff; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="ft">
        <nav className="ft-nav">
          <div className="ft-nav-logo">
            {logoPreview ? <img src={logoPreview} alt={businessName} /> : <span>💪</span>}
            <span>{businessName}</span>
          </div>
          <div className="ft-nav-links">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </div>
          <button className="ft-nav-cta">Pedir cita</button>
        </nav>

        <section className="ft-hero">
          <div className="ft-hero-left">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div className="ft-badge" variants={fadeUp}>🏃 Recupera tu movilidad</motion.div>
              <motion.h1 variants={fadeUp}>{businessName}</motion.h1>
              <motion.p variants={fadeUp}>{description.slice(0, 160)}{description.length > 160 ? '…' : ''}</motion.p>
              <motion.div className="ft-hero-actions" variants={fadeUp}>
                <button className="ft-btn-w"><Phone size={15} /> Llamar</button>
                <button className="ft-btn-g">Reservar cita <ArrowRight size={15} /></button>
              </motion.div>
            </motion.div>
          </div>
          <div className="ft-hero-right">
            {photos[0] && photos[0].startsWith('data:') ? <img src={photos[0]} alt="" /> : '🏃‍♀️'}
          </div>
        </section>

        <section className="ft-section" id="servicios">
          <motion.div className="ft-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="ft-tag" variants={fadeUp}>Servicios</motion.span>
            <motion.h2 className="ft-title" variants={fadeUp}>Tratamientos especializados</motion.h2>
            <motion.p className="ft-sub" variants={fadeUp}>Técnicas avanzadas para tu recuperación y bienestar físico.</motion.p>
          </motion.div>
          <motion.div className="ft-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="ft-card" variants={fadeUp}>
                <div className="ft-card-emoji">{['💆', '🏋️', '⚡', '🎯', '🌿', '🔬'][i % 6]}</div>
                <div className="ft-card-name">{s.name}</div>
                <div className="ft-card-desc">{s.description || 'Tratamiento profesional personalizado.'}</div>
                {s.price && <div className="ft-card-price">{s.price}</div>}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="ft-section ft-alt" id="nosotros">
          <div className="ft-about-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.span className="ft-tag" variants={fadeUp}>Sobre nosotros</motion.span>
              <motion.h2 className="ft-title" variants={fadeUp}>Expertos en tu recuperación</motion.h2>
              <motion.p className="ft-sub" variants={fadeUp}>{description}</motion.p>
              <motion.div className="ft-points" variants={stagger}>
                {['Fisioterapeutas colegiados y certificados', 'Instalaciones modernas y equipadas', 'Plan de tratamiento personalizado', 'Seguimiento continuo de tu evolución'].map((p, i) => (
                  <motion.div key={i} className="ft-point" variants={fadeUp}>
                    <div className="ft-point-dot"><Check size={11} /></div>
                    <span>{p}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div className="ft-photos" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {[0,1,2,3].map(i => (
                <div key={i} className="ft-photo">
                  {photos[i] && photos[i].startsWith('data:') ? <img src={photos[i]} alt="" /> : '💪'}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="ft-section" id="contacto">
          <motion.div className="ft-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="ft-tag" variants={fadeUp}>Contacto</motion.span>
            <motion.h2 className="ft-title" variants={fadeUp}>¿Cómo llegar?</motion.h2>
          </motion.div>
          <motion.div className="ft-contact-cards" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[{ icon: <Phone size={19} />, label: 'Teléfono', value: phone }, { icon: <Mail size={19} />, label: 'Email', value: email }, { icon: <MapPin size={19} />, label: 'Dirección', value: address }, { icon: <Clock size={19} />, label: 'Horario', value: schedule }].filter(i => i.value).map((item, i) => (
              <motion.div key={i} className="ft-contact-card" variants={fadeUp}>
                <div className="ft-ci">{item.icon}</div>
                <div><div className="ft-cl">{item.label}</div><div className="ft-cv">{item.value}</div></div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <footer className="ft-footer">
          <div className="ft-footer-logo">💪 {businessName}</div>
          <span>© {new Date().getFullYear()} {businessName}. Todos los derechos reservados.</span>
        </footer>
      </div>
    </>
  );
}

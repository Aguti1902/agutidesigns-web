import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Check, ArrowRight, Zap } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const DEFAULT_SERVICES = [
  { name: 'Servicio Principal', price: 'Desde 49€', description: 'Descripción del servicio principal de tu negocio' },
  { name: 'Servicio Premium', price: 'Desde 99€', description: 'Versión avanzada con características adicionales' },
  { name: 'Pack Completo', price: 'Desde 149€', description: 'Solución integral para cubrir todas tus necesidades' },
];

export default function GenericaTemplate({ businessData = {} }) {
  const {
    businessName = 'Tu Negocio',
    description = 'Somos un negocio comprometido con la calidad y la satisfacción de nuestros clientes. Ofrecemos servicios personalizados adaptados a cada necesidad, con un equipo de profesionales dedicados a dar lo mejor.',
    services = DEFAULT_SERVICES,
    phone = '612 345 678', email = 'info@tunegocio.com', address = 'Calle Principal 1, Madrid', schedule = 'Lun–Vie 9:00–18:00',
    logoPreview = null, primaryColor = '#6C63FF', secondaryColor = '#F8F7FF', photosPreviews = [],
  } = businessData;

  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;
  const photos = photosPreviews.length > 0 ? photosPreviews : [];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .gn { font-family: 'Inter', sans-serif; color: #1A1A2E; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; }
    .gn * { box-sizing: border-box; margin: 0; padding: 0; }
    .gn-nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 60px; background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; z-index: 100; }
    .gn-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; color: var(--p); }
    .gn-nav-logo img { height: 38px; border-radius: 8px; object-fit: contain; }
    .gn-nav-links { display: flex; gap: 28px; font-size: 14px; font-weight: 500; color: #666; }
    .gn-nav-cta { background: var(--p); color: #fff; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: opacity .2s; }
    .gn-nav-cta:hover { opacity: .88; }
    .gn-hero { background: linear-gradient(135deg, var(--s) 0%, #fff 100%); padding: 100px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .gn-hero-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--p); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .gn-hero h1 { font-size: clamp(34px, 4vw, 56px); font-weight: 800; color: #1A1A2E; line-height: 1.15; letter-spacing: -1px; margin-bottom: 20px; }
    .gn-hero h1 span { color: var(--p); }
    .gn-hero p { font-size: 17px; line-height: 1.8; color: #666; margin-bottom: 36px; }
    .gn-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .gn-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--p); color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; border: none; box-shadow: 0 4px 20px rgba(108,99,255,.3); transition: all .2s; }
    .gn-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(108,99,255,.4); }
    .gn-btn-g { display: inline-flex; align-items: center; gap: 8px; color: var(--p); font-weight: 600; font-size: 15px; cursor: pointer; background: none; border: none; }
    .gn-hero-visual { position: relative; }
    .gn-hero-card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(108,99,255,.15); aspect-ratio: 4/3; background: linear-gradient(135deg, var(--s), var(--p)); display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .gn-hero-card img { width: 100%; height: 100%; object-fit: cover; }
    .gn-hero-float { position: absolute; bottom: -20px; left: -20px; background: #fff; border-radius: 14px; padding: 16px 20px; box-shadow: 0 8px 30px rgba(0,0,0,.12); display: flex; align-items: center; gap: 12px; }
    .gn-hero-float-icon { width: 42px; height: 42px; background: var(--s); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .gn-hero-float-title { font-size: 15px; font-weight: 700; color: #1A1A2E; }
    .gn-hero-float-sub { font-size: 12px; color: #999; }
    .gn-section { padding: 80px 60px; }
    .gn-alt { background: var(--s); }
    .gn-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(108,99,255,.1); color: var(--p); font-size: 13px; font-weight: 600; padding: 5px 14px; border-radius: 20px; margin-bottom: 14px; }
    .gn-title { font-size: clamp(26px, 3vw, 42px); font-weight: 800; color: #1A1A2E; line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 14px; }
    .gn-sub { font-size: 16px; color: #666; line-height: 1.8; max-width: 540px; }
    .gn-header { margin-bottom: 52px; }
    .gn-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .gn-card { background: #fff; border-radius: 16px; padding: 28px; border: 1.5px solid #eee; transition: all .3s; }
    .gn-card:hover { border-color: var(--p); box-shadow: 0 10px 32px rgba(108,99,255,.12); transform: translateY(-4px); }
    .gn-card-emoji { font-size: 36px; margin-bottom: 16px; }
    .gn-card-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .gn-card-desc { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 16px; }
    .gn-card-price { display: inline-flex; align-items: center; gap: 6px; background: var(--s); color: var(--p); padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .gn-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .gn-photos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .gn-photo { border-radius: 14px; overflow: hidden; aspect-ratio: 1; background: linear-gradient(135deg, var(--s), var(--p)); display: flex; align-items: center; justify-content: center; font-size: 36px; }
    .gn-photo img { width: 100%; height: 100%; object-fit: cover; }
    .gn-points { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
    .gn-point { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; color: #333; }
    .gn-point-icon { width: 22px; height: 22px; background: var(--p); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .gn-point-icon svg { color: #fff; }
    .gn-contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .gn-ci { background: #fff; border-radius: 14px; padding: 22px; border: 1.5px solid #eee; display: flex; align-items: flex-start; gap: 14px; }
    .gn-ci-icon { width: 42px; height: 42px; background: var(--s); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .gn-ci-icon svg { color: var(--p); }
    .gn-ci-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
    .gn-ci-value { font-size: 14px; font-weight: 600; color: #1A1A2E; }
    .gn-footer { background: #1A1A2E; color: rgba(255,255,255,.4); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 13px; }
    .gn-footer-logo { font-weight: 800; font-size: 16px; color: #fff; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="gn">
        <nav className="gn-nav">
          <div className="gn-nav-logo">
            {logoPreview ? <img src={logoPreview} alt={businessName} /> : <Zap size={20} color={primaryColor} />}
            <span>{businessName}</span>
          </div>
          <div className="gn-nav-links">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </div>
          <button className="gn-nav-cta">Contáctanos</button>
        </nav>

        <section className="gn-hero">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="gn-hero-tag" variants={fadeUp}><Zap size={13} /> Servicio profesional</motion.div>
            <motion.h1 variants={fadeUp}><span>{businessName}</span><br />a tu servicio</motion.h1>
            <motion.p variants={fadeUp}>{description.slice(0, 180)}{description.length > 180 ? '…' : ''}</motion.p>
            <motion.div className="gn-hero-actions" variants={fadeUp}>
              <button className="gn-btn"><Phone size={14} /> Llamar ahora</button>
              <button className="gn-btn-g">Nuestros servicios <ArrowRight size={14} /></button>
            </motion.div>
          </motion.div>
          <motion.div className="gn-hero-visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="gn-hero-card">
              {photos[0] && photos[0].startsWith('data:') ? <img src={photos[0]} alt={businessName} /> : '🚀'}
            </div>
            <div className="gn-hero-float">
              <div className="gn-hero-float-icon">✅</div>
              <div><div className="gn-hero-float-title">+500 clientes satisfechos</div><div className="gn-hero-float-sub">Valoración 4.9 ⭐</div></div>
            </div>
          </motion.div>
        </section>

        <section className="gn-section" id="servicios">
          <motion.div className="gn-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="gn-tag" variants={fadeUp}>Servicios</motion.span>
            <motion.h2 className="gn-title" variants={fadeUp}>¿En qué podemos ayudarte?</motion.h2>
            <motion.p className="gn-sub" variants={fadeUp}>Soluciones a medida para cada cliente, con calidad garantizada.</motion.p>
          </motion.div>
          <motion.div className="gn-cards" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="gn-card" variants={fadeUp}>
                <div className="gn-card-emoji">{['✨', '🎯', '💎', '🔑', '🌟', '⚡'][i % 6]}</div>
                <div className="gn-card-name">{s.name}</div>
                <div className="gn-card-desc">{s.description || 'Servicio profesional de alta calidad.'}</div>
                {s.price && <div className="gn-card-price"><Check size={11} /> {s.price}</div>}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="gn-section gn-alt" id="nosotros">
          <div className="gn-about-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.span className="gn-tag" variants={fadeUp}>Sobre nosotros</motion.span>
              <motion.h2 className="gn-title" variants={fadeUp}>Por qué elegirnos</motion.h2>
              <motion.p className="gn-sub" variants={fadeUp}>{description}</motion.p>
              <motion.div className="gn-points" variants={stagger}>
                {['Profesionales con años de experiencia', 'Atención personalizada y cercana', 'Resultados rápidos y garantizados', 'Precios competitivos y transparentes'].map((p, i) => (
                  <motion.div key={i} className="gn-point" variants={fadeUp}>
                    <div className="gn-point-icon"><Check size={11} /></div>
                    <span>{p}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div className="gn-photos" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {[0,1,2,3].map(i => (
                <div key={i} className="gn-photo">
                  {photos[i] && photos[i].startsWith('data:') ? <img src={photos[i]} alt="" /> : '📸'}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="gn-section" id="contacto">
          <motion.div className="gn-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="gn-tag" variants={fadeUp}>Contacto</motion.span>
            <motion.h2 className="gn-title" variants={fadeUp}>¿Hablamos?</motion.h2>
            <motion.p className="gn-sub" variants={fadeUp}>Disponibles para atenderte. ¡Contáctanos sin compromiso!</motion.p>
          </motion.div>
          <motion.div className="gn-contact-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[{ icon: <Phone size={17} />, label: 'Teléfono', value: phone }, { icon: <Mail size={17} />, label: 'Email', value: email }, { icon: <MapPin size={17} />, label: 'Dirección', value: address }, { icon: <Clock size={17} />, label: 'Horario', value: schedule }].filter(i => i.value).map((item, i) => (
              <motion.div key={i} className="gn-ci" variants={fadeUp}>
                <div className="gn-ci-icon">{item.icon}</div>
                <div><div className="gn-ci-label">{item.label}</div><div className="gn-ci-value">{item.value}</div></div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <footer className="gn-footer">
          <div className="gn-footer-logo">🚀 {businessName}</div>
          <span>© {new Date().getFullYear()} {businessName}. Todos los derechos reservados.</span>
        </footer>
      </div>
    </>
  );
}

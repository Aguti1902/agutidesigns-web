import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, ArrowRight, Star } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const DEFAULT_SERVICES = [
  { name: 'Menú del día', price: '14€', description: 'Primer plato, segundo, postre y bebida incluida' },
  { name: 'Carta de temporada', price: 'Desde 22€', description: 'Elaboraciones con ingredientes de mercado' },
  { name: 'Menú degustación', price: '55€/persona', description: '8 pasos para una experiencia gastronómica única' },
];

export default function RestauranteTemplate({ businessData = {} }) {
  const {
    businessName = 'Tu Restaurante',
    description = 'Bienvenido a un espacio donde la gastronomía de calidad se une a un ambiente acogedor. Cocinamos con pasión, utilizando los mejores ingredientes de temporada.',
    services = DEFAULT_SERVICES,
    phone = '612 345 678', email = 'reservas@turestaurante.com', address = 'Calle del Buen Sabor 3, Madrid', schedule = 'Mar–Dom 13:00–16:00 · 20:00–23:30',
    logoPreview = null, primaryColor = '#C8935A', secondaryColor = '#FFF8F2', photosPreviews = [],
  } = businessData;

  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;
  const photos = photosPreviews.length > 0 ? photosPreviews : [];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
    .rst { font-family: 'Inter', sans-serif; color: #1A1208; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; }
    .rst * { box-sizing: border-box; margin: 0; padding: 0; }
    .rst-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; background: rgba(255,255,255,.95); border-bottom: 1px solid rgba(200,147,90,.15); position: sticky; top: 0; z-index: 100; }
    .rst-nav-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
    .rst-nav-name img { height: 42px; border-radius: 6px; object-fit: contain; }
    .rst-nav-links { display: flex; gap: 28px; font-size: 14px; color: #666; }
    .rst-nav-cta { background: var(--p); color: #fff; padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .rst-hero { min-height: 680px; position: relative; display: flex; align-items: center; overflow: hidden; background: linear-gradient(160deg, #1a0f04, #3d2408); }
    .rst-hero-bg { position: absolute; inset: 0; }
    .rst-hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: .45; }
    .rst-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(20,10,2,.85) 0%, rgba(20,10,2,.35) 100%); }
    .rst-hero-content { position: relative; z-index: 1; padding: 80px 60px; max-width: 640px; }
    .rst-hero-eyebrow { font-size: 12px; font-weight: 600; color: var(--p); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; }
    .rst-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(40px, 5vw, 68px); font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 22px; }
    .rst-hero p { font-size: 16px; line-height: 1.8; color: rgba(255,255,255,.8); margin-bottom: 40px; }
    .rst-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .rst-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--p); color: #fff; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; cursor: pointer; border: none; transition: opacity .2s; }
    .rst-btn:hover { opacity: .88; }
    .rst-btn-g { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,.4); color: #fff; padding: 13px 28px; border-radius: 6px; font-weight: 500; font-size: 15px; cursor: pointer; background: transparent; }
    .rst-section { padding: 80px 60px; }
    .rst-alt { background: var(--s); }
    .rst-tag { display: block; font-size: 12px; font-weight: 600; color: var(--p); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; }
    .rst-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 3.5vw, 46px); font-weight: 700; color: #1A1208; line-height: 1.2; margin-bottom: 14px; }
    .rst-sub { font-size: 16px; color: #666; line-height: 1.8; max-width: 520px; }
    .rst-header { margin-bottom: 52px; }
    .rst-menu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .rst-menu-card { border-radius: 12px; overflow: hidden; border: 1px solid rgba(200,147,90,.15); transition: all .3s; background: #fff; }
    .rst-menu-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(200,147,90,.15); }
    .rst-menu-thumb { height: 180px; background: linear-gradient(135deg, #f5e0c4, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 56px; overflow: hidden; }
    .rst-menu-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .rst-menu-body { padding: 22px; }
    .rst-menu-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .rst-menu-desc { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 14px; }
    .rst-menu-price { font-size: 18px; font-weight: 700; color: var(--p); font-family: 'Playfair Display', serif; }
    .rst-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .rst-gallery { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: auto auto; gap: 10px; }
    .rst-gm { grid-row: span 2; border-radius: 12px; overflow: hidden; min-height: 360px; background: linear-gradient(135deg, #f5e0c4, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 60px; }
    .rst-gm img, .rst-gs img { width: 100%; height: 100%; object-fit: cover; }
    .rst-gs { border-radius: 10px; overflow: hidden; aspect-ratio: 3/2; background: linear-gradient(135deg, #ead5b5, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 36px; }
    .rst-stats { display: flex; gap: 32px; margin-top: 28px; }
    .rst-stat-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--p); }
    .rst-stat-label { font-size: 12px; color: #999; margin-top: 4px; }
    .rst-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .rst-info-card { background: #fff; border-radius: 14px; padding: 28px; border: 1px solid rgba(200,147,90,.12); }
    .rst-info-emoji { font-size: 28px; margin-bottom: 14px; }
    .rst-info-label { font-size: 11px; font-weight: 700; color: var(--p); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
    .rst-info-value { font-size: 15px; font-weight: 600; line-height: 1.5; }
    .rst-footer { background: #1A1208; color: rgba(255,255,255,.4); padding: 32px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 13px; }
    .rst-footer-logo { font-family: 'Playfair Display', serif; font-size: 18px; color: #fff; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="rst">
        <nav className="rst-nav">
          <div className="rst-nav-name">
            {logoPreview && <img src={logoPreview} alt={businessName} />}
            {businessName}
          </div>
          <div className="rst-nav-links">
            <a href="#carta">Carta</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Reservas</a>
          </div>
          <button className="rst-nav-cta">Reservar mesa</button>
        </nav>

        <section className="rst-hero">
          <div className="rst-hero-bg">{photos[0] && photos[0].startsWith('data:') && <img src={photos[0]} alt="" />}</div>
          <div className="rst-hero-overlay" />
          <div className="rst-hero-content">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div className="rst-hero-eyebrow" variants={fadeUp}>🍽️ Cocina de temporada</motion.div>
              <motion.h1 variants={fadeUp}>{businessName}</motion.h1>
              <motion.p variants={fadeUp}>{description.slice(0, 180)}{description.length > 180 ? '…' : ''}</motion.p>
              <motion.div className="rst-hero-actions" variants={fadeUp}>
                <button className="rst-btn">Reservar mesa</button>
                <button className="rst-btn-g"><Phone size={14} /> {phone || 'Llamar'}</button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="rst-section" id="carta">
          <motion.div className="rst-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="rst-tag" variants={fadeUp}>Nuestra carta</motion.span>
            <motion.h2 className="rst-title" variants={fadeUp}>Una experiencia gastronómica<br />para recordar</motion.h2>
            <motion.p className="rst-sub" variants={fadeUp}>Ingredientes frescos de temporada, elaborados con técnica y pasión.</motion.p>
          </motion.div>
          <motion.div className="rst-menu-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="rst-menu-card" variants={fadeUp}>
                <div className="rst-menu-thumb">
                  {photos[i + 1] && photos[i + 1].startsWith('data:') ? <img src={photos[i + 1]} alt="" /> : ['🥘', '🍖', '🍮', '🥗', '🍷', '🍰'][i % 6]}
                </div>
                <div className="rst-menu-body">
                  <div className="rst-menu-name">{s.name}</div>
                  <div className="rst-menu-desc">{s.description || 'Elaboración de temporada con ingredientes seleccionados.'}</div>
                  {s.price && <div className="rst-menu-price">{s.price}</div>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="rst-section rst-alt" id="nosotros">
          <div className="rst-about-grid">
            <motion.div className="rst-gallery" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="rst-gm">{photos[0] && photos[0].startsWith('data:') ? <img src={photos[0]} alt="" /> : '🍽️'}</div>
              <div className="rst-gs">{photos[1] && photos[1].startsWith('data:') ? <img src={photos[1]} alt="" /> : '🥂'}</div>
              <div className="rst-gs">{photos[2] && photos[2].startsWith('data:') ? <img src={photos[2]} alt="" /> : '🍮'}</div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.span className="rst-tag" variants={fadeUp}>Nuestra historia</motion.span>
              <motion.h2 className="rst-title" variants={fadeUp}>Pasión por la buena mesa</motion.h2>
              <motion.p className="rst-sub" variants={fadeUp}>{description}</motion.p>
              <motion.div className="rst-stats" variants={fadeUp}>
                {[{ n: '15+', l: 'Años' }, { n: '98%', l: 'Satisfacción' }, { n: '4.9', l: <><Star size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Google</> }].map((s, i) => (
                  <div key={i}><div className="rst-stat-num">{s.n}</div><div className="rst-stat-label">{s.l}</div></div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="rst-section" id="contacto">
          <motion.div className="rst-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="rst-tag" variants={fadeUp}>Visítanos</motion.span>
            <motion.h2 className="rst-title" variants={fadeUp}>¿Cuándo venís?</motion.h2>
          </motion.div>
          <motion.div className="rst-info-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[{ e: '📞', l: 'Reservas', v: phone }, { e: '📧', l: 'Email', v: email }, { e: '📍', l: 'Dirección', v: address }, { e: '🕐', l: 'Horario', v: schedule }].filter(i => i.v).map((item, i) => (
              <motion.div key={i} className="rst-info-card" variants={fadeUp}>
                <div className="rst-info-emoji">{item.e}</div>
                <div className="rst-info-label">{item.l}</div>
                <div className="rst-info-value">{item.v}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <footer className="rst-footer">
          <div className="rst-footer-logo">🍽️ {businessName}</div>
          <span>© {new Date().getFullYear()} {businessName}. Reservas recomendadas.</span>
        </footer>
      </div>
    </>
  );
}

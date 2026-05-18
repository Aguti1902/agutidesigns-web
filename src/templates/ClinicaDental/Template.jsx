import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Check, ArrowRight, Star } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const DEFAULT_SERVICES = [
  { name: 'Ortodoncia', price: 'Desde 50€/mes', description: 'Alineadores y brackets para una sonrisa perfecta' },
  { name: 'Implantes', price: 'Desde 850€', description: 'Implantes de titanio con garantía de por vida' },
  { name: 'Limpieza Dental', price: '45€', description: 'Higiene bucal profesional y eliminación de sarro' },
];

const PLACEHOLDER_PHOTOS = [
  'linear-gradient(135deg, #E8F4FD 0%, #B3D9F5 100%)',
  'linear-gradient(135deg, #B3D9F5 0%, #1B6CA8 100%)',
  'linear-gradient(135deg, #D6EEFF 0%, #56CCF2 100%)',
];

export default function ClinicaDentalTemplate({ businessData = {} }) {
  const {
    businessName = 'Tu Clínica Dental',
    description = 'Ofrecemos atención dental de la más alta calidad con tecnología de vanguardia. Nuestro equipo de especialistas está comprometido con tu salud bucal y tu sonrisa perfecta.',
    services = DEFAULT_SERVICES,
    phone = '612 345 678',
    email = 'info@tuclinica.com',
    address = 'Calle Mayor 15, Madrid',
    schedule = 'Lun–Vie 9:00–20:00 · Sáb 9:00–14:00',
    logoPreview = null,
    primaryColor = '#1B6CA8',
    secondaryColor = '#E8F4FD',
    photosPreviews = [],
  } = businessData;

  const photos = photosPreviews.length > 0 ? photosPreviews : PLACEHOLDER_PHOTOS;
  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .cd { font-family: 'Inter', sans-serif; color: #1A1A2E; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; }
    .cd * { box-sizing: border-box; margin: 0; padding: 0; }
    .cd a { text-decoration: none; color: inherit; }
    .cd-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 60px; background: #fff; box-shadow: 0 1px 0 #eee; position: sticky; top: 0; z-index: 100; }
    .cd-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: var(--p); }
    .cd-nav-logo img { height: 40px; width: auto; border-radius: 6px; object-fit: contain; }
    .cd-nav-links { display: flex; gap: 32px; font-size: 14px; font-weight: 500; color: #444; }
    .cd-nav-cta { background: var(--p); color: #fff; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .cd-hero { background: linear-gradient(135deg, var(--p) 0%, #0d4a8a 100%); min-height: 600px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; padding: 80px 60px; gap: 60px; position: relative; overflow: hidden; }
    .cd-hero::before { content: ''; position: absolute; right: -100px; top: -100px; width: 500px; height: 500px; background: rgba(255,255,255,.05); border-radius: 50%; pointer-events: none; }
    .cd-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.15); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 20px; }
    .cd-hero-badge-dot { width: 6px; height: 6px; background: #5EF0A0; border-radius: 50%; display: inline-block; }
    .cd-hero h1 { font-size: clamp(36px, 4vw, 56px); font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -1px; margin-bottom: 20px; }
    .cd-hero p { color: rgba(255,255,255,.85); font-size: 17px; line-height: 1.7; margin-bottom: 36px; max-width: 480px; }
    .cd-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .cd-btn-w { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: var(--p); padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; border: none; transition: transform .2s, box-shadow .2s; }
    .cd-btn-w:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
    .cd-btn-g { display: inline-flex; align-items: center; gap: 8px; background: transparent; border: 2px solid rgba(255,255,255,.5); color: #fff; padding: 13px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background .2s; }
    .cd-hero-stats { display: flex; gap: 28px; margin-top: 40px; }
    .cd-stat strong { display: block; font-size: 28px; font-weight: 800; color: #fff; }
    .cd-stat span { font-size: 13px; color: rgba(255,255,255,.7); }
    .cd-hero-img { border-radius: 20px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,.3); aspect-ratio: 4/3; }
    .cd-hero-img img { width: 100%; height: 100%; object-fit: cover; }
    .cd-hero-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .cd-trust { background: var(--s); padding: 22px 60px; display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap; }
    .cd-trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #444; }
    .cd-trust-item svg { color: var(--p); }
    .cd-section { padding: 80px 60px; }
    .cd-tag { display: inline-block; background: var(--s); color: var(--p); font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .cd-title { font-size: clamp(28px, 3vw, 42px); font-weight: 800; color: #1A1A2E; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 16px; }
    .cd-sub { font-size: 17px; color: #666; line-height: 1.7; max-width: 560px; }
    .cd-header { margin-bottom: 56px; }
    .cd-services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .cd-card { background: #fff; border: 1.5px solid #eee; border-radius: 16px; padding: 32px; transition: all .3s; position: relative; overflow: hidden; }
    .cd-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--p); transform: scaleX(0); transform-origin: left; transition: transform .3s; }
    .cd-card:hover { border-color: var(--p); box-shadow: 0 12px 40px rgba(27,108,168,.12); transform: translateY(-4px); }
    .cd-card:hover::before { transform: scaleX(1); }
    .cd-card-icon { width: 52px; height: 52px; background: var(--s); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 24px; }
    .cd-card-name { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .cd-card-desc { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; }
    .cd-card-price { display: inline-flex; align-items: center; gap: 6px; background: var(--s); color: var(--p); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .cd-about { background: var(--s); }
    .cd-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
    .cd-points { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
    .cd-point { display: flex; align-items: flex-start; gap: 14px; }
    .cd-point-icon { width: 28px; height: 28px; background: var(--p); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .cd-point-icon svg { color: #fff; }
    .cd-point-title { font-weight: 600; color: #1A1A2E; margin-bottom: 2px; font-size: 15px; }
    .cd-point-desc { font-size: 14px; color: #666; }
    .cd-photos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cd-photo { border-radius: 14px; overflow: hidden; aspect-ratio: 4/3; }
    .cd-photo:first-child { grid-column: span 2; aspect-ratio: 16/9; }
    .cd-photo img { width: 100%; height: 100%; object-fit: cover; }
    .cd-photo-bg { width: 100%; height: 100%; }
    .cd-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .cd-gallery-item { border-radius: 12px; overflow: hidden; aspect-ratio: 4/3; }
    .cd-gallery-item img { width: 100%; height: 100%; object-fit: cover; }
    .cd-gallery-item-bg { width: 100%; height: 100%; }
    .cd-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
    .cd-review { background: #fff; border-radius: 14px; padding: 28px; }
    .cd-review-stars { display: flex; gap: 4px; color: #FFB400; margin-bottom: 12px; }
    .cd-review-text { font-size: 14px; color: #555; line-height: 1.7; margin-bottom: 16px; font-style: italic; }
    .cd-review-author { font-weight: 600; font-size: 14px; }
    .cd-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
    .cd-contact-items { display: flex; flex-direction: column; gap: 20px; }
    .cd-contact-item { display: flex; align-items: flex-start; gap: 16px; }
    .cd-contact-icon { width: 46px; height: 46px; background: var(--s); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cd-contact-icon svg { color: var(--p); }
    .cd-contact-label { display: block; font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .cd-contact-value { font-size: 14px; font-weight: 500; color: #1A1A2E; }
    .cd-form { display: flex; flex-direction: column; gap: 14px; }
    .cd-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cd-field label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
    .cd-field input, .cd-field textarea { width: 100%; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 14px; outline: none; background: #fafafa; resize: none; }
    .cd-field input:focus, .cd-field textarea:focus { border-color: var(--p); background: #fff; }
    .cd-submit { background: var(--p); color: #fff; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .cd-footer { background: #1A1A2E; color: rgba(255,255,255,.5); padding: 36px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; font-size: 13px; }
    .cd-footer-logo { font-weight: 700; font-size: 16px; color: #fff; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="cd">
        <nav className="cd-nav">
          <div className="cd-nav-logo">
            {logoPreview ? <img src={logoPreview} alt={businessName} /> : <span>🦷</span>}
            <span>{businessName}</span>
          </div>
          <div className="cd-nav-links">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#galeria">Galería</a>
            <a href="#contacto">Contacto</a>
          </div>
          <button className="cd-nav-cta">📞 Pedir Cita</button>
        </nav>

        <section className="cd-hero">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
              <div className="cd-hero-badge"><span className="cd-hero-badge-dot" />Clínica dental de confianza</div>
            </motion.div>
            <motion.h1 variants={fadeUp}>{businessName}</motion.h1>
            <motion.p variants={fadeUp}>{description.length > 180 ? description.slice(0, 177) + '…' : description}</motion.p>
            <motion.div className="cd-hero-actions" variants={fadeUp}>
              <button className="cd-btn-w"><Phone size={15} /> Llamar ahora</button>
              <button className="cd-btn-g">Pedir cita online <ArrowRight size={15} /></button>
            </motion.div>
            <motion.div className="cd-hero-stats" variants={fadeUp}>
              <div className="cd-stat"><strong>+500</strong><span>Pacientes</span></div>
              <div className="cd-stat"><strong>15+</strong><span>Años</span></div>
              <div className="cd-stat"><strong>4.9 ⭐</strong><span>Google</span></div>
            </motion.div>
          </motion.div>
          <motion.div className="cd-hero-img" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            {photos[0] && photos[0].startsWith('data:')
              ? <img src={photos[0]} alt={businessName} />
              : <div className="cd-hero-img-placeholder" style={{ background: photos[0] || 'rgba(255,255,255,.1)' }}>{!String(photos[0]).startsWith('linear') && '🦷'}</div>}
          </motion.div>
        </section>

        <div className="cd-trust">
          {['Tecnología de última generación', 'Más de 500 pacientes satisfechos', 'Equipo certificado', 'Financiación sin intereses'].map((t, i) => (
            <div key={i} className="cd-trust-item"><Check size={14} />{t}</div>
          ))}
        </div>

        <section className="cd-section" id="servicios">
          <motion.div className="cd-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="cd-tag" variants={fadeUp}>Nuestros servicios</motion.span>
            <motion.h2 className="cd-title" variants={fadeUp}>Todo lo que necesitas<br />para tu sonrisa</motion.h2>
            <motion.p className="cd-sub" variants={fadeUp}>Tratamientos personalizados con la tecnología más avanzada.</motion.p>
          </motion.div>
          <motion.div className="cd-services-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="cd-card" variants={fadeUp}>
                <div className="cd-card-icon">{['🦷', '😁', '✨', '🔬', '💎', '🎯'][i % 6]}</div>
                <div className="cd-card-name">{s.name}</div>
                <div className="cd-card-desc">{s.description || 'Tratamiento profesional con los mejores resultados.'}</div>
                {s.price && <div className="cd-card-price"><Check size={12} />{s.price}</div>}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="cd-section cd-about" id="nosotros">
          <div className="cd-about-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.span className="cd-tag" variants={fadeUp}>Sobre nosotros</motion.span>
              <motion.h2 className="cd-title" variants={fadeUp}>Tu salud bucal,<br />nuestra prioridad</motion.h2>
              <motion.p className="cd-sub" variants={fadeUp}>{description}</motion.p>
              <motion.div className="cd-points" variants={stagger}>
                {[
                  { title: 'Equipo especializado', desc: 'Más de 15 años de experiencia en odontología avanzada' },
                  { title: 'Tecnología de vanguardia', desc: 'Escáner 3D, láser dental y materiales de última generación' },
                  { title: 'Atención personalizada', desc: 'Cada paciente recibe un plan de tratamiento único' },
                ].map((p, i) => (
                  <motion.div key={i} className="cd-point" variants={fadeUp}>
                    <div className="cd-point-icon"><Check size={13} /></div>
                    <div><div className="cd-point-title">{p.title}</div><div className="cd-point-desc">{p.desc}</div></div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div className="cd-photos" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="cd-photo">
                  {photos[i] && photos[i].startsWith('data:')
                    ? <img src={photos[i]} alt="" />
                    : <div className="cd-photo-bg" style={{ background: PLACEHOLDER_PHOTOS[i] || 'linear-gradient(135deg,#E8F4FD,#1B6CA8)' }} />}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="cd-section" id="galeria">
          <motion.div className="cd-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="cd-tag" variants={fadeUp}>Galería</motion.span>
            <motion.h2 className="cd-title" variants={fadeUp}>Nuestras instalaciones</motion.h2>
          </motion.div>
          <motion.div className="cd-gallery-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[...photos, ...PLACEHOLDER_PHOTOS].slice(0, 6).map((p, i) => (
              <motion.div key={i} className="cd-gallery-item" variants={fadeUp}>
                {p.startsWith('data:') ? <img src={p} alt="" /> : <div className="cd-gallery-item-bg" style={{ background: p }} />}
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="cd-section" style={{ background: secondaryColor }}>
          <motion.div className="cd-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="cd-tag" variants={fadeUp}>Testimonios</motion.span>
            <motion.h2 className="cd-title" variants={fadeUp}>Lo que dicen nuestros pacientes</motion.h2>
          </motion.div>
          <motion.div className="cd-reviews-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {[
              { text: 'El mejor equipo de dentistas. Me trataron con mucha profesionalidad y el resultado fue increíble.', author: 'María García' },
              { text: `Llevaba años con miedo al dentista, pero en ${businessName} me sentí cómodo desde el primer momento.`, author: 'Carlos Martínez' },
              { text: 'La ortodoncia invisible cambió mi sonrisa completamente. Precio muy razonable y resultados espectaculares.', author: 'Ana López' },
            ].map((r, i) => (
              <motion.div key={i} className="cd-review" variants={fadeUp}>
                <div className="cd-review-stars">{[1,2,3,4,5].map(s => <Star key={s} size={15} fill="#FFB400" color="#FFB400" />)}</div>
                <p className="cd-review-text">"{r.text}"</p>
                <div className="cd-review-author">— {r.author}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="cd-section" id="contacto">
          <motion.div className="cd-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="cd-tag" variants={fadeUp}>Contacto</motion.span>
            <motion.h2 className="cd-title" variants={fadeUp}>¿Hablamos?</motion.h2>
            <motion.p className="cd-sub" variants={fadeUp}>Estamos aquí para resolver todas tus dudas. Pide cita ahora.</motion.p>
          </motion.div>
          <div className="cd-contact-grid">
            <motion.div className="cd-contact-items" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              {[{ icon: <Phone size={19} />, label: 'Teléfono', value: phone }, { icon: <Mail size={19} />, label: 'Email', value: email }, { icon: <MapPin size={19} />, label: 'Dirección', value: address }, { icon: <Clock size={19} />, label: 'Horario', value: schedule }].filter(i => i.value).map((item, i) => (
                <motion.div key={i} className="cd-contact-item" variants={fadeUp}>
                  <div className="cd-contact-icon">{item.icon}</div>
                  <div><span className="cd-contact-label">{item.label}</span><span className="cd-contact-value">{item.value}</span></div>
                </motion.div>
              ))}
            </motion.div>
            <motion.form className="cd-form" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} onSubmit={e => e.preventDefault()}>
              <div className="cd-form-row">
                <div className="cd-field"><label>Nombre</label><input type="text" placeholder="Tu nombre" /></div>
                <div className="cd-field"><label>Teléfono</label><input type="tel" placeholder="612 345 678" /></div>
              </div>
              <div className="cd-field"><label>¿En qué podemos ayudarte?</label><textarea rows={4} placeholder="Describe tu consulta..." /></div>
              <button className="cd-submit" type="submit">Enviar mensaje <ArrowRight size={15} /></button>
            </motion.form>
          </div>
        </section>

        <footer className="cd-footer">
          <div className="cd-footer-logo">🦷 {businessName}</div>
          <span>© {new Date().getFullYear()} {businessName}. Todos los derechos reservados.</span>
        </footer>
      </div>
    </>
  );
}

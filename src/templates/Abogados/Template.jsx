import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Check, ArrowRight, Shield } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const DEFAULT_SERVICES = [
  { name: 'Derecho Civil', price: 'Consulta gratuita', description: 'Contratos, herencias, familia y reclamaciones civiles' },
  { name: 'Derecho Laboral', price: 'Consulta gratuita', description: 'Despidos, ERTEs, accidentes laborales y negociación colectiva' },
  { name: 'Derecho Penal', price: 'Consulta gratuita', description: 'Defensa penal, recursos y procedimientos ante tribunales' },
];

const GOLD = '#C9A96E';

export default function AbogadosTemplate({ businessData = {} }) {
  const {
    businessName = 'Despacho de Abogados',
    description = 'Somos un despacho de abogados comprometido con la defensa de sus intereses. Con más de 20 años de experiencia, ofrecemos asesoramiento jurídico de alto nivel con discreción, eficacia y resultados.',
    services = DEFAULT_SERVICES,
    phone = '91 123 45 67', email = 'info@despacho.es', address = 'Paseo de la Castellana 200, Madrid', schedule = 'Lun–Vie 9:00–19:00',
    logoPreview = null, primaryColor = '#1A2744', secondaryColor = '#F0EDE8', photosPreviews = [],
  } = businessData;

  const displayServices = services.filter(s => s.name).length > 0 ? services.filter(s => s.name) : DEFAULT_SERVICES;
  const photos = photosPreviews.length > 0 ? photosPreviews : [];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    .ab { font-family: 'Inter', sans-serif; color: #0D1520; background: #fff; --p: ${primaryColor}; --s: ${secondaryColor}; --g: ${GOLD}; }
    .ab * { box-sizing: border-box; margin: 0; padding: 0; }
    .ab a { text-decoration: none; color: inherit; }
    .ab-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 60px; background: var(--p); }
    .ab-nav-logo { display: flex; align-items: center; gap: 12px; }
    .ab-nav-logo img { height: 40px; border-radius: 4px; filter: brightness(0) invert(1); object-fit: contain; }
    .ab-nav-name { font-family: 'EB Garamond', serif; font-size: 20px; font-weight: 600; color: #fff; letter-spacing: 0.5px; }
    .ab-nav-name span { color: var(--g); }
    .ab-nav-links { display: flex; gap: 28px; font-size: 13px; color: rgba(255,255,255,.6); }
    .ab-nav-links a:hover { color: var(--g); }
    .ab-nav-cta { display: flex; align-items: center; gap: 8px; background: var(--g); color: var(--p); padding: 10px 22px; border-radius: 4px; font-size: 13px; font-weight: 700; cursor: pointer; text-transform: uppercase; border: none; font-family: 'Inter', sans-serif; }
    .ab-hero { background: var(--p); padding: 90px 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; position: relative; overflow: hidden; }
    .ab-hero-div { width: 50px; height: 3px; background: var(--g); margin-bottom: 20px; }
    .ab-hero h1 { font-family: 'EB Garamond', serif; font-size: clamp(36px, 4.5vw, 60px); font-weight: 600; color: #fff; line-height: 1.15; margin-bottom: 20px; letter-spacing: -0.5px; }
    .ab-hero p { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,.7); margin-bottom: 36px; }
    .ab-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .ab-btn-g { display: inline-flex; align-items: center; gap: 8px; background: var(--g); color: var(--p); padding: 13px 26px; border-radius: 4px; font-weight: 700; font-size: 14px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; border: none; font-family: 'Inter', sans-serif; transition: opacity .2s; }
    .ab-btn-g:hover { opacity: .9; }
    .ab-btn-o { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(201,169,110,.4); color: var(--g); padding: 12px 26px; border-radius: 4px; font-size: 14px; cursor: pointer; background: transparent; }
    .ab-hero-img { position: relative; border-radius: 4px; overflow: hidden; min-height: 420px; border: 1px solid rgba(201,169,110,.2); background: rgba(255,255,255,.03); display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .ab-hero-img img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(20%); }
    .ab-trust { background: var(--g); padding: 18px 60px; display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
    .ab-trust-item { font-size: 12px; font-weight: 700; color: var(--p); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; }
    .ab-section { padding: 80px 60px; }
    .ab-alt { background: var(--s); }
    .ab-dark { background: var(--p); }
    .ab-tag { display: block; font-size: 11px; font-weight: 700; color: var(--g); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px; }
    .ab-title { font-family: 'EB Garamond', serif; font-size: clamp(28px, 3.5vw, 46px); font-weight: 600; color: var(--p); line-height: 1.2; margin-bottom: 14px; }
    .ab-title-w { color: #fff; }
    .ab-sub { font-size: 15px; color: #555; line-height: 1.8; max-width: 520px; }
    .ab-sub-w { color: rgba(255,255,255,.6); }
    .ab-div { width: 40px; height: 2px; background: var(--g); margin: 14px 0; }
    .ab-header { margin-bottom: 52px; }
    .ab-areas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2px; background: #e8e4de; }
    .ab-area { background: #fff; padding: 36px; transition: all .3s; }
    .ab-area:hover { background: var(--p); }
    .ab-area:hover .ab-area-name { color: #fff; }
    .ab-area:hover .ab-area-desc { color: rgba(255,255,255,.7); }
    .ab-area:hover .ab-area-num { color: var(--g); }
    .ab-area:hover .ab-area-cta { color: var(--g); }
    .ab-area-num { font-family: 'EB Garamond', serif; font-size: 13px; font-weight: 600; color: var(--g); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; transition: color .3s; }
    .ab-area-name { font-family: 'EB Garamond', serif; font-size: 22px; font-weight: 600; color: var(--p); margin-bottom: 10px; transition: color .3s; }
    .ab-area-desc { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; transition: color .3s; }
    .ab-area-cta { font-size: 13px; color: var(--p); font-weight: 600; display: flex; align-items: center; gap: 6px; transition: color .3s; }
    .ab-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
    .ab-values { display: flex; flex-direction: column; gap: 20px; margin-top: 28px; }
    .ab-value { display: flex; gap: 16px; align-items: flex-start; }
    .ab-value-num { font-family: 'EB Garamond', serif; font-size: 32px; font-weight: 700; color: var(--g); line-height: 1; flex-shrink: 0; }
    .ab-value-title { font-size: 15px; font-weight: 600; color: var(--p); margin-bottom: 4px; }
    .ab-value-desc { font-size: 13px; color: #777; line-height: 1.6; }
    .ab-about-img { border-radius: 4px; overflow: hidden; aspect-ratio: 3/4; background: linear-gradient(160deg, #c8c0b0, var(--p)); display: flex; align-items: center; justify-content: center; font-size: 64px; }
    .ab-about-img img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(10%); }
    .ab-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
    .ab-contact-items { display: flex; flex-direction: column; gap: 18px; }
    .ab-ci { display: flex; align-items: flex-start; gap: 16px; padding: 20px; border: 1px solid rgba(201,169,110,.2); border-radius: 4px; }
    .ab-ci-icon { color: var(--g); flex-shrink: 0; margin-top: 2px; }
    .ab-ci-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .ab-ci-value { font-size: 15px; font-weight: 500; color: #fff; }
    .ab-form { display: flex; flex-direction: column; gap: 14px; }
    .ab-field label { display: block; font-size: 11px; font-weight: 700; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .ab-field input, .ab-field textarea { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(201,169,110,.2); border-radius: 4px; padding: 12px 16px; color: #fff; font-family: 'Inter', sans-serif; font-size: 14px; outline: none; transition: border-color .2s; resize: none; }
    .ab-field input::placeholder, .ab-field textarea::placeholder { color: rgba(255,255,255,.25); }
    .ab-field input:focus, .ab-field textarea:focus { border-color: var(--g); }
    .ab-submit { background: var(--g); color: var(--p); border: none; padding: 14px; border-radius: 4px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .ab-footer { background: #0D1520; color: rgba(255,255,255,.3); padding: 28px 60px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 12px; }
    .ab-footer-logo { font-family: 'EB Garamond', serif; font-size: 16px; color: rgba(255,255,255,.7); }
    .ab-footer-logo span { color: var(--g); }
  `;

  const parts = businessName.split(' ');
  const first = parts[0], rest = parts.slice(1).join(' ');

  return (
    <>
      <style>{css}</style>
      <div className="ab">
        <nav className="ab-nav">
          <div className="ab-nav-logo">
            {logoPreview && <img src={logoPreview} alt={businessName} />}
            <span className="ab-nav-name">{first} <span>{rest}</span></span>
          </div>
          <div className="ab-nav-links">
            <a href="#areas">Áreas</a>
            <a href="#despacho">El Despacho</a>
            <a href="#contacto">Contacto</a>
          </div>
          <button className="ab-nav-cta"><Phone size={13} /> Consulta gratuita</button>
        </nav>

        <section className="ab-hero">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="ab-hero-div" variants={fadeUp} />
            <motion.h1 variants={fadeUp}>{businessName}</motion.h1>
            <motion.p variants={fadeUp}>{description.slice(0, 180)}{description.length > 180 ? '…' : ''}</motion.p>
            <motion.div className="ab-hero-actions" variants={fadeUp}>
              <button className="ab-btn-g"><Phone size={13} /> Consulta gratuita</button>
              <button className="ab-btn-o"><Shield size={13} /> Ver áreas de práctica</button>
            </motion.div>
          </motion.div>
          <motion.div className="ab-hero-img" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
            {photos[0] && photos[0].startsWith('data:') ? <img src={photos[0]} alt={businessName} /> : '⚖️'}
          </motion.div>
        </section>

        <div className="ab-trust">
          {['Más de 20 años de experiencia', 'Primera consulta gratuita', '+1.200 casos resueltos', 'Discreción garantizada'].map((t, i) => (
            <div key={i} className="ab-trust-item"><Check size={13} />{t}</div>
          ))}
        </div>

        <section className="ab-section" id="areas">
          <motion.div className="ab-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="ab-tag" variants={fadeUp}>Áreas de práctica</motion.span>
            <div className="ab-div" />
            <motion.h2 className="ab-title" variants={fadeUp}>Expertise jurídico a su servicio</motion.h2>
            <motion.p className="ab-sub" variants={fadeUp}>Cubrimos todas las ramas del derecho con equipos especializados y enfoque orientado a resultados.</motion.p>
          </motion.div>
          <motion.div className="ab-areas-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            {displayServices.map((s, i) => (
              <motion.div key={i} className="ab-area" variants={fadeUp}>
                <div className="ab-area-num">0{i + 1}</div>
                <div className="ab-area-name">{s.name}</div>
                <div className="ab-area-desc">{s.description || 'Asesoramiento jurídico especializado y eficaz.'}</div>
                <div className="ab-area-cta">Saber más <ArrowRight size={13} /></div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="ab-section ab-alt" id="despacho">
          <div className="ab-about-grid">
            <motion.div className="ab-about-img" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              {photos[1] && photos[1].startsWith('data:') ? <img src={photos[1]} alt="" /> : '⚖️'}
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.span className="ab-tag" variants={fadeUp}>El despacho</motion.span>
              <div className="ab-div" />
              <motion.h2 className="ab-title" variants={fadeUp}>Defendemos sus intereses<br />con rigor y eficacia</motion.h2>
              <motion.p className="ab-sub" variants={fadeUp}>{description}</motion.p>
              <motion.div className="ab-values" variants={stagger}>
                {[{ n: '20+', t: 'Años de experiencia', d: 'Décadas defendiendo a particulares y empresas' }, { n: '98%', t: 'Tasa de éxito', d: 'Resultados que avalan nuestra metodología' }, { n: '24h', t: 'Respuesta garantizada', d: 'Siempre disponibles cuando más nos necesita' }].map((v, i) => (
                  <motion.div key={i} className="ab-value" variants={fadeUp}>
                    <div className="ab-value-num">{v.n}</div>
                    <div><div className="ab-value-title">{v.t}</div><div className="ab-value-desc">{v.d}</div></div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="ab-section ab-dark" id="contacto">
          <motion.div className="ab-header" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.span className="ab-tag" variants={fadeUp}>Contacto</motion.span>
            <div className="ab-div" />
            <motion.h2 className={`ab-title ab-title-w`} variants={fadeUp}>Consúltenos sin compromiso</motion.h2>
            <motion.p className={`ab-sub ab-sub-w`} variants={fadeUp}>Primera consulta gratuita. Le respondemos en menos de 24 horas.</motion.p>
          </motion.div>
          <div className="ab-contact-grid">
            <div className="ab-contact-items">
              {[{ icon: <Phone size={17} />, label: 'Teléfono', value: phone }, { icon: <Mail size={17} />, label: 'Email', value: email }, { icon: <MapPin size={17} />, label: 'Despacho', value: address }, { icon: <Clock size={17} />, label: 'Horario', value: schedule }].filter(i => i.value).map((item, i) => (
                <div key={i} className="ab-ci">
                  <span className="ab-ci-icon">{item.icon}</span>
                  <div><div className="ab-ci-label">{item.label}</div><div className="ab-ci-value">{item.value}</div></div>
                </div>
              ))}
            </div>
            <form className="ab-form" onSubmit={e => e.preventDefault()}>
              <div className="ab-field"><label>Nombre y apellidos</label><input type="text" placeholder="Su nombre completo" /></div>
              <div className="ab-field"><label>Teléfono</label><input type="tel" placeholder="91 000 00 00" /></div>
              <div className="ab-field"><label>Asunto de la consulta</label><textarea rows={4} placeholder="Describa brevemente su situación legal..." /></div>
              <button className="ab-submit" type="submit">Solicitar consulta gratuita <ArrowRight size={14} /></button>
            </form>
          </div>
        </section>

        <footer className="ab-footer">
          <div className="ab-footer-logo">⚖️ {first} <span>{rest}</span></div>
          <span>© {new Date().getFullYear()} {businessName} · Aviso Legal · Privacidad</span>
        </footer>
      </div>
    </>
  );
}

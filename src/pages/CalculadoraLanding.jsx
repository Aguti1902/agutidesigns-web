import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Globe, Smartphone, ShoppingCart, FileText,
  Check, CheckCircle, Mail, Zap, MessageCircle, RefreshCw, Lock,
  Sparkles, TrendingUp, Layers, Clock, Search, BarChart3, Calendar,
  ShoppingBag, BookOpen, Users, Languages, MessageSquare, Star,
  CreditCard, Image, Cpu, Package,
} from 'lucide-react';
import { calculatePrice, formatPrice } from '../services/priceCalculator';
import './CalculadoraLanding.css';

/* ── Step Data ── */
const WEB_TYPES = [
  { id: 'landing',     label: 'Landing Page',    desc: 'Una sola página enfocada a vender',    icon: <FileText size={22} /> },
  { id: 'corporativa', label: 'Web Corporativa',  desc: 'Varias páginas para tu negocio',        icon: <Globe size={22} />,      popular: true },
  { id: 'ecommerce',   label: 'Tienda Online',    desc: 'Vende productos o servicios online',    icon: <ShoppingCart size={22} /> },
  { id: 'portfolio',   label: 'Portfolio',        desc: 'Muestra tu trabajo y atrae clientes',   icon: <Smartphone size={22} /> },
];

const PAGE_OPTIONS = [
  { id: '1',    label: '1 página' },
  { id: '1-3',  label: '1–3 páginas' },
  { id: '3-5',  label: '3–5 páginas' },
  { id: '5-10', label: '5–10 páginas' },
  { id: '10+',  label: 'Más de 10' },
];

const DESIGN_STYLES = [
  { id: 'minimalista', label: 'Minimalista', desc: 'Limpio, espacioso, elegante' },
  { id: 'moderno',     label: 'Moderno',     desc: 'Dinámico, animaciones, impacto' },
  { id: 'premium',     label: 'Premium',     desc: 'Exclusivo, elaborado, lujo' },
  { id: 'creativo',    label: 'Creativo',    desc: 'Original, diferente, artístico' },
];

const FUNCTIONALITIES = [
  { id: 'reservas',    label: 'Sistema de reservas',   icon: <Calendar size={15} />,     price: 120 },
  { id: 'tienda',      label: 'Carrito de compras',    icon: <ShoppingBag size={15} />,  price: 350 },
  { id: 'blog',        label: 'Blog / Noticias',       icon: <BookOpen size={15} />,     price: 120 },
  { id: 'miembros',    label: 'Área de miembros',      icon: <Users size={15} />,        price: 280 },
  { id: 'pagos',       label: 'Pasarela de pago',      icon: <CreditCard size={15} />,   price: 200 },
  { id: 'galeria',     label: 'Galería avanzada',      icon: <Image size={15} />,        price: 80 },
  { id: 'multiidioma', label: 'Multiidioma',           icon: <Languages size={15} />,    price: 150 },
  { id: 'chat',        label: 'Chat en vivo',          icon: <MessageSquare size={15} />, price: 100 },
  { id: 'formularios', label: 'Formularios avanzados', icon: <Layers size={15} />,       price: 80 },
];

const SEO_OPTIONS = [
  { id: 'seo-basico',     label: 'SEO básico',            desc: 'Meta tags, velocidad, sitemap',          icon: <Search size={16} />,   price: 0,   included: true },
  { id: 'seo-avanzado',   label: 'SEO avanzado',          desc: 'Schema, palabras clave, posicionamiento', icon: <TrendingUp size={16} />, price: 350 },
  { id: 'analytics',      label: 'Google Analytics 4',    desc: 'Estadísticas y seguimiento avanzado',    icon: <BarChart3 size={16} />, price: 80 },
  { id: 'google-ads',     label: 'Configuración Google Ads', desc: 'Campañas de publicidad listas',       icon: <Star size={16} />,     price: 200 },
  { id: 'chatbot-web',    label: 'Chatbot IA en la web',  desc: 'Asistente automático 24/7',              icon: <Cpu size={16} />,      price: 250 },
];

const TIMELINES = [
  { id: 'urgente',    label: 'Urgente',    desc: '1 semana',    color: 'red' },
  { id: 'normal',     label: 'Estándar',   desc: '2–3 semanas', color: 'green', recommended: true },
  { id: 'flexible',   label: 'Flexible',   desc: '1 mes',       color: 'blue' },
  { id: 'sin-prisa',  label: 'Sin prisa',  desc: '1–2 meses',   color: 'gray' },
];

const PRODUCT_COUNT_OPTIONS = [
  { id: '1-50',    label: '1–50 productos',       desc: 'Catálogo pequeño',         extra: 0   },
  { id: '50-200',  label: '50–200 productos',      desc: 'Catálogo mediano',         extra: 200 },
  { id: '200-500', label: '200–500 productos',     desc: 'Catálogo grande',          extra: 450 },
  { id: '500+',    label: 'Más de 500 productos',  desc: 'Catálogo profesional',     extra: 850 },
];

const TOTAL_STEPS = 6;
const STEP_LABELS = ['Tipo de web', 'Páginas y estilo', 'Funcionalidades', 'SEO y extras', 'Plazo', 'Tu email'];

const LOADING_MESSAGES = [
  'Analizando tu proyecto...',
  'Calculando funcionalidades...',
  'Evaluando tiempo de desarrollo...',
  'Aplicando descuentos disponibles...',
  'Preparando tu presupuesto personalizado...',
];

/* ── Price Preview (hidden total, shows only progress) ── */
function calcEstimate(formData) {
  if (!formData.webType) return null;
  return calculatePrice({ ...formData, aiFeatures: formData.seoExtras?.filter(s => s === 'chatbot-web') || [], extraFeatures: [...(formData.functionalities || []), ...(formData.seoExtras?.filter(s => s !== 'chatbot-web') || [])] });
}

/* ── Loading Screen ── */
function LoadingScreen({ onDone }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx(i => {
        if (i >= LOADING_MESSAGES.length - 1) { clearInterval(msgInterval); return i; }
        return i + 1;
      });
    }, 700);

    const progInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progInterval); return 100; }
        return p + 2.5;
      });
    }, 90);

    const done = setTimeout(onDone, 4000);
    return () => { clearInterval(msgInterval); clearInterval(progInterval); clearTimeout(done); };
  }, [onDone]);

  return (
    <motion.div className="calc-loading" key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="calc-loading__orb" />
      <div className="calc-loading__content">
        <div className="calc-loading__spinner">
          <div className="calc-loading__ring" />
          <Sparkles size={24} className="calc-loading__spark" />
        </div>
        <h2 className="calc-loading__title">Preparando tu presupuesto</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            className="calc-loading__msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="calc-loading__bar">
          <motion.div
            className="calc-loading__bar-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <span className="calc-loading__pct">{Math.round(progress)}%</span>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function CalculadoraLanding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    webType: '',
    pages: '1-3',
    designStyle: 'moderno',
    functionalities: [],
    seoExtras: ['seo-basico'],
    timeline: 'normal',
    name: '',
    email: '',
    productCount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const set = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const toggle = (field, value) => setFormData(p => ({
    ...p,
    [field]: p[field].includes(value) ? p[field].filter(v => v !== value) : [...p[field], value],
  }));

  const validate = () => {
    setError('');
    if (step === 1 && !formData.webType) { setError('Selecciona un tipo de web para continuar.'); return false; }
    if (step === 2 && formData.webType === 'ecommerce' && !formData.productCount) {
      setError('Indica cuántos productos tiene tu tienda.'); return false;
    }
    if (step === 6) {
      if (!formData.name.trim()) { setError('Introduce tu nombre.'); return false; }
      if (!formData.email.trim() || !formData.email.includes('@')) { setError('Introduce un email válido.'); return false; }
    }
    return true;
  };

  // Al seleccionar landing, forzar 1 página
  const selectWebType = (id) => {
    if (id === 'landing') {
      setFormData(p => ({ ...p, webType: id, pages: '1' }));
    } else {
      setFormData(p => ({ ...p, webType: id, pages: p.pages === '1' ? '1-3' : p.pages }));
    }
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const prev = () => { setStep(s => Math.max(s - 1, 1)); setError(''); };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsLoading(true);
  };

  const sendLeadToN8N = async (quoteData) => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (!webhookUrl) return;
    const WEB_TYPE_LABELS = { landing: 'Landing Page', corporativa: 'Web Corporativa', ecommerce: 'Tienda Online', portfolio: 'Portfolio' };
    const TIMELINE_LABELS = { urgente: 'Urgente (+25%)', normal: 'Normal (3-4 sem)', flexible: 'Flexible (-5%)', 'sin-prisa': 'Sin prisa (-10%)' };
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          webType: WEB_TYPE_LABELS[formData.webType] || formData.webType,
          webTypeId: formData.webType,
          pages: formData.pages,
          productCount: formData.productCount || null,
          designStyle: formData.designStyle,
          functionalities: formData.functionalities,
          seoExtras: formData.seoExtras,
          timeline: TIMELINE_LABELS[formData.timeline] || formData.timeline,
          price: quoteData.total,
          priceDiscount: Math.round(quoteData.total * 0.8),
          monthly: quoteData.monthly,
          breakdown: quoteData.breakdown,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('[AgutiDesigns] Error enviando lead a n8n:', e);
    }
  };

  const handleLoadingDone = () => {
    const aiFeatures = formData.seoExtras.filter(s => s === 'chatbot-web');
    const extraFeatures = [
      ...formData.functionalities,
      ...formData.seoExtras.filter(s => s !== 'chatbot-web' && s !== 'seo-basico'),
    ];
    const styleMultipliers = { minimalista: 1, moderno: 1.1, premium: 1.25, creativo: 1.15 };
    const styleM = styleMultipliers[formData.designStyle] || 1;

    const raw = calculatePrice({ ...formData, aiFeatures, extraFeatures });
    const total = Math.round(raw.total * styleM);
    const breakdownFull = [...raw.breakdown];
    if (styleM !== 1) {
      const diff = total - raw.total;
      breakdownFull.push({ label: `Estilo ${formData.designStyle}`, price: diff });
    }
    const quoteData = { ...raw, total, breakdown: breakdownFull };
    setQuote(quoteData);
    setIsLoading(false);
    sendLeadToN8N(quoteData);
  };

  const reset = () => {
    setFormData({ webType: '', pages: '1-3', designStyle: 'moderno', functionalities: [], seoExtras: ['seo-basico'], timeline: 'normal', name: '', email: '', productCount: '' });
    setStep(1); setQuote(null); setError(''); setIsLoading(false);
  };

  return (
    <div className="calc-landing">
      <header className="calc-header">
        <a href="/" className="calc-header__logo">
          <img src="/images/logoazul.png" alt="Agutidesigns" className="calc-header__logo-img" />
        </a>
        <a href="/" className="calc-header__back">← Volver a la web</a>
      </header>

      <main className="calc-main">
        <AnimatePresence mode="wait">

          {/* ── LOADING ── */}
          {isLoading && <LoadingScreen key="loading" onDone={handleLoadingDone} />}

          {/* ── RESULTADO ── */}
          {!isLoading && quote && (
            <motion.div key="result" className="calc-result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <div className="calc-result__check"><CheckCircle size={52} /></div>
              <h1 className="calc-result__greeting">{formData.name ? `Aquí está tu presupuesto, ${formData.name} 🎉` : 'Tu presupuesto personalizado'}</h1>
              <p className="calc-result__sub">Calculado en base a tus respuestas · {new Date().toLocaleDateString('es-ES')}</p>

              <div className="calc-result__price-box">
                <span className="calc-result__price-label">Precio total del proyecto</span>
                <div className="calc-result__price-amount">
                  {formatPrice(quote.total)}<span className="calc-result__price-eur">€</span>
                </div>
                <span className="calc-result__price-monthly">+ {formatPrice(quote.monthly)}€/mes mantenimiento opcional</span>
              </div>

              <div className="calc-result__breakdown">
                <h4>Desglose del presupuesto</h4>
                <ul>
                  {quote.breakdown.map((item, i) => (
                    <li key={i}>
                      <span>{item.label}</span>
                      <span className={item.price < 0 ? 'calc-result__discount' : ''}>{item.price >= 0 ? '+' : ''}{formatPrice(item.price)}€</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="calc-result__email-note">
                <Mail size={13} />
                <span>Presupuesto enviado a <strong>{formData.email}</strong></span>
              </div>

              <div className="calc-result__actions">
                <a
                  href={`https://wa.me/34600000000?text=${encodeURIComponent(`¡Hola Guti! He calculado mi presupuesto (${formatPrice(quote.total)}€) y me gustaría hablar sobre mi proyecto web.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="calc-btn calc-btn--whatsapp"
                >
                  <MessageCircle size={18} /> Hablar con Guti por WhatsApp
                </a>
                <button className="calc-btn calc-btn--primary" onClick={() => window.location.href = '/'}>
                  <Zap size={18} /> Empezar mi proyecto
                </button>
              </div>

              <button className="calc-btn calc-btn--ghost calc-result__reset" onClick={reset}>
                <RefreshCw size={13} /> Calcular otro presupuesto
              </button>
            </motion.div>
          )}

          {/* ── FORMULARIO ── */}
          {!isLoading && !quote && (
            <motion.div key="form" className="calc-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="calc-form__top">
                <span className="calc-badge"><Sparkles size={12} /> Calculadora de precios</span>
                <h1 className="calc-form__title">¿Cuánto cuesta<span className="text-primary"> tu web?</span></h1>
                <p className="calc-form__subtitle">Responde {TOTAL_STEPS} preguntas y descubre tu precio personalizado.</p>
              </div>

              {/* Progress */}
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

              {/* Steps */}
              <AnimatePresence mode="wait">
                <motion.div key={step} className="calc-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                  {/* PASO 1: Tipo de web */}
                  {step === 1 && (
                    <>
                      <h2 className="calc-step__title">¿Qué tipo de web necesitas?</h2>
                      <p className="calc-step__desc">Selecciona el que mejor describe tu proyecto.</p>
                      <div className="calc-types">
                        {WEB_TYPES.map(t => (
                          <button key={t.id} className={`calc-type ${formData.webType === t.id ? 'calc-type--active' : ''}`} onClick={() => selectWebType(t.id)}>
                            <div className="calc-type__icon">{t.icon}</div>
                            <div className="calc-type__info">
                              <span className="calc-type__label">{t.label} {t.popular && <span className="calc-type__popular">Popular</span>}</span>
                              <span className="calc-type__desc">{t.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* PASO 2: Páginas + Estilo */}
                  {step === 2 && (
                    <>
                      <h2 className="calc-step__title">Páginas y estilo visual</h2>
                      <p className="calc-step__desc">Define el alcance y la estética de tu web.</p>

                      {/* Número de páginas — oculto en ecommerce */}
                      {formData.webType !== 'ecommerce' && (
                        <div className="calc-field">
                          <label className="calc-field__label">Número de páginas</label>
                          {formData.webType === 'landing' && (
                            <div className="calc-lock-notice">
                              <Lock size={13} />
                              <span>Las landing pages son siempre de una sola página</span>
                            </div>
                          )}
                          <div className="calc-pills">
                            {PAGE_OPTIONS.map(p => {
                              const isLocked = formData.webType === 'landing' && p.id !== '1';
                              return (
                                <button
                                  key={p.id}
                                  className={`calc-pill ${formData.pages === p.id ? 'calc-pill--active' : ''} ${isLocked ? 'calc-pill--locked' : ''}`}
                                  onClick={() => !isLocked && set('pages', p.id)}
                                  disabled={isLocked}
                                >
                                  {isLocked && <Lock size={10} style={{ marginRight: 3, opacity: 0.5 }} />}
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Campo condicional: productos para ecommerce */}
                      {formData.webType === 'ecommerce' && (
                        <div className="calc-field">
                          <label className="calc-field__label">
                            <Package size={15} />
                            ¿Cuántos productos tiene tu tienda?
                          </label>
                          <p className="calc-step__desc" style={{ marginBottom: 'var(--space-3)', marginTop: '-4px', fontSize: 'var(--text-xs)' }}>
                            Esto afecta al tiempo de desarrollo y configuración del catálogo.
                          </p>
                          <div className="calc-options">
                            {PRODUCT_COUNT_OPTIONS.map(opt => (
                              <button
                                key={opt.id}
                                className={`calc-option ${formData.productCount === opt.id ? 'calc-option--active' : ''}`}
                                onClick={() => set('productCount', opt.id)}
                              >
                                <div className="calc-option__icon">
                                  <Package size={18} />
                                </div>
                                <div>
                                  <span className="calc-option__label">{opt.label}</span>
                                  <span className="calc-option__desc">{opt.desc}</span>
                                </div>
                                {formData.productCount === opt.id && <Check size={16} style={{ marginLeft: 'auto', color: 'var(--color-primary)', flexShrink: 0 }} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estilo de diseño */}
                      <div className="calc-field">
                        <label className="calc-field__label">Estilo de diseño</label>
                        <div className="calc-styles">
                          {DESIGN_STYLES.map(s => (
                            <button key={s.id} className={`calc-style ${formData.designStyle === s.id ? 'calc-style--active' : ''}`} onClick={() => set('designStyle', s.id)}>
                              <span className="calc-style__label">{s.label}</span>
                              <span className="calc-style__desc">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* PASO 3: Funcionalidades */}
                  {step === 3 && (
                    <>
                      <h2 className="calc-step__title">¿Qué funcionalidades necesitas?</h2>
                      <p className="calc-step__desc">Selecciona todo lo que quieres en tu web. Son opcionales.</p>
                      <div className="calc-funcs">
                        {FUNCTIONALITIES.map(f => (
                          <button key={f.id} className={`calc-func ${formData.functionalities.includes(f.id) ? 'calc-func--active' : ''}`} onClick={() => toggle('functionalities', f.id)}>
                            <div className="calc-func__left">
                              <span className="calc-func__icon">{f.icon}</span>
                              <span className="calc-func__label">{f.label}</span>
                            </div>
                            <div className="calc-func__right">
                              {formData.functionalities.includes(f.id) && <Check size={14} className="calc-func__check" />}
                            </div>
                          </button>
                        ))}
                      </div>
                      {formData.functionalities.length > 0 && (
                        <p className="calc-extras__count">
                          {formData.functionalities.length} funcionalidad{formData.functionalities.length > 1 ? 'es' : ''} seleccionada{formData.functionalities.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </>
                  )}

                  {/* PASO 4: SEO & Extras */}
                  {step === 4 && (
                    <>
                      <h2 className="calc-step__title">SEO y extras digitales</h2>
                      <p className="calc-step__desc">¿Quieres aparecer en Google y crecer online? Añade lo que necesitas.</p>
                      <div className="calc-seo-list">
                        {SEO_OPTIONS.map(s => (
                          <button
                            key={s.id}
                            className={`calc-seo ${formData.seoExtras.includes(s.id) ? 'calc-seo--active' : ''} ${s.included ? 'calc-seo--included' : ''}`}
                            onClick={() => { if (!s.included) toggle('seoExtras', s.id); }}
                          >
                            <div className="calc-seo__icon">{s.icon}</div>
                            <div className="calc-seo__info">
                              <span className="calc-seo__label">{s.label}</span>
                              <span className="calc-seo__desc">{s.desc}</span>
                            </div>
                            <div className="calc-seo__price">
                              {s.included
                                ? <span className="calc-seo__free">Incluido</span>
                                : formData.seoExtras.includes(s.id)
                                  ? <Check size={14} className="calc-func__check" />
                                  : null
                              }
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* PASO 5: Plazo */}
                  {step === 5 && (
                    <>
                      <h2 className="calc-step__title">¿Para cuándo lo necesitas?</h2>
                      <p className="calc-step__desc">El plazo puede afectar al precio final.</p>
                      <div className="calc-timelines">
                        {TIMELINES.map(t => (
                          <button key={t.id} className={`calc-timeline calc-timeline--${t.color} ${formData.timeline === t.id ? 'calc-timeline--active' : ''}`} onClick={() => set('timeline', t.id)}>
                            <div className="calc-timeline__left">
                              <Clock size={16} />
                              <div>
                                <span className="calc-timeline__label">{t.label} {t.recommended && <span className="calc-timeline__rec">Recomendado</span>}</span>
                                <span className="calc-timeline__desc">{t.desc}</span>
                              </div>
                            </div>
                            {formData.timeline === t.id && <Check size={16} className="calc-func__check" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* PASO 6: Email */}
                  {step === 6 && (
                    <>
                      <h2 className="calc-step__title">Último paso: introduce tu email</h2>
                      <p className="calc-step__desc">Solo necesitamos tu nombre y email para mostrarte el precio final.</p>

                      <div className="calc-field">
                        <label className="calc-field__label">Tu nombre *</label>
                        <input type="text" className="calc-input" placeholder="¿Cómo te llamas?" value={formData.name} onChange={e => set('name', e.target.value)} />
                      </div>

                      <div className="calc-field">
                        <label className="calc-field__label">Tu email *</label>
                        <div className="calc-input-wrap">
                          <Mail size={16} className="calc-input-wrap__icon" aria-hidden="true" />
                          <input type="email" className="calc-input calc-input--icon" placeholder="tu@email.com" value={formData.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
                        </div>
                      </div>

                      <div className="calc-privacy"><Lock size={12} /><span>Sin spam. Solo te enviamos tu presupuesto detallado. Puedes darte de baja cuando quieras.</span></div>

                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && <p className="calc-error">{error}</p>}

              <div className="calc-nav">
                {step > 1 && <button className="calc-btn calc-btn--ghost" onClick={prev}><ArrowLeft size={16} /> Anterior</button>}
                <div className="calc-nav__spacer" />
                {step < TOTAL_STEPS
                  ? <button className="calc-btn calc-btn--primary" onClick={next}>Siguiente <ArrowRight size={16} /></button>
                  : <button className="calc-btn calc-btn--primary calc-btn--lg" onClick={handleSubmit}><Zap size={18} /> Ver mi precio ahora</button>
                }
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="calc-footer">
        <span>© {new Date().getFullYear()} Agutidesigns · <a href="/">Volver a la web</a></span>
      </footer>
    </div>
  );
}

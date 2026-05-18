import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Upload, Plus, Trash2,
  Eye, Check, Zap, X, Maximize2,
} from 'lucide-react';
import ClinicaDentalTemplate from '../templates/ClinicaDental/Template';
import FisioterapiaTemplate  from '../templates/Fisioterapia/Template';
import PsicologiaTemplate    from '../templates/Psicologia/Template';
import RestauranteTemplate   from '../templates/Restaurante/Template';
import AbogadosTemplate      from '../templates/Abogados/Template';
import GenericaTemplate      from '../templates/Generica/Template';
import { config as clinicaConfig } from '../templates/ClinicaDental/config';
import { config as fisioConfig   } from '../templates/Fisioterapia/config';
import { config as psiConfig     } from '../templates/Psicologia/config';
import { config as restConfig    } from '../templates/Restaurante/config';
import { config as abogConfig    } from '../templates/Abogados/config';
import { config as genConfig     } from '../templates/Generica/config';
import { generateDescription } from '../utils/generateContent';
import './Onboarding.css';

const TEMPLATES = {
  ClinicaDental: { component: ClinicaDentalTemplate, config: clinicaConfig, emoji: '🦷' },
  Fisioterapia:  { component: FisioterapiaTemplate,  config: fisioConfig,   emoji: '💪' },
  Psicologia:    { component: PsicologiaTemplate,    config: psiConfig,     emoji: '🧠' },
  Restaurante:   { component: RestauranteTemplate,   config: restConfig,    emoji: '🍽️' },
  Abogados:      { component: AbogadosTemplate,      config: abogConfig,    emoji: '⚖️' },
  Generica:      { component: GenericaTemplate,      config: genConfig,     emoji: '🚀' },
};

const SECTORS = [
  { value: 'clinica-dental', label: 'Clínica Dental',         template: 'ClinicaDental' },
  { value: 'fisioterapia',   label: 'Fisioterapia',            template: 'Fisioterapia'  },
  { value: 'psicologia',     label: 'Psicología / Terapia',    template: 'Psicologia'    },
  { value: 'restaurante',    label: 'Restaurante / Bar',        template: 'Restaurante'   },
  { value: 'abogados',       label: 'Abogados / Asesoría',      template: 'Abogados'      },
  { value: 'otro',           label: 'Otro negocio',             template: 'Generica'      },
];

const INITIAL_DATA = {
  businessName: '', sector: '', phone: '', email: '', address: '', schedule: '',
  logo: null, logoPreview: '',
  primaryColor: '#1B6CA8', secondaryColor: '#E8F4FD',
  photos: [], photosPreviews: [],
  description: '',
  services: [{ id: 1, name: '', price: '', description: '' }],
  selectedTemplate: 'ClinicaDental',
};

const STEPS = [
  { num: 1, label: 'Datos',     icon: '📋' },
  { num: 2, label: 'Identidad', icon: '🎨' },
  { num: 3, label: 'Contenido', icon: '✍️'  },
  { num: 4, label: 'Plantilla', icon: '🖥️'  },
];

const slide = {
  enter: d => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:   d => ({ x: d > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState(INITIAL_DATA);
  const [previewScale, setPreviewScale] = useState(0.42);
  const [fullPreview, setFullPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serviceIdCounter, setServiceIdCounter] = useState(2);
  const previewRef = useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setPreviewScale(entry.contentRect.width / 1440);
      }
    });
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const update = useCallback((field, value) => setData(p => ({ ...p, [field]: value })), []);

  const goNext = () => { setDir(1);  setStep(s => Math.min(s + 1, 4)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleLogoUpload = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { update('logoPreview', ev.target.result); update('logo', file); };
    reader.readAsDataURL(file);
  };

  const handlePhotosUpload = e => {
    const files = Array.from(e.target.files).slice(0, 6);
    const previews = [];
    let loaded = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        previews.push(ev.target.result);
        if (++loaded === files.length) {
          setData(p => ({
            ...p,
            photos:        [...p.photos,        ...files   ].slice(0, 6),
            photosPreviews: [...p.photosPreviews, ...previews].slice(0, 6),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = idx => setData(p => ({
    ...p,
    photos:         p.photos.filter((_, i) => i !== idx),
    photosPreviews: p.photosPreviews.filter((_, i) => i !== idx),
  }));

  const addService = () => {
    setData(p => ({ ...p, services: [...p.services, { id: serviceIdCounter, name: '', price: '', description: '' }] }));
    setServiceIdCounter(c => c + 1);
  };

  const removeService = id => setData(p => ({ ...p, services: p.services.filter(s => s.id !== id) }));
  const updateService = (id, field, value) => setData(p => ({ ...p, services: p.services.map(s => s.id === id ? { ...s, [field]: value } : s) }));

  const handleGenerate = async () => {
    setIsGenerating(true);
    try { update('description', await generateDescription(data)); }
    finally { setIsGenerating(false); }
  };

  const selectSector = value => {
    const match = SECTORS.find(s => s.value === value);
    const tpl = match?.template || 'Generica';
    const cfg = TEMPLATES[tpl]?.config;
    setData(p => ({ ...p, sector: value, selectedTemplate: tpl, primaryColor: cfg?.primaryColor || p.primaryColor, secondaryColor: cfg?.secondaryColor || p.secondaryColor }));
  };

  const selectTemplate = id => {
    const cfg = TEMPLATES[id]?.config;
    setData(p => ({ ...p, selectedTemplate: id, primaryColor: cfg?.primaryColor || p.primaryColor, secondaryColor: cfg?.secondaryColor || p.secondaryColor }));
  };

  const CurrentTemplate = TEMPLATES[data.selectedTemplate]?.component || ClinicaDentalTemplate;
  const canProceed = step === 1 ? data.businessName.trim().length > 0 : true;

  return (
    <div className="ob-root">
      {/* HEADER */}
      <header className="ob-header">
        <div className="ob-header-logo">
          <span className="ob-logo-dot" />
          <span className="ob-logo-text">agutidesigns</span>
        </div>
        <div className="ob-steps-bar">
          {STEPS.map(s => (
            <div key={s.num} className={`ob-step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
              <div className="ob-step-circle">
                {step > s.num ? <Check size={13} /> : s.icon}
              </div>
              <span className="ob-step-label">{s.label}</span>
            </div>
          ))}
          <div className="ob-steps-line" style={{ '--progress': `${((step - 1) / 3) * 100}%` }} />
        </div>
        <span className="ob-step-counter">Paso {step} de 4</span>
      </header>

      <div className="ob-layout">
        {/* FORM */}
        <div className="ob-form-panel">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" className="ob-step-content">
              {step === 1 && <Step1 data={data} update={update} selectSector={selectSector} />}
              {step === 2 && <Step2 data={data} update={update} onLogoUpload={handleLogoUpload} onPhotosUpload={handlePhotosUpload} removePhoto={removePhoto} />}
              {step === 3 && <Step3 data={data} update={update} onGenerate={handleGenerate} isGenerating={isGenerating} addService={addService} removeService={removeService} updateService={updateService} />}
              {step === 4 && <Step4 data={data} selectTemplate={selectTemplate} setFullPreview={setFullPreview} TEMPLATES={TEMPLATES} />}
            </motion.div>
          </AnimatePresence>

          <div className="ob-nav-buttons">
            <button className="ob-btn-prev" onClick={goPrev} disabled={step === 1}>
              <ArrowLeft size={15} /> Anterior
            </button>
            {step < 4 ? (
              <button className={`ob-btn-next ${!canProceed ? 'disabled' : ''}`} onClick={canProceed ? goNext : undefined}>
                Siguiente <ArrowRight size={15} />
              </button>
            ) : (
              <button className="ob-btn-finish">
                Activar trial 1€ <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="ob-preview-panel">
          <div className="ob-preview-header">
            <div className="ob-preview-dots"><span /><span /><span /></div>
            <span className="ob-preview-label">Vista previa en tiempo real</span>
            <button className="ob-preview-expand" onClick={() => setFullPreview(data.selectedTemplate)}>
              <Maximize2 size={13} />
            </button>
          </div>
          <div className="ob-preview-outer" ref={previewRef}>
            <div className="ob-preview-inner" style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 1440 }}>
              <CurrentTemplate businessData={data} />
            </div>
          </div>
          <div className="ob-preview-footer">
            <span className="ob-preview-tag">{TEMPLATES[data.selectedTemplate]?.config.name}</span>
            <button className="ob-preview-change" onClick={() => { setDir(1); setStep(4); }}>
              Cambiar plantilla
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {fullPreview && (
          <motion.div className="ob-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFullPreview(null)}>
            <motion.div className="ob-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}>
              <button className="ob-modal-close" onClick={() => setFullPreview(null)}><X size={19} /></button>
              <div className="ob-modal-scroll">
                {(() => { const T = TEMPLATES[fullPreview]?.component || ClinicaDentalTemplate; return <T businessData={data} />; })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── PASO 1 ─────────────────────────────────────────── */
function Step1({ data, update, selectSector }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head"><h2 className="ob-step-title">Datos de tu negocio</h2><p className="ob-step-desc">Empieza con la información básica. Se mostrará en tu web.</p></div>
      <div className="ob-fields">
        <div className="ob-field ob-full">
          <label>Nombre del negocio *</label>
          <input type="text" placeholder="Ej: Clínica Dental García" value={data.businessName} onChange={e => update('businessName', e.target.value)} autoFocus />
        </div>
        <div className="ob-field ob-full">
          <label>Sector</label>
          <select value={data.sector} onChange={e => selectSector(e.target.value)}>
            <option value="">Selecciona tu sector…</option>
            {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="ob-field"><label>Teléfono</label><input type="tel" placeholder="612 345 678" value={data.phone} onChange={e => update('phone', e.target.value)} /></div>
        <div className="ob-field"><label>Email</label><input type="email" placeholder="info@tunegocio.com" value={data.email} onChange={e => update('email', e.target.value)} /></div>
        <div className="ob-field ob-full"><label>Dirección</label><input type="text" placeholder="Calle Mayor 15, Madrid" value={data.address} onChange={e => update('address', e.target.value)} /></div>
        <div className="ob-field ob-full"><label>Horario</label><input type="text" placeholder="Lun–Vie 9:00–20:00 · Sáb 9:00–14:00" value={data.schedule} onChange={e => update('schedule', e.target.value)} /></div>
      </div>
    </div>
  );
}

/* ── PASO 2 ─────────────────────────────────────────── */
function Step2({ data, update, onLogoUpload, onPhotosUpload, removePhoto }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head"><h2 className="ob-step-title">Identidad visual</h2><p className="ob-step-desc">Personaliza colores y sube imágenes de tu negocio.</p></div>
      <div className="ob-fields">
        <div className="ob-field ob-full">
          <label>Logo del negocio</label>
          <label className="ob-upload ob-upload-logo">
            <input type="file" accept="image/*" onChange={onLogoUpload} hidden />
            {data.logoPreview
              ? <><img src={data.logoPreview} alt="logo" className="ob-logo-preview" />
                  <button className="ob-remove-logo" onClick={e => { e.preventDefault(); update('logoPreview', ''); update('logo', null); }}><X size={13} /></button></>
              : <><Upload size={22} /><span>Subir logo</span><small>PNG, JPG, SVG hasta 2MB</small></>}
          </label>
        </div>
        <div className="ob-field">
          <label>Color principal</label>
          <div className="ob-color-row">
            <input type="color" value={data.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="ob-color-input" />
            <input type="text" value={data.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="ob-color-hex" maxLength={7} />
          </div>
        </div>
        <div className="ob-field">
          <label>Color secundario</label>
          <div className="ob-color-row">
            <input type="color" value={data.secondaryColor} onChange={e => update('secondaryColor', e.target.value)} className="ob-color-input" />
            <input type="text" value={data.secondaryColor} onChange={e => update('secondaryColor', e.target.value)} className="ob-color-hex" maxLength={7} />
          </div>
        </div>
        <div className="ob-field ob-full">
          <label>Fotos del negocio <span className="ob-hint">(2–6 fotos)</span></label>
          <label className="ob-upload ob-upload-photos">
            <input type="file" accept="image/*" multiple onChange={onPhotosUpload} hidden />
            <Upload size={20} /><span>Añadir fotos</span><small>{data.photosPreviews.length}/6 subidas</small>
          </label>
          {data.photosPreviews.length > 0 && (
            <div className="ob-photos-grid">
              {data.photosPreviews.map((p, i) => (
                <div key={i} className="ob-photo-thumb">
                  <img src={p} alt="" />
                  <button className="ob-photo-remove" onClick={() => removePhoto(i)}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── PASO 3 ─────────────────────────────────────────── */
function Step3({ data, update, onGenerate, isGenerating, addService, removeService, updateService }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head"><h2 className="ob-step-title">Contenido de tu web</h2><p className="ob-step-desc">Describe tu negocio y añade tus servicios o productos.</p></div>
      <div className="ob-fields">
        <div className="ob-field ob-full">
          <div className="ob-label-row">
            <label>Descripción del negocio</label>
            <button className={`ob-ai-btn ${isGenerating ? 'loading' : ''}`} onClick={onGenerate} disabled={isGenerating || !data.businessName}>
              {isGenerating ? <><span className="ob-spinner" /> Generando…</> : <><Zap size={13} /> Generar con IA</>}
            </button>
          </div>
          <textarea rows={5} placeholder="Escribe una descripción o pulsa 'Generar con IA'…" value={data.description} onChange={e => update('description', e.target.value)} />
        </div>
        <div className="ob-field ob-full">
          <div className="ob-label-row">
            <label>Servicios / Productos</label>
            <button className="ob-add-btn" onClick={addService}><Plus size={13} /> Añadir</button>
          </div>
          <div className="ob-services-list">
            {data.services.map((s, i) => (
              <div key={s.id} className="ob-service-item">
                <div className="ob-service-num">{i + 1}</div>
                <div className="ob-service-fields">
                  <input type="text" placeholder="Nombre del servicio *" value={s.name} onChange={e => updateService(s.id, 'name', e.target.value)} />
                  <input type="text" placeholder="Precio (ej: 50€, Desde 30€…)" value={s.price} onChange={e => updateService(s.id, 'price', e.target.value)} />
                  <input type="text" placeholder="Descripción breve (opcional)" value={s.description} onChange={e => updateService(s.id, 'description', e.target.value)} className="ob-span2" />
                </div>
                {data.services.length > 1 && (
                  <button className="ob-remove-service" onClick={() => removeService(s.id)}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── PASO 4 ─────────────────────────────────────────── */
function Step4({ data, selectTemplate, setFullPreview, TEMPLATES }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head"><h2 className="ob-step-title">Elige tu plantilla</h2><p className="ob-step-desc">Selecciona el diseño que mejor represente a tu negocio.</p></div>
      <div className="ob-templates-grid">
        {Object.entries(TEMPLATES).map(([id, { config, emoji }]) => (
          <div key={id} className={`ob-tpl-card ${data.selectedTemplate === id ? 'selected' : ''}`} onClick={() => selectTemplate(id)}>
            <div className="ob-tpl-thumb" style={{ background: `linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%)` }}>
              <span className="ob-tpl-emoji">{emoji}</span>
              {data.selectedTemplate === id && <div className="ob-tpl-check"><Check size={13} /></div>}
              <button className="ob-tpl-preview" onClick={e => { e.stopPropagation(); setFullPreview(id); }}>
                <Eye size={13} /> Preview
              </button>
            </div>
            <div className="ob-tpl-info">
              <div className="ob-tpl-name">{config.name}</div>
              <div className="ob-tpl-desc">{config.description}</div>
            </div>
            <button className={`ob-tpl-select ${data.selectedTemplate === id ? 'active' : ''}`} onClick={() => selectTemplate(id)}>
              {data.selectedTemplate === id ? <><Check size={12} /> Seleccionada</> : 'Usar esta'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

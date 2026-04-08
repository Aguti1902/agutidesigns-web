import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle, ChevronRight, ChevronLeft, Upload,
  Globe, Users, Palette, FileText, Share2, MessageSquare, Send,
} from 'lucide-react';
import './Cliente.css';

const STEPS = [
  { id: 'empresa',     label: 'Tu empresa',      icon: <Globe size={16} /> },
  { id: 'audiencia',   label: 'Público',          icon: <Users size={16} /> },
  { id: 'marca',       label: 'Marca & estilo',   icon: <Palette size={16} /> },
  { id: 'contenido',   label: 'Contenido',        icon: <FileText size={16} /> },
  { id: 'referencias', label: 'Referencias',       icon: <Globe size={16} /> },
  { id: 'social',      label: 'Redes sociales',   icon: <Share2 size={16} /> },
  { id: 'extra',       label: 'Notas finales',    icon: <MessageSquare size={16} /> },
];

const INITIAL = {
  company_name: '', company_description: '', sector: '', founded_year: '',
  target_audience: '', customer_pain: '',
  brand_colors: '', typography: '', tone: '', logo_url: '',
  pages_content: '', key_messages: '',
  reference_sites: '', style_likes: '', style_dislikes: '',
  social_links: '', phone: '', address: '',
  competitors: '', additional_notes: '',
};

export default function ClienteBriefing() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const quoteId = params.get('quote');

  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(INITIAL);
  const [quote, setQuote]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingId, setExistingId] = useState(null);

  useEffect(() => {
    if (quoteId) {
      supabase.from('quotes').select('*').eq('id', quoteId).single()
        .then(({ data }) => setQuote(data));
      supabase.from('briefings').select('*').eq('quote_id', quoteId).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setForm(prev => ({ ...prev, ...data }));
            setExistingId(data.id);
            if (data.status === 'submitted') setSubmitted(true);
          }
        });
    }
  }, [quoteId]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (finalSubmit = false) => {
    setSaving(true);
    const payload = {
      ...form,
      quote_id: quoteId,
      user_id: user?.id,
      status: finalSubmit ? 'submitted' : 'draft',
    };
    if (existingId) {
      await supabase.from('briefings').update(payload).eq('id', existingId);
    } else {
      const { data } = await supabase.from('briefings').insert(payload).select().single();
      if (data) setExistingId(data.id);
    }
    if (finalSubmit) {
      await supabase.from('quotes').update({ status: 'in_progress' }).eq('id', quoteId);
      setSubmitted(true);
    }
    setSaving(false);
  };

  const next = async () => {
    await handleSave(false);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <div className="cli-submitted">
        <div className="cli-submitted__card">
          <CheckCircle size={56} className="cli-submitted__icon" />
          <h2>¡Briefing enviado! 🎉</h2>
          <p>He recibido toda la información de tu proyecto. En menos de 24h me pongo en contacto contigo para comenzar. ¡Esto va a quedar increíble!</p>
          <p className="cli-submitted__sign">— Guti, Agutidesigns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cli-layout">
      {/* Header */}
      <header className="cli-header">
        <img src="/images/logoazul.png" alt="Agutidesigns" className="cli-header__logo" />
        {quote && (
          <div className="cli-header__quote">
            <span>Tu proyecto · {quote.web_type}</span>
            <strong>{(quote.total || 0).toLocaleString('es-ES')}€</strong>
          </div>
        )}
      </header>

      <div className="cli-body">
        {/* Progress */}
        <div className="cli-progress">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`cli-progress__step ${i === step ? 'cli-progress__step--active' : ''} ${i < step ? 'cli-progress__step--done' : ''}`}
            >
              <div className="cli-progress__dot">
                {i < step ? <CheckCircle size={14} /> : s.icon}
              </div>
              <span className="cli-progress__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="cli-card">
          {step === 0 && (
            <StepSection title="Cuéntame sobre tu empresa" sub="Esta información me ayuda a entender bien tu negocio.">
              <Field label="Nombre de la empresa *" value={form.company_name} onChange={v => update('company_name', v)} placeholder="Ej. Hello Nails Barcelona" />
              <Field label="¿A qué se dedica tu empresa?" value={form.company_description} onChange={v => update('company_description', v)} multiline placeholder="Describe brevemente qué hace tu empresa, qué ofrece y qué la hace diferente..." />
              <Field label="Sector / industria" value={form.sector} onChange={v => update('sector', v)} placeholder="Ej. Estética, Hostelería, Consultoría..." />
              <Field label="Año de fundación" value={form.founded_year} onChange={v => update('founded_year', v)} placeholder="Ej. 2019" />
            </StepSection>
          )}

          {step === 1 && (
            <StepSection title="¿A quién va dirigida tu web?" sub="Cuanto más específico seas, mejor podré enfocar el diseño.">
              <Field label="¿Quién es tu cliente ideal?" value={form.target_audience} onChange={v => update('target_audience', v)} multiline placeholder="Ej. Mujeres de 25-45 años, profesionales, que buscan tratamientos de estética premium en Barcelona..." />
              <Field label="¿Qué problema les resuelves?" value={form.customer_pain} onChange={v => update('customer_pain', v)} multiline placeholder="Ej. Necesitan un centro de confianza cerca de casa, con reservas online y atención personalizada..." />
            </StepSection>
          )}

          {step === 2 && (
            <StepSection title="Identidad de marca" sub="Así podré respetar tu imagen o ayudarte a definirla.">
              <Field label="Colores corporativos" value={form.brand_colors} onChange={v => update('brand_colors', v)} placeholder="Ej. Azul marino #1A2E5A, dorado #C9A84C, blanco" />
              <Field label="¿Tienes tipografía definida?" value={form.typography} onChange={v => update('typography', v)} placeholder="Ej. Usamos Playfair Display para títulos y Inter para cuerpo" />
              <Field label="Tono de comunicación" value={form.tone} onChange={v => update('tone', v)} placeholder="Ej. Cercano y profesional, sin demasiada formalidad" />
              <Field label="¿Tienes logo? (pega un enlace o Dropbox/Drive)" value={form.logo_url} onChange={v => update('logo_url', v)} placeholder="https://drive.google.com/..." />
            </StepSection>
          )}

          {step === 3 && (
            <StepSection title="Contenido de tu web" sub="Dime qué páginas quieres y qué debe decir cada una.">
              <Field label="¿Qué páginas quieres en tu web?" value={form.pages_content} onChange={v => update('pages_content', v)} multiline rows={5} placeholder="Ej. Inicio: presentación de la empresa + servicios destacados. Servicios: lista detallada de tratamientos. Sobre nosotros: historia del equipo. Contacto: formulario + mapa." />
              <Field label="Mensajes clave que quieres transmitir" value={form.key_messages} onChange={v => update('key_messages', v)} multiline placeholder="Ej. Somos el único centro certificado en Barcelona. Reservas en menos de 1 minuto. Resultados garantizados." />
            </StepSection>
          )}

          {step === 4 && (
            <StepSection title="Referencias y estilo" sub="Muéstrame webs que te gusten para orientarme mejor.">
              <Field label="Webs que te gustan (pon los links)" value={form.reference_sites} onChange={v => update('reference_sites', v)} multiline placeholder="Ej. https://vercel.com — me gusta su limpieza&#10;https://stripe.com — me encanta la jerarquía visual" />
              <Field label="¿Qué aspectos visuales te gustan de esas webs?" value={form.style_likes} onChange={v => update('style_likes', v)} multiline placeholder="Ej. Fondos oscuros con letras blancas, animaciones sutiles, fotografías grandes..." />
              <Field label="¿Qué no quieres que haga tu web?" value={form.style_dislikes} onChange={v => update('style_dislikes', v)} multiline placeholder="Ej. No quiero que sea muy recargada, nada de colores chillones, sin música de fondo..." />
              <Field label="Competidores (webs de tu competencia)" value={form.competitors} onChange={v => update('competitors', v)} placeholder="Ej. https://competidor.com, https://otro.com" />
            </StepSection>
          )}

          {step === 5 && (
            <StepSection title="Redes sociales y contacto" sub="Para enlazarlas en tu web y saber cómo contactarte.">
              <Field label="Instagram" value={form.social_links} onChange={v => update('social_links', v)} placeholder="@tunegocio" />
              <Field label="Teléfono de contacto" value={form.phone} onChange={v => update('phone', v)} placeholder="+34 600 000 000" />
              <Field label="Dirección física (si la hay)" value={form.address} onChange={v => update('address', v)} placeholder="Calle Mayor 10, Barcelona" />
            </StepSection>
          )}

          {step === 6 && (
            <StepSection title="¿Algo más que deba saber?" sub="Cualquier detalle adicional que creas importante.">
              <Field label="Notas adicionales" value={form.additional_notes} onChange={v => update('additional_notes', v)} multiline rows={6} placeholder="Cualquier cosa que no hayas podido contar antes: plazos concretos, eventos especiales, requisitos técnicos, integraciones necesarias..." />
            </StepSection>
          )}

          {/* Navigation */}
          <div className="cli-nav">
            {step > 0 && (
              <button className="cli-btn cli-btn--ghost" onClick={back}>
                <ChevronLeft size={16} /> Anterior
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="cli-btn cli-btn--primary" onClick={next} disabled={saving}>
                {saving ? 'Guardando...' : 'Siguiente'} <ChevronRight size={16} />
              </button>
            ) : (
              <button className="cli-btn cli-btn--primary" onClick={() => handleSave(true)} disabled={saving}>
                <Send size={16} /> {saving ? 'Enviando...' : 'Enviar briefing'}
              </button>
            )}
          </div>
        </div>

        <p className="cli-autosave">💾 Se guarda automáticamente al avanzar</p>
      </div>
    </div>
  );
}

function StepSection({ title, sub, children }) {
  return (
    <div className="cli-step">
      <h2 className="cli-step__title">{title}</h2>
      {sub && <p className="cli-step__sub">{sub}</p>}
      <div className="cli-step__fields">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  return (
    <div className="cli-field">
      <label className="cli-field__label">{label}</label>
      {multiline ? (
        <textarea
          className="cli-field__input cli-field__input--textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className="cli-field__input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Send, CheckCircle2, Clock, AlertCircle,
  Mail, Globe, FileText, Euro, Calendar, MessageSquare,
  ExternalLink,
} from 'lucide-react';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pendiente' },
  { value: 'sent',        label: 'Enviado' },
  { value: 'approved',    label: 'Aprobado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed',   label: 'Completado' },
  { value: 'rejected',    label: 'Rechazado' },
];

export default function AdminQuote() {
  const { id } = useParams();
  const { isAdmin, signInClientMagicLink } = useAuth();
  const navigate = useNavigate();
  const [quote, setQuote]     = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('');
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    fetchData();
  }, [isAdmin, id]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: q }, { data: b }] = await Promise.all([
      supabase.from('quotes').select('*').eq('id', id).single(),
      supabase.from('briefings').select('*').eq('quote_id', id).maybeSingle(),
    ]);
    setQuote(q);
    setBriefing(b);
    setStatus(q?.status || 'pending');
    setNotes(q?.admin_notes || '');
    setLoading(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    await supabase.from('quotes').update({ status, admin_notes: notes }).eq('id', id);
    setSaving(false);
  };

  const sendClientLink = async () => {
    if (!quote?.email) return;
    await signInClientMagicLink(quote.email, id);
    await supabase.from('quotes').update({ status: 'sent' }).eq('id', id);
    setStatus('sent');
    setLinkSent(true);
  };

  if (loading) return <div className="adm-loading adm-loading--full"><Clock size={28} /> Cargando...</div>;
  if (!quote) return <div className="adm-empty">Presupuesto no encontrado</div>;

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <img src="/images/logoazul.png" alt="Agutidesigns" className="adm-sidebar__logo" />
        <nav className="adm-sidebar__nav">
          <button className="adm-sidebar__item" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} /> Volver al dashboard
          </button>
        </nav>
      </aside>

      <main className="adm-main">
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">{quote.name || 'Sin nombre'}</h1>
            <p className="adm-header__sub">{quote.email} · {new Date(quote.created_at).toLocaleDateString('es-ES')}</p>
          </div>
          <div className="adm-header__actions">
            {!linkSent ? (
              <button className="adm-btn adm-btn--primary" onClick={sendClientLink}>
                <Send size={15} /> Enviar link de briefing al cliente
              </button>
            ) : (
              <span className="adm-badge-success"><CheckCircle2 size={14} /> Link enviado</span>
            )}
          </div>
        </div>

        <div className="adm-quote-grid">
          {/* Left col */}
          <div className="adm-quote-grid__main">
            {/* Precio */}
            <div className="adm-card">
              <h3 className="adm-card__title">Presupuesto</h3>
              <div className="adm-price-big">{(quote.total || 0).toLocaleString('es-ES')}€</div>
              {quote.monthly > 0 && (
                <p className="adm-price-monthly">+ {quote.monthly}€/mes mantenimiento</p>
              )}
              <div className="adm-breakdown">
                {(quote.breakdown || []).map((item, i) => (
                  <div className="adm-breakdown__row" key={i}>
                    <span>{item.label}</span>
                    <span>{item.price >= 0 ? '+' : ''}{item.price}€</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos del proyecto */}
            <div className="adm-card">
              <h3 className="adm-card__title">Datos del proyecto</h3>
              <div className="adm-info-grid">
                <div className="adm-info-item"><Globe size={14} /><span>Tipo de web</span><strong>{quote.web_type || '—'}</strong></div>
                <div className="adm-info-item"><FileText size={14} /><span>Páginas</span><strong>{quote.pages || '—'}</strong></div>
                <div className="adm-info-item"><Calendar size={14} /><span>Plazo</span><strong>{quote.timeline || '—'}</strong></div>
                {quote.ai_features?.length > 0 && (
                  <div className="adm-info-item adm-info-item--full">
                    <span>Funcionalidades IA</span>
                    <strong>{quote.ai_features.join(', ')}</strong>
                  </div>
                )}
                {quote.extra_features?.length > 0 && (
                  <div className="adm-info-item adm-info-item--full">
                    <span>Extras</span>
                    <strong>{quote.extra_features.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Briefing del cliente */}
            {briefing ? (
              <div className="adm-card adm-card--briefing">
                <h3 className="adm-card__title">
                  <CheckCircle2 size={16} className="adm-card__title-icon adm-card__title-icon--green" />
                  Briefing recibido
                  <span className="adm-card__title-badge">
                    {briefing.status === 'submitted' ? 'Enviado' : 'Borrador'}
                  </span>
                </h3>
                <div className="adm-briefing-view">

                  <BriefingSection title="🏢 Empresa">
                    <BV label="Nombre"             value={briefing.company_name} />
                    <BV label="Descripción"        value={briefing.company_description} />
                    <BV label="Sector"             value={briefing.sector} />
                    <BV label="Año fundación"      value={briefing.founded_year} />
                    <BV label="Tamaño del equipo"  value={briefing.team_size} />
                    <BV label="Logo (link)"        value={briefing.logo_url} isLink />
                  </BriefingSection>

                  <BriefingSection title="🎯 Público y propuesta de valor">
                    <BV label="Público objetivo"   value={briefing.target_audience} />
                    <BV label="Problema que resuelve" value={briefing.customer_pain} />
                    <BV label="Propuesta de valor" value={briefing.unique_value} />
                    <BV label="CTA principal"      value={briefing.main_cta} />
                  </BriefingSection>

                  <BriefingSection title="⚙️ Servicios y contenido">
                    <BV label="Servicios"          value={briefing.services_list} />
                    <BV label="Equipo a mostrar"   value={briefing.team_members} />
                    <BV label="Premios / hitos"    value={briefing.awards} />
                    <BV label="Proyectos portfolio" value={briefing.projects_list} />
                    <BV label="Categorías trabajo" value={briefing.project_categories} />
                    <BV label="Proceso de trabajo" value={briefing.process_info} />
                    <BV label="Páginas y contenido" value={briefing.pages_content} />
                    <BV label="Mensajes clave"     value={briefing.key_messages} />
                    <BV label="Testimonios"        value={briefing.testimonials} />
                  </BriefingSection>

                  <BriefingSection title="🛒 Tienda (si aplica)">
                    <BV label="Categorías productos" value={briefing.product_categories} />
                    <BV label="Rango de precios"   value={briefing.price_range} />
                    <BV label="Variaciones"        value={briefing.product_variations} />
                    <BV label="Gestión de stock"   value={briefing.stock_info} />
                    <BV label="Política de envíos" value={briefing.shipping_info} />
                    <BV label="Devoluciones"       value={briefing.return_policy} />
                    <BV label="Métodos de pago"    value={briefing.payment_methods} />
                    <BV label="Pasarela de pago"   value={briefing.payment_gateway} />
                  </BriefingSection>

                  <BriefingSection title="💻 App/SaaS (si aplica)">
                    <BV label="Funcionalidades"    value={briefing.features_list} />
                    <BV label="Modelo de precios"  value={briefing.pricing_model} />
                    <BV label="Integraciones"      value={briefing.integrations} />
                    <BV label="Tech stack"         value={briefing.tech_stack} />
                    <BV label="Extras técnicos"    value={briefing.extra_features} />
                  </BriefingSection>

                  <BriefingSection title="🎨 Marca y estilo">
                    <BV label="Colores"            value={briefing.brand_colors} />
                    <BV label="Tipografía"         value={briefing.typography} />
                    <BV label="Tono de comunicación" value={briefing.tone} />
                  </BriefingSection>

                  <BriefingSection title="🔗 Referencias">
                    <BV label="Webs de referencia" value={briefing.reference_sites} />
                    <BV label="Qué le gusta"       value={briefing.style_likes} />
                    <BV label="Qué NO quiere"      value={briefing.style_dislikes} />
                    <BV label="Competidores"       value={briefing.competitors} />
                  </BriefingSection>

                  <BriefingSection title="📱 Contacto y redes">
                    <BV label="Teléfono"           value={briefing.phone} />
                    <BV label="Dirección"          value={briefing.address} />
                    <BV label="Redes sociales"     value={briefing.social_links} />
                  </BriefingSection>

                  {briefing.additional_notes && (
                    <BriefingSection title="📝 Notas adicionales">
                      <BV label="Notas" value={briefing.additional_notes} />
                    </BriefingSection>
                  )}

                  {/* Galería de imágenes */}
                  {briefing.image_urls?.length > 0 && (
                    <BriefingSection title={`📸 Imágenes del cliente (${briefing.image_urls.length})`}>
                      <div className="adm-image-gallery">
                        {briefing.image_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="adm-image-thumb">
                            <img src={url} alt={`Imagen ${i + 1}`} />
                          </a>
                        ))}
                      </div>
                    </BriefingSection>
                  )}
                </div>
              </div>
            ) : (
              <div className="adm-card adm-card--pending-briefing">
                <AlertCircle size={20} />
                <p>El cliente aún no ha rellenado el briefing.</p>
                {!linkSent && (
                  <button className="adm-btn adm-btn--primary" onClick={sendClientLink}>
                    <Send size={14} /> Enviar link de briefing
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right col */}
          <div className="adm-quote-grid__side">
            {/* Estado */}
            <div className="adm-card">
              <h3 className="adm-card__title">Estado del proyecto</h3>
              <select
                className="adm-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Notas internas */}
            <div className="adm-card">
              <h3 className="adm-card__title"><MessageSquare size={15} /> Notas internas</h3>
              <textarea
                className="adm-textarea"
                placeholder="Notas privadas sobre este cliente..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={6}
              />
            </div>

            {/* Contacto */}
            <div className="adm-card">
              <h3 className="adm-card__title"><Mail size={15} /> Contacto</h3>
              <div className="adm-contact">
                <a href={`mailto:${quote.email}`} className="adm-contact__link">
                  <Mail size={14} /> {quote.email}
                </a>
                {quote.phone && (
                  <a href={`https://wa.me/${quote.phone}`} target="_blank" rel="noopener noreferrer" className="adm-contact__link adm-contact__link--wa">
                    <ExternalLink size={14} /> {quote.phone} (WhatsApp)
                  </a>
                )}
              </div>
            </div>

            <button className="adm-btn adm-btn--primary adm-btn--full" onClick={saveChanges} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Helpers de briefing ── */
function BriefingSection({ title, children }) {
  // Solo renderiza si algún hijo tiene valor
  const hasContent = Array.isArray(children)
    ? children.some(c => c?.props?.value)
    : children?.props?.value;

  if (!hasContent && !children?.props?.children) return null;

  return (
    <div className="adm-briefing-section">
      <h4 className="adm-briefing-section__title">{title}</h4>
      <div className="adm-briefing-section__body">{children}</div>
    </div>
  );
}

function BV({ label, value, isLink }) {
  if (!value) return null;
  return (
    <div className="adm-bv-item">
      <span>{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="adm-bv-link">
          {value}
        </a>
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
}

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
                </h3>
                <div className="adm-briefing-view">
                  {briefing.company_name && <div className="adm-bv-item"><span>Empresa</span><strong>{briefing.company_name}</strong></div>}
                  {briefing.company_description && <div className="adm-bv-item"><span>Descripción</span><p>{briefing.company_description}</p></div>}
                  {briefing.target_audience && <div className="adm-bv-item"><span>Público objetivo</span><p>{briefing.target_audience}</p></div>}
                  {briefing.brand_colors && <div className="adm-bv-item"><span>Colores de marca</span><p>{briefing.brand_colors}</p></div>}
                  {briefing.typography && <div className="adm-bv-item"><span>Tipografía</span><p>{briefing.typography}</p></div>}
                  {briefing.competitors && <div className="adm-bv-item"><span>Competidores</span><p>{briefing.competitors}</p></div>}
                  {briefing.reference_sites && <div className="adm-bv-item"><span>Webs de referencia</span><p>{briefing.reference_sites}</p></div>}
                  {briefing.social_links && <div className="adm-bv-item"><span>Redes sociales</span><p>{briefing.social_links}</p></div>}
                  {briefing.pages_content && <div className="adm-bv-item"><span>Contenido de páginas</span><p>{briefing.pages_content}</p></div>}
                  {briefing.additional_notes && <div className="adm-bv-item"><span>Notas adicionales</span><p>{briefing.additional_notes}</p></div>}
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

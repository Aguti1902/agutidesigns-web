import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, AlertCircle, RefreshCw,
  Mail, Globe, FileText, Euro, MessageSquare, Phone,
  LayoutDashboard, Calculator, Users, LogOut, Zap, Package,
  ExternalLink,
} from 'lucide-react';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pendiente',    color: '#F59E0B' },
  { value: 'sent',        label: 'Enviado',       color: '#3B82F6' },
  { value: 'approved',    label: 'Aprobado',      color: '#10B981' },
  { value: 'in_progress', label: 'En progreso',   color: '#8B5CF6' },
  { value: 'completed',   label: 'Completado',    color: '#059669' },
  { value: 'rejected',    label: 'Rechazado',     color: '#EF4444' },
];
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

const WEB_LABELS   = { landing: 'Landing page', corporativa: 'Web corporativa', ecommerce: 'Tienda online', portfolio: 'Portfolio' };
const TIME_LABELS  = { urgente: 'Urgente (1 semana)', normal: 'Estándar (2-3 sem.)', flexible: 'Flexible (1 mes)', 'sin-prisa': 'Sin prisa' };
const PAGES_LABELS = { '1': '1 página', '1-3': '1 – 3 páginas', '3-5': '3 – 5 páginas', '5-10': '5 – 10 páginas', '+10': 'Más de 10' };

function Sidebar() {
  const navigate = useNavigate();
  const handleSignOut = () => { localStorage.removeItem('adminSession'); navigate('/admin'); };
  const nav = [
    { id: 'dashboard',    label: 'Dashboard',      icon: <LayoutDashboard size={16} />, path: '/admin/dashboard' },
    { id: 'presupuestos', label: 'Presupuestos',    icon: <Calculator size={16} />,      path: '/admin/presupuestos' },
    { id: 'leads',        label: 'Leads clínicas',  icon: <Users size={16} />,           path: '/admin/leads' },
  ];
  return (
    <aside className="adm-sidebar">
      <img src="/images/logoazul.png" alt="Agutidesigns" className="adm-sidebar__logo" />
      <nav className="adm-sidebar__section">
        <span className="adm-sidebar__label">Menú</span>
        {nav.map(item => (
          <button key={item.id} className="adm-sidebar__item" onClick={() => navigate(item.path)}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="adm-sidebar__footer">
        <span className="adm-sidebar__email">agutierrezgomez00@gmail.com</span>
        <button className="adm-sidebar__logout" onClick={handleSignOut}><LogOut size={14} /> Cerrar sesión</button>
      </div>
    </aside>
  );
}


function BV({ label, value, isLink }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      {isLink
        ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: '#0047FF', wordBreak: 'break-all' }}>{value}</a>
        : <p style={{ margin: 0, fontSize: 13.5, color: '#111827', lineHeight: 1.5 }}>{value}</p>}
    </div>
  );
}

export default function AdminQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState('');
  const [notes, setNotes]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult]   = useState(null); // 'ok' | 'error'

  useEffect(() => {
    if (!localStorage.getItem('adminSession')) { navigate('/admin'); return; }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const { data: q } = await supabase.from('quotes').select('*').eq('id', id).single();
    setQuote(q);
    setStatus(q?.status || 'pending');
    setNotes(q?.admin_notes || '');
    setLoading(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    await supabase.from('quotes').update({ status, admin_notes: notes }).eq('id', id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openCalendly = () => {
    window.open('https://calendly.com/agutidesigns/reunion', '_blank');
  };

  const resendEmail = async () => {
    if (!quote?.email) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      quote.name,
          email:     quote.email,
          webType:   quote.web_type,
          pages:     quote.pages,
          timeline:  quote.timeline,
          total:     quote.total,
          monthly:   quote.monthly,
          breakdown: quote.breakdown,
        }),
      });
      setEmailResult(res.ok ? 'ok' : 'error');
      if (res.ok) {
        await supabase.from('quotes').update({ status: 'sent' }).eq('id', id);
        setStatus('sent');
      }
    } catch {
      setEmailResult('error');
    }
    setEmailSending(false);
    setTimeout(() => setEmailResult(null), 5000);
  };

  if (loading) return (
    <div className="adm-layout">
      <Sidebar />
      <main className="adm-main"><div className="adm-loading"><RefreshCw size={22} className="adm-loading__icon" /> Cargando presupuesto...</div></main>
    </div>
  );

  if (!quote) return (
    <div className="adm-layout">
      <Sidebar />
      <main className="adm-main"><div className="adm-empty"><AlertCircle size={36} /><p>Presupuesto no encontrado</p></div></main>
    </div>
  );

  const statusConf = STATUS_MAP[status] || STATUS_OPTIONS[0];
  const breakdown  = Array.isArray(quote.breakdown) ? quote.breakdown : [];
  const waMsg      = encodeURIComponent(`Hola ${quote.name}, te contacto de Agutidesigns sobre tu presupuesto de ${quote.total?.toLocaleString('es-ES')}€.`);
  const initials   = (quote.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="adm-layout">
      <Sidebar />

      <main className="adm-main">
        {/* Back */}
        <button
          className="adm-btn adm-btn--ghost adm-btn--sm"
          style={{ marginBottom: 20 }}
          onClick={() => navigate('/admin/presupuestos')}
        >
          <ArrowLeft size={14} /> Volver a presupuestos
        </button>

        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(135deg, #0047FF 0%, #1a6bff 100%)',
          borderRadius: 16, padding: '28px 32px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {quote.name || 'Sin nombre'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{quote.email}</span>
                <span style={{ color: 'rgba(255,255,255,.4)' }}>·</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                  {new Date(quote.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {quote.phone && (
              <a
                href={`https://wa.me/34${quote.phone.replace(/\D/g,'')}?text=${waMsg}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#25D366', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}
              >
                💬 WhatsApp
              </a>
            )}
            <button
              onClick={resendEmail}
              disabled={emailSending}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                background: emailResult === 'ok' ? 'rgba(16,185,129,.25)' : emailResult === 'error' ? 'rgba(239,68,68,.25)' : 'rgba(255,255,255,.15)',
                border: `1.5px solid ${emailResult === 'ok' ? 'rgba(16,185,129,.5)' : emailResult === 'error' ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.35)'}`,
                color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 13.5, cursor: emailSending ? 'default' : 'pointer', opacity: emailSending ? 0.7 : 1,
              }}
            >
              <Mail size={14} />
              {emailSending ? 'Enviando...' : emailResult === 'ok' ? '✓ Email enviado' : emailResult === 'error' ? '✗ Error al enviar' : 'Reenviar email'}
            </button>
            <button
              onClick={openCalendly}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
            >
              <Calendar size={14} /> Reservar reunión
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Precio + desglose */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title"><Euro size={15} /> Presupuesto</span>
                <span className="adm-badge" style={{ '--badge-color': statusConf.color }}>
                  {statusConf.label}
                </span>
              </div>
              <div className="adm-card-body">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Total proyecto</div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: '#0047FF', lineHeight: 1 }}>
                      {(quote.total || 0).toLocaleString('es-ES')}€
                    </div>
                  </div>
                  {quote.monthly > 0 && (
                    <div style={{ paddingBottom: 6 }}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Mantenimiento</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#6B7280' }}>+{quote.monthly}€<span style={{ fontSize: 13 }}>/mes</span></div>
                    </div>
                  )}
                </div>

                {breakdown.length > 0 && (
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Desglose</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {breakdown.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 0', borderBottom: i < breakdown.length - 1 ? '1px solid #F9FAFB' : 'none',
                        }}>
                          <span style={{ fontSize: 13.5, color: '#374151' }}>{item.label}</span>
                          <span style={{
                            fontSize: 14, fontWeight: 700,
                            color: item.price < 0 ? '#10B981' : item.price === 0 ? '#9CA3AF' : '#111827',
                          }}>
                            {item.price >= 0 ? '+' : ''}{(item.price || 0).toLocaleString('es-ES')}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Datos del proyecto */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title"><Package size={15} /> Datos del proyecto</span>
              </div>
              <div className="adm-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Globe size={12} /> Tipo de web
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>
                      {WEB_LABELS[quote.web_type] || quote.web_type || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FileText size={12} /> Páginas
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>
                      {PAGES_LABELS[quote.pages] || quote.pages || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} /> Plazo
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>
                      {TIME_LABELS[quote.timeline] || quote.timeline || '—'}
                    </div>
                  </div>
                </div>

                {(quote.ai_features?.length > 0 || quote.extra_features?.length > 0) && (
                  <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 16, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quote.ai_features?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Zap size={12} /> Funcionalidades IA
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {quote.ai_features.map(f => (
                            <span key={f} className="adm-badge" style={{ '--badge-color': '#8B5CF6' }}>{f}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {quote.extra_features?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Extras</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {quote.extra_features.map(f => (
                            <span key={f} className="adm-badge" style={{ '--badge-color': '#0047FF' }}>{f}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title">🚀 Próximos pasos</span>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                  El cliente ya ha recibido su presupuesto por email con las opciones de contacto. Puedes programar una llamada o escribirle directamente.
                </p>
                <a
                  href="https://calendly.com/agutidesigns/reunion"
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, color: '#1D4ED8', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                >
                  <Calendar size={14} /> Ver disponibilidad en Calendly
                </a>
              </div>
            </div>
          </div>

          {/* Right col — Gestión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Contacto rápido */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title"><Mail size={14} /> Contacto</span>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={`mailto:${quote.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F8F9FC', borderRadius: 8, color: '#0047FF', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                  <Mail size={14} /> {quote.email}
                </a>
                {quote.phone && (
                  <a href={`https://wa.me/34${quote.phone.replace(/\D/g,'')}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F0FDF4', borderRadius: 8, color: '#16A34A', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
                    <Phone size={14} /> {quote.phone}
                    <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                  </a>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title">Estado</span>
              </div>
              <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                      borderRadius: 8, border: status === s.value ? `2px solid ${s.color}` : '1.5px solid #E5E7EB',
                      background: status === s.value ? `color-mix(in srgb, ${s.color} 8%, white)` : '#fff',
                      cursor: 'pointer', fontWeight: status === s.value ? 700 : 500,
                      color: status === s.value ? s.color : '#6B7280', fontSize: 13, transition: 'all 0.12s',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    {s.label}
                    {status === s.value && <CheckCircle2 size={13} style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="adm-card">
              <div className="adm-card__head">
                <span className="adm-card__title"><MessageSquare size={14} /> Notas internas</span>
              </div>
              <div className="adm-card-body">
                <textarea
                  className="adm-textarea"
                  placeholder="Notas privadas sobre este cliente..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <button className="adm-btn adm-btn--primary adm-btn--full" onClick={saveChanges} disabled={saving}>
              {saving ? <><RefreshCw size={14} className="adm-loading__icon" /> Guardando...</>
               : saved  ? <><CheckCircle2 size={14} /> Guardado</>
               : 'Guardar cambios'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

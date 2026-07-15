import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Calculator, Users, LogOut, RefreshCw,
  Search, X, Mail, Phone, Globe, ChevronRight, CheckCircle2,
  AlertTriangle, Euro, Clock,
} from 'lucide-react';
import './Admin.css';

const STATUS_COLORS = {
  pending:     '#F59E0B',
  sent:        '#3B82F6',
  approved:    '#10B981',
  in_progress: '#8B5CF6',
  completed:   '#059669',
  rejected:    '#EF4444',
};
const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pendiente' },
  { value: 'sent',        label: 'Enviado' },
  { value: 'approved',    label: 'Aprobado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed',   label: 'Completado' },
  { value: 'rejected',    label: 'Rechazado' },
];

const WEB_LABELS = { landing: 'Landing page', corporativa: 'Web corporativa', ecommerce: 'Tienda online', portfolio: 'Portfolio' };

function Sidebar({ active }) {
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
          <button key={item.id} className={`adm-sidebar__item ${active === item.id ? 'adm-sidebar__item--active' : ''}`} onClick={() => navigate(item.path)}>
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

function DetailPanel({ quote, onClose, onStatusChange }) {
  const [status, setStatus]   = useState(quote.status || 'pending');
  const [notes, setNotes]     = useState(quote.admin_notes || '');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('quotes').update({ status, admin_notes: notes }).eq('id', quote.id);
    setSaving(false);
    if (!error) { onStatusChange(quote.id, status, notes); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const breakdown = Array.isArray(quote.breakdown) ? quote.breakdown : [];
  const waMsg = encodeURIComponent(`Hola ${quote.name}, te contacto sobre tu presupuesto de Agutidesigns (${quote.total?.toLocaleString('es-ES')}€).`);

  return (
    <div className="adm-panel">
      <div className="adm-panel__header">
        <button className="adm-panel__close" onClick={onClose}><X size={16} /></button>
        <div className="adm-panel__avatar">{(quote.name || '?')[0].toUpperCase()}</div>
        <div>
          <p className="adm-panel__name">{quote.name || '—'}</p>
          <p className="adm-panel__sub">
            <span className="adm-badge" style={{ '--badge-color': STATUS_COLORS[quote.status] || '#9CA3AF' }}>
              {STATUS_OPTIONS.find(s => s.value === quote.status)?.label || quote.status}
            </span>
          </p>
        </div>
      </div>

      <div className="adm-panel__body">
        {/* Precio */}
        <div className="adm-section">
          <span className="adm-section__title">Presupuesto</span>
          <div className="adm-price-big">{(quote.total || 0).toLocaleString('es-ES')}€</div>
          {quote.monthly > 0 && <div className="adm-price-sub">+ {quote.monthly.toLocaleString('es-ES')}€/mes mantenimiento</div>}
        </div>

        {/* Desglose */}
        {breakdown.length > 0 && (
          <div className="adm-section">
            <span className="adm-section__title">Desglose</span>
            <div className="adm-breakdown">
              {breakdown.map((b, i) => (
                <div key={i} className="adm-breakdown__row">
                  <span>{b.label}</span>
                  <span>{b.price >= 0 ? '+' : ''}{(b.price || 0).toLocaleString('es-ES')}€</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="adm-section__divider" />

        {/* Info proyecto */}
        <div className="adm-section">
          <span className="adm-section__title">Proyecto</span>
          <div className="adm-info-row"><Globe size={13} /> {WEB_LABELS[quote.web_type] || quote.web_type || '—'}</div>
          <div className="adm-info-row"><span style={{ color: '#9CA3AF', fontSize: 12 }}>Páginas:</span> {quote.pages}</div>
          <div className="adm-info-row"><Clock size={13} /> {quote.timeline}</div>
          {quote.ai_features?.length > 0 && <div className="adm-info-row" style={{ flexWrap: 'wrap', gap: 4 }}>
            {quote.ai_features.map(f => <span key={f} className="adm-badge" style={{ '--badge-color': '#8B5CF6', fontSize: 10 }}>{f}</span>)}
          </div>}
        </div>

        {/* Contacto */}
        <div className="adm-section">
          <span className="adm-section__title">Contacto</span>
          {quote.email && <div className="adm-info-row"><Mail size={13} /><a href={`mailto:${quote.email}`}>{quote.email}</a></div>}
          {quote.phone && <div className="adm-info-row"><Phone size={13} /><a href={`tel:${quote.phone}`}>{quote.phone}</a></div>}
          <div className="adm-info-row" style={{ fontSize: 11, color: '#9CA3AF' }}><Clock size={12} /> {new Date(quote.created_at).toLocaleString('es-ES')}</div>
        </div>

        <div className="adm-section__divider" />

        {/* Gestión */}
        <div className="adm-section">
          <span className="adm-section__title">Estado</span>
          <select className="adm-select" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="adm-section">
          <span className="adm-section__title">Notas internas</span>
          <textarea className="adm-textarea" rows={3} placeholder="Notas sobre este presupuesto..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="adm-panel__footer">
        {quote.phone && (
          <a href={`https://wa.me/34${quote.phone.replace(/\D/g, '')}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--wa adm-btn--full">
            💬 WhatsApp
          </a>
        )}
        {quote.email && (
          <a href={`mailto:${quote.email}?subject=Tu presupuesto de Agutidesigns&body=Hola ${quote.name},`} className="adm-btn adm-btn--ghost adm-btn--full">
            <Mail size={14} /> Enviar email
          </a>
        )}
        <button className="adm-btn adm-btn--primary adm-btn--full" onClick={handleSave} disabled={saving}>
          {saving ? <><RefreshCw size={14} className="adm-loading__icon" /> Guardando...</>
           : saved  ? <><CheckCircle2 size={14} /> Guardado</>
           : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPresupuestos() {
  const navigate = useNavigate();
  const [quotes, setQuotes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dbError, setDbError]   = useState(false);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('adminSession')) { navigate('/admin'); return; }
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true); setDbError(false);
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (error) setDbError(true);
    setQuotes(data || []);
    setLoading(false);
  };

  const handleStatusChange = (id, status, notes) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status, admin_notes: notes } : q));
    setSelected(prev => prev?.id === id ? { ...prev, status, admin_notes: notes } : prev);
  };

  const filtered = quotes.filter(q => {
    const s = search.toLowerCase();
    const mQ = !s || q.name?.toLowerCase().includes(s) || q.email?.toLowerCase().includes(s);
    const mF = filter === 'all' || q.status === filter;
    return mQ && mF;
  });

  const stats = {
    total:     quotes.length,
    pending:   quotes.filter(q => q.status === 'pending').length,
    active:    quotes.filter(q => ['approved', 'in_progress'].includes(q.status)).length,
    pipeline:  quotes.filter(q => q.status !== 'rejected').reduce((s, q) => s + (q.total || 0), 0),
  };

  return (
    <div className="adm-layout">
      <Sidebar active="presupuestos" />
      <main className="adm-main" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">Presupuestos</h1>
            <p className="adm-header__sub">{stats.total} presupuestos · {stats.pending} pendientes · {stats.pipeline.toLocaleString('es-ES')}€ en pipeline</p>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={fetchQuotes} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'adm-loading__icon' : ''} /> Actualizar
          </button>
        </div>

        {dbError && (
          <div className="adm-alert adm-alert--warn">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Supabase no disponible. Reactiva el proyecto en supabase.com y ejecuta <code>scripts/migration-admin-rls.sql</code>.</span>
          </div>
        )}

        {/* Mini stats */}
        <div className="adm-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total',      value: stats.total,    icon: <Calculator size={15} />, cls: 'blue' },
            { label: 'Pendientes', value: stats.pending,  icon: <Clock size={15} />,      cls: 'amber' },
            { label: 'Activos',    value: stats.active,   icon: <CheckCircle2 size={15} />, cls: 'green' },
            { label: 'Pipeline',   value: `${stats.pipeline.toLocaleString('es-ES')}€`, icon: <Euro size={15} />, cls: 'purple' },
          ].map(s => (
            <div key={s.label} className="adm-stat">
              <div className="adm-stat__top">
                <span className="adm-stat__label">{s.label}</span>
                <div className={`adm-stat__icon adm-stat__icon--${s.cls}`}>{s.icon}</div>
              </div>
              <span className="adm-stat__value" style={{ fontSize: 24 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={14} />
            <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} className="adm-search__input" />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><X size={14} /></button>}
          </div>
          <div className="adm-tabs">
            {[{ v: 'all', l: 'Todos' }, ...STATUS_OPTIONS].map(s => (
              <button key={s.v || s.value} className={`adm-tab ${filter === (s.v || s.value) ? 'adm-tab--active' : ''}`} onClick={() => setFilter(s.v || s.value)}>
                {s.l || s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table + Panel */}
        <div style={{ display: 'flex', gap: 0, flex: 1 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className="adm-loading"><RefreshCw size={22} className="adm-loading__icon" /> Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="adm-empty"><Calculator size={36} /><p>{quotes.length === 0 ? 'Aún no hay presupuestos' : 'Sin resultados'}</p></div>
            ) : (
              <div className="adm-card adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Tipo de web</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(q => (
                      <tr key={q.id} className={selected?.id === q.id ? 'active' : ''} onClick={() => setSelected(selected?.id === q.id ? null : q)}>
                        <td>
                          <div className="adm-cell-person">
                            <div className="adm-avatar">{(q.name || '?')[0].toUpperCase()}</div>
                            <div>
                              <span className="adm-cell-name">{q.name || '—'}</span>
                              <span className="adm-cell-sub">{q.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="adm-cell-muted">{WEB_LABELS[q.web_type] || q.web_type || '—'}</td>
                        <td className="adm-cell-price">{q.total ? `${q.total.toLocaleString('es-ES')}€` : '—'}</td>
                        <td>
                          <span className="adm-badge" style={{ '--badge-color': STATUS_COLORS[q.status] || '#9CA3AF' }}>
                            {STATUS_OPTIONS.find(s => s.value === q.status)?.label || q.status}
                          </span>
                        </td>
                        <td className="adm-cell-muted">{new Date(q.created_at).toLocaleDateString('es-ES')}</td>
                        <td><ChevronRight size={15} style={{ color: '#9CA3AF' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <DetailPanel
              quote={selected}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

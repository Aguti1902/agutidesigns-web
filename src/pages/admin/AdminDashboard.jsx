import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Calculator, Users, LogOut, RefreshCw,
  TrendingUp, Euro, Clock, Star, ArrowRight, AlertTriangle,
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
const STATUS_LABELS = {
  pending: 'Pendiente', sent: 'Enviado', approved: 'Aprobado',
  in_progress: 'En progreso', completed: 'Completado', rejected: 'Rechazado',
};
const LEAD_STATUS_COLORS = { nuevo: '#9CA3AF', contactado: '#3B82F6', 'reunión': '#10B981', cerrado: '#059669', descartado: '#EF4444' };
const LEAD_STATUS_LABELS = { nuevo: 'Nuevo', contactado: 'Contactado', 'reunión': 'Reunión', cerrado: 'Cerrado', descartado: 'Descartado' };

function Sidebar({ active }) {
  const navigate = useNavigate();
  const handleSignOut = () => { localStorage.removeItem('adminSession'); navigate('/admin'); };
  const nav = [
    { id: 'dashboard',     label: 'Dashboard',       icon: <LayoutDashboard size={16} />, path: '/admin/dashboard' },
    { id: 'presupuestos',  label: 'Presupuestos',     icon: <Calculator size={16} />,      path: '/admin/presupuestos' },
    { id: 'leads',         label: 'Leads clínicas',   icon: <Users size={16} />,           path: '/admin/leads' },
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes]   = useState([]);
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminSession')) { navigate('/admin'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setDbError(false);
    const [qRes, lRes] = await Promise.all([
      supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('clinicas_leads').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (qRes.error || lRes.error) setDbError(true);
    setQuotes(qRes.data || []);
    setLeads(lRes.data || []);
    setLoading(false);
  };

  const today = new Date().toDateString();
  const stats = {
    totalQuotes: quotes.length,
    totalLeads:  leads.length,
    pipeline:    quotes.filter(q => q.status !== 'rejected').reduce((s, q) => s + (q.total || 0), 0),
    hoy:         quotes.filter(q => new Date(q.created_at).toDateString() === today).length
               + leads.filter(l => new Date(l.created_at).toDateString() === today).length,
    pendientes:  quotes.filter(q => q.status === 'pending').length,
    nuevosLeads: leads.filter(l => l.estado === 'nuevo').length,
  };

  const recentQuotes = quotes.slice(0, 6);
  const recentLeads  = leads.slice(0, 6);

  return (
    <div className="adm-layout">
      <Sidebar active="dashboard" />
      <main className="adm-main">
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">Dashboard</h1>
            <p className="adm-header__sub">Resumen de actividad — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'adm-loading__icon' : ''} /> Actualizar
          </button>
        </div>

        {dbError && (
          <div className="adm-alert adm-alert--warn">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Supabase no disponible. Reactiva el proyecto en <strong>supabase.com</strong> y ejecuta el SQL de <code>scripts/migration-admin-rls.sql</code> para habilitar el acceso desde el panel.</span>
          </div>
        )}

        {/* Stats */}
        <div className="adm-stats">
          <div className="adm-stat">
            <div className="adm-stat__top">
              <span className="adm-stat__label">Presupuestos</span>
              <div className="adm-stat__icon adm-stat__icon--blue"><Calculator size={16} /></div>
            </div>
            <span className="adm-stat__value">{stats.totalQuotes}</span>
            <span className="adm-stat__delta">{stats.pendientes} pendientes de revisión</span>
          </div>
          <div className="adm-stat">
            <div className="adm-stat__top">
              <span className="adm-stat__label">Leads clínicas</span>
              <div className="adm-stat__icon adm-stat__icon--green"><Users size={16} /></div>
            </div>
            <span className="adm-stat__value">{stats.totalLeads}</span>
            <span className="adm-stat__delta">{stats.nuevosLeads} sin gestionar</span>
          </div>
          <div className="adm-stat">
            <div className="adm-stat__top">
              <span className="adm-stat__label">Pipeline total</span>
              <div className="adm-stat__icon adm-stat__icon--purple"><Euro size={16} /></div>
            </div>
            <span className="adm-stat__value">{stats.pipeline.toLocaleString('es-ES')}€</span>
            <span className="adm-stat__delta">valor acumulado activo</span>
          </div>
          <div className="adm-stat">
            <div className="adm-stat__top">
              <span className="adm-stat__label">Recibidos hoy</span>
              <div className="adm-stat__icon adm-stat__icon--amber"><Star size={16} /></div>
            </div>
            <span className="adm-stat__value">{stats.hoy}</span>
            <span className="adm-stat__delta">entre presupuestos y leads</span>
          </div>
        </div>

        {/* Recent */}
        <div className="adm-grid-2">
          {/* Presupuestos recientes */}
          <div className="adm-card">
            <div className="adm-card__head">
              <span className="adm-card__title"><TrendingUp size={15} /> Últimos presupuestos</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate('/admin/presupuestos')}>
                Ver todos <ArrowRight size={13} />
              </button>
            </div>
            {loading ? (
              <div className="adm-loading"><RefreshCw size={18} className="adm-loading__icon" /></div>
            ) : recentQuotes.length === 0 ? (
              <div className="adm-empty"><Clock size={28} /><p>Sin presupuestos aún</p></div>
            ) : (
              <div className="adm-activity">
                {recentQuotes.map(q => (
                  <div key={q.id} className="adm-activity__row" onClick={() => navigate(`/admin/presupuesto/${q.id}`)}>
                    <div className="adm-avatar">{(q.name || '?')[0].toUpperCase()}</div>
                    <div className="adm-activity__info">
                      <span className="adm-activity__name">{q.name || '—'}</span>
                      <span className="adm-activity__sub">{q.web_type || '—'} · {q.email}</span>
                    </div>
                    <div className="adm-activity__right">
                      <div className="adm-activity__price">{q.total ? `${q.total.toLocaleString('es-ES')}€` : '—'}</div>
                      <div>
                        <span className="adm-badge" style={{ '--badge-color': STATUS_COLORS[q.status] || '#9CA3AF', fontSize: '10px' }}>
                          {STATUS_LABELS[q.status] || q.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads recientes */}
          <div className="adm-card">
            <div className="adm-card__head">
              <span className="adm-card__title"><Users size={15} /> Últimos leads</span>
              <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => navigate('/admin/leads')}>
                Ver todos <ArrowRight size={13} />
              </button>
            </div>
            {loading ? (
              <div className="adm-loading"><RefreshCw size={18} className="adm-loading__icon" /></div>
            ) : recentLeads.length === 0 ? (
              <div className="adm-empty"><Users size={28} /><p>Sin leads aún</p></div>
            ) : (
              <div className="adm-activity">
                {recentLeads.map(l => (
                  <div key={l.id} className="adm-activity__row" onClick={() => navigate('/admin/leads')}>
                    <div className="adm-avatar adm-avatar--green">{(l.nombre || '?')[0].toUpperCase()}</div>
                    <div className="adm-activity__info">
                      <span className="adm-activity__name">{l.nombre}</span>
                      <span className="adm-activity__sub">{l.clinica} {l.ciudad ? `· ${l.ciudad}` : ''}</span>
                    </div>
                    <div className="adm-activity__right">
                      <span className="adm-badge" style={{ '--badge-color': LEAD_STATUS_COLORS[l.estado] || '#9CA3AF', fontSize: '10px' }}>
                        {LEAD_STATUS_LABELS[l.estado] || l.estado}
                      </span>
                      <div className="adm-activity__date">{new Date(l.created_at).toLocaleDateString('es-ES')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

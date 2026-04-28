import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut, RefreshCw, Search, Filter, Eye, Send,
  TrendingUp, Clock, CheckCircle2, XCircle, Euro, Megaphone,
} from 'lucide-react';
import './Admin.css';

const STATUS_LABELS = {
  pending:     { label: 'Pendiente',    color: '#F59E0B' },
  sent:        { label: 'Enviado',      color: '#3B82F6' },
  approved:    { label: 'Aprobado',     color: '#10B981' },
  in_progress: { label: 'En progreso',  color: '#8B5CF6' },
  completed:   { label: 'Completado',   color: '#059669' },
  rejected:    { label: 'Rechazado',    color: '#EF4444' },
};

export default function AdminDashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    fetchQuotes();
  }, [isAdmin]);

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setQuotes(data || []);
    setLoading(false);
  };

  const filtered = quotes.filter(q => {
    const matchSearch = !search || 
      q.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || q.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:       quotes.length,
    pending:     quotes.filter(q => q.status === 'pending').length,
    approved:    quotes.filter(q => q.status === 'approved' || q.status === 'in_progress').length,
    revenue:     quotes.filter(q => q.status !== 'rejected').reduce((s, q) => s + (q.total || 0), 0),
  };

  const handleSignOut = async () => { await signOut(); navigate('/admin'); };

  return (
    <div className="adm-layout">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <img src="/images/logoazul.png" alt="Agutidesigns" className="adm-sidebar__logo" />
        <nav className="adm-sidebar__nav">
          <button className="adm-sidebar__item adm-sidebar__item--active">
            <TrendingUp size={18} /> Presupuestos
          </button>
          <button
            className="adm-sidebar__item"
            onClick={() => navigate('/admin/campanas')}
          >
            <Megaphone size={18} /> Campañas dentales
          </button>
        </nav>
        <div className="adm-sidebar__footer">
          <span className="adm-sidebar__email">{user?.email}</span>
          <button className="adm-sidebar__logout" onClick={handleSignOut}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">Presupuestos</h1>
            <p className="adm-header__sub">{quotes.length} presupuestos totales</p>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={fetchQuotes}>
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="adm-stats">
          <div className="adm-stat-card">
            <span className="adm-stat-card__label">Total presupuestos</span>
            <span className="adm-stat-card__value">{stats.total}</span>
          </div>
          <div className="adm-stat-card">
            <Clock size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Pendientes</span>
            <span className="adm-stat-card__value adm-stat-card__value--amber">{stats.pending}</span>
          </div>
          <div className="adm-stat-card">
            <CheckCircle2 size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Aprobados / En progreso</span>
            <span className="adm-stat-card__value adm-stat-card__value--green">{stats.approved}</span>
          </div>
          <div className="adm-stat-card">
            <Euro size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Valor total pipeline</span>
            <span className="adm-stat-card__value adm-stat-card__value--blue">
              {stats.revenue.toLocaleString('es-ES')}€
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search__input"
            />
          </div>
          <div className="adm-filter-tabs">
            {['all', 'pending', 'sent', 'approved', 'in_progress', 'completed', 'rejected'].map(s => (
              <button
                key={s}
                className={`adm-filter-tab ${filter === s ? 'adm-filter-tab--active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'Todos' : STATUS_LABELS[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-loading"><RefreshCw size={24} className="adm-loading__icon" /> Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <XCircle size={40} />
            <p>No hay presupuestos{filter !== 'all' ? ` con estado "${STATUS_LABELS[filter]?.label}"` : ''}</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
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
                  <tr key={q.id} className="adm-table__row">
                    <td>
                      <div className="adm-table__client">
                        <div className="adm-table__avatar">{(q.name || '?')[0].toUpperCase()}</div>
                        <div>
                          <strong>{q.name || '—'}</strong>
                          <span>{q.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="adm-table__type">{q.web_type || '—'}</td>
                    <td className="adm-table__price">{q.total ? `${q.total.toLocaleString('es-ES')}€` : '—'}</td>
                    <td>
                      <span
                        className="adm-badge"
                        style={{ '--badge-color': STATUS_LABELS[q.status]?.color || '#9CA3AF' }}
                      >
                        {STATUS_LABELS[q.status]?.label || q.status}
                      </span>
                    </td>
                    <td className="adm-table__date">
                      {new Date(q.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <button
                        className="adm-btn adm-btn--sm adm-btn--ghost"
                        onClick={() => navigate(`/admin/presupuesto/${q.id}`)}
                      >
                        <Eye size={14} /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

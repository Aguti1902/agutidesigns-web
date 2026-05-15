import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut, RefreshCw, Search, TrendingUp, Users,
  Megaphone, X, ChevronRight, Globe, Phone, Mail,
  MapPin, Calendar, CheckCircle2, XCircle, AlertTriangle,
  Star, Clock, ExternalLink, Tag,
} from 'lucide-react';
import './Admin.css';
import './AdminLeads.css';

const ESTADOS = [
  { value: 'nuevo',       label: 'Nuevo',        color: '#9CA3AF' },
  { value: 'contactado',  label: 'Contactado',   color: '#3B82F6' },
  { value: 'reunión',     label: 'Reunión',      color: '#10B981' },
  { value: 'cerrado',     label: 'Cerrado',      color: '#059669' },
  { value: 'descartado',  label: 'Descartado',   color: '#EF4444' },
];
const ESTADO_MAP = Object.fromEntries(ESTADOS.map(e => [e.value, e]));

const OBJETIVOS_LABEL = {
  '5-10':  '5–10 pacientes/mes',
  '10-20': '10–20 pacientes/mes',
  '20-50': '20–50 pacientes/mes',
  '+50':   '+50 pacientes/mes',
};

const SITUACION_LABEL = {
  tengo_web:      'Tiene página web',
  redes_sociales: 'En redes sociales',
  google_ads:     'Hace Google/Meta Ads',
  sin_sistema:    'Sin sistema digital',
};

/* ── Panel detalle ─────────────────────────────────────── */
function LeadPanel({ lead, onClose, onChange }) {
  const [estado, setEstado] = useState(lead.estado || 'nuevo');
  const [notas, setNotas]   = useState(lead.notas || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onChange(lead.id, estado, notas);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ec = ESTADO_MAP[lead.estado] || ESTADOS[0];
  const situacion = Array.isArray(lead.situacion) ? lead.situacion : [];

  return (
    <div className="adm-panel">
      <div className="camp-detail__header">
        <button className="camp-detail__close" onClick={onClose}><X size={18} /></button>
        <div className="adm-lead__avatar">{(lead.nombre || '?')[0].toUpperCase()}</div>
        <div>
          <h3 className="camp-detail__name">{lead.nombre}</h3>
          <div className="camp-detail__meta">
            <span className="adm-badge" style={{ '--badge-color': ec.color }}>{ec.label}</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{lead.clinica}</span>
          </div>
        </div>
      </div>

      <div className="camp-detail__body">
        {/* Objetivo */}
        {lead.pacientes_objetivo && (
          <div className="camp-detail__section">
            <span className="camp-detail__section-title">Objetivo</span>
            <div className="adl-objetivo-badge">
              <Star size={14} />
              {OBJETIVOS_LABEL[lead.pacientes_objetivo] || lead.pacientes_objetivo}
            </div>
          </div>
        )}

        {/* Contacto */}
        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Contacto</span>
          <div className="camp-detail__info-list">
            {lead.ciudad && <span><MapPin size={13} /> {lead.ciudad}</span>}
            {lead.email  && <a href={`mailto:${lead.email}`}><Mail size={13} /> {lead.email}</a>}
            {lead.telefono && <a href={`tel:${lead.telefono}`}><Phone size={13} /> {lead.telefono}</a>}
            {lead.web_actual && (
              <a href={lead.web_actual} target="_blank" rel="noopener noreferrer">
                <Globe size={13} /> {lead.web_actual}
              </a>
            )}
          </div>
        </div>

        {/* Situación actual */}
        {situacion.length > 0 && (
          <div className="camp-detail__section">
            <span className="camp-detail__section-title">Situación actual</span>
            <div className="adl-situacion-tags">
              {situacion.map(s => (
                <span key={s} className="adl-tag">{SITUACION_LABEL[s] || s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Fecha */}
        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Recibido</span>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
            <Clock size={13} style={{ marginRight: 4 }} />
            {lead.created_at ? new Date(lead.created_at).toLocaleString('es-ES') : '—'}
          </span>
        </div>

        {/* Gestión */}
        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Estado</span>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="adm-select"
          >
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>

        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Notas internas</span>
          <textarea
            className="adm-textarea"
            rows={3}
            placeholder="Notas sobre este lead..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />
          <button
            className={`adm-btn adm-btn--primary adm-btn--full ${saved ? 'camp-btn--saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><RefreshCw size={14} className="adm-loading__icon" /> Guardando...</>
             : saved  ? <><CheckCircle2 size={14} /> Guardado</>
             : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────── */
export default function AdminLeads() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    fetchLeads();
  }, [isAdmin]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('clinicas_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setLeads(data || []);
    setLoading(false);
  };

  const handleChange = async (id, estado, notas) => {
    const { error } = await supabase
      .from('clinicas_leads')
      .update({ estado, notas })
      .eq('id', id);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, estado, notas } : l));
      setSelected(prev => prev?.id === id ? { ...prev, estado, notas } : prev);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/admin'); };

  const stats = useMemo(() => ({
    total:      leads.length,
    nuevos:     leads.filter(l => l.estado === 'nuevo').length,
    contactados:leads.filter(l => l.estado === 'contactado').length,
    reuniones:  leads.filter(l => l.estado === 'reunión').length,
    cerrados:   leads.filter(l => l.estado === 'cerrado').length,
    hoy:        leads.filter(l => {
      const d = new Date(l.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
  }), [leads]);

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const mQ = !q || l.nombre?.toLowerCase().includes(q) || l.clinica?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.ciudad?.toLowerCase().includes(q);
    const mF = filter === 'all' || l.estado === filter;
    return mQ && mF;
  }), [leads, search, filter]);

  return (
    <div className={`adm-layout ${selected ? 'adm-layout--with-panel' : ''}`}>
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <img src="/images/logoazul.png" alt="AgutiDesigns" className="adm-sidebar__logo" />
        <nav className="adm-sidebar__nav">
          <button className="adm-sidebar__item" onClick={() => navigate('/admin/dashboard')}>
            <TrendingUp size={18} /> Presupuestos
          </button>
          <button className="adm-sidebar__item" onClick={() => navigate('/admin/campanas')}>
            <Megaphone size={18} /> Campañas dentales
          </button>
          <button className="adm-sidebar__item adm-sidebar__item--active">
            <Users size={18} /> Leads clínicas
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
            <h1 className="adm-header__title">Leads — Clínicas Dentales</h1>
            <p className="adm-header__sub">{stats.total} leads · {stats.hoy} hoy · {stats.nuevos} sin gestionar</p>
          </div>
          <div className="adm-header__actions">
            <button className="adm-btn adm-btn--ghost" onClick={fetchLeads}>
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="adl-kpis">
          {[
            { label: 'Total leads',   value: stats.total,       color: '' },
            { label: 'Sin gestionar', value: stats.nuevos,      color: 'amber' },
            { label: 'Contactados',   value: stats.contactados, color: 'blue' },
            { label: 'Reuniones',     value: stats.reuniones,   color: 'green' },
            { label: 'Cerrados',      value: stats.cerrados,    color: 'purple' },
            { label: 'Recibidos hoy', value: stats.hoy,         color: 'blue' },
          ].map(({ label, value, color }) => (
            <div key={label} className="adm-stat-card">
              <span className="adm-stat-card__label">{label}</span>
              <span className={`adm-stat-card__value ${color ? `adm-stat-card__value--${color}` : ''}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre, clínica, email o ciudad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search__input"
            />
          </div>
          <div className="adm-filter-tabs">
            <button className={`adm-filter-tab ${filter === 'all' ? 'adm-filter-tab--active' : ''}`} onClick={() => setFilter('all')}>
              Todos ({leads.length})
            </button>
            {ESTADOS.map(e => {
              const n = leads.filter(l => l.estado === e.value).length;
              if (!n) return null;
              return (
                <button
                  key={e.value}
                  className={`adm-filter-tab ${filter === e.value ? 'adm-filter-tab--active' : ''}`}
                  onClick={() => setFilter(e.value)}
                >
                  {e.label} ({n})
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="adm-loading"><RefreshCw size={24} className="adm-loading__icon" /> Cargando leads...</div>
        ) : error ? (
          <div className="camp-setup">
            <AlertTriangle size={40} />
            <h3>Tabla no encontrada</h3>
            <p>Ejecuta <code>scripts/migration-clinicas-leads.sql</code> en Supabase.</p>
            <button className="adm-btn adm-btn--primary" onClick={fetchLeads}><RefreshCw size={15} /> Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <Users size={40} />
            <p>{leads.length === 0 ? 'Aún no hay leads. Los verás aquí cuando alguien rellene el formulario de la landing.' : 'Sin resultados.'}</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Clínica</th>
                  <th>Ciudad</th>
                  <th>Objetivo</th>
                  <th>Estado</th>
                  <th>Recibido</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const ec = ESTADO_MAP[l.estado] || ESTADOS[0];
                  return (
                    <tr
                      key={l.id}
                      className={`adm-table__row camp-table__row ${selected?.id === l.id ? 'camp-table__row--active' : ''}`}
                      onClick={() => setSelected(selected?.id === l.id ? null : l)}
                    >
                      <td>
                        <div className="adm-table__client">
                          <div className="adm-table__avatar adl-avatar">{(l.nombre || '?')[0].toUpperCase()}</div>
                          <div>
                            <strong>{l.nombre}</strong>
                            <span>{l.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="adm-table__type">{l.clinica}</td>
                      <td className="adm-table__type">{l.ciudad || '—'}</td>
                      <td>
                        {l.pacientes_objetivo
                          ? <span className="adl-obj-badge">{l.pacientes_objetivo} pac/mes</span>
                          : '—'}
                      </td>
                      <td>
                        <span className="adm-badge" style={{ '--badge-color': ec.color }}>{ec.label}</span>
                      </td>
                      <td className="adm-table__date">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td>
                        <ChevronRight size={16} className={`camp-chevron ${selected?.id === l.id ? 'camp-chevron--open' : ''}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <LeadPanel lead={selected} onClose={() => setSelected(null)} onChange={handleChange} />
      )}
    </div>
  );
}

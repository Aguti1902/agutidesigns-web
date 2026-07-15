import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Calculator, Users, LogOut, RefreshCw,
  Search, X, Mail, Phone, Globe, MapPin, Clock,
  ChevronRight, CheckCircle2, AlertTriangle, Star,
} from 'lucide-react';
import './Admin.css';

const ESTADOS = [
  { value: 'nuevo',       label: 'Nuevo',       color: '#9CA3AF' },
  { value: 'contactado',  label: 'Contactado',  color: '#3B82F6' },
  { value: 'reunión',     label: 'Reunión',     color: '#10B981' },
  { value: 'cerrado',     label: 'Cerrado',     color: '#059669' },
  { value: 'descartado',  label: 'Descartado',  color: '#EF4444' },
];
const ESTADO_MAP = Object.fromEntries(ESTADOS.map(e => [e.value, e]));

const SERVICIO_LABELS = {
  'web-mantenimiento':   'Web + Mantenimiento',
  'web-seo-sem':         'Web + SEO + SEM',
  'ia-360':              'IA 360° Total',
  'chatbot-ia':          'Chatbot IA en la web',
  'solo-consulta':       'Solo quiero información',
};

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

function LeadPanel({ lead, onClose, onChange }) {
  const [estado, setEstado] = useState(lead.estado || 'nuevo');
  const [notas, setNotas]   = useState(lead.notas || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('clinicas_leads').update({ estado, notas }).eq('id', lead.id);
    setSaving(false);
    if (!error) { onChange(lead.id, estado, notas); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const ec = ESTADO_MAP[lead.estado] || ESTADOS[0];
  const waMsg = encodeURIComponent(`Hola ${lead.nombre}, te contacto de Agutidesigns. Vi que estás interesado en mejorar la presencia online de ${lead.clinica}.`);
  const waNum = lead.telefono ? lead.telefono.replace(/\D/g, '') : '';

  return (
    <div className="adm-panel">
      <div className="adm-panel__header">
        <button className="adm-panel__close" onClick={onClose}><X size={16} /></button>
        <div className="adm-panel__avatar adm-avatar--green">{(lead.nombre || '?')[0].toUpperCase()}</div>
        <div>
          <p className="adm-panel__name">{lead.nombre}</p>
          <p className="adm-panel__sub">
            <span className="adm-badge" style={{ '--badge-color': ec.color }}>{ec.label}</span>
          </p>
        </div>
      </div>

      <div className="adm-panel__body">
        {/* Clínica */}
        <div className="adm-section">
          <span className="adm-section__title">Clínica</span>
          <div className="adm-info-row" style={{ fontWeight: 600, fontSize: 15 }}>{lead.clinica}</div>
          {lead.ciudad && <div className="adm-info-row"><MapPin size={13} />{lead.ciudad}</div>}
          {lead.web_actual && (
            <div className="adm-info-row"><Globe size={13} />
              <a href={lead.web_actual} target="_blank" rel="noopener noreferrer">{lead.web_actual.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
        </div>

        {/* Servicio solicitado */}
        {lead.servicio && (
          <div className="adm-section">
            <span className="adm-section__title">Servicio solicitado</span>
            <div className="adm-info-row">
              <Star size={13} style={{ color: '#F59E0B' }} />
              <span style={{ fontWeight: 600 }}>{SERVICIO_LABELS[lead.servicio] || lead.servicio}</span>
            </div>
          </div>
        )}

        <div className="adm-section__divider" />

        {/* Contacto */}
        <div className="adm-section">
          <span className="adm-section__title">Contacto</span>
          {lead.email && <div className="adm-info-row"><Mail size={13} /><a href={`mailto:${lead.email}`}>{lead.email}</a></div>}
          {lead.telefono && <div className="adm-info-row"><Phone size={13} /><a href={`tel:${lead.telefono}`}>{lead.telefono}</a></div>}
          <div className="adm-info-row" style={{ color: '#9CA3AF', fontSize: 11 }}><Clock size={12} /> Recibido: {new Date(lead.created_at).toLocaleString('es-ES')}</div>
        </div>

        <div className="adm-section__divider" />

        {/* Gestión */}
        <div className="adm-section">
          <span className="adm-section__title">Estado</span>
          <select className="adm-select" value={estado} onChange={e => setEstado(e.target.value)}>
            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div className="adm-section">
          <span className="adm-section__title">Notas internas</span>
          <textarea className="adm-textarea" rows={3} placeholder="Notas sobre este lead..." value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
      </div>

      <div className="adm-panel__footer">
        {waNum && (
          <a href={`https://wa.me/34${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--wa adm-btn--full">
            💬 WhatsApp
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}?subject=Agutidesigns — clínicas dentales&body=Hola ${lead.nombre},`} className="adm-btn adm-btn--ghost adm-btn--full">
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

export default function AdminLeads() {
  const navigate = useNavigate();
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dbError, setDbError]   = useState(false);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('adminSession')) { navigate('/admin'); return; }
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true); setDbError(false);
    const { data, error } = await supabase.from('clinicas_leads').select('*').order('created_at', { ascending: false });
    if (error) setDbError(true);
    setLeads(data || []);
    setLoading(false);
  };

  const handleChange = (id, estado, notas) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estado, notas } : l));
    setSelected(prev => prev?.id === id ? { ...prev, estado, notas } : prev);
  };

  const filtered = leads.filter(l => {
    const s = search.toLowerCase();
    const mQ = !s || l.nombre?.toLowerCase().includes(s) || l.clinica?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s) || l.ciudad?.toLowerCase().includes(s);
    const mF = filter === 'all' || l.estado === filter;
    return mQ && mF;
  });

  const today = new Date().toDateString();
  const stats = {
    total:    leads.length,
    nuevos:   leads.filter(l => l.estado === 'nuevo').length,
    reuniones: leads.filter(l => l.estado === 'reunión').length,
    cerrados:  leads.filter(l => l.estado === 'cerrado').length,
    hoy:       leads.filter(l => new Date(l.created_at).toDateString() === today).length,
  };

  return (
    <div className="adm-layout">
      <Sidebar active="leads" />
      <main className="adm-main" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">Leads — Clínicas Dentales</h1>
            <p className="adm-header__sub">{stats.total} leads · {stats.nuevos} sin gestionar · {stats.hoy} hoy</p>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={fetchLeads} disabled={loading}>
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
            { label: 'Total leads',   value: stats.total,    cls: 'blue' },
            { label: 'Sin gestionar', value: stats.nuevos,   cls: 'amber' },
            { label: 'Reuniones',     value: stats.reuniones, cls: 'green' },
            { label: 'Cerrados',      value: stats.cerrados, cls: 'purple' },
          ].map(s => (
            <div key={s.label} className="adm-stat">
              <div className="adm-stat__top">
                <span className="adm-stat__label">{s.label}</span>
              </div>
              <span className="adm-stat__value" style={{ fontSize: 24 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={14} />
            <input type="text" placeholder="Buscar por nombre, clínica, email o ciudad..." value={search} onChange={e => setSearch(e.target.value)} className="adm-search__input" />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><X size={14} /></button>}
          </div>
          <div className="adm-tabs">
            <button className={`adm-tab ${filter === 'all' ? 'adm-tab--active' : ''}`} onClick={() => setFilter('all')}>Todos</button>
            {ESTADOS.map(e => {
              const n = leads.filter(l => l.estado === e.value).length;
              return (
                <button key={e.value} className={`adm-tab ${filter === e.value ? 'adm-tab--active' : ''}`} onClick={() => setFilter(e.value)}>
                  {e.label} {n > 0 ? `(${n})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table + Panel */}
        <div style={{ display: 'flex', gap: 0, flex: 1 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className="adm-loading"><RefreshCw size={22} className="adm-loading__icon" /> Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="adm-empty">
                <Users size={36} />
                <p>{leads.length === 0
                  ? 'Aún no hay leads. Aparecerán aquí cuando alguien rellene el formulario de la landing de clínicas.'
                  : 'Sin resultados para esta búsqueda.'
                }</p>
              </div>
            ) : (
              <div className="adm-card adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Clínica</th>
                      <th>Ciudad</th>
                      <th>Servicio</th>
                      <th>Estado</th>
                      <th>Recibido</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(l => {
                      const ec = ESTADO_MAP[l.estado] || ESTADOS[0];
                      return (
                        <tr key={l.id} className={selected?.id === l.id ? 'active' : ''} onClick={() => setSelected(selected?.id === l.id ? null : l)}>
                          <td>
                            <div className="adm-cell-person">
                              <div className="adm-avatar adm-avatar--green">{(l.nombre || '?')[0].toUpperCase()}</div>
                              <div>
                                <span className="adm-cell-name">{l.nombre}</span>
                                <span className="adm-cell-sub">{l.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="adm-cell-muted">{l.clinica}</td>
                          <td className="adm-cell-muted">{l.ciudad || '—'}</td>
                          <td className="adm-cell-muted" style={{ fontSize: 12 }}>{SERVICIO_LABELS[l.servicio] || l.servicio || '—'}</td>
                          <td><span className="adm-badge" style={{ '--badge-color': ec.color }}>{ec.label}</span></td>
                          <td className="adm-cell-muted">{new Date(l.created_at).toLocaleDateString('es-ES')}</td>
                          <td><ChevronRight size={15} style={{ color: '#9CA3AF' }} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <LeadPanel lead={selected} onClose={() => setSelected(null)} onChange={handleChange} />
          )}
        </div>
      </main>
    </div>
  );
}

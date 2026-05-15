import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut, RefreshCw, Search, TrendingUp, Mail,
  Calendar, Users, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink, Phone, MapPin, Star, ChevronRight,
  X, Globe, MessageCircle, Megaphone, Shield,
  Zap, FileText, BookOpen, Tag, Send,
  Eye, ThumbsUp, ThumbsDown, SendHorizonal, Inbox,
} from 'lucide-react';
import './Admin.css';
import './AdminCampanas.css';

/* URL del webhook n8n para enviar borradores aprobados          */
/* Reemplaza con la URL real de tu workflow workflow-enviar-aprobados */
const N8N_WEBHOOK_URL = 'https://nexgent.app.n8n.cloud/webhook-test/enviar-borradores-aprobados';

/* ── Configuración de estados ─────────────────────────── */
const ESTADOS = [
  { value: 'Nuevo',         label: 'Nuevo',          color: '#9CA3AF' },
  { value: 'Contactado',    label: 'Contactado',      color: '#3B82F6' },
  { value: 'Seguimiento 1', label: 'Seguimiento 1',   color: '#F59E0B' },
  { value: 'Seguimiento 2', label: 'Seguimiento 2',   color: '#F97316' },
  { value: 'Respondido',    label: 'Respondido',      color: '#8B5CF6' },
  { value: 'Reunión',       label: 'Reunión',         color: '#10B981' },
  { value: 'Cerrado',       label: 'Cerrado',         color: '#059669' },
  { value: 'Descartado',    label: 'Descartado',      color: '#EF4444' },
];
const ESTADO_MAP = Object.fromEntries(ESTADOS.map(e => [e.value, e]));

/* ── Helpers SEO ──────────────────────────────────────── */
function getSeoProblems(clinica) {
  const stored = clinica.seo_problemas;
  if (Array.isArray(stored) && stored.length > 0) return stored;

  // Fallback: análisis básico desde los campos disponibles
  const w = clinica.web || '';
  const v = parseFloat(clinica.valoracion || 0);
  const r = parseInt(clinica.n_resenas || 0);
  return [
    { type: 'web',       ok: !!w,                           label: w ? 'Tiene página web' : 'Sin página web propia' },
    { type: 'https',     ok: w.startsWith('https://'),      label: w.startsWith('https://') ? 'HTTPS activado' : 'Sin HTTPS' },
    { type: 'valoracion',ok: v >= 4.3,                      label: v >= 4.3 ? `Valoración ${v}⭐` : `Valoración baja (${v}⭐)` },
    { type: 'resenas',   ok: r >= 30,                       label: r >= 30 ? `${r} reseñas` : `Pocas reseñas (${r})` },
  ];
}

const SEO_ICONS = {
  web: Globe, https: Shield, cita: Calendar, whatsapp: MessageCircle,
  blog: BookOpen, testimonios: Users, schema: Tag, meta: FileText,
  valoracion: Star, resenas: Star,
};

/* ── Componente checklist SEO ─────────────────────────── */
function SeoChecklist({ clinica }) {
  const problemas = getSeoProblems(clinica);
  const issues    = problemas.filter(p => !p.ok);
  const ok        = problemas.filter(p => p.ok);
  const score     = issues.length;

  return (
    <div className="camp-seo">
      <div className="camp-seo__header">
        <span className="camp-seo__title">Análisis SEO</span>
        <span className={`camp-seo__score camp-seo__score--${score === 0 ? 'green' : score <= 3 ? 'amber' : 'red'}`}>
          {score === 0 ? '✓ Sin problemas' : `${score} problema${score > 1 ? 's' : ''}`}
        </span>
      </div>

      {clinica.seo_performance != null && (
        <div className="camp-seo__speed">
          <div className="camp-seo__speed-item">
            <span>PageSpeed móvil</span>
            <span className={`camp-seo__speed-val ${clinica.seo_performance >= 70 ? 'green' : clinica.seo_performance >= 40 ? 'amber' : 'red'}`}>
              {clinica.seo_performance}/100
            </span>
          </div>
          {clinica.seo_score != null && (
            <div className="camp-seo__speed-item">
              <span>SEO score</span>
              <span className={`camp-seo__speed-val ${clinica.seo_score >= 80 ? 'green' : clinica.seo_score >= 60 ? 'amber' : 'red'}`}>
                {clinica.seo_score}/100
              </span>
            </div>
          )}
        </div>
      )}

      {clinica.seo_resumen && (
        <p className="camp-seo__resumen">{clinica.seo_resumen}</p>
      )}

      <div className="camp-seo__list">
        {issues.map((p, i) => {
          const Icon = SEO_ICONS[p.type] || AlertTriangle;
          return (
            <div key={i} className="camp-seo__item camp-seo__item--bad">
              <XCircle size={14} className="camp-seo__item-icon camp-seo__item-icon--bad" />
              <span>{p.label}</span>
            </div>
          );
        })}
        {ok.map((p, i) => {
          return (
            <div key={i} className="camp-seo__item camp-seo__item--ok">
              <CheckCircle2 size={14} className="camp-seo__item-icon camp-seo__item-icon--ok" />
              <span>{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Panel lateral de detalle ─────────────────────────── */
function DetailPanel({ clinica, onClose, onEstadoChange }) {
  const [estado, setEstado]   = useState(clinica.estado || 'Nuevo');
  const [notas, setNotas]     = useState(clinica.notas || '');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onEstadoChange(clinica.id, estado, notas);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const estadoConf = ESTADO_MAP[clinica.estado] || ESTADOS[0];

  return (
    <div className="camp-detail">
      <div className="camp-detail__header">
        <button className="camp-detail__close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="camp-detail__avatar">
          {(clinica.nombre || '?')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="camp-detail__name">{clinica.nombre}</h3>
          <div className="camp-detail__meta">
            <span className="adm-badge" style={{ '--badge-color': estadoConf.color }}>
              {estadoConf.label}
            </span>
            {clinica.valoracion && (
              <span className="camp-detail__rating">
                <Star size={12} fill="currentColor" /> {clinica.valoracion}
                {clinica.n_resenas ? ` · ${clinica.n_resenas} reseñas` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="camp-detail__body">
        {/* Info de contacto */}
        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Contacto</span>
          {clinica.ciudad && (
            <div className="camp-detail__row">
              <MapPin size={13} /> <span>{clinica.ciudad}</span>
            </div>
          )}
          {clinica.web && (
            <div className="camp-detail__row">
              <Globe size={13} />
              <a href={clinica.web} target="_blank" rel="noopener noreferrer" className="camp-detail__link">
                {clinica.web.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
              </a>
            </div>
          )}
          {clinica.email && (
            <div className="camp-detail__row">
              <Mail size={13} />
              <a href={`mailto:${clinica.email}`} className="camp-detail__link">{clinica.email}</a>
            </div>
          )}
          {clinica.telefono && (
            <div className="camp-detail__row">
              <Phone size={13} /> <span>{clinica.telefono}</span>
            </div>
          )}
          {clinica.direccion && (
            <div className="camp-detail__row camp-detail__row--muted">
              <MapPin size={13} /> <span>{clinica.direccion}</span>
            </div>
          )}
        </div>

        {/* Análisis SEO */}
        <div className="camp-detail__section">
          <SeoChecklist clinica={clinica} />
        </div>

        {/* Historial campaña */}
        {(clinica.fecha_contacto || clinica.asunto_enviado) && (
          <div className="camp-detail__section">
            <span className="camp-detail__section-title">Historial campaña</span>
            {clinica.fecha_contacto && (
              <div className="camp-detail__history-item">
                <Send size={12} />
                <div>
                  <span className="camp-detail__history-date">
                    {new Date(clinica.fecha_contacto).toLocaleDateString('es-ES')} — Email inicial
                  </span>
                  {clinica.asunto_enviado && (
                    <p className="camp-detail__history-sub">"{clinica.asunto_enviado}"</p>
                  )}
                </div>
              </div>
            )}
            {clinica.n_seguimientos > 0 && (
              <div className="camp-detail__history-item">
                <RefreshCw size={12} />
                <span className="camp-detail__history-date">
                  {clinica.n_seguimientos} seguimiento{clinica.n_seguimientos > 1 ? 's' : ''} enviado{clinica.n_seguimientos > 1 ? 's' : ''}
                  {clinica.fecha_ultimo_contacto ? ` · Último: ${new Date(clinica.fecha_ultimo_contacto).toLocaleDateString('es-ES')}` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cambiar estado */}
        <div className="camp-detail__section camp-detail__section--actions">
          <span className="camp-detail__section-title">Estado</span>
          <select
            className="adm-select"
            value={estado}
            onChange={e => setEstado(e.target.value)}
          >
            {ESTADOS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>

          <span className="camp-detail__section-title" style={{ marginTop: '12px' }}>Notas</span>
          <textarea
            className="adm-textarea"
            rows={3}
            placeholder="Notas internas..."
            value={notas}
            onChange={e => setNotas(e.target.value)}
          />

          <button
            className={`adm-btn adm-btn--primary adm-btn--full ${saved ? 'camp-btn--saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><RefreshCw size={14} className="adm-loading__icon" /> Guardando...</> :
             saved   ? <><CheckCircle2 size={14} /> Guardado</> :
                       'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Panel de preview de email borrador ───────────────── */
function EmailPreviewPanel({ borrador, onClose, onAprobar, onDescartar }) {
  const [saving, setSaving] = useState(false);

  const ESTADO_COLORS = {
    borrador:   '#9CA3AF',
    aprobado:   '#10B981',
    enviado:    '#3B82F6',
    descartado: '#EF4444',
    error:      '#F97316',
  };

  const handleAprobar = async () => {
    setSaving(true);
    await onAprobar(borrador.id);
    setSaving(false);
  };

  const handleDescartar = async () => {
    setSaving(true);
    await onDescartar(borrador.id);
    setSaving(false);
  };

  return (
    <div className="camp-detail camp-preview-panel">
      <div className="camp-detail__header">
        <button className="camp-detail__close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="camp-detail__avatar camp-preview-panel__avatar">
          {(borrador.nombre || '?')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="camp-detail__name">{borrador.nombre}</h3>
          <div className="camp-detail__meta">
            <span className="adm-badge" style={{ '--badge-color': ESTADO_COLORS[borrador.estado] || '#9CA3AF' }}>
              {borrador.estado}
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{borrador.to_email}</span>
          </div>
        </div>
      </div>

      <div className="camp-detail__body">
        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Asunto</span>
          <p className="camp-preview__subject">{borrador.subject}</p>
        </div>

        {borrador.seo_resumen && (
          <div className="camp-detail__section">
            <span className="camp-detail__section-title">Problemas detectados</span>
            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>{borrador.seo_resumen}</p>
          </div>
        )}

        <div className="camp-detail__section">
          <span className="camp-detail__section-title">Preview del email</span>
          <div className="camp-preview__iframe-wrap">
            <iframe
              srcDoc={borrador.html_body}
              title="Preview email"
              className="camp-preview__iframe"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {borrador.error_msg && (
          <div className="camp-preview__error">
            <AlertTriangle size={14} /> {borrador.error_msg}
          </div>
        )}

        {borrador.sent_at && (
          <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '8px' }}>
            Enviado: {new Date(borrador.sent_at).toLocaleString('es-ES')}
          </p>
        )}
      </div>

      {/* Acciones */}
      {(borrador.estado === 'borrador' || borrador.estado === 'error') && (
        <div className="camp-detail__actions">
          <button
            className="adm-btn adm-btn--ghost camp-preview__btn-discard"
            onClick={handleDescartar}
            disabled={saving}
          >
            <ThumbsDown size={14} /> Descartar
          </button>
          <button
            className="adm-btn adm-btn--primary camp-preview__btn-approve"
            onClick={handleAprobar}
            disabled={saving}
          >
            {saving
              ? <><RefreshCw size={14} className="adm-loading__icon" /> Guardando...</>
              : <><ThumbsUp size={14} /> Aprobar</>}
          </button>
        </div>
      )}
      {borrador.estado === 'aprobado' && (
        <div className="camp-detail__actions">
          <button
            className="adm-btn adm-btn--ghost camp-preview__btn-discard"
            onClick={handleDescartar}
            disabled={saving}
          >
            <ThumbsDown size={14} /> Descartar
          </button>
          <span className="camp-preview__approved-badge">
            <CheckCircle2 size={14} /> Aprobado — listo para enviar
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Tab Borradores ───────────────────────────────────── */
function BorradoresTab() {
  const [borradores, setBorradores]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [selected, setSelected]         = useState(null);
  const [sending, setSending]           = useState(false);
  const [sendResult, setSendResult]     = useState(null);

  const fetchBorradores = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('campana_borradores')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBorradores(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBorradores(); }, [fetchBorradores]);

  const stats = useMemo(() => ({
    total:       borradores.length,
    borradores:  borradores.filter(b => b.estado === 'borrador').length,
    aprobados:   borradores.filter(b => b.estado === 'aprobado').length,
    enviados:    borradores.filter(b => b.estado === 'enviado').length,
    descartados: borradores.filter(b => b.estado === 'descartado').length,
  }), [borradores]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return borradores.filter(b => {
      const matchQ = !q ||
        b.nombre?.toLowerCase().includes(q) ||
        b.to_email?.toLowerCase().includes(q) ||
        b.ciudad?.toLowerCase().includes(q);
      const matchE = filterEstado === 'all' || b.estado === filterEstado;
      return matchQ && matchE;
    });
  }, [borradores, search, filterEstado]);

  const handleAprobar = async (id) => {
    const { error } = await supabase
      .from('campana_borradores')
      .update({ estado: 'aprobado' })
      .eq('id', id);
    if (!error) {
      setBorradores(prev => prev.map(b => b.id === id ? { ...b, estado: 'aprobado' } : b));
      setSelected(prev => prev?.id === id ? { ...prev, estado: 'aprobado' } : prev);
    }
  };

  const handleDescartar = async (id) => {
    const { error } = await supabase
      .from('campana_borradores')
      .update({ estado: 'descartado' })
      .eq('id', id);
    if (!error) {
      setBorradores(prev => prev.map(b => b.id === id ? { ...b, estado: 'descartado' } : b));
      setSelected(prev => prev?.id === id ? { ...prev, estado: 'descartado' } : prev);
    }
  };

  const handleEnviarTodos = async () => {
    if (stats.aprobados === 0) {
      setSendResult({ ok: false, msg: 'No hay borradores aprobados. Aprueba al menos uno primero.' });
      setTimeout(() => setSendResult(null), 4000);
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'admin-panel', ts: Date.now() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSendResult({ ok: true, msg: `¡Enviando ${stats.aprobados} emails! Refresca en unos minutos para ver el resultado.` });
        setTimeout(() => { setSendResult(null); fetchBorradores(); }, 5000);
      } else {
        setSendResult({ ok: false, msg: json.msg || 'Error al contactar n8n. Comprueba la URL del webhook.' });
      }
    } catch {
      setSendResult({ ok: false, msg: 'No se pudo conectar con n8n. Verifica la URL del webhook en el código.' });
    }
    setSending(false);
  };

  const ESTADO_COLORS = {
    borrador:   '#9CA3AF',
    aprobado:   '#10B981',
    enviado:    '#3B82F6',
    descartado: '#EF4444',
    error:      '#F97316',
  };

  return (
    <div className={`adm-main-inner ${selected ? 'adm-layout--with-panel' : ''}`} style={{ display: 'flex', gap: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ── KPIs borradores ── */}
        <div className="camp-kpis camp-kpis--borradores">
          <div className="adm-stat-card">
            <Inbox size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Total generados</span>
            <span className="adm-stat-card__value">{stats.total}</span>
          </div>
          <div className="adm-stat-card">
            <Eye size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Pendientes revisión</span>
            <span className="adm-stat-card__value adm-stat-card__value--amber">{stats.borradores}</span>
          </div>
          <div className="adm-stat-card">
            <ThumbsUp size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Aprobados</span>
            <span className="adm-stat-card__value adm-stat-card__value--green">{stats.aprobados}</span>
          </div>
          <div className="adm-stat-card">
            <Send size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Enviados</span>
            <span className="adm-stat-card__value adm-stat-card__value--blue">{stats.enviados}</span>
          </div>
          <div className="adm-stat-card">
            <XCircle size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Descartados</span>
            <span className="adm-stat-card__value">{stats.descartados}</span>
          </div>
        </div>

        {/* ── Banner send result ── */}
        {sendResult && (
          <div className={`camp-send-result ${sendResult.ok ? 'camp-send-result--ok' : 'camp-send-result--error'}`}>
            {sendResult.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {sendResult.msg}
          </div>
        )}

        {/* ── Barra de acciones ── */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ciudad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search__input"
            />
          </div>
          <div className="adm-filter-tabs">
            {[
              { key: 'all',        label: `Todos (${stats.total})` },
              { key: 'borrador',   label: `Borrador (${stats.borradores})` },
              { key: 'aprobado',   label: `Aprobado (${stats.aprobados})` },
              { key: 'enviado',    label: `Enviado (${stats.enviados})` },
              { key: 'descartado', label: `Descartado (${stats.descartados})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`adm-filter-tab ${filterEstado === key ? 'adm-filter-tab--active' : ''}`}
                onClick={() => setFilterEstado(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={`adm-btn adm-btn--primary camp-btn-enviar ${stats.aprobados === 0 ? 'adm-btn--disabled' : ''}`}
            onClick={handleEnviarTodos}
            disabled={sending}
          >
            {sending
              ? <><RefreshCw size={14} className="adm-loading__icon" /> Enviando...</>
              : <><SendHorizonal size={14} /> Enviar {stats.aprobados} aprobados</>}
          </button>
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="adm-loading">
            <RefreshCw size={24} className="adm-loading__icon" /> Cargando borradores...
          </div>
        ) : error ? (
          <div className="camp-setup">
            <AlertTriangle size={40} />
            <h3>Tabla no encontrada</h3>
            <p>Ejecuta <code>scripts/migration-borradores.sql</code> en Supabase,<br />
              luego corre el workflow <strong>Generar Borradores IA</strong> en n8n.</p>
            <button className="adm-btn adm-btn--primary" onClick={fetchBorradores}>
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <Inbox size={40} />
            <p>
              {borradores.length === 0
                ? 'Corre el workflow "Generar Borradores IA" en n8n para generar emails.'
                : 'Sin resultados para esta búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Clínica</th>
                  <th>Ciudad</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr
                    key={b.id}
                    className={`adm-table__row camp-table__row ${selected?.id === b.id ? 'camp-table__row--active' : ''}`}
                    onClick={() => setSelected(selected?.id === b.id ? null : b)}
                  >
                    <td>
                      <div className="adm-table__client">
                        <div className="adm-table__avatar">{(b.nombre || '?')[0].toUpperCase()}</div>
                        <div>
                          <strong>{b.nombre}</strong>
                          <span>{b.to_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="adm-table__type">{b.ciudad || '—'}</td>
                    <td className="camp-borr-subject">{b.subject}</td>
                    <td>
                      <span className="adm-badge" style={{ '--badge-color': ESTADO_COLORS[b.estado] || '#9CA3AF' }}>
                        {b.estado}
                      </span>
                    </td>
                    <td className="adm-table__date">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td>
                      <Eye size={15} style={{ color: '#9CA3AF', cursor: 'pointer' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Panel preview ── */}
      {selected && (
        <EmailPreviewPanel
          borrador={selected}
          onClose={() => setSelected(null)}
          onAprobar={handleAprobar}
          onDescartar={handleDescartar}
        />
      )}
    </div>
  );
}

/* ── Componente principal ─────────────────────────────── */
export default function AdminCampanas() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]     = useState('clinicas'); // 'clinicas' | 'borradores'
  const [clinicas, setClinicas]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all');
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin'); return; }
    fetchClinicas();
  }, [isAdmin]);

  const fetchClinicas = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('clinicas_campana')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setClinicas(data || []);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const total        = clinicas.length;
    const enviados     = clinicas.filter(c => c.estado !== 'Nuevo').length;
    const seguimientos = clinicas.filter(c => ['Seguimiento 1', 'Seguimiento 2'].includes(c.estado)).length;
    const reuniones    = clinicas.filter(c => c.estado === 'Reunión').length;
    const respondidos  = clinicas.filter(c => c.estado === 'Respondido').length;
    const conEmail     = clinicas.filter(c => c.email).length;
    const tasa         = enviados > 0 ? Math.round((respondidos + reuniones) / enviados * 100) : 0;
    return { total, enviados, seguimientos, reuniones, respondidos, conEmail, tasa };
  }, [clinicas]);

  const filtered = useMemo(() => clinicas.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.nombre?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.ciudad?.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || c.estado === filter;
    return matchSearch && matchFilter;
  }), [clinicas, search, filter]);

  const handleEstadoChange = async (id, estado, notas) => {
    const { error } = await supabase
      .from('clinicas_campana')
      .update({ estado, notas, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setClinicas(prev => prev.map(c => c.id === id ? { ...c, estado, notas } : c));
      setSelected(prev => prev?.id === id ? { ...prev, estado, notas } : prev);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/admin'); };

  /* ── SEO score para la tabla ── */
  const getSeoLabel = (clinica) => {
    const problems = getSeoProblems(clinica).filter(p => !p.ok);
    const n = problems.length;
    if (n === 0) return { label: '✓', cls: 'green' };
    if (n <= 3)  return { label: `${n}`, cls: 'amber' };
    return             { label: `${n}`, cls: 'red' };
  };

  return (
    <div className={`adm-layout ${selected && activeTab === 'clinicas' ? 'adm-layout--with-panel' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <img src="/images/logoazul.png" alt="AgutiDesigns" className="adm-sidebar__logo" />
        <nav className="adm-sidebar__nav">
          <button
            className="adm-sidebar__item"
            onClick={() => navigate('/admin/dashboard')}
          >
            <TrendingUp size={18} /> Presupuestos
          </button>
          <button className="adm-sidebar__item adm-sidebar__item--active">
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

      {/* ── Main ── */}
      <main className="adm-main">
        {/* Header */}
        <div className="adm-header">
          <div>
            <h1 className="adm-header__title">Campañas Dentales</h1>
            <p className="adm-header__sub">{clinicas.length} clínicas · {stats.conEmail} con email</p>
          </div>
          <div className="adm-header__actions">
            <button className="adm-btn adm-btn--ghost" onClick={fetchClinicas}>
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="camp-tabs">
          <button
            className={`camp-tab ${activeTab === 'clinicas' ? 'camp-tab--active' : ''}`}
            onClick={() => setActiveTab('clinicas')}
          >
            <Users size={15} /> Clínicas
          </button>
          <button
            className={`camp-tab ${activeTab === 'borradores' ? 'camp-tab--active' : ''}`}
            onClick={() => setActiveTab('borradores')}
          >
            <Mail size={15} /> Borradores emails
          </button>
        </div>

        {/* ── Tab: Borradores ── */}
        {activeTab === 'borradores' && <BorradoresTab />}

        {/* ── Tab: Clínicas ── */}
        {activeTab === 'clinicas' && <>

        {/* ── KPIs ── */}
        <div className="camp-kpis">
          <div className="adm-stat-card">
            <Users size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Total clínicas</span>
            <span className="adm-stat-card__value">{stats.total}</span>
          </div>
          <div className="adm-stat-card">
            <Mail size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Contactados</span>
            <span className="adm-stat-card__value adm-stat-card__value--blue">{stats.enviados}</span>
          </div>
          <div className="adm-stat-card">
            <RefreshCw size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">En seguimiento</span>
            <span className="adm-stat-card__value adm-stat-card__value--amber">{stats.seguimientos}</span>
          </div>
          <div className="adm-stat-card">
            <Calendar size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Reuniones</span>
            <span className="adm-stat-card__value adm-stat-card__value--green">{stats.reuniones}</span>
          </div>
          <div className="adm-stat-card">
            <MessageCircle size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Respondieron</span>
            <span className="adm-stat-card__value" style={{ color: '#8B5CF6' }}>{stats.respondidos}</span>
          </div>
          <div className="adm-stat-card">
            <Zap size={16} className="adm-stat-card__icon" />
            <span className="adm-stat-card__label">Tasa respuesta</span>
            <span className="adm-stat-card__value" style={{ color: stats.tasa >= 10 ? '#10B981' : '#F59E0B' }}>
              {stats.tasa}%
            </span>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="adm-filters">
          <div className="adm-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ciudad..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="adm-search__input"
            />
          </div>
          <div className="adm-filter-tabs">
            <button
              className={`adm-filter-tab ${filter === 'all' ? 'adm-filter-tab--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({clinicas.length})
            </button>
            {ESTADOS.map(e => {
              const n = clinicas.filter(c => c.estado === e.value).length;
              if (n === 0) return null;
              return (
                <button
                  key={e.value}
                  className={`adm-filter-tab ${filter === e.value ? 'adm-filter-tab--active' : ''}`}
                  onClick={() => setFilter(e.value)}
                  style={filter === e.value ? {} : { '--tab-dot': e.color }}
                >
                  {e.label} ({n})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="adm-loading">
            <RefreshCw size={24} className="adm-loading__icon" /> Cargando clínicas...
          </div>
        ) : error ? (
          <div className="camp-setup">
            <AlertTriangle size={40} />
            <h3>Tabla no encontrada</h3>
            <p>Ejecuta el SQL de <code>scripts/migration-campanas.sql</code> en tu Supabase,<br />luego corre el workflow <strong>Sync Clínicas → Supabase</strong> en n8n.</p>
            <button className="adm-btn adm-btn--primary" onClick={fetchClinicas}>
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <XCircle size={40} />
            <p>{clinicas.length === 0 ? 'Ejecuta el workflow de sync en n8n para importar tus clínicas.' : 'Sin resultados para esta búsqueda.'}</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Clínica</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>SEO</th>
                  <th>Último contacto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const seo   = getSeoLabel(c);
                  const eConf = ESTADO_MAP[c.estado] || ESTADOS[0];
                  return (
                    <tr
                      key={c.id}
                      className={`adm-table__row camp-table__row ${selected?.id === c.id ? 'camp-table__row--active' : ''}`}
                      onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    >
                      <td>
                        <div className="adm-table__client">
                          <div className="adm-table__avatar">{(c.nombre || '?')[0].toUpperCase()}</div>
                          <div>
                            <strong>{c.nombre}</strong>
                            <span>{c.email || '— sin email —'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="adm-table__type">{c.ciudad || '—'}</td>
                      <td>
                        <span className="adm-badge" style={{ '--badge-color': eConf.color }}>
                          {eConf.label}
                        </span>
                      </td>
                      <td>
                        <span className={`camp-seo-badge camp-seo-badge--${seo.cls}`}>
                          {seo.cls === 'green' ? '✓' : `${seo.label} ⚠`}
                        </span>
                      </td>
                      <td className="adm-table__date">
                        {c.fecha_ultimo_contacto || c.fecha_contacto
                          ? new Date(c.fecha_ultimo_contacto || c.fecha_contacto).toLocaleDateString('es-ES')
                          : '—'}
                      </td>
                      <td>
                        <ChevronRight
                          size={16}
                          className={`camp-chevron ${selected?.id === c.id ? 'camp-chevron--open' : ''}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        </>}
      </main>

      {/* ── Panel lateral clínicas ── */}
      {activeTab === 'clinicas' && selected && (
        <DetailPanel
          clinica={selected}
          onClose={() => setSelected(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </div>
  );
}

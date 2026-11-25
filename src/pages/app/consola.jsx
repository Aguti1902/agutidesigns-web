// Páginas del panel con el diseño de consola (Consola.css): Publicaciones, Blog, Reseñas, SEO y competencia,
// Chat con cada departamento y conexión con el CRM que ya usa el negocio.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, Check, Copy, ExternalLink, FileText, Image as ImageIcon, Layers, Link2, Plug, Plus, RefreshCw,
  Search, Send, Smartphone, Sparkles, Star, Trash2, Users, Webhook, X,
} from 'lucide-react';
import { siHubspot, siSalesforce, siZoho, siOdoo } from 'simple-icons';
import { DEPTO } from '../../data/oficinaSaas';
import { ajustesDe } from '../../data/oficinaAjustes';
import { api, pendiente, metrica } from './datos';
import { Avatar, Puntos } from './ui';
import { fmt, hace, hora, uid } from './formato';
import { respuestaDemo } from './demoChat';
import { Cabecera } from './pantallas';

const conectada = (o, id) => o.conexiones.some((c) => c.herramienta === id && c.estado === 'conectada');
const suma = (arr, k) => (arr || []).reduce((a, x) => a + (x[k] || 0), 0);
const copiar = (t) => navigator.clipboard?.writeText(t).catch(() => {});
const inicioMes = (o) => { const d = new Date(o.ahora || Date.now()); return new Date(d.getFullYear(), d.getMonth(), 1); };
const delta = (a, b) => (b ? (a - b) / b : null);

function Delta({ v, invertir }) {
  if (v == null || !Number.isFinite(v)) return null;
  const bueno = invertir ? v < 0 : v > 0; const cls = Math.abs(v) < 0.005 ? 'is-0' : bueno ? 'is-up' : 'is-down';
  return <span className={`cx-d ${cls}`}>{v > 0 ? '+' : ''}{fmt(v * 100, Math.abs(v) < 0.1 ? 1 : 0)} %</span>;
}
function Spark({ datos, color = 'var(--acento)' }) {
  if (!datos?.length) return null;
  const mx = Math.max(...datos, 1); const mn = Math.min(...datos, 0); const w = 100; const h = 22;
  const pts = datos.map((v, i) => `${(i / Math.max(1, datos.length - 1)) * w},${h - ((v - mn) / Math.max(1, mx - mn)) * (h - 2) - 1}`).join(' ');
  return <svg className="g-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>;
}
function Stat({ t, v, u, d, inv, sub, serie, color }) {
  return <div className="cx-stat"><span>{t}</span><b>{v}{u && <small>{u}</small>}<Delta v={d} invertir={inv} /></b>{sub && <em>{sub}</em>}{serie && <Spark datos={serie} color={color} />}</div>;
}
function Panel({ icono: I, titulo, sub, extra, children, cuerpo = true, pie }) {
  return (
    <section className="cx">
      {(titulo || extra) && <header className="cx__h">{I && <I />}<h2>{titulo}</h2>{sub && <small>{sub}</small>}<span className="cx-sp" />{extra}</header>}
      {cuerpo ? <div className="cx__b">{children}</div> : children}
      {pie && <footer className="cx__f">{pie}</footer>}
    </section>
  );
}
function Tabs({ val, set, op }) {
  return <div className="cx-tabs" role="tablist">{op.map(([k, t, n]) => <button key={k} role="tab" aria-selected={val === k} onClick={() => set(k)}>{t}{n != null && <em>{n}</em>}</button>)}</div>;
}
function Barra({ t, v, max, c, etiqueta }) {
  return <div className="cx-bar" style={{ '--c': c }}><span>{t}</span><b>{etiqueta ?? fmt(v)}</b><i><s style={{ width: `${Math.max(2, (v / Math.max(1, max)) * 100)}%` }} /></i></div>;
}
function Vacio({ icono: I = Sparkles, children }) { return <div className="cx-vacio"><I />{children}</div>; }

async function decidirPieza(o, e, decision, texto) {
  if (!o.demo) await api('tarea', { id: e.id, decision, texto }).catch(() => {});
  o.setEstado((s) => ({ ...s, eventos: s.eventos.map((x) => (x.id === e.id ? { ...x, resuelto: true, respuesta: decision === 'aprobar' ? 'Aprobado' : 'Descartado' } : x)) }));
}

// ---------------- Publicaciones (Redes) ----------------
const FORMATOS = [['historia', 'Historia', Smartphone], ['post', 'Post', ImageIcon], ['carrusel', 'Carrusel', Layers]];
const OBJETIVO = { historia: 60, post: 24, reel: 8 }; // mismo reparto que el cupo de Redes (92 piezas)
const GRAD = [['#1d2b64', '#0b1023'], ['#5b2a86', '#1a0b2e'], ['#0f5c4d', '#06201b'], ['#7a3b12', '#1f0d03'], ['#21406e', '#0a1424']];
const formatoDe = (e) => e.detalle?.formato || 'post';
const tituloDe = (e) => e.detalle?.titulo || (e.texto.match(/«(.+?)»/) || [])[1] || e.texto;

function Post({ e, o, i }) {
  const [texto, setTexto] = useState(e.detalle?.texto || ''); const pend = pendiente(e); const f = formatoDe(e);
  const g = GRAD[i % GRAD.length]; const F = FORMATOS.find((x) => x[0] === f) || FORMATOS[1]; const FI = F[2];
  return (
    <article className="cx-post">
      <div className={`cx-post__m is-${f}`} style={{ '--g1': g[0], '--g2': g[1] }}>
        <span className="cx-post__tipo"><FI />{F[1]}{f === 'carrusel' && e.detalle?.diapositivas?.length ? ` · ${e.detalle.diapositivas.length}` : ''}</span>
        {f === 'carrusel' && <span className="cx-post__pags">{(e.detalle?.diapositivas || [1, 2, 3, 4]).slice(0, 6).map((_, k) => <i key={k} />)}</span>}
        <ImageIcon />
        <p>{f === 'carrusel' ? (e.detalle?.diapositivas?.[0]?.titulo || tituloDe(e)) : tituloDe(e)}</p>
      </div>
      <div className="cx-post__c">
        <header><b>{tituloDe(e)}</b><span className={`cx-st ${pend ? 'is-aviso' : e.respuesta === 'Descartado' ? '' : 'is-ok'}`}><i />{pend ? 'Por revisar' : e.respuesta === 'Descartado' ? 'Descartado' : 'Aprobado'}</span></header>
        <small>{e.detalle?.dia ? `Para el ${e.detalle.dia} · ` : ''}{e.detalle?.red ? `${e.detalle.red[0].toUpperCase()}${e.detalle.red.slice(1)} · ` : ''}{hace(e.creado)}</small>
        {texto && <textarea className="cx-post__t" rows={4} value={texto} onChange={(x) => setTexto(x.target.value)} readOnly={!pend} aria-label="Texto de la publicación" />}
        {e.detalle?.idea_imagen && <small>Imagen: {e.detalle.idea_imagen}</small>}
      </div>
      <div className="cx-post__a">
        {texto && <button className="btn btn--sec btn--sm" onClick={() => copiar(texto)} aria-label="Copiar texto"><Copy size={13} /></button>}
        {pend && <><button className="btn btn--fan btn--sm" onClick={() => decidirPieza(o, e, 'descartar', texto)}>Descartar</button><button className="btn btn--pri btn--sm" onClick={() => decidirPieza(o, e, 'aprobar', texto)}><Check size={13} /> Aprobar</button></>}
      </div>
    </article>
  );
}

export function Publicaciones({ o }) {
  const [tema, setTema] = useState(''); const [formato, setFormato] = useState('post'); const [st, setSt] = useState(''); const [tab, setTab] = useState('revisar');
  const piezas = o.eventos.filter((e) => e.depto === 'redes' && e.detalle?.accion !== 'video' && (e.detalle?.texto || e.tipo === 'pendiente'));
  const publicadas = o.eventos.filter((e) => e.depto === 'redes' && e.tipo === 'hecho' && !e.detalle?.texto);
  const mes = inicioMes(o);
  const delMes = (f) => piezas.filter((e) => new Date(e.creado) >= mes && formatoDe(e) === f).length + publicadas.filter((e) => new Date(e.creado) >= mes && (e.detalle?.formato || 'post') === f).length;
  const cuenta = { historia: delMes('historia'), post: delMes('post') + delMes('carrusel'), reel: o.videos.filter((v) => new Date(v.creado) >= mes).length };
  const red = ['instagram', 'facebook', 'tiktok'].filter((h) => conectada(o, h));
  const lista = tab === 'revisar' ? piezas.filter(pendiente) : tab === 'aprobadas' ? piezas.filter((e) => !pendiente(e) && e.respuesta !== 'Descartado') : null;
  async function pedir(ev) {
    ev.preventDefault(); if (!tema.trim()) return; setSt('Tu agente de Redes está preparando la pieza…');
    try {
      if (o.demo) {
        await new Promise((r) => setTimeout(r, 900));
        o.setEstado((s) => ({ ...s, eventos: [{ id: uid('p'), depto: 'redes', tipo: 'pendiente', resuelto: false, creado: new Date().toISOString(), texto: `Pieza lista: «${tema}»`,
          detalle: { accion: 'publicar', formato, titulo: tema, red: 'instagram', texto: `${tema} ✨ Pide tu cita por WhatsApp.`, ...(formato === 'carrusel' ? { diapositivas: [{ titulo: tema }, {}, {}, {}, {}] } : {}) } }, ...s.eventos] }));
      } else await api('encargo', { depto: 'redes', tema, formato });
      setTema(''); setTab('revisar'); setSt('Lista. La tienes en «Por revisar».');
    } catch (er) { setSt(er.message); }
  }
  return (
    <div className="vista">
      {!red.length && <p className="banda-prueba"><Sparkles size={17} /><span>Conecta <b>Instagram o Facebook</b> y lo que apruebes se publicará solo. Mientras, puedes copiarlo.</span><button className="btn btn--sec btn--sm" onClick={() => o.ir('conexiones')}>Conectar</button></p>}
      <div className="cx-cupo3">
        {[['historia', 'Historias', Smartphone], ['post', 'Posts y carruseles', Layers], ['reel', 'Reels y TikToks', ImageIcon]].map(([k, t, I]) => {
          const p = cuenta[k] / OBJETIVO[k];
          return <div key={k} className="cx-cupo"><header><I />{t}<span className="cx-sp" />{k === 'reel' && <button className="enlace" onClick={() => o.ir('videos')}>Vídeos</button>}</header><b>{fmt(cuenta[k])}<small> / {OBJETIVO[k]} este mes</small></b><div className={`cx-meter ${p >= 1 ? 'is-mal' : p >= 0.8 ? 'is-aviso' : ''}`} style={{ '--c': DEPTO.redes.color }}><s style={{ width: `${Math.min(100, p * 100)}%` }} /></div></div>;
        })}
      </div>
      <form className="cx-comp" onSubmit={pedir}>
        <Sparkles />
        <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="¿Sobre qué? Ej.: la promoción de Navidad, el nuevo tratamiento de keratina…" aria-label="Tema" />
        <div className="seg" role="group" aria-label="Formato">{FORMATOS.map(([k, t]) => <button type="button" key={k} aria-pressed={formato === k} onClick={() => setFormato(k)}>{t}</button>)}</div>
        <button className="btn btn--pri btn--sm">Pedir</button>
      </form>
      {st && <p className="cx-nota">{st}</p>}
      <Tabs val={tab} set={setTab} op={[['revisar', 'Por revisar', piezas.filter(pendiente).length], ['aprobadas', 'Aprobadas', piezas.filter((e) => !pendiente(e) && e.respuesta !== 'Descartado').length], ['publicadas', 'Publicadas', publicadas.length]]} />
      {lista ? (lista.length ? <div className="cx-posts">{lista.slice(0, 30).map((e, i) => <Post key={e.id} e={e} o={o} i={i} />)}</div>
        : <Vacio icono={Check}>{tab === 'revisar' ? 'Nada pendiente. Cada lunes tu agente prepara las piezas de la semana.' : 'Aún no has aprobado ninguna pieza.'}</Vacio>)
        : (publicadas.length ? <section className="cx"><ul className="cx-list">{publicadas.slice(0, 20).map((e) => <li key={e.id}><span className="cx-st is-ok"><i />Publicado</span><div className="cx-list__m"><b>{e.texto}</b><small>{hace(e.creado)}</small></div></li>)}</ul></section> : <Vacio>Todavía no se ha publicado nada.</Vacio>)}
    </div>
  );
}

// ---------------- Blog (Contenido) ----------------
function Articulo({ e, o }) {
  const [ver, setVer] = useState(false); const [texto, setTexto] = useState(e.detalle?.texto || ''); const pend = pendiente(e);
  const palabras = texto ? texto.split(/\s+/).filter(Boolean).length : 0;
  return (
    <div className="cx-art">
      <span className="cx-art__ic"><FileText /></span>
      <div className="cx-art__m"><b>{tituloDe(e)}</b><small><span>{hace(e.creado)}</span>{palabras > 0 && <span>{fmt(palabras)} palabras</span>}{e.detalle?.resumen && <span>{e.detalle.resumen}</span>}</small></div>
      <div className="cx-art__a">
        <span className={`cx-st ${pend ? 'is-aviso' : e.respuesta === 'Descartado' ? '' : 'is-ok'}`}><i />{pend ? 'Por revisar' : e.respuesta === 'Descartado' ? 'Descartado' : 'Aprobado'}</span>
        {texto && <button className="btn btn--sec btn--sm" onClick={() => setVer(!ver)}>{ver ? 'Cerrar' : 'Leer'}</button>}
        {pend && <button className="btn btn--pri btn--sm" onClick={() => decidirPieza(o, e, 'aprobar', texto)}><Check size={13} /> Aprobar</button>}
      </div>
      {ver && <><textarea className="cx-art__txt" rows={16} value={texto} onChange={(x) => setTexto(x.target.value)} readOnly={!pend} aria-label="Texto del artículo" />
        <div className="cx-row" style={{ gridColumn: '1 / -1' }}><button className="btn btn--sec btn--sm" onClick={() => copiar(texto)}><Copy size={13} /> Copiar</button>{pend && <button className="btn btn--fan btn--sm" onClick={() => decidirPieza(o, e, 'descartar', texto)}>Descartar</button>}</div></>}
    </div>
  );
}
export function Articulos({ o }) {
  const [t, setT] = useState(''); const [st, setSt] = useState('');
  const piezas = o.eventos.filter((e) => e.depto === 'contenido' && e.detalle?.accion === 'articulo');
  const wp = conectada(o, 'wordpress');
  async function pedir(ev) {
    ev.preventDefault(); if (!t.trim()) return; setSt('Tu agente de Contenido está escribiendo…');
    try { if (o.demo) await new Promise((r) => setTimeout(r, 900)); else await api('encargo', { depto: 'contenido', tema: t }); setT(''); setSt('Listo. Lo tienes abajo para revisarlo.'); } catch (er) { setSt(er.message); }
  }
  const visitas = metrica(o, 'web')?.paginas?.filter((p) => p.ruta.startsWith('/blog')).reduce((a, p) => a + p.vistas, 0);
  return (
    <div className="vista">
      <div className="cx-stats">
        <Stat t="Artículos" v={fmt(piezas.length)} sub="escritos por tu agente" />
        <Stat t="Por revisar" v={fmt(piezas.filter(pendiente).length)} sub="esperan tu visto bueno" />
        <Stat t="Visitas al blog" v={visitas != null ? fmt(visitas) : '—'} sub={visitas != null ? 'últimos 28 días' : 'conecta Google Analytics'} />
        <Stat t="Publicación" v={wp ? 'Automática' : 'Manual'} sub={wp ? 'en tu WordPress' : 'conecta WordPress'} />
      </div>
      <form className="cx-comp" onSubmit={pedir}><FileText /><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Pide un artículo. Ej.: cómo cuidar el pelo teñido en verano" aria-label="Tema del artículo" /><button className="btn btn--pri btn--sm"><Sparkles size={14} /> Pedir artículo</button></form>
      {st && <p className="cx-nota">{st}</p>}
      <Panel titulo="Artículos" sub={`${piezas.length}`} cuerpo={false}>
        {piezas.length ? piezas.map((e) => <Articulo key={e.id} e={e} o={o} />) : <Vacio icono={FileText}>Cada mes tu agente escribe un artículo. También puedes pedirle uno ahora.</Vacio>}
      </Panel>
    </div>
  );
}

// ---------------- Reseñas (Google) ----------------
const autorDe = (e) => (e.texto.match(/ de ([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?: [A-ZÁÉÍÓÚÑ]\.?)?)/) || [])[1] || 'Cliente';
export function Resenas({ o }) {
  const [tab, setTab] = useState('todas'); const [st, setSt] = useState(''); const [n, setN] = useState(8);
  const res = o.eventos.filter((e) => e.depto === 'google' && e.detalle?.estrellas);
  const media = res.length ? res.reduce((a, e) => a + e.detalle.estrellas, 0) / res.length : null;
  const dist = [5, 4, 3, 2, 1].map((n) => [n, res.filter((e) => e.detalle.estrellas === n).length]);
  const mes = inicioMes(o); const esteMes = res.filter((e) => new Date(e.creado) >= mes).length;
  const pend = res.filter(pendiente);
  const conectado = conectada(o, 'google_business');
  const aj = ajustesDe('google', o.deptos.find((d) => d.depto === 'google')?.ajustes);
  const msg = `¡Gracias por venir a ${o.negocio.nombre}! Si te ha gustado, nos ayudas muchísimo dejándonos una reseña en Google: ${aj.enlace_resenas || '[tu enlace]'}`;
  const lista = tab === 'pend' ? pend : tab === 'buenas' ? res.filter((e) => e.detalle.estrellas >= 4) : tab === 'malas' ? res.filter((e) => e.detalle.estrellas <= 3) : res;
  return (
    <div className="vista">
      {!conectado && <p className="banda-prueba"><Star size={17} /><span>Conecta tu <b>Perfil de Empresa de Google</b> para que tu agente responda tus reseñas.</span><button className="btn btn--sec btn--sm" onClick={() => o.ir('conexiones')}>Conectar</button></p>}
      <div className="cx-stats">
        <Stat t="Nota media" v={media ? fmt(media, 1) : '—'} u="/ 5" sub="de las reseñas respondidas" />
        <Stat t="Respondidas" v={fmt(res.length)} sub="desde que empezó tu agente" />
        <Stat t="Este mes" v={fmt(esteMes)} sub="reseñas nuevas" />
        <Stat t="Por revisar" v={fmt(pend.length)} sub="respuestas que esperan tu visto bueno" />
      </div>
      <div className="cx-grid cx-grid--12">
        <div className="cx-grid">
          <Panel titulo="Distribución">
            <div className="cx-nota-g"><b>{media ? fmt(media, 1) : '—'}</b><div><span className="cx-estr">{'★★★★★'.slice(0, Math.round(media || 0))}<i>{'★★★★★'.slice(Math.round(media || 0))}</i></span><small className="muted">{fmt(res.length)} reseñas</small></div></div>
            <div className="cx-bars" style={{ marginTop: 14 }}>{dist.map(([n, c]) => <Barra key={n} t={`${n} ★`} v={c} max={Math.max(1, res.length)} c="#e0a100" etiqueta={`${fmt(c)} · ${res.length ? Math.round((c / res.length) * 100) : 0} %`} />)}</div>
          </Panel>
          <Panel icono={Link2} titulo="Consigue más reseñas" pie={aj.enlace_resenas ? <><button className="btn btn--pri btn--sm" onClick={() => copiar(msg).then(() => setSt('Copiado'))}><Copy size={13} /> Copiar mensaje</button><button className="btn btn--sec btn--sm" onClick={() => copiar(aj.enlace_resenas).then(() => setSt('Copiado'))}>Solo el enlace</button>{st && <small className="muted">{st}</small>}</> : null}>
            {aj.enlace_resenas ? <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{msg}</p>
              : <p className="muted" style={{ margin: 0, fontSize: 13 }}>Pon tu enlace para pedir reseñas en los ajustes del departamento y aquí tendrás el mensaje listo para mandar a tus clientes.</p>}
          </Panel>
        </div>
        <section className="cx">
          <div style={{ padding: '0 8px' }}><Tabs val={tab} set={setTab} op={[['todas', 'Todas', res.length], ['pend', 'Por revisar', pend.length], ['buenas', '4–5 ★', res.filter((e) => e.detalle.estrellas >= 4).length], ['malas', '3 ★ o menos', res.filter((e) => e.detalle.estrellas <= 3).length]]} /></div>
          {lista.length ? lista.slice(0, n).map((e) => (
            <article key={e.id} className="cx-rev">
              <header><span className="cx-rev__av">{autorDe(e)[0]}</span><div><b>{autorDe(e)}</b><small><span className="cx-estr">{'★'.repeat(e.detalle.estrellas)}<i>{'★'.repeat(5 - e.detalle.estrellas)}</i></span> · {hace(e.creado)}</small></div>
                {pendiente(e) ? <span className="cx-st is-aviso"><i />Por revisar</span> : <span className="cx-st is-ok"><i />Respondida</span>}</header>
              {e.detalle.original && <blockquote>«{e.detalle.original}»</blockquote>}
              {e.detalle.texto && <div className="cx-rev__r"><b>{pendiente(e) ? 'Respuesta propuesta' : 'Tu respuesta'}</b>{e.detalle.texto}</div>}
              {pendiente(e) && <div className="cx-row"><button className="btn btn--pri btn--sm" onClick={() => decidirPieza(o, e, 'aprobar', e.detalle.texto)}><Check size={13} /> Publicar respuesta</button><button className="btn btn--sec btn--sm" onClick={() => o.ir('bandeja')}>Editarla</button></div>}
            </article>
          )) : <Vacio icono={Star}>No hay reseñas en esta vista.</Vacio>}
          {lista.length > n && <footer className="cx__f"><button className="btn btn--sec btn--sm" onClick={() => setN(n + 12)}>Ver más ({lista.length - n})</button></footer>}
        </section>
      </div>
    </div>
  );
}

// ---------------- SEO y competencia ----------------
function GraficoLineas({ serie }) {
  const W = 640; const H = 190; const P = { l: 34, r: 34, t: 10, b: 22 };
  const n = serie.length; if (n < 2) return null;
  const mxC = Math.max(1, ...serie.map((x) => x.clics)); const mxI = Math.max(1, ...serie.map((x) => x.impresiones));
  const X = (i) => P.l + (i / (n - 1)) * (W - P.l - P.r); const Y = (v, m) => P.t + (1 - v / m) * (H - P.t - P.b);
  const linea = (k, m) => serie.map((x, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(x[k], m).toFixed(1)}`).join('');
  const area = `${linea('clics', mxC)}L${X(n - 1)},${H - P.b}L${X(0)},${H - P.b}Z`;
  const f = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return (
    <svg className="cx-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Clics e impresiones por día">
      {[0, 0.5, 1].map((p) => <g key={p}><line x1={P.l} x2={W - P.r} y1={Y(mxC * p, mxC)} y2={Y(mxC * p, mxC)} stroke="var(--linea)" /><text x={P.l - 6} y={Y(mxC * p, mxC) + 4} textAnchor="end">{fmt(mxC * p)}</text><text x={W - P.r + 6} y={Y(mxI * p, mxI) + 4}>{fmt(mxI * p)}</text></g>)}
      <path d={area} fill="var(--acento)" opacity=".08" />
      <path d={linea('impresiones', mxI)} fill="none" stroke="#9aa3b5" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      <path d={linea('clics', mxC)} fill="none" stroke="var(--acento)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {[0, Math.floor((n - 1) / 2), n - 1].map((i) => <text key={i} x={X(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{f(serie[i].fecha)}</text>)}
    </svg>
  );
}
function Dispersion({ puntos }) {
  const W = 360; const H = 250; const P = { l: 30, r: 12, t: 14, b: 26 };
  const mxR = Math.max(10, ...puntos.map((p) => p.resenas || 0)) * 1.1; const mnN = Math.min(3.5, ...puntos.map((p) => p.nota || 5)); const mxN = 5;
  const X = (r) => P.l + (r / mxR) * (W - P.l - P.r); const Y = (nn) => P.t + (1 - (nn - mnN) / (mxN - mnN)) * (H - P.t - P.b);
  return (
    <svg className="cx-scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Nota frente a número de reseñas">
      {[mnN, (mnN + mxN) / 2, mxN].map((v) => <g key={v}><line x1={P.l} x2={W - P.r} y1={Y(v)} y2={Y(v)} stroke="var(--linea)" /><text x={P.l - 6} y={Y(v) + 4} textAnchor="end">{fmt(v, 1)}</text></g>)}
      <text x={W - P.r} y={H - 6} textAnchor="end">Reseñas en Google →</text>
      {puntos.filter((p) => p.nota != null).map((p) => (
        <g key={p.id}><circle cx={X(p.resenas || 0)} cy={Y(p.nota)} r={p.tu ? 7 : 5} fill={p.tu ? 'var(--acento)' : '#9aa3b5'} stroke="var(--carta)" strokeWidth="2" />
          <text x={X(p.resenas || 0) + 9} y={Y(p.nota) + 4} style={{ fill: p.tu ? 'var(--tinta)' : undefined, fontWeight: p.tu ? 600 : 400 }}>{p.nombre.length > 18 ? `${p.nombre.slice(0, 17)}…` : p.nombre}</text></g>
      ))}
    </svg>
  );
}
export function Seo({ o }) {
  const g = metrica(o, 'google_busqueda'); const [st, setSt] = useState(''); const [nuevo, setNuevo] = useState({ nombre: '', web: '' }); const [abrir, setAbrir] = useState(false);
  const mias = o.eventos.map((e) => (e.depto === 'google' ? e.detalle?.estrellas : null)).filter(Boolean); const miNota = mias.length ? mias.reduce((a, b) => a + b, 0) / mias.length : null;
  async function buscar() { setSt('Buscando tu competencia en Google Maps…'); try { if (o.demo) { await new Promise((r) => setTimeout(r, 900)); setSt('En la demo ya tienes la competencia de ejemplo.'); } else { await api('competencia', { op: 'buscar' }); window.location.reload(); } } catch (e) { setSt(e.message); } }
  async function anadir(e) { e.preventDefault(); try { const c = o.demo ? { id: uid('k'), ...nuevo } : (await api('competencia', { op: 'anadir', ...nuevo })).competidor; o.setEstado((s) => ({ ...s, competidores: [...s.competidores, c] })); setNuevo({ nombre: '', web: '' }); setAbrir(false); } catch (er) { setSt(er.message); } }
  async function quitar(id) { if (!o.demo) await api('competencia', { op: 'quitar', id }).catch(() => {}); o.setEstado((s) => ({ ...s, competidores: s.competidores.filter((c) => c.id !== id) })); }

  const k = useMemo(() => {
    if (!g) return null;
    const s = g.serie || []; const m = Math.floor(s.length / 2); const a = s.slice(m); const b = s.slice(0, m);
    const clics = suma(s, 'clics'); const imp = suma(s, 'impresiones'); const bq = g.busquedas || [];
    const pos = bq.length ? bq.reduce((x, y) => x + y.posicion * y.impresiones, 0) / Math.max(1, suma(bq, 'impresiones')) : null;
    const tramos = [['Top 3', (p) => p <= 3, '#16a34a'], ['4–10', (p) => p > 3 && p <= 10, '#0047ff'], ['11–20', (p) => p > 10 && p <= 20, '#e5a100'], ['Más de 20', (p) => p > 20, '#9aa3b5']]
      .map(([t, f, c]) => ({ t, c, n: bq.filter((x) => f(x.posicion)).length }));
    const oport = bq.filter((x) => x.posicion > 3 && x.posicion <= 15).sort((x, y) => y.impresiones - x.impresiones).slice(0, 4);
    return { clics, imp, ctr: imp ? clics / imp : 0, pos, dClics: delta(suma(a, 'clics'), suma(b, 'clics')), dImp: delta(suma(a, 'impresiones'), suma(b, 'impresiones')), tramos, oport, bq };
  }, [g]);
  const comp = [...(miNota != null ? [{ id: 'tu', tu: true, nombre: `${o.negocio.nombre} (tú)`, nota: miNota, resenas: mias.length, web: null }] : []), ...o.competidores].sort((a, b) => (b.nota || 0) - (a.nota || 0));
  const mediaComp = o.competidores.filter((c) => c.nota != null); const notaComp = mediaComp.length ? mediaComp.reduce((a, c) => a + c.nota, 0) / mediaComp.length : null;
  const mxRes = Math.max(1, ...comp.map((c) => c.resenas || 0));
  return (
    <div className="vista">
      <Cabecera titulo="SEO y competencia" sub="Cómo te encuentran en Google y cómo estás frente a los negocios de tu zona." />
      {k ? (<>
        <div className="cx-stats">
          <Stat t="Clics desde Google" v={fmt(k.clics)} d={k.dClics} sub="28 días · vs. 14 días anteriores" serie={g.serie.map((x) => x.clics)} />
          <Stat t="Impresiones" v={fmt(k.imp)} d={k.dImp} sub="veces que sales en Google" serie={g.serie.map((x) => x.impresiones)} color="#9aa3b5" />
          <Stat t="CTR" v={fmt(k.ctr * 100, 1)} u="%" sub="de los que te ven, entran" />
          <Stat t="Posición media" v={k.pos ? fmt(k.pos, 1) : '—'} sub="ponderada por impresiones" />
          <Stat t="Búsquedas en top 3" v={fmt(k.tramos[0].n)} u={`/ ${k.bq.length}`} sub="de tus búsquedas principales" />
        </div>
        <div className="cx-grid cx-grid--21">
          <Panel titulo="Clics e impresiones" sub="por día" extra={<span className="cx-legend"><span><i style={{ '--c': 'var(--acento)' }} />Clics</span><span><i style={{ '--c': '#9aa3b5' }} />Impresiones</span></span>}><GraficoLineas serie={g.serie} /></Panel>
          <Panel titulo="Dónde sales">
            <div className="cx-stack">{k.tramos.filter((t) => t.n).map((t) => <span key={t.t} style={{ background: t.c, flex: t.n }} title={`${t.t}: ${t.n}`}>{t.n}</span>)}</div>
            <div className="cx-bars" style={{ marginTop: 14 }}>{k.tramos.map((t) => <Barra key={t.t} t={t.t.startsWith('M') ? t.t : `Posición ${t.t}`} v={t.n} max={k.bq.length} c={t.c} etiqueta={`${t.n} ${t.n === 1 ? 'búsqueda' : 'búsquedas'}`} />)}</div>
          </Panel>
        </div>
        <div className="cx-grid cx-grid--21">
          <section className="cx">
            <header className="cx__h"><Search /><h2>Búsquedas que te traen clientes</h2><small>últimos 28 días</small></header>
            <div className="cx-scroll"><table className="cx-table"><thead><tr><th>Búsqueda</th><th className="num">Clics</th><th className="num">Impresiones</th><th className="num">CTR</th><th className="num">Posición</th></tr></thead>
              <tbody>{k.bq.map((b) => <tr key={b.q}><td>{b.q}</td><td className="num"><b>{fmt(b.clics)}</b></td><td className="num">{fmt(b.impresiones)}</td><td className="num">{fmt((b.clics / Math.max(1, b.impresiones)) * 100, 1)} %</td><td className="num"><span className={`cx-pos ${b.posicion <= 3 ? 'is-top' : b.posicion <= 10 ? 'is-ok' : 'is-lejos'}`}>{fmt(b.posicion, 1)}</span></td></tr>)}</tbody></table></div>
          </section>
          <Panel titulo="Oportunidades" sub="cerca del top 3" cuerpo={false}>
            {k.oport.length ? k.oport.map((b) => <div key={b.q} className="cx-op"><b>{b.q}</b><small>Posición {fmt(b.posicion, 1)} con {fmt(b.impresiones)} impresiones y {fmt(b.clics)} clics. Subir al top 3 es donde más clics puedes ganar.</small></div>)
              : <Vacio icono={Check}>No hay búsquedas entre la posición 4 y la 15.</Vacio>}
            {o.deptos.some((d) => d.depto === 'contenido') && k.oport[0] && <div className="cx__f"><button className="btn btn--sec btn--sm" onClick={() => o.ir('articulos')}><FileText size={13} /> Pedir un artículo sobre «{k.oport[0].q}»</button></div>}
          </Panel>
        </div>
      </>) : (
        <section className="cx"><Vacio icono={Search}><b style={{ color: 'var(--tinta)', fontSize: 14 }}>Conecta Search Console</b>Verás por qué búsquedas te encuentran en Google, en qué posición sales, tu CTR y dónde tienes oportunidades.<button className="btn btn--pri btn--sm" onClick={() => o.ir('conexiones')}>Conectar <ArrowRight size={13} /></button></Vacio></section>
      )}

      <div className="cx-stats">
        <Stat t="Competidores vigilados" v={fmt(o.competidores.length)} sub="en tu zona" />
        <Stat t="Tu nota" v={miNota != null ? fmt(miNota, 1) : '—'} u="★" sub="de las reseñas respondidas" />
        <Stat t="Media de la competencia" v={notaComp != null ? fmt(notaComp, 1) : '—'} u="★" sub="en Google Maps" />
        <Stat t="Tu posición por nota" v={miNota != null && comp.length ? `${comp.findIndex((c) => c.tu) + 1}º` : '—'} u={comp.length ? `de ${comp.length}` : ''} sub="entre los negocios comparados" />
      </div>
      <div className="cx-grid cx-grid--21">
        <section className="cx">
          <header className="cx__h"><Users /><h2>Tu competencia</h2><small>ordenada por nota</small><span className="cx-sp" /><button className="btn btn--sec btn--sm" onClick={() => setAbrir(!abrir)}><Plus size={13} /> Añadir</button><button className="btn btn--pri btn--sm" onClick={buscar}><RefreshCw size={13} /> Buscar en Maps</button></header>
          {abrir && <form className="cx-row" style={{ padding: '10px 14px', borderBottom: '1px solid var(--linea)' }} onSubmit={anadir}><input className="cx-in" required value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nombre del negocio" aria-label="Nombre" /><input className="cx-in" value={nuevo.web} onChange={(e) => setNuevo({ ...nuevo, web: e.target.value })} placeholder="Su web (opcional)" aria-label="Web" /><button className="btn btn--pri btn--sm">Añadir</button></form>}
          {st && <p className="cx-nota" style={{ padding: '0 14px' }}>{st}</p>}
          {comp.length ? (
            <div className="cx-scroll"><table className="cx-table"><thead><tr><th>Negocio</th><th>Nota</th><th>Reseñas</th><th>Qué publica</th><th /></tr></thead>
              <tbody>{comp.map((c) => (
                <tr key={c.id} className={c.tu ? 'is-tu' : ''}>
                  <td><b>{c.nombre}</b>{c.web && <><br /><a className="enlace" href={c.web.startsWith('http') ? c.web : `https://${c.web}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{c.web.replace(/^https?:\/\//, '')} <ExternalLink size={11} /></a></>}</td>
                  <td className="num">{c.nota != null ? <span className="cx-estr" style={{ color: 'var(--tinta)' }}>{fmt(c.nota, 1)} <span style={{ color: '#e0a100' }}>★</span></span> : '—'}</td>
                  <td style={{ minWidth: 120 }}>{c.resenas != null ? <div className="cx-bar" style={{ '--c': c.tu ? 'var(--acento)' : '#9aa3b5' }}><span>{fmt(c.resenas)}{c.tu ? ' respondidas' : ''}</span><b /><i><s style={{ width: `${(c.resenas / mxRes) * 100}%` }} /></i></div> : '—'}</td>
                  <td className="muted" style={{ fontSize: 12.5, maxWidth: 260 }}>{c.datos?.publica || (c.tu ? 'Lo que prepara tu agente de Redes' : '—')}</td>
                  <td>{!c.tu && <button className="ico" onClick={() => quitar(c.id)} aria-label={`Quitar ${c.nombre}`}><X size={14} /></button>}</td>
                </tr>
              ))}</tbody></table></div>
          ) : <Vacio icono={Users}>Pulsa «Buscar en Maps» y tu agente encontrará los negocios como el tuyo de tu zona, con su nota y sus reseñas.</Vacio>}
        </section>
        <Panel titulo="Nota y reseñas" sub="tú frente a tu zona">{comp.some((c) => c.nota != null) ? <Dispersion puntos={comp} /> : <Vacio>Sin datos todavía.</Vacio>}</Panel>
      </div>
    </div>
  );
}

// ---------------- Chat con tu equipo (toda la oficina o cada departamento) ----------------
const SUG = {
  null: ['¿Qué habéis hecho hoy?', '¿Qué tengo pendiente?', 'Resúmeme la semana'],
  atencion: ['¿Qué han preguntado más hoy?', '¿Hay algún cliente esperando?', '¿Qué no has sabido contestar?'],
  citas: ['¿Qué citas tengo mañana?', '¿Hay huecos libres esta semana?', '¿Cuántas citas se han anulado?'],
  ventas: ['¿Qué presupuestos siguen abiertos?', '¿A quién hay que hacer seguimiento?', '¿Cuánto hay en juego?'],
  redes: ['Hazme un carrusel sobre la oferta de esta semana', 'Prepárame un reel sobre el servicio estrella', '¿Qué se publica esta semana?'],
  google: ['¿Cómo van las reseñas?', '¿Hay alguna mala sin responder?', '¿Cuál es mi nota media?'],
  contenido: ['Escribe un artículo sobre la pregunta más repetida', '¿Qué artículo toca este mes?', '¿Qué búsquedas atacamos?'],
};
function demoDepto(o, depto, x) {
  if (!depto) return respuestaDemo(o, x);
  const n = o.eventos.filter((e) => e.depto === depto);
  const hoy = n.filter((e) => new Date(e.creado).toDateString() === new Date().toDateString()).length;
  if (/post|carrusel|reel|vídeo|video|historia|artículo|articulo/i.test(x)) return '¡Me pongo con ello! En unos minutos lo tienes en «Te necesitan» para revisarlo. (En la demo no se crea de verdad.)';
  return `Hoy llevo ${hoy} tareas en ${DEPTO[depto].nombre} y ${n.filter((e) => pendiente(e)).length} cosas esperando tu visto bueno. ${depto === 'citas' ? `Tienes ${o.citas.filter((c) => c.estado !== 'cancelada' && c.fecha && new Date(c.fecha) > Date.now()).length} citas próximas.` : depto === 'ventas' ? `Hay ${o.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa)).length} clientes potenciales abiertos.` : ''}`;
}
function Hilo({ depto, on, ultimo, ir }) {
  const info = depto ? DEPTO[depto] : null;
  return (
    <li><button className={`cx-hilo ${on ? 'is-on' : ''}`} onClick={ir} aria-current={on || undefined}>
      {info ? <span className="cx-hilo__av" style={{ '--c': info.color, background: 'none', padding: 0 }}><Avatar depto={depto} size={32} /><i /></span> : <span className="cx-hilo__av"><Sparkles /><i /></span>}
      <div><b>{info ? info.nombre : 'Toda la oficina'}</b><small>{ultimo ? `${ultimo.de === 'tu' ? 'Tú: ' : ''}${ultimo.texto}` : info ? 'Habla solo con este agente' : 'Todo el equipo a la vez'}</small></div>
      {ultimo && <time>{hora(ultimo.creado)}</time>}
    </button></li>
  );
}
export function ChatEquipo({ o }) {
  const [hilo, setHilo] = useState(null); const [t, setT] = useState(''); const [esc, setEsc] = useState(false); const [err, setErr] = useState(''); const fin = useRef(null);
  const msgs = o.chat.filter((m) => (m.depto || null) === hilo);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, esc, hilo]);
  const ultimo = (d) => [...o.chat].reverse().find((m) => (m.depto || null) === d);
  const info = hilo ? DEPTO[hilo] : null;
  async function enviar(e, x0) {
    e?.preventDefault(); const x = (x0 ?? t).trim(); if (!x || esc) return; setT(''); setErr(''); setEsc(true); const d = hilo;
    o.setEstado((s) => ({ ...s, chat: [...s.chat, { id: uid('t'), de: 'tu', depto: d, texto: x, creado: new Date().toISOString() }] }));
    try {
      const r = o.demo ? (await new Promise((ok) => setTimeout(ok, 1000)), { respuesta: demoDepto(o, d, x) }) : await api('equipo', { texto: x, depto: d });
      o.setEstado((s) => ({ ...s, chat: [...s.chat, { id: uid('e'), de: 'equipo', depto: d, texto: r.respuesta, detalle: r.accion ? { accion: r.accion } : {}, creado: new Date().toISOString() }] }));
    } catch (er) { setErr(er.message); }
    setEsc(false);
  }
  const Av = ({ s = 26 }) => (hilo ? <Avatar depto={hilo} size={s} /> : <span className="cx-hilo__av" style={{ width: s, height: s }}><Sparkles /></span>);
  return (
    <div className="vista">
      <Cabecera titulo="Chat con tu equipo" sub="Habla con toda la oficina o con cada departamento por separado. Contestan con los datos reales." />
      <section className="cx-chat">
        <aside className="cx-chat__l"><header>Conversaciones</header>
          <ul>
            <Hilo depto={null} on={!hilo} ultimo={ultimo(null)} ir={() => setHilo(null)} />
            {o.deptos.map(({ depto }) => <Hilo key={depto} depto={depto} on={hilo === depto} ultimo={ultimo(depto)} ir={() => setHilo(depto)} />)}
          </ul>
        </aside>
        <div className="cx-chat__r">
          <header className="cx-chat__h"><Av s={34} /><div><b>{info ? info.nombre : 'Toda la oficina'}</b><small>{info ? `Agente de ${info.corto} · en línea` : `${o.deptos.length} agentes · en línea`}</small></div></header>
          <div className="cx-chat__m" aria-live="polite">
            {!msgs.length && <div className="cx-chat__hola"><Av s={44} /><b>{info ? `Hola, soy tu agente de ${info.corto}` : '¿En qué te ayudamos?'}</b><span>{info ? info.que : 'Pregunta cómo va todo o encarga un post, un artículo o un vídeo.'}</span></div>}
            {msgs.map((m) => (
              <div key={m.id} className={`cx-msg cx-msg--${m.de === 'tu' ? 'tu' : 'equipo'}`}>
                {m.de !== 'tu' && <Av />}
                <div><div className="cx-msg__b">{m.texto}</div>{m.detalle?.accion && <span className="cx-msg__acc"><Check size={13} /> Encargo en marcha: {m.detalle.accion.tipo} sobre «{m.detalle.accion.tema}»</span>}</div>
                <time>{hora(m.creado)}</time>
              </div>
            ))}
            {esc && <div className="cx-msg cx-msg--equipo"><Av /><div className="cx-msg__b"><Puntos /></div></div>}
            <div ref={fin} />
          </div>
          <div className="cx-chat__sug">{(SUG[hilo] || SUG.null).map((s) => <button key={s} onClick={() => enviar(null, s)}>{s}</button>)}</div>
          <form className="cx-chat__in" onSubmit={enviar}><input value={t} onChange={(e) => setT(e.target.value)} placeholder={info ? `Escribe a ${info.corto}…` : 'Escribe a tu equipo…'} aria-label="Mensaje" /><button className="btn btn--pri" disabled={esc} aria-label="Enviar"><Send size={15} /></button></form>
          {err && <p className="error" style={{ padding: '0 16px 10px', margin: 0 }}>{err}</p>}
        </div>
      </section>
    </div>
  );
}

// ---------------- Tu CRM: conectar el programa que ya usa el negocio ----------------
// Directo = conexión propia con token. El resto entra por webhook (Zapier, Make, n8n o la API del programa) o lo conectamos nosotros.
const CRMS = [
  { id: 'hubspot', n: 'HubSpot', web: 'hubspot.com', s: 'general', c: '#ff7a59', directo: true, d: 'CRM general' },
  { id: 'pipedrive', n: 'Pipedrive', web: 'pipedrive.com', s: 'general', c: '#1a1a1a', directo: true, d: 'CRM de ventas' },
  { id: 'salesforce', n: 'Salesforce', web: 'salesforce.com', s: 'general', c: '#00a1e0', d: 'CRM general' },
  { id: 'zoho', n: 'Zoho CRM', web: 'zoho.com', s: 'general', c: '#e42527', d: 'CRM general' },
  { id: 'clientify', n: 'Clientify', web: 'clientify.com', s: 'general', c: '#1e4bd2', d: 'CRM y marketing' },
  { id: 'holded', n: 'Holded', web: 'holded.com', s: 'general', c: '#ff5a5f', d: 'Gestión y CRM' },
  { id: 'odoo', n: 'Odoo', web: 'odoo.com', s: 'general', c: '#714b67', d: 'ERP y CRM' },
  { id: 'booksy', n: 'Booksy', web: 'booksy.com', s: 'belleza', c: '#00a3ad', d: 'Peluquería y estética' },
  { id: 'treatwell', n: 'Treatwell', web: 'treatwell.es', s: 'belleza', c: '#ff5c39', d: 'Peluquería y estética' },
  { id: 'koibox', n: 'Koibox', web: 'koibox.es', s: 'belleza', c: '#6c4ce0', d: 'Peluquería y estética' },
  { id: 'flowww', n: 'Flowww', web: 'flowww.es', s: 'belleza', c: '#e6007e', d: 'Centros de belleza' },
  { id: 'fresha', n: 'Fresha', web: 'fresha.com', s: 'belleza', c: '#101928', d: 'Peluquería y estética' },
  { id: 'gesden', n: 'Gesden', web: 'gesden.es', s: 'salud', c: '#0072bc', d: 'Clínicas dentales' },
  { id: 'clinic_cloud', n: 'Clinic Cloud', web: 'clinic-cloud.com', s: 'salud', c: '#00a6a6', d: 'Clínicas' },
  { id: 'dentalink', n: 'Dentalink', web: 'softwaredentalink.com', s: 'salud', c: '#2d6cdf', d: 'Clínicas dentales' },
  { id: 'pabau', n: 'Pabau', web: 'pabau.com', s: 'salud', c: '#4b3cc4', d: 'Clínicas y estética' },
  { id: 'cliniko', n: 'Cliniko', web: 'cliniko.com', s: 'salud', c: '#2f8f5b', d: 'Fisioterapia y consultas' },
  { id: 'gesvision', n: 'Gesvision', web: 'gesvision.com', s: 'optica', c: '#003b71', d: 'Ópticas' },
  { id: 'trainingym', n: 'Trainingym', web: 'trainingym.com', s: 'fitness', c: '#ff3c00', d: 'Gimnasios' },
  { id: 'virtuagym', n: 'Virtuagym', web: 'virtuagym.com', s: 'fitness', c: '#1d9bf0', d: 'Gimnasios y entrenadores' },
  { id: 'crosshero', n: 'CrossHero', web: 'crosshero.com', s: 'fitness', c: '#e53935', d: 'Box y centros de fitness' },
  { id: 'bsport', n: 'bsport', web: 'bsport.io', s: 'fitness', c: '#111827', d: 'Yoga y pilates' },
  { id: 'eversports', n: 'Eversports', web: 'eversports.com', s: 'fitness', c: '#00b67a', d: 'Estudios y clases' },
  { id: 'inmovilla', n: 'Inmovilla', web: 'inmovilla.com', s: 'inmo', c: '#e30613', d: 'Inmobiliarias' },
  { id: 'witei', n: 'Witei', web: 'witei.com', s: 'inmo', c: '#1f6feb', d: 'Inmobiliarias' },
  { id: 'covermanager', n: 'CoverManager', web: 'covermanager.com', s: 'hosteleria', c: '#ef4444', d: 'Reservas de restaurante' },
  { id: 'thefork', n: 'TheFork Manager', web: 'theforkmanager.com', s: 'hosteleria', c: '#00665c', d: 'Reservas de restaurante' },
];
const SECTORES = [['todos', 'Todos'], ['general', 'Generales'], ['belleza', 'Belleza'], ['salud', 'Clínicas'], ['optica', 'Ópticas'], ['fitness', 'Gimnasios'], ['inmo', 'Inmobiliarias'], ['hosteleria', 'Restaurantes']];
const SVG_CRM = { hubspot: siHubspot, salesforce: siSalesforce, zoho: siZoho, odoo: siOdoo };
// Logo de cada programa: icono de marca (simple-icons) o el icono oficial de su web; si no carga, sus iniciales.
function LogoCrm({ c }) {
  const [mal, setMal] = useState(false); const ic = SVG_CRM[c.id];
  if (ic) return <span className="cx-crmc__l is-logo"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={ic.path} fill={`#${ic.hex}`} /></svg></span>;
  if (c.web && !mal) return <span className="cx-crmc__l is-logo"><img src={`https://www.google.com/s2/favicons?domain=${c.web}&sz=64`} alt="" width="22" height="22" loading="lazy" onError={() => setMal(true)} onLoad={(e) => { if (e.currentTarget.naturalWidth < 32) setMal(true); }} /></span>;
  return <span className="cx-crmc__l" style={{ '--c': c.c }}>{iniciales(c.n)}</span>;
}
const iniciales = (n) => n.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export function Crm({ o }) {
  const [sector, setSector] = useState('todos'); const [sel, setSel] = useState(null); const [estado, setEstado] = useState(null); const [form, setForm] = useState({ token: '', url: '' });
  const [st, setSt] = useState(''); const [ocupado, setOcupado] = useState(false); const [q, setQ] = useState('');
  useEffect(() => {
    if (o.demo) { setEstado({ crm: null, entrada: 'https://agutidesigns.io/api/oficina/crm-entrada?k=demo-clave-de-ejemplo-1234' }); return; }
    api('crm', { op: 'estado' }).then(setEstado).catch(() => setEstado({ crm: null, entrada: null }));
  }, [o.demo]);
  const conectadoA = estado?.crm?.estado === 'conectada' ? estado.crm : null;
  const lista = CRMS.filter((c) => (sector === 'todos' || c.s === sector) && (!q || c.n.toLowerCase().includes(q.toLowerCase())));
  const p = sel && CRMS.find((c) => c.id === sel);
  async function conectar(e) {
    e.preventDefault(); setOcupado(true); setSt('Comprobando…');
    try {
      const proveedor = p.directo ? p.id : 'webhook';
      const j = o.demo ? (await new Promise((r) => setTimeout(r, 800)), { cuenta: `${p.n} · demo`, entrada: estado.entrada }) : await api('crm', { op: 'conectar', proveedor, token: form.token, url: form.url, programa: p.directo ? '' : p.n });
      setEstado({ crm: { proveedor, estado: 'conectada', cuenta: j.cuenta, actualizado: null }, entrada: j.entrada }); setForm({ token: '', url: '' }); setSt('Conectado. A partir de ahora cada cliente potencial y cada cita irán también a tu programa.');
    } catch (er) { setSt(er.message); }
    setOcupado(false);
  }
  async function entrada() { try { const j = o.demo ? { entrada: estado.entrada } : await api('crm', { op: 'entrada' }); setEstado((s) => ({ ...s, entrada: j.entrada })); } catch (er) { setSt(er.message); } }
  async function quitar() { if (!o.demo) await api('crm', { op: 'quitar' }).catch(() => {}); setEstado({ crm: null, entrada: null }); setSt(''); }
  async function probar() { setSt('Enviando un contacto de prueba…'); try { if (!o.demo) await api('crm', { op: 'probar' }); setSt('Enviado. Busca «Prueba Oficina de IA» en tu programa (puedes borrarlo).'); } catch (er) { setSt(er.message); } }
  async function ayuda() { setSt('…'); try { if (!o.demo) await api('ayuda', { herramienta: p?.n || 'CRM', mensaje: `Quiere conectar su programa: ${p?.n || 'otro'}` }); setSt('Hecho. Te escribimos en menos de 24 h laborables para conectarlo contigo.'); } catch (er) { setSt(er.message); } }
  return (
    <div className="vista">
      <Cabecera titulo="Tu CRM" sub="No sustituimos tu programa de gestión: lo conectamos. Lo que consiguen tus agentes llega a tu CRM y lo que apuntas en él, a tus agentes." />
      <div className="cx-flujo">
        <div><Sparkles /><b>Tus agentes consiguen</b><small>Clientes potenciales y citas por WhatsApp y por el chat de tu web.</small></div>
        <div><ArrowRight /><b>Llegan a tu programa</b><small>Se crean como contacto, oportunidad o cita en tu CRM, al momento.</small></div>
        <div><RefreshCw /><b>Y al revés</b><small>Las citas y clientes que apuntas en tu programa los conocen tus agentes para recordar y hacer seguimiento.</small></div>
      </div>
      {conectadoA && (
        <section className="cx">
          <header className="cx__h"><Plug /><h2>Conectado</h2><span className="cx-st is-ok"><i />Activo</span><span className="cx-sp" /><button className="btn btn--sec btn--sm" onClick={probar}>Enviar prueba</button><button className="btn btn--fan btn--sm" onClick={quitar}><Trash2 size={13} /> Desconectar</button></header>
          <div className="cx__b"><p style={{ margin: 0, fontSize: 13.5 }}><b>{conectadoA.cuenta}</b> <span className="muted">· {conectadoA.proveedor === 'webhook' ? 'por webhook' : 'conexión directa'}{conectadoA.actualizado ? ` · último envío ${hace(conectadoA.actualizado)}` : ''}</span></p></div>
        </section>
      )}
      <div className="cx-grid cx-grid--21">
        <section className="cx">
          <header className="cx__h"><h2>Elige tu programa</h2><span className="cx-sp" /><input className="cx-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" aria-label="Buscar programa" style={{ maxWidth: 180 }} /></header>
          <div style={{ padding: '0 8px' }}><Tabs val={sector} set={setSector} op={SECTORES.map(([k, t]) => [k, t])} /></div>
          <div className="cx__b"><div className="cx-crm">
            {lista.map((c) => (
              <button key={c.id} className={`cx-crmc ${sel === c.id ? 'is-on' : ''}`} onClick={() => { setSel(c.id); setSt(''); }}>
                <LogoCrm c={c} /><div><b>{c.n}</b><small>{c.d}</small></div>
                {c.directo ? <span className="cx-st is-azul">Directa</span> : <span className="cx-st">Webhook</span>}
              </button>
            ))}
            <button className={`cx-crmc ${sel === 'otro' ? 'is-on' : ''}`} onClick={() => { setSel('otro'); setSt(''); }}><span className="cx-crmc__l" style={{ '--c': '#687083' }}><Plus size={16} /></span><div><b>Otro</b><small>Lo conectamos contigo</small></div><span className="cx-st">Webhook</span></button>
          </div></div>
        </section>
        <section className="cx">
          <header className="cx__h">{p ? <LogoCrm c={p} /> : <Webhook />}<h2>{p ? p.n : sel === 'otro' ? 'Otro programa' : 'Cómo conectarlo'}</h2></header>
          <div className="cx__b cx-metodo">
            {!sel && <p className="muted" style={{ margin: 0, fontSize: 13 }}>Elige tu programa a la izquierda. HubSpot y Pipedrive se conectan con un token; el resto, con un webhook de Zapier, Make, n8n o de su propia API. Si no sabes hacerlo, te lo conectamos nosotros.</p>}
            {p?.directo && <form className="cx-metodo" onSubmit={conectar}>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>{p.id === 'hubspot' ? 'En HubSpot: Configuración › Integraciones › Apps privadas › Crear app con permiso de contactos (leer y escribir). Copia el token y pégalo aquí.' : 'En Pipedrive: tu foto › Preferencias personales › API. Copia tu token y pégalo aquí.'}</p>
              <label>Token de {p.n}<input type="password" autoComplete="off" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="Pega aquí tu token" required /></label>
              <button className="btn btn--pri btn--sm" disabled={ocupado} style={{ justifySelf: 'start' }}><Plug size={13} /> Conectar {p.n}</button>
            </form>}
            {sel && !p?.directo && <>
              <form className="cx-metodo" onSubmit={conectar}>
                <b style={{ fontSize: 13 }}>1. Enviar a {p ? p.n : 'tu programa'}</b>
                <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>Crea en Zapier, Make o n8n un flujo que empiece con «Webhook» y termine creando el contacto o la cita en {p ? p.n : 'tu programa'}. Pega aquí la dirección del webhook.</p>
                <label>Dirección del webhook<input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://hooks.zapier.com/…" required /></label>
                <button className="btn btn--pri btn--sm" disabled={ocupado || !(p || sel === 'otro')} style={{ justifySelf: 'start' }}>Guardar</button>
              </form>
              <div className="cx-metodo">
                <b style={{ fontSize: 13 }}>2. Recibir desde {p ? p.n : 'tu programa'}</b>
                <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>Para que tus agentes conozcan las citas y clientes que apuntas allí, manda un POST con nombre, contacto, servicio y fecha a esta dirección privada:</p>
                {estado?.entrada ? <div className="cx-code"><span>{estado.entrada}</span><button className="ico" type="button" onClick={() => copiar(estado.entrada)} aria-label="Copiar dirección"><Copy size={14} /></button></div>
                  : <button className="btn btn--sec btn--sm" type="button" onClick={entrada} style={{ justifySelf: 'start' }}>Crear mi dirección privada</button>}
              </div>
              <button className="btn btn--sec btn--sm" type="button" onClick={ayuda} style={{ justifySelf: 'start' }}>Prefiero que me lo conectéis vosotros</button>
            </>}
            {st && <p className="cx-nota" style={{ margin: 0 }}>{st}</p>}
          </div>
        </section>
      </div>
      <section className="cx"><div className="cx__b cx-row"><div style={{ flex: 1, minWidth: 220 }}><b style={{ fontSize: 13.5 }}>¿No usas ningún CRM?</b><p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>Tus agentes llevan una agenda y un embudo de clientes sencillos dentro de la oficina.</p></div>
        <button className="btn btn--sec btn--sm" onClick={() => o.ir('agenda')}>Agenda</button><button className="btn btn--sec btn--sm" onClick={() => o.ir('clientes')}>Clientes potenciales</button></div></section>
    </div>
  );
}

export { Stat, Panel, Barra, Delta, Spark, Tabs, Vacio as VacioCx };

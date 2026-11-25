// «Lo que saben tus agentes»: todo lo que usan para contestar y trabajar, por apartados.
// Datos del negocio, avisos, servicios, equipo, preguntas, condiciones, enlaces, documentos y más información.
import { useState } from 'react';
import {
  BadgeEuro, Building2, Check, ExternalLink, FileText, HelpCircle, Info, Link2, Megaphone, Pencil, Plus, Scale, Trash2, Upload, Users, X,
} from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { api } from './datos';
import { CAMPOS, uid } from './formato';
import { Probar } from './vistas';

const SECCIONES = [
  { id: 'negocio', t: 'Tu negocio', I: Building2, d: 'Lo básico: a qué te dedicas, horarios, dirección, tono y lo que nunca deben hacer.' },
  { id: 'nota', t: 'Avisos de estos días', I: Megaphone, d: 'Vacaciones, festivos, cambios de horario. Tienen prioridad sobre todo lo demás.' },
  { id: 'servicio', t: 'Servicios y precios', I: BadgeEuro, d: 'Tu catálogo: cada servicio o producto con su precio y duración.' },
  { id: 'equipo', t: 'Tu equipo', I: Users, d: 'Quién trabaja contigo y en qué está especializado cada uno.' },
  { id: 'faq', t: 'Preguntas frecuentes', I: HelpCircle, d: 'Lo que más te preguntan y cómo lo contestas tú.' },
  { id: 'politica', t: 'Condiciones', I: Scale, d: 'Cancelaciones, pagos, señales, devoluciones, garantías…' },
  { id: 'enlace', t: 'Enlaces y accesos', I: Link2, d: 'Enlaces que tus agentes pueden dar: reservas, carta, tienda, cómo llegar…' },
  { id: 'documento', t: 'Documentos', I: FileText, d: 'Catálogos, cartas, tarifas o manuales en PDF, Word o texto. Tus agentes los leen.' },
  { id: 'info', t: 'Más información', I: Info, d: 'Todo lo demás: historia, valores, zonas a las que llegas, aparcamiento…' },
];
const POLITICAS = ['Cancelaciones', 'Reservas y señal', 'Formas de pago', 'Devoluciones', 'Garantías', 'Retrasos y no presentados', 'Menores', 'Privacidad'];
const ENLACES = ['Reservar cita', 'Carta o catálogo', 'Tienda online', 'Cómo llegar', 'Formulario de contacto', 'Pagar o señal', 'Instagram', 'Dejar una reseña', 'Tarifas en PDF'];
const ACEPTA = '.pdf,.docx,.txt,.md,.csv';

// Formulario de cada tipo: campos y cómo se guardan en of_conocimiento.
const FORM = {
  nota: { campos: [['respuesta', 'Aviso', 'El sábado 6 cerramos a las 14:00', 'texto'], ['hasta', 'Válido hasta (opcional)', '', 'fecha']] },
  servicio: { campos: [['titulo', 'Servicio o producto', 'Mechas balayage'], ['precio', 'Precio', 'desde 65 €', 'dato'], ['duracion', 'Duración', '2 h', 'dato'], ['respuesta', 'Descripción (opcional)', 'Incluye lavado, tratamiento y peinado', 'texto']] },
  equipo: { campos: [['titulo', 'Nombre', 'Marta'], ['rol', 'Puesto', 'Estilista', 'dato'], ['respuesta', 'Especialidad o notas (opcional)', 'Experta en color. Trabaja de martes a sábado.', 'texto']] },
  faq: { campos: [['pregunta', 'Pregunta', '¿Se puede pagar con Bizum?'], ['respuesta', 'Respuesta', 'Sí: Bizum, tarjeta y efectivo.', 'texto']] },
  politica: { campos: [['titulo', 'Tema', 'Cancelaciones', 'sugerido', POLITICAS], ['respuesta', 'Qué dices', 'Puedes cancelar gratis hasta 24 h antes. Después se cobra la señal.', 'largo']] },
  enlace: { campos: [['titulo', 'Qué es', 'Reservar cita', 'sugerido', ENLACES], ['url', 'Enlace', 'https://…', 'url'], ['respuesta', 'Cuándo darlo (opcional)', 'Cuando alguien quiera reservar fuera de horario', 'texto']] },
  info: { campos: [['titulo', 'Título', 'Aparcamiento'], ['respuesta', 'Texto', 'Hay un parking público a 50 m, en la calle…', 'largo']] },
};

const vacio = (tipo) => Object.fromEntries((FORM[tipo]?.campos || []).map(([k]) => [k, '']));
const aFila = (tipo, f) => {
  const fila = { tipo, datos: {} };
  for (const [k, , , modo] of FORM[tipo].campos) {
    const v = String(f[k] || '').trim();
    if (modo === 'dato') { if (v) fila.datos[k] = v; } else if (modo === 'fecha') fila.hasta = v || null; else fila[k] = v || (k === 'respuesta' ? '' : null);
  }
  return fila;
};
const deFila = (k) => ({ ...k, ...(k.datos || {}), hasta: k.hasta || '' });

function Lista({ o, tipo }) {
  const [f, setF] = useState(vacio(tipo)); const [edit, setEdit] = useState(null); const [st, setSt] = useState('');
  const filas = o.conocimiento.filter((k) => k.tipo === tipo);
  async function guardar(e) {
    e.preventDefault(); const fila = aFila(tipo, f);
    if (tipo === 'enlace' && fila.url && !/^https?:\/\//i.test(fila.url)) fila.url = `https://${fila.url}`;
    if (o.demo) {
      o.setEstado((s) => ({ ...s, conocimiento: edit ? s.conocimiento.map((k) => (k.id === edit ? { ...k, ...fila } : k)) : [{ ...fila, id: uid('k'), created_at: new Date().toISOString() }, ...s.conocimiento] }));
    } else if (edit) {
      const { data, error } = await supabase.from('of_conocimiento').update(fila).eq('id', edit).select().single(); if (error) { setSt('No se ha podido guardar.'); return; }
      o.setEstado((s) => ({ ...s, conocimiento: s.conocimiento.map((k) => (k.id === edit ? data : k)) }));
    } else {
      const { data, error } = await supabase.from('of_conocimiento').insert({ ...fila, negocio_id: o.negocio.id }).select().single(); if (error) { setSt('No se ha podido guardar.'); return; }
      o.setEstado((s) => ({ ...s, conocimiento: [data, ...s.conocimiento] }));
    }
    setF(vacio(tipo)); setEdit(null); setSt('Guardado. Tus agentes ya lo saben.');
  }
  async function borrar(id) { if (!o.demo) await supabase.from('of_conocimiento').delete().eq('id', id); o.setEstado((s) => ({ ...s, conocimiento: s.conocimiento.filter((k) => k.id !== id) })); }
  return (
    <>
      <form className="sb-form" onSubmit={guardar}>
        {FORM[tipo].campos.map(([k, l, ph, modo, sug]) => (
          <label key={k} className={modo === 'largo' || (modo === 'texto' && tipo !== 'nota') ? 'sb-ancho' : ''}>
            <span>{l}</span>
            {modo === 'largo' ? <textarea rows={4} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} required />
              : <input type={modo === 'fecha' ? 'date' : modo === 'url' ? 'url' : 'text'} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} required={!['dato', 'fecha'].includes(modo) && !l.includes('opcional')} list={sug ? `sug-${tipo}` : undefined} />}
            {sug && <datalist id={`sug-${tipo}`}>{sug.map((x) => <option key={x} value={x} />)}</datalist>}
          </label>
        ))}
        <div className="sb-ancho cx-row"><button className="btn btn--pri btn--sm">{edit ? <><Check size={13} /> Guardar cambios</> : <><Plus size={13} /> Añadir</>}</button>
          {edit && <button type="button" className="btn btn--sec btn--sm" onClick={() => { setEdit(null); setF(vacio(tipo)); }}>Cancelar</button>}{st && <small className="muted">{st}</small>}</div>
      </form>
      {filas.length > 0 && <ul className="sb-lista">{filas.map((k) => (
        <li key={k.id}>
          <div>
            <b>{k.titulo || k.pregunta || k.respuesta}</b>
            {tipo === 'servicio' && (k.datos?.precio || k.datos?.duracion) && <span className="sb-chips">{k.datos?.precio && <em>{k.datos.precio}</em>}{k.datos?.duracion && <em>{k.datos.duracion}</em>}</span>}
            {tipo === 'equipo' && k.datos?.rol && <span className="sb-chips"><em>{k.datos.rol}</em></span>}
            {tipo === 'enlace' && <a className="enlace" href={k.url} target="_blank" rel="noreferrer">{k.url} <ExternalLink size={11} /></a>}
            {(k.titulo || k.pregunta) && k.respuesta && <p>{k.respuesta}</p>}
            {tipo === 'nota' && k.hasta && <small className="muted">Hasta el {new Date(k.hasta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</small>}
          </div>
          <span className="sb-acc"><button className="ico" onClick={() => { setEdit(k.id); setF({ ...vacio(tipo), ...deFila(k) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Editar"><Pencil size={14} /></button><button className="ico" onClick={() => borrar(k.id)} aria-label="Borrar"><Trash2 size={14} /></button></span>
        </li>
      ))}</ul>}
    </>
  );
}

function Documentos({ o }) {
  const [st, setSt] = useState(''); const [ocup, setOcup] = useState(false);
  const docs = o.conocimiento.filter((k) => k.tipo === 'documento');
  async function subir(files) {
    setOcup(true);
    for (const f of Array.from(files || [])) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'txt', 'md', 'csv'].includes(ext)) { setSt(`«${f.name}»: sube PDF, Word (.docx), TXT o CSV.`); continue; }
      if (f.size > 20 * 1024 * 1024) { setSt(`«${f.name}» pesa más de 20 MB.`); continue; }
      const titulo = f.name.replace(/\.[^.]+$/, '');
      if (o.demo) { o.setEstado((s) => ({ ...s, conocimiento: [{ id: uid('k'), tipo: 'documento', titulo, archivo: f.name, datos: { caracteres: 12400 }, texto: '…', created_at: new Date().toISOString() }, ...s.conocimiento] })); setSt('Leído. Tus agentes ya lo usan.'); continue; }
      setSt(`Subiendo «${f.name}»…`);
      const ruta = `${o.negocio.id}/saben/${Date.now()}-${f.name.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-80)}`;
      const { error } = await supabase.storage.from('oficina-material').upload(ruta, f, { contentType: f.type || undefined });
      if (error) { setSt(`No se ha podido subir «${f.name}».`); continue; }
      const { data: fila, error: e2 } = await supabase.from('of_conocimiento').insert({ negocio_id: o.negocio.id, tipo: 'documento', titulo, archivo: ruta, respuesta: '' }).select().single();
      if (e2) { setSt('No se ha podido guardar.'); continue; }
      setSt(`Leyendo «${f.name}»…`);
      try {
        const j = await api('saber', { op: 'documento', id: fila.id });
        o.setEstado((s) => ({ ...s, conocimiento: [{ ...fila, texto: '…', datos: { caracteres: j.caracteres } }, ...s.conocimiento] }));
        setSt(j.recortado ? `Leído. Es muy largo: tus agentes usan los primeros 60.000 caracteres.` : 'Leído. Tus agentes ya lo usan.');
      } catch (er) { o.setEstado((s) => ({ ...s, conocimiento: [fila, ...s.conocimiento] })); setSt(er.message); }
    }
    setOcup(false);
  }
  async function borrar(k) {
    if (!o.demo) { if (k.archivo) await supabase.storage.from('oficina-material').remove([k.archivo]); await supabase.from('of_conocimiento').delete().eq('id', k.id); }
    o.setEstado((s) => ({ ...s, conocimiento: s.conocimiento.filter((x) => x.id !== k.id) }));
  }
  return (
    <>
      <label className={`sb-drop ${ocup ? 'is-ocup' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); subir(e.dataTransfer.files); }}>
        <Upload size={20} /><b>Arrastra aquí tus documentos o pulsa para elegirlos</b><small>PDF, Word (.docx), TXT o CSV · hasta 20 MB. Tus agentes leen el texto: si es un PDF escaneado (una foto), mejor súbelo en Word.</small>
        <input type="file" accept={ACEPTA} multiple onChange={(e) => { subir(e.target.files); e.target.value = ''; }} disabled={ocup} />
      </label>
      {st && <p className="cx-nota">{st}</p>}
      {docs.length > 0 && <ul className="sb-lista">{docs.map((k) => (
        <li key={k.id}><div><b><FileText size={14} /> {k.titulo}</b>
          <small className="muted">{k.datos?.caracteres ? `Leído · ${Number(k.datos.caracteres).toLocaleString('es-ES')} caracteres` : k.texto ? 'Leído' : 'Sin leer: vuelve a subirlo'}</small></div>
          <span className="sb-acc"><button className="ico" onClick={() => borrar(k)} aria-label="Borrar"><Trash2 size={14} /></button></span></li>
      ))}</ul>}
    </>
  );
}

function Negocio({ o }) {
  const [form, setForm] = useState(o.negocio); const [st, setSt] = useState('');
  async function guardar(e) {
    e.preventDefault(); const c = Object.fromEntries(CAMPOS.map(([k]) => [k, (form[k] || '').trim()]));
    if (!o.demo) { setSt('Guardando…'); const { error } = await supabase.from('of_negocios').update(c).eq('id', o.negocio.id); if (error) { setSt('No se ha podido guardar.'); return; } }
    o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, ...c } })); setSt('Guardado. Tus agentes ya lo saben.');
  }
  return (
    <form className="sb-form" onSubmit={guardar}>
      {CAMPOS.map(([k, l, ph, largo]) => (
        <label key={k} className={largo ? 'sb-ancho' : ''}><span>{l}{String(o.negocio[k] || '').trim() && <Check size={12} className="ok" />}</span>
          {largo ? <textarea rows={3} value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input value={form[k] || ''} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
        </label>
      ))}
      <div className="sb-ancho cx-row"><button className="btn btn--pri btn--sm">Guardar</button>{st && <small className="muted">{st}</small>}</div>
    </form>
  );
}

export function LoQueSaben({ o }) {
  const [sec, setSec] = useState('negocio');
  const cuenta = (id) => (id === 'negocio' ? CAMPOS.filter(([k]) => String(o.negocio[k] || '').trim()).length : o.conocimiento.filter((k) => k.tipo === id).length);
  const hechas = SECCIONES.filter((s) => cuenta(s.id) > 0).length; const S = SECCIONES.find((s) => s.id === sec);
  return (
    <div className="vista">
      <div className="sb-prog"><div><b>{hechas} de {SECCIONES.length} apartados con información</b><small>Cuanto más sepan, mejor contestan y menos te preguntan.</small></div><div className="cx-meter"><s style={{ width: `${(hechas / SECCIONES.length) * 100}%` }} /></div></div>
      <div className="sb">
        <nav className="sb__nav" aria-label="Apartados">{SECCIONES.map((s) => { const n = cuenta(s.id); return (
          <button key={s.id} className={sec === s.id ? 'is-on' : ''} aria-current={sec === s.id || undefined} onClick={() => setSec(s.id)}>
            <s.I size={16} /><span>{s.t}</span>{n > 0 ? <em>{s.id === 'negocio' ? `${n}/${CAMPOS.length}` : n}</em> : <i className="sb__vacio" title="Vacío" />}
          </button>
        ); })}</nav>
        <section className="cx">
          <header className="cx__h"><S.I /><h2>{S.t}</h2></header>
          <div className="cx__b"><p className="sb-d">{S.d}</p>
            {sec === 'negocio' ? <Negocio o={o} /> : sec === 'documento' ? <Documentos o={o} /> : <Lista key={sec} o={o} tipo={sec} />}
            {sec === 'enlace' && <p className="sb-nota"><Info size={13} /> No guardes aquí contraseñas ni accesos privados: tus agentes dan estos enlaces a los clientes. Para que usen tus herramientas, conéctalas en «Conexiones».</p>}
          </div>
        </section>
      </div>
      <Probar o={o} />
    </div>
  );
}

// Ayuda y soporte, cada cosa en su página: Centro de ayuda (artículos por colección, con buscador),
// Vídeos tutoriales y Escríbenos (mensaje al equipo con su historial).
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CreditCard, GraduationCap, Mail, MessageCircle, PlayCircle, Plug, Rocket, Search, Send, Sparkles, User,
} from 'lucide-react';
import { DEPTO, BOLSA_EXTRA } from '../../data/oficinaSaas';
import { api } from './datos';
import { hace } from './formato';
import { supabase } from '../../lib/oficinaSupabase';
import { VideoModal, VideoTarjeta } from './departamentos';
import { ORDEN_VIDEOS } from './videos';

// Cada artículo: título, texto en párrafos y, si toca, a qué parte del panel lleva.
const COLECCIONES = [
  { id: 'empezar', I: Rocket, t: 'Primeros pasos', d: 'Poner en marcha tu oficina y lo básico del panel.', arts: [
    { id: 'tres-pasos', t: 'Cómo empezar en 3 pasos', p: ['1. Rellena «Lo que saben tus agentes»: precios, horarios, servicios y las preguntas que más te hacen. Es lo que usan para contestar.', '2. Conecta tus herramientas: WhatsApp Business, Google, Instagram, tu calendario o tu CRM. Cada conexión son unos clics.', '3. Revisa «Te necesitan» cada día: ahí tus agentes te dejan lo que necesita tu visto bueno.'], ir: ['ensenar', 'Rellenar lo que saben'] },
    { id: 'lo-que-saben', t: 'Qué poner en «Lo que saben»', p: ['Cuanto más completo, mejor contestan y menos te preguntan. Lo mínimo: a qué te dedicas, horarios y precios.', 'Añade las preguntas frecuentes con su respuesta tal como la darías tú, y el tono: si tuteas o no, si usas emojis.', 'Si cambias un precio o un horario, cámbialo aquí: tus agentes lo usan desde ese momento.'], ir: ['ensenar', 'Abrir «Lo que saben»'] },
    { id: 'te-necesitan', t: 'Qué es «Te necesitan»', p: ['Es tu bandeja de tareas: respuestas a reseñas de 3 estrellas o menos, publicaciones por aprobar, clientes que piden hablar contigo y dudas que tus agentes no saben resolver.', 'Puedes aprobar, editar o descartar cada cosa. Lo que apruebas se hace solo.'], ir: ['bandeja', 'Ir a «Te necesitan»'] },
  ] },
  { id: 'agentes', I: Sparkles, t: 'Tus agentes', d: 'Cómo trabajan, qué pueden hacer y cómo controlarlos.', arts: [
    { id: 'inventar', t: '¿Mis agentes se pueden inventar algo?', p: ['No. Solo usan lo que pones en «Lo que saben» y en «Cómo trabaja» de cada departamento.', 'Si un cliente pregunta algo que no está ahí, le dicen que lo consultan y te lo pasan a ti en «Te necesitan».'] },
    { id: 'contestar-yo', t: 'Contestar tú a un cliente', p: ['En «Conversaciones», abre la conversación y escribe. Pasas a llevarla tú y tu agente no contesta hasta que se la devuelvas.'], ir: ['conversaciones', 'Ir a Conversaciones'] },
    { id: 'como-trabaja', t: 'Cambiar cómo trabaja un agente', p: ['Entra en su sección (Agenda, Publicaciones, Reseñas…) y pulsa «Cómo trabaja»: tono, horarios, qué puede hacer solo y qué te tiene que enseñar antes.', 'También puedes pausarlo cuando quieras.'], ir: ['equipo', 'Ver departamentos'] },
    { id: 'chat', t: 'Hablar con cada departamento', p: ['En «Chat con tu equipo» puedes escribir a toda la oficina o a un departamento en concreto. Cada uno contesta sobre lo suyo con los datos reales y cada conversación guarda su historial.', 'También puedes encargarles cosas: «hazme un carrusel sobre la oferta de esta semana».'], ir: ['chat', 'Abrir el chat'] },
  ] },
  { id: 'redes', I: BookOpen, t: 'Redes y contenido', d: 'Historias, posts, carruseles, vídeos y artículos.', arts: [
    { id: 'publicaciones', t: 'Historias, posts y carruseles', p: [`Cada mes tu agente de Redes prepara ${DEPTO.redes.cupo.detalle}.`, 'En «Publicaciones» las tienes por revisar. Puedes editar el texto, aprobar o descartar. Si tienes Instagram o Facebook conectado, lo aprobado se publica solo.', 'También puedes pedir una pieza concreta eligiendo Historia, Post o Carrusel.'], ir: ['publicaciones', 'Ir a Publicaciones'] },
    { id: 'videos', t: 'Pedir un reel o un TikTok', p: ['En «Vídeos» escribe el tema. Tu agente prepara el guion; cuando lo apruebas, se monta el vídeo con voz y subtítulos.', 'Puedes elegir la voz y el estilo.'], ir: ['videos', 'Ir a Vídeos'] },
    { id: 'blog', t: 'Artículos para el blog', p: ['Tu agente de Contenido escribe artículos pensados para salir en Google en tu zona. Los revisas en «Blog».', 'Si conectas WordPress, lo que apruebas se publica en tu web.'], ir: ['articulos', 'Ir al Blog'] },
  ] },
  { id: 'conexiones', I: Plug, t: 'Conexiones y CRM', d: 'WhatsApp, Google, redes, calendario y tu programa de gestión.', arts: [
    { id: 'whatsapp', t: 'Conectar WhatsApp Business', p: ['Se conecta desde «Conexiones» con tu cuenta de Meta, en unos clics.', 'Las conversaciones de WhatsApp las factura Meta aparte, a la tarjeta de tu negocio. Las primeras 1.000 respuestas a clientes de cada mes son gratis.'], ir: ['conexiones', 'Ir a Conexiones'] },
    { id: 'google', t: 'Conectar Google', p: ['Con tu Perfil de Empresa, tu agente responde reseñas y publica novedades. Con Search Console y Analytics ves cómo te encuentran en «SEO y competencia».'], ir: ['conexiones', 'Ir a Conexiones'] },
    { id: 'crm', t: 'Conectar tu CRM o programa de gestión', p: ['No sustituimos tu programa: lo conectamos. HubSpot y Pipedrive se conectan directamente con un token.', 'Booksy, Treatwell, Gesden, Trainingym y el resto se conectan con un webhook de Zapier, Make o n8n. Si lo prefieres, lo conectamos nosotros.', 'Cada cliente potencial y cada cita que consiguen tus agentes llega también a tu programa.'], ir: ['crm', 'Ir a Tu CRM'] },
  ] },
  { id: 'plan', I: CreditCard, t: 'Plan y facturación', d: 'Cupos, ampliaciones, pausa, baja y facturas.', arts: [
    { id: 'cupos', t: 'Cupos del mes y avisos', p: ['Cada departamento incluye un cupo al mes. Te avisamos al llegar al 80 % y al 100 %.', 'Si se acaba, tus agentes solo te pasan los avisos importantes hasta que empiece el mes siguiente o amplíes. Nunca se te cobra de más sin saberlo.'], ir: ['plan', 'Ver mi consumo'] },
    { id: 'ampliar', t: 'Ampliar un departamento', p: [`Si un departamento se queda corto, puedes ampliarlo solo ese mes: +50 % de su cupo por ${BOLSA_EXTRA.precio} € + IVA. Es un cobro único con su factura.`], ir: ['plan', 'Ir a Plan'] },
    { id: 'pausa', t: 'Pausar o darte de baja', p: ['En «Plan», abajo del todo. En el plan mensual puedes pausar un mes o darte de baja cuando quieras, sin permanencia.'], ir: ['plan', 'Ir a Plan'] },
    { id: 'anual', t: 'Plan anual', p: ['Pagas una vez al año con un 20 % de descuento desde 2 departamentos. Con 3 departamentos o más incluye el diseño o rediseño de tu web.'], ir: ['plan', 'Ver el plan anual'] },
    { id: 'facturas', t: 'Facturas', p: ['Todas tus facturas, con IVA y, si eres autónomo, con la retención de IRPF, están en «Facturas» para descargarlas en PDF.'], ir: ['facturas', 'Ir a Facturas'] },
  ] },
  { id: 'cuenta', I: User, t: 'Tu cuenta', d: 'Acceso, perfil y apariencia.', arts: [
    { id: 'acceso', t: 'Cómo entras al panel', p: ['Entras con un enlace que te mandamos a tu correo, sin contraseña. Cada enlace caduca y solo sirve una vez.'] },
    { id: 'tema', t: 'Modo claro u oscuro', p: ['En tu perfil (abajo a la izquierda, tu correo › Mi perfil) eliges Claro, Oscuro o Sistema, que sigue el modo de tu ordenador o tu móvil.'], perfil: true },
    { id: 'avisos', t: 'Avisos y notificaciones', p: ['Elige qué te avisamos y por dónde, y si quieres el resumen de la semana por correo.'], ir: ['ajustes', 'Configurar avisos'] },
  ] },
];
const TODOS = COLECCIONES.flatMap((c) => c.arts.map((a) => ({ ...a, col: c })));

function Cab({ titulo, sub, extra, volver }) {
  return (
    <header className="pc-cab">
      <div>{volver && <button className="enlace ay-volver" onClick={volver}><ArrowLeft size={14} /> Centro de ayuda</button>}<h1>{titulo}</h1>{sub && <p className="muted">{sub}</p>}</div>{extra}
    </header>
  );
}

export function CentroAyuda({ o, ir, abrirTutorial, abrirPerfil }) {
  const [q, setQ] = useState(''); const [col, setCol] = useState(null); const [art, setArt] = useState(null);
  const x = q.trim().toLowerCase();
  const res = useMemo(() => (x ? TODOS.filter((a) => `${a.t} ${a.p.join(' ')}`.toLowerCase().includes(x)) : []), [x]);
  if (art) {
    const a = TODOS.find((y) => y.id === art);
    return (
      <div className="vista">
        <nav className="ay-migas" aria-label="Migas"><button className="enlace" onClick={() => { setArt(null); setCol(null); }}>Centro de ayuda</button><span>›</span><button className="enlace" onClick={() => { setArt(null); setCol(a.col.id); }}>{a.col.t}</button></nav>
        <article className="cx ay-art"><div className="cx__b"><h1>{a.t}</h1>{a.p.map((t) => <p key={t}>{t}</p>)}
          {(a.ir || a.perfil) && <button className="btn btn--pri btn--sm" onClick={() => (a.perfil ? abrirPerfil() : ir(a.ir[0]))}>{a.perfil ? 'Abrir mi perfil' : a.ir[1]} <ArrowRight size={13} /></button>}</div>
          <footer className="cx__f"><small className="muted">¿No era lo que buscabas?</small><button className="btn btn--sec btn--sm" onClick={() => ir('soporte')}><MessageCircle size={13} /> Escríbenos</button></footer>
        </article>
      </div>
    );
  }
  if (col) {
    const c = COLECCIONES.find((y) => y.id === col);
    return (
      <div className="vista">
        <Cab titulo={c.t} sub={c.d} volver={() => setCol(null)} />
        <section className="cx"><ul className="ay-lista">{c.arts.map((a) => <li key={a.id}><button onClick={() => setArt(a.id)}><span>{a.t}</span><ArrowRight size={14} /></button></li>)}</ul></section>
      </div>
    );
  }
  return (
    <div className="vista">
      <Cab titulo="Centro de ayuda" sub="Guías cortas sobre cada parte de tu oficina." />
      <label className="ay-busca"><Search size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca: WhatsApp, cupo, carrusel, factura…" aria-label="Buscar en la ayuda" /></label>
      {x ? (
        <section className="cx"><header className="cx__h"><h2>{res.length} resultado{res.length === 1 ? '' : 's'}</h2></header>
          {res.length ? <ul className="ay-lista">{res.map((a) => <li key={a.id}><button onClick={() => setArt(a.id)}><span>{a.t}<small>{a.col.t}</small></span><ArrowRight size={14} /></button></li>)}</ul>
            : <div className="cx-vacio">No hay artículos con «{q}». <button className="btn btn--sec btn--sm" onClick={() => ir('soporte')}>Pregúntanos</button></div>}
        </section>
      ) : (<>
        <div className="cfg">{COLECCIONES.map((c) => (
          <button key={c.id} type="button" className="cfg__c" onClick={() => setCol(c.id)}>
            <span className="cfg__i"><c.I size={18} /></span><span><b>{c.t}</b><small>{c.d} · {c.arts.length} artículos</small></span><ArrowRight size={15} />
          </button>
        ))}</div>
        <div className="ay-atajos">
          <button className="cfg__c" onClick={() => ir('videos-ayuda')}><span className="cfg__i"><PlayCircle size={18} /></span><span><b>Vídeos tutoriales</b><small>Un vídeo corto por cada parte del panel.</small></span><ArrowRight size={15} /></button>
          <button className="cfg__c" onClick={abrirTutorial}><span className="cfg__i"><GraduationCap size={18} /></span><span><b>Tutorial guiado</b><small>El recorrido de bienvenida, paso a paso. 5 minutos.</small></span><ArrowRight size={15} /></button>
          <button className="cfg__c" onClick={() => ir('soporte')}><span className="cfg__i"><MessageCircle size={18} /></span><span><b>Escríbenos</b><small>Te contesta una persona del equipo.</small></span><ArrowRight size={15} /></button>
        </div>
      </>)}
    </div>
  );
}

async function guardarVisto(o, x) {
  const vistos = o.negocio.onboarding?.videos || []; if (vistos.includes(x)) return;
  const nuevo = { ...(o.negocio.onboarding || {}), videos: [...vistos, x] };
  o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, onboarding: nuevo } }));
  if (!o.demo) await supabase.from('of_negocios').update({ onboarding: nuevo }).eq('id', o.negocio.id);
}
export function VideosAyuda({ o, ir }) {
  const [video, setVideo] = useState(null);
  const mis = o.deptos.map((d) => d.depto); const vistos = o.negocio.onboarding?.videos || [];
  const ids = ORDEN_VIDEOS.filter((x) => !DEPTO[x] || mis.includes(x)); const n = vistos.filter((x) => ids.includes(x)).length;
  const generales = ids.filter((x) => !DEPTO[x]); const deps = ids.filter((x) => DEPTO[x]);
  return (
    <div className="vista">
      <Cab titulo="Vídeos tutoriales" sub="Vídeos cortos con voz para aprender cada parte del panel." volver={() => ir('ayuda')}
        extra={<div className="ay-prog"><span>{n} de {ids.length} vistos</span><div className="cx-meter"><s style={{ width: `${(n / Math.max(1, ids.length)) * 100}%` }} /></div></div>} />
      <section><h2 className="ay-h2">Lo básico</h2><div className="vts">{generales.map((x) => <VideoTarjeta key={x} id={x} abrir={(v) => { setVideo(v); guardarVisto(o, v).catch(() => {}); }} visto={vistos.includes(x)} />)}</div></section>
      {deps.length > 0 && <section><h2 className="ay-h2">Tus departamentos</h2><div className="vts">{deps.map((x) => <VideoTarjeta key={x} id={x} abrir={(v) => { setVideo(v); guardarVisto(o, v).catch(() => {}); }} visto={vistos.includes(x)} />)}</div></section>}
      {video && <VideoModal id={video} cerrar={() => setVideo(null)} />}
    </div>
  );
}

const TEMAS = ['Empezar', 'Mis agentes', 'Conexiones', 'Redes y contenido', 'Plan y facturas', 'Otra cosa'];
export function Soporte({ o, ir }) {
  const [tema, setTema] = useState(''); const [msg, setMsg] = useState(''); const [st, setSt] = useState(''); const [lista, setLista] = useState(null); const [env, setEnv] = useState(false);
  useEffect(() => {
    if (o.demo) { setLista([{ id: 1, creado: new Date(Date.now() - 3 * 864e5).toISOString(), tema: 'Conexiones', mensaje: 'No sé qué cuenta de Meta tengo que usar para conectar WhatsApp.', estado: 'respondido', respuesta: 'La del Business Manager de tu negocio. Te hemos dejado los pasos en tu correo.' }]); return; }
    api('ayuda', { op: 'lista' }).then((j) => setLista(j.mensajes || [])).catch(() => setLista([]));
  }, [o.demo]);
  async function enviar(e) {
    e.preventDefault(); if (!msg.trim() || env) return; setEnv(true); setSt('Enviando…');
    try {
      const j = o.demo ? { mensaje: { id: Date.now(), creado: new Date().toISOString(), tema, mensaje: msg, estado: 'recibido' } } : await api('ayuda', { mensaje: msg, tema });
      if (j.mensaje) setLista((l) => [j.mensaje, ...(l || [])]); setMsg(''); setTema(''); setSt('Recibido. Te contestamos en menos de 24 h laborables, aquí y en tu correo.');
    } catch (er) { setSt(er.message); }
    setEnv(false);
  }
  const ESTADO = { recibido: ['is-aviso', 'Recibido'], respondido: ['is-ok', 'Respondido'], cerrado: ['', 'Cerrado'] };
  return (
    <div className="vista">
      <Cab titulo="Escríbenos" sub="Te contesta una persona del equipo de Agutidesigns en menos de 24 h laborables." volver={() => ir('ayuda')} />
      <div className="cx-grid cx-grid--21">
        <section className="cx">
          <header className="cx__h"><Send /><h2>Nuevo mensaje</h2></header>
          <form className="cx__b ay-form" onSubmit={enviar}>
            <fieldset><legend>¿Sobre qué es?</legend><div className="ay-temas">{TEMAS.map((t) => <button type="button" key={t} aria-pressed={tema === t} onClick={() => setTema(tema === t ? '' : t)}>{t}</button>)}</div></fieldset>
            <label><span>Cuéntanos qué necesitas</span><textarea rows={6} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Cuanto más detalle, antes lo resolvemos: qué estabas haciendo, qué esperabas y qué ha pasado." required /></label>
            <div className="cx-row"><button className="btn btn--pri btn--sm" disabled={env}><Send size={13} /> Enviar</button>{st && <small className="muted">{st}</small>}</div>
          </form>
        </section>
        <div className="cx-grid">
          <section className="cx"><header className="cx__h"><Mail /><h2>Otras formas</h2></header>
            <div className="cx__b ay-otras"><p><b>Correo</b><span>info@agutidesigns.io</span></p><p><b>Respuesta</b><span>En menos de 24 h laborables</span></p><button className="btn btn--sec btn--sm" style={{ justifySelf: 'start' }} onClick={() => ir('ayuda')}>Buscar en el Centro de ayuda</button></div>
          </section>
        </div>
      </div>
      <section className="cx">
        <header className="cx__h"><MessageCircle /><h2>Tus mensajes</h2>{lista && <small>{lista.length}</small>}</header>
        {lista === null ? <div className="cx-vacio">Cargando…</div> : lista.length ? (
          <ul className="cx-list">{lista.map((m) => { const [c, t] = ESTADO[m.estado] || ESTADO.recibido; return (
            <li key={m.id} className="ay-msg"><span className={`cx-st ${c}`}><i />{t}</span>
              <div className="cx-list__m"><b>{m.tema ? `${m.tema} · ` : ''}{m.mensaje}</b><small>{hace(m.creado)}</small>{m.respuesta && <p className="ay-resp"><Check size={13} /> {m.respuesta}</p>}</div></li>
          ); })}</ul>
        ) : <div className="cx-vacio">Aún no nos has escrito.</div>}
      </section>
    </div>
  );
}


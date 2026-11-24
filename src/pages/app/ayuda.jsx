// Primeros pasos (tutorial a pantalla completa la primera vez que se entra) y la sección «Ayuda y vídeos».
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, LifeBuoy, Mail, PlayCircle, Plug } from 'lucide-react';
import { supabase } from '../../lib/oficinaSupabase';
import { DEPTO } from '../../data/oficinaSaas';
import { api } from './datos';
import { HERRAMIENTAS } from './conexiones';
import { CAMPOS } from './formato';
import { Avatar, Tarjeta } from './ui';
import { LogoHerramienta } from './marcas';
import { AjustesDepto, VideoModal, VideoTarjeta } from './departamentos';
import { Probar } from './vistas';
import { VIDEOS, ORDEN_VIDEOS } from './videos';

// Guarda el progreso del tutorial en of_negocios.onboarding (sin pisar lo que haya).
async function guardarOnboarding(o, cambios) {
  const nuevo = { ...(o.negocio.onboarding || {}), ...cambios };
  o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, onboarding: nuevo } }));
  if (!o.demo) await supabase.from('of_negocios').update({ onboarding: nuevo }).eq('id', o.negocio.id);
}

function VideoEnLinea({ id, o }) {
  const v = VIDEOS[id];
  return (
    <figure className="tuto-video">
      <video src={v.src} poster={v.poster} controls playsInline preload="metadata" onPlay={() => { const vistos = o.negocio.onboarding?.videos || []; if (!vistos.includes(id)) guardarOnboarding(o, { videos: [...vistos, id] }); }} />
      <figcaption><PlayCircle size={15} /> {v.t} · {v.dur}</figcaption>
    </figure>
  );
}

const REQUERIDOS = ['sector', 'horarios', 'precios'];

export function Tutorial({ o, cerrar }) {
  const ob = o.negocio.onboarding || {};
  const [paso, setPaso] = useState(Math.min(ob.paso || 0, 5));
  const [form, setForm] = useState(() => Object.fromEntries(CAMPOS.map(([k]) => [k, o.negocio[k] || ''])));
  const [abierto, setAbierto] = useState(o.deptos[0]?.depto); const [video, setVideo] = useState(null);
  const [st, setSt] = useState(''); const [ocupado, setOcupado] = useState('');
  const mis = o.deptos.map((d) => d.depto);
  const herramientas = HERRAMIENTAS.filter((h) => h.deptos.some((d) => mis.includes(d)) && h.proveedor !== 'clave');
  const conectada = (id) => o.conexiones.some((c) => c.herramienta === id && c.estado === 'conectada');
  const faltan = REQUERIDOS.filter((k) => !String(form[k] || '').trim());
  const PASOS = [
    { id: 'hola', t: 'Bienvenida' }, { id: 'negocio', t: 'Tu negocio', ok: !faltan.length },
    { id: 'equipo', t: 'Tu equipo' }, { id: 'conectar', t: 'Conecta', ok: herramientas.some((h) => conectada(h.id)) },
    { id: 'probar', t: 'Pruébalo' }, { id: 'listo', t: 'Listo' },
  ];

  async function ir(n) {
    setSt('');
    if (PASOS[paso].id === 'negocio' && n > paso) {
      if (faltan.length) { setSt(`Falta: ${faltan.map((k) => CAMPOS.find((c) => c[0] === k)[1].toLowerCase()).join(', ')}. Sin esto tus agentes no pueden contestar bien.`); return; }
      const c = Object.fromEntries(CAMPOS.map(([k]) => [k, String(form[k] || '').trim()]));
      if (!o.demo) { const { error } = await supabase.from('of_negocios').update(c).eq('id', o.negocio.id); if (error) { setSt('No se ha podido guardar. Inténtalo otra vez.'); return; } }
      o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, ...c } }));
    }
    setPaso(n); guardarOnboarding(o, { paso: n }).catch(() => {});
    document.querySelector('.tuto__main')?.scrollTo(0, 0);
  }
  async function terminar(estado) { await guardarOnboarding(o, { tutorial: estado, paso }).catch(() => {}); cerrar(); }
  async function conectar(h) {
    if (o.demo) { setOcupado(h.id); setTimeout(() => { o.setEstado((e) => ({ ...e, conexiones: [...e.conexiones, { herramienta: h.id, estado: 'conectada', cuenta: 'Cuenta de ejemplo' }] })); setOcupado(''); }, 800); return; }
    setOcupado(h.id); setSt('');
    try {
      await guardarOnboarding(o, { paso: 3 });
      const j = await api('conectar', { herramienta: h.id, seguir: true, instalado: h.proveedor === 'snippet' || undefined });
      if (j.url) { window.location.assign(j.url); return; }
      if (j.conectada) o.setEstado((e) => ({ ...e, conexiones: [...e.conexiones.filter((c) => c.herramienta !== h.id), { herramienta: h.id, estado: 'conectada', cuenta: j.cuenta }] }));
    } catch (err) { setSt(err.datos?.ayuda ? `${h.nombre} aún no se puede conectar solo. Pulsa «Que me ayudéis» y lo hacemos contigo.` : err.message); }
    setOcupado('');
  }
  async function pedirAyuda() { if (!o.demo) await api('ayuda', { herramienta: herramientas.filter((h) => !conectada(h.id)).map((h) => h.nombre).join(', ') }).catch(() => {}); setSt('Hecho. Te escribimos en menos de 24 h laborables y lo conectamos contigo en una videollamada de 10 minutos.'); }
  const codigo = `<script src="https://agutidesigns.io/oficina-chat.js" data-oficina="${o.negocio.id}" async></script>`;
  const id = PASOS[paso].id;

  return (
    <div className="tuto" role="dialog" aria-modal="true" aria-label="Primeros pasos">
      <header className="tuto__top">
        <img src="/images/logoazul.png" alt="Agutidesigns" width="110" height="30" />
        <ol className="tuto__pasos">{PASOS.map((p, i) => (
          <li key={p.id} className={`${i === paso ? 'is-on' : ''} ${i < paso ? 'is-ok' : ''}`}><button type="button" onClick={() => (i < paso ? ir(i) : null)} disabled={i > paso}><span>{i < paso ? <Check size={13} strokeWidth={3} /> : i + 1}</span><em>{p.t}</em></button></li>
        ))}</ol>
        <button className="enlace enlace--gris" onClick={() => terminar('saltado')}>Hacerlo luego</button>
      </header>
      <main className="tuto__main">
        <div className="tuto__c">
          {id === 'hola' && (<>
            <p className="tuto__k">Primeros pasos · 5 minutos</p>
            <h1>¡Bienvenido a tu oficina, {o.negocio.nombre}!</h1>
            <p className="tuto__lead">Te acompañamos en 4 pasos para que tus agentes empiecen a trabajar hoy mismo. Mira este vídeo de un minuto y empezamos.</p>
            <VideoEnLinea id="bienvenida" o={o} />
            <h2>Tu equipo</h2>
            <ul className="tuto-eq">{mis.map((d) => <li key={d} style={{ '--c': DEPTO[d].color }}><Avatar depto={d} size={38} /><div><b>{DEPTO[d].nombre}</b><span>{DEPTO[d].que}</span></div></li>)}</ul>
          </>)}

          {id === 'negocio' && (<>
            <p className="tuto__k">Paso 1 de 4</p>
            <h1>Cuéntales cómo es tu negocio</h1>
            <p className="tuto__lead">Tus agentes solo usan lo que pongas aquí: nunca se inventan precios ni horarios. Lo puedes cambiar cuando quieras en «Lo que saben».</p>
            <details className="tuto-det"><summary><PlayCircle size={16} /> Ver el vídeo ({VIDEOS.negocio.dur})</summary><VideoEnLinea id="negocio" o={o} /></details>
            <form className="form2" onSubmit={(e) => { e.preventDefault(); ir(paso + 1); }}>
              {CAMPOS.map(([k, l, ph, largo]) => (
                <label key={k} className={`campo ${largo ? 'ancho' : ''}`}><span>{l}{REQUERIDOS.includes(k) && <em className="req"> · necesario</em>}</span>
                  {largo ? <textarea rows={3} value={form[k]} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input value={form[k]} placeholder={ph} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}
                </label>
              ))}
            </form>
          </>)}

          {id === 'equipo' && (<>
            <p className="tuto__k">Paso 2 de 4</p>
            <h1>Dile a cada agente cómo quieres que trabaje</h1>
            <p className="tuto__lead">Ya vienen configurados con lo más habitual. Revisa cada uno y cambia lo que quieras: se guarda solo.</p>
            <div className="tuto-acc">{mis.map((d) => (
              <section key={d} className={`tuto-acc__i ${abierto === d ? 'is-on' : ''}`} style={{ '--c': DEPTO[d].color }}>
                <button type="button" className="tuto-acc__h" aria-expanded={abierto === d} onClick={() => setAbierto(abierto === d ? null : d)}>
                  <Avatar depto={d} size={36} /><div><b>{DEPTO[d].nombre}</b><span>{DEPTO[d].que}</span></div><ArrowRight size={17} className="tuto-acc__f" />
                </button>
                {abierto === d && <div className="tuto-acc__b"><button type="button" className="btn btn--fan btn--sm centro-izq" onClick={() => setVideo(d)}><PlayCircle size={15} /> Ver cómo trabaja ({VIDEOS[d].dur})</button><AjustesDepto o={o} depto={d} sinComunes /></div>}
              </section>
            ))}</div>
          </>)}

          {id === 'conectar' && (<>
            <p className="tuto__k">Paso 3 de 4</p>
            <h1>Conecta tus herramientas</h1>
            <p className="tuto__lead">Pulsa «Conectar», entra con tu cuenta y acepta. Tus contraseñas no pasan por nosotros. Estas son las que usan tus agentes:</p>
            <details className="tuto-det"><summary><PlayCircle size={16} /> Ver el vídeo ({VIDEOS.conectar.dur})</summary><VideoEnLinea id="conectar" o={o} /></details>
            <ul className="tuto-tools">{herramientas.map((h) => { const on = conectada(h.id); return (
              <li key={h.id} className={on ? 'is-on' : ''}>
                <LogoHerramienta id={h.id} size={44} />
                <div><b>{h.nombre}</b><span>{h.que}</span><small>Necesitas: {h.requisito}. Tiempo: {h.tiempo}.</small>
                  {h.proveedor === 'snippet' && !on && <div className="tuto-code"><code>{codigo}</code><button type="button" className="btn btn--sec btn--sm" onClick={() => navigator.clipboard?.writeText(codigo).then(() => setSt('Código copiado. Pégalo en tu web antes de </body>.'), () => {})}><Copy size={14} /> Copiar código</button></div>}
                </div>
                {on ? <span className="ok-t"><Check size={14} strokeWidth={3} /> Conectado</span>
                  : <button className="btn btn--pri btn--sm" disabled={ocupado === h.id} onClick={() => conectar(h)}>{ocupado === h.id ? 'Abriendo…' : h.proveedor === 'snippet' ? 'Ya lo he pegado' : 'Conectar'}</button>}
              </li>
            ); })}</ul>
            <p className="tuto-ayuda"><LifeBuoy size={16} /> ¿Prefieres que lo hagamos contigo? <button className="enlace" onClick={pedirAyuda}>Que me ayudéis</button></p>
          </>)}

          {id === 'probar' && (<>
            <p className="tuto__k">Paso 4 de 4</p>
            <h1>Pruébalo tú mismo</h1>
            <p className="tuto__lead">Escríbele como si fueras un cliente: «¿Cuánto cuesta…?», «¿Abrís el sábado?», «Quiero cita el viernes». Si algo no te convence, cámbialo en tu negocio o en «Cómo trabaja».</p>
            <Probar o={o} />
          </>)}

          {id === 'listo' && (<>
            <p className="tuto__k">¡Hecho!</p>
            <h1>Tu oficina ya está trabajando</h1>
            <p className="tuto__lead">A partir de ahora solo tienes que mirar <b>«Te necesitan»</b>: ahí te dejan lo que no pueden resolver solos. Te avisamos también por correo.</p>
            <VideoEnLinea id="aprobar" o={o} />
            <ul className="tuto-fin">
              <li className={PASOS[1].ok ? 'is-ok' : ''}><Check size={15} /> Datos de tu negocio</li>
              <li className="is-ok"><Check size={15} /> Cómo trabaja cada agente</li>
              <li className={PASOS[3].ok ? 'is-ok' : ''}>{PASOS[3].ok ? <Check size={15} /> : <Plug size={15} />} {PASOS[3].ok ? 'Herramientas conectadas' : 'Te falta conectar alguna herramienta (puedes hacerlo luego en Conexiones)'}</li>
            </ul>
            <p className="muted">Todos los vídeos están en <b>Ayuda y vídeos</b>, en el menú, por si los necesitas.</p>
          </>)}
          {st && <p className="tuto-st" role="status">{st}</p>}
        </div>
      </main>
      <footer className="tuto__pie">
        {paso > 0 ? <button className="btn btn--sec" onClick={() => ir(paso - 1)}><ArrowLeft size={16} /> Atrás</button> : <span />}
        {id === 'listo' ? <button className="btn btn--pri" onClick={() => terminar('hecho')}>Ir a mi oficina <ArrowRight size={16} /></button>
          : <button className="btn btn--pri" onClick={() => ir(paso + 1)}>{id === 'hola' ? 'Empezar' : id === 'conectar' && !PASOS[3].ok ? 'Lo conecto luego' : 'Siguiente'} <ArrowRight size={16} /></button>}
      </footer>
      {video && <VideoModal id={video} cerrar={() => setVideo(null)} />}
    </div>
  );
}

const PREGUNTAS = [
  ['¿Mis agentes se pueden inventar algo?', 'No. Solo usan lo que pones en «Lo que saben» y en «Cómo trabaja». Si un cliente pregunta algo que no está ahí, le dicen que lo consultan y te lo pasan a ti en «Te necesitan».'],
  ['¿Puedo contestar yo a un cliente?', 'Sí, cuando quieras. En «Conversaciones» abre la conversación y escribe: pasas a llevarla tú y tu agente no contesta hasta que se la devuelvas.'],
  ['¿Qué pasa si se acaba el cupo del mes?', 'Al llegar al 80 % te avisamos. Si se acaba, tus agentes solo te pasan los avisos importantes hasta que empiece el mes siguiente o amplíes tu plan. Nunca se te cobra de más sin saberlo.'],
  ['¿Cómo cambio lo que hace un agente?', 'En su sección (Agenda, Publicaciones, Reseñas…) pulsa «Cómo trabaja». También puedes pausarlo o pedir que te enseñe todo antes de hacerlo.'],
  ['¿Cómo cancelo o pauso?', 'En «Plan», abajo del todo. En el plan mensual puedes pausar 30 días o darte de baja cuando quieras, sin permanencia.'],
];

export function Ayuda({ o, abrirTutorial }) {
  const [video, setVideo] = useState(null); const [msg, setMsg] = useState(''); const [st, setSt] = useState('');
  const mis = o.deptos.map((d) => d.depto); const vistos = o.negocio.onboarding?.videos || [];
  const ids = ORDEN_VIDEOS.filter((x) => !DEPTO[x] || mis.includes(x));
  function abrir(x) { setVideo(x); if (!vistos.includes(x)) guardarOnboarding(o, { videos: [...vistos, x] }).catch(() => {}); }
  async function enviar(e) { e.preventDefault(); if (!msg.trim()) return; setSt('Enviando…'); try { if (!o.demo) await api('ayuda', { mensaje: msg }); setMsg(''); setSt('Recibido. Te contestamos en menos de 24 h laborables.'); } catch (err) { setSt(err.message); } }
  return (
    <div className="vista">
      <Tarjeta titulo="Primeros pasos" extra={<button className="btn btn--pri btn--sm" onClick={abrirTutorial}><PlayCircle size={15} /> {o.negocio.onboarding?.tutorial === 'hecho' ? 'Repetir el tutorial' : 'Abrir el tutorial'}</button>}>
        <p className="muted">El recorrido de bienvenida: tu negocio, cómo trabaja cada agente, conectar tus herramientas y probarlo. 5 minutos.</p>
      </Tarjeta>
      <section>
        <div className="sec-h"><h2>Vídeos</h2><span className="muted">{vistos.filter((x) => ids.includes(x)).length} de {ids.length} vistos</span></div>
        <div className="vts">{ids.map((x) => <VideoTarjeta key={x} id={x} abrir={abrir} visto={vistos.includes(x)} />)}</div>
      </section>
      <div className="fila fila--1-1">
        <Tarjeta titulo="Preguntas frecuentes"><div className="faqs">{PREGUNTAS.map(([p, r]) => <details key={p}><summary>{p}</summary><p>{r}</p></details>)}</div></Tarjeta>
        <Tarjeta titulo="Escríbenos" extra={<Mail size={17} className="muted" />}>
          <form className="form1" onSubmit={enviar}>
            <p className="muted">Te contesta una persona del equipo de Agutidesigns, en Cornellà. También en <b>info@agutidesigns.io</b>.</p>
            <label className="campo"><span>¿En qué te ayudamos?</span><textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Cuéntanos qué necesitas…" /></label>
            <div className="fila-btn"><button className="btn btn--pri">Enviar</button>{st && <span className="muted">{st}</span>}</div>
          </form>
        </Tarjeta>
      </div>
      {video && <VideoModal id={video} cerrar={() => setVideo(null)} />}
    </div>
  );
}


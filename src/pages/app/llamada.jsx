// «Habla con tu oficina»: chat directo en el Inicio y llamada por voz (escucha, contesta hablando y vuelve a escuchar).
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Maximize2, MessageSquareText, Mic, MicOff, Phone, PhoneOff, Send, Sparkles, X } from 'lucide-react';
import { api } from './datos';
import { hora, uid } from './formato';
import { respuestaDemo, responderDemo } from './demoChat';
import { Puntos } from './ui';

const Reconocedor = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const puedeGrabar = typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia;
const tipoAudio = () => (typeof MediaRecorder === 'undefined' ? '' : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '');
const aB64 = (blob) => new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1] || ''); r.readAsDataURL(blob); });

export async function preguntar(o, texto, voz) {
  if (o.demo) return { respuesta: await responderDemo(o, texto, o.chat.filter((m) => !m.depto).slice(-8)), audio: null };
  return api('equipo', { texto, voz });
}
export function anotar(o, de, texto, extra = {}) { o.setEstado((s) => ({ ...s, chat: [...s.chat, { id: uid(de), de, texto, creado: new Date().toISOString(), ...extra }] })); }
// Mejor voz española del navegador (solo para la demo, sin servidor).
function vozNavegador() {
  const vs = window.speechSynthesis?.getVoices?.() || [];
  const es = vs.filter((v) => /^es(-ES|_ES)?$/i.test(v.lang) || v.lang === 'es-ES');
  return es.find((v) => /google|mónica|monica|paulina|marisol|elvira|helena/i.test(v.name)) || es[0] || vs.find((v) => v.lang?.startsWith('es')) || null;
}

// Llamada: escucha con el micrófono (detecta cuándo empiezas y acabas de hablar), lo transcribe en el servidor,
// contesta con los datos reales y lo dice con una voz natural. Puedes interrumpirla hablando.
export function Llamada({ o, cerrar }) {
  const [estado, setEstado] = useState('conectando'); // escuchando · oyendo · pensando · hablando · parado
  const [turnos, setTurnos] = useState([]); const [nivel, setNivel] = useState(0); const [muteado, setMuteado] = useState(false); const [err, setErr] = useState(''); const [txt, setTxt] = useState('');
  const vivo = useRef(true); const est = useRef('conectando'); const mute = useRef(false); const hist = useRef([]);
  const stream = useRef(null); const ctx = useRef(null); const an = useRef(null); const rec = useRef(null); const trozos = useRef([]); const audio = useRef(null); const raf = useRef(0);
  const conv = useRef(null);
  useEffect(() => { conv.current?.scrollTo({ top: conv.current.scrollHeight, behavior: 'smooth' }); });
  const vad = useRef({ suelo: 0.01, hablando: false, ini: 0, ultimaVoz: 0, inicioTurno: 0, fuerte: 0 }); const recWeb = useRef(null);
  const fijar = (e) => { est.current = e; setEstado(e); };
  const servidor = puedeGrabar;
  const vozDemo = (t) => api('demo-voz', { op: 'hablar', texto: t }).then((j) => j.audio).catch(() => null);
  const pasa = (de, texto) => { hist.current = [...hist.current, { de, texto }].slice(-10); setTurnos((t) => [...t, { id: uid(de), de, texto }].slice(-6)); };

  // ---------- hablar ----------
  function hablar(texto, b64) {
    fijar('hablando');
    return new Promise((fin) => {
      const acabar = () => { cancelAnimationFrame(raf.current); setNivel(0); fin(); };
      if (b64) {
        const a = new Audio(`data:audio/mpeg;base64,${b64}`); audio.current = a;
        a.onended = acabar; a.onerror = acabar; a.play().catch(acabar);
        const tic = () => { if (!audio.current || audio.current.paused) return; setNivel(0.35 + Math.random() * 0.35); raf.current = requestAnimationFrame(() => setTimeout(tic, 90)); }; tic();
      } else if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(texto); u.lang = 'es-ES'; u.rate = 1.04; const v = vozNavegador(); if (v) u.voice = v;
        const pul = setInterval(() => setNivel(0.25 + Math.random() * 0.4), 120); u.onend = () => { clearInterval(pul); acabar(); }; u.onerror = () => { clearInterval(pul); acabar(); };
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      } else acabar();
    });
  }
  function callar() { audio.current?.pause(); audio.current = null; window.speechSynthesis?.cancel(); cancelAnimationFrame(raf.current); setNivel(0); }

  // ---------- contestar ----------
  async function responder(r) {
    if (!vivo.current) return;
    if (r.oido) pasa('tu', r.oido);
    if (r.respuesta) { pasa('equipo', r.respuesta); if (r.oido) { anotar(o, 'tu', r.oido); anotar(o, 'equipo', r.respuesta, r.accion ? { detalle: { accion: r.accion } } : {}); } await hablar(r.respuesta, r.audio); }
    if (vivo.current) escuchar();
  }
  async function enviarTexto(t) {
    callar(); fijar('pensando'); pasa('tu', t); anotar(o, 'tu', t);
    try {
      let r; if (o.demo) { const resp = await responderDemo(o, t, hist.current.slice(0, -1), { hablado: true }); r = { respuesta: resp, audio: await vozDemo(resp) }; } else r = await api('llamada', { texto: t, historial: hist.current.slice(0, -1) });
      if (!vivo.current) return; pasa('equipo', r.respuesta); anotar(o, 'equipo', r.respuesta, r.accion ? { detalle: { accion: r.accion } } : {}); await hablar(r.respuesta, r.audio);
    } catch (e) { setErr(e.message); }
    if (vivo.current) escuchar();
  }
  async function enviarAudio(blob) {
    fijar('pensando');
    try {
      const b64 = await aB64(blob); let r;
      if (o.demo) { const j = await api('demo-voz', { op: 'oir', audio: b64, mime: blob.type }); r = { oido: j.oido }; if (j.oido) { r.respuesta = await responderDemo(o, j.oido, hist.current, { hablado: true }); r.audio = await vozDemo(r.respuesta); } }
      else r = await api('llamada', { audio: b64, mime: blob.type, historial: hist.current });
      if (!r.oido) { if (vivo.current) escuchar(); return; }
      await responder(r);
    } catch (e) { setErr(e.message); if (vivo.current) escuchar(); }
  }

  // ---------- escuchar (servidor: grabación con detección de voz; demo: reconocimiento del navegador) ----------
  function escuchar() {
    if (!vivo.current || mute.current) { fijar('parado'); return; }
    if (servidor) {
      const t = tipoAudio();
      if (!stream.current) { fijar('parado'); return; }
      let r; try { r = new MediaRecorder(stream.current, t ? { mimeType: t } : undefined); } catch { r = new MediaRecorder(stream.current); }
      const mios = []; trozos.current = mios; rec.current = r;
      r.ondataavailable = (e) => { if (e.data.size) mios.push(e.data); };
      r.onstop = () => { if (!vivo.current || r._descartar) return; const b = new Blob(mios, { type: r.mimeType || 'audio/webm' }); if (r._conVoz) enviarAudio(b); else escuchar(); };
      r.start(250); Object.assign(vad.current, { hablando: false, ini: 0, ultimaVoz: 0, inicioTurno: performance.now() }); fijar('escuchando');
      return;
    }
    if (!Reconocedor) { fijar('parado'); setErr('Tu navegador no permite hablar por voz aquí. Escribe abajo y te contesto hablando.'); return; }
    const r = new Reconocedor(); r.lang = 'es-ES'; r.interimResults = true; r.continuous = false; recWeb.current = r; let final = '';
    r.onresult = (e) => { let t = ''; for (const x of e.results) { t += x[0].transcript; if (x.isFinal) final = t; } setTurnos((tt) => { const c = [...tt]; if (c.at(-1)?.vivo) c[c.length - 1] = { ...c.at(-1), texto: t }; else c.push({ id: 'vivo', de: 'tu', texto: t, vivo: true }); return c.slice(-6); }); };
    r.onerror = (e) => { if (e.error === 'not-allowed') { setErr('Necesitamos permiso para usar el micrófono.'); fijar('parado'); } };
    r.onend = () => { if (!vivo.current) return; setTurnos((tt) => tt.filter((x) => !x.vivo)); if (final.trim()) enviarTexto(final.trim()); else if (est.current === 'escuchando') setTimeout(escuchar, 200); };
    try { r.start(); fijar('escuchando'); } catch { /* ya escuchaba */ }
  }

  // Bucle de nivel del micrófono: dibuja la esfera, detecta inicio y fin de frase y permite interrumpir hablando.
  function bucle() {
    if (!vivo.current || !an.current) return;
    const d = new Float32Array(an.current.fftSize); an.current.getFloatTimeDomainData(d);
    const rms = Math.sqrt(d.reduce((a, x) => a + x * x, 0) / d.length); const v = vad.current; const ahora = performance.now();
    if (est.current === 'escuchando' || est.current === 'oyendo') {
      if (!v.hablando) v.suelo = v.suelo * 0.97 + Math.min(rms, 0.05) * 0.03;
      const umbral = Math.max(0.012, v.suelo * 2.2);
      setNivel(Math.min(1, rms * 9));
      if (rms > umbral) { if (!v.ini) v.ini = ahora; if (ahora - v.ini > 150 && !v.hablando) { v.hablando = true; fijar('oyendo'); } v.ultimaVoz = ahora; } else if (!v.hablando) v.ini = 0;
      const silencio = ahora - v.ultimaVoz;
      if (v.hablando && (silencio > 1100 || ahora - v.inicioTurno > 25000)) { if (rec.current?.state === 'recording') { rec.current._conVoz = true; rec.current.stop(); } v.hablando = false; }
      else if (!v.hablando && ahora - v.inicioTurno > 15000 && rec.current?.state === 'recording') { rec.current._conVoz = false; rec.current.stop(); } // descarta silencio largo
    } else if (est.current === 'hablando') {
      // Interrumpir: voz fuerte sostenida mientras habla la oficina.
      if (rms > Math.max(0.06, v.suelo * 6)) { v.fuerte += 1; if (v.fuerte > 8) { v.fuerte = 0; callar(); escuchar(); } } else v.fuerte = 0;
    }
    raf.current = requestAnimationFrame(bucle);
  }

  function interrumpir() { if (est.current === 'hablando') { callar(); escuchar(); } else if (est.current === 'parado' && !mute.current) escuchar(); }
  function alternarMicro() {
    const m = !mute.current; mute.current = m; setMuteado(m);
    if (m) { if (rec.current?.state === 'recording') { rec.current._descartar = true; rec.current.stop(); } recWeb.current?.abort?.(); fijar('parado'); } else escuchar();
  }
  function colgar() {
    vivo.current = false; callar(); try { if (rec.current?.state === 'recording') rec.current.stop(); } catch { /* */ } recWeb.current?.abort?.();
    stream.current?.getTracks().forEach((t) => t.stop()); ctx.current?.close?.().catch(() => {}); cerrar();
  }

  useEffect(() => {
    vivo.current = true;
    (async () => {
      if (servidor) {
        try {
          stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
          ctx.current = new (window.AudioContext || window.webkitAudioContext)(); const src = ctx.current.createMediaStreamSource(stream.current);
          an.current = ctx.current.createAnalyser(); an.current.fftSize = 1024; src.connect(an.current); raf.current = requestAnimationFrame(bucle);
        } catch { setErr('Necesitamos permiso para usar el micrófono. Mientras, puedes escribir abajo.'); }
      }
      let saludo; try { if (o.demo) { const t = `Hola, aquí tu oficina de ${o.negocio.nombre}. ¿Qué necesitas?`; saludo = { respuesta: t, audio: await vozDemo(t) }; } else saludo = await api('llamada', { op: 'saludo' }); } catch { saludo = { respuesta: '¿Sí? Dime, te escucho.' }; }
      if (!vivo.current) return; pasa('equipo', saludo.respuesta); await hablar(saludo.respuesta, saludo.audio); if (vivo.current) escuchar();
    })();
    return () => { vivo.current = false; callar(); try { if (rec.current?.state === 'recording') rec.current.stop(); } catch { /* */ } recWeb.current?.abort?.(); stream.current?.getTracks().forEach((t) => t.stop()); ctx.current?.close?.().catch(() => {}); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [verTexto, setVerTexto] = useState(false); const [verHist, setVerHist] = useState(() => window.innerWidth > 1100);
  const [seg, setSeg] = useState(0);
  useEffect(() => { const i = setInterval(() => setSeg((x) => x + 1), 1000); return () => clearInterval(i); }, []);
  const reloj = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
  const fase = estado === 'oyendo' ? 'escuchando' : estado;
  const lienzo = useRef(null); const visual = useRef({ nivel: 0, fase: 'escuchando' });
  visual.current = { nivel, fase: fase === 'conectando' ? 'parado' : fase };
  useEffect(() => { let limpiar = () => {}; let fuera = false; import('./orbeParticulas').then(({ montarOrbe }) => { if (!fuera && lienzo.current) limpiar = montarOrbe(lienzo.current, () => visual.current); }); return () => { fuera = true; limpiar(); }; }, []);
  const etiqueta = { conectando: 'Conectando', escuchando: 'Te escucho', pensando: 'Pensando', hablando: 'Hablando', parado: muteado ? 'Micrófono apagado' : 'En pausa · toca para seguir' }[fase];
  const ultimo = turnos.at(-1);
  return (
    <div className={`llv is-${fase}`} role="dialog" aria-modal="true" aria-label="Llamada con tu oficina" style={{ '--n': nivel }}>
      <header className="llv__top">
        <div className="llv__quien"><span className="llv__av">{o.negocio.nombre.slice(0, 1).toUpperCase()}</span><div><b>Tu oficina</b><small>{o.negocio.nombre}</small></div></div>
        <span className="llv__pill"><i />{reloj}</span>
        <div className="llv__acc"><button type="button" className={`llv__ico ${verHist ? 'is-on' : ''}`} onClick={() => setVerHist(!verHist)} aria-pressed={verHist} aria-label="Ver la conversación"><MessageSquareText size={18} /></button></div>
      </header>
      <main className="llv__centro">
        <button type="button" className="llv__orbe" onClick={interrumpir} aria-label={fase === 'hablando' ? 'Interrumpir y hablar' : 'Volver a escuchar'}>
          <canvas ref={lienzo} className="llv__lienzo" aria-hidden="true" />
        </button>
        <p className="llv__estado"><i />{etiqueta}{fase === 'pensando' && <Puntos />}</p>
        <div className="llv__subt" aria-live="polite">
          {ultimo ? <><small>{ultimo.de === 'tu' ? 'Tú' : 'Tu oficina'}</small><p key={ultimo.id}>{ultimo.texto}</p></> : <p className="llv__vacio">Pregúntale por tus citas, las reseñas o pídele un post.</p>}
        </div>
        {err && <p className="llv__err">{err}</p>}
      </main>
      {verHist && (
        <aside className="llv__hist" aria-label="Conversación">
          <header><b>Conversación</b><button type="button" className="llv__ico" onClick={() => setVerHist(false)} aria-label="Cerrar"><X size={16} /></button></header>
          <div className="llv__lista" ref={conv}>{turnos.length ? turnos.map((t) => <div key={t.id} className={`llv__t llv__t--${t.de}`}><small>{t.de === 'tu' ? 'Tú' : 'Tu oficina'}</small><p>{t.texto}</p></div>) : <p className="llv__vacio">Aquí verás lo que dices y lo que te contesta.</p>}</div>
        </aside>
      )}
      <footer className="llv__dock">
        {verTexto && (
          <form className="llv__txt" onSubmit={(e) => { e.preventDefault(); if (txt.trim()) { if (rec.current?.state === 'recording') { rec.current._descartar = true; rec.current.stop(); } recWeb.current?.abort?.(); enviarTexto(txt.trim()); setTxt(''); } }}>
            <input autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Escribe y te contesto hablando…" aria-label="Escribir" /><button aria-label="Enviar"><Send size={15} /></button>
          </form>
        )}
        <div className="llv__botones">
          <button type="button" className={`llv__b ${muteado ? 'is-off' : ''}`} onClick={alternarMicro} aria-label={muteado ? 'Activar micrófono' : 'Silenciar micrófono'}>{muteado ? <MicOff size={20} /> : <Mic size={20} />}<span>{muteado ? 'Activar' : 'Silenciar'}</span></button>
          <button type="button" className={`llv__b ${verTexto ? 'is-on' : ''}`} onClick={() => setVerTexto(!verTexto)} aria-pressed={verTexto} aria-label="Escribir"><Keyboard size={20} /><span>Escribir</span></button>
          <button type="button" className="llv__b llv__b--colgar" onClick={colgar} aria-label="Colgar"><PhoneOff size={20} /><span>Colgar</span></button>
        </div>
        <p className="llv__pista">Habla con normalidad: cuando te callas, contesta. Para cortarla, habla encima o toca el círculo.</p>
      </footer>
    </div>
  );
}

export function HablaConTuOficina({ o }) {
  const [t, setT] = useState(''); const [esc, setEsc] = useState(false); const [llamada, setLlamada] = useState(false); const fin = useRef(null);
  const ult = o.chat.slice(-4);
  useEffect(() => { fin.current?.scrollIntoView({ block: 'nearest' }); }, [o.chat.length, esc]);
  async function enviar(e) {
    e.preventDefault(); const x = t.trim(); if (!x || esc) return; setT(''); setEsc(true); anotar(o, 'tu', x);
    try { const r = await preguntar(o, x, false); anotar(o, 'equipo', r.respuesta, r.accion ? { detalle: { accion: r.accion } } : {}); } catch (er) { anotar(o, 'equipo', er.message); }
    setEsc(false);
  }
  return (
    <section className="hb">
      <div className="hb__l">
        <span className="hb__k"><Sparkles size={14} /> Tu oficina</span>
        <h2>Habla con tu oficina</h2>
        <p>Pregunta lo que quieras o pide trabajo. Por escrito o en una llamada, como si tuvieras a tu equipo al lado.</p>
        <button className="btn hb__llamar" onClick={() => setLlamada(true)}><Phone size={17} /> Llamar a mi oficina</button>
      </div>
      <div className="hb__chat">
        <div className="hb__m">
          {!ult.length && <p className="hb__vacio">«¿Qué habéis hecho hoy?» · «¿Qué citas tengo mañana?» · «Hazme un post sobre…»</p>}
          {ult.map((m) => <div key={m.id} className={`hb-b hb-b--${m.de}`}><p>{m.texto}</p><time>{hora(m.creado)}</time></div>)}
          {esc && <div className="hb-b hb-b--equipo"><p><Puntos /></p></div>}
          <div ref={fin} />
        </div>
        <form className="hb__in" onSubmit={enviar}><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Escribe a tu oficina…" aria-label="Mensaje a tu oficina" />
          <button className="btn btn--pri" aria-label="Enviar" disabled={esc}><Send size={16} /></button>
          <button type="button" className="ico" onClick={() => o.ir('chat')} aria-label="Abrir el chat completo"><Maximize2 size={16} /></button></form>
      </div>
      {llamada && <Llamada o={o} cerrar={() => setLlamada(false)} />}
    </section>
  );
}

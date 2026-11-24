// «Habla con tu oficina»: chat directo en el Inicio y llamada por voz (escucha, contesta hablando y vuelve a escuchar).
import { useEffect, useRef, useState } from 'react';
import { Maximize2, Mic, MicOff, Phone, PhoneOff, Send, Sparkles } from 'lucide-react';
import { api } from './datos';
import { hora, uid } from './formato';
import { respuestaDemo } from './demoChat';
import { Puntos } from './ui';

const Reconocedor = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

async function preguntar(o, texto, voz) {
  if (o.demo) { await new Promise((r) => setTimeout(r, 900)); return { respuesta: respuestaDemo(o, texto), audio: null }; }
  return api('equipo', { texto, voz });
}
function anotar(o, de, texto, extra = {}) { o.setEstado((s) => ({ ...s, chat: [...s.chat, { id: uid(de), de, texto, creado: new Date().toISOString(), ...extra }] })); }

export function Llamada({ o, cerrar }) {
  const [estado, setEstado] = useState('conectando'); // escuchando · pensando · hablando · parado
  const [oido, setOido] = useState(''); const [dicho, setDicho] = useState(''); const [nivel, setNivel] = useState(0); const [muteado, setMuteado] = useState(false); const [err, setErr] = useState('');
  const rec = useRef(null); const audio = useRef(null); const vivo = useRef(true); const raf = useRef(0); const ctx = useRef(null);
  const escuchar = () => {
    if (!vivo.current || muteRef.current) { setEstado('parado'); return; }
    if (!Reconocedor) { setEstado('parado'); setErr('Tu navegador no permite hablar por voz. Usa Chrome, Edge o Safari, o escribe abajo.'); return; }
    const r = new Reconocedor(); r.lang = 'es-ES'; r.interimResults = true; r.continuous = false; rec.current = r; let final = '';
    r.onresult = (e) => { let t = ''; for (const x of e.results) { t += x[0].transcript; if (x.isFinal) final = t; } setOido(t); };
    r.onerror = (e) => { if (e.error === 'not-allowed') { setErr('Necesitamos permiso para usar el micrófono.'); setEstado('parado'); } };
    r.onend = () => { if (!vivo.current) return; if (final.trim()) enviar(final.trim()); else if (estadoRef.current === 'escuchando') setTimeout(escuchar, 200); };
    try { r.start(); setEstado('escuchando'); setOido(''); } catch { /* ya estaba escuchando */ }
  };
  const estadoRef = useRef(estado); const muteRef = useRef(muteado);
  useEffect(() => { estadoRef.current = estado; }, [estado]);
  useEffect(() => { muteRef.current = muteado; }, [muteado]);
  async function enviar(t) {
    setEstado('pensando'); anotar(o, 'tu', t);
    try {
      const r = await preguntar(o, t, true); if (!vivo.current) return;
      setDicho(r.respuesta); anotar(o, 'equipo', r.respuesta);
      await hablar(r.respuesta, r.audio);
    } catch (e) { setErr(e.message); }
    if (vivo.current) escuchar();
  }
  function hablar(texto, b64) {
    setEstado('hablando');
    return new Promise((fin) => {
      if (b64) {
        const a = new Audio(`data:audio/mpeg;base64,${b64}`); audio.current = a;
        try { ctx.current = ctx.current || new (window.AudioContext || window.webkitAudioContext)(); const src = ctx.current.createMediaElementSource(a); const an = ctx.current.createAnalyser(); an.fftSize = 256; src.connect(an); an.connect(ctx.current.destination);
          const d = new Uint8Array(an.frequencyBinCount); const tic = () => { an.getByteFrequencyData(d); setNivel(d.reduce((x, y) => x + y, 0) / d.length / 255); raf.current = requestAnimationFrame(tic); }; tic(); } catch { /* sin analizador */ }
        a.onended = () => { cancelAnimationFrame(raf.current); setNivel(0); fin(); }; a.onerror = () => fin(); a.play().catch(() => fin());
      } else if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(texto); u.lang = 'es-ES'; u.rate = 1.05; u.onend = fin; u.onerror = fin;
        const pul = setInterval(() => setNivel(0.25 + Math.random() * 0.4), 120); u.onend = () => { clearInterval(pul); setNivel(0); fin(); }; window.speechSynthesis.speak(u);
      } else fin();
    });
  }
  function interrumpir() { audio.current?.pause(); window.speechSynthesis?.cancel(); cancelAnimationFrame(raf.current); setNivel(0); rec.current?.abort?.(); setTimeout(escuchar, 150); }
  function alternarMicro() { const m = !muteado; setMuteado(m); if (m) { rec.current?.abort?.(); setEstado('parado'); } else setTimeout(() => { muteRef.current = false; escuchar(); }, 100); }
  function colgar() { vivo.current = false; audio.current?.pause(); window.speechSynthesis?.cancel(); rec.current?.abort?.(); cancelAnimationFrame(raf.current); cerrar(); }
  useEffect(() => {
    vivo.current = true;
    const saludo = `Hola, aquí tu oficina de ${o.negocio.nombre}. ¿En qué te ayudamos?`;
    const t = setTimeout(async () => { setDicho(saludo); await hablar(saludo, null); escuchar(); }, 500);
    return () => { vivo.current = false; clearTimeout(t); audio.current?.pause(); window.speechSynthesis?.cancel(); rec.current?.abort?.(); cancelAnimationFrame(raf.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [txt, setTxt] = useState('');
  const etiqueta = { conectando: 'Conectando…', escuchando: 'Te escucho…', pensando: 'Pensando…', hablando: 'Hablando…', parado: muteado ? 'Micrófono apagado' : 'En pausa' }[estado];
  return (
    <div className="ll" role="dialog" aria-modal="true" aria-label="Llamada con tu oficina">
      <header className="ll__h"><span className="ll__dot" /> Llamada con tu oficina · {o.negocio.nombre}</header>
      <button type="button" className={`ll__orbe is-${estado}`} style={{ '--n': nivel }} onClick={interrumpir} aria-label={estado === 'hablando' ? 'Interrumpir y hablar' : 'Volver a escuchar'}>
        <i /><i /><i /><span />
      </button>
      <p className="ll__estado">{etiqueta}{estado === 'pensando' && <Puntos />}</p>
      <p className="ll__oido">{estado === 'escuchando' || estado === 'pensando' ? (oido ? `«${oido}»` : 'Habla cuando quieras') : dicho}</p>
      {err && <p className="ll__err">{err}</p>}
      <form className="ll__txt" onSubmit={(e) => { e.preventDefault(); if (txt.trim()) { rec.current?.abort?.(); enviar(txt.trim()); setTxt(''); } }}>
        <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="O escríbelo aquí…" aria-label="Escribir" /><button aria-label="Enviar"><Send size={16} /></button>
      </form>
      <div className="ll__ctl">
        <button type="button" className={`ll__b ${muteado ? 'is-on' : ''}`} onClick={alternarMicro} aria-label={muteado ? 'Activar micrófono' : 'Silenciar micrófono'}>{muteado ? <MicOff size={22} /> : <Mic size={22} />}</button>
        <button type="button" className="ll__b ll__b--colgar" onClick={colgar} aria-label="Colgar"><PhoneOff size={24} /></button>
      </div>
      <p className="ll__pista">Toca la esfera para interrumpir. Te contesta con los datos reales de tu oficina.</p>
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

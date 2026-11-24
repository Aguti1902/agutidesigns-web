// Vuelta de Stripe tras pagar: termina el alta y manda el enlace de acceso al panel.
import { useEffect, useState } from 'react';
import { Check, Mail } from 'lucide-react';
import useSeo from '../../hooks/useSeo';
import './Panel.css';

export default function Bienvenida() {
  useSeo({ title: 'Tu oficina de IA está lista | Agutidesigns', description: 'Alta completada.', path: '/app/bienvenida', noindex: true });
  const [st, setSt] = useState({ fase: 'cargando' });
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id');
    if (!id) { setSt({ fase: 'error', msg: 'Falta la referencia del pago.' }); return; }
    (async () => {
      try {
        const r = await fetch(`/api/oficina/alta?session_id=${encodeURIComponent(id)}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'No hemos podido terminar el alta.');
                setSt({ fase: 'ok', ...j });
      } catch (e) { setSt({ fase: 'error', msg: e.message }); }
    })();
  }, []);
  return (
    <main className="acceso">
      <a href="/" className="acceso__logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="132" height="36" /></a>
      <div className="acceso__c">
        {st.fase === 'cargando' && <p className="fila-btn"><span className="spin" /> Preparando tu oficina…</p>}
        {st.fase === 'ok' && (<>
          <p className="muted">Pago completado</p>
          <h1>¡{st.nombre} ya tiene oficina de IA!</h1>
          <p className="acceso__ok"><Mail size={18} /> Te hemos enviado un enlace a <b>{st.email}</b>. Ábrelo para entrar en tu panel.</p>
          <ul className="acceso__lista">
            <li><Check size={15} /> Entra en tu panel con el enlace del correo</li>
            <li><Check size={15} /> Cuéntales a tus agentes cómo es tu negocio (3 minutos)</li>
            <li><Check size={15} /> Conecta tus cuentas y mira a tus agentes trabajar</li>
          </ul>
        </>)}
        {st.fase === 'error' && (<>
          <h1>Algo no ha ido bien</h1>
          <p>{st.msg} Si el pago se ha hecho, no te preocupes: escríbenos a <b>info@agutidesigns.io</b> y lo dejamos listo enseguida.</p>
        </>)}
      </div>
    </main>
  );
}

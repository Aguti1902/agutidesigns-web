// Vuelta de Stripe tras pagar: termina el alta y manda el enlace de acceso al panel.
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import useSeo from '../../hooks/useSeo';
import { eventoPixel } from '../../utils/metaPixel';
import { supabase } from '../../lib/oficinaSupabase';
import { rutaPanel } from '../../lib/panelRuta';
import { useNavigate } from 'react-router-dom';
import './Panel.css';

export default function Bienvenida() {
  useSeo({ title: 'Tu oficina de IA está lista | Agutidesigns', description: 'Alta completada.', path: '/app/bienvenida', noindex: true });
  const [st, setSt] = useState({ fase: 'cargando' }); const [yo, setYo] = useState(''); const nav = useNavigate();
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setYo(data.session?.user?.email?.toLowerCase() || '')); }, []);
  // Alta hecha: al panel. Si ya hay sesión (Google o contraseña) entra solo; si no, verá el acceso.
  useEffect(() => { if (st.fase !== 'ok') return undefined; const t = setTimeout(() => nav(rutaPanel(''), { replace: true }), 2200); return () => clearTimeout(t); }, [st.fase, nav]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id');
    if (!id) { setSt({ fase: 'error', msg: 'Falta la referencia del pago.' }); return; }
    (async () => {
      try {
        const r = await fetch(`/api/oficina/alta?session_id=${encodeURIComponent(id)}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'No hemos podido terminar el alta.');
        setSt({ fase: 'ok', ...j });
        eventoPixel('CompleteRegistration', { content_name: 'Oficina de IA' }); eventoPixel('StartTrial', { content_name: 'Oficina de IA' });
      } catch (e) { setSt({ fase: 'error', msg: e.message }); }
    })();
  }, []);
  return (
    <main className="acceso">
      <a href="/" className="acceso__logo"><img src="/images/logoazul.png" alt="Agutidesigns" width="132" height="36" /></a>
      <div className="acceso__c">
        {st.fase === 'cargando' && <p className="fila-btn"><span className="spin" /> Preparando tu oficina…</p>}
        {st.fase === 'ok' && (<>
          <p className="muted">{yo ? 'Todo listo' : 'Registro completado'}</p>
          <h1>¡{st.nombre} ya tiene oficina de IA!</h1>
          <p className="fila-btn"><span className="spin" /> Entrando en tu oficina…</p>
          <a className="btn btn--pri btn--ancho" href={rutaPanel('')}>Entrar ahora</a>
          <ul className="acceso__lista">
            <li><Check size={15} /> Cuéntales a tus agentes cómo es tu negocio (3 minutos)</li>
            <li><Check size={15} /> Conecta tus cuentas y mira a tus agentes trabajar</li>
            <li><Check size={15} /> Si has elegido el plan mensual, tienes 7 días gratis: no se te cobra nada hasta el día 8</li>
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

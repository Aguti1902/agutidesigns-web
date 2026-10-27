// Captación de leads de la web (formularios SEO, blog, casos y chat IA).
// 1) Guarda en Supabase (clinicas_leads) si está disponible.
// 2) Siempre avisa por email a Aguti — el agente de sincronización lee estos
//    avisos ("[Lead web]") y los pasa al panel. Así no se pierde ningún lead
//    aunque la base de datos esté pausada.
import { Resend } from 'resend';

const NOTIFY_TO = process.env.LEAD_NOTIFY_TO || 'agutierrezgomez00@gmail.com';
const FROM = 'Web Agutidesigns <info@agutidesigns.io>';
const clean = (v, n = 500) => (typeof v === 'string' ? v.trim().slice(0, n) : '') || null;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (b.hp) return res.status(200).json({ ok: true }); // honeypot

  const lead = {
    nombre: clean(b.nombre, 120),
    clinica: clean(b.negocio, 160),
    ciudad: clean(b.ciudad, 80),
    email: clean(b.email, 160),
    telefono: clean(b.telefono, 40),
    web_actual: clean(b.web, 200),
    pacientes_objetivo: null,
    situacion: clean(b.situacion, 1500),
    fuente: clean(b.fuente, 120) || 'web',
  };
  const validEmail = /^\S+@\S+\.\S+$/.test(lead.email || '');
  const validPhone = (lead.telefono || '').replace(/\D/g, '').length >= 9;
  if (!validEmail && !validPhone) return res.status(400).json({ error: 'Falta email o teléfono' });

  let db = false;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/clinicas_leads`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(lead),
      });
      db = r.ok;
    } catch { db = false; }
  }

  let mail = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const rows = Object.entries(lead).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#888">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`).join('');
      const { error } = await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        replyTo: validEmail ? lead.email : undefined,
        subject: `[Lead web] ${lead.clinica || lead.nombre || 'Nuevo contacto'} · ${lead.fuente}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:14px"><p>Nuevo lead desde agutidesigns.io</p><table>${rows}</table>
<p style="color:#888;font-size:12px">Guardado en base de datos: ${db ? 'sí' : 'no'}</p>
<pre style="display:none">LEAD_JSON:${esc(JSON.stringify(lead))}</pre></div>`,
        text: `Nuevo lead desde agutidesigns.io\n\nLEAD_JSON:${JSON.stringify(lead)}`,
      });
      mail = !error;
    } catch { mail = false; }
  }

  if (!db && !mail) return res.status(502).json({ error: 'No se pudo registrar' });
  return res.status(200).json({ ok: true, db, mail });
}

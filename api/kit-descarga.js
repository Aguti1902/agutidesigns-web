// Descarga del Kit Oficina de IA tras pagar en Stripe.
//  1) /api/kit-descarga?session_id=cs_...  → comprueba en Stripe que la sesión está pagada y es el kit,
//     devuelve un enlace de descarga firmado (7 días) y, si ?enviar=1, lo manda por correo al comprador
//     y avisa a Agutidesigns de la venta.
//  2) /api/kit-descarga?t=<token>           → valida la firma y descarga el zip (privado/, fuera de public/).
// Necesita STRIPE_SECRET_KEY (clave restringida con lectura de Checkout Sessions basta) y RESEND_API_KEY.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Resend } from 'resend';

const MONEDA = 'eur';
// Payment Link de Stripe → plan del kit (importe en céntimos, IVA incluido)
const PLANES = {
  plink_1UbN3tFjBSJ299OpGNCHfz0v: { plan: 'Starter', agentes: 4, centimos: 2900 },
  plink_1UbMvAFjBSJ299OpNgxyVOYG: { plan: 'Pro', agentes: 8, centimos: 4700 },
  plink_1UbN3uFjBSJ299Op4gIhQUEz: { plan: 'Empresa', agentes: 12, centimos: 8000 },
};
const PLAN_POR_NOMBRE = Object.fromEntries(Object.values(PLANES).map((p) => [p.plan, p]));
const zipDe = (plan) => path.join(process.cwd(), 'privado', `Kit-Oficina-IA-${plan}.zip`);
const SITIO = 'https://agutidesigns.io';
const FROM = 'Alejandro de Agutidesigns <info@agutidesigns.io>';
const DIAS = 7;

const b64u = (s) => Buffer.from(s).toString('base64url');
const firma = (datos, clave) => crypto.createHmac('sha256', clave).update(datos).digest('base64url');

function crearToken(sessionId, plan, clave) {
  const datos = b64u(JSON.stringify({ s: sessionId, p: plan, e: Date.now() + DIAS * 864e5 }));
  return `${datos}.${firma(datos, clave)}`;
}
function leerToken(t, clave) {
  const [datos, f] = String(t || '').split('.');
  if (!datos || !f) return null;
  const esperada = firma(datos, clave);
  if (f.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada))) return null;
  try { const o = JSON.parse(Buffer.from(datos, 'base64url').toString()); return o.e > Date.now() ? o : null; } catch { return null; }
}

async function sesionPagada(id, clave) {
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id || '')) return null;
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${clave}` } });
  if (!r.ok) return null;
  const s = await r.json();
  const p = PLANES[s.payment_link];
  const ok = p && s.payment_status === 'paid' && s.amount_total === p.centimos && s.currency === MONEDA;
  return ok ? { s, p } : null;
}

function correoHtml(url, p) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4f6fa;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:#070b16;padding:28px 32px;color:#fff"><div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#8fb0ff;font-weight:700">Kit Oficina de IA · ${p.plan}</div>
<div style="font-size:26px;font-weight:800;margin-top:6px">¡Tu oficina de IA ya es tuya!</div></td></tr>
<tr><td style="padding:28px 32px;color:#3d4458;font-size:15px;line-height:1.6">
<p style="margin:0 0 14px">Gracias por tu compra. Aquí tienes tu kit: el panel con la oficina 3D, los ${p.agentes} agentes y la guía de instalación paso a paso.</p>
<p style="margin:0 0 22px"><a href="${url}" style="display:inline-block;background:#2f6bff;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px">Descargar el kit</a></p>
<p style="margin:0 0 10px"><b>Por dónde empezar:</b> abre <b>EMPIEZA-AQUI.md</b> y la guía en PDF. En unos 30-60 minutos lo tienes funcionando con Claude.</p>
<p style="margin:0 0 10px;font-size:13px;color:#6b7286">El enlace caduca en ${DIAS} días: descárgalo y guárdalo. Si tienes cualquier problema, responde a este correo.</p>
<p style="margin:18px 0 0">Un abrazo,<br>Alejandro · Agutidesigns</p></td></tr></table></td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) return res.status(503).json({ error: 'La descarga aún no está activada. Escríbenos a info@agutidesigns.io y te lo enviamos.' });

  // 2) Descarga con token firmado
  if (req.query.t) {
    const tok = leerToken(req.query.t, clave);
    if (!tok) return res.status(403).send('Este enlace de descarga no es válido o ha caducado. Escríbenos a info@agutidesigns.io.');
    const plan = PLAN_POR_NOMBRE[tok.p] ? tok.p : 'Pro';
    const ZIP = zipDe(plan);
    if (!fs.existsSync(ZIP)) return res.status(500).send('No encontramos el archivo. Escríbenos a info@agutidesigns.io.');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Kit-Oficina-IA-${plan}.zip"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return fs.createReadStream(ZIP).pipe(res);
  }

  // 1) Comprobar la compra
  const r = await sesionPagada(req.query.session_id, clave).catch(() => null);
  if (!r) return res.status(402).json({ error: 'No encontramos un pago completado para esta compra.' });
  const { s, p } = r;
  const url = `${SITIO}/api/kit-descarga?t=${crearToken(s.id, p.plan, clave)}`;
  const email = s.customer_details?.email || '';
  const nombre = s.customer_details?.name || '';

  if (req.query.enviar === '1' && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await Promise.allSettled([
      email && resend.emails.send({ from: FROM, to: email, subject: `Tu Kit Oficina de IA (${p.plan}): descárgalo aquí`, html: correoHtml(url, p) }),
      resend.emails.send({ from: FROM, to: 'info@agutidesigns.io', subject: `[Nueva venta] Kit Oficina de IA ${p.plan} (${p.centimos / 100} €) — ${nombre || email}`,
        text: `${nombre || 'Alguien'} (${email}) ha comprado el Kit Oficina de IA ${p.plan} (${p.agentes} agentes) por ${p.centimos / 100} €.\nSesión de Stripe: ${s.id}` }),
    ]);
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ url, email, plan: p.plan, agentes: p.agentes });
}

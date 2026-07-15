import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Alejandro de Agutidesigns <info@agutidesigns.io>';
const CALENDLY = 'https://calendly.com/agutidesigns/reunion';
const WA_NUM   = '34625204337';

function buildQuoteHtml({ name, webType, pages, timeline, total, monthly, breakdown }) {
  const WEB_LABELS  = { landing: 'Landing page', corporativa: 'Web corporativa', ecommerce: 'Tienda online', portfolio: 'Portfolio' };
  const TIME_LABELS = { urgente: 'Urgente (1 sem.)', normal: 'Estándar (2–3 sem.)', flexible: 'Flexible (1 mes)', 'sin-prisa': 'Sin prisa' };
  const PAGE_LABELS = { '1': '1 pág.', '1-3': '1–3 págs.', '3-5': '3–5 págs.', '5-10': '5–10 págs.', '+10': '+10 págs.' };

  const totalFmt   = (total || 0).toLocaleString('es-ES');
  const monthlyFmt = (monthly || 0).toLocaleString('es-ES');
  const waText     = encodeURIComponent(`Hola Alejandro, he recibido mi presupuesto de ${totalFmt}€ y me gustaría hablar sobre mi proyecto.`);

  const rows = (breakdown || []).map(b => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#374151;font-size:14px;">${b.label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;text-align:right;font-weight:700;font-size:14px;color:${b.price < 0 ? '#059669' : b.price === 0 ? '#9CA3AF' : '#111827'};">
        ${b.price >= 0 ? '+' : ''}${(b.price || 0).toLocaleString('es-ES')}€
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tu presupuesto — Agutidesigns</title></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.09);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#0047FF 0%,#1a6bff 100%);padding:32px 40px;text-align:center;">
      <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">agutidesigns</div>
      <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Diseño web · IA · Automatizaciones</div>
    </td>
  </tr>

  <!-- Saludo -->
  <tr>
    <td style="padding:36px 40px 24px;">
      <p style="margin:0 0 12px;font-size:24px;font-weight:800;color:#111827;line-height:1.2;">¡Hola, ${name}! 👋</p>
      <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">
        Aquí tienes tu presupuesto personalizado para tu <strong style="color:#111827;">${WEB_LABELS[webType] || webType}</strong>.
        Es una estimación orientativa basada en lo que has configurado — si quieres ajustar algo, estoy a un mensaje.
      </p>
    </td>
  </tr>

  <!-- Precio destacado -->
  <tr>
    <td style="padding:0 40px 28px;">
      <div style="background:linear-gradient(135deg,rgba(0,71,255,0.06) 0%,rgba(0,71,255,0.02) 100%);border:2px solid rgba(0,71,255,0.15);border-radius:16px;padding:28px;text-align:center;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9CA3AF;margin-bottom:8px;">Total del proyecto</div>
        <div style="font-size:56px;font-weight:900;color:#0047FF;line-height:1;letter-spacing:-2px;">${totalFmt}<span style="font-size:28px;color:#9CA3AF;letter-spacing:0;">€</span></div>
        ${monthly > 0 ? `<div style="margin-top:10px;font-size:14px;color:#9CA3AF;">+ ${monthlyFmt}€/mes mantenimiento <span style="color:#10B981;font-weight:600;">(opcional)</span></div>` : ''}
      </div>
    </td>
  </tr>

  <!-- Desglose -->
  ${rows ? `
  <tr>
    <td style="padding:0 40px 28px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;margin-bottom:12px;">Desglose del presupuesto</div>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td>
  </tr>` : ''}

  <!-- Detalles proyecto -->
  <tr>
    <td style="padding:0 40px 28px;">
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:14px;">📋 Detalles de tu proyecto</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#9CA3AF;padding:5px 0;">Tipo de web</td>
            <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${WEB_LABELS[webType] || webType}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#9CA3AF;padding:5px 0;">Páginas</td>
            <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${PAGE_LABELS[pages] || pages}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#9CA3AF;padding:5px 0;">Plazo</td>
            <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${TIME_LABELS[timeline] || timeline}</td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#F3F4F6;"></div></td></tr>

  <!-- Próximos pasos -->
  <tr>
    <td style="padding:28px 40px 20px;">
      <div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:6px;">¿Qué hacemos ahora?</div>
      <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.7;">
        Si el presupuesto te encaja, el siguiente paso es una <strong style="color:#111827;">videollamada de 20 minutos</strong> conmigo para definir los detalles, resolver tus dudas y arrancar el proyecto.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-right:8px;">
            <a href="${CALENDLY}?name=${encodeURIComponent(name)}"
               style="display:block;background:#0047FF;color:#ffffff;text-decoration:none;padding:15px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;">
              📅 Reservar videollamada gratis
            </a>
          </td>
          <td style="padding-left:8px;">
            <a href="https://wa.me/${WA_NUM}?text=${waText}"
               style="display:block;background:#25D366;color:#ffffff;text-decoration:none;padding:15px 24px;border-radius:12px;font-size:15px;font-weight:700;text-align:center;">
              💬 Escribir por WhatsApp
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Proceso -->
  <tr>
    <td style="padding:0 40px 32px;">
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:14px;">⚡ Cómo funciona</div>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${[['1', 'Videollamada sin compromiso', 'Definimos tu proyecto, tus objetivos y resolvemos todas tus dudas.'],
             ['2', 'Propuesta definitiva en 24h', 'Recibes el presupuesto final y el contrato para revisar.'],
             ['3', 'Diseño y desarrollo', 'Tu web lista en 1–3 semanas. Con revisiones hasta que quede perfecta.'],
             ['4', 'Lanzamiento y soporte', 'Publicamos tu web y te acompaño en los primeros pasos.']].map(([n,t,d]) => `
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:top;padding-right:12px;">
                  <div style="width:24px;height:24px;border-radius:6px;background:rgba(0,71,255,0.1);color:#0047FF;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;text-align:center;line-height:24px;">${n}</div>
                </td>
                <td>
                  <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:2px;">${t}</div>
                  <div style="font-size:12px;color:#9CA3AF;line-height:1.5;">${d}</div>
                </td>
              </tr></table>
            </td>
          </tr>`).join('')}
        </table>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
      <p style="margin:0 0 4px;font-size:13px;color:#6B7280;">
        <strong style="color:#111827;">Alejandro Gutiérrez</strong> · Agutidesigns
      </p>
      <p style="margin:0;font-size:12px;color:#9CA3AF;">
        <a href="https://agutidesigns.io" style="color:#0047FF;text-decoration:none;">agutidesigns.io</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@agutidesigns.io" style="color:#0047FF;text-decoration:none;">info@agutidesigns.io</a>
      </p>
      <p style="margin:12px 0 0;font-size:11px;color:#D1D5DB;">Este presupuesto es orientativo y puede ajustarse según los detalles definitivos del proyecto.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, webType, pages, timeline, total, monthly, breakdown } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const html = buildQuoteHtml({ name, webType, pages, timeline, total, monthly, breakdown });

    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `Tu presupuesto de Agutidesigns — ${(total || 0).toLocaleString('es-ES')}€`,
      html,
    });

    // Notificación interna
    await resend.emails.send({
      from:    FROM,
      to:      'info@agutidesigns.io',
      subject: `[Nuevo presupuesto] ${name} — ${(total || 0).toLocaleString('es-ES')}€`,
      html: `<p style="font-family:sans-serif;font-size:14px;">
               <strong>${name}</strong> (${email}) ha calculado un presupuesto.<br><br>
               <strong>Web:</strong> ${webType} · ${pages} páginas · ${timeline}<br>
               <strong>Total:</strong> ${(total || 0).toLocaleString('es-ES')}€
               ${monthly > 0 ? ` + ${(monthly || 0).toLocaleString('es-ES')}€/mes` : ''}
             </p>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[send-quote]', err);
    return res.status(500).json({ error: 'Error enviando email', detail: err.message });
  }
}

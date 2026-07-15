import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = 'Alejandro de Agutidesigns <info@agutidesigns.io>';
const WA_NUM  = '34625204337';

function buildLeadHtml({ nombre, clinica, servicios }) {
  const serviciosList = Array.isArray(servicios) ? servicios : [];
  const waText = encodeURIComponent(`Hola Alejandro, soy ${nombre} de ${clinica || 'mi clínica dental'}. He rellenado el formulario y me gustaría saber más.`);

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.09);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#0047FF 0%,#1a6bff 100%);padding:32px 40px;text-align:center;">
      <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">agutidesigns</div>
      <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Marketing digital para clínicas dentales</div>
    </td>
  </tr>

  <!-- Icono check -->
  <tr>
    <td style="padding:36px 40px 8px;text-align:center;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#D1FAE5,#A7F3D0);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">✅</div>
      <p style="margin:0 0 10px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">¡Solicitud recibida, ${nombre}!</p>
      <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;max-width:440px;margin:0 auto;">
        Muchas gracias por contactarnos. Hemos recibido tu solicitud y
        nos pondremos en contacto contigo en las próximas <strong style="color:#111827;">24 horas</strong>.
      </p>
    </td>
  </tr>

  <!-- Resumen de solicitud -->
  ${(clinica || serviciosList.length > 0) ? `
  <tr>
    <td style="padding:28px 40px 0;">
      <div style="background:#F9FAFB;border-radius:12px;padding:20px;">
        <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:14px;">📋 Resumen de tu solicitud</div>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${clinica ? `
          <tr>
            <td style="font-size:13px;color:#9CA3AF;padding:5px 0;">Clínica</td>
            <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${clinica}</td>
          </tr>` : ''}
          ${serviciosList.length > 0 ? `
          <tr>
            <td style="font-size:13px;color:#9CA3AF;padding:5px 0;vertical-align:top;">Servicios de interés</td>
            <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${serviciosList.join('<br>')}</td>
          </tr>` : ''}
        </table>
      </div>
    </td>
  </tr>` : ''}

  <!-- Qué pasa ahora -->
  <tr>
    <td style="padding:24px 40px 28px;">
      <div style="font-size:17px;font-weight:800;color:#111827;margin-bottom:8px;">¿Qué pasa ahora?</div>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${[['📬', 'Te llamaremos o escribiremos', 'En menos de 24h un miembro de nuestro equipo contactará contigo para conocer mejor tus objetivos.'],
           ['🎯', 'Estrategia personalizada', 'Analizamos tu clínica, tu competencia local y te presentamos una propuesta a medida.'],
           ['🚀', 'Lanzamos juntos', 'Con resultados medibles desde el primer mes.']].map(([ico, t, d]) => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:14px;vertical-align:top;font-size:20px;">${ico}</td>
              <td>
                <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:3px;">${t}</div>
                <div style="font-size:13px;color:#9CA3AF;line-height:1.6;">${d}</div>
              </td>
            </tr></table>
          </td>
        </tr>`).join('')}
      </table>
    </td>
  </tr>

  <!-- CTA WhatsApp -->
  <tr>
    <td style="padding:0 40px 36px;text-align:center;">
      <div style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:14px;padding:24px;">
        <p style="margin:0 0 16px;font-size:14px;color:#166534;font-weight:600;">
          ¿Prefieres hablar ahora mismo? Escríbeme directamente.
        </p>
        <a href="https://wa.me/${WA_NUM}?text=${waText}"
           style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">
          💬 Escribir por WhatsApp
        </a>
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

  const { nombre, clinica, email, servicios } = req.body;
  if (!email || !nombre) return res.status(400).json({ error: 'Faltan campos obligatorios' });

  try {
    const html = buildLeadHtml({ nombre, clinica, servicios });

    // Email de confirmación al cliente
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `Hemos recibido tu solicitud, ${nombre} 🦷`,
      html,
    });

    // Notificación interna
    await resend.emails.send({
      from:    FROM,
      to:      'info@agutidesigns.io',
      subject: `[Nuevo lead clínica] ${nombre} — ${clinica || 'sin nombre'}`,
      html: `<p style="font-family:sans-serif;font-size:14px;">
               <strong>${nombre}</strong> (${email}) ha rellenado el formulario de clínicas dentales.<br><br>
               <strong>Clínica:</strong> ${clinica || '—'}<br>
               <strong>Servicios:</strong> ${Array.isArray(servicios) ? servicios.join(', ') : '—'}
             </p>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[send-lead]', err);
    return res.status(500).json({ error: 'Error enviando email', detail: err.message });
  }
}

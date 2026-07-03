import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Agutidesigns <info@agutidesigns.io>';

function buildQuoteHtml({ name, email, webType, pages, timeline, total, monthly, breakdown }) {
  const WEB_LABELS = { landing: 'Landing Page', corporativa: 'Web Corporativa', ecommerce: 'Tienda Online', portfolio: 'Portfolio' };
  const TIMELINE_LABELS = { urgente: 'Urgente (1 semana)', normal: 'Estándar (2–3 semanas)', flexible: 'Flexible (1 mes)', 'sin-prisa': 'Sin prisa' };

  const breakdownRows = (breakdown || [])
    .map(b => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#444;font-size:14px;">${b.label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;font-size:14px;color:${b.price < 0 ? '#16a34a' : '#0047FF'};">
          ${b.price >= 0 ? '+' : ''}${b.price.toLocaleString('es-ES')}€
        </td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#0047FF;padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">agutidesigns</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Tu presupuesto personalizado</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 20px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1d2e;">¡Hola, ${name}! 👋</p>
            <p style="margin:0;font-size:15px;color:#6b7694;line-height:1.6;">
              Aquí tienes el resumen de tu presupuesto calculado para tu proyecto de <strong>${WEB_LABELS[webType] || webType}</strong>.
              Es una estimación orientativa — si quieres ajustar algo, escríbeme sin compromiso.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:linear-gradient(135deg,rgba(0,71,255,0.07),rgba(0,71,255,0.02));border:1.5px solid rgba(0,71,255,0.2);border-radius:14px;padding:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7694;">Precio total del proyecto</p>
              <p style="margin:0;font-size:52px;font-weight:900;color:#0047FF;line-height:1;">${(total || 0).toLocaleString('es-ES')}<span style="font-size:24px;color:#9ca3af;">€</span></p>
              <p style="margin:10px 0 0;font-size:13px;color:#9ca3af;">+ ${(monthly || 0).toLocaleString('es-ES')}€/mes mantenimiento opcional</p>
            </div>
          </td>
        </tr>

        ${breakdownRows ? `
        <tr>
          <td style="padding:0 40px 28px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Desglose</p>
            <table width="100%" cellpadding="0" cellspacing="0">${breakdownRows}</table>
          </td>
        </tr>` : ''}

        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#f8f9fc;border-radius:12px;padding:20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#3d4560;">Detalles de tu proyecto</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#6b7694;padding:4px 0;">Tipo de web</td>
                  <td style="font-size:13px;color:#1a1d2e;font-weight:600;text-align:right;">${WEB_LABELS[webType] || webType}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6b7694;padding:4px 0;">Páginas estimadas</td>
                  <td style="font-size:13px;color:#1a1d2e;font-weight:600;text-align:right;">${pages}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6b7694;padding:4px 0;">Plazo de entrega</td>
                  <td style="font-size:13px;color:#1a1d2e;font-weight:600;text-align:right;">${TIMELINE_LABELS[timeline] || timeline}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <p style="margin:0 0 20px;font-size:15px;color:#6b7694;line-height:1.6;">
              ¿Quieres ajustar algo o tienes preguntas? Estoy disponible por WhatsApp o email.
            </p>
            <a href="https://wa.me/34625204337?text=${encodeURIComponent(`Hola Alejandro, he recibido mi presupuesto de ${(total || 0).toLocaleString('es-ES')}€ y quiero hablar sobre mi proyecto.`)}"
               style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:700;margin-right:12px;">
              💬 WhatsApp
            </a>
            <a href="mailto:info@agutidesigns.io"
               style="display:inline-block;background:#0047FF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:700;">
              ✉️ Email
            </a>
          </td>
        </tr>

        <tr>
          <td style="background:#f8f9fc;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Agutidesigns · <a href="https://agutidesigns.io" style="color:#0047FF;text-decoration:none;">agutidesigns.io</a></p>
            <p style="margin:6px 0 0;font-size:11px;color:#b0b8cc;">Presupuesto orientativo, puede variar según los detalles definitivos del proyecto.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, webType, pages, functionalities, seoExtras, timeline, total, monthly, breakdown } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const html = buildQuoteHtml({ name, email, webType, pages, functionalities, seoExtras, timeline, total, monthly, breakdown });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Tu presupuesto personalizado de Agutidesigns — ${(total || 0).toLocaleString('es-ES')}€`,
      html,
    });

    await resend.emails.send({
      from: FROM,
      to: 'info@agutidesigns.io',
      subject: `[Nuevo lead] ${name} — ${(total || 0).toLocaleString('es-ES')}€`,
      html: `<p><strong>Nuevo presupuesto calculado:</strong></p>
             <ul>
               <li>Nombre: ${name}</li>
               <li>Email: ${email}</li>
               <li>Web: ${webType} (${pages} páginas)</li>
               <li>Total: ${(total || 0).toLocaleString('es-ES')}€</li>
               <li>Plazo: ${timeline}</li>
             </ul>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[send-quote] Error:', err);
    return res.status(500).json({ error: 'Error enviando email', detail: err.message });
  }
}

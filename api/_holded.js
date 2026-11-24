// Facturas de la Oficina de IA en Holded: cada cobro de Stripe genera una factura en la serie «Factura»
// (numeración correlativa de Holded), con IVA, marcada como cobrada y enviada al cliente. Idempotente.
// Variables: HOLDED_API_KEY (obligatoria), HOLDED_SERIE_FACTURAS (opcional, por defecto la serie «Factura»).
import { sb, uno, DEPTO } from './_oficina.js';

const BASE = 'https://api.holded.com/api/invoicing/v1';
export const IVA = 21;
const clave = () => process.env.HOLDED_API_KEY;
export const hayHolded = () => Boolean(clave());
const serie = () => process.env.HOLDED_SERIE_FACTURAS || '63c6d64f6b2fb27505055672';

async function holded(ruta, { metodo = 'GET', cuerpo } = {}) {
  const r = await fetch(`${BASE}/${ruta}`, { method: metodo, headers: { key: clave(), Accept: 'application/json', 'Content-Type': 'application/json' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const t = await r.text(); let j; try { j = t ? JSON.parse(t) : {}; } catch { j = { texto: t }; }
  if (!r.ok || j?.status === 0) throw new Error(`Holded ${r.status}: ${(j?.info || j?.message || t || '').toString().slice(0, 200)}`);
  return j;
}
const redondea = (n) => Math.round(n * 100) / 100;

// inv: objeto Invoice de Stripe (evento invoice.paid).
export async function facturaDesdeStripe(inv) {
  if (!hayHolded() || !inv?.id) return null;
  const pagado = (inv.amount_paid || 0) / 100;
  if (pagado <= 0) return null; // la factura de 0 € al empezar la prueba no se emite
  const previa = await uno(`of_facturas?stripe_invoice=eq.${encodeURIComponent(inv.id)}&select=id,estado`);
  if (previa && previa.estado !== 'error') return null;
  if (previa) await sb(`of_facturas?id=eq.${previa.id}`, { metodo: 'DELETE' }); // reintento tras un error
  const neg = await uno(`of_negocios?stripe_customer=eq.${encodeURIComponent(inv.customer)}&select=*&order=created_at.desc&limit=1`);
  if (!neg) return null;
  const [fila] = await sb('of_facturas', { metodo: 'POST', prefer: 'return=representation', cuerpo: [{ negocio_id: neg.id, stripe_invoice: inv.id, estado: 'pendiente', total: pagado, stripe_url: inv.hosted_invoice_url || null }] });
  try {
    // Lo cobrado ya lleva el IVA: base = total / 1,21 (así la factura cuadra al céntimo con el cargo).
    const base = redondea(pagado / (1 + IVA / 100)); const iva = redondea(pagado - base);
    const linea = (inv.lines?.data || []).map((l) => l.description).filter(Boolean).join(' · ');
    const deptos = String(inv.subscription_details?.metadata?.deptos || inv.parent?.subscription_details?.metadata?.deptos || '').split(',').map((d) => DEPTO[d]?.nombre).filter(Boolean).join(', ');
    const periodo = inv.lines?.data?.[0]?.period;
    const desde = periodo?.start ? new Date(periodo.start * 1000).toLocaleDateString('es-ES') : ''; const hasta = periodo?.end ? new Date(periodo.end * 1000).toLocaleDateString('es-ES') : '';
    const nif = inv.customer_tax_ids?.[0]?.value || neg.nif || undefined;
    const dir = inv.customer_address || {};
    const doc = await holded('documents/invoice', { metodo: 'POST', cuerpo: {
      ...(neg.holded_contacto ? { contactId: neg.holded_contacto } : {
        contactName: inv.customer_name || neg.razon_social || neg.nombre, contactEmail: inv.customer_email || neg.owner_email, ...(nif ? { contactCode: nif } : {}),
        contactAddress: [dir.line1, dir.line2].filter(Boolean).join(' '), contactCity: dir.city || '', contactCp: dir.postal_code || '', contactProvince: dir.state || '', contactCountryCode: dir.country || 'ES' }),
      date: Math.floor((inv.status_transitions?.paid_at || inv.created) || Date.now() / 1000), numSerieId: serie(), approveDoc: true, currency: 'eur',
      notes: `Pagado con tarjeta. Referencia de cobro: ${inv.number || inv.id}.`,
      items: [{ name: 'Oficina de IA · Agutidesigns', desc: [linea || 'Suscripción', deptos && `Departamentos: ${deptos}`, desde && `Periodo: ${desde} - ${hasta}`].filter(Boolean).join('\n'), units: 1, subtotal: base, tax: IVA }],
    } });
    const id = doc.id;
    const detalle = await holded(`documents/invoice/${id}`).catch(() => ({}));
    await holded(`documents/invoice/${id}/pay`, { metodo: 'POST', cuerpo: { date: Math.floor(Date.now() / 1000), amount: pagado } }).catch((e) => console.error('[holded] pago', e.message));
    await holded(`documents/invoice/${id}/send`, { metodo: 'POST', cuerpo: { emails: inv.customer_email || neg.owner_email, subject: `Tu factura de la Oficina de IA · ${detalle.docNumber || ''}`.trim(), message: `Hola, te enviamos la factura de tu Oficina de IA. Gracias por confiar en Agutidesigns.` } })
      .catch((e) => console.error('[holded] envío', e.message));
    if (!neg.holded_contacto && detalle.contact) await sb(`of_negocios?id=eq.${neg.id}`, { metodo: 'PATCH', cuerpo: { holded_contacto: detalle.contact, ...(nif ? { nif } : {}), ...(inv.customer_name ? { razon_social: inv.customer_name } : {}) } });
    await sb(`of_facturas?id=eq.${fila.id}`, { metodo: 'PATCH', cuerpo: { holded_id: id, numero: detalle.docNumber || null, base, iva, total: pagado, estado: 'pagada', concepto: linea || 'Oficina de IA',
      fecha: new Date(((inv.status_transitions?.paid_at || inv.created) || Date.now() / 1000) * 1000).toISOString().slice(0, 10) } });
    return id;
  } catch (e) {
    console.error('[holded] factura', e.message);
    await sb(`of_facturas?id=eq.${fila.id}`, { metodo: 'PATCH', cuerpo: { estado: 'error', error: e.message.slice(0, 300) } });
    return null;
  }
}

export async function pdfFactura(holdedId) {
  const j = await holded(`documents/invoice/${holdedId}/pdf`);
  return j.data || null; // base64
}

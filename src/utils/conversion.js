// Conversión de Google Ads «Envío de formulario para clientes potenciales».
// Se llama solo cuando el formulario se ha enviado bien (no al hacer clic).
export const ADS_LEAD_CONVERSION = 'AW-18145697321/xhZPCNfgk6kcEKm8xcxD';

export function trackLeadConversion(fuente = '') {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: ADS_LEAD_CONVERSION, value: 1.0, currency: 'EUR' });
      window.gtag('event', 'generate_lead', { lead_source: fuente });
    }
  } catch { /* sin gtag: no pasa nada */ }
}

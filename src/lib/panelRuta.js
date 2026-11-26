// El panel de los clientes vive en panel.agutidesigns.io. En local y en las vistas previas de Vercel sigue en /app.
export const PANEL_URL = 'https://panel.agutidesigns.io';
const host = typeof window !== 'undefined' ? window.location.hostname : '';
export const EN_PANEL = /^panel\./.test(host);
const EN_WEB = /(^|\.)agutidesigns\.io$/.test(host) && !EN_PANEL;

// Ruta interna del panel: rutaPanel('agenda') → '/agenda' en el subdominio, '/app/agenda' en el resto.
export const rutaPanel = (sub = '') => (EN_PANEL ? `/${sub}` : `/app${sub ? `/${sub}` : ''}`);
// Enlace al panel desde la web pública (con el subdominio si estamos en agutidesigns.io).
export const urlPanel = (sub = '', qs = '') => (EN_WEB ? `${PANEL_URL}/${sub}${qs}` : `${rutaPanel(sub)}${qs}`);
// Alta (elegir departamentos, registrarse y pagar): en el subdominio del panel.
export const urlRegistro = (qs = '') => (EN_WEB ? `${PANEL_URL}/registro${qs}` : EN_PANEL ? `/registro${qs}` : `/oficina-ia/contratar${qs}`);
// La web pública, para volver desde el panel.
export const urlWeb = (ruta = '/') => (EN_PANEL ? `https://agutidesigns.io${ruta}` : ruta);

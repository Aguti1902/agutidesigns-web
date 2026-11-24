// Vuelta del OAuth de Google, Meta, TikTok o Microsoft: canjea el código, guarda los tokens cifrados y vuelve al panel.
import { sb, cifrar, leerEstado, PROVEEDORES, HERRAMIENTAS_OAUTH, origen } from './_oficina.js';

async function cuentaDe(prov, tok) {
  try {
    if (tok.id_token) return JSON.parse(Buffer.from(tok.id_token.split('.')[1], 'base64url').toString()).email || null;
    if (prov === 'meta') { const r = await fetch(`https://graph.facebook.com/v21.0/me?fields=name&access_token=${encodeURIComponent(tok.access_token)}`); return (await r.json()).name || null; }
    if (prov === 'tiktok') { const r = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name', { headers: { Authorization: `Bearer ${tok.access_token}` } }); return (await r.json())?.data?.user?.display_name || null; }
  } catch { /* la cuenta es solo para mostrarla */ }
  return null;
}

export default async function handler(req, res) {
  const vuelta = (q) => { res.statusCode = 302; res.setHeader('Location', `${origen(req)}/app/conexiones?${q}`); res.end(); };
  const st = leerEstado(req.query.state);
  if (!st || req.query.error || !req.query.code) return vuelta('error_conexion=1');
  const h = HERRAMIENTAS_OAUTH[st.h]; const p = h && PROVEEDORES[h.p];
  if (!p) return vuelta('error_conexion=1');
  try {
    const cuerpo = new URLSearchParams({ [p.claveId || 'client_id']: p.id(), client_secret: p.secreto(), code: String(req.query.code), grant_type: 'authorization_code', redirect_uri: `${origen(req)}/api/oficina-oauth` });
    const r = await fetch(p.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: cuerpo });
    const tok = await r.json();
    if (!r.ok || !tok.access_token) throw new Error(`token ${r.status}`);
    const cuenta = await cuentaDe(h.p, tok);
    await sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: {
      negocio_id: st.n, herramienta: st.h, proveedor: h.p, estado: 'conectada', cuenta,
      token_cifrado: cifrar(tok.access_token), refresh_cifrado: tok.refresh_token ? cifrar(tok.refresh_token) : null,
      expira: tok.expires_in ? new Date(Date.now() + tok.expires_in * 1000).toISOString() : null, scopes: h.scopes.join(' ') } });
    await sb('of_actividad', { metodo: 'POST', cuerpo: [{ negocio_id: st.n, depto: 'atencion', tipo: 'sistema', texto: `Has conectado ${st.h.replace('_', ' ')}${cuenta ? ` (${cuenta})` : ''}.` }] }).catch(() => {});
    return vuelta(`conectado=${encodeURIComponent(st.h)}`);
  } catch (e) {
    console.error('[oficina-oauth]', st.h, e.message);
    return vuelta('error_conexion=1');
  }
}

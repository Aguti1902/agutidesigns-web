// Conexiones de herramientas del cliente. POST {herramienta}: devuelve la URL de OAuth (un clic) o guarda la
// conexión si es por código (chat web) o por contraseña de aplicación (WordPress). DELETE {herramienta}: desconecta.
import { sb, negocioDeSesion, cifrar, hayCifrado, firmarEstado, PROVEEDORES, HERRAMIENTAS_OAUTH, origen } from './_oficina.js';

export default async function handler(req, res) {
  if (!['POST', 'DELETE'].includes(req.method)) return res.status(405).end();
  try {
    const neg = await negocioDeSesion(req);
    if (!neg) return res.status(401).json({ error: 'Tu sesión ha caducado. Vuelve a entrar.' });
    const { herramienta, url, usuario, clave, instalado } = req.body || {};
    const filtro = `of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.${encodeURIComponent(String(herramienta))}`;
    if (req.method === 'DELETE') { await sb(filtro, { metodo: 'DELETE' }); return res.status(200).json({ ok: true }); }
    if (!hayCifrado()) return res.status(503).json({ error: 'Las conexiones aún no están activadas. Te avisamos en cuanto lo estén.' });
    const guardar = (fila) => sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: { negocio_id: neg.id, herramienta, estado: 'conectada', ...fila } });

    if (herramienta === 'web_chat') {
      if (!instalado) return res.status(400).json({ error: 'Falta pegar el código' });
      await guardar({ proveedor: 'snippet', cuenta: 'Código instalado en tu web' });
      return res.status(200).json({ conectada: true, cuenta: 'Código instalado en tu web' });
    }
    if (herramienta === 'wordpress') {
      const base = String(url || '').trim().replace(/\/$/, '');
      if (!/^https:\/\/[^\s/]+/.test(base) || !usuario || !clave) return res.status(400).json({ error: 'Revisa la dirección (con https), el usuario y la contraseña de aplicación.' });
      const r = await fetch(`${base}/wp-json/wp/v2/users/me?context=edit`, { headers: { Authorization: `Basic ${Buffer.from(`${usuario}:${String(clave).replace(/\s/g, '')}`).toString('base64')}` } });
      if (!r.ok) return res.status(400).json({ error: 'WordPress no ha aceptado ese usuario y contraseña de aplicación.' });
      await guardar({ proveedor: 'clave', cuenta: base, token_cifrado: cifrar(JSON.stringify({ usuario, clave })) });
      return res.status(200).json({ conectada: true, cuenta: base });
    }
    const h = HERRAMIENTAS_OAUTH[herramienta]; const p = h && PROVEEDORES[h.p];
    if (!p) return res.status(400).json({ error: 'Herramienta desconocida' });
    if (!p.id() || !p.secreto()) return res.status(503).json({ error: 'Esta conexión se está activando. Escríbenos y te la conectamos nosotros mientras tanto.' });
    const q = new URLSearchParams({ [p.claveId || 'client_id']: p.id(), redirect_uri: `${origen(req)}/api/oficina-oauth`, response_type: 'code',
      scope: h.scopes.join(p.sep || ' '), state: firmarEstado({ n: neg.id, h: herramienta }), ...(p.extra || {}) });
    return res.status(200).json({ url: `${p.auth}?${q}` });
  } catch (e) {
    console.error('[oficina-conectar]', e.message);
    return res.status(502).json({ error: 'No se ha podido conectar. Inténtalo de nuevo.' });
  }
}

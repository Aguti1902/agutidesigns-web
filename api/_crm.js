// Conexión con el CRM o programa de gestión que ya usa el negocio. No lo sustituimos: le mandamos
// cada cliente potencial y cada cita que consiguen los agentes, y aceptamos citas y clientes que llegan de él.
// Proveedores con conexión directa: HubSpot (token de app privada) y Pipedrive (token de API).
// Cualquier otro programa (Booksy, Gesden, Trainingym, Gesvision, Inmovilla…) entra por webhook (Zapier, Make, n8n o su API).
import crypto from 'node:crypto';
import { sb, uno, cifrar, descifrar } from './_oficina.js';

export const PROVEEDORES_CRM = ['hubspot', 'pipedrive', 'webhook'];
const esTel = (c) => /^\+?[\d\s().-]{6,}$/.test(String(c || ''));
const esMail = (c) => /@/.test(String(c || ''));
const partirNombre = (n) => { const p = String(n || 'Cliente').trim().split(/\s+/); return { nombre: p[0], apellidos: p.slice(1).join(' ') }; };

// Comprueba la credencial antes de guardarla. Devuelve el nombre de la cuenta o lanza un error legible.
export async function probarCrm(proveedor, { token, url }) {
  if (proveedor === 'hubspot') {
    const r = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error('HubSpot no ha aceptado ese token. Revisa que la app privada tenga permiso para leer y escribir contactos.');
    const a = await fetch('https://api.hubapi.com/account-info/v3/details', { headers: { Authorization: `Bearer ${token}` } }).then((x) => (x.ok ? x.json() : {})).catch(() => ({}));
    return a.portalId ? `HubSpot · cuenta ${a.portalId}` : 'HubSpot';
  }
  if (proveedor === 'pipedrive') {
    const r = await fetch(`https://api.pipedrive.com/v1/users/me?api_token=${encodeURIComponent(token)}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.success) throw new Error('Pipedrive no ha aceptado ese token. Lo encuentras en Preferencias personales › API.');
    return `Pipedrive · ${j.data?.company_name || j.data?.email || 'cuenta conectada'}`;
  }
  if (proveedor === 'webhook') {
    const u = String(url || '').trim();
    if (!/^https:\/\/[^\s/]+\.[^\s]+/.test(u)) throw new Error('La dirección del webhook tiene que empezar por https://');
    return new URL(u).host;
  }
  throw new Error('Proveedor desconocido');
}

export async function guardarCrm(neg, proveedor, cred, cuenta, programa) {
  const previa = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.crm&select=externo_id`);
  const entrada = previa?.externo_id || crypto.randomBytes(18).toString('base64url');
  await sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: {
    negocio_id: neg.id, herramienta: 'crm', estado: 'conectada', proveedor, cuenta: programa ? `${programa} · ${cuenta}` : cuenta, externo_id: entrada, token_cifrado: cifrar(JSON.stringify(cred)),
  } });
  return entrada;
}

// Clave para recibir datos desde el CRM (se genera aunque no haya proveedor de salida).
export async function claveEntrada(neg) {
  const c = await uno(`of_conexiones?negocio_id=eq.${neg.id}&herramienta=eq.crm&select=externo_id`);
  if (c?.externo_id) return c.externo_id;
  const entrada = crypto.randomBytes(18).toString('base64url');
  await sb('of_conexiones?on_conflict=negocio_id,herramienta', { metodo: 'POST', prefer: 'resolution=merge-duplicates', cuerpo: { negocio_id: neg.id, herramienta: 'crm', estado: 'pendiente', proveedor: 'entrada', cuenta: 'Solo entrada', externo_id: entrada } });
  return entrada;
}

async function hubspot(token, tipo, d) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const { nombre, apellidos } = partirNombre(d.nombre);
  const props = { firstname: nombre, lastname: apellidos || undefined, lifecyclestage: tipo === 'lead' ? 'lead' : undefined,
    message: tipo === 'cita' ? `Cita: ${d.servicio || 'sin servicio'}${d.fecha ? ` · ${new Date(d.fecha).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}` : ''} (Oficina de IA)` : `Interés: ${d.interes || 'pide presupuesto'} (Oficina de IA · ${d.canal || ''})` };
  if (esMail(d.contacto)) props.email = d.contacto; else if (esTel(d.contacto)) props.phone = d.contacto;
  const r = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', { method: 'POST', headers: h, body: JSON.stringify({ properties: props }) });
  if (r.status === 409 && props.email) { // ya existe: actualiza el mensaje
    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(props.email)}?idProperty=email`, { method: 'PATCH', headers: h, body: JSON.stringify({ properties: { message: props.message } }) });
    return;
  }
  if (!r.ok && r.status !== 409) throw new Error(`HubSpot ${r.status}`);
}

async function pipedrive(token, tipo, d) {
  const base = 'https://api.pipedrive.com/v1'; const q = `api_token=${encodeURIComponent(token)}`;
  const post = (ruta, cuerpo) => fetch(`${base}/${ruta}?${q}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }).then((r) => r.json());
  const persona = { name: d.nombre || 'Cliente' };
  if (esMail(d.contacto)) persona.email = [{ value: d.contacto, primary: true }]; else if (esTel(d.contacto)) persona.phone = [{ value: d.contacto, primary: true }];
  const p = await post('persons', persona); const id = p?.data?.id;
  if (!id) throw new Error('Pipedrive: no se pudo crear la persona');
  if (tipo === 'lead') await post('leads', { title: `${d.nombre || 'Cliente'} · ${d.interes || 'Pide presupuesto'}`, person_id: id });
  else {
    const f = d.fecha ? new Date(d.fecha) : null;
    await post('activities', { subject: `Cita: ${d.servicio || 'cita'}`, type: 'meeting', person_id: id, note: `Pedida por ${d.canal || 'la oficina de IA'}`,
      ...(f ? { due_date: f.toISOString().slice(0, 10), due_time: f.toISOString().slice(11, 16) } : {}) });
  }
}

// Manda un cliente potencial o una cita al CRM conectado. Nunca rompe el flujo del agente.
export async function enviarACrm(negocioId, tipo, datos) {
  try {
    const c = await uno(`of_conexiones?negocio_id=eq.${negocioId}&herramienta=eq.crm&estado=eq.conectada&select=*`);
    if (!c?.token_cifrado) return;
    const cred = JSON.parse(descifrar(c.token_cifrado));
    if (c.proveedor === 'hubspot') await hubspot(cred.token, tipo, datos);
    else if (c.proveedor === 'pipedrive') await pipedrive(cred.token, tipo, datos);
    else if (c.proveedor === 'webhook') {
      const r = await fetch(cred.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'OficinaIA/1.0' },
        body: JSON.stringify({ evento: tipo === 'lead' ? 'cliente_potencial' : 'cita', origen: 'oficina-ia', fecha_evento: new Date().toISOString(), ...datos }) });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
    }
    await sb(`of_conexiones?id=eq.${c.id}`, { metodo: 'PATCH', cuerpo: { actualizado: new Date().toISOString() } }).catch(() => {});
  } catch (e) { console.error('[crm]', e.message); }
}

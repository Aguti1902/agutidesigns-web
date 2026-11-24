// Herramientas que el cliente conecta con un clic. proveedor = flujo OAuth en api/oficina-conectar.js.
// 'snippet' = se instala pegando un código; 'clave' = se conecta con usuario y contraseña de aplicación.
export const HERRAMIENTAS = [
  { id: 'whatsapp', nombre: 'WhatsApp Business', proveedor: 'meta', color: '#25d366', letra: 'W', deptos: ['atencion', 'citas', 'ventas'],
    que: 'Tus agentes contestan y dan cita por el WhatsApp de tu negocio.' },
  { id: 'google_business', nombre: 'Perfil de Empresa de Google', proveedor: 'google', color: '#4285f4', letra: 'G', deptos: ['google'],
    que: 'Responder reseñas y publicar novedades en tu ficha de Google Maps.' },
  { id: 'google_calendar', nombre: 'Google Calendar', proveedor: 'google', color: '#1a73e8', letra: 'C', deptos: ['citas'],
    que: 'Leer tus huecos libres y apuntar cada cita en tu agenda.' },
  { id: 'gmail', nombre: 'Gmail', proveedor: 'google', color: '#ea4335', letra: 'M', deptos: ['ventas', 'atencion'],
    que: 'Contestar correos y hacer el seguimiento de presupuestos.' },
  { id: 'instagram', nombre: 'Instagram', proveedor: 'meta', color: '#e1306c', letra: 'I', deptos: ['redes', 'atencion'],
    que: 'Publicar en tu perfil y contestar mensajes directos.' },
  { id: 'facebook', nombre: 'Facebook', proveedor: 'meta', color: '#1877f2', letra: 'f', deptos: ['redes', 'atencion'],
    que: 'Publicar en tu página y contestar Messenger.' },
  { id: 'tiktok', nombre: 'TikTok', proveedor: 'tiktok', color: '#111111', letra: 'T', deptos: ['redes'],
    que: 'Programar tus vídeos en TikTok.' },
  { id: 'outlook', nombre: 'Outlook', proveedor: 'microsoft', color: '#0a64d6', letra: 'O', deptos: ['ventas', 'atencion'],
    que: 'Contestar correos si usas Outlook o Microsoft 365.' },
  { id: 'web_chat', nombre: 'Chat de tu web', proveedor: 'snippet', color: '#0047ff', letra: '<>', deptos: ['atencion', 'citas'],
    que: 'Una burbuja de chat en tu web atendida por tus agentes.' },
  { id: 'wordpress', nombre: 'WordPress', proveedor: 'clave', color: '#21759b', letra: 'W', deptos: ['contenido'],
    que: 'Publicar los artículos del blog directamente en tu web.' },
];
export const HERRAMIENTA = Object.fromEntries(HERRAMIENTAS.map((h) => [h.id, h]));

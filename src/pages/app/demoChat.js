// Respuestas del equipo en la demo (sin IA): se calculan con los datos del negocio de ejemplo.
export function respuestaDemo(o, t) {
  const x = t.toLowerCase();
  if (x.includes('cita')) { const c = o.citas.filter((k) => k.estado !== 'cancelada' && k.fecha && new Date(k.fecha) > Date.now()); return `Tienes ${c.length} citas próximas: ${c.slice(0, 3).map((k) => `${k.nombre} (${k.servicio}, ${new Date(k.fecha).toLocaleString('es-ES', { weekday: 'long', hour: '2-digit', minute: '2-digit' })})`).join(', ')}. ${o.citas.filter((k) => k.estado === 'pendiente').length} esperan que las confirmes.`; }
  if (x.includes('reseña')) return 'Este mes hemos respondido todas las reseñas de 4 y 5 ★ y te hemos dejado una de 3 ★ para que revises la respuesta. Tu nota media sigue en 4,8 ★.';
  if (x.includes('post') || x.includes('vídeo') || x.includes('video')) return '¡Hecho! Nos ponemos con ello y en unos minutos lo tienes en «Te necesitan» para revisarlo. (En la demo no se crea de verdad.)';
  return `Hoy llevamos ${o.est.hoy.total} tareas: ${o.est.hoy.conversaciones} clientes atendidos, ${o.est.hoy.citas} gestiones de citas y ${o.est.hoy.google} reseñas. Tienes ${o.eventos.filter((e) => (e.tipo === 'aviso' || e.tipo === 'pendiente') && !e.resuelto).length} cosas esperándote.`;
}

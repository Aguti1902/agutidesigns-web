// Vídeos de ayuda del panel (grabados sobre el panel real, con subtítulos). Viven en /public/videos/oficina.
const V = (id, t, d, dur) => ({ id, t, d, dur, src: `/videos/oficina/${id}.mp4`, poster: `/videos/oficina/${id}.jpg` });

export const VIDEOS = {
  bienvenida: V('bienvenida', 'Tu oficina, de un vistazo', 'Qué es cada parte del panel y dónde mirar cada día.', '1:08'),
  negocio: V('negocio', 'Cuéntales cómo es tu negocio', 'Horario, servicios, precios, avisos y preguntas frecuentes.', '1:15'),
  conectar: V('conectar', 'Conecta tus herramientas', 'WhatsApp, Google, Instagram… con un clic y sin contraseñas.', '0:44'),
  aprobar: V('aprobar', 'Lo que te necesita', 'Revisar, aprobar o contestar tú en un clic.', '0:50'),
  atencion: V('atencion', 'Atención al cliente', 'Conversaciones en directo, tomar el control y cómo contesta.', '0:44'),
  citas: V('citas', 'Citas y reservas', 'Confirmar citas, apuntarlas a mano y recordatorios.', '0:50'),
  ventas: V('ventas', 'Ventas y presupuestos', 'Tu embudo de clientes y los seguimientos automáticos.', '0:42'),
  redes: V('redes', 'Redes sociales', 'Posts de la semana, pedir uno nuevo y aprobar.', '0:51'),
  google: V('google', 'Google y reseñas', 'Respuestas a reseñas, tu nota y cómo pedir reseñas.', '0:46'),
  contenido: V('contenido', 'Contenido web', 'Artículos para Google: pedirlos, revisarlos y publicarlos.', '0:37'),
};
export const ORDEN_VIDEOS = ['bienvenida', 'negocio', 'conectar', 'aprobar', 'atencion', 'citas', 'ventas', 'redes', 'google', 'contenido'];

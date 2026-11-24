// Oficina de IA en modo SaaS: catálogo de departamentos, cupos mensuales y precios.
// Todo lo que se vende sale de aquí (configurador de /oficina-ia, checkout y panel /app).
// PRECIOS PROPUESTOS, pendientes de aprobar por Alejandro. Sin IVA.

export const PRECIO_POR_CANTIDAD = { 1: 49, 2: 89, 3: 129, 4: 169, 5: 199, 6: 229 };
export const precioOficina = (n) => PRECIO_POR_CANTIDAD[Math.max(1, Math.min(6, n))] || 0;
export const PRECIO_SUELTO = PRECIO_POR_CANTIDAD[1];

// Plan anual: 20 % de descuento, pago por adelantado. Incluye diseño o rediseño de la web desde 3 departamentos.
export const DESCUENTO_ANUAL = 0.2;
export const precioAnual = (n) => Math.round(precioOficina(n) * 12 * (1 - DESCUENTO_ANUAL));
export const WEB_DESDE = 3;
export const webIncluida = (periodo, n) => periodo === 'anio' && n >= WEB_DESDE;
// Plan mensual: 7 días de prueba (se pide tarjeta, no se cobra hasta el día 8) con el 25 % del cupo.
export const DIAS_PRUEBA = 7;
// Impuestos de las facturas: IVA que se suma y retención de IRPF que se descuenta (el cliente la ingresa a Hacienda).
export const IVA = 21;
export const IRPF = 15;
export const impuestos = (base) => {
  const iva = Math.round(base * IVA) / 100; const irpf = Math.round(base * IRPF) / 100;
  return { base, iva, irpf, total: Math.round((base + iva - irpf) * 100) / 100 };
};
// Lo que se cobra con tarjeta (en céntimos): base + IVA − retención.
export const cobroCentimos = (base) => Math.round(impuestos(base).total * 100);
export const CUPO_PRUEBA = 0.25;

// cupo: lo que ve el cliente. tokensMes: presupuesto interno de IA (entrada + salida) con el que se corta.
// El tope diario es tokensMes / 15, para que nadie se gaste el mes en un día.
export const DEPARTAMENTOS = [
  {
    id: 'atencion', nombre: 'Atención al cliente', corto: 'Atención', color: '#0047ff',
    que: 'Contesta a tus clientes por WhatsApp y por el chat de tu web: precios, horarios, servicios y dudas. Si alguien quiere hablar contigo, te avisa.',
    hace: ['Responde al momento, también de noche', 'Usa tus precios y horarios, nunca se los inventa', 'Te avisa cuando un cliente quiere hablar contigo'],
    cupo: { n: 500, unidad: 'conversaciones' }, tokensMes: 4_000_000,
    tareas: ['Contestando a un cliente por WhatsApp', 'Pasando los horarios de esta semana', 'Avisándote: un cliente quiere hablar contigo'],
    conexiones: ['WhatsApp Business', 'Chat de tu web'],
  },
  {
    id: 'citas', nombre: 'Citas y reservas', corto: 'Citas', color: '#7a5cc6',
    que: 'Da hora a tus clientes según tu agenda, confirma las citas y manda el recordatorio el día antes para que no falte nadie.',
    hace: ['Ofrece huecos libres de tu agenda', 'Confirma y recuerda cada cita', 'Recoloca a quien cancela'],
    cupo: { n: 300, unidad: 'citas gestionadas' }, tokensMes: 2_500_000,
    tareas: ['Dando hora para el jueves a las 17:00', 'Mandando los recordatorios de mañana', 'Recolocando una cita cancelada'],
    conexiones: ['Google Calendar', 'WhatsApp Business'],
  },
  {
    id: 'ventas', nombre: 'Ventas y presupuestos', corto: 'Ventas', color: '#0a8f5a',
    que: 'Sigue a cada persona que te pide presupuesto o información, le escribe en el momento justo y no deja que ninguna se enfríe.',
    hace: ['Contesta cada petición de presupuesto', 'Hace el seguimiento a los 2 y a los 7 días', 'Te enseña quién está a punto de decir que sí'],
    cupo: { n: 200, unidad: 'seguimientos' }, tokensMes: 2_000_000,
    tareas: ['Contestando una petición de presupuesto', 'Enviando el seguimiento de los 2 días', 'Marcando un cliente como caliente'],
    conexiones: ['Correo', 'Formulario de tu web'],
  },
  {
    id: 'redes', nombre: 'Redes sociales', corto: 'Redes', color: '#ec6746',
    que: 'Planifica el mes, escribe los textos con tu tono y programa las publicaciones en Instagram, Facebook y TikTok.',
    hace: ['Calendario de publicaciones del mes', 'Textos con tu tono y tus hashtags', 'Tú apruebas antes de que salga, si quieres'],
    cupo: { n: 30, unidad: 'publicaciones' }, tokensMes: 1_500_000,
    tareas: ['Escribiendo el post del viernes', 'Programando 3 publicaciones', 'Preparando el calendario del mes'],
    conexiones: ['Instagram', 'Facebook', 'TikTok'],
  },
  {
    id: 'google', nombre: 'Google y reseñas', corto: 'Google', color: '#e0a100',
    que: 'Mantiene viva tu ficha de Google para que salgas en el mapa de Cornellà, y responde cada reseña con educación y con tu tono.',
    hace: ['Responde todas tus reseñas', 'Publica novedades en tu ficha', 'Revisa que horarios y datos estén bien'],
    cupo: { n: 60, unidad: 'reseñas y publicaciones' }, tokensMes: 1_000_000,
    tareas: ['Respondiendo una reseña de 5 estrellas', 'Publicando la oferta en tu ficha', 'Revisando tus horarios en Google'],
    conexiones: ['Perfil de Empresa de Google'],
  },
  {
    id: 'contenido', nombre: 'Contenido web', corto: 'Contenido', color: '#2aa6b8',
    que: 'Escribe artículos para el blog de tu web pensados para que te encuentren en Google cuando alguien busca lo que haces en tu zona.',
    hace: ['Artículos pensados para Google', 'Con tu forma de explicar las cosas', 'Listos para publicar o para que los revises'],
    cupo: { n: 4, unidad: 'artículos' }, tokensMes: 1_200_000,
    tareas: ['Escribiendo el artículo de este mes', 'Buscando qué pregunta la gente en Google', 'Revisando el texto antes de publicarlo'],
    conexiones: ['Tu web (WordPress u otra)'],
  },
];

export const DEPTO = Object.fromEntries(DEPARTAMENTOS.map((d) => [d.id, d]));

// Bolsas extra cuando se acaba el cupo (precio pendiente de decidir).
export const BOLSA_EXTRA = { porcentaje: 100, precio: null };
export const AVISO_CUPO = 0.8;

// «Cómo trabaja» cada departamento: los ajustes que el dueño puede tocar y cómo se traducen en instrucciones
// para su agente. Lo usan el panel (formulario) y la API (prompts y trabajo programado), así nunca se desincronizan.

export const AJUSTES = {
  atencion: [
    { k: 'nombre_asistente', tipo: 'texto', l: 'Cómo se presenta', ph: 'Ej.: Marta, del salón', ayuda: 'Si lo dejas vacío, se presenta como el equipo del negocio.' },
    { k: 'idiomas', tipo: 'multi', l: 'Idiomas en los que contesta', ops: [['es', 'Castellano'], ['ca', 'Catalán'], ['en', 'Inglés'], ['fr', 'Francés']], def: ['es', 'ca'] },
    { k: 'largo', tipo: 'sel', l: 'Cómo de largas son sus respuestas', ops: [['corto', 'Muy cortas'], ['normal', 'Normales'], ['detalle', 'Con más detalle']], def: 'normal' },
    { k: 'pasar', tipo: 'multi', l: 'Te lo pasa a ti cuando…', ops: [['queja', 'Hay una queja'], ['descuento', 'Piden descuento'], ['presupuesto', 'Piden presupuesto'], ['persona', 'Piden hablar con alguien']], def: ['queja', 'descuento', 'persona'], ayuda: 'Lo que no sepa siempre te lo pasa, marques lo que marques.' },
    { k: 'emojis', tipo: 'sw', l: 'Usar emojis', def: true },
  ],
  citas: [
    { k: 'servicios', tipo: 'area', l: 'Servicios y cuánto duran', ph: 'Corte · 30 min\nTinte · 1 h 30 min\nMechas · 2 h', ayuda: 'Una línea por servicio. Así sabe cuánto hueco pedir.' },
    { k: 'antelacion', tipo: 'sel', l: 'Antelación mínima para pedir cita', ops: [['0', 'Sin mínimo'], ['2', '2 horas'], ['12', '12 horas'], ['24', '1 día'], ['48', '2 días']], def: '2' },
    { k: 'recordatorio', tipo: 'sw', l: 'Recordatorio el día antes', ayuda: 'Manda un WhatsApp al cliente el día antes de su cita confirmada.', def: true },
    { k: 'pedir_telefono', tipo: 'sw', l: 'Pedir el teléfono en el chat de la web', ayuda: 'Para poder avisarle si cambia algo.', def: true },
  ],
  ventas: [
    { k: 'dias_seguimiento', tipo: 'sel', l: 'Si no contestan a un presupuesto, seguimiento a los…', ops: [['2', '2 días'], ['3', '3 días'], ['5', '5 días'], ['7', '7 días']], def: '2' },
    { k: 'mensaje_listo', tipo: 'sw', l: 'Dejarme el mensaje de seguimiento escrito', ayuda: 'Te lo prepara y solo tienes que pulsar «Enviar».', def: true },
    { k: 'datos_presupuesto', tipo: 'area', l: 'Qué preguntar para poder hacer un presupuesto', ph: 'Fecha del evento, número de personas, qué servicios quiere…', ayuda: 'Tu agente lo preguntará antes de pasártelo.' },
  ],
  redes: [
    { k: 'posts_semana', tipo: 'sel', l: 'Publicaciones por semana', ops: [['2', '2'], ['3', '3'], ['5', '5'], ['7', '7']], def: '3', ayuda: 'Las prepara cada lunes para que las revises.' },
    { k: 'redes', tipo: 'multi', l: 'Dónde publica', ops: [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']], def: ['instagram', 'facebook'] },
    { k: 'temas', tipo: 'area', l: 'De qué quieres que hable', ph: 'Antes y después, consejos de cuidado del pelo, el equipo, novedades…' },
    { k: 'hashtags', tipo: 'texto', l: 'Hashtags que pone siempre', ph: '#Cornellà #peluqueria' },
  ],
  google: [
    { k: 'auto', tipo: 'sw', l: 'Publicar solas las respuestas a reseñas de 4 y 5 ★', ayuda: 'Las de 1 a 3 estrellas siempre te las enseña antes.', def: true },
    { k: 'firma', tipo: 'texto', l: 'Firma de las respuestas', ph: 'El equipo de Peluquería Marta' },
    { k: 'enlace_resenas', tipo: 'texto', l: 'Tu enlace para pedir reseñas', ph: 'https://g.page/r/…/review', ayuda: 'En tu ficha de Google: «Pedir reseñas». Lo usamos para que tus clientes te dejen reseña.' },
  ],
  contenido: [
    { k: 'articulos_mes', tipo: 'sel', l: 'Artículos al mes', ops: [['1', '1'], ['2', '2'], ['4', '4']], def: '1' },
    { k: 'palabras', tipo: 'texto', l: 'Búsquedas por las que quieres salir', ph: 'peluquería en Cornellà, mechas balayage Baix Llobregat' },
    { k: 'temas', tipo: 'area', l: 'Temas que te interesan', ph: 'Cuidado del pelo en verano, tendencias de color…' },
    { k: 'largo', tipo: 'sel', l: 'Largo de los artículos', ops: [['corto', 'Corto (400 palabras)'], ['medio', 'Medio (700)'], ['largo', 'Largo (1.200)']], def: 'medio' },
  ],
};

export const COMUNES = [
  { k: 'revisar', tipo: 'sw', l: 'Quiero revisarlo antes', ayuda: 'Te enseña lo que va a publicar o enviar y espera tu «Aprobar».' },
  { k: 'pausado', tipo: 'sw', l: 'Pausar este departamento', ayuda: 'No hará nada hasta que lo reactives.' },
];

// Ajustes con sus valores por defecto aplicados.
export function ajustesDe(depto, aj = {}) {
  const r = { ...aj };
  for (const c of AJUSTES[depto] || []) if (r[c.k] === undefined && c.def !== undefined) r[c.k] = c.def;
  return r;
}

const lista = (depto, k, vals) => (AJUSTES[depto].find((c) => c.k === k)?.ops || []).filter(([v]) => (vals || []).includes(v)).map(([, t]) => t.toLowerCase()).join(', ');

// Instrucciones para el agente a partir de los ajustes (se añaden a su prompt).
export function instruccionesDe(depto, aj0 = {}) {
  const a = ajustesDe(depto, aj0); const out = [];
  if (depto === 'atencion') {
    if (a.nombre_asistente) out.push(`Si te presentas, hazlo como «${a.nombre_asistente}».`);
    if (a.idiomas?.length) out.push(`Contesta en el idioma del cliente si es uno de estos: ${lista('atencion', 'idiomas', a.idiomas)}. Si escribe en otro, contesta en castellano.`);
    out.push({ corto: 'Respuestas muy cortas: 1 o 2 frases.', normal: 'Respuestas breves: máximo 3 frases.', detalle: 'Puedes dar respuestas algo más completas (hasta 5 frases) si hace falta.' }[a.largo] || '');
    if (a.pasar?.length) out.push(`Marca pasar_a_humano también cuando: ${lista('atencion', 'pasar', a.pasar)}.`);
    out.push(a.emojis === false ? 'No uses emojis.' : 'Puedes usar algún emoji con moderación.');
  }
  if (depto === 'citas') {
    if (a.servicios) out.push(`Servicios y duración:\n${a.servicios}`);
    if (Number(a.antelacion) > 0) out.push(`No se dan citas con menos de ${Number(a.antelacion) >= 24 ? `${Number(a.antelacion) / 24} día(s)` : `${a.antelacion} horas`} de antelación; si piden antes, ofrece la primera opción posible.`);
    if (a.pedir_telefono) out.push('Si el cliente escribe por el chat de la web y pide cita, pídele un teléfono de contacto.');
  }
  if (depto === 'ventas' && a.datos_presupuesto) out.push(`Antes de pasar una petición de presupuesto, pregunta: ${a.datos_presupuesto}`);
  if (depto === 'redes') {
    if (a.redes?.length) out.push(`Las publicaciones son para: ${lista('redes', 'redes', a.redes)}.`);
    if (a.temas) out.push(`Temas preferidos por el negocio: ${a.temas}`);
    if (a.hashtags) out.push(`Incluye siempre estos hashtags: ${a.hashtags}`);
  }
  if (depto === 'google' && a.firma) out.push(`Termina cada respuesta con la firma: «${a.firma}».`);
  if (depto === 'contenido') {
    if (a.palabras) out.push(`Búsquedas de Google por las que el negocio quiere aparecer (úsalas de forma natural en título y subtítulos): ${a.palabras}`);
    if (a.temas) out.push(`Temas que interesan al negocio: ${a.temas}`);
    out.push(`Extensión aproximada: ${{ corto: 400, medio: 700, largo: 1200 }[a.largo] || 700} palabras.`);
  }
  return out.filter(Boolean).join('\n');
}

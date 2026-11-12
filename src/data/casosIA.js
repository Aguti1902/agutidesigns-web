// Casos de éxito de la «Oficina de IA».
// Spa Organic: historia y cifra facilitadas por Agutidesigns (+120 % de facturación en 3 meses).
// Vela-Segalà: cifras facilitadas por la clínica (+20.000 € en 3 meses, +80 % de facturación) y unificación de sus 4 webs.

const NOMBRES_SPA = { ceo: 'Dirección', prospector: 'Nuria', demos: 'Ona', redactor: 'Pau', seguimiento: 'Laia', recontacto: 'Jan', finanzas: 'Marc', cartera: 'Aina', semanal: 'Júlia', resumen: 'Carla', webleads: 'Emma', pipeline: 'Berta', contenido: 'Irene', publicador: 'Pol', analista: 'Arnau', ads: 'Biel', cs: 'Mireia', produccion: 'Gerard', seo: 'Queralt' };

export const SPA = {
  slug: 'spa-organic',
  nombre: 'Spa Organic',
  sector: 'Salud capilar · Castelldefels',
  web: 'spaorganic.es',
  url: 'https://spaorganic.es',
  logo: '/img/logo-spaorganic.webp',
  logoClaro: true,
  titular: 'Estaba a punto de cerrar. Hoy factura más del doble.',
  cifra: { v: 120, pre: '+', suf: ' %', l: 'de facturación en 3 meses' },
  resumen: 'Spa Organic tenía un buen servicio, pero muy pocos clientes nuevos y una web que casi nadie encontraba. Le montamos una empresa con empleados digitales y en 3 meses su facturación creció más de un 120 %.',
  historia: [
    { k: 'Antes', t: 'A punto de bajar la persiana', d: 'Faltaba clientela y la web no se veía: casi nadie llegaba a Spa Organic desde internet, y sin clientes nuevos el negocio no se sostenía.' },
    { k: 'Lo que montamos', t: 'Una empresa con empleados digitales', d: 'Una oficina de IA con agentes que atienden cada consulta de la web, publican contenido, cuidan su presencia en Google y hacen el seguimiento de cada cliente, todo visible en un panel.' },
    { k: 'Después', t: '+120 % de facturación en 3 meses', d: 'Más visibilidad, más consultas y ninguna petición sin respuesta. En tres meses la facturación creció más de un 120 %.' },
  ],
  filas: [
    { k: 'Clientes nuevos', a: 'Muy pocos: el negocio estaba en riesgo', d: 'Llegan desde la web y Google' },
    { k: 'Visibilidad', a: 'Una web que casi nadie encontraba', d: 'Contenido y presencia en Google cada semana' },
    { k: 'Consultas', a: 'Se contestaban cuando había tiempo', d: 'Los agentes contestan y proponen cita' },
    { k: 'Seguimiento', a: 'A mano, si se acordaban', d: 'Recordatorios y seguimiento automáticos' },
  ],
  marca: {
    placa: 'SPA ORGANIC', ceo: 'Dirección', logo: '/img/logo-spaorganic.webp', lema: 'SALUD CAPILAR · CASTELLDEFELS', pantalla: 'SPA ORGANIC · EN DIRECTO',
    pizarra: ['Hoy en el spa', '+ visibilidad = + reservas'], nombres: NOMBRES_SPA,
    deptos: { direccion: 'Dirección', ventas: 'Reservas', marketing: 'Marketing', clientes: 'Clientes', finanzas: 'Gestión' },
    charla: [
      ['webleads', 'pipeline', 'Nueva consulta desde la web: quiere un diagnóstico capilar.'],
      ['pipeline', 'ceo', 'Contestada y con propuesta de cita.'],
      ['contenido', 'publicador', 'El artículo sobre caída del cabello está listo.'],
      ['publicador', 'todos', 'Publicado en el blog y en redes.'],
      ['ads', 'ceo', 'Campaña local revisada, dentro del tope.'],
      ['seguimiento', 'redactor', 'Esta clienta no ha confirmado: toca recordatorio.'],
      ['cs', 'produccion', 'Una clienta pregunta por su próximo tratamiento.'],
      ['seo', 'contenido', 'Te dejo temas nuevos sobre salud capilar.'],
      ['ceo', 'todos', 'Foco de hoy: ninguna consulta sin respuesta.'],
    ],
  },
};

const NOMBRES = [
  { ceo: 'Dirección', prospector: 'Marta', demos: 'Joan', redactor: 'Clara', seguimiento: 'Pere', recontacto: 'Sílvia', finanzas: 'Xavi', cartera: 'Anna', semanal: 'Rosa', resumen: 'Toni', webleads: 'Núria', pipeline: 'Montse', contenido: 'Lluís', publicador: 'Eva', analista: 'Jordi', ads: 'Mar', cs: 'Elisa', produccion: 'Oriol', seo: 'Neus' },
  { ceo: 'Dirección', prospector: 'Àlex', demos: 'Berta', redactor: 'Guillem', seguimiento: 'Maria', recontacto: 'Ferran', finanzas: 'Laia', cartera: 'Enric', semanal: 'Gemma', resumen: 'Roger', webleads: 'Mònica', pipeline: 'Judit', contenido: 'Adrià', publicador: 'Carme', analista: 'Sergi', ads: 'Paula', cs: 'Marc', produccion: 'Ester', seo: 'David' },
  { ceo: 'Dirección', prospector: 'Lucía', demos: 'Irene', redactor: 'Sara', seguimiento: 'Noa', recontacto: 'Álvaro', finanzas: 'Helena', cartera: 'Hugo', semanal: 'Vega', resumen: 'Inés', webleads: 'Alba', pipeline: 'Carla', contenido: 'Olivia', publicador: 'Mario', analista: 'Leo', ads: 'Daniela', cs: 'Valeria', produccion: 'Bruno', seo: 'Martina' },
  { ceo: 'Dirección', prospector: 'Elena', demos: 'Lola', redactor: 'Sofía', seguimiento: 'Aitana', recontacto: 'Pablo', finanzas: 'Julia', cartera: 'Nico', semanal: 'Carmen', resumen: 'Lara', webleads: 'Emma', pipeline: 'Vera', contenido: 'Aina', publicador: 'Iker', analista: 'Gael', ads: 'Mía', cs: 'Abril', produccion: 'Unai', seo: 'Candela' },
];
const CHARLA_DENTAL = [
  ['webleads', 'pipeline', 'Petición de primera visita desde la web.'],
  ['pipeline', 'ceo', 'Contestada con propuesta de cita en agenda.'],
  ['seguimiento', 'redactor', 'Paciente sin confirmar: toca recordatorio.'],
  ['contenido', 'publicador', 'Artículo sobre implantes listo para publicar.'],
  ['cs', 'produccion', 'Un paciente pregunta por su próxima revisión.'],
  ['ads', 'ceo', 'Campaña de la clínica revisada, dentro del tope.'],
  ['ceo', 'todos', 'Foco de hoy: ninguna petición de cita sin respuesta.'],
];
const CHARLA_ESTETICA = [
  ['webleads', 'pipeline', 'Consulta nueva: quiere información de un tratamiento facial.'],
  ['pipeline', 'ceo', 'Contestada con huecos libres para la cita.'],
  ['seguimiento', 'cs', 'Clienta habitual: toca recordarle su próxima sesión.'],
  ['contenido', 'publicador', 'Post sobre láser e IPL listo.'],
  ['publicador', 'todos', 'Publicado en redes y en la web.'],
  ['ceo', 'todos', 'Foco de hoy: que vuelvan las clientas de siempre.'],
];
const neg = (i, nombre, corto, tipo, color, lema, charla) => ({
  nombre, corto, tipo, color,
  marca: { placa: corto.toUpperCase(), ceo: 'Dirección', logo: '/img/logo-velasegala.webp', lema, pantalla: `${corto.toUpperCase()} · EN DIRECTO`, pizarra: ['Hoy en el centro', '+ citas = + pacientes'], nombres: NOMBRES[i],
    deptos: { direccion: 'Dirección', ventas: 'Citas', marketing: 'Marketing', clientes: tipo === 'Clínica dental' ? 'Pacientes' : 'Clientas', finanzas: 'Gestión' }, charla },
});

export const VELA_IA = {
  slug: 'vela-segala',
  nombre: 'Clínicas Vela-Segalà',
  sector: 'Clínicas dentales y centros de estética',
  web: 'velasegala.com',
  url: 'https://velasegala.com',
  logo: '/img/logo-velasegala.webp',
  logoClaro: false,
  titular: 'Cuatro negocios, cuatro webs. Ahora, una sola oficina.',
  cifra: { v: 20000, pre: '+', suf: ' €', l: 'facturados en 3 meses' },
  cifra2: { v: 80, pre: '+', suf: ' %', l: 'de facturación' },
  resumen: 'Vela-Segalà tenía cuatro negocios con cuatro webs distintas: dos clínicas dentales y dos centros de estética. Las unificamos y le pusimos a cada negocio su propia oficina de IA, todas conectadas a un mismo panel.',
  historia: [
    { k: 'Antes', t: 'Cuatro webs que no hablaban entre sí', d: 'Dos webs para sus clínicas dentales y dos para sus centros de estética: cuatro sitios que mantener, cuatro formas de pedir cita y ninguna visión de conjunto.' },
    { k: 'Lo que montamos', t: 'Una web, cuatro oficinas, un panel', d: 'Unificamos las cuatro webs en una sola y cada negocio tiene su oficina de IA: atienden las peticiones de cita, envían recordatorios y responden al momento. Todo se ve desde un panel único.' },
    { k: 'Después', t: '+20.000 € en 3 meses', d: 'Con todo unificado y las citas abiertas a cualquier hora por la web y WhatsApp, la facturación creció un 80 %.' },
  ],
  filas: [
    { k: 'Webs', a: 'Cuatro webs distintas, una por negocio', d: 'Una sola web con los cuatro negocios' },
    { k: 'Citas', a: 'Solo por teléfono y en horario de clínica', d: 'A cualquier hora, por la web y por WhatsApp' },
    { k: 'Google', a: 'Poco visibles en las búsquedas locales', d: 'Posicionados en las búsquedas locales' },
    { k: 'Mensajes', a: 'Consultas sin contestar fuera de horario', d: 'El asistente IA responde al momento' },
    { k: 'Ausencias', a: 'Recordatorios a mano, cuando había tiempo', d: 'Recordatorios automáticos antes de cada cita' },
  ],
  centro: { titulo: 'PANEL ÚNICO · VELA-SEGALÀ', dominio: 'velasegala.com' },
  oficinas: [
    neg(0, 'Clínica Dental Viladecans', 'Dental Viladecans', 'Clínica dental', '#2f6bff', 'IMPLANTES Y ESTÉTICA DENTAL', CHARLA_DENTAL),
    neg(1, 'Clínica Dental Sant Celoni', 'Dental Sant Celoni', 'Clínica dental', '#00a3c4', 'IMPLANTES Y ESTÉTICA DENTAL', CHARLA_DENTAL),
    neg(2, 'Estética Vela-Segalà', 'Estética', 'Centro de estética', '#e86aa0', 'TRATAMIENTOS FACIALES · LÁSER · MASAJES', CHARLA_ESTETICA),
    neg(3, 'Estética avanzada', 'Estética avanzada', 'Centro de estética', '#a77bf3', 'MEDICINA ESTÉTICA AVANZADA', CHARLA_ESTETICA),
  ],
};

export const CASOS_IA = [SPA, VELA_IA];

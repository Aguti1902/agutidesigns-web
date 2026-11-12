// Casos de éxito de la «Oficina de IA».
// Spa Organic: historia y cifra facilitadas por Agutidesigns (+120 % de facturación en 3 meses).
// Vela-Segalà: cifras facilitadas por la clínica (+20.000 € en 3 meses, +80 % de facturación). Lo montado (según Guti, 12-nov): webs unificadas en un panel + agentes de campañas, SEO y blog, seguridad web y estrategia digital. NO WhatsApp ni llamadas.

const NOMBRES_SPA = { ceo: 'Dirección', prospector: 'Nuria', demos: 'Ona', redactor: 'Pau', seguimiento: 'Laia', recontacto: 'Jan', finanzas: 'Marc', cartera: 'Aina', semanal: 'Júlia', resumen: 'Carla', webleads: 'Emma', pipeline: 'Berta', contenido: 'Irene', publicador: 'Pol', analista: 'Arnau', ads: 'Biel', cs: 'Mireia', produccion: 'Gerard', seo: 'Queralt' };

export const SPA = {
  slug: 'spa-organic',
  nombre: 'Spa Organic',
  sector: 'Salud capilar · Castelldefels',
  web: 'spaorganic.es',
  url: 'https://spaorganic.es',
  logo: '/img/logo-spaorganic.webp',
  logoClaro: true,
  fondo: 'radial-gradient(90% 80% at 50% 30%, #3a4034 0%, #1b1d19 75%)',
  hero: 'radial-gradient(80% 90% at 70% 0%, #3d4436 0%, #161814 70%)',
  titular: 'Estaba a punto de cerrar. Hoy factura más del doble.',
  cifra: { v: 120, pre: '+', suf: ' %', l: 'de facturación en 3 meses' },
  resumen: 'Spa Organic tenía un buen servicio, pero muy pocos clientes nuevos y una web que casi nadie encontraba. Le montamos una empresa con empleados digitales y en 3 meses su facturación creció más de un 120 %.',
  reto: [
    'Spa Organic es un centro de salud capilar en Castelldefels con tratamientos orgánicos y un trato muy cuidado. El problema no era el servicio: era que casi nadie lo conocía.',
    'Su web apenas aparecía cuando alguien buscaba un tratamiento capilar en la zona, las consultas llegaban con cuentagotas y muchas se contestaban tarde, cuando había un hueco entre cliente y cliente. Sin clientes nuevos, el negocio estaba a punto de cerrar.',
  ],
  agentes: [
    { t: 'Agente de reservas', d: 'Contesta cada consulta que llega desde la web, resuelve las dudas sobre los tratamientos y propone una cita.' },
    { t: 'Agente de contenido', d: 'Escribe artículos sobre salud capilar que responden a lo que la gente busca en Google, con el tono de Spa Organic.' },
    { t: 'Agente de Google', d: 'Mantiene viva la ficha de Google con publicaciones regulares para que el centro aparezca en las búsquedas de la zona.' },
    { t: 'Agente de seguimiento', d: 'Recuerda las citas, vuelve a contactar a quien preguntó y no reservó, y avisa cuando toca el siguiente tratamiento.' },
    { t: 'Panel de dirección', d: 'Todo lo que hacen los agentes se ve en un panel, y lo delicado espera la aprobación de Spa Organic.' },
  ],
  cambios: [
    'Lo primero que cambió fue la visibilidad: con contenido nuevo cada semana y la ficha de Google cuidada, Spa Organic empezó a aparecer donde sus clientes la buscaban.',
    'Lo segundo, la respuesta: ninguna consulta se queda esperando. Los agentes contestan, proponen cita y hacen el seguimiento, y el equipo del centro se dedica a lo que mejor sabe hacer, cuidar a sus clientes.',
    'El resultado, en solo tres meses: la facturación creció más de un 120 %. Un negocio que estaba a punto de cerrar hoy factura más del doble.',
  ],
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
    tema: 'spa', ventana: 0xcfe0c4, inicial: 'S', acentoCss: '#e3d3b5', pantallaA: '#2b2f2a', pantallaB: '#5f6b48', codigo: ['#e3d3b5', '#a7b98a', '#ffffff', '#c7865b', '#d9c09a'],
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
  ['seo', 'contenido', 'Tema nuevo para el blog: implantes en un día.'],
  ['analista', 'ceo', 'La web está al día y protegida.'],
  ['contenido', 'publicador', 'Artículo sobre implantes listo para publicar.'],
  ['ads', 'ceo', 'Campaña de la clínica revisada, dentro del tope.'],
  ['ceo', 'todos', 'Foco de hoy: más visibilidad en Google.'],
];
const CHARLA_ESTETICA = [
  ['ads', 'ceo', 'Campaña de tratamientos faciales ajustada, dentro del tope.'],
  ['seo', 'contenido', 'Tema nuevo para el blog: láser e IPL en invierno.'],
  ['contenido', 'publicador', 'Post sobre láser e IPL listo.'],
  ['publicador', 'todos', 'Publicado en redes y en la web.'],
  ['ceo', 'todos', 'Foco de hoy: estrategia del mes lista para revisar.'],
];
const neg = (i, nombre, corto, tipo, color, lema, charla) => ({
  nombre, corto, tipo, color,
  marca: { tema: 'clinica', acento: parseInt(color.slice(1), 16), acentoCss: color, inicial: 'V', pantallaA: '#16181d', pantallaB: color, placa: corto.toUpperCase(), ceo: 'Dirección', logo: '/img/logo-velasegala.webp', lema, pantalla: `${corto.toUpperCase()} · EN DIRECTO`, pizarra: ['Hoy en el centro', '+ citas = + pacientes'], nombres: NOMBRES[i],
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
  fondo: 'radial-gradient(90% 80% at 50% 30%, #2e3138 0%, #0d0e11 75%)',
  hero: 'radial-gradient(80% 90% at 70% 0%, #2c2f36 0%, #0b0c0f 70%)',
  titular: 'Cuatro negocios, cuatro webs. Ahora, una sola oficina.',
  cifra: { v: 20000, pre: '+', suf: ' €', l: 'facturados en 3 meses' },
  cifra2: { v: 80, pre: '+', suf: ' %', l: 'de facturación' },
  resumen: 'Vela-Segalà tenía cuatro negocios con cuatro webs distintas: dos clínicas dentales y dos centros de estética. Unificamos todas sus webs en un mismo panel y les pusimos agentes de IA para las campañas, el SEO y el blog, la seguridad web y la estrategia digital.',
  reto: [
    'Clínicas Vela-Segalà son dos clínicas dentales, en Viladecans y Sant Celoni, y dos centros de estética. Un equipo de referencia en implantología y estética dental, con cuatro negocios que funcionaban cada uno por su lado.',
    'Cada negocio tenía su propia web: cuatro sitios distintos que mantener, sin una visión de conjunto. Las campañas, el posicionamiento en Google, el blog y la seguridad de las webs se llevaban por separado, cuando había tiempo.',
  ],
  agentes: [
    { t: 'Todo en un mismo panel', d: 'Unificamos todas sus webs en un mismo panel: la dirección tiene el control total de los cuatro negocios desde un solo sitio.' },
    { t: 'Agente de campañas', d: 'Automatiza las campañas de publicidad: revisa cada día qué funciona, ajusta y nunca pasa del tope fijado.' },
    { t: 'Agente de SEO y blog', d: 'Escribe los artículos del blog y trabaja el posicionamiento para que cada clínica aparezca cuando la buscan en Google.' },
    { t: 'Agente de seguridad web', d: 'Vigila que todas las webs estén en marcha, actualizadas y protegidas, y avisa antes de que un problema afecte al negocio.' },
    { t: 'Agente de estrategia digital', d: 'Cruza lo que pasa en los cuatro negocios y propone dónde invertir y qué mejorar cada mes.' },
  ],
  cambios: [
    'Con todas las webs unificadas en un mismo panel, Vela-Segalà dejó de gestionar cuatro negocios por separado y pasó a tener el control total desde un solo sitio.',
    'Los agentes de IA llevan cada día las campañas, el SEO y el blog, la seguridad de las webs y la estrategia digital, sin depender de que alguien encuentre un hueco.',
    'En tres meses, más de 20.000 € facturados y un 80 % más de facturación.',
  ],
  historia: [
    { k: 'Antes', t: 'Cuatro webs que no hablaban entre sí', d: 'Dos webs para sus clínicas dentales y dos para sus centros de estética: cuatro sitios que mantener por separado y ninguna visión de conjunto.' },
    { k: 'Lo que montamos', t: 'Un panel y un equipo de agentes', d: 'Unificamos todas las webs en un mismo panel y pusimos agentes de IA para las campañas, el SEO y el blog, la seguridad de las webs y la estrategia digital.' },
    { k: 'Después', t: '+20.000 € en 3 meses', d: 'Con todo unificado y los agentes trabajando cada día, la facturación creció un 80 %.' },
  ],
  filas: [
    { k: 'Webs', a: 'Cuatro webs, cada una por su lado', d: 'Todas en un mismo panel, con control total' },
    { k: 'Campañas', a: 'Se revisaban cuando había tiempo', d: 'Un agente las automatiza cada día, dentro del tope' },
    { k: 'SEO y blog', a: 'Sin publicar con regularidad', d: 'Artículos y posicionamiento cada semana' },
    { k: 'Seguridad', a: 'Revisión a mano, de vez en cuando', d: 'Vigilancia diaria de todas las webs' },
    { k: 'Estrategia', a: 'Decisiones por intuición', d: 'Propuestas cada mes con los datos de los cuatro negocios' },
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

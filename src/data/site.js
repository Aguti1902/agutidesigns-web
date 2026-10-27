// Datos compartidos de la web pública (precios, reseñas, preguntas, contacto).
// Un solo sitio para cambiar precios o textos en toda la web.

export const CONTACT = {
  whatsapp: 'https://wa.me/34625204337',
  whatsappText: (t) => `https://wa.me/34625204337?text=${encodeURIComponent(t)}`,
  phone: '+34 625 204 337',
  email: 'info@agutidesigns.io',
  calendly: 'https://calendly.com/agutidesigns/reunion',
  instagram: 'https://instagram.com/agutidesigns',
  linkedin: 'https://linkedin.com/in/agutidesigns',
};

export const PLANS = [
  {
    id: 'base',
    name: 'Base',
    monthly: '190',
    setup: '990',
    pitch: 'Tu web nueva, siempre al día y sin preocuparte de nada técnico.',
    includes: ['Web a medida, rápida y pensada para el móvil', 'Formulario y botón de cita en un clic', 'Hosting, dominio, seguridad y copias diarias', 'Cambios de contenido cuando los necesites', 'SEO on-page y Google Search Console'],
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    monthly: '590',
    setup: '1.490',
    pitch: 'Todo lo de Base y trabajamos tu posicionamiento en Google cada mes.',
    includes: ['Todo lo del plan Base', 'SEO local mensual para tu ciudad', 'Ficha de Google Business optimizada', 'Sistema para conseguir y responder reseñas', 'Páginas por servicio o tratamiento', 'Informe mensual de resultados'],
    recommended: true,
  },
  {
    id: 'ia',
    name: 'IA',
    monthly: '1.490',
    setup: '2.490',
    pitch: 'Todo lo de Crecimiento y un asistente que atiende y agenda por ti 24/7.',
    includes: ['Todo lo del plan Crecimiento', 'Asistente IA en la web y en WhatsApp', 'Citas y recordatorios automáticos', 'Seguimiento automático de presupuestos', 'Panel con tus números en tiempo real', 'Formación para tu equipo'],
  },
];

export const PARTNER = { name: 'Partner', monthly: '2.900', setup: '3.900', pitch: 'Llevamos todo tu marketing digital contigo, como un departamento propio.' };

export const REVIEWS_GENERAL = [
  { name: 'María García', role: 'Fundadora, Stay4Days', text: 'Guti transformó completamente nuestra presencia online. La web es rápida, preciosa y en pocas semanas ya notamos más reservas. 100% recomendable.' },
  { name: 'Lucía Fernández', role: 'Directora, Spa Organic', text: 'Desde que estrenamos la nueva web, las reservas online han aumentado un 40%. El diseño transmite exactamente la esencia de nuestro spa. Muy profesional.' },
  { name: 'Carlos Lardón', role: 'Socio, LGO Legal', text: 'Necesitábamos una web que transmitiera confianza y seriedad. Guti lo entendió a la primera. El proceso fue rápido, claro y el resultado superó nuestras expectativas.' },
  { name: 'Ramón Rusiñol', role: 'Gerente, Gestoría Rusiñol', text: 'Teníamos una web antigua que no convertía nada. Ahora recibimos consultas cada semana gracias al formulario y al posicionamiento en Google. Excelente trabajo.' },
  { name: 'Marc Bosch', role: 'CEO, NexGent', text: 'Para una startup de IA era clave tener una web que impresionara. Guti nos entregó algo que enseñamos con orgullo a inversores y clientes. Muy recomendable.' },
  { name: 'Sofía Torres', role: 'Franquiciada, Hello Nails', text: 'Rapidez, profesionalidad y un resultado espectacular. La web de mi franquicia se ve increíble en móvil y ya tenemos citas online funcionando perfectamente.' },
];

export const REVIEWS_CLINICAS = [
  { name: 'Dra. Laura Martínez', role: 'Directora, Clínica DentPlus Barcelona', text: 'En 3 meses pasamos de 4 nuevos pacientes al mes a más de 20. La web convierte muchísimo y el SEO nos puso en el top de Google. Mejor inversión que hemos hecho.' },
  { name: 'Dr. Jordi Puig', role: 'Titular, Clínica Puig Dental', text: 'La IA ha cambiado nuestra clínica. Ya no perdemos llamadas fuera de horario. Los pacientes reservan solos a las 11 de la noche y nosotros llegamos con la agenda llena.' },
  { name: 'Dra. Ana Soto', role: 'Socia, OrthoSmile Madrid', text: 'Teníamos una web de 2015 que no servía para nada. Ahora somos los primeros en Google cuando alguien busca "ortodoncia Madrid centro". El retorno ha sido increíble.' },
  { name: 'Dr. Marc Ferrer', role: 'Gerente, Ferrer Clínica Dental', text: 'Guti entendió perfectamente lo que necesitaba: una web seria, rápida y que atrajera pacientes de implantes. En 2 semanas estaba online y en 60 días ya notamos el cambio.' },
];

export const FAQ_GENERAL = [
  { q: '¿Cuánto cuesta una página web profesional?', a: 'Trabajamos con una puesta en marcha única y una cuota mensual que incluye hosting, mantenimiento, cambios y, según el plan, SEO local y asistente IA. El plan Base empieza en 190 €/mes + 990 € de alta. Si solo necesitas una web puntual sin cuota, la calculadora te da un precio orientativo en dos minutos.' },
  { q: '¿Cuánto se tarda en tener la web lista?', a: 'Entre 2 y 3 semanas desde que tenemos la información del negocio. Antes de empezar te enseñamos una demo de cómo quedaría tu web, sin compromiso.' },
  { q: '¿Aparecerá mi negocio en Google?', a: 'Todas las webs salen con SEO on-page, velocidad optimizada, sitemap y Search Console. En los planes Crecimiento e IA además trabajamos cada mes el SEO local y tu ficha de Google para que aparezcas cuando buscan tu servicio en tu ciudad.' },
  { q: '¿Qué hace exactamente el asistente IA?', a: 'Responde al momento en tu web y en WhatsApp las dudas habituales (horarios, servicios, cómo reservar), propone cita y te pasa los casos que necesitan a una persona. Se entrena con la información de tu negocio.' },
  { q: '¿Puedo cambiar cosas de la web después?', a: 'Sí. Los cambios de contenido están incluidos en la cuota: nos los pides por WhatsApp o email y los hacemos nosotros.' },
  { q: '¿Trabajáis solo en Barcelona?', a: 'Estamos en Barcelona y trabajamos con negocios de toda España en remoto. Si estás cerca, también podemos vernos en persona.' },
];

export const FAQ_CLINICAS = [
  { q: '¿Cuánto cuesta la web de una clínica dental?', a: 'El plan Base empieza en 190 €/mes + 990 € de alta e incluye la web a medida, hosting, mantenimiento y cambios. La mayoría de clínicas eligen Crecimiento (590 €/mes + 1.490 € de alta), que suma SEO local, ficha de Google y reseñas.' },
  { q: '¿Cuánto tarda en estar lista la web de mi clínica?', a: 'Entre 2 y 3 semanas. Si incluimos el asistente IA y la conexión con tu agenda, sumamos alrededor de una semana más. Te damos fecha de entrega confirmada al empezar.' },
  { q: '¿En cuánto tiempo se nota en Google?', a: 'Los cambios en la ficha de Google suelen notarse en pocas semanas y el SEO local, en uno a tres meses. Depende de la competencia de tu zona.' },
  { q: '¿El asistente IA da información médica?', a: 'No. Responde dudas generales (horarios, tratamientos que hacéis, cómo pedir cita) y deriva a la clínica todo lo clínico. Lo configuramos contigo.' },
  { q: '¿Funciona con mi agenda actual?', a: 'Conectamos la reserva online con el software de agenda que ya uséis siempre que lo permita. Si no tenéis, os proponemos una opción sencilla.' },
  { q: '¿La web cumple la normativa de publicidad sanitaria?', a: 'Revisamos los textos contigo para evitar promesas de resultados y mensajes que la normativa no permite.' },
];

export const PROCESS = [
  { t: 'Llamada de 20 minutos', d: 'Nos cuentas tu negocio y qué quieres conseguir. Analizamos tu web actual y tu competencia en Google.' },
  { t: 'Demo de tu nueva web', d: 'Te enseñamos una propuesta visual con tu marca antes de que pagues nada.' },
  { t: 'Lanzamiento en 2–3 semanas', d: 'Publicamos la web, conectamos Google y, si toca, el asistente IA y los recordatorios.' },
  { t: 'Mejora cada mes', d: 'Cambios, SEO local e informe mensual para que veas qué llega y de dónde.' },
];

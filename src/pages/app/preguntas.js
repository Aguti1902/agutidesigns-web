// Preguntas frecuentes del Centro de ayuda, por colección. Solo datos reales del producto.
import { BOLSA_EXTRA, DIAS_PRUEBA, DEPTO, precioOficina, precioAnual } from '../../data/oficinaSaas';

const p = (n) => `${precioOficina(n)} €`;

export const PREGUNTAS = [
  // Primeros pasos
  ['empezar', '¿Cuánto tarda en estar funcionando mi oficina?', 'Lo que tardes en rellenar «Lo que saben tus agentes» y conectar tus herramientas. Con lo básico (horarios, precios y a qué te dedicas) tus agentes ya pueden empezar a trabajar.'],
  ['empezar', '¿Qué es lo mínimo que tengo que rellenar?', 'A qué te dedicas, tu horario y tus servicios con sus precios. Con eso contestan lo más habitual. Cuanto más añadas (preguntas frecuentes, condiciones, enlaces), menos te preguntarán a ti.'],
  ['empezar', '¿Puedo probar cómo contestan antes de conectar nada?', 'Sí. Al final de «Lo que saben tus agentes» tienes «Pruébalo tú»: escribes como si fueras un cliente y ves lo que contestaría tu agente de Atención con lo que le has enseñado.'],
  ['empezar', '¿Dónde veo lo que han hecho hoy mis agentes?', 'En Inicio tienes el resumen del día y en «Actividad» el registro completo de lo que ha hecho cada departamento, con la hora.'],
  ['empezar', '¿Qué significan los números en el menú?', 'Son cosas pendientes: tareas en «Te necesitan», conversaciones que esperan respuesta o citas por confirmar. El rojo indica lo más urgente.'],
  ['empezar', '¿Puedo ver la oficina en 3D?', 'Sí, en «Oficina 3D». Ves a tus agentes trabajando en tiempo real y puedes personalizarla: tu logo, colores, suelo, paredes, muebles y fotos.'],
  ['empezar', '¿Hay un tutorial?', 'Sí. Desde «Ayuda y soporte › Tutorial guiado» repites el recorrido de bienvenida cuando quieras, y en «Vídeos tutoriales» tienes un vídeo corto por cada parte del panel.'],

  // Tus agentes
  ['agentes', '¿Mis agentes se pueden inventar un precio o una promoción?', 'No. Solo usan lo que has puesto en «Lo que saben». Si les preguntan algo que no está, dicen que lo consultan y te lo pasan a «Te necesitan».'],
  ['agentes', '¿Qué pasa si un cliente se enfada o se queja?', 'Tu agente contesta con amabilidad y te pasa la conversación para que la lleves tú. Lo mismo si piden hablar con una persona o piden un descuento.'],
  ['agentes', '¿Puedo contestar yo en una conversación?', 'Sí. Abre la conversación en «Conversaciones» y escribe. A partir de ahí la llevas tú y tu agente no contesta hasta que se la devuelvas.'],
  ['agentes', '¿Mis clientes saben que hablan con una IA?', 'Tus agentes contestan en nombre de tu negocio. Si un cliente pregunta si es una IA, dicen la verdad: que son el asistente virtual del negocio.'],
  ['agentes', '¿Puedo cambiar el tono con el que hablan?', 'Sí. En «Lo que saben › Tu negocio» indica cómo hablas con tus clientes (de tú o de usted, con emojis o sin ellos) y en «Cómo trabaja» de cada departamento puedes afinarlo más.'],
  ['agentes', '¿Puedo prohibirles hacer algo?', 'Sí. En «Lo que saben › Tu negocio», el campo «Lo que nunca deben hacer o decir». Por ejemplo: no dar descuentos o no confirmar citas sin mirar la agenda.'],
  ['agentes', '¿Puedo pausar un departamento?', 'Sí, desde «Departamentos» o desde la sección de cada uno. Mientras está en pausa no trabaja y no gasta cupo.'],
  ['agentes', '¿Puedo pedir que me enseñen todo antes de hacerlo?', 'Sí. En «Cómo trabaja» de cada departamento eliges qué hace solo y qué te deja antes en «Te necesitan» para que lo apruebes.'],
  ['agentes', '¿Puedo hablar con un solo departamento?', 'Sí. En «Chat con tu equipo» eliges «Toda la oficina» o un departamento concreto. Cada uno contesta sobre lo suyo y guarda su propio historial.'],
  ['agentes', '¿Puedo encargarles cosas por el chat?', 'Sí. Por ejemplo: «hazme un carrusel sobre la oferta de esta semana» o «escribe un artículo sobre cómo cuidar el pelo teñido». El encargo aparece después para que lo revises.'],
  ['agentes', '¿Los agentes llaman por teléfono?', 'No. Atienden por WhatsApp, por el chat de tu web y por correo. No hacen llamadas.'],

  // Redes y contenido
  ['redes', '¿Cuántas publicaciones hace al mes el agente de Redes?', `${DEPTO.redes.cupo.detalle}.`],
  ['redes', '¿Se publican solas o las tengo que aprobar?', 'Tú decides. Por defecto te las deja en «Publicaciones» para que las revises; lo que apruebas se publica solo si tienes Instagram o Facebook conectado. Si no, puedes copiar el texto.'],
  ['redes', '¿Puedo editar el texto antes de aprobar?', 'Sí. En la tarjeta de cada publicación puedes cambiar el texto antes de pulsar «Aprobar».'],
  ['redes', '¿Puedo pedir una publicación concreta?', 'Sí. En «Publicaciones» escribe el tema y elige Historia, Post o Carrusel. En unos segundos la tienes para revisar.'],
  ['redes', '¿Usa mis fotos?', 'Sí, si las subes a «Tu material». Si no hay foto adecuada, el agente propone qué imagen usar.'],
  ['redes', '¿Cómo se hacen los reels y TikToks?', 'En «Vídeos» pides el tema. Tu agente escribe el guion; cuando lo apruebas, se monta el vídeo con voz y subtítulos. Puedes elegir la voz y el estilo.'],
  ['redes', '¿Cuántos artículos de blog escribe?', `${DEPTO.contenido.cupo.n} al mes, pensados para que te encuentren en Google en tu zona.`],
  ['redes', '¿Los artículos se publican en mi web?', 'Si conectas WordPress, lo que apruebas se publica en tu web. Si no, puedes copiarlo y publicarlo tú.'],
  ['redes', '¿Qué hace el departamento de Google y reseñas?', 'Responde las reseñas de tu Perfil de Empresa de Google, publica novedades en tu ficha y revisa que horarios y datos estén bien.'],
  ['redes', '¿Responde también las reseñas malas?', 'Las de 3 estrellas o menos te las deja con una respuesta propuesta para que la revises antes de publicarla.'],

  // Conexiones y CRM
  ['conexiones', '¿Necesito WhatsApp Business?', 'Para que tus agentes contesten por WhatsApp, sí: se conecta con tu cuenta de Meta desde «Conexiones».'],
  ['conexiones', '¿WhatsApp tiene coste aparte?', 'Sí. Las conversaciones de WhatsApp las factura Meta directamente a la tarjeta de tu negocio. Las primeras 1.000 respuestas a clientes de cada mes son gratis.'],
  ['conexiones', '¿Puedo seguir usando WhatsApp desde mi móvil?', 'Depende de cómo tengas tu número en Meta. Si tienes dudas antes de conectarlo, escríbenos y lo revisamos contigo.'],
  ['conexiones', '¿Cómo pongo el chat en mi web?', 'En «Conexiones», en el chat de la web, copias un pequeño código y lo pegas en tu web. Si no sabes hacerlo, escríbenos y lo hacemos contigo.'],
  ['conexiones', '¿Qué calendario puedo conectar?', 'Google Calendar u Outlook. Así el agente de Citas mira tus huecos libres y apunta las citas confirmadas.'],
  ['conexiones', 'Ya tengo un programa de gestión, ¿tengo que dejarlo?', 'No. No sustituimos tu programa: lo conectamos. Lo que consiguen tus agentes llega a tu programa y lo que apuntas allí lo conocen tus agentes.'],
  ['conexiones', '¿Qué CRM se conectan directamente?', 'HubSpot y Pipedrive, con un token que sacas de tu cuenta. El resto (Booksy, Treatwell, Gesden, Trainingym, Inmovilla…) se conecta con un webhook de Zapier, Make o n8n, o lo conectamos nosotros.'],
  ['conexiones', '¿Están seguras las claves de mis conexiones?', 'Las claves y permisos de tus conexiones se guardan cifrados y solo los usa tu oficina para trabajar con tus herramientas.'],
  ['conexiones', '¿Puedo desconectar una herramienta?', 'Sí, cuando quieras, desde «Conexiones» o desde «Tu CRM». Tus agentes dejan de usarla en ese momento.'],

  // Plan y facturación
  ['plan', '¿Cuánto cuesta?', `Depende de cuántos departamentos tengas: 1 departamento ${p(1)}/mes, 2 ${p(2)}, 3 ${p(3)}, 4 ${p(4)}, 5 ${p(5)} y los 6 ${p(6)}. Más IVA.`],
  ['plan', '¿Hay prueba gratis?', `Sí, ${DIAS_PRUEBA} días con el plan mensual. Pones la tarjeta y no se cobra nada hasta el día ${DIAS_PRUEBA + 1}. Si cancelas antes, no pagas.`],
  ['plan', '¿Hay permanencia?', 'En el plan mensual, no. Puedes darte de baja cuando quieras desde «Plan».'],
  ['plan', '¿Puedo pausar un mes?', 'Sí. En el plan mensual, desde «Plan», puedes pausar un mes. No se cobra nada durante esos 30 días, tus agentes no trabajan y la oficina vuelve sola, sin perder lo configurado.'],
  ['plan', '¿Qué ventajas tiene el plan anual?', `Pagas una vez al año con un 20 % de descuento desde 2 departamentos (por ejemplo, con 2 departamentos son ${precioAnual(2)} € al año). Con 3 departamentos o más incluye el diseño o rediseño de tu web.`],
  ['plan', '¿Qué es el cupo?', 'Lo que incluye cada departamento al mes: conversaciones, citas, seguimientos, piezas de redes, reseñas o artículos. Lo ves en «Plan» con una previsión de cómo acabarás el mes.'],
  ['plan', '¿Me avisáis antes de que se acabe?', 'Sí, al llegar al 80 % y al 100 % de cada departamento.'],
  ['plan', '¿Qué pasa si se acaba el cupo?', 'Ese departamento solo te pasa los avisos importantes hasta que empiece el mes siguiente, o hasta que lo amplíes. Nunca se cobra de más sin que lo pidas.'],
  ['plan', '¿Cómo amplío un departamento?', `Con el botón «Ampliar»: +${BOLSA_EXTRA.porcentaje} % de su cupo solo ese mes por ${BOLSA_EXTRA.precio} € + IVA. Es un cobro único con su factura.`],
  ['plan', '¿Por qué un departamento tiene tope diario?', 'Para que el cupo se reparta a lo largo del mes y no se gaste en un solo día con un pico de mensajes.'],
  ['plan', '¿Puedo añadir o quitar departamentos?', 'Sí. Desde el menú, «Añadir departamento», o desde «Plan». El precio se ajusta al número de departamentos.'],
  ['plan', '¿Las facturas llevan IVA?', 'Sí, todas llevan IVA. Si eres autónomo, también la retención de IRPF. Las descargas en PDF desde «Facturas».'],
  ['plan', '¿Dónde cambio la tarjeta?', 'En «Plan», en «Tarjeta y facturación». Se abre el portal seguro de pagos.'],

  // Tu cuenta y «Lo que saben»
  ['cuenta', '¿Cómo entro al panel?', 'Con un enlace que te mandamos a tu correo, sin contraseña. Cada enlace caduca y solo sirve una vez.'],
  ['cuenta', '¿Puedo usar el panel en modo oscuro?', 'Sí. En tu perfil (abajo a la izquierda › Mi perfil) eliges Claro, Oscuro o Sistema.'],
  ['cuenta', '¿Qué documentos puedo subir a «Lo que saben»?', 'PDF, Word (.docx), TXT o CSV de hasta 20 MB: cartas, catálogos, tarifas, manuales… Tus agentes leen el texto.'],
  ['cuenta', 'He subido un PDF y dice que no tiene texto', 'Es un PDF escaneado (una foto del papel) y no hay texto que leer. Súbelo en Word o copia el texto en «Más información».'],
  ['cuenta', '¿Hay un límite de lo que pueden saber?', 'Pueden saber mucho, pero para que cada respuesta no salga cara usan como mucho unos 40.000 caracteres de documentos a la vez. Lo más importante, ponlo en apartados como servicios, condiciones o preguntas frecuentes.'],
  ['cuenta', '¿Puedo guardar contraseñas en «Enlaces y accesos»?', 'No. Esos enlaces se los pueden dar tus agentes a tus clientes. Para que usen tus herramientas, conéctalas en «Conexiones».'],
  ['cuenta', '¿Cómo cambio mis avisos?', 'En «Avisos y notificaciones» eliges qué te avisamos y por dónde, y si quieres el resumen de la semana.'],
];

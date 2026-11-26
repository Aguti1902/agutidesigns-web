// Páginas legales de Agutidesigns: aviso legal, política de privacidad y condiciones del servicio (Oficina de IA).
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useSeo from '../hooks/useSeo';
import { DIAS_PRUEBA } from '../data/oficinaSaas';
import './Legal.css';

export const TITULAR = {
  nombre: 'Alejandro Gutiérrez Gómez',
  nif: '48063365N',
  direccion: 'Av. Porta Diagonal 30, 08940 Cornellà de Llobregat (Barcelona), España',
  email: 'info@agutidesigns.io',
  web: 'agutidesigns.io',
};
const ACTUALIZADO = '26 de noviembre de 2026';

function Pagina({ titulo, ruta, descripcion, children }) {
  useSeo({ title: `${titulo} | Agutidesigns`, description: descripcion, path: ruta });
  return (
    <div className="ag">
      <Navbar />
      <main className="lg">
        <article className="lg__c">
          <p className="lg__k">Información legal</p>
          <h1>{titulo}</h1>
          <p className="lg__fecha">Última actualización: {ACTUALIZADO}</p>
          {children}
          <nav className="lg__otras" aria-label="Otras páginas legales">
            <a href="/aviso-legal">Aviso legal</a><a href="/privacidad">Política de privacidad</a><a href="/condiciones">Condiciones del servicio</a>
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  );
}

const Titular = () => (
  <ul className="lg__datos">
    <li><b>Titular:</b> {TITULAR.nombre}</li>
    <li><b>NIF:</b> {TITULAR.nif}</li>
    <li><b>Domicilio:</b> {TITULAR.direccion}</li>
    <li><b>Correo:</b> <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a></li>
    <li><b>Web:</b> {TITULAR.web}</li>
  </ul>
);

export function AvisoLegal() {
  return (
    <Pagina titulo="Aviso legal" ruta="/aviso-legal" descripcion="Datos del titular de agutidesigns.io y condiciones de uso de la web.">
      <h2>1. Quién está detrás de esta web</h2>
      <p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), te informamos de los datos del titular de agutidesigns.io y de sus subdominios (entre ellos panel.agutidesigns.io), que opera con el nombre comercial «Agutidesigns»:</p>
      <Titular />
      <h2>2. Uso de la web</h2>
      <p>Al navegar por esta web aceptas usarla de forma lícita, sin dañar su funcionamiento ni el de terceros, y sin intentar acceder a zonas o datos que no te correspondan.</p>
      <h2>3. Propiedad intelectual</h2>
      <p>Los textos, diseños, imágenes, código y marcas de esta web son de Agutidesigns o se usan con permiso de sus titulares. No puedes copiarlos, distribuirlos ni modificarlos sin autorización por escrito, salvo para uso personal y privado.</p>
      <h2>4. Responsabilidad</h2>
      <p>Trabajamos para que la información de la web sea correcta y esté actualizada, pero puede contener errores. No respondemos de los daños derivados del uso de la información de la web ni de los contenidos de las webs de terceros a las que enlacemos.</p>
      <h2>5. Ley aplicable</h2>
      <p>Este aviso se rige por la ley española. Para cualquier conflicto, las partes se someten a los juzgados y tribunales que correspondan conforme a la ley; si eres consumidor, los de tu domicilio.</p>
    </Pagina>
  );
}

export function Privacidad() {
  return (
    <Pagina titulo="Política de privacidad" ruta="/privacidad" descripcion="Cómo trata Agutidesigns tus datos personales: qué datos, para qué, con quién y cómo ejercer tus derechos.">
      <p>En esta política te explicamos cómo tratamos tus datos personales cuando visitas agutidesigns.io, nos pides información o presupuesto, o usas la Oficina de IA (el panel en panel.agutidesigns.io), conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).</p>
      <h2>1. Responsable del tratamiento</h2>
      <Titular />
      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><b>Datos de contacto:</b> nombre, correo, teléfono y lo que nos cuentes al pedir información o presupuesto (formularios, calculadora, correo o WhatsApp).</li>
        <li><b>Datos de tu cuenta en la Oficina de IA:</b> tu correo, tu nombre y foto de perfil si entras con Google, el nombre de tu negocio y los datos que configures en el panel (horarios, precios, servicios, documentos y lo que enseñes a tus agentes).</li>
        <li><b>Datos de facturación y pago:</b> datos fiscales y de pago. El pago lo gestiona Stripe: nosotros no vemos ni guardamos el número completo de tu tarjeta.</li>
        <li><b>Datos de las cuentas que conectes:</b> si conectas Google, WhatsApp, Instagram, Facebook u otras herramientas, los permisos y datos que autorices en cada una (por ejemplo, tus citas, tus reseñas o los mensajes de tus clientes), solo para que tus agentes hagan su trabajo.</li>
        <li><b>Datos de uso y navegación:</b> páginas visitadas, dispositivo y, si aceptas las cookies, datos de medición y publicidad (ver el punto 8).</li>
      </ul>
      <h2>3. Para qué los usamos y con qué base legal</h2>
      <ul>
        <li><b>Prestarte el servicio de la Oficina de IA</b> (crear tu cuenta, que tus agentes trabajen, darte soporte, facturar y cobrar): ejecución del contrato.</li>
        <li><b>Responder a tus solicitudes de información o presupuesto</b> y hacer el seguimiento: tu consentimiento y la aplicación de medidas precontractuales a petición tuya.</li>
        <li><b>Cumplir obligaciones legales</b> (fiscales y contables): obligación legal.</li>
        <li><b>Medir y mejorar la web y mostrar publicidad</b> (Google y Meta): tu consentimiento, que puedes retirar cuando quieras.</li>
        <li><b>Seguridad y prevención de fraude:</b> interés legítimo.</li>
      </ul>
      <h2>4. Los datos de los clientes de tu negocio</h2>
      <p>Cuando usas la Oficina de IA, tus agentes tratan datos de tus propios clientes (por ejemplo, los mensajes que te escriben o las citas que piden). Respecto a esos datos, tú eres el responsable del tratamiento y Agutidesigns actúa como encargado del tratamiento: solo los usamos para prestarte el servicio, siguiendo tus instrucciones, con las medidas de seguridad adecuadas y sin usarlos para fines propios. Al contratar el servicio aceptas este encargo en los términos del artículo 28 del RGPD, recogidos en las condiciones del servicio.</p>
      <h2>5. Con quién compartimos los datos</h2>
      <p>No vendemos tus datos. Los compartimos solo con los proveedores que necesitamos para prestar el servicio, que actúan como encargados del tratamiento:</p>
      <ul>
        <li>Alojamiento y base de datos: Vercel y Supabase.</li>
        <li>Pagos: Stripe.</li>
        <li>Correo: Resend y Google Workspace.</li>
        <li>Inteligencia artificial (para que los agentes entiendan y respondan, transcriban y hablen): OpenAI, Anthropic y ElevenLabs.</li>
        <li>Las plataformas que tú conectes (Google, Meta/WhatsApp, TikTok, Microsoft, tu CRM…), con los permisos que les des.</li>
        <li>Medición y publicidad, solo si aceptas las cookies: Google y Meta.</li>
      </ul>
      <p>Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso lo hacen con las garantías que exige el RGPD, como las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU.</p>
      <h2>6. Cuánto tiempo los guardamos</h2>
      <p>Mientras tengas la cuenta activa o mantengamos la relación. Al darte de baja, borramos o anonimizamos tus datos y los de tus clientes en un plazo razonable, salvo los que debamos conservar por ley (por ejemplo, las facturas, durante los plazos fiscales). Los datos de una solicitud de información que no llegue a contrato se guardan como máximo 2 años.</p>
      <h2>7. Tus derechos</h2>
      <p>Puedes pedir el acceso, la rectificación, la supresión, la oposición, la limitación del tratamiento y la portabilidad de tus datos, y retirar tu consentimiento cuando quieras, escribiendo a <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a>. Si crees que no hemos atendido bien tu petición, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
      <h2>8. Cookies</h2>
      <p>Usamos cookies técnicas necesarias para que la web y el panel funcionen (por ejemplo, para mantener tu sesión). Con tu consentimiento usamos también cookies de medición y publicidad de Google y Meta (Google Analytics, Google Ads y el píxel de Meta) para saber qué funciona y mostrar anuncios relevantes. Puedes aceptarlas o rechazarlas en el aviso de cookies y borrarlas desde tu navegador cuando quieras.</p>
      <h2>9. Datos de Google</h2>
      <p>Si entras con Google, solo recibimos tu nombre, tu correo y tu foto de perfil, para crear y abrir tu cuenta. Si conectas servicios de Google (Calendar, Perfil de Empresa, Search Console, Analytics, Gmail o Drive), usamos esos datos solo para las funciones que ves en tu panel, no los usamos para publicidad ni los compartimos con terceros fuera de lo descrito aquí, y nuestro uso de la información recibida de las API de Google cumple la Política de Datos de Usuario de los Servicios de las API de Google, incluidos sus requisitos de uso limitado. Puedes desconectarlos cuando quieras desde el panel o desde tu cuenta de Google.</p>
      <h2>10. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas, acceso restringido y claves de las conexiones guardadas cifradas.</p>
      <h2>11. Cambios</h2>
      <p>Si cambiamos esta política, publicaremos la nueva versión aquí y, si el cambio es importante, te avisaremos por correo.</p>
    </Pagina>
  );
}

export function Condiciones() {
  return (
    <Pagina titulo="Condiciones del servicio" ruta="/condiciones" descripcion="Condiciones de contratación y uso de la Oficina de IA de Agutidesigns: prueba gratis, pagos, cancelación y responsabilidades.">
      <p>Estas condiciones regulan la contratación y el uso de la <b>Oficina de IA</b>, el servicio de Agutidesigns por el que un equipo de agentes de inteligencia artificial trabaja para tu negocio desde el panel panel.agutidesigns.io. Al registrarte y contratar el servicio las aceptas.</p>
      <h2>1. Quién presta el servicio</h2>
      <Titular />
      <h2>2. A quién va dirigido</h2>
      <p>El servicio está pensado para negocios y profesionales. Al contratarlo declaras que eres mayor de edad y que actúas en nombre de tu negocio o actividad profesional.</p>
      <h2>3. Qué incluye</h2>
      <p>Cada departamento que contratas es un agente de IA con su tarea y un cupo mensual de trabajo, tal como se describe en la web y en tu panel en el momento de contratar. Puedes añadir o quitar departamentos desde tu panel. Algunas funciones necesitan que conectes tus propias cuentas (por ejemplo, WhatsApp Business, Google o tus redes sociales) y aceptes sus condiciones; los costes que esas plataformas te cobren directamente (por ejemplo, los mensajes de WhatsApp por encima de los gratuitos) no están incluidos.</p>
      <h2>4. Prueba gratis de {DIAS_PRUEBA} días</h2>
      <p>El plan mensual incluye {DIAS_PRUEBA} días de prueba gratis, durante los que cada departamento trabaja con una parte de su cupo. Para empezar la prueba hay que dejar una tarjeta de pago en Stripe. No se cobra nada durante la prueba. Si no cancelas antes de que termine, el primer cobro se hace automáticamente el día {DIAS_PRUEBA + 1} y la suscripción continúa mes a mes. Puedes cancelar durante la prueba desde tu panel sin ningún coste.</p>
      <h2>5. Precios, pagos e impuestos</h2>
      <p>Los precios son los que se muestran al contratar, sin IVA. A cada factura se le añade el IVA y, cuando corresponda, se aplica la retención de IRPF que marque la ley. El plan mensual se cobra cada mes por adelantado y el anual, una vez al año por adelantado. Los pagos se hacen con tarjeta a través de Stripe y las facturas están disponibles en tu panel. Si un cobro falla, te avisaremos y, si no se resuelve, el servicio puede quedar en pausa hasta que se pague.</p>
      <h2>6. Cancelación</h2>
      <p>El plan mensual no tiene permanencia: puedes cancelarlo cuando quieras desde tu panel y seguirá activo hasta el final del periodo ya pagado, sin más cobros. El plan anual se paga por adelantado y no se devuelve la parte no usada, salvo que la ley disponga otra cosa. Podemos cambiar los precios avisándote con al menos 30 días de antelación; si no estás de acuerdo, puedes cancelar antes de que se apliquen.</p>
      <h2>7. Uso correcto y responsabilidad sobre el contenido</h2>
      <p>Te comprometes a usar el servicio de forma lícita, a dar a tus agentes información veraz sobre tu negocio y a contar con permiso para tratar los datos de tus clientes y contactarles. No puedes usarlo para enviar spam, suplantar a nadie ni para actividades ilegales. Eres responsable de lo que tus agentes publiquen o envíen siguiendo tus instrucciones y de lo que apruebes en el panel.</p>
      <h2>8. Sobre la inteligencia artificial</h2>
      <p>Los agentes funcionan con inteligencia artificial y, como una persona, pueden equivocarse. Trabajan con la información que tú les das y con las reglas que fijes en el panel, y lo delicado puede quedar pendiente de tu aprobación. Te recomendamos revisar lo importante. No garantizamos resultados concretos de negocio (ventas, citas o posiciones en buscadores).</p>
      <h2>9. Disponibilidad</h2>
      <p>Trabajamos para que el servicio esté disponible siempre, pero puede haber interrupciones por mantenimiento, por fallos de proveedores (por ejemplo, de las plataformas que conectas o de los modelos de IA) o por causas ajenas a nosotros. En esos casos lo restableceremos lo antes posible.</p>
      <h2>10. Limitación de responsabilidad</h2>
      <p>En la medida en que lo permita la ley, nuestra responsabilidad total frente a ti por el servicio se limita a lo que hayas pagado en los 12 meses anteriores al hecho que la origine, y no respondemos de lucro cesante ni de daños indirectos. Nada de esto limita la responsabilidad que no pueda limitarse por ley.</p>
      <h2>11. Protección de datos y encargo del tratamiento</h2>
      <p>Tratamos tus datos según la <a href="/privacidad">política de privacidad</a>. Para los datos de tus clientes que tratan tus agentes, tú eres el responsable y Agutidesigns el encargado del tratamiento, conforme al artículo 28 del RGPD: los tratamos solo para prestarte el servicio y siguiendo tus instrucciones; garantizamos la confidencialidad de quienes acceden a ellos; aplicamos medidas de seguridad adecuadas; recurrimos a los subencargados indicados en la política de privacidad (y te informaremos de cambios para que puedas oponerte); te ayudamos a atender los derechos de las personas y en caso de brechas de seguridad; y, al terminar el servicio, los borramos o te los devolvemos si nos lo pides.</p>
      <h2>12. Propiedad</h2>
      <p>El contenido que generan tus agentes para tu negocio (textos, publicaciones, respuestas) es tuyo para que lo uses libremente. El software, el panel, la oficina 3D y la marca Agutidesigns son nuestros.</p>
      <h2>13. Cambios en estas condiciones</h2>
      <p>Podemos actualizar estas condiciones. Si el cambio es importante, te avisaremos por correo con antelación; si sigues usando el servicio después, se entiende que lo aceptas.</p>
      <h2>14. Ley aplicable y contacto</h2>
      <p>Estas condiciones se rigen por la ley española. Para cualquier duda o reclamación, escríbenos a <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a>.</p>
    </Pagina>
  );
}

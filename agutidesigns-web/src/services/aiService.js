/* =============================================
   AGUTIDESIGNS - AI Service
   Integración con OpenAI para chatbot, 
   presupuestos automáticos y cualificación de leads
   ============================================= */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ── Configuración ──
// IMPORTANTE: En producción, usa variables de entorno del servidor (backend)
// Nunca expongas la API key en el frontend en producción
const getApiKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY || '';
};

// ── System Prompts ──
const CHATBOT_SYSTEM_PROMPT = `Eres Guti AI, el asistente virtual de Agutidesigns — estudio de diseño web freelance dirigido por Alejandro (Guti), basado en Barcelona.

SOBRE AGUTIDESIGNS:
- Diseño y desarrollo de páginas web a medida para negocios
- Especialidad: webs que venden, rápidas, bonitas y con IA integrada si el cliente lo necesita
- Más de 200 webs entregadas
- Entrega media en 2 semanas
- Tipos de proyecto habituales: landing pages, webs corporativas, tiendas online, portfolios
- Todo completamente personalizado — sin plantillas ni packs cerrados
- Los precios se calculan a medida según el proyecto

PERSONALIDAD Y TONO:
- Cercano, directo y humano — como hablar con un colega que sabe de diseño web
- Optimista y resolutivo
- Hablas siempre en español
- Evitas tecnicismos innecesarios
- Jamás menciones "packs", "planes" ni precios cerrados — cada proyecto es único

TU OBJETIVO:
1. Entender qué necesita el usuario y ayudarle a clarificarlo
2. Resolver dudas honestas sobre diseño web, plazos, procesos
3. Guiarle para que use la calculadora de precios (disponible en la web) para obtener un presupuesto personalizado
4. Si muestra interés claro, invitarle a hablar con Guti directamente por WhatsApp o email

PROCESO DE TRABAJO:
1. Hablamos sobre el proyecto (gratis, sin compromiso)
2. Presupuesto personalizado en 24h
3. Diseño y desarrollo: habitualmente 1-3 semanas según complejidad
4. Revisiones incluidas hasta que quede perfecto
5. Lanzamiento + soporte post-entrega

TIPOS DE WEB MÁS FRECUENTES (orientativo, sin precios fijos):
- Landing page: web de una sola página enfocada en convertir
- Web corporativa: presencia completa con todas las secciones que necesita tu negocio
- Tienda online: venta de productos o servicios online
- Portfolio: mostrar trabajos y conseguir clientes

REGLAS IMPORTANTES:
- NUNCA menciones "packs", "Pack Starter", "Pack Business", "Pack Premium" ni precios cerrados
- Si preguntan por el precio, explica que cada proyecto es personalizado y dirígeles a la calculadora de la web o a hablar con Guti
- Sé honesto: si algo está fuera de tu conocimiento, dilo
- Respuestas cortas y útiles (máximo 2-3 párrafos)
- Usa emojis con moderación
- Si el usuario quiere avanzar, dile que puede escribir directamente a Guti por WhatsApp o usar la calculadora de precios`;

const QUOTE_SYSTEM_PROMPT = `Eres un experto en presupuestos de diseño web y automatización con IA de Agutidesigns.

Tu tarea es generar un presupuesto detallado basado en los datos del formulario del cliente.

PRECIOS BASE DE REFERENCIA:
- Landing page básica: 300-500€
- Web corporativa (3-5 páginas): 600-1.000€
- Tienda online básica: 1.200-2.000€
- Web compleja / personalizada: 2.000-5.000€
- Chatbot IA básico: 200-400€
- Chatbot IA avanzado: 400-800€
- Automatizaciones email: 150-300€
- CRM integrado: 200-500€
- Dashboard analytics: 300-600€
- Mantenimiento mensual: 50-150€/mes
- SEO básico: 200-400€
- SEO avanzado: 400-800€

FORMATO DEL PRESUPUESTO:
Genera un presupuesto profesional pero cercano, con:
1. Saludo personalizado
2. Resumen de lo que necesita el cliente
3. Desglose de servicios con precios
4. Total estimado (rango)
5. Tiempo estimado de entrega
6. Siguiente paso (agendar llamada)

REGLAS:
- Sé profesional pero cercano (tono Agutidesigns)
- Da un rango de precios (mínimo-máximo)
- Menciona que es un presupuesto orientativo
- Invita a una videollamada para definir detalles
- Responde en español`;

const LEAD_QUALIFICATION_PROMPT = `Analiza la conversación del chatbot y clasifica al lead.

Devuelve un JSON con esta estructura:
{
  "score": número del 1-10 (1=frío, 10=listo para contratar),
  "intent": "informativo" | "comparando" | "listo_para_contratar",
  "budget_range": "bajo" | "medio" | "alto",
  "web_type": "landing" | "corporativa" | "ecommerce" | "portfolio" | "webapp" | "sin_definir",
  "key_needs": ["necesidad1", "necesidad2"],
  "contact_info": { "name": "", "email": "", "business": "" },
  "next_action": "descripción de la siguiente acción recomendada (ej: enviar calculadora, agendar llamada, seguimiento en 3 días)"
}`;

// ── API Call Helper ──
async function callOpenAI(messages, options = {}) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // Modo demo sin API key - respuestas simuladas
    return generateDemoResponse(messages);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        ...options.extra,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return generateDemoResponse(messages);
  }
}

// ── Demo Responses (sin API key) ──
function generateDemoResponse(messages) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('precio') || lastMessage.includes('cuánto') || lastMessage.includes('costar') || lastMessage.includes('presupuesto')) {
    return `Cada proyecto es completamente a medida, así que el precio depende de lo que necesites exactamente. 😊

Lo más fácil es usar nuestra **calculadora de precios** — en 2 minutos te genera un presupuesto orientativo según tu tipo de web, páginas, funcionalidades y plazos.

Si prefieres hablar directamente, puedes escribirle a Guti por WhatsApp y os ponéis de acuerdo en una llamada rápida sin compromiso. ¿Qué tipo de web estás pensando?`;
  }
  
  if (lastMessage.includes('hola') || lastMessage.includes('buenas') || lastMessage.includes('hey') || lastMessage.includes('inicio')) {
    return `¡Hola! 👋 Soy Guti AI, el asistente de Agutidesigns.

Estoy aquí para ayudarte con cualquier duda sobre diseño web: qué tipo de web te conviene, cómo es el proceso, cuánto puede costar, qué incluye... lo que necesites.

¿Cuéntame, qué proyecto tienes en mente?`;
  }

  if (lastMessage.includes('ia') || lastMessage.includes('inteligencia artificial') || lastMessage.includes('chatbot') || lastMessage.includes('automatiz')) {
    return `La IA puede añadirse a cualquier web según lo que necesite tu negocio. 🤖

Por ejemplo: un chatbot que atiende a tus clientes 24/7, formularios inteligentes que cualifican leads, automatizaciones de email, o un asistente que genera presupuestos automáticamente.

No es obligatorio incluirlo — si tu proyecto no lo necesita, no lo ponemos. ¿Tienes alguna funcionalidad específica en mente?`;
  }

  if (lastMessage.includes('proceso') || lastMessage.includes('cómo funciona') || lastMessage.includes('pasos') || lastMessage.includes('tiempo') || lastMessage.includes('plazo')) {
    return `El proceso es bastante sencillo y transparente:

**1.** Hablamos sobre tu proyecto (gratis, sin compromiso) — una llamada o por WhatsApp.
**2.** Te envío un presupuesto detallado en menos de 24h.
**3.** Diseño y desarrollo: normalmente entre 1 y 3 semanas según la complejidad.
**4.** Revisiones hasta que quede exactamente como lo imaginas.
**5.** Lanzamiento y soporte post-entrega.

¿Tienes ya claro qué tipo de web necesitas?`;
  }

  if (lastMessage.includes('landing') || lastMessage.includes('corporativa') || lastMessage.includes('tienda') || lastMessage.includes('portfolio') || lastMessage.includes('ecommerce')) {
    return `¡Buena elección! Todos esos tipos los hacemos a medida. Aquí va un resumen rápido:

- **Landing page** — Una sola página, perfecta para captar clientes o promocionar algo concreto.
- **Web corporativa** — Tu presencia completa online: quiénes sois, servicios, contacto, blog...
- **Tienda online** — Para vender productos o servicios con pasarela de pago.
- **Portfolio** — Ideal para mostrar tu trabajo y captar nuevos clientes.

Usa la **calculadora de precios** de la web para ver un presupuesto orientativo, o cuéntame más sobre tu proyecto y te oriento. 😊`;
  }

  return `Buena pregunta. 😊 Dime un poco más sobre lo que necesitas y te ayudo a orientarte.

Si ya tienes claro el tipo de web, puedes usar la **calculadora de precios** para obtener un presupuesto en segundos. Y si prefieres hablar directamente con Guti, el botón de WhatsApp está ahí abajo a la derecha. 👇`;
}

// ── Chatbot Service ──
export async function sendChatMessage(conversationHistory, userMessage) {
  const messages = [
    { role: 'system', content: CHATBOT_SYSTEM_PROMPT },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await callOpenAI(messages, {
    temperature: 0.8,
    maxTokens: 800,
  });

  return response;
}

// ── Quote Generator ──
export async function generateQuote(formData) {
  const userMessage = `
Genera un presupuesto para este cliente:

DATOS DEL CLIENTE:
- Nombre: ${formData.name}
- Email: ${formData.email}
- Empresa/Negocio: ${formData.business}
- Sector: ${formData.sector}

NECESIDADES DEL PROYECTO:
- Tipo de web: ${formData.webType}
- Número de páginas estimado: ${formData.pages}
- Funcionalidades IA deseadas: ${formData.aiFeatures?.join(', ') || 'No especificadas'}
- Funcionalidades extra: ${formData.extraFeatures?.join(', ') || 'Ninguna'}
- Tiene web actualmente: ${formData.hasCurrentWeb ? 'Sí' : 'No'}
- URL web actual: ${formData.currentWebUrl || 'N/A'}
- Presupuesto aproximado del cliente: ${formData.budgetRange}
- Plazo deseado: ${formData.timeline}
- Descripción adicional: ${formData.description || 'Sin descripción adicional'}
`;

  const messages = [
    { role: 'system', content: QUOTE_SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  const response = await callOpenAI(messages, {
    temperature: 0.6,
    maxTokens: 1500,
    model: 'gpt-4o-mini',
  });

  return response;
}

// ── Lead Qualification ──
export async function qualifyLead(conversationHistory) {
  const messages = [
    { role: 'system', content: LEAD_QUALIFICATION_PROMPT },
    ...conversationHistory,
    { role: 'user', content: 'Analiza esta conversación y clasifica al lead. Responde SOLO con el JSON.' },
  ];

  const response = await callOpenAI(messages, {
    temperature: 0.3,
    maxTokens: 500,
  });

  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 5,
      intent: 'informativo',
      budget_range: 'medio',
      web_type: 'sin_definir',
      key_needs: [],
      contact_info: {},
      next_action: 'Seguir cualificando al lead',
    };
  }
}

// ── Email Automation (simulated - en producción usar backend) ──
export async function sendAutomatedEmail(type, data) {
  // En producción esto iría a un backend que use SendGrid, Resend, etc.
  console.log(`[AI Email] Tipo: ${type}`, data);
  
  const emailTemplates = {
    welcome: {
      subject: `¡Hola ${data.name}! Bienvenido/a a Agutidesigns`,
      body: `Gracias por tu interés. En breve recibirás más información sobre nuestros servicios.`,
    },
    quote: {
      subject: `Tu presupuesto personalizado de Agutidesigns`,
      body: data.quoteContent,
    },
    followup: {
      subject: `${data.name}, ¿pudiste revisar nuestra propuesta?`,
      body: `Queríamos saber si tuviste oportunidad de revisar el presupuesto. Estamos aquí para resolver cualquier duda.`,
    },
    pack_confirmation: {
      subject: `¡Genial ${data.name}! Tu solicitud del ${data.packName || 'pack'} está en marcha`,
      body: `Hemos recibido tu solicitud para el ${data.packName || 'pack'} (${data.packPrice || ''}€). Te contactaremos en menos de 24h para empezar. ¡Esto va a ser genial!`,
    },
    new_lead: {
      subject: `[Nuevo Lead] ${data.name} quiere el ${data.packName || 'un pack'}`,
      body: `Nuevo lead:\n- Nombre: ${data.name}\n- Email: ${data.email}\n- Teléfono: ${data.phone || 'No proporcionado'}\n- Negocio: ${data.business || 'No indicado'}\n- Pack: ${data.packName || 'No definido'}`,
    },
    price_request: {
      subject: `${data.name} quiere saber el precio del ${data.packName || 'pack'}`,
      body: `Solicitud de precio:\n- Nombre: ${data.name}\n- Email: ${data.email}\n- WhatsApp: ${data.phone}\n- Negocio: ${data.business || 'No indicado'}\n- Pack: ${data.packName}\n- WhatsApp IA: ${data.whatsappPlan || 'No'}`,
    },
  };

  return {
    success: true,
    template: emailTemplates[type],
    message: `Email "${type}" preparado para ${data.email}`,
  };
}

export default {
  sendChatMessage,
  generateQuote,
  qualifyLead,
  sendAutomatedEmail,
};

const templates = {
  'clinica-dental': 'En {name}, ponemos tu salud bucal en el centro de todo lo que hacemos. Nuestro equipo de odontólogos especializados trabaja con la tecnología más avanzada para ofrecerte tratamientos eficaces, cómodos y duraderos. Desde una limpieza de rutina hasta una transformación completa de tu sonrisa, estamos aquí para acompañarte en cada paso.',
  'fisioterapia': 'En {name}, nuestro equipo de fisioterapeutas certificados está especializado en devolverte la movilidad y el bienestar que mereces. Combinamos técnicas manuales avanzadas con equipamiento de última generación para ofrecer tratamientos personalizados que atacan la raíz del problema.',
  'psicologia': 'En {name}, creamos un espacio de escucha, confianza y transformación personal. Trabajamos desde un enfoque integrativo, adaptado a tus necesidades únicas, acompañándote en procesos de ansiedad, depresión, relaciones, autoconocimiento y mucho más.',
  'restaurante': 'En {name}, la gastronomía es mucho más que comida: es una experiencia que despierta los sentidos. Elaboramos cada plato con ingredientes frescos de temporada, respetando las recetas tradicionales e incorporando toques de creatividad contemporánea.',
  'abogados': '{name} es un despacho de abogados comprometido con la defensa de sus intereses con rigor, discreción y eficacia. Contamos con un equipo de letrados especializados en las principales ramas del derecho, con una sólida trayectoria de resultados.',
  'otro': '{name} es un negocio comprometido con la calidad y la satisfacción de cada cliente. Nuestro equipo trabaja con dedicación para ofrecer soluciones personalizadas, atención cercana y resultados que superan las expectativas.',
};

export async function generateDescription(businessData) {
  const { businessName, sector, services = [] } = businessData;
  const name = businessName || 'nuestro negocio';

  const apiUrl = import.meta.env.VITE_AI_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: name, sector, services }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.description;
      }
    } catch {
      // fallback
    }
  }

  // Simula latencia de IA para mejor UX
  await new Promise(r => setTimeout(r, 1200));

  const template = templates[sector] || templates.otro;
  let description = template.replace(/\{name\}/g, name);

  const serviceList = services.filter(s => s.name).map(s => s.name).join(', ');
  if (serviceList) {
    description += ` Nuestros servicios incluyen: ${serviceList}.`;
  }

  return description;
}

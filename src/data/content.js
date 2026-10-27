// Carga automática de contenido generado por los agentes.
// Cada landing (nicho + ciudad) vive en src/data/landings/<slug>.json
// y cada artículo nuevo en src/data/blog/<slug>.json.
// Añadir un archivo = nueva página publicada (tras aprobar el PR).
import { blogPosts as legacyPosts } from './blogPosts';

const landingMods = import.meta.glob('./landings/*.json', { eager: true });
const blogMods = import.meta.glob('./blog/*.json', { eager: true });

export const landings = Object.values(landingMods)
  .map((m) => m.default || m)
  .sort((a, b) => a.slug.localeCompare(b.slug));

const newPosts = Object.values(blogMods).map((m) => m.default || m);

export const allPosts = [...newPosts, ...legacyPosts]
  .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
  .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));

export const getLanding = (slug) => landings.find((l) => l.slug === slug);

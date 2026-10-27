// Artículos del blog: los antiguos (blogPosts.js) + los que escribe el agente (blog/*.json)
import { blogPosts as legacyPosts } from './blogPosts';

const blogMods = import.meta.glob('./blog/*.json', { eager: true });
const newPosts = Object.values(blogMods).map((m) => m.default || m);

export const allPosts = [...newPosts, ...legacyPosts]
  .filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
  .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));

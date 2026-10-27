// Landings SEO por nicho + ciudad: cada archivo en src/data/landings/<slug>.json es una página.
const landingMods = import.meta.glob('./landings/*.json', { eager: true });

export const landings = Object.values(landingMods)
  .map((m) => m.default || m)
  .sort((a, b) => a.slug.localeCompare(b.slug));

export const getLanding = (slug) => landings.find((l) => l.slug === slug);

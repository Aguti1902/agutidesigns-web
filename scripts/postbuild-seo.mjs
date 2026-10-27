/**
 * postbuild-seo.mjs
 *
 * Static pre-render trick for Vercel SPA + SEO.
 *
 * Problem: React SPAs serve index.html for every route (via Vercel rewrites).
 * Google can execute JS, but it's unreliable for crawling — meta tags injected
 * via useEffect are often missed, and the initial HTML has no page-specific
 * title/description for the /clinicas-dentales route.
 *
 * Solution: After "vite build", copy dist/index.html into each public route
 * directory with the route-specific <title> and <meta description> already
 * baked into the HTML. Vercel will serve these static files directly (before
 * the SPA rewrite kicks in), so Google gets real HTML with SEO data.
 *
 * The React app still hydrates normally — the static shell is only for
 * initial bot/user HTTP response.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');

// Route configurations: each entry gets its own dist/<path>/index.html
const STATIC_ROUTES = [
  {
    dir: 'clinicas-dentales',
    title: 'Diseño Web para Clínicas Dentales | AgutiDesigns',
    description: 'Agencia de marketing dental especializada en España. Web profesional, SEO local, chatbot IA y publicidad online para dentistas. Desde 149€/mes.',
    canonical: 'https://agutidesigns.io/clinicas-dentales',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'clinicas-dentales/consulta',
    title: 'Consulta Gratuita — Marketing Dental | AgutiDesigns',
    description: 'Solicita tu consulta gratuita con nuestra agencia de marketing dental en Barcelona. Analizamos tu clínica y te proponemos una estrategia para conseguir más pacientes.',
    canonical: 'https://agutidesigns.io/clinicas-dentales/consulta',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'calculadora',
    title: 'Calculadora de Precio Web | AgutiDesigns',
    description: 'Calcula el precio de tu página web con AgutiDesigns. Diseño web profesional en Barcelona desde 149€/mes. Obtén tu presupuesto personalizado en menos de 2 minutos.',
    canonical: 'https://agutidesigns.io/calculadora',
    ogImage: 'https://agutidesigns.io/images/og-agutidesigns.jpg',
  },
  {
    dir: 'blog',
    title: 'Blog de Marketing Dental | AgutiDesigns',
    description: 'Artículos y guías sobre marketing digital para clínicas dentales en España: SEO local, Google Maps, publicidad online y cómo conseguir más pacientes.',
    canonical: 'https://agutidesigns.io/blog',
    ogImage: 'https://agutidesigns.io/images/og-agutidesigns.jpg',
  },
  {
    dir: 'blog/como-conseguir-mas-pacientes-clinica-dental',
    title: 'Cómo Conseguir Más Pacientes en tu Clínica Dental | AgutiDesigns',
    description: 'Estrategias probadas para atraer más pacientes a tu clínica dental: Google Maps, web que convierte, redes sociales y chatbot IA. Guía completa 2026.',
    canonical: 'https://agutidesigns.io/blog/como-conseguir-mas-pacientes-clinica-dental',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'blog/precio-pagina-web-clinica-dental-espana-2026',
    title: 'Precio Página Web Clínica Dental España 2026 | AgutiDesigns',
    description: 'Cuánto cuesta una página web para clínica dental en España en 2026: precios de freelance, agencia y suscripción mensual. Compara opciones y encuentra la mejor.',
    canonical: 'https://agutidesigns.io/blog/precio-pagina-web-clinica-dental-espana-2026',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'blog/marketing-digital-para-dentistas',
    title: 'Marketing Digital para Dentistas en España | AgutiDesigns',
    description: 'Guía completa de marketing digital para dentistas: SEO local, Google Ads, Meta Ads, gestión de reseñas y chatbot IA para clínicas dentales en España.',
    canonical: 'https://agutidesigns.io/blog/marketing-digital-para-dentistas',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'blog/como-aparecer-google-maps-clinica-dental',
    title: 'Cómo Aparecer en Google Maps con tu Clínica Dental | AgutiDesigns',
    description: 'Aprende a optimizar tu ficha de Google Business Profile para aparecer en Google Maps con tu clínica dental y conseguir más pacientes locales en España.',
    canonical: 'https://agutidesigns.io/blog/como-aparecer-google-maps-clinica-dental',
    ogImage: 'https://agutidesigns.io/images/og-clinicas-dentales.jpg',
  },
];


// ─────────────────────────────────────────────────────────────
// Contenido generado por agentes: landings nicho+ciudad y blog
// ─────────────────────────────────────────────────────────────
const SITE = 'https://agutidesigns.io';
const OG_DEFAULT = `${SITE}/images/og-agutidesigns.jpg`;
const dataDir = path.resolve(__dirname, '../src/data');
const readJsonDir = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf-8'))) : []);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const landings = readJsonDir(path.join(dataDir, 'landings'));
const { blogPosts: legacyPosts } = await import(pathToFileURL(path.join(dataDir, 'blogPosts.js')).href);
const newPosts = readJsonDir(path.join(dataDir, 'blog'));
const posts = [...newPosts, ...legacyPosts].filter((p, i, a) => a.findIndex((q) => q.slug === p.slug) === i);

const landingBody = (l) => `<main><nav><a href="/">Inicio</a> / <a href="/diseno-web">Diseño web</a></nav>
<h1>${esc(l.h1)}</h1><p>${esc(l.intro)}</p>
<h2>Lo que está frenando a tu negocio</h2>${l.problemas.map((p) => `<h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>`).join('')}
<h2>Lo que montamos para ti</h2><p>${esc(l.nota)}</p><ol>${l.solucion.map((s) => `<li><strong>${esc(s.t)}</strong>: ${esc(s.d)}</li>`).join('')}</ol>
<h2>Caso real: Clínica Dental Vela-Segalà</h2><p>Más de 20.000 € facturados en solo 3 meses (+80 % de facturación). <a href="/casos">Ver el caso</a></p>
<h2>Preguntas frecuentes</h2>${l.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
<p><a href="/diseno-web">Ver todos los sectores</a></p></main>`;

const landingLd = (l) => {
  const url = `${SITE}/diseno-web/${l.slug}`;
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', name: l.h1, serviceType: 'Diseño web y marketing digital', areaServed: { '@type': 'City', name: l.ciudad }, provider: { '@type': 'Organization', name: 'Agutidesigns', url: SITE }, url, description: l.metaDescription },
    { '@type': 'FAQPage', mainEntity: l.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Diseño web', item: `${SITE}/diseno-web` },
      { '@type': 'ListItem', position: 3, name: l.h1, item: url }] },
  ] };
};

const postLd = (p) => ({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.metaDescription,
  datePublished: p.publishDate, dateModified: p.updatedDate || p.publishDate, author: { '@type': 'Person', name: p.author || 'Alejandro Gutiérrez' },
  publisher: { '@type': 'Organization', name: 'AgutiDesigns', url: SITE }, mainEntityOfPage: `${SITE}/blog/${p.slug}`, keywords: (p.keywords || []).join(', ') });

const ROUTES = [
  ...STATIC_ROUTES.filter((r) => !r.dir.startsWith('blog/')),
  ...posts.map((p) => ({ dir: `blog/${p.slug}`, title: p.metaTitle || p.title, description: p.metaDescription, canonical: `${SITE}/blog/${p.slug}`, ogImage: p.ogImage || OG_DEFAULT,
    body: `<main><article><h1>${esc(p.title)}</h1><p>Por ${esc(p.author)} · ${esc(p.publishDate)}</p>${p.content}</article><p><a href="/blog">Más artículos</a></p></main>`, jsonLd: postLd(p), lastmod: p.updatedDate || p.publishDate })),
  { dir: 'diseno-web', title: 'Diseño web por sector y ciudad | Agutidesigns', description: 'Webs con asistente IA, Google Maps y citas online para clínicas y negocios locales. Elige tu sector y tu ciudad.', canonical: `${SITE}/diseno-web`, ogImage: OG_DEFAULT,
    body: `<main><h1>Diseño web para negocios que viven de sus clientes locales</h1><ul>${landings.map((l) => `<li><a href="/diseno-web/${l.slug}">${esc(l.h1)}</a></li>`).join('')}</ul></main>` },
  ...landings.map((l) => ({ dir: `diseno-web/${l.slug}`, title: l.metaTitle, description: l.metaDescription, canonical: `${SITE}/diseno-web/${l.slug}`, ogImage: OG_DEFAULT, body: landingBody(l), jsonLd: landingLd(l), lastmod: l.updatedDate || l.publishDate })),
  { dir: 'casos', title: 'Casos de éxito y webs reales | Agutidesigns', description: 'Clínica Dental Vela-Segalà: más de 20.000 € facturados en 3 meses (+80 %). Mira el antes y después y las webs que hemos diseñado.', canonical: `${SITE}/casos`, ogImage: OG_DEFAULT,
    body: '<main><h1>Casos y webs reales</h1><h2>Clínica Dental Vela-Segalà: más de 20.000 € facturados en solo 3 meses</h2><p>Web nueva, asistente IA, Google y recordatorios automáticos: +80 % de facturación.</p></main>' },
];

if (!fs.existsSync(indexHtml)) {
  console.error('[postbuild-seo] dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtml, 'utf-8');

for (const route of ROUTES) {
  let html = baseHtml;
  const t = esc(route.title), d = esc(route.description);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${d}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${route.canonical}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${t}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${d}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${route.canonical}"`);
  html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${route.ogImage}"`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${t}"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${d}"`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${route.ogImage}"`);
  if (route.jsonLd) html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(route.jsonLd).replace(/</g, '\\u003c')}</script>\n</head>`);
  // Contenido real en el HTML para buscadores (React lo reemplaza al arrancar)
  if (route.body) html = html.replace('<div id="root"></div>', `<div id="root">${route.body}</div>`);

  const outDir = path.join(distDir, route.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
}
console.log(`[postbuild-seo] ${ROUTES.length} páginas estáticas (${landings.length} landings, ${posts.length} posts).`);

// Sitemap automático
const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: `${SITE}/`, pr: '1.0' }, ...ROUTES.map((r) => ({ loc: r.canonical, lastmod: r.lastmod, pr: r.dir.startsWith('diseno-web/') ? '0.8' : r.dir.startsWith('blog/') ? '0.7' : '0.8' }))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod || today}</lastmod><priority>${u.pr}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`[postbuild-seo] sitemap.xml con ${urls.length} URLs.`);

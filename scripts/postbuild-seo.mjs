/**
 * postbuild-seo.mjs
 *
 * Después de `vite build` genera un HTML estático por cada página pública con:
 *  - <title>, description, canonical, Open Graph y Twitter propios
 *  - JSON-LD (Service, FAQPage, BlogPosting, Breadcrumb…)
 *  - El contenido principal en texto dentro de #root (Google lo lee sin JS;
 *    React lo sustituye al arrancar)
 *  - sitemap.xml automático
 *
 * dist/index.html pasa a ser la home prerenderizada y dist/_app.html la
 * carcasa vacía que Vercel sirve para el resto de rutas (ver vercel.json).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const dataDir = path.resolve(__dirname, '../src/data');
const SITE = 'https://agutidesigns.io';
const imp = (f) => import(pathToFileURL(path.join(dataDir, f)).href);

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const readJsonDir = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf-8'))) : []);

const { PLANS, PARTNER, FAQ_GENERAL, FAQ_CLINICAS, REVIEWS_GENERAL, REVIEWS_CLINICAS, PROCESS } = await imp('site.js');
const { VELA } = await imp('caseStudy.js');
const { SECTOR_GROUPS } = await imp('sectorGroups.js');
const { blogPosts: legacyPosts } = await imp('blogPosts.js');
const landings = readJsonDir(path.join(dataDir, 'landings')).sort((a, b) => a.slug.localeCompare(b.slug));
const posts = [...readJsonDir(path.join(dataDir, 'blog')), ...legacyPosts]
  .filter((p, i, a) => a.findIndex((q) => q.slug === p.slug) === i)
  .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));

/* ── Bloques de contenido estático ── */
const faqHtml = (items) => `<h2>Preguntas frecuentes</h2>${items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
const faqLd = (items) => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const plansHtml = () => `<h2>Precios</h2><ul>${PLANS.map((p) => `<li><strong>Plan ${p.name}: ${p.monthly} €/mes + ${p.setup} € de puesta en marcha.</strong> ${esc(p.pitch)}</li>`).join('')}<li><strong>Plan ${PARTNER.name}: ${PARTNER.monthly} €/mes + ${PARTNER.setup} € de alta.</strong> ${esc(PARTNER.pitch)}</li></ul>`;
const caseHtml = () => `<h2>${esc(VELA.headline)}</h2><p>${esc(VELA.name)} (${esc(VELA.city)}): +80 % de facturación con web nueva, Google, asistente IA y recordatorios automáticos.</p><ul>${VELA.rows.map((r) => `<li>${esc(r.k)}: antes: ${esc(r.a)}. Después: ${esc(r.d)}.</li>`).join('')}</ul>`;
const reviewsHtml = (items) => `<h2>Opiniones de clientes</h2>${items.map((r) => `<blockquote><p>${esc(r.text)}</p><cite>${esc(r.name)}, ${esc(r.role)}</cite></blockquote>`).join('')}`;
const nav = `<nav><a href="/">Inicio</a> · <a href="/diseno-web">Sectores</a> · <a href="/casos">Casos</a> · <a href="/blog">Blog</a></nav>`;
const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${item}` })) });

const homeBody = `${nav}<main><h1>Diseño web en Barcelona que te trae clientes, no solo visitas</h1>
<p>Webs a medida, posicionamiento en Google y un asistente IA que responde y agenda por ti. Para clínicas, despachos, alojamientos, comercios y empresas que quieren más clientes cada mes.</p>
<h2>Todo lo que necesita tu negocio para conseguir clientes por internet</h2>
<ul><li>Diseño web a medida, rápido y pensado para el móvil</li><li>Posicionamiento en Google: SEO local y ficha de Google Business</li><li>Asistente IA en la web y en WhatsApp</li><li>Citas y recordatorios automáticos</li></ul>
<p>Especialistas en <a href="/clinicas-dentales">diseño web para clínicas dentales</a>${landings.map((l) => `, <a href="/diseno-web/${l.slug}">${esc(l.h1.toLowerCase())}</a>`).join('')}.</p>
${caseHtml()}${plansHtml()}<h2>Cómo trabajamos</h2><ol>${PROCESS.map((s) => `<li>${esc(s.t)}: ${esc(s.d)}</li>`).join('')}</ol>
<h2>Hola, soy Guti</h2><p>Soy Alejandro Gutiérrez, diseñador y desarrollador web en Barcelona.</p>
${reviewsHtml(REVIEWS_GENERAL)}${faqHtml(FAQ_GENERAL)}</main>`;

const clinicasBody = `${nav}<main><h1>Diseño web para clínicas dentales que llena tu agenda</h1>
<p>Web, Google Maps y un asistente IA que responde y agenda citas por WhatsApp a cualquier hora. Marketing dental hecho para que tu clínica reciba pacientes nuevos cada semana.</p>
<h2>Marketing dental completo, en un solo equipo</h2><ul><li>Web dental que convierte</li><li>SEO local y Google Maps</li><li>Reseñas en piloto automático</li><li>Asistente IA que agenda 24/7</li></ul>
<p>${landings.filter((l) => l.nicho === 'dental').map((l) => `<a href="/diseno-web/${l.slug}">Clínicas dentales en ${esc(l.ciudad)}</a>`).join(' · ')}</p>
${caseHtml()}${plansHtml()}${reviewsHtml(REVIEWS_CLINICAS)}${faqHtml(FAQ_CLINICAS)}</main>`;

const landingBody = (l) => `${nav}<main><h1>${esc(l.h1)}</h1><p>${esc(l.intro)}</p>
<h2>Lo que frena hoy a tu negocio en ${esc(l.ciudad)}</h2>${l.problemas.map((p) => `<h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>`).join('')}
<h2>Lo que montamos para ti</h2><p>${esc(l.nota)}</p><ul>${l.solucion.map((s) => `<li><strong>${esc(s.t)}</strong>: ${esc(s.d)}</li>`).join('')}</ul>
${caseHtml()}${plansHtml()}${faqHtml(l.faqs)}</main>`;

const OG = { home: '/img/og-home.jpg', clinicas: '/img/og-clinicas.jpg', casos: '/img/og-casos.jpg', sectores: '/img/og-sectores.jpg', blog: '/img/og-blog.jpg' };

const ROUTES = [
  { dir: '', title: 'Diseño web en Barcelona que consigue clientes | Agutidesigns', description: 'Diseño web a medida en Barcelona para negocios de todos los sectores: webs que venden, posicionamiento en Google y asistente IA en WhatsApp. Pide tu propuesta gratis.', og: OG.home, body: homeBody, pr: '1.0',
    jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'ProfessionalService', name: 'Agutidesigns', url: `${SITE}/`, image: `${SITE}${OG.home}`, telephone: '+34625204337', email: 'info@agutidesigns.io', address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' }, areaServed: 'ES', priceRange: '190 €–2.900 €/mes', founder: { '@type': 'Person', name: 'Alejandro Gutiérrez' } }, faqLd(FAQ_GENERAL)] } },
  { dir: 'clinicas-dentales', title: 'Diseño web para clínicas dentales y marketing dental | Agutidesigns', description: 'Diseño web para clínicas dentales con SEO local, Google Maps y asistente IA que agenda citas 24/7. Caso real en Viladecans: +20.000 € en 3 meses. Desde 190 €/mes.', og: OG.clinicas, body: clinicasBody, pr: '0.9',
    jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'Service', name: 'Diseño web y marketing para clínicas dentales', provider: { '@type': 'Organization', name: 'Agutidesigns', url: SITE }, areaServed: 'ES', url: `${SITE}/clinicas-dentales`, offers: PLANS.map((p) => ({ '@type': 'Offer', name: `Plan ${p.name}`, price: p.monthly.replace('.', ''), priceCurrency: 'EUR' })) }, faqLd(FAQ_CLINICAS), crumbs([['Inicio', '/'], ['Clínicas dentales', '/clinicas-dentales']])] } },
  { dir: 'clinicas-dentales/consulta', title: 'Consulta gratuita de marketing dental para tu clínica | Agutidesigns', description: 'Pide una consulta gratuita: analizamos la web y la posición en Google de tu clínica dental y te enseñamos cómo conseguir más pacientes. Respuesta en 24 h.', og: OG.clinicas, pr: '0.6',
    body: `${nav}<main><h1>Consulta gratuita para tu clínica dental</h1><p>Responde tres preguntas y reserva una llamada gratuita para analizar tu web y tu posición en Google.</p></main>` },
  { dir: 'calculadora', title: 'Calculadora de precio de página web | Agutidesigns', description: 'Calcula cuánto cuesta tu página web: landing, web corporativa o tienda online. Presupuesto orientativo al momento, sin compromiso. Diseño web en Barcelona.', og: OG.home, pr: '0.6',
    body: `${nav}<main><h1>¿Cuánto cuesta tu página web?</h1><p>Responde seis preguntas y descubre el precio orientativo de tu landing page, web corporativa o tienda online.</p></main>` },
  { dir: 'casos', title: 'Casos de éxito en diseño web: +20.000 € en 3 meses | Agutidesigns', description: 'Clínica Dental Vela-Segalà facturó más de 20.000 € en 3 meses (+80 %) con su nueva web, Google y asistente IA. Mira el antes y después y las webs que hemos diseñado.', og: OG.casos, pr: '0.8',
    body: `${nav}<main><h1>Casos de éxito y webs reales</h1>${caseHtml()}${reviewsHtml(REVIEWS_GENERAL)}</main>` },
  { dir: 'diseno-web', title: 'Diseño web por sectores: clínicas, despachos, turismo y más | Agutidesigns', description: 'Webs que venden para clínicas, spas, despachos, alojamientos turísticos, hostelería y startups. Mira cómo trabajamos cada sector y las webs reales que hemos diseñado.', og: OG.sectores, pr: '0.8',
    body: `${nav}<main><h1>Diseño web para cada sector</h1><p>Clínicas, despachos, spas, alojamientos, bodegas y startups. Cada negocio vende de una forma distinta, y su web también debería hacerlo.</p>${SECTOR_GROUPS.map((g) => `<h2>${esc(g.title)}</h2><p>${esc(g.lead)}</p><ul>${g.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>${g.proof ? `<blockquote>${esc(g.proof.text)}</blockquote>` : ''}`).join('')}<h2>Diseño web por sector y ciudad</h2><ul>${landings.map((l) => `<li><a href="/diseno-web/${l.slug}">${esc(l.h1)}</a></li>`).join('')}</ul></main>` },
  ...landings.map((l) => ({ dir: `diseno-web/${l.slug}`, title: l.metaTitle, description: l.metaDescription, og: OG.sectores, body: landingBody(l), lastmod: l.updatedDate || l.publishDate, pr: '0.8',
    jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'Service', name: l.h1, serviceType: 'Diseño web y marketing digital', areaServed: { '@type': 'City', name: l.ciudad }, provider: { '@type': 'Organization', name: 'Agutidesigns', url: SITE }, url: `${SITE}/diseno-web/${l.slug}` }, faqLd(l.faqs), crumbs([['Inicio', '/'], ['Diseño web por sector', '/diseno-web'], [l.h1, `/diseno-web/${l.slug}`]])] } })),
  { dir: 'blog', title: 'Blog de marketing digital para clínicas | Agutidesigns', description: 'Guías prácticas de diseño web, SEO local, Google Maps y marketing dental para conseguir más pacientes y clientes. Escritas por Agutidesigns desde Barcelona.', og: OG.blog, pr: '0.7',
    body: `${nav}<main><h1>Blog de marketing digital para clínicas y negocios locales</h1><ul>${posts.map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a>: ${esc(p.excerpt)}</li>`).join('')}</ul></main>` },
  ...posts.map((p) => ({ dir: `blog/${p.slug}`, title: p.metaTitle || p.title, description: p.metaDescription, og: p.ogImage || OG.blog, lastmod: p.updatedDate || p.publishDate, pr: '0.7',
    body: `${nav}<main><article><h1>${esc(p.title)}</h1><p>Por ${esc(p.author)} · ${esc(p.publishDate)}</p>${p.content}</article></main>`,
    jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'BlogPosting', headline: p.title, description: p.metaDescription, datePublished: p.publishDate, dateModified: p.updatedDate || p.publishDate, author: { '@type': 'Person', name: p.author || 'Alejandro Gutiérrez' }, publisher: { '@type': 'Organization', name: 'Agutidesigns', url: SITE }, mainEntityOfPage: `${SITE}/blog/${p.slug}`, keywords: (p.keywords || []).join(', ') }, crumbs([['Inicio', '/'], ['Blog', '/blog'], [p.title, `/blog/${p.slug}`]])] } })),
  { dir: 'empezar', title: 'Crea tu web: elige diseño y personalízalo | Agutidesigns', description: 'Elige una plantilla para tu negocio, personaliza textos, colores y fotos y ve tu nueva web en tiempo real.', og: OG.home, pr: '0.4' },
];

/* ── Generación ── */
const indexHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtml)) { console.error('[postbuild-seo] Falta dist/index.html. Ejecuta vite build antes.'); process.exit(1); }
const shell = fs.readFileSync(indexHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, '_app.html'), shell.replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, follow" />'), 'utf-8');

const setAttr = (html, re, val) => html.replace(re, (m) => m.replace(/(content|href)="[^"]*"/, `$1="${val}"`));
for (const r of ROUTES) {
  const url = `${SITE}/${r.dir}`.replace(/\/$/, r.dir ? '' : '/');
  const img = `${SITE}${r.og}`;
  const t = esc(r.title), d = esc(r.description);
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = setAttr(html, /<meta name="description"[^>]*>/, d);
  html = setAttr(html, /<link rel="canonical"[^>]*>/, url);
  html = setAttr(html, /<meta property="og:title"[^>]*>/, t);
  html = setAttr(html, /<meta property="og:description"[^>]*>/, d);
  html = setAttr(html, /<meta property="og:url"[^>]*>/, url);
  html = setAttr(html, /<meta property="og:image"[^>]*>/, img);
  html = setAttr(html, /<meta name="twitter:title"[^>]*>/, t);
  html = setAttr(html, /<meta name="twitter:description"[^>]*>/, d);
  html = setAttr(html, /<meta name="twitter:image"[^>]*>/, img);
  if (r.jsonLd) html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(r.jsonLd).replace(/</g, '\\u003c')}</script>\n</head>`);
  if (r.body) html = html.replace('<div id="root"></div>', `<div id="root">${r.body}</div>`);
  const outDir = path.join(distDir, r.dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url><loc>${SITE}/${r.dir}</loc><lastmod>${r.lastmod || today}</lastmod><priority>${r.pr}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`[postbuild-seo] ${ROUTES.length} páginas (${landings.length} sectores, ${posts.length} artículos) y sitemap.xml generados.`);

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
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');

// Route configurations: each entry gets its own dist/<path>/index.html
const ROUTES = [
  {
    dir: 'clinicas-dentales',
    title: 'Diseño Web para Clínicas Dentales | AgutiDesigns',
    description: 'Agencia de marketing dental especializada en España. Web profesional, SEO local, chatbot IA y publicidad online para dentistas. Desde 149€/mes.',
    canonical: 'https://agutidesigns.com/clinicas-dentales',
    ogImage: 'https://agutidesigns.com/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'clinicas-dentales/consulta',
    title: 'Consulta Gratuita — Marketing Dental | AgutiDesigns',
    description: 'Solicita tu consulta gratuita con nuestra agencia de marketing dental en Barcelona. Analizamos tu clínica y te proponemos una estrategia para conseguir más pacientes.',
    canonical: 'https://agutidesigns.com/clinicas-dentales/consulta',
    ogImage: 'https://agutidesigns.com/images/og-clinicas-dentales.jpg',
  },
  {
    dir: 'calculadora',
    title: 'Calculadora de Precio Web | AgutiDesigns',
    description: 'Calcula el precio de tu página web con AgutiDesigns. Diseño web profesional en Barcelona desde 149€/mes. Obtén tu presupuesto personalizado en menos de 2 minutos.',
    canonical: 'https://agutidesigns.com/calculadora',
    ogImage: 'https://agutidesigns.com/images/og-agutidesigns.jpg',
  },
];

if (!fs.existsSync(indexHtml)) {
  console.error('[postbuild-seo] dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtml, 'utf-8');

for (const route of ROUTES) {
  let html = baseHtml;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${route.description}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${route.canonical}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${route.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${route.description}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${route.canonical}"`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${route.ogImage}"`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${route.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${route.description}"`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${route.ogImage}"`
  );

  // Write to dist/<route>/index.html
  const outDir = path.join(distDir, route.dir);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`[postbuild-seo] Written: dist/${route.dir}/index.html`);
}

console.log('[postbuild-seo] Done. Static SEO shells created for all routes.');

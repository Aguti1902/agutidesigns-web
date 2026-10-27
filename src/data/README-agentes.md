# Contenido que generan los agentes

Cada archivo nuevo aquí = página nueva en agutidesigns.io (tras aprobar el PR). No hay que tocar código.

## Landings SEO — `landings/<slug>.json` → `/diseno-web/<slug>`
slug = `<nicho>-<ciudad>` (ej. `podologos-barcelona`). Campos:
`slug, nicho, ciudad, publishDate (YYYY-MM-DD), metaTitle (≤60), metaDescription (≤155), h1, intro, nota,
problemas[{t,d}] (4), solucion[{t,d}] (5), faqs[{q,a}] (3-5)`.

## Blog — `blog/<slug>.json` → `/blog/<slug>`
`slug, title, metaTitle, metaDescription, publishDate, author ("Alejandro Gutiérrez"), category, readTime ("6 min"),
excerpt, keywords[], content (HTML: <h2>, <p>, <ul>, <a href="/diseno-web/...">)`.

## Reglas
- Nada inventado: ni cifras, ni reseñas, ni clientes. El único caso con cifras es Vela-Segalà (caseStudy.js).
- Sin precios concretos (los decide Aguti).
- Contenido único por página: no copiar párrafos entre landings.
- Enlazar internamente: blog → landings relevantes y /casos.
- `npm run build` debe pasar; el sitemap y el HTML estático se generan solos.

## Diseño
- Las páginas usan el sistema visual común (`src/styles/site.css` y `src/components/site/`). No hace falta tocar CSS para añadir contenido.
- Si creas una landing de un nicho nuevo (p. ej. `psicologia`), añade su entrada en `src/data/sectors.js` (color, servicios y conversación de ejemplo) para que la cabecera muestre una demo de ese sector. Si no, se usa la demo genérica.
- Precios, reseñas y preguntas frecuentes generales viven en `src/data/site.js`.

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

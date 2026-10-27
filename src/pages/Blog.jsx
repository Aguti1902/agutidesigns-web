import { useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCover from '../components/site/PostCover';
import PostCard from '../components/site/PostCard';
import { LeadSection } from '../components/site/Sections';
import { allPosts } from '../data/posts';
import useSeo from '../hooks/useSeo';
import { formatDate } from '../utils/format';
import './Blog.css';

const BLOG_SEO = {
  title: 'Blog de diseño web, SEO local y marketing para negocios | Agutidesigns',
  description: 'Guías prácticas de diseño web, SEO local, Google Maps e IA para que tu negocio consiga más clientes. Escritas por Agutidesigns desde Barcelona.',
};

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Blog() {
  useSeo({
    ...BLOG_SEO,
    path: '/blog', image: '/img/og-blog.jpg',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog de Agutidesigns', url: 'https://agutidesigns.io/blog',
      blogPost: allPosts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `https://agutidesigns.io/blog/${p.slug}`, datePublished: p.publishDate, author: { '@type': 'Person', name: p.author || 'Alejandro Gutiérrez' } })),
    },
  });

  const cats = useMemo(() => {
    const count = {};
    allPosts.forEach((p) => { if (p.category) count[p.category] = (count[p.category] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, []);
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    return allPosts.filter((p) => (!cat || p.category === cat) && (!nq || norm(`${p.title} ${p.excerpt} ${(p.keywords || []).join(' ')}`).includes(nq)));
  }, [cat, q]);
  const browsing = Boolean(cat || q.trim());
  const [first, ...rest] = filtered;

  return (
    <div className="ag blog">
      <Navbar />
      <main>
        <header className="bl-hero">
          <div className="ag-wrap">
            <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Blog</span></nav>
            <div className="bl-hero__grid">
              <div className="bl-hero__copy">
                <span className="bl-kicker">El blog de Agutidesigns</span>
                <h1 className="ag-h1 bl-hero__title">Ideas claras para que tu negocio <em>consiga más clientes</em> en Internet</h1>
              </div>
              <p className="ag-lead bl-hero__lead">Guías prácticas sobre diseño web, Google Maps, SEO local e inteligencia artificial. Escritas para dueños de negocio, sin tecnicismos ni humo.</p>
            </div>
            <div className="bl-tools" role="search">
              <div className="bl-chips" role="tablist" aria-label="Temas">
                <button type="button" role="tab" aria-selected={!cat} className={`bl-chip ${!cat ? 'is-on' : ''}`} onClick={() => setCat('')}>Todos <span>{allPosts.length}</span></button>
                {cats.map((c) => (
                  <button key={c} type="button" role="tab" aria-selected={cat === c} className={`bl-chip ${cat === c ? 'is-on' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{c}</button>
                ))}
              </div>
              <label className="bl-search">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar un tema…" aria-label="Buscar en el blog" />
              </label>
            </div>
          </div>
        </header>

        <section className="bl-list">
          <div className="ag-wrap">
            {!filtered.length && (
              <div className="bl-empty">
                <p className="ag-h3">No hay artículos sobre «{q || cat}» todavía.</p>
                <p>Cada semana publicamos uno nuevo. Mientras tanto, <button type="button" className="bl-linkbtn" onClick={() => { setQ(''); setCat(''); }}>mira todos los artículos</button>.</p>
              </div>
            )}

            {first && !browsing && (
              <a className="bl-feat" href={`/blog/${first.slug}`}>
                <PostCover post={first} big />
                <div className="bl-feat__copy">
                  <p className="bc__meta"><span className="bc__cat">{first.category}</span><span aria-hidden="true">·</span>Lo último</p>
                  <h2 className="bl-feat__title">{first.title}</h2>
                  <p className="bl-feat__ex">{first.excerpt}</p>
                  <div className="bc__foot">
                    <img src="/img/guti-760.webp" alt="" width="28" height="28" />
                    <span>{first.author || 'Alejandro Gutiérrez'}</span>
                    <time dateTime={first.publishDate}>{formatDate(first.publishDate)} · {first.readTime}</time>
                  </div>
                  <span className="bl-feat__cta">Leer el artículo <span aria-hidden="true">→</span></span>
                </div>
              </a>
            )}

            {(browsing ? filtered : rest).length > 0 && (
              <>
                <div className="bl-sub">
                  <h2 className="bl-sub__title">{browsing ? `${filtered.length} ${filtered.length === 1 ? 'artículo' : 'artículos'}${cat ? ` de ${cat}` : ''}` : 'Más artículos'}</h2>
                </div>
                <div className="bl-grid">
                  {(browsing ? filtered : rest).map((p) => <PostCard key={p.slug} post={p} headingLevel={3} />)}
                </div>
              </>
            )}
          </div>
        </section>

        <LeadSection fuente="web:blog" title="¿Prefieres que lo hagamos por ti?" />
      </main>
      <Footer />
    </div>
  );
}

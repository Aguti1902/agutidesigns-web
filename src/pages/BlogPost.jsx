import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCover from '../components/site/PostCover';
import PostCard from '../components/site/PostCard';
import { LeadSection } from '../components/site/Sections';
import { allPosts } from '../data/posts';
import { CONTACT } from '../data/site';
import { formatDate } from '../utils/format';
import useSeo from '../hooks/useSeo';
import './Blog.css';
import './BlogPost.css';

const slugify = (s) => String(s).replace(/<[^>]+>/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();

/** Añade ids a los <h2>, saca el índice y parte el HTML para meter la llamada a la acción a mitad. */
function prepare(html) {
  const toc = [];
  const used = new Set();
  const withIds = String(html || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    let id = (attrs.match(/id="([^"]+)"/) || [])[1] || slugify(inner) || `seccion-${toc.length + 1}`;
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, text: stripTags(inner) });
    return `<h2${attrs.replace(/\s*id="[^"]*"/, '')} id="${id}">${inner}</h2>`;
  });
  // La llamada a la acción va antes del h2 central (si hay al menos 4 secciones).
  let parts = [withIds];
  if (toc.length >= 4) {
    const target = toc[Math.floor(toc.length / 2)].id;
    const at = withIds.indexOf(`id="${target}"`);
    const cut = withIds.lastIndexOf('<h2', at);
    if (cut > 0) parts = [withIds.slice(0, cut), withIds.slice(cut)];
  }
  return { toc, parts };
}

function Share({ url, title }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* sin portapapeles */ }
  };
  return (
    <div className="bp-share" aria-label="Compartir">
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21h-4V9.75Z" /></svg>
      </a>
      <a href={CONTACT.whatsappText(`${title} ${url}`)} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .78.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.16 1.77 2.7 4.3 3.79 1.6.69 2.22.75 3.02.63.49-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.15-1.17-.06-.1-.23-.17-.48-.29Z" /></svg>
      </a>
      <button type="button" onClick={copy} aria-label="Copiar enlace">
        {copied ? <span className="bp-share__ok">Copiado</span> : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></svg>
        )}
      </button>
    </div>
  );
}

function InlineCta({ slug }) {
  return (
    <aside className="bp-cta">
      <div>
        <p className="bp-cta__k">Agutidesigns</p>
        <p className="bp-cta__t">¿Quieres ver cómo quedaría todo esto en tu negocio?</p>
        <p className="bp-cta__d">Te preparamos gratis una propuesta con tu web nueva y te la enseñamos en una llamada de 20 minutos.</p>
      </div>
      <div className="bp-cta__actions">
        <a className="ag-btn ag-btn--light" href="#propuesta">Pedir mi propuesta</a>
        <a className="ag-btn ag-btn--onnight" href={CONTACT.whatsappText(`Hola, vengo del artículo /blog/${slug} y me gustaría hablar.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </aside>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = allPosts.find((p) => p.slug === slug);
  useSeo(post ? {
    title: post.metaTitle || post.title,
    description: post.metaDescription,
    path: `/blog/${post.slug}`, image: '/img/og-blog.jpg',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'BlogPosting', headline: post.title, description: post.metaDescription, datePublished: post.publishDate, dateModified: post.updatedDate || post.publishDate,
          author: { '@type': 'Person', name: post.author || 'Alejandro Gutiérrez' }, publisher: { '@type': 'Organization', name: 'Agutidesigns', url: 'https://agutidesigns.io', logo: { '@type': 'ImageObject', url: 'https://agutidesigns.io/logoazul.png' } },
          mainEntityOfPage: `https://agutidesigns.io/blog/${post.slug}`, keywords: (post.keywords || []).join(', ') },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://agutidesigns.io/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://agutidesigns.io/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://agutidesigns.io/blog/${post.slug}` }] },
      ],
    },
  } : {});

  const { toc, parts } = useMemo(() => prepare(post?.content), [post]);
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState(0);
  const [tocOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 1021px)').matches);

  useEffect(() => {
    const onScroll = () => {
      const el = document.querySelector('.bp-body');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.max(0, Math.min(1, total > 0 ? -r.top / total : 0)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  useEffect(() => {
    if (!toc.length) return undefined;
    const onScroll = () => {
      let cur = toc[0].id;
      for (const t of toc) { const el = document.getElementById(t.id); if (el && el.getBoundingClientRect().top < 140) cur = t.id; }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  if (!post) return <Navigate to="/blog" replace />;
  const url = `https://agutidesigns.io/blog/${post.slug}`;
  const same = allPosts.filter((p) => p.slug !== slug && p.category === post.category);
  const others = [...same, ...allPosts.filter((p) => p.slug !== slug && p.category !== post.category)].slice(0, 3);

  return (
    <div className="ag blog bp">
      <div className="bp-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <Navbar />
      <main>
        <article>
          <header className="bp-head">
            <div className="ag-wrap bp-head__in">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/blog">Blog</a><span aria-hidden="true">/</span><span>{post.category}</span></nav>
              <p className="bc__meta bp-head__meta"><span className="bp-pill">{post.category}</span>{post.readTime} de lectura</p>
              <h1 className="ag-h1 bp-title">{post.title}</h1>
              {post.excerpt && <p className="ag-lead bp-lead">{post.excerpt}</p>}
              <div className="bp-byline">
                <div className="bp-author">
                  <img src="/img/guti-760.webp" alt="" width="44" height="44" />
                  <div><b>{post.author || 'Alejandro Gutiérrez'}</b><span>Fundador de Agutidesigns · <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time></span></div>
                </div>
                <Share url={url} title={post.title} />
              </div>
            </div>
          </header>

          <div className="ag-wrap bp-cover"><PostCover post={post} big /></div>

          <div className="ag-wrap bp-layout">
            {toc.length > 2 && (
              <aside className="bp-toc">
                <details open={tocOpen}>
                  <summary>En este artículo</summary>
                  <ol>
                    {toc.map((t) => (
                      <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? 'is-on' : ''}>{t.text}</a></li>
                    ))}
                  </ol>
                </details>
              </aside>
            )}
            <div className="bp-main">
              <div className="bp-body" dangerouslySetInnerHTML={{ __html: parts[0] }} />
              {parts[1] && <InlineCta slug={post.slug} />}
              {parts[1] && <div className="bp-body bp-body--cont" dangerouslySetInnerHTML={{ __html: parts[1] }} />}
              {!parts[1] && <InlineCta slug={post.slug} />}

              <footer className="bp-end">
                <div className="bp-bio">
                  <img src="/img/guti-760.webp" alt="Alejandro Gutiérrez" width="72" height="72" loading="lazy" />
                  <div>
                    <p className="bp-bio__k">Escrito por</p>
                    <p className="bp-bio__n">{post.author || 'Alejandro Gutiérrez'}</p>
                    <p className="bp-bio__d">Fundador de Agutidesigns. Diseña webs a medida, SEO local y asistentes con inteligencia artificial para negocios de toda España desde Barcelona.</p>
                    <div className="bp-bio__links">
                      <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                      <a href="/casos">Ver casos</a>
                    </div>
                  </div>
                </div>
                <div className="bp-end__share"><span>¿Te ha servido? Compártelo</span><Share url={url} title={post.title} /></div>
              </footer>
            </div>
          </div>
        </article>

        {others.length > 0 && (
          <section className="bp-more">
            <div className="ag-wrap">
              <div className="bl-sub"><h2 className="bl-sub__title">Sigue leyendo</h2><a className="bp-more__all" href="/blog">Ver todo el blog →</a></div>
              <div className="bl-grid">{others.map((p) => <PostCard key={p.slug} post={p} headingLevel={3} />)}</div>
            </div>
          </section>
        )}
        <LeadSection fuente={`web:blog:${post.slug}`} title="¿Quieres que lo hagamos por ti?" />
      </main>
      <Footer />
    </div>
  );
}

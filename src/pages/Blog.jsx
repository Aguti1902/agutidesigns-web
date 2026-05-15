import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './Blog.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog de Marketing Dental | AgutiDesigns';

    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement(sel.split('[')[0]); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content',
      'Artículos y guías de marketing digital para clínicas dentales en España: SEO local, Google Maps, Google Ads y estrategias para conseguir más pacientes.');
    setMeta('link[rel="canonical"]', 'href', 'https://agutidesigns.io/blog');

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Blog de Marketing Dental | AgutiDesigns',
      description: 'Artículos sobre marketing digital para clínicas dentales en España.',
      url: 'https://agutidesigns.io/blog',
      publisher: { '@type': 'Organization', name: 'AgutiDesigns', url: 'https://agutidesigns.io' },
      hasPart: blogPosts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.metaDescription,
        url: `https://agutidesigns.io/blog/${p.slug}`,
        datePublished: p.publishDate,
        author: { '@type': 'Person', name: p.author },
      })),
    };

    let s = document.querySelector('#blog-schema');
    if (!s) { s = document.createElement('script'); s.id = 'blog-schema'; s.type = 'application/ld+json'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(schema);

    return () => { document.querySelector('#blog-schema')?.remove(); };
  }, []);

  return (
    <div className="blog-page">
      <Navbar dark cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }} />

      <header className="blog-hero">
        <div className="container">
          <span className="blog-hero__badge">Blog</span>
          <h1 className="blog-hero__title">
            Marketing Digital para<br />
            <span>Clínicas Dentales</span>
          </h1>
          <p className="blog-hero__subtitle">
            Guías prácticas y estrategias reales para conseguir más pacientes y hacer crecer tu clínica dental en España.
          </p>
        </div>
      </header>

      <main className="blog-grid-section">
        <div className="container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card__body">
                  <div className="blog-card__meta">
                    <span className="blog-card__category">{post.category}</span>
                    <span className="blog-card__readtime">{post.readTime} de lectura</span>
                  </div>
                  <h2 className="blog-card__title">{post.title}</h2>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <div className="blog-card__footer">
                    <span className="blog-card__date">{formatDate(post.publishDate)}</span>
                    <Link to={`/blog/${post.slug}`} className="blog-card__link">
                      Leer artículo →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

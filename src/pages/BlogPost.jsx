import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './BlogPost.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts.filter((p) => p.slug !== slug);

  useEffect(() => {
    if (!post) {
      document.title = 'Artículo no encontrado | AgutiDesigns';
      return;
    }

    document.title = post.metaTitle;

    const upsert = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement(sel.split('[')[0]); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };

    upsert('meta[name="description"]', 'content', post.metaDescription);
    upsert('link[rel="canonical"]', 'href', `https://agutidesigns.io/blog/${post.slug}`);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      author: { '@type': 'Person', name: post.author },
      publisher: { '@type': 'Organization', name: 'AgutiDesigns', url: 'https://agutidesigns.io' },
      datePublished: post.publishDate,
      dateModified: post.publishDate,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://agutidesigns.io/blog/${post.slug}` },
    };

    let s = document.querySelector('#article-schema');
    if (!s) { s = document.createElement('script'); s.id = 'article-schema'; s.type = 'application/ld+json'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(schema);

    return () => { document.querySelector('#article-schema')?.remove(); };
  }, [post]);

  if (!post) {
    return (
      <div className="blogpost-page">
        <Navbar dark cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }} />
        <div className="blogpost-404">
          <h1 className="blogpost-404__title">404</h1>
          <p className="blogpost-404__text">
            El artículo que buscas no existe o ha sido eliminado. Vuelve al blog para ver todos nuestros artículos sobre marketing digital para clínicas dentales.
          </p>
          <Link to="/blog" className="blogpost-404__link">Volver al blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blogpost-page">
      <Navbar dark cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }} />

      <header className="blogpost-hero">
        <div className="blogpost-hero__inner">
          <nav className="blogpost-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <span className="blogpost-breadcrumb__sep">/</span>
            <Link to="/blog">Blog</Link>
            <span className="blogpost-breadcrumb__sep">/</span>
            <span className="blogpost-breadcrumb__current">{post.title}</span>
          </nav>

          <span className="blogpost-hero__badge">{post.category}</span>
          <h1 className="blogpost-hero__title">{post.title}</h1>

          <div className="blogpost-hero__meta">
            <span>Por {post.author}</span>
            <span>{formatDate(post.publishDate)}</span>
            <span>{post.readTime} de lectura</span>
          </div>
        </div>
      </header>

      <main className="blogpost-main">
        <div
          className="blog-article"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <section className="blogpost-related">
          <h2 className="blogpost-related__title">Otros artículos que te pueden interesar</h2>
          <div className="blogpost-related__list">
            {otherPosts.map((other) => (
              <Link key={other.slug} to={`/blog/${other.slug}`} className="blogpost-related__card">
                <span className="blogpost-related__category">{other.category} · {other.readTime}</span>
                <p className="blogpost-related__post-title">{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

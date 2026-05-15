import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const articleStyles = `
  .blog-article {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #1e293b;
    line-height: 1.75;
    font-size: 1.05rem;
  }
  .blog-article h2 {
    font-size: 1.7rem;
    font-weight: 700;
    color: #0f172a;
    margin: 2.4rem 0 1rem;
    line-height: 1.25;
  }
  .blog-article h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin: 2rem 0 0.8rem;
    line-height: 1.3;
  }
  .blog-article p {
    margin: 0 0 1.2rem;
    color: #334155;
  }
  .blog-article ul,
  .blog-article ol {
    margin: 0 0 1.4rem 1.4rem;
    padding: 0;
  }
  .blog-article li {
    margin-bottom: 0.5rem;
    color: #334155;
  }
  .blog-article a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .blog-article a:hover {
    color: #1d4ed8;
  }
  .blog-article strong {
    color: #0f172a;
    font-weight: 600;
  }
  .blog-cta {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    border-radius: 16px;
    padding: 40px 36px;
    margin: 3rem 0 2rem;
    text-align: center;
  }
  .blog-cta h3 {
    color: #ffffff !important;
    font-size: 1.5rem !important;
    margin: 0 0 12px !important;
  }
  .blog-cta p {
    color: #94a3b8 !important;
    margin: 0 0 24px !important;
    font-size: 1rem;
  }
  .blog-cta__btn {
    display: inline-block;
    background-color: #2563eb;
    color: #ffffff !important;
    text-decoration: none !important;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 14px 28px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  .blog-cta__btn:hover {
    background-color: #1d4ed8;
    color: #ffffff !important;
  }
`;

const styles = {
  page: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  hero: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '100px 24px 60px',
  },
  heroInner: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '13px',
    color: '#94a3b8',
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    color: '#94a3b8',
    textDecoration: 'none',
  },
  breadcrumbSep: {
    color: '#475569',
  },
  breadcrumbCurrent: {
    color: '#cbd5e1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
  },
  categoryBadge: {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    padding: '5px 12px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  title: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '800',
    margin: '0 0 20px',
    lineHeight: '1.2',
    color: '#ffffff',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    color: '#94a3b8',
    fontSize: '13px',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '56px 24px 80px',
  },
  otherArticlesSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '48px',
    marginTop: '48px',
  },
  otherArticlesTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '24px',
  },
  otherArticlesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  otherArticleCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'border-color 0.15s, background-color 0.15s',
    backgroundColor: '#ffffff',
  },
  otherArticleCategory: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '6px',
  },
  otherArticleTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: '1.4',
    margin: '0',
  },
  notFoundContainer: {
    maxWidth: '600px',
    margin: '120px auto 60px',
    padding: '0 24px',
    textAlign: 'center',
  },
  notFoundTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
  },
  notFoundText: {
    color: '#475569',
    marginBottom: '28px',
    lineHeight: '1.7',
  },
  notFoundLink: {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    padding: '12px 24px',
    borderRadius: '8px',
  },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
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

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = post.metaDescription;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://agutidesigns.io/blog/${post.slug}`;

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'AgutiDesigns',
        url: 'https://agutidesigns.io',
      },
      datePublished: post.publishDate,
      dateModified: post.publishDate,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://agutidesigns.io/blog/${post.slug}`,
      },
    };

    let schemaScript = document.querySelector('#article-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'article-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);

    return () => {
      const s = document.querySelector('#article-schema');
      if (s) s.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div style={styles.page}>
        <Navbar
          dark={true}
          cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }}
        />
        <div style={styles.notFoundContainer}>
          <h1 style={styles.notFoundTitle}>Artículo no encontrado</h1>
          <p style={styles.notFoundText}>
            El artículo que buscas no existe o ha sido eliminado. Vuelve al blog para ver todos nuestros artículos sobre marketing digital para clínicas dentales.
          </p>
          <Link to="/blog" style={styles.notFoundLink}>
            Volver al blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{articleStyles}</style>

      <Navbar
        dark={true}
        cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }}
      />

      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <nav style={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link to="/" style={styles.breadcrumbLink}>Inicio</Link>
            <span style={styles.breadcrumbSep}>/</span>
            <Link to="/blog" style={styles.breadcrumbLink}>Blog</Link>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{post.title}</span>
          </nav>

          <span style={styles.categoryBadge}>{post.category}</span>
          <h1 style={styles.title}>{post.title}</h1>

          <div style={styles.metaRow}>
            <span>Por {post.author}</span>
            <span>&middot;</span>
            <span>{formatDate(post.publishDate)}</span>
            <span>&middot;</span>
            <span>{post.readTime} de lectura</span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div
          className="blog-article"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <section style={styles.otherArticlesSection}>
          <h2 style={styles.otherArticlesTitle}>Otros artículos que te pueden interesar</h2>
          <div style={styles.otherArticlesList}>
            {otherPosts.map((other) => (
              <Link
                key={other.slug}
                to={`/blog/${other.slug}`}
                style={styles.otherArticleCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.backgroundColor = '#f8faff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <span style={styles.otherArticleCategory}>{other.category} &middot; {other.readTime}</span>
                <p style={styles.otherArticleTitle}>{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

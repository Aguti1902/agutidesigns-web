import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const styles = {
  page: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  hero: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '100px 24px 64px',
    textAlign: 'center',
  },
  heroLabel: {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '800',
    margin: '0 0 16px',
    lineHeight: '1.15',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    maxWidth: '560px',
    margin: '0 auto',
    lineHeight: '1.7',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '64px 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '32px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  cardBody: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  cardCategory: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  cardReadTime: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.35',
    margin: '0 0 12px',
  },
  cardExcerpt: {
    color: '#475569',
    fontSize: '0.92rem',
    lineHeight: '1.65',
    margin: '0 0 20px',
    flex: '1',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  cardDate: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  cardLink: {
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog de Marketing Dental | AgutiDesigns';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Artículos y guías de marketing digital para clínicas dentales en España: SEO local, Google Maps, Google Ads y estrategias para conseguir más pacientes.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://agutidesigns.io/blog';

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Blog de Marketing Dental | AgutiDesigns',
      description: 'Artículos sobre marketing digital para clínicas dentales en España.',
      url: 'https://agutidesigns.io/blog',
      publisher: {
        '@type': 'Organization',
        name: 'AgutiDesigns',
        url: 'https://agutidesigns.io',
      },
      hasPart: blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.metaDescription,
        url: `https://agutidesigns.io/blog/${post.slug}`,
        datePublished: post.publishDate,
        author: {
          '@type': 'Person',
          name: post.author,
        },
      })),
    };

    let schemaScript = document.querySelector('#blog-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'blog-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);

    return () => {
      const s = document.querySelector('#blog-schema');
      if (s) s.remove();
    };
  }, []);

  return (
    <div style={styles.page}>
      <Navbar
        dark={true}
        cta={{ label: 'Servicios para clínicas', href: '/clinicas-dentales' }}
      />

      <header style={styles.hero}>
        <span style={styles.heroLabel}>Blog</span>
        <h1 style={styles.heroTitle}>Marketing Digital para Clínicas Dentales</h1>
        <p style={styles.heroSubtitle}>
          Guías prácticas y estrategias reales para conseguir más pacientes y crecer tu clínica dental en España.
        </p>
      </header>

      <main style={styles.container}>
        <div style={styles.grid}>
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardBody}>
                <div style={styles.cardMeta}>
                  <span style={styles.cardCategory}>{post.category}</span>
                  <span style={styles.cardReadTime}>{post.readTime} de lectura</span>
                </div>
                <h2 style={styles.cardTitle}>{post.title}</h2>
                <p style={styles.cardExcerpt}>{post.excerpt}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardDate}>{formatDate(post.publishDate)}</span>
                  <Link to={`/blog/${post.slug}`} style={styles.cardLink}>
                    Leer artículo &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

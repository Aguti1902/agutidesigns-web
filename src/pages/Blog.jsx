import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCover from '../components/site/PostCover';
import { LeadSection } from '../components/site/Sections';
import { allPosts } from '../data/posts';
import useSeo from '../hooks/useSeo';
import { formatDate } from '../utils/format';
import './Blog.css';

const BLOG_SEO = {
  title: 'Blog de marketing digital para clínicas | Agutidesigns',
  description: 'Guías prácticas de diseño web, SEO local, Google Maps y marketing dental para conseguir más pacientes y clientes. Escritas por Agutidesigns desde Barcelona.',
};


export default function Blog() {
  useSeo({
    ...BLOG_SEO,
    path: '/blog', image: '/img/og-blog.jpg',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog de Agutidesigns', url: 'https://agutidesigns.io/blog',
      blogPost: allPosts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `https://agutidesigns.io/blog/${p.slug}`, datePublished: p.publishDate, author: { '@type': 'Person', name: p.author } })),
    },
  });
  const [first, ...rest] = allPosts;
  return (
    <div className="ag">
      <Navbar />
      <main>
        <header className="ag-hero ag-hero--short">
          <div className="ag-wrap blog-head">
            <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><span>Blog</span></nav>
            <h1 className="ag-h1">Blog de marketing digital para clínicas y negocios locales</h1>
            <p className="ag-lead">Guías prácticas sobre diseño web, Google Maps, SEO local e IA para conseguir más pacientes y clientes. Sin humo.</p>
          </div>
        </header>
        <section className="ag-section ag-section--white" style={{ paddingTop: 'clamp(40px,6vw,72px)' }}>
          <div className="ag-wrap">
            {first && (
              <a className="blog-feat" href={`/blog/${first.slug}`}>
                <PostCover post={first} big />
                <div className="blog-feat__copy">
                  <p className="blog-meta">{formatDate(first.publishDate)} · {first.readTime} de lectura</p>
                  <h2 className="ag-h2">{first.title}</h2>
                  <p className="ag-lead">{first.excerpt}</p>
                  <span className="ag-link">Leer el artículo</span>
                </div>
              </a>
            )}
            <div className="blog-grid">
              {rest.map((p) => (
                <a key={p.slug} className="blog-card" href={`/blog/${p.slug}`}>
                  <PostCover post={p} />
                  <p className="blog-meta">{formatDate(p.publishDate)} · {p.readTime}</p>
                  <h2 className="ag-h3">{p.title}</h2>
                  <p className="blog-card__ex">{p.excerpt}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
        <LeadSection fuente="web:blog" title="¿Prefieres que lo hagamos por ti?" />
      </main>
      <Footer />
    </div>
  );
}

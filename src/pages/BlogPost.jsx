import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PostCover from '../components/site/PostCover';
import { LeadSection } from '../components/site/Sections';
import { allPosts } from '../data/posts';
import { formatDate } from '../utils/format';
import useSeo from '../hooks/useSeo';
import './Blog.css';
import './BlogPost.css';

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
  if (!post) return <Navigate to="/blog" replace />;
  const others = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="ag">
      <Navbar />
      <main>
        <article>
          <header className="ag-hero ag-hero--short bp-head">
            <div className="ag-wrap ag-wrap--narrow">
              <nav className="ag-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/blog">Blog</a></nav>
              <h1 className="ag-h1 bp-title">{post.title}</h1>
              <p className="ag-lead">{post.excerpt}</p>
              <div className="bp-author">
                <img src="/img/guti-760.webp" alt="" width="44" height="44" />
                <div><b>{post.author || 'Alejandro Gutiérrez'}</b><span>{formatDate(post.publishDate)} · {post.readTime} de lectura</span></div>
              </div>
            </div>
          </header>
          <div className="ag-wrap ag-wrap--narrow"><PostCover post={post} big /></div>
          <div className="ag-wrap ag-wrap--narrow">
            <div className="bp-body" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
        {others.length > 0 && (
          <section className="ag-section ag-section--white">
            <div className="ag-wrap">
              <h2 className="ag-h2" style={{ marginBottom: 36 }}>Sigue leyendo</h2>
              <div className="blog-grid">
                {others.map((p) => (
                  <a key={p.slug} className="blog-card" href={`/blog/${p.slug}`}>
                    <PostCover post={p} />
                    <p className="blog-meta">{formatDate(p.publishDate)} · {p.readTime}</p>
                    <h3 className="ag-h3">{p.title}</h3>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
        <LeadSection fuente={`web:blog:${post.slug}`} title="¿Quieres que lo hagamos por ti?" />
      </main>
      <Footer />
    </div>
  );
}

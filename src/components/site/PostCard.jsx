import PostCover from './PostCover';
import { formatDate } from '../../utils/format';

/** Tarjeta de artículo del blog (listado y «Sigue leyendo»). */
export default function PostCard({ post, headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <a className="bc" href={`/blog/${post.slug}`}>
      <PostCover post={post} />
      <div className="bc__body">
        <p className="bc__meta"><span className="bc__cat">{post.category}</span><span aria-hidden="true">·</span>{post.readTime} de lectura</p>
        <H className="bc__title">{post.title}</H>
        {post.excerpt && <p className="bc__ex">{post.excerpt}</p>}
        <div className="bc__foot">
          <img src="/img/guti-760.webp" alt="" width="28" height="28" loading="lazy" />
          <span>{post.author || 'Alejandro Gutiérrez'}</span>
          <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
        </div>
      </div>
    </a>
  );
}

/** Foto optimizada de /public/img/photo (800 y 1400 px, webp). */
export default function Photo({ name, alt, className = '', sizes = '(max-width: 900px) 92vw, 600px', priority = false }) {
  return (
    <img
      className={className}
      src={`/img/photo/${name}-1400.webp`}
      srcSet={`/img/photo/${name}-800.webp 800w, /img/photo/${name}-1400.webp 1400w`}
      sizes={sizes}
      alt={alt}
      width="1400"
      height="930"
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}

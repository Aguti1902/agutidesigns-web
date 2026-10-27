import Photo from './Photo';

// Foto de portada según el tema del artículo (o `post.cover` si el agente la indica).
const pick = (p) => {
  if (p.cover) return p.cover;
  const t = `${p.slug} ${p.title}`.toLowerCase();
  if (t.includes('maps') || t.includes('google')) return 'maps';
  if (t.includes('precio') || t.includes('cuesta') || t.includes('coste')) return 'escritorio';
  if (t.includes('pacientes')) return 'dental-recepcion';
  if (t.includes('podolog')) return 'podologia';
  if (t.includes('fisio')) return 'fisio';
  if (t.includes('estétic') || t.includes('estetic')) return 'estetica';
  if (t.includes('nutric')) return 'nutricion';
  if (t.includes('dent')) return 'dental';
  return 'negocio';
};

export default function PostCover({ post, big = false }) {
  return (
    <div className={`pc ${big ? 'pc--big' : ''}`}>
      <Photo name={pick(post)} alt="" sizes={big ? '(max-width: 900px) 92vw, 720px' : '(max-width: 600px) 92vw, 380px'} priority={big} />
      <span className="pc__cat">{post.category}</span>
    </div>
  );
}

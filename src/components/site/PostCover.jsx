import { MapPin, Search, Euro, TrendingUp, Bot, FileText } from 'lucide-react';

const pick = (p) => {
  const t = `${p.slug} ${p.title}`.toLowerCase();
  if (t.includes('maps') || t.includes('google')) return { Icon: MapPin, hue: '#0f8b7a' };
  if (t.includes('precio') || t.includes('cuesta') || t.includes('coste')) return { Icon: Euro, hue: '#b06a00' };
  if (t.includes('seo')) return { Icon: Search, hue: '#0b78a8' };
  if (/(^|[^a-záéíóú])(ia|chatbot|whatsapp)([^a-záéíóú]|$)/.test(t)) return { Icon: Bot, hue: '#6b4de6' };
  if (t.includes('pacientes') || t.includes('clientes') || t.includes('marketing')) return { Icon: TrendingUp, hue: '#0047ff' };
  return { Icon: FileText, hue: '#0047ff' };
};

/** Portada diseñada para cada artículo (sin depender de fotos de stock). */
export default function PostCover({ post, big = false }) {
  const { Icon, hue } = pick(post);
  return (
    <div className={`pc ${big ? 'pc--big' : ''}`} style={{ '--hue': hue }} aria-hidden="true">
      <span className="pc__cat">{post.category}</span>
      <Icon className="pc__icon" size={big ? 120 : 72} strokeWidth={1.2} />
    </div>
  );
}

import { Mail, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { CONTACT } from '../../data/site';
import './Footer.css';

const COLS = [
  { t: 'Servicios', links: [['Diseño web a medida', '/#servicios'], ['Diseño web para clínicas dentales', '/clinicas-dentales'], ['Webs por sector y ciudad', '/diseno-web'], ['Precios', '/#precios'], ['Calculadora de precio', '/calculadora']] },
  { t: 'Agutidesigns', links: [['Casos de éxito', '/casos'], ['Blog', '/blog'], ['Consulta gratuita', '/clinicas-dentales/consulta'], ['Sobre Guti', '/#sobre-mi']] },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <div className="foot__brand">
          <img src="/images/logoazul.png" alt="Agutidesigns" width="132" height="36" />
          <p>Diseño web, posicionamiento en Google y asistentes IA para clínicas y negocios locales. Desde Barcelona para toda España.</p>
          <div className="foot__social">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            <a href={`mailto:${CONTACT.email}`} aria-label="Email"><Mail size={18} /></a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>
        {COLS.map((c) => (
          <nav key={c.t} className="foot__col" aria-label={c.t}>
            <h2>{c.t}</h2>
            <ul>{c.links.map(([l, h]) => <li key={h}><a href={h}>{l}</a></li>)}</ul>
          </nav>
        ))}
        <div className="foot__col">
          <h2>Contacto</h2>
          <ul>
            <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">{CONTACT.phone}</a></li>
            <li><a href={CONTACT.calendly} target="_blank" rel="noopener noreferrer">Reservar una llamada</a></li>
            <li className="foot__muted">Barcelona, España</li>
          </ul>
        </div>
      </div>
      <div className="foot__bottom">
        <span>© {new Date().getFullYear()} Agutidesigns</span>
        <span>Diseño web en Barcelona</span>
      </div>
    </footer>
  );
}

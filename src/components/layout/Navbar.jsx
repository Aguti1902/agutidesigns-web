import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const LINKS = [
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Clínicas dentales', href: '/clinicas-dentales' },
  { label: 'Sectores', href: '/diseno-web' },
  { label: 'Casos', href: '/casos' },
  { label: 'Precios', href: '/#precios' },
  { label: 'Blog', href: '/blog' },
];

/** Navegación común de la web pública. `cta` opcional: { label, href }. */
export default function Navbar({ cta }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const go = (e, href) => {
    setOpen(false);
    const [p, hash] = href.split('#');
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el && (p === '' || p === path)) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${hash}`);
    } else if (p === '') {
      e.preventDefault();
      window.location.assign(`/#${hash}`);
    }
  };

  const action = cta || { label: 'Pide tu propuesta', href: '#propuesta' };
  const actionHref = action.href;

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a href="/" className="nav__logo" aria-label="Agutidesigns, ir al inicio">
          <img src="/images/logoazul.png" alt="Agutidesigns" width="120" height="33" />
        </a>
        <nav className="nav__links" aria-label="Principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} aria-current={path === l.href ? 'page' : undefined}>{l.label}</a>
          ))}
        </nav>
        <a href={actionHref} onClick={(e) => go(e, actionHref)} className="ag-btn ag-btn--primary ag-btn--sm nav__cta">{action.label}</a>
        <button className="nav__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="nav-mobile" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <div id="nav-mobile" className={`nav__mobile ${open ? 'is-open' : ''}`} hidden={!open}>
        {LINKS.map((l) => <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>{l.label}</a>)}
        <a href={actionHref} onClick={(e) => go(e, actionHref)} className="ag-btn ag-btn--primary">{action.label}</a>
      </div>
    </header>
  );
}

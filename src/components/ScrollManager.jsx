import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Al cambiar de página: arriba del todo, o al ancla (#seccion) si la hay. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 20) { clearInterval(t); el?.scrollIntoView({ block: 'start' }); }
    }, 50);
    return () => clearInterval(t);
  }, [pathname, hash]);
  return null;
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';
import './CookieBanner.css';

const STORAGE_KEY = 'aguti_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div className="cookie-banner__icon">
            <Cookie size={22} />
          </div>
          <div className="cookie-banner__text">
            <strong>Usamos cookies</strong> para mejorar tu experiencia y analizar el tráfico.
            Puedes aceptarlas o rechazarlas.{' '}
            <a href="/privacidad" className="cookie-banner__link">Política de privacidad</a>
          </div>
          <div className="cookie-banner__actions">
            <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={decline}>
              <X size={14} /> Rechazar
            </button>
            <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={accept}>
              <Check size={14} /> Aceptar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Píxel de Meta (anuncios de Instagram y Facebook). Solo se carga si hay ID de píxel
// (VITE_META_PIXEL_ID) y la persona ha aceptado las cookies.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ID = import.meta.env.VITE_META_PIXEL_ID;
const CLAVE_CONSENTIMIENTO = 'aguti_cookie_consent';
let cargado = false;
const cola = [];

const aceptado = () => { try { return localStorage.getItem(CLAVE_CONSENTIMIENTO) === 'accepted'; } catch { return false; } };

function cargar() {
  if (cargado || !ID || typeof window === 'undefined' || !aceptado()) return cargado;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', ID);
  cargado = true;
  while (cola.length) window.fbq(...cola.shift());
  return true;
}

// Evento estándar de Meta: PageView, ViewContent, InitiateCheckout, CompleteRegistration, StartTrial…
export function eventoPixel(nombre, datos) {
  if (!ID) return;
  const args = ['track', nombre, ...(datos ? [datos] : [])];
  if (cargar()) window.fbq(...args); else if (cola.length < 20) cola.push(args);
}

// Página vista en cada cambio de ruta (y al aceptar las cookies).
export function PixelMeta() {
  const { pathname } = useLocation();
  useEffect(() => { eventoPixel('PageView'); if (pathname.startsWith('/oficina-ia')) eventoPixel('ViewContent', { content_name: 'Oficina de IA' }); }, [pathname]);
  useEffect(() => { const f = () => cargar(); window.addEventListener('aguti-cookies-aceptadas', f); return () => window.removeEventListener('aguti-cookies-aceptadas', f); }, []);
  return null;
}

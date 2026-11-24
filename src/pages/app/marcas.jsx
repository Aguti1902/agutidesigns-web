// Logos de las herramientas que se conectan (iconos de marca de simple-icons, CC0).
// Outlook no está en simple-icons: se dibuja su marca genérica (sobre azul con «O»).
import { siWhatsapp, siGmail, siInstagram, siFacebook, siTiktok, siGooglecalendar, siGoogle, siGoogleanalytics, siGooglesearchconsole, siGoogledrive, siWordpress } from 'simple-icons';

const ICONOS = {
  whatsapp: siWhatsapp, gmail: siGmail, instagram: siInstagram, facebook: siFacebook, tiktok: siTiktok, google_calendar: siGooglecalendar,
  google_business: siGoogle, google_analytics: siGoogleanalytics, search_console: siGooglesearchconsole, google_drive: siGoogledrive, wordpress: siWordpress,
};

export function LogoHerramienta({ id, size = 40, plano }) {
  const ic = ICONOS[id]; const r = Math.round(size * 0.26);
  if (id === 'outlook') {
    return (
      <span className="logo-h" style={{ width: size, height: size, borderRadius: r, background: plano ? 'transparent' : '#0a64d6' }} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56}><rect x="2" y="5" width="13" height="14" rx="2" fill={plano ? '#0a64d6' : '#fff'} /><ellipse cx="8.5" cy="12" rx="3" ry="3.6" fill="none" stroke={plano ? '#fff' : '#0a64d6'} strokeWidth="2" /><path d="M16 8h6v8h-6" fill="none" stroke={plano ? '#0a64d6' : '#fff'} strokeWidth="1.8" /></svg>
      </span>
    );
  }
  if (id === 'web_chat') {
    return <span className="logo-h" style={{ width: size, height: size, borderRadius: r, background: '#0047ff' }} aria-hidden="true"><svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg></span>;
  }
  if (!ic) return <span className="logo-h" style={{ width: size, height: size, borderRadius: r, background: '#16181d', color: '#fff', fontWeight: 800 }}>{String(id).slice(0, 1).toUpperCase()}</span>;
  const color = `#${ic.hex}`;
  return (
    <span className="logo-h" style={{ width: size, height: size, borderRadius: r, background: plano ? 'transparent' : `${color}14`, border: plano ? 0 : `1px solid ${color}26` }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size * (plano ? 1 : 0.54)} height={size * (plano ? 1 : 0.54)} fill={color}><path d={ic.path} /></svg>
    </span>
  );
}

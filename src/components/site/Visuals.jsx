import { CheckCheck, TrendingUp, CalendarCheck, Star } from 'lucide-react';
import { sectorOf } from '../../data/sectors';
import './Visuals.css';

/** Portátil con captura real de una web. */
export function Laptop({ src, srcSet, alt, url, className = '' }) {
  return (
    <figure className={`vx-laptop ${className}`}>
      <div className="vx-laptop__screen">
        <div className="vx-bar"><i /><i /><i /><span>{url}</span></div>
        <img src={src} srcSet={srcSet} sizes="(max-width: 900px) 92vw, 560px" alt={alt} width="1600" height="900" />
      </div>
      <div className="vx-laptop__base" aria-hidden="true" />
    </figure>
  );
}

/** Móvil con conversación de WhatsApp atendida por el asistente IA. */
export function ChatPhone({ business = 'Tu clínica', ask, reply, confirm = 'Perfecto, te he enviado la confirmación y un recordatorio el día antes.', className = '' }) {
  return (
    <figure className={`vx-phone ${className}`} aria-label={`Ejemplo de conversación de WhatsApp con el asistente de ${business}`}>
      <div className="vx-phone__head">
        <span className="vx-phone__avatar" aria-hidden="true">{business.slice(0, 1)}</span>
        <div><b>{business}</b><small>Asistente · en línea</small></div>
      </div>
      <div className="vx-phone__body">
        <p className="vx-msg vx-msg--in">{ask}<time>22:47</time></p>
        <p className="vx-msg vx-msg--out">{reply}<time>22:47 <CheckCheck size={12} /></time></p>
        <p className="vx-msg vx-msg--in">El jueves perfecto 🙌<time>22:48</time></p>
        <p className="vx-msg vx-msg--out">{confirm}<time>22:48 <CheckCheck size={12} /></time></p>
      </div>
    </figure>
  );
}

/** Hero de la home: Guti + web real de Vela-Segalà + resultado. */
export function HeroGuti() {
  return (
    <div className="vx-stage vx-stage--guti">
      <div className="vx-glow" aria-hidden="true" />
      <img className="vx-guti" src="/img/guti-760.webp" alt="Alejandro Gutiérrez (Guti), diseñador web en Barcelona" width="760" height="986" fetchpriority="high" />
      <Laptop className="vx-stage__laptop" src="/img/vela-800.webp" srcSet="/img/vela-800.webp 800w, /img/vela-1600.webp 1600w" url="velasegalaviladecans.com" alt="Web de la Clínica Dental Vela-Segalà diseñada por Agutidesigns" />
      <div className="vx-chip vx-chip--result">
        <TrendingUp size={18} />
        <div><b>+20.000 €</b><span>en 3 meses · Vela-Segalà</span></div>
      </div>
      <div className="vx-chip vx-chip--cita">
        <CalendarCheck size={18} />
        <div><b>Nueva cita</b><span>reservada por el asistente</span></div>
      </div>
    </div>
  );
}

/** Hero de clínicas: web real + WhatsApp con IA. */
export function HeroClinic() {
  return (
    <div className="vx-stage vx-stage--clinic">
      <div className="vx-glow" aria-hidden="true" />
      <Laptop className="vx-stage__laptop vx-stage__laptop--big" src="/img/vela-800.webp" srcSet="/img/vela-800.webp 800w, /img/vela-1600.webp 1600w" url="velasegalaviladecans.com" alt="Web de la Clínica Dental Vela-Segalà, caso real de Agutidesigns" />
      <ChatPhone className="vx-stage__phone" business="Clínica Dental" ask="Hola, ¿tenéis hueco para una limpieza esta semana?" reply="¡Hola! Sí, el jueves a las 17:30 o el viernes a las 10:00. ¿Cuál te va mejor?" />
      <div className="vx-chip vx-chip--result vx-chip--low">
        <Star size={18} />
        <div><b>+80 % facturación</b><span>caso real en Viladecans</span></div>
      </div>
    </div>
  );
}

/** Demo ilustrativa de cómo quedaría la web de un sector concreto. */
export function SectorMock({ nicho, ciudad }) {
  const s = sectorOf(nicho);
  return (
    <div className="vx-stage vx-stage--sector" style={{ '--hue': s.hue, '--soft': s.soft }}>
      <div className="vx-glow" aria-hidden="true" />
      <figure className="vx-site" aria-label={`Ejemplo ilustrativo de web para ${s.label.toLowerCase()} en ${ciudad}`}>
        <div className="vx-bar"><i /><i /><i /><span>tu{s.brand.toLowerCase().replace(/[^a-z]/g, '')}{ciudad.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}.com</span></div>
        <div className="vx-site__page">
          <div className="vx-site__nav"><b>{s.brand} {ciudad.split(' ')[0]}</b><span>Servicios</span><span>Equipo</span><em>Pedir cita</em></div>
          <div className="vx-site__hero">
            <small>{s.label} en {ciudad}</small>
            <strong>{s.hero}</strong>
            <div className="vx-site__btns"><em>Reservar online</em><span>WhatsApp</span></div>
          </div>
          <div className="vx-site__services">{s.services.map((x) => <span key={x}>{x}</span>)}</div>
        </div>
      </figure>
      <ChatPhone className="vx-stage__phone vx-stage__phone--sector" business={`${s.brand} ${ciudad.split(' ')[0]}`} ask={s.ask} reply={s.reply} />
      <p className="vx-note">Ejemplo ilustrativo</p>
    </div>
  );
}

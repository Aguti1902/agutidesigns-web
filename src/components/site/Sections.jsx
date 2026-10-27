import { useState } from 'react';
import { Check, Plus, Minus, ArrowUpRight, Calendar, MessageCircle, Mail, Quote } from 'lucide-react';
import WebLeadForm from '../forms/WebLeadForm';
import { PLANS, PARTNER, PROCESS, CONTACT } from '../../data/site';
import { PORTFOLIO } from '../../data/portfolio';
import { VELA } from '../../data/caseStudy';
import { Laptop } from './Visuals';
import Photo from './Photo';
import './Sections.css';

/* ── Planes y precios ── */
export function Plans({ id = 'precios', title = 'Precios claros, sin sorpresas', lead, audience = 'tu negocio' }) {
  return (
    <section id={id} className="ag-section ag-section--white">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">{title}</h2>
          <p className="ag-lead">{lead || `Una puesta en marcha única y una cuota mensual con todo incluido para que ${audience} reciba clientes cada mes.`}</p>
        </div>
        <div className="sx-plans">
          {PLANS.map((p) => (
            <article key={p.id} className={`sx-plan ${p.recommended ? 'sx-plan--rec' : ''}`} aria-label={`Plan ${p.name}`}>
              {p.recommended && <span className="sx-plan__badge">El más elegido</span>}
              <h3 className="sx-plan__name">{p.name}</h3>
              <p className="sx-plan__price"><b>{p.monthly} €</b><span>/mes</span></p>
              <p className="sx-plan__setup">+ {p.setup} € de puesta en marcha</p>
              <p className="sx-plan__pitch">{p.pitch}</p>
              <ul className="ag-checks">{p.includes.map((i) => <li key={i}><Check size={16} />{i}</li>)}</ul>
              <a href="#propuesta" className={`ag-btn ${p.recommended ? 'ag-btn--primary' : 'ag-btn--ghost'}`}>Quiero el plan {p.name}</a>
            </article>
          ))}
        </div>
        <div className="sx-partner">
          <div>
            <h3 className="ag-h3">Plan {PARTNER.name}: {PARTNER.monthly} €/mes + {PARTNER.setup} € de alta</h3>
            <p>{PARTNER.pitch} Para grupos con varias sedes o negocios que quieren crecer rápido.</p>
          </div>
          <a href={CONTACT.calendly} target="_blank" rel="noopener noreferrer" className="ag-btn ag-btn--ghost">Hablemos</a>
        </div>
        <p className="sx-plans__note">¿Solo necesitas una web puntual, sin cuota? <a className="ag-link" href="/calculadora">Calcula su precio en 2 minutos</a></p>
      </div>
    </section>
  );
}

/* ── Caso real Vela-Segalà ── */
export function CaseVela({ full = false }) {
  return (
    <section className="ag-section ag-section--night sx-case" id="caso">
      <div className="ag-wrap">
        <div className="sx-case__grid">
          <div className="sx-case__copy">
            <span className="ag-kicker">Caso real · Viladecans</span>
            <h2 className="ag-h2">{VELA.headline}</h2>
            <p className="ag-lead">{VELA.name} pasó de depender del teléfono a recibir citas a cualquier hora. Web nueva, Google, asistente IA y recordatorios automáticos: <strong>+80 % de facturación</strong>.</p>
            <dl className="sx-case__stats">
              {VELA.stats.map((s) => <div key={s.l}><dt>{s.l}</dt><dd>{s.v}</dd></div>)}
            </dl>
            {!full && <a className="ag-btn ag-btn--onnight" href="/casos">Ver el caso completo</a>}
          </div>
          <a className="sx-case__shot" href={VELA.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir la web de ${VELA.name}`}>
            <Laptop src="/img/vela-800.webp" srcSet="/img/vela-800.webp 800w, /img/vela-1600.webp 1600w" url="velasegalaviladecans.com" alt={`Web de ${VELA.name} diseñada por Agutidesigns`} />
            <span className="sx-case__live">Ver la web en vivo <ArrowUpRight size={15} /></span>
          </a>
        </div>
        {full && (
          <div className="sx-ba" role="table" aria-label="Antes y después de Vela-Segalà">
            <div className="sx-ba__row sx-ba__row--head" role="row"><span role="columnheader">Área</span><span role="columnheader">Antes</span><span role="columnheader">Después</span></div>
            {VELA.rows.map((r) => (
              <div key={r.k} className="sx-ba__row" role="row">
                <span role="cell" className="sx-ba__k">{r.k}</span>
                <span role="cell" className="sx-ba__a">{r.a}</span>
                <span role="cell" className="sx-ba__d"><Check size={15} />{r.d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Portfolio ── */
export function Portfolio({ title = 'Webs que hemos diseñado', lead = 'Negocios reales que puedes visitar ahora mismo.', limit }) {
  const items = limit ? PORTFOLIO.slice(0, limit) : PORTFOLIO;
  return (
    <section className="ag-section" id="trabajos">
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">{title}</h2>
          <p className="ag-lead">{lead}</p>
        </div>
        <div className="sx-pf">
          {items.map((p) => (
            <a key={p.id} className="sx-pf__item" href={p.href} target="_blank" rel="noopener noreferrer">
              <div className="sx-pf__phone"><img src={p.img} alt={`Web de ${p.label} en móvil`} loading="lazy" width="600" height="1280" /></div>
              <div className="sx-pf__meta"><b>{p.label}</b><span>{p.type}</span></div>
            </a>
          ))}
        </div>
        {limit && <p className="sx-center"><a className="ag-link" href="/casos">Ver todos los trabajos <ArrowUpRight size={16} /></a></p>}
      </div>
    </section>
  );
}

/* ── Reseñas ── */
export function Reviews({ items, title = 'Lo que dicen nuestros clientes', white = false }) {
  return (
    <section className={`ag-section ${white ? 'ag-section--white' : ''}`} id="opiniones">
      <div className="ag-wrap">
        <div className="ag-head"><h2 className="ag-h2">{title}</h2></div>
        <div className="sx-reviews">
          {items.map((r) => (
            <figure key={r.name} className="sx-review">
              <Quote size={22} className="sx-review__q" aria-hidden="true" />
              <blockquote>{r.text}</blockquote>
              <figcaption><b>{r.name}</b><span>{r.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Proceso (es una secuencia real: numerado) ── */
export function Process({ title = 'Cómo trabajamos', items = PROCESS, white = false, photo, photoAlt = '' }) {
  return (
    <section className={`ag-section ${white ? 'ag-section--white' : ''}`} id="proceso">
      <div className="ag-wrap">
        <div className="ag-head"><h2 className="ag-h2">{title}</h2></div>
        {photo && <div className="sx-band"><Photo name={photo} alt={photoAlt} sizes="(max-width: 1200px) 94vw, 1150px" /></div>}
        <ol className="sx-steps">
          {items.map((s, i) => (
            <li key={s.t}>
              <span className="sx-steps__n" aria-hidden="true">{i + 1}</span>
              <h3 className="ag-h3">{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Preguntas frecuentes ── */
export function Faq({ items, title = 'Preguntas frecuentes', white = false }) {
  const [open, setOpen] = useState(0);
  return (
    <section className={`ag-section ${white ? 'ag-section--white' : ''}`} id="faq">
      <div className="ag-wrap sx-faq">
        <h2 className="ag-h2">{title}</h2>
        <div className="sx-faq__list">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`sx-faq__item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    {f.q}{isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" hidden={!isOpen}><p>{f.a}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Sobre Guti ── */
export function AboutGuti() {
  return (
    <section className="ag-section ag-section--white" id="sobre-mi">
      <div className="ag-wrap sx-about">
        <div className="sx-about__photo">
          <img src="/img/guti-760.webp" alt="Alejandro Gutiérrez, fundador de Agutidesigns" width="760" height="986" loading="lazy" />
        </div>
        <div className="sx-about__copy">
          <span className="ag-kicker">Quién hay detrás</span>
          <h2 className="ag-h2">Hola, soy Guti</h2>
          <p className="ag-lead">Soy Alejandro Gutiérrez, diseñador y desarrollador web en Barcelona. No soy una agencia de veinte personas: hablas conmigo desde la primera llamada hasta el lanzamiento, y después.</p>
          <p className="sx-about__p">Diseño webs a medida, sin plantillas, y las conecto con lo que de verdad trae clientes: Google, WhatsApp y un asistente IA que responde cuando tú no puedes. Mi trabajo se mide en citas y ventas, no en visitas.</p>
          <div className="ag-actions">
            <a href={CONTACT.calendly} target="_blank" rel="noopener noreferrer" className="ag-btn ag-btn--primary">Reserva una llamada</a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="ag-btn ag-btn--ghost">Escríbeme por WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Captación: formulario + contacto directo ── */
export function LeadSection({ fuente, ciudad, sector, title = 'Pide tu propuesta personalizada', lead = 'Te preparamos una demo de cómo quedaría tu nueva web y te la enseñamos en una llamada de 20 minutos. Gratis y sin compromiso.' }) {
  return (
    <section className="ag-section sx-lead" id="propuesta">
      <div className="ag-wrap sx-lead__grid">
        <div className="sx-lead__copy">
          <h2 className="ag-h2">{title}</h2>
          <p className="ag-lead">{lead}</p>
          <ul className="sx-lead__direct">
            <li><a href={CONTACT.calendly} target="_blank" rel="noopener noreferrer"><Calendar size={18} /> Reservar llamada directamente</a></li>
            <li><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> WhatsApp {CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`}><Mail size={18} /> {CONTACT.email}</a></li>
          </ul>
        </div>
        <WebLeadForm fuente={fuente} ciudad={ciudad} sector={sector} title="Cuéntanos sobre tu negocio" />
      </div>
    </section>
  );
}

/* ── Servicios / pilares ── */
export function Pillars({ id = 'servicios', title, lead, items, children }) {
  return (
    <section className="ag-section ag-section--white" id={id}>
      <div className="ag-wrap">
        <div className="ag-head ag-head--split">
          <h2 className="ag-h2">{title}</h2>
          {lead && <p className="ag-lead">{lead}</p>}
        </div>
        <div className="sx-pillars">
          {items.map((it) => (
            <article key={it.t} className="sx-pillar">
              <span className="sx-pillar__icon" aria-hidden="true"><it.Icon size={22} strokeWidth={1.8} /></span>
              <div>
                <h3 className="ag-h3">{it.t}</h3>
                <p>{it.d}</p>
                {it.tag && <span className="sx-pillar__tag">{it.tag}</span>}
              </div>
            </article>
          ))}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ── Problemas (lo que frena al negocio) ── */
export function Problems({ title, lead, items, photo, photoAlt = '' }) {
  return (
    <section className="ag-section" id="problemas">
      <div className="ag-wrap">
        <div className={photo ? 'sx-split' : undefined}>
          <div className="ag-head">
            <h2 className="ag-h2">{title}</h2>
            {lead && <p className="ag-lead">{lead}</p>}
          </div>
          {photo && <div className="sx-split__photo"><Photo name={photo} alt={photoAlt} sizes="(max-width: 900px) 92vw, 540px" /></div>}
        </div>
        <ol className="sx-problems">
          {items.map((p) => (
            <li key={p.t}><h3 className="ag-h3">{p.t}</h3><p>{p.d}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

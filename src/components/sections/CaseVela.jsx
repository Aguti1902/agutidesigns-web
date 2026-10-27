import { ArrowRight, ExternalLink } from 'lucide-react';
import { VELA } from '../../data/caseStudy';
import './CaseVela.css';

export default function CaseVela({ compact = false }) {
  return (
    <section className={`cv ${compact ? 'cv--compact' : ''}`}>
      <div className="cv__inner">
        <div className="cv__text">
          <span className="cv__kicker">Caso real · {VELA.city}</span>
          <h2 className="cv__title">{VELA.headline}</h2>
          <p className="cv__lead">
            {VELA.name} pasó de depender del teléfono a recibir citas a cualquier hora. Web nueva, asistente IA,
            Google y recordatorios automáticos: <strong>+80 % de facturación</strong> en tres meses.
          </p>
          <div className="cv__stats">
            {VELA.stats.map((s) => (
              <div key={s.l} className="cv__stat"><b>{s.v}</b><span>{s.l}</span></div>
            ))}
          </div>
          {compact && <a className="cv__link" href="/casos">Ver el caso completo <ArrowRight size={15} /></a>}
        </div>
        <a className="cv__shot" href={VELA.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver la web de ${VELA.name}`}>
          <div className="cv__bar"><i /><i /><i /><span>velasegalaviladecans.com</span></div>
          <img src={VELA.img} alt={`Web de ${VELA.name}, diseñada por Agutidesigns`} loading="lazy" />
          <span className="cv__live"><ExternalLink size={13} /> Ver web en vivo</span>
        </a>
      </div>
      {!compact && (
        <div className="cv__table" role="table" aria-label="Antes y después">
          <div className="cv__row cv__row--head" role="row"><span /><span>Antes</span><span>Después</span></div>
          {VELA.rows.map((r) => (
            <div key={r.k} className="cv__row" role="row">
              <span className="cv__k">{r.k}</span>
              <span className="cv__a">{r.a}</span>
              <span className="cv__d">{r.d}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

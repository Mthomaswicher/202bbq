import { TESTIMONIALS } from '../data/menu.js';

// Duplicate the list so the marquee loops seamlessly
const DOUBLED = [...TESTIMONIALS, ...TESTIMONIALS];

export default function ProofStrip() {
  return (
    <div className="proof-strip" aria-label="Customer reviews" role="region">
      <div className="proof-track" aria-hidden="true">
        {DOUBLED.map((t, i) => (
          <div className="proof-item" key={i}>
            <span className="proof-stars">{'★'.repeat(t.stars)}</span>
            <span className="proof-quote"><q>{t.quote}</q></span>
            <span className="proof-author">— {t.author}, {t.location}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

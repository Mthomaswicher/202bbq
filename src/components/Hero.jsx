import reviews from '../data/reviews.json';
import { SITE, PICKUP_AREA } from '../data/site.js';
import { EVENTS } from '../data/events.js';
import { focusHeading } from '../lib/useScrollSpy.js';
import Picture from './ui/Picture.jsx';
import Button from './ui/Button.jsx';
import { PhoneLink } from './ui/Bits.jsx';
import StatusLine from './StatusLine.jsx';

function ProofStrip() {
  const n = reviews.length;
  const avg = n ? (reviews.reduce((s, r) => s + r.rating, 0) / n) : 0;
  const battle = EVENTS.find(e => e.id === 'bbq-battle-2026');
  const facts = [
    n >= 3 && <><span role="img" aria-label={`${avg.toFixed(1)} out of 5 stars`}>{avg.toFixed(1)}★</span> from {n} customers</>,
    'Smoked over hardwood. No gas.',
    SITE.licence ? `Licensed by ${SITE.licence}` : 'A fully licensed DC food business',
    battle && `Took part in the ${battle.start.slice(0, 4)} Giant National Capital Barbecue Battle`,
  ].filter(Boolean);
  return (
    <ul className="proof" aria-label="About 202BBQ">
      {facts.map((f, i) => <li key={i}>{f}</li>)}
    </ul>
  );
}

export default function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="hero-grid">
        <div className="hero-text">
          <p className="hero-tagline">{SITE.tagline}</p>
          <h1 id="hero-heading" tabIndex={-1}>
            Small-batch barbecue by the tray.{' '}
            <span className="hero-line2">Smoked in DC every Friday night.</span>
          </h1>
          <p className="lede">
            Brisket, ribs, pulled pork, wings and Southern sides. A full tray feeds 30–40, a half tray 15–20.
            Order by Thursday; pick up in {PICKUP_AREA} or get delivery across {SITE.serviceArea} on Saturday or Sunday.
          </p>
          <StatusLine et />
          <div className="hero-ctas">
            <Button href="#menu" variant="primary" size="lg" onClick={() => focusHeading('menu')}>See the menu &amp; prices</Button>
            <PhoneLink button="secondary" size="lg" location="hero" label={`Call ${SITE.phone}`} />
          </div>
          <p className="hero-tertiary">
            <a href="#shipping" onClick={() => focusHeading('shipping')}>Not in DC? Oxtail Softballs ship anywhere in the US →</a>
          </p>
          <ProofStrip />
        </div>
        <div className="hero-photo">
          <Picture
            name="brisket-board"
            alt="Slicing a whole smoked brisket on a wooden board"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            ratio="4 / 5"
            position="50% 25%"
            className="hero-picture"
          />
        </div>
      </div>
    </section>
  );
}

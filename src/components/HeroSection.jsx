import { useEffect, useState } from 'react';
import HeroParallax from './HeroParallax.jsx';

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const bar    = document.querySelector('.announcement-bar');
  const offset = (header?.offsetHeight || 0) + (bar?.offsetHeight || 0) + 12;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

const base = import.meta.env.BASE_URL;

const PHOTOS = [
  'hero-brisket.jpg',
  'hero-ribs.jpg',
  'hero-chicken.jpg',
  'hero-pork.jpg',
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) return;
    const id = setInterval(() => setIndex(i => (i + 1) % PHOTOS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" aria-label="Welcome to 202BBQ">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="hero-watermark" aria-hidden="true">
        <img src={`${base}logo.png`} alt="" role="presentation" />
      </div>

      <HeroParallax />

      <div className="container hero-layout">
        <div className="hero-content">
          <div className="hero-eyebrow" aria-label="Location">Washington, D.C.</div>

          <h1 className="hero-headline">
            Where the Grill<br />
            <em>Meets the Hill</em>
          </h1>

          <p className="hero-sub">
            DC-born small-batch BBQ. Smoked low &amp; slow over hardwood, at your door, at the market, or at the popup.
            Order trays online every week.
          </p>

          <div className="hero-ctas">
            <a
              href="#order"
              className="btn btn-primary btn-lg"
              onClick={e => { e.preventDefault(); smoothScrollTo('order'); }}
            >
              Order This Weekend
            </a>
            <a
              href="#menu"
              className="btn btn-ghost btn-lg"
              onClick={e => { e.preventDefault(); smoothScrollTo('menu'); }}
            >
              See the Menu
            </a>
          </div>

          <div className="hero-steps" role="note" aria-label="How ordering works">
            <div className="hero-step">
              <span className="hero-step-num" aria-hidden="true">1</span>
              <div>
                <strong>Order Mon–Thu</strong>
                <span>Online or by phone</span>
              </div>
            </div>
            <span className="hero-step-arrow" aria-hidden="true">→</span>
            <div className="hero-step">
              <span className="hero-step-num" aria-hidden="true">2</span>
              <div>
                <strong>We Smoke Overnight</strong>
                <span>Low &amp; slow, all night</span>
              </div>
            </div>
            <span className="hero-step-arrow" aria-hidden="true">→</span>
            <div className="hero-step">
              <span className="hero-step-num" aria-hidden="true">3</span>
              <div>
                <strong>Pickup or Delivery</strong>
                <span>Saturday &amp; Sunday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explosion composition */}
        <div className="hero-explosion" aria-hidden="true">
          <div className="hero-rays" />
          <div className="hero-rays-glow" />

          {PHOTOS.map((src, i) => (
            <img
              key={src}
              src={`${base}photos/${src}`}
              alt=""
              className={`hero-photo${i === index ? ' is-active' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          <div className="hero-pin" role="presentation">
            <span className="hero-pin-dot" />
            <div>
              <strong>Smoked Overnight</strong>
              <span>Low &amp; slow, every Friday</span>
            </div>
          </div>

          <div className="hero-pin hero-pin--alt" role="presentation">
            <span className="hero-pin-flame">🔥</span>
            <div>
              <strong>Next drop</strong>
              <span>This Saturday</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

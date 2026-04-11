function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const bar    = document.querySelector('.announcement-bar');
  const offset = (header?.offsetHeight || 0) + (bar?.offsetHeight || 0) + 12;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Welcome to 202BBQ">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid-overlay" aria-hidden="true" />

      <div className="container hero-content">
        <div className="hero-eyebrow" aria-label="Location">Washington, D.C.</div>

        <h1 className="hero-headline">
          Where the Grill<br />
          <em>Meets the Hill</em>
        </h1>

        <p className="hero-sub">
          DC-born small-batch BBQ. Smoked low &amp; slow over hardwood — at your door, at the market, or at the popup.
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

      <div className="hero-watermark" aria-hidden="true">
        <img src="/logo.png" alt="" role="presentation" />
      </div>
    </section>
  );
}

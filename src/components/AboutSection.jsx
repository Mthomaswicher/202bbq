export default function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="container about-inner">
        {/* Visual */}
        <div className="about-visual" aria-hidden="true">
          <div className="about-logo-ring">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" role="presentation" />
          </div>
        </div>

        {/* Text */}
        <div className="about-text">
          <p className="section-eyebrow">Our Story</p>
          <h2 className="about-title" id="about-heading">
            Built in DC.<br />
            Smoked with Pride.
          </h2>
          <p>
            202BBQ started with a backyard, a used smoker, and an obsession with getting it right.
            We're a DC-born, fully licensed operation fueled by a love for real barbecue — the kind
            that takes all night to make and disappears in minutes.
          </p>
          <p>
            Every week we smoke in small batches over hardwood. No shortcuts. No gas. No fillers.
            You'll find us at farmers markets, city popups, and competing at the{' '}
            <a href="https://bbqindc.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fire)', fontWeight: 700 }}>34th Annual Giant BBQ Battle — June 27–28</a>.
            Named 202 because this is a <em>Washington thing.</em>
          </p>

          <div className="about-chips" aria-label="Our values">
            <span className="chip">🪵 Hardwood smoked</span>
            <span className="chip">🏙️ DC born &amp; raised</span>
            <span className="chip">⚖️ Small batch</span>
            <span className="chip">✅ Fully licensed</span>
          </div>

          <div className="about-ctas">
            <a href="tel:2029978912" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.84 12 19.79 19.79 0 0 1 1.77 3.41 2 2 0 0 1 3.74 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.67a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              202-997-8912
            </a>
            <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @202_bbq
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const bar    = document.querySelector('.announcement-bar');
  const offset = (header?.offsetHeight || 0) + (bar?.offsetHeight || 0) + 12;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-main">
          {/* Brand */}
          <div className="footer-brand">
            <img src="/logo.png" alt="202BBQ logo" className="footer-logo" width="52" height="52" />
            <div>
              <div className="footer-name">202BBQ</div>
              <div className="footer-tagline">Where the Grill Meets the Hill</div>
            </div>
            <p className="footer-desc">
              DC-born small-batch BBQ catering. Smoked low &amp; slow over hardwood.
              Farmers markets, popups, and weekend orders every week.
            </p>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/202_bbq"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Follow 202BBQ on Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="tel:2029978912" className="footer-social-btn" aria-label="Call 202-997-8912">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.84 12 19.79 19.79 0 0 1 1.77 3.41 2 2 0 0 1 3.74 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.67a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigate */}
          <nav className="footer-col" aria-label="Footer navigation">
            <h4>Navigate</h4>
            <ul>
              {[['menu','Menu'],['events','Events'],['about','About'],['order','Order Online']].map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={e => { e.preventDefault(); smoothScrollTo(id); }}>{label}</a>
                </li>
              ))}
              <li>
                <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
            </ul>
          </nav>

          {/* Contact & Hours */}
          <div className="footer-col">
            <h4>Order Window</h4>
            <ul className="footer-hours">
              <li><strong>Mon–Thu:</strong> Orders open</li>
              <li><strong>Fri:</strong> We're smoking!</li>
              <li><strong>Sat–Sun:</strong> Pickup &amp; delivery</li>
            </ul>
            <a href="tel:2029978912" className="footer-phone" style={{ marginTop: 16 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.84 12 19.79 19.79 0 0 1 1.77 3.41 2 2 0 0 1 3.74 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.67a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              202-997-8912
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} 202BBQ &nbsp;·&nbsp; Washington, DC &nbsp;·&nbsp; All rights reserved.</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            A fully licensed DC food business.
          </p>
        </div>
      </div>
    </footer>
  );
}

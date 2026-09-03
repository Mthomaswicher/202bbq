import { useEffect, useState } from 'react';
import { SITE } from '../data/site.js';
import { useCart } from '../context/CartContext.jsx';
import { countLabel, subtotalLabel } from '../lib/format.js';
import { useScrollSpy, focusHeading } from '../lib/useScrollSpy.js';
import { track } from '../lib/analytics.js';
import { LogoMark, LogoLockup } from './Logo.jsx';
import Icon from './ui/Icon.jsx';

// No hamburger, no drawer. The link set grows with the viewport:
//   320–479  Menu · Catering · Call
//   480–639  … · Call 202-734-5621
//   640–1023 Menu · Catering · Oxtails · Call 202-734-5621
//   ≥1024    lockup · Menu · Catering · Oxtails · About · Reviews · Call · Your order

const LINKS = [
  { id: 'menu', label: 'Menu' },
  { id: 'catering', label: 'Catering' },
  { id: 'shipping', label: 'Oxtails', from: 640 },
  { id: 'about', label: 'About', from: 1024 },
  { id: 'reviews', label: 'Reviews', from: 1024 },
];
const SPY = ['menu', 'how-it-works', 'order', 'catering', 'shipping', 'reviews', 'about', 'events', 'faq', 'contact'];
// The sticky chrome height, read from the same token the page scrolls by (stable reference: one observer).
const headerInset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

export default function SiteHeader({ hasUpcomingEvents }) {
  const { lineCount, summary } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(SPY, { topInset: headerInset });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = hasUpcomingEvents ? [...LINKS, { id: 'events', label: 'Events', from: 1024 }] : LINKS;

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`} role="banner">
      <div className="header-inner">
        <a href="#top" className="logo-link" aria-label="202BBQ home" onClick={() => focusHeading('hero')}>
          <LogoMark size={40} animate className="logo-small" />
          <LogoLockup size={40} animate className="logo-wide" />
        </a>

        <nav aria-label="Main" className="main-nav">
          <ul>
            {links.map(l => (
              <li key={l.id} className={l.from ? `from-${l.from}` : undefined}>
                <a href={`#${l.id}`} aria-current={active === l.id ? 'location' : undefined} onClick={() => focusHeading(l.id)}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a href={SITE.phoneHref} className="btn btn-secondary btn-compact call-link" onClick={() => track('contact', { method: 'phone', location: 'header' })}>
            <Icon name="phone" size={20} />
            <span className="call-word">Call</span>
            <span className="call-digits phone">{SITE.phone}</span>
          </a>
          {lineCount > 0 && (
            <a href="#order" className="btn btn-primary btn-compact your-order" onClick={() => focusHeading('order')}
              aria-label={`Your order, ${countLabel(summary)}, ${subtotalLabel(summary)}`}>
              <span>Your order</span>
              <span className="sep" aria-hidden="true">·</span>
              <span className="num">{summary.trays}{summary.units ? `+${summary.units}` : ''}</span>
              <span className="sep" aria-hidden="true">·</span>
              <span className="price">{subtotalLabel(summary)}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

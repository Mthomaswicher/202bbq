import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { track } from '../lib/analytics.js';

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.84 12 19.79 19.79 0 0 1 1.77 3.41 2 2 0 0 1 3.74 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.67a16 16 0 0 0 6 6l1.03-1.03a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const bar    = document.querySelector('.announcement-bar');
  const offset = (header?.offsetHeight || 0) + (bar?.offsetHeight || 0) + 12;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

export default function Header() {
  const { cartCount, cartOpen, openCart } = useCart();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Scroll-spy: which section is in view
  useEffect(() => {
    const ids = ['menu', 'events', 'about', 'order'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { label: 'Menu',     id: 'menu'     },
    { label: 'Events',   id: 'events'   },
    { label: 'About',    id: 'about'    },
    { label: 'Ship 🚚',  id: 'shipping' },
    { label: 'Order',    id: 'order'    },
  ];

  const handleNavClick = (id) => {
    setMenuOpen(false);
    smoothScrollTo(id);
  };

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        {/* Logo */}
        <a href="#" className="logo-link" aria-label="202BBQ home" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="202BBQ" className="logo-img" width="40" height="40" />
          <div className="logo-wordmark">
            <span className="logo-name">202BBQ</span>
            <span className="logo-tagline">Where the Grill Meets the Hill</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="main-nav" aria-label="Main navigation">
          <ul role="list">
            {navLinks.map(({ label, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={e => { e.preventDefault(); handleNavClick(id); }}
                  className={activeSection === id ? 'is-active' : undefined}
                  aria-current={activeSection === id ? 'location' : undefined}
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer"
                 className="nav-icon-btn" aria-label="Follow 202BBQ on Instagram"
                 onClick={() => track('instagram_click', { location: 'header' })}>
                <IconInstagram />
              </a>
            </li>
            <li>
              <a href="tel:2027345621" className="nav-icon-btn" aria-label="Call 202-734-5621"
                 onClick={() => track('contact', { method: 'phone', location: 'header' })}>
                <IconPhone />
              </a>
            </li>
          </ul>
        </nav>

        {/* Cart + Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="nav-icon-btn theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button
            className="cart-btn"
            onClick={openCart}
            aria-label={`View cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            aria-expanded={cartOpen}
            aria-controls="cart-drawer"
          >
            <IconBag />
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">{cartCount}</span>
            )}
          </button>

          <button
            className={`mobile-menu-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav
        id="mobile-nav"
        className={`mobile-nav${menuOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {navLinks.map(({ label, id }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => { e.preventDefault(); handleNavClick(id); }}
            className={activeSection === id ? 'is-active' : undefined}
            aria-current={activeSection === id ? 'location' : undefined}
          >
            {label}
          </a>
        ))}
        <a href="tel:2027345621" onClick={() => { setMenuOpen(false); track('contact', { method: 'phone', location: 'mobile_nav' }); }}>📞 202-734-5621</a>
        <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" onClick={() => { setMenuOpen(false); track('instagram_click', { location: 'mobile_nav' }); }}>
          Instagram @202_bbq
        </a>
      </nav>
    </header>
  );
}

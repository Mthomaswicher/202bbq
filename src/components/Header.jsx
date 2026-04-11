import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';

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
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navLinks = [
    { label: 'Menu',   id: 'menu'  },
    { label: 'Events', id: 'events' },
    { label: 'About',  id: 'about' },
    { label: 'Order',  id: 'order' },
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
          <img src="/logo.png" alt="202BBQ" className="logo-img" width="40" height="40" />
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
                <a href={`#${id}`} onClick={e => { e.preventDefault(); handleNavClick(id); }}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer"
                 className="nav-icon-btn" aria-label="Follow 202BBQ on Instagram">
                <IconInstagram />
              </a>
            </li>
            <li>
              <a href="tel:2029978912" className="nav-icon-btn" aria-label="Call 202-997-8912">
                <IconPhone />
              </a>
            </li>
          </ul>
        </nav>

        {/* Cart + Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="cart-btn"
            onClick={openCart}
            aria-label={`View cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            aria-expanded={false}
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
          <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); handleNavClick(id); }}>
            {label}
          </a>
        ))}
        <a href="tel:2029978912" onClick={() => setMenuOpen(false)}>📞 202-997-8912</a>
        <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
          Instagram @202_bbq
        </a>
      </nav>
    </header>
  );
}

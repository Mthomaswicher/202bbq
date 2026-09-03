import { SITE } from '../data/site.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { focusHeading } from '../lib/useScrollSpy.js';
import { LogoBadge } from './Logo.jsx';
import { orderWindow } from '../lib/time.js';

const NAV = [
  ['menu', 'Menu'], ['how-it-works', 'How it works'], ['catering', 'Catering'], ['shipping', 'Oxtails'],
  ['reviews', 'Reviews'], ['about', 'About'], ['faq', 'Questions'], ['contact', 'Contact'],
];

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const on = theme === 'dark';
  return (
    <div className="theme-switch">
      <button type="button" role="switch" aria-checked={on} id="theme-switch" onClick={() => { setTheme(on ? 'light' : 'dark'); addToast(on ? 'Dark mode off' : 'Dark mode on', { duration: 4000 }); }}>
        <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
        <span>Dark mode</span>
      </button>
    </div>
  );
}

export default function Footer() {
  const win = orderWindow();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer band" role="contentinfo">
      <h2 className="sr-only">Site footer</h2>
      <div className="container footer-grid">
        <div className="footer-brand">
          <LogoBadge size={88} />
          <p className="footer-tagline">{SITE.tagline}</p>
          <p className="small">{SITE.licence ? `Licensed by ${SITE.licence}.` : 'A fully licensed DC food business.'}</p>
        </div>
        <div className="footer-col">
          <h3>Order window</h3>
          <ul className="footer-hours">
            <li><strong>Mon–Thu</strong> Orders open (closes Thu {win.cutoffLabel})</li>
            <li><strong>Fri</strong> We smoke overnight</li>
            <li><strong>Sat–Sun</strong> Pickup &amp; delivery {SITE.fulfilHours.open}–{SITE.fulfilHours.close}</li>
          </ul>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <h3>Navigate</h3>
          <ul className="footer-nav">
            {NAV.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={() => focusHeading(id)}>{label}</a></li>)}
          </ul>
        </nav>
        <div className="footer-col">
          <h3>Contact</h3>
          <ul className="footer-nav">
            <li><a href={SITE.phoneHref} className="phone">{SITE.phone}</a></li>
            <li><a href={SITE.smsHref}>Text us</a></li>
            {SITE.email && <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
            <li><a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">@{SITE.instagram}</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="legal">© {year} 202BBQ · Washington, DC</p>
        <ThemeSwitch />
      </div>
    </footer>
  );
}

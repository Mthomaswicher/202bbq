import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts (OFL). Fraunces: weight + SOFT axes; Public Sans: weight; DM Mono: 500.
import '@fontsource-variable/fraunces/soft.css';
import '@fontsource-variable/public-sans/index.css';
import '@fontsource/dm-mono/500.css';

import './index.css';
import App from './App.jsx';
import { SITE } from './data/site.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Analytics after load so it never competes with the page.
if (SITE.ga4 && !window.__gtagLoaded) {
  const loadGtag = () => {
    if (window.__gtagLoaded) return;
    window.__gtagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', SITE.ga4, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.ga4}`;
    document.head.appendChild(s);
  };
  if (document.readyState === 'complete') setTimeout(loadGtag, 0);
  else window.addEventListener('load', () => setTimeout(loadGtag, 0), { once: true });
}

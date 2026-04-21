import { useEffect, useRef } from 'react';
import { track } from '../lib/analytics.js';

const POSTS = [
  'https://www.instagram.com/p/DXFnNoEAI7s/',
  'https://www.instagram.com/p/DU9Ov_6EiPu/',
  'https://www.instagram.com/p/DVG97q-EX65/',
  'https://www.instagram.com/p/DVMIZKOkYvQ/',
  'https://www.instagram.com/p/DQ9_jAuEgMV/',
  'https://www.instagram.com/p/DV6XMWzgKyN/',
];

const EMBED_SRC = 'https://www.instagram.com/embed.js';

function processEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  }
}

function loadEmbedScript() {
  if (document.querySelector(`script[src="${EMBED_SRC}"]`)) {
    processEmbeds();
    return;
  }
  const s = document.createElement('script');
  s.src = EMBED_SRC;
  s.async = true;
  s.onload = processEmbeds;
  document.body.appendChild(s);
}

export default function InstagramSection() {
  const gridRef = useRef(null);

  useEffect(() => {
    loadEmbedScript();
    // Re-process in case script was already loaded on a previous mount
    const t = setTimeout(processEmbeds, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="instagram-section" id="instagram" aria-labelledby="instagram-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Straight From the Smoker</p>
          <h2 className="section-title" id="instagram-heading">Latest on the Gram</h2>
          <p className="section-sub">
            Weekend specials, popup drops, and the occasional brisket close-up. Follow{' '}
            <a
              href="https://www.instagram.com/202_bbq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-link"
            >
              @202_bbq
            </a>
            {' '}to never miss a smoke day.
          </p>
        </div>

        <div className="instagram-grid" ref={gridRef}>
          {POSTS.map((url) => (
            <blockquote
              key={url}
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: 0,
                borderRadius: 3,
                margin: 0,
                maxWidth: '100%',
                minWidth: 'unset',
                padding: 0,
                width: '100%',
              }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                View this post on Instagram
              </a>
            </blockquote>
          ))}
        </div>

        <div className="instagram-cta">
          <a
            href="https://www.instagram.com/202_bbq"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            onClick={() => track('instagram_click', { location: 'instagram_section' })}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Follow @202_bbq
          </a>
        </div>
      </div>
    </section>
  );
}

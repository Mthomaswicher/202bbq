import { useState } from 'react';
import { UPCOMING_EVENTS, PAST_EVENTS } from '../data/menu.js';

function DCIllustration() {
  return (
    <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="collab-banner-dc">
      <defs>
        <linearGradient id="cbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#177870" />
          <stop offset="50%" stopColor="#28ADA2" />
          <stop offset="100%" stopColor="#5DCEC7" />
        </linearGradient>
        <linearGradient id="cbPool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5CCEC6" />
          <stop offset="100%" stopColor="#38AFA6" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="240" height="160" fill="url(#cbSky)" />

      {/* Distant city silhouette */}
      <rect x="148" y="70" width="6"  height="22" fill="#1C9C92" opacity="0.55" />
      <rect x="156" y="65" width="8"  height="27" fill="#1C9C92" opacity="0.55" />
      <rect x="166" y="68" width="10" height="24" fill="#1C9C92" opacity="0.55" />
      <rect x="178" y="73" width="7"  height="19" fill="#1C9C92" opacity="0.55" />
      <rect x="187" y="67" width="9"  height="25" fill="#1C9C92" opacity="0.55" />
      <rect x="198" y="71" width="12" height="21" fill="#1C9C92" opacity="0.55" />
      <rect x="212" y="66" width="8"  height="26" fill="#1C9C92" opacity="0.55" />
      <rect x="222" y="72" width="18" height="20" fill="#1C9C92" opacity="0.55" />

      {/* Capitol Building */}
      <rect x="10"  y="79" width="62" height="14" fill="#E8E2D5" />
      <rect x="26"  y="76" width="30" height="17" fill="#EDEAD8" />
      <rect x="28"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="32"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="36"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="40"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="44"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="48"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="52"  y="76" width="2"  height="17" fill="#D8D2C2" />
      <rect x="13"  y="91" width="56" height="2"  fill="#D4CFC0" />
      <ellipse cx="41" cy="78" rx="14" ry="9"  fill="#EAE5D8" />
      <ellipse cx="41" cy="76" rx="8"  ry="7"  fill="#E2DCC8" />
      <rect x="39"  y="63" width="4"  height="13" fill="#E0DAC5" />
      <rect x="40"  y="58" width="1.5" height="6" fill="#C8C0B0" />
      <polygon points="41.5,58 48,60.5 41.5,63" fill="#C8102E" />

      {/* Washington Monument — obelisk */}
      <polygon points="110,10 117,10 122,92 105,92" fill="#EAE4D6" />
      <polygon points="117,10 122,10 127,92 122,92" fill="#CCC4B4" />
      <polygon points="108,7 119,7 117,12 110,12"  fill="#D0C8B8" />

      {/* Flag poles left of monument */}
      <line x1="82" y1="63" x2="82" y2="92" stroke="#C8C0B0" strokeWidth="1.5" />
      <rect x="83" y="63" width="10" height="7"   fill="#C8102E" />
      <rect x="83" y="65" width="10" height="2"   fill="#FFFFFF" />
      <rect x="83" y="67" width="10" height="2.5" fill="#002868" />
      <line x1="93" y1="60" x2="93" y2="92" stroke="#C8C0B0" strokeWidth="1.5" />
      <rect x="94" y="60" width="10" height="7"   fill="#C8102E" />
      <rect x="94" y="62" width="10" height="2"   fill="#FFFFFF" />
      <rect x="94" y="64" width="10" height="2.5" fill="#002868" />

      {/* Flag poles right of monument */}
      <line x1="135" y1="58" x2="135" y2="92" stroke="#C8C0B0" strokeWidth="1.5" />
      <rect x="136" y="58" width="10" height="7"   fill="#C8102E" />
      <rect x="136" y="60" width="10" height="2"   fill="#FFFFFF" />
      <rect x="136" y="62" width="10" height="2.5" fill="#002868" />
      <line x1="146" y1="61" x2="146" y2="92" stroke="#C8C0B0" strokeWidth="1.5" />
      <rect x="147" y="61" width="10" height="7"   fill="#C8102E" />
      <rect x="147" y="63" width="10" height="2"   fill="#FFFFFF" />
      <rect x="147" y="65" width="10" height="2.5" fill="#002868" />

      {/* Ground */}
      <rect x="0" y="92" width="240" height="68" fill="#4D9858" />

      {/* Center pathway */}
      <rect x="106" y="92" width="18" height="68" fill="#C0B8A0" opacity="0.45" />

      {/* Memorial walls flanking pool */}
      <rect x="55" y="86" width="36" height="8" rx="1" fill="#DDD8C8" />
      <rect x="57" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="62" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="67" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="72" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="77" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="82" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="149" y="86" width="36" height="8" rx="1" fill="#DDD8C8" />
      <rect x="151" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="156" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="161" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="166" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="171" y="82" width="2.5" height="12" fill="#E4E0CC" />
      <rect x="176" y="82" width="2.5" height="12" fill="#E4E0CC" />

      {/* Reflecting pool */}
      <rect x="66" y="104" width="108" height="36" rx="2" fill="url(#cbPool)" opacity="0.78" />

      {/* Monument reflection */}
      <polygon points="110,104 117,104 120,134 107,134" fill="#42B8B0" opacity="0.5" />

      {/* Left trees */}
      <ellipse cx="0"  cy="97" rx="26" ry="20" fill="#3A7848" />
      <ellipse cx="23" cy="95" rx="18" ry="16" fill="#3E8050" />
      <ellipse cx="44" cy="94" rx="14" ry="13" fill="#428452" />
      <ellipse cx="57" cy="96" rx="10" ry="11" fill="#3E8050" />

      {/* Right trees */}
      <ellipse cx="183" cy="95" rx="11" ry="11" fill="#428452" />
      <ellipse cx="197" cy="94" rx="14" ry="13" fill="#3E8050" />
      <ellipse cx="214" cy="95" rx="16" ry="14" fill="#3A7848" />
      <ellipse cx="232" cy="97" rx="18" ry="15" fill="#367044" />
      <ellipse cx="240" cy="99" rx="12" ry="14" fill="#3A7848" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export default function EventsSection() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const isPast = activeTab === 'past';
  const events = isPast ? PAST_EVENTS : UPCOMING_EVENTS;
  const showCollabBanner = !isPast && UPCOMING_EVENTS.some(e => e.collab === 'right-proper');

  return (
    <section className="events-section" id="events" aria-labelledby="events-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Find Us in the Wild</p>
          <h2 className="section-title" id="events-heading">Popups, Markets &amp; More</h2>
          <p className="section-sub">
            Beyond the online order, catch us live around the city. Follow{' '}
            <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" className="inline-link">@202_bbq</a>{' '}
            for real-time location drops.
          </p>
        </div>

        <div className="events-tabs" role="tablist" aria-label="Events tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            className={`events-tab${activeTab === 'upcoming' ? ' active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'past'}
            className={`events-tab${activeTab === 'past' ? ' active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
        </div>

        {showCollabBanner && (
          <div className="collab-banner">
            <div className="collab-banner-content">
              <img
                src="/right-proper-logo.png"
                alt="Right Proper Brewing Company"
                className="collab-banner-logo"
              />
              <div className="collab-banner-text">
                <span className="collab-banner-eyebrow">New Partnership</span>
                <p>
                  202BBQ is teaming up with{' '}
                  <a href="https://rightproper.com" target="_blank" rel="noopener noreferrer" className="inline-link">
                    Right Proper Brewing
                  </a>{' '}
                  for a series of pop-ups this spring and summer. Grab a pint, grab some 'cue — more dates dropping soon.
                </p>
              </div>
            </div>
            <DCIllustration />
          </div>
        )}

        {events.length === 0 ? (
          <p className="events-empty">No events to show here yet.</p>
        ) : (
          <div className={`events-grid${isPast ? ' past-tab' : ''}`}>
            {events.map(event => (
              <article
                key={event.id}
                className={[
                  'event-card',
                  event.collab ? 'collab' : event.featured ? 'featured' : '',
                ].filter(Boolean).join(' ')}
                aria-label={event.title}
              >
                <span className={`event-badge ${event.badgeClass}`}>{event.badge}</span>

                <h3>{event.title}</h3>

                <div className="event-meta">
                  <span><CalendarIcon /> {event.date}</span>
                  <span><MapIcon /> {event.location}</span>
                </div>

                <p>{event.desc}</p>

                {event.cta && (
                  <a
                    href={event.cta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost event-cta"
                  >
                    {event.ctaLabel || 'Learn More'}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

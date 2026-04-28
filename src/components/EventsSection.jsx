import { useState } from 'react';
import { UPCOMING_EVENTS, PAST_EVENTS } from '../data/menu.js';

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
            <img
              src="/photos/right-proper-logo.png"
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

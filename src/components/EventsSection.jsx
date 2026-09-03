import { splitEvents } from '../data/events.js';
import { SITE } from '../data/site.js';
import { nowET, fmtLong } from '../lib/time.js';
import Picture from './ui/Picture.jsx';
import Icon from './ui/Icon.jsx';
import { Section } from './ui/Bits.jsx';

function dateLabel(e) {
  if (e.start === e.end) return fmtLong(e.start);
  const [, m1, d1] = e.start.split('-').map(Number);
  const [, m2, d2] = e.end.split('-').map(Number);
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return m1 === m2 ? `${M[m1 - 1]} ${d1}–${d2}, ${e.start.slice(0, 4)}` : `${M[m1 - 1]} ${d1} – ${M[m2 - 1]} ${d2}, ${e.start.slice(0, 4)}`;
}

function EventRow({ e, past }) {
  return (
    <li className="event">
      <div className="event-date mono">
        <time dateTime={e.start}>{dateLabel(e)}</time>
        {e.time && <span>{e.time}</span>}
      </div>
      <div className="event-body">
        <h3 className="event-title">{e.title}<span className="sr-only">, {dateLabel(e)}</span></h3>
        <p className="event-place">{e.venue}{e.address ? ` · ${e.address}` : ''}</p>
        {e.desc && <p>{e.desc}</p>}
        {e.url && !past && <a href={e.url} target="_blank" rel="noopener noreferrer" className="event-link">{e.linkLabel ?? 'More'} <Icon name="external" size={18} /></a>}
      </div>
      {e.partner === 'right-proper' && !past && <Picture name="right-proper" alt="Right Proper Brewing Company" sizes="160px" className="event-partner" radius={false} />}
    </li>
  );
}

export default function EventsSection() {
  const { upcoming, past } = splitEvents(nowET().ymd);
  return (
    <Section id="events" title="Where to find us" className="events">
      {upcoming.length > 0 ? (
        <ul className="event-list">{upcoming.map(e => <EventRow key={e.id} e={e} />)}</ul>
      ) : (
        <p className="events-empty">No market or pop-up dates on the calendar right now. We post dates on Instagram first — <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">@{SITE.instagram}</a>.</p>
      )}
      {past.length > 0 && (
        <details className="disclosure events-past">
          <summary className="btn btn-secondary"><Icon name="chevronDown" size={22} /> Past dates ({past.length})</summary>
          <ul className="event-list past">{past.map(e => <EventRow key={e.id} e={e} past />)}</ul>
        </details>
      )}
    </Section>
  );
}

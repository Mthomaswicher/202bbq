import { SITE } from '../data/site.js';
import { EVENTS } from '../data/events.js';
import Picture from './ui/Picture.jsx';
import Icon from './ui/Icon.jsx';
import { track } from '../lib/analytics.js';

export default function AboutSection() {
  const battle = EVENTS.find(e => e.id === 'bbq-battle-2026');
  return (
    <section id="about" className="section about" aria-labelledby="about-heading">
      <div className="container">
        <div className="section-head"><h2 id="about-heading" tabIndex={-1}>Built in DC. Smoked with pride.</h2></div>
        <div className="about-grid">
          <div className="about-visual">
            <span className="about-202" aria-hidden="true">202</span>
            <Picture name="pitmaster" alt={`${SITE.owner}, 202BBQ's pitmaster, with his dog in the backyard beside the smokers`} sizes="(min-width: 1024px) 40vw, 100vw" ratio="3 / 4" position="50% 30%" />
          </div>
          <div className="about-text prose">
            <p className="lede">I’m {SITE.owner}. Every week I smoke in small batches over hardwood — no shortcuts, no gas, no fillers.</p>
            <p>202BBQ started with a backyard, a used smoker and an obsession with getting it right. Named for 202, DC’s area code — because this is a Washington thing. {SITE.licence ? `Licensed by ${SITE.licence}.` : 'It’s a fully licensed DC food business.'}</p>
            {battle && <p>In {battle.start.slice(0, 4)} we took part in the {battle.title} on Pennsylvania Avenue.</p>}
            <p>You’ll find me at markets and pop-up stands around the city — dates go up on Instagram first.</p>
            <p className="about-ig">
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('instagram_click', { location: 'about' })}>
                <Icon name="instagram" size={22} /> More on Instagram — @{SITE.instagram}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

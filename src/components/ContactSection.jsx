import { SITE } from '../data/site.js';
import { track } from '../lib/analytics.js';
import { focusHeading } from '../lib/useScrollSpy.js';
import Icon from './ui/Icon.jsx';
import { Section } from './ui/Bits.jsx';

export default function ContactSection() {
  return (
    <Section id="contact" title="Contact" className="contact" grid lede={`Call, text${SITE.email ? ', email' : ''} or follow. ${SITE.owner} picks up.`}>
      <ul className="contact-card">
        <li>
          <Icon name="phone" />
          <div className="contact-links">
            <a href={SITE.phoneHref} className="phone" onClick={() => track('contact', { method: 'phone', location: 'contact' })}>Call {SITE.phone}</a>
            <a href={SITE.smsHref} onClick={() => track('contact', { method: 'sms', location: 'contact' })}>Text {SITE.phone}</a>
            {SITE.callHours && <span className="small muted">{SITE.callHours}</span>}
          </div>
        </li>
        {SITE.email && (
          <li><Icon name="mail" /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        )}
        <li>
          <Icon name="instagram" />
          <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('instagram_click', { location: 'contact' })}>@{SITE.instagram} on Instagram</a>
        </li>
        <li><Icon name="pin" /><span>We serve {SITE.serviceArea}.</span></li>
        <li><Icon name="table" /><a href="#catering" onClick={() => focusHeading('catering')}>Planning an event? Use the event form.</a></li>
      </ul>
    </Section>
  );
}

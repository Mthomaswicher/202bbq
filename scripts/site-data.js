// Builds the JSON-LD blocks and the <noscript> fallback from the data files.
// Runs in Node at build time (vite.config.js) — keep it free of browser APIs.
import { createRequire } from 'node:module';
import { SITE } from '../src/data/site.js';
import { MENU_ITEMS, GROUPS } from '../src/data/menu.js';
import { FAQS } from '../src/data/faqs.js';
import { EVENTS } from '../src/data/events.js';

const require = createRequire(import.meta.url);
const reviews = require('../src/data/reviews.json');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tel = `+1-${SITE.phone}`;
const today = new Date().toISOString().slice(0, 10);

export function siteData() {
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const restaurant = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE.url}#restaurant`,
    name: SITE.name,
    alternateName: ['202 BBQ', '202 Barbecue', '202Barbecue'],
    description: 'DC-born small-batch barbecue catering by the tray. Smoked over hardwood every Friday night for weekend pickup in Northeast DC and delivery across DC, Maryland and Virginia. Oxtail Softballs ship anywhere in the US.',
    slogan: SITE.tagline,
    url: SITE.url,
    logo: `${SITE.url}icon.svg`,
    image: `${SITE.url}og.jpg`,
    telephone: tel,
    ...(SITE.email ? { email: SITE.email } : {}),
    priceRange: '$$',
    servesCuisine: ['Barbecue', 'American', 'Southern'],
    areaServed: [
      { '@type': 'City', name: 'Washington', sameAs: 'https://en.wikipedia.org/wiki/Washington,_D.C.' },
      { '@type': 'State', name: 'Maryland' },
      { '@type': 'State', name: 'Virginia' },
    ],
    address: { '@type': 'PostalAddress', addressLocality: 'Washington', addressRegion: 'DC', addressCountry: 'US' },
    sameAs: [SITE.instagramUrl],
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], description: 'Online order requests open', opens: '00:00', closes: '21:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], description: 'Pickup and delivery', opens: '10:00', closes: '20:00' },
    ],
    hasMenu: {
      '@type': 'Menu',
      name: '202BBQ Tray Menu',
      url: `${SITE.url}#menu`,
      hasMenuSection: GROUPS.map(g => ({
        '@type': 'MenuSection',
        name: g.name,
        hasMenuItem: MENU_ITEMS.filter(i => i.group === g.id).map(i => {
          const full = i.options.find(o => typeof o.price === 'number');
          return {
            '@type': 'MenuItem',
            name: i.name,
            description: i.desc,
            ...(full ? { offers: { '@type': 'Offer', price: full.price.toFixed(2), priceCurrency: 'USD' } } : {}),
          };
        }),
      })),
    },
    ...(avg ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
      review: reviews.map(r => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, datePublished: r.date, reviewBody: r.text, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 } })),
    } : {}),
    acceptsReservations: 'False',
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: ['202 Barbecue', '202Barbecue'],
    url: SITE.url,
    logo: `${SITE.url}icon.svg`,
    sameAs: [SITE.instagramUrl],
    contactPoint: { '@type': 'ContactPoint', telephone: tel, contactType: 'customer service', areaServed: 'US', availableLanguage: ['English'] },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    description: 'DC-born small-batch barbecue catering by the tray, with weekend pickup and delivery across DC, Maryland and Virginia, and Oxtail Softballs shipped nationwide.',
    publisher: { '@id': `${SITE.url}#organization` },
    inLanguage: 'en-US',
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const events = EVENTS.filter(e => e.end >= today).map(e => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    startDate: e.start,
    endDate: e.end,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', streetAddress: e.address, addressLocality: 'Washington', addressRegion: 'DC', addressCountry: 'US' } },
    description: e.desc,
    organizer: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  }));

  const noscript = `<noscript>
    <div style="max-width:720px;margin:2rem auto;padding:1.25rem;font-family:Georgia,serif;line-height:1.6;color:#1E1A16;background:#F4ECE0;font-size:18px;">
      <h1>202BBQ — ${esc(SITE.tagline)}</h1>
      <p>DC-born small-batch barbecue by the tray, smoked every Friday night. A full tray feeds 30–40, a half tray 15–20. Order requests Monday–Thursday; pickup in Northeast DC or delivery across ${esc(SITE.serviceArea)} on Saturday and Sunday.</p>
      <p><strong>Call or text <a href="${SITE.phoneHref}">${esc(SITE.phone)}</a></strong> to order by phone. Instagram: <a href="${SITE.instagramUrl}">@${esc(SITE.instagram)}</a>.</p>
      ${GROUPS.map(g => `<h2>${esc(g.name)}</h2><ul>${MENU_ITEMS.filter(i => i.group === g.id).map(i => `<li>${esc(i.name)} — ${i.options.map(o => o.pricing === 'quote' ? `${esc(o.label)} market price` : o.unit ? `$${o.price} per ${esc(o.unit)}` : `${esc(o.label)} $${o.price}`).join(' · ')}</li>`).join('')}</ul>`).join('')}
      <p><em>Turn on JavaScript to place an order online, or call ${esc(SITE.phone)}.</em></p>
    </div>
  </noscript>`;

  return { jsonLd: [restaurant, organization, website, faq, ...events], noscript };
}

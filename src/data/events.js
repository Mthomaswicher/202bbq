// Popups, markets and competitions.
//
// Add an entry with ISO dates and it archives itself: anything whose `end` is
// before today (Eastern time) moves to "Past popups" automatically. Only
// confirmed dates belong here.

export const EVENTS = [
  {
    id: 'bbq-battle-2026',
    kind: 'Competition',
    title: 'Giant National Capital Barbecue Battle',
    start: '2026-06-27',
    end: '2026-06-28',
    time: null,
    venue: 'Pennsylvania Avenue NW',
    address: 'Washington, DC',
    url: 'https://bbqindc.com/',
    linkLabel: 'About the Battle',
    desc: "Two days of the country's pitmasters on Historic Pennsylvania Avenue. We took part with the 202BBQ tent.",
  },
  {
    id: 'right-proper-2026-06-06',
    kind: 'Popup',
    title: '202BBQ at Right Proper Brewing',
    start: '2026-06-06',
    end: '2026-06-06',
    time: '1–6 pm',
    venue: 'Right Proper Brewing',
    address: '920 Girard St NE, Washington, DC 20017',
    url: 'https://rightproperbrewing.com',
    linkLabel: 'Visit Right Proper',
    desc: 'Smoked meats outside the brewery, 1–6 pm.',
    partner: 'right-proper',
  },
  {
    id: 'right-proper-2026-05-30',
    kind: 'Popup',
    title: '202BBQ at Right Proper Brewing',
    start: '2026-05-30',
    end: '2026-05-30',
    time: '1–6 pm',
    venue: 'Right Proper Brewing',
    address: '920 Girard St NE, Washington, DC 20017',
    url: 'https://rightproperbrewing.com',
    linkLabel: 'Visit Right Proper',
    desc: 'Round two of the collab: craft beer inside, smoked meats outside.',
    partner: 'right-proper',
  },
  {
    id: 'right-proper-2026-05-16',
    kind: 'Popup',
    title: '202BBQ at Right Proper Brewing',
    start: '2026-05-16',
    end: '2026-05-16',
    time: '1–6 pm',
    venue: 'Right Proper Brewing',
    address: '920 Girard St NE, Washington, DC 20017',
    url: 'https://rightproperbrewing.com',
    linkLabel: 'Visit Right Proper',
    desc: 'The first date of the Right Proper collab.',
    partner: 'right-proper',
  },
  {
    id: 'annies-ace-2026-04-26',
    kind: 'Live demo',
    title: "Live-fire demo at Annie's Ace Hardware",
    start: '2026-04-26',
    end: '2026-04-26',
    time: '10 am–2 pm',
    venue: "Annie's Ace Hardware",
    address: '3405 8th St NE, Washington, DC 20017',
    url: 'https://www.instagram.com/202_bbq',
    linkLabel: 'See the recap on Instagram',
    desc: 'Three whole chickens on the Big Green Egg, free samples and a pitmaster Q&A.',
  },
];

// Split by an ISO date string (YYYY-MM-DD, Eastern) computed at render time.
export function splitEvents(todayYmd) {
  const upcoming = EVENTS.filter(e => e.end >= todayYmd).sort((a, b) => a.start.localeCompare(b.start));
  const past = EVENTS.filter(e => e.end < todayYmd).sort((a, b) => b.start.localeCompare(a.start));
  return { upcoming, past };
}

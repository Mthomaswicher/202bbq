// ---- Menu Data ----
export const MENU = {
  beef: [
    {
      id: 'chuck-burnt-ends',
      name: 'Chuck Roast Burnt Ends',
      emoji: '🍖',
      full: 150,
      half: null,
    },
    {
      id: 'brisket-burnt-ends',
      name: 'Brisket Burnt Ends',
      emoji: '🍖',
      full: 200,
      half: null,
    },
    {
      id: 'brisket',
      name: 'Brisket',
      emoji: '🥩',
      full: 235,
      half: null,
    },
    {
      id: 'ox-tails',
      name: 'Ox Tails',
      emoji: '🍲',
      full: 185,
      half: 130,
    },
    {
      id: 'beef-ribs',
      name: 'Beef Ribs',
      emoji: '🦴',
      full: 'MP',
      half: 'MP',
    },
    {
      id: 'smoked-burgers',
      name: 'Smoked Burgers',
      emoji: '🍔',
      full: 130,
      half: 90,
    },
    {
      id: 'ribeyes',
      name: 'Ribeyes',
      emoji: '🥩',
      full: 45,
      half: null,
      unit: 'per steak',
    },
  ],
  pork: [
    {
      id: 'pulled-pork',
      name: 'Pulled Pork',
      emoji: '🐷',
      full: 165,
      half: 100,
    },
    {
      id: 'pork-ribs',
      name: 'Pork Ribs',
      emoji: '🍖',
      full: 150,
      half: 100,
    },
  ],
  chicken: [
    {
      id: 'wings',
      name: 'Wings',
      emoji: '🍗',
      full: 150,
      half: 90,
    },
    {
      id: 'thighs',
      name: 'Thighs',
      emoji: '🍗',
      full: 140,
      half: 90,
    },
    {
      id: 'drumsticks',
      name: 'Drumsticks',
      emoji: '🍗',
      full: 140,
      half: 90,
    },
  ],
  sides: [
    {
      id: 'smoked-salmon',
      name: 'Smoked Salmon',
      emoji: '🐟',
      full: 330,
      half: 200,
    },
    {
      id: 'half-smokes',
      name: 'Half Smokes',
      emoji: '🌭',
      full: 130,
      half: 90,
    },
    {
      id: 'half-smoke-burnt-ends',
      name: 'Half Smoke Burnt Ends',
      emoji: '🌭',
      full: 135,
      half: 90,
    },
    {
      id: 'lamb-chops',
      name: 'Lamb Chops',
      emoji: '🍖',
      full: 'MP',
      half: 'MP',
    },
    {
      id: 'collard-greens',
      name: 'Collard Greens',
      emoji: '🥬',
      full: 150,
      half: 125,
    },
    {
      id: 'mac-cheese',
      name: 'Mac and Cheese',
      emoji: '🧀',
      full: 175,
      half: 145,
    },
    {
      id: 'mashed-potatoes',
      name: 'Mashed Potatoes',
      emoji: '🥔',
      full: 130,
      half: 100,
    },
    {
      id: 'kickin-coleslaw',
      name: "Kickin' Coleslaw",
      emoji: '🥗',
      full: 120,
      half: 85,
    },
    {
      id: 'seafood-salad',
      name: 'Seafood Salad',
      emoji: '🦐',
      full: 250,
      half: null,
    },
  ],
};

export const MENU_CATEGORIES = [
  { key: 'beef',    label: 'Beef' },
  { key: 'pork',    label: 'Pork' },
  { key: 'chicken', label: 'Chicken' },
  { key: 'sides',   label: 'Sides & More' },
];

// Events: only include confirmed real events. Add entries here when dates/locations are confirmed.
export const EVENTS = [
  {
    id: 'bbq-battle',
    badge: 'Competition',
    badgeClass: 'badge--gold',
    title: '34th Annual Giant BBQ Battle',
    date: 'June 27–28, 2026',
    location: 'Pennsylvania Ave NW (3rd–7th St), Washington, D.C.',
    desc: "We're competing at DC's biggest BBQ event — the 34th Annual Giant BBQ Battle on Historic Pennsylvania Avenue. Two days, the country's best pitmasters, 100+ food samples, live music, and three stages of entertainment. Come find the 202BBQ tent and show your support.",
    featured: true,
    cta: 'https://bbqindc.com/',
  },
];

export const TESTIMONIALS = [
  {
    quote: "Matt catered our grand opening for 70+ guests and it was an absolute hit. Guests raved about the brisket and coleslaw — many went back for seconds. 100% recommend for catering!",
    author: 'Jerod L.',
    location: 'Washington, DC',
    stars: 5,
  },
  {
    quote: "THE best barbecue you will ever have in DC. The brisket, ribs, and smoked meats rival the best BBQ spots from Kansas City or Austin.",
    author: 'Beau W.',
    location: 'Washington, DC',
    stars: 5,
  },
  {
    quote: "Ordered the smoked salmon and it was moist and delicious.",
    author: 'Ashley C.',
    location: 'Washington, DC',
    stars: 5,
  },
  {
    quote: "Matt puts his heart and soul into producing the most amazing smoked meats! Brisket, smoked pork butt, and chicken legs are my faves. Highly recommend!",
    author: 'Stevan S.',
    location: 'Washington, DC',
    stars: 4,
  },
  {
    quote: "I ordered an entire 17lb brisket and it was literally the most juicy and tender brisket I have ever had in my life! Highly recommend!",
    author: 'Sam F.',
    location: 'Washington, DC',
    stars: 5,
  },
];

export const FAQS = [
  {
    q: "When can I place an order?",
    a: "Orders are open Monday through Thursday each week. Everything is smoked fresh overnight Friday so your order is ready Saturday and Sunday. We close the order window Thursday night — no exceptions, so plan ahead!",
  },
  {
    q: "What's the difference between a Full Tray and Half Tray?",
    a: "A Full Tray feeds approximately 30–40 people. A Half Tray feeds 15–20. Perfect for everything from house parties to office events. If you're unsure about quantity, call us — we're happy to help you plan.",
  },
  {
    q: "Do you deliver, or is it pickup only?",
    a: "Both! We offer pickup (address confirmed on your order confirmation) and delivery throughout the DMV area. A delivery fee may apply depending on your location. Select your preference on the order form.",
  },
  {
    q: "What does 'Market Price' mean?",
    a: "Some items like Beef Ribs and Lamb Chops are priced at market because the cost fluctuates weekly based on what we source. After you submit your order request, we'll call or email you with the exact price before finalizing anything.",
  },
  {
    q: "Is my order confirmed when I submit the form?",
    a: "Not quite — the form sends us a request, and we'll personally confirm your order within a few hours. You're not locked in until you hear from us. We'll also confirm pickup/delivery details and any market-price totals at that time.",
  },
  {
    q: "Can I find you anywhere besides ordering online?",
    a: "Yes! Beyond weekend orders, we do popups and farmers markets around DC. We're also competing in the 34th Annual Giant BBQ Battle on June 27–28, 2026 on Historic Pennsylvania Avenue NW. Come find us there. Follow @202_bbq on Instagram for all live location announcements.",
  },
];

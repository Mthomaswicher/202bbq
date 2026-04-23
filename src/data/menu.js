// ---- Menu Data ----
export const MENU = {
  beef: [
    {
      id: 'chuck-burnt-ends',
      name: 'Chuck Roast Burnt Ends',
      emoji: '🍖',
      desc: 'Chuck roast smoked to melt-in-your-mouth perfection, cut into burnt end cubes and finished in our house sauce.',
      full: 150,
      half: null,
    },
    {
      id: 'brisket-burnt-ends',
      name: 'Brisket Burnt Ends',
      emoji: '🍖',
      desc: 'Whole brisket smoked overnight, then cut into caramelized burnt end cubes and finished in house sauce. Rich, smoky, and impossible to stop eating.',
      full: 200,
      half: null,
    },
    {
      id: 'brisket',
      name: 'Brisket',
      emoji: '🥩',
      desc: '17–18 lb whole brisket smoked overnight over hardwood. Bark for days. Sliced or chopped to order.',
      full: 235,
      half: null,
    },
    {
      id: 'ox-tails',
      name: 'Ox Tails',
      emoji: '🍲',
      desc: 'Slow-smoked then braised until fall-off-the-bone tender. A DC classic, done the 202 way.',
      full: 185,
      half: 130,
    },
    {
      id: 'beef-ribs',
      name: 'Beef Ribs',
      emoji: '🦴',
      desc: 'Dinosaur-sized beef short ribs smoked over oak for 10+ hours. Pricing varies by market — call to quote.',
      full: 'MP',
      half: 'MP',
    },
    {
      id: 'smoked-burgers',
      name: 'Smoked Burgers',
      emoji: '🍔',
      desc: 'Hand-pressed beef patties smoked low and slow before a hot finish. Served with all the fixings.',
      full: 130,
      half: 90,
    },
    {
      id: 'ribeyes',
      name: 'Ribeyes',
      emoji: '🥩',
      desc: 'Thick-cut ribeyes seasoned with our Hill Rub and smoked to a perfect medium-rare finish.',
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
      desc: 'Bone-in pork shoulder smoked for 14+ hours until it pulls apart with two fingers. Served with house vinegar sauce.',
      full: 165,
      half: 100,
    },
    {
      id: 'pork-ribs',
      name: 'Pork Ribs',
      emoji: '🍖',
      desc: 'St. Louis spare ribs rubbed and smoked until they hit that perfect bend test. Glazed to order.',
      full: 150,
      half: 100,
    },
  ],
  chicken: [
    {
      id: 'wings',
      name: 'Wings',
      emoji: '🍗',
      desc: 'Whole wings seasoned with our Hill Rub and smoked until the skin crisps up and the meat stays juicy.',
      full: 150,
      half: 90,
    },
    {
      id: 'thighs',
      name: 'Thighs',
      emoji: '🍗',
      desc: 'Bone-in, skin-on chicken thighs smoked low and slow. Consistently the most-requested cut we make.',
      full: 140,
      half: 90,
    },
    {
      id: 'drumsticks',
      name: 'Drumsticks',
      emoji: '🍗',
      desc: 'Smoked drumsticks with a crispy seasoned skin. Great for crowds — finger food done right.',
      full: 140,
      half: 90,
    },
  ],
  sides: [
    {
      id: 'smoked-salmon',
      name: 'Smoked Salmon',
      emoji: '🐟',
      desc: 'Atlantic salmon cold-smoked over cherry wood. Silky, rich, and impossible not to double-dip.',
      full: 330,
      half: 200,
    },
    {
      id: 'half-smokes',
      name: 'Half Smokes',
      emoji: '🌭',
      desc: "DC's own. Beef and pork half-smoke sausages smoked until the casing snaps. A Capitol Hill tradition.",
      full: 130,
      half: 90,
    },
    {
      id: 'half-smoke-burnt-ends',
      name: 'Half Smoke Burnt Ends',
      emoji: '🌭',
      desc: 'Half smokes re-cut into burnt end bites and finished low and slow in our smoky glaze. A 202 original.',
      full: 135,
      half: 90,
    },
    {
      id: 'lamb-chops',
      name: 'Lamb Chops',
      emoji: '🍖',
      desc: 'Frenched lamb chops (rack of 8 bones) seasoned with herbs and smoked. Priced at market — contact us for availability and quote.',
      full: 'MP',
      half: 'MP',
    },
    {
      id: 'collard-greens',
      name: 'Collard Greens',
      emoji: '🥬',
      desc: 'Slow-braised Southern-style collard greens with smoked turkey neck, apple cider vinegar, and brown sugar.',
      full: 150,
      half: 125,
    },
    {
      id: 'mac-cheese',
      name: 'Mac and Cheese',
      emoji: '🧀',
      desc: 'Three-cheese baked mac topped with smoked brisket bits and a golden breadcrumb crust.',
      full: 175,
      half: 145,
    },
    {
      id: 'mashed-potatoes',
      name: 'Mashed Potatoes',
      emoji: '🥔',
      desc: 'Buttery, creamy mashed potatoes made with real butter and cream. Simple, perfect, crowd-pleasing.',
      full: 130,
      half: 100,
    },
    {
      id: 'kickin-coleslaw',
      name: "Kickin' Coleslaw",
      emoji: '🥗',
      desc: 'Creamy vinegar slaw with jalapeño, celery seed, and a kick of heat. The essential BBQ counterpart.',
      full: 120,
      half: 85,
    },
    {
      id: 'seafood-salad',
      name: 'Seafood Salad',
      emoji: '🦐',
      desc: 'Fresh mixed seafood salad — shrimp, crab, and more — tossed in a light, herbed dressing.',
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
    id: 'annies-ace-demo',
    badge: 'Live Demo',
    badgeClass: 'badge--ember',
    title: "Live Fire Demo at Annie's Ace Hardware",
    date: 'Sunday, April 26, 2026 · 10am–2pm',
    location: "Annie's Ace Hardware · 3405 8th St NE, Washington, DC 20017",
    desc: "Come watch us fire up the Big Green Egg and smoke three whole chickens — free samples for everyone who stops by. Talk pitmaster shop, pick up tips for your own setup, and meet the 202BBQ team in person.",
    featured: true,
    cta: 'https://www.instagram.com/202_bbq',
  },
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

// The tray menu.
//
// Each item has one or more `options` (a size or unit). An option that does not
// exist is simply absent — never "N/A". `pricing: 'quote'` marks market-price
// items: they can be added, are excluded from the subtotal, and are quoted by
// Matt before anything is confirmed. `feeds` is [low, high] people.
//
// `image` is a key in ./images.json, or null when nothing has been shot yet.

const FULL = (price, extra = {}) => ({ id: 'full', label: 'Full tray', feeds: [30, 40], price, ...extra });
const HALF = (price, extra = {}) => ({ id: 'half', label: 'Half tray', feeds: [15, 20], price, ...extra });
const QUOTE = { pricing: 'quote', price: null };

export const GROUPS = [
  { id: 'beef',    short: 'Beef',    name: 'Beef' },
  { id: 'pork',    short: 'Pork',    name: 'Pork & Sausage', blurb: 'Including DC’s own half-smokes.' },
  { id: 'chicken', short: 'Chicken', name: 'Chicken', blurb: 'Seasoned with our Hill Rub, the house spice blend.' },
  { id: 'seafood', short: 'Seafood', name: 'Seafood & Lamb', blurb: 'Salmon cold-smoked over cherry wood; lamb at market price.' },
  { id: 'sides',   short: 'Sides',   name: 'Sides', blurb: 'Made from scratch. The mac and cheese has brisket in it.' },
];

export const MENU_ITEMS = [
  // ---- Beef ----
  { id: 'brisket', group: 'beef', name: 'Brisket', image: 'brisket-slice',
    desc: 'A whole 17–18 lb brisket smoked overnight over hardwood. A dark, peppery crust. Sliced or chopped to order.',
    tags: ['Signature'], allergens: [],
    options: [FULL(235)] },
  { id: 'brisket-burnt-ends', group: 'beef', name: 'Brisket Burnt Ends', image: null,
    desc: 'Whole brisket smoked overnight, cut into caramelized cubes and finished in our house sauce.',
    tags: [], allergens: [],
    options: [FULL(200)] },
  { id: 'chuck-burnt-ends', group: 'beef', name: 'Chuck Roast Burnt Ends', image: null,
    desc: 'Chuck roast smoked until tender, cubed, and finished in our house sauce.',
    tags: [], allergens: [],
    options: [FULL(150)] },
  { id: 'ox-tails', group: 'beef', name: 'Ox Tails', image: null,
    desc: 'Slow-smoked, then braised until they fall off the bone. A DC classic, done the 202 way.',
    tags: ['DC classic'], allergens: [],
    options: [FULL(185), HALF(130)] },
  { id: 'beef-ribs', group: 'beef', name: 'Beef Ribs', image: null,
    desc: 'Dinosaur-sized beef short ribs smoked over oak for 10+ hours.',
    tags: [], allergens: [],
    options: [FULL(null, QUOTE), HALF(null, QUOTE)] },
  { id: 'smoked-burgers', group: 'beef', name: 'Smoked Burgers', image: null,
    desc: 'Hand-pressed patties smoked low and slow, then finished hot. Served with all the fixings.',
    tags: [], allergens: ['wheat'],
    options: [FULL(130), HALF(90)] },
  { id: 'ribeyes', group: 'beef', name: 'Ribeyes', image: null,
    desc: 'Thick-cut ribeyes seasoned with our Hill Rub and smoked to medium-rare.',
    tags: [], allergens: [],
    options: [{ id: 'each', label: 'Per steak', unit: 'steak', feeds: [1, 1], price: 45, minQty: 6 }] },

  // ---- Pork & Sausage ----
  { id: 'pulled-pork', group: 'pork', name: 'Pulled Pork', image: 'pork-butt',
    desc: 'Bone-in pork shoulder smoked 14+ hours until it pulls apart with two fingers. Served with house vinegar sauce.',
    tags: ['Signature'], allergens: [],
    options: [FULL(165), HALF(100)] },
  { id: 'pork-ribs', group: 'pork', name: 'Pork Ribs', image: null,
    desc: 'St. Louis spare ribs, rubbed and smoked until they bend and the meat pulls clean from the bone. Glazed to order.',
    tags: [], allergens: [],
    options: [FULL(150), HALF(100)] },
  { id: 'half-smokes', group: 'pork', name: 'Half Smokes', image: null,
    desc: 'DC’s own beef-and-pork sausages, smoked until the casing snaps. A DC tradition.',
    tags: ['DC classic'], allergens: [],
    options: [FULL(130), HALF(90)] },
  { id: 'half-smoke-burnt-ends', group: 'pork', name: 'Half Smoke Burnt Ends', image: null,
    desc: 'Half smokes cut into bite-size ends and finished low and slow in our smoky glaze. A 202 original.',
    tags: [], allergens: [],
    options: [FULL(135), HALF(90)] },

  // ---- Chicken ----
  { id: 'thighs', group: 'chicken', name: 'Thighs', image: 'chicken-egg',
    desc: 'Bone-in, skin-on thighs smoked low and slow. The cut people ask for most.',
    tags: ['Most requested'], allergens: [],
    options: [FULL(140), HALF(90)] },
  { id: 'wings', group: 'chicken', name: 'Wings', image: null,
    desc: 'Whole wings seasoned with our Hill Rub and smoked until the skin crisps and the meat stays juicy.',
    tags: [], allergens: [],
    options: [FULL(150), HALF(90)] },
  { id: 'drumsticks', group: 'chicken', name: 'Drumsticks', image: null,
    desc: 'Smoked drumsticks with crisp, seasoned skin. Finger food for a crowd.',
    tags: [], allergens: [],
    options: [FULL(140), HALF(90)] },

  // ---- Seafood & Lamb ----
  { id: 'smoked-salmon', group: 'seafood', name: 'Smoked Salmon', image: null,
    desc: 'Atlantic salmon cold-smoked over cherry wood. Silky and rich.',
    tags: [], allergens: ['fish'],
    options: [FULL(330), HALF(200)] },
  { id: 'seafood-salad', group: 'seafood', name: 'Seafood Salad', image: null,
    desc: 'Shrimp, crab and mixed seafood tossed in a light herbed dressing.',
    tags: [], allergens: ['shellfish'],
    options: [FULL(250)] },
  { id: 'lamb-chops', group: 'seafood', name: 'Lamb Chops', image: null,
    desc: 'A rack of 8 lamb chops, bones trimmed clean, seasoned with herbs and smoked.',
    tags: [], allergens: [],
    options: [FULL(null, QUOTE), HALF(null, QUOTE)] },

  // ---- Sides ----
  { id: 'mac-cheese', group: 'sides', name: 'Mac and Cheese', image: null,
    desc: 'Three-cheese baked mac topped with smoked brisket bits and a golden breadcrumb crust.',
    tags: [], allergens: ['dairy', 'wheat'], contains: 'brisket',
    options: [FULL(175), HALF(145)] },
  { id: 'collard-greens', group: 'sides', name: 'Collard Greens', image: null,
    desc: 'Slow-braised Southern collards with smoked turkey neck, cider vinegar and brown sugar.',
    tags: [], allergens: [], contains: 'smoked turkey',
    options: [FULL(150), HALF(125)] },
  { id: 'mashed-potatoes', group: 'sides', name: 'Mashed Potatoes', image: null,
    desc: 'Buttery, creamy mashed potatoes made with real butter and cream.',
    tags: [], allergens: ['dairy'],
    options: [FULL(130), HALF(100)] },
  { id: 'kickin-coleslaw', group: 'sides', name: 'Kickin’ Coleslaw', image: null,
    desc: 'Creamy vinegar slaw with jalapeño and celery seed. A little heat.',
    tags: [], allergens: ['egg'],
    options: [FULL(120), HALF(85)] },
];

export const TRAY_KEY = [
  { id: 'full', label: 'Full tray', feeds: [30, 40] },
  { id: 'half', label: 'Half tray', feeds: [15, 20] },
];

// ---- lookups ----
const byId = new Map(MENU_ITEMS.map(i => [i.id, i]));
export const getItem = id => byId.get(id) ?? null;
export const getOption = (itemId, optionId) => getItem(itemId)?.options.find(o => o.id === optionId) ?? null;
export const itemsInGroup = groupId => MENU_ITEMS.filter(i => i.group === groupId);

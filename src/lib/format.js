// Money, headcount and per-person helpers. Prices are whole dollars.

export const money = n => (typeof n === 'number' ? `$${n.toLocaleString('en-US')}` : '');

/** "$330", or "Market price" when every line is a quote item. */
export const subtotalLabel = s => (s.subtotal === 0 && s.hasQuote ? 'Market price' : money(s.subtotal));

/** "feeds 30–40" */
export const feedsRange = ([lo, hi]) => (lo === hi ? `feeds ${lo}` : `feeds ${lo}–${hi}`);

/** "about $6–8 a person" (price / high … price / low), or null for quote / per-unit options. */
export function perPerson(option) {
  if (option.pricing === 'quote' || typeof option.price !== 'number') return null;
  if (option.unit) return `1 ${option.unit} per person`;
  const [lo, hi] = option.feeds;
  const a = Math.round(option.price / hi);
  const b = Math.round(option.price / lo);
  return a === b ? `about $${a} a person` : `about $${a}–${b} a person`;
}

/** "Full tray (feeds 30–40)" */
export const optionSummary = option =>
  option.unit ? `per ${option.unit}` : `${option.label} (${feedsRange(option.feeds)})`;

/**
 * Sum a list of cart lines: { subtotal, feedsLo, feedsHi, trays, units, unitLabel, hasQuote }.
 * Per-unit lines (steaks) are counted separately and excluded from the feeds range.
 */
export function summarise(lines) {
  let subtotal = 0, feedsLo = 0, feedsHi = 0, trays = 0, units = 0, unitLabel = '', hasQuote = false;
  for (const { option, qty } of lines) {
    if (option.pricing === 'quote') { hasQuote = true; trays += qty; continue; }
    if (option.unit) { units += qty; unitLabel = option.unit; subtotal += option.price * qty; continue; }
    trays += qty;
    subtotal += option.price * qty;
    feedsLo += option.feeds[0] * qty;
    feedsHi += option.feeds[1] * qty;
  }
  return { subtotal, feedsLo, feedsHi, trays, units, unitLabel, hasQuote };
}

/** "2 trays · feeds 45–60" / "1 tray · feeds 30–40" / "6 steaks" / "2 trays + 6 steaks" */
export function countLabel(sum) {
  const parts = [];
  if (sum.trays) parts.push(`${sum.trays} ${sum.trays === 1 ? 'tray' : 'trays'}`);
  if (sum.units) parts.push(`${sum.units} ${sum.units === 1 ? sum.unitLabel : sum.unitLabel + 's'}`);
  return parts.join(' + ');
}
export function feedsLabel(sum) {
  if (!sum.feedsHi) return '';
  return `feeds ${sum.feedsLo}–${sum.feedsHi}`;
}

export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/** Digits grouped for mail clients' phone detectors: "202 555 0100". */
export function groupPhone(raw) {
  const d = String(raw).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : String(raw).trim();
}
export const phoneDigits = raw => String(raw).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

/** "m…@gmail.com" */
export function maskEmail(email) {
  const [user, domain] = String(email).split('@');
  if (!domain) return email;
  return `${user.slice(0, 1)}…@${domain}`;
}

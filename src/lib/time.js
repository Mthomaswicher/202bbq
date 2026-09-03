// Everything time-bound on the site is computed here, in Eastern time, from the
// same clock — so the status line, the date cards and the email subject can
// never disagree. Never use `new Date().getDay()` for business logic.

import { SITE } from '../data/site.js';

const TZ = SITE.cutoff.tz;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const partsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

/** Current wall-clock in Eastern time: { dow 0–6, minutes since midnight, ymd }. */
export function nowET(d = new Date()) {
  const p = Object.fromEntries(partsFmt.formatToParts(d).map(x => [x.type, x.value]));
  return {
    dow: DOW.indexOf(p.weekday),
    minutes: (Number(p.hour) % 24) * 60 + Number(p.minute),
    ymd: `${p.year}-${p.month}-${p.day}`,
  };
}

/** Add days to a YYYY-MM-DD string (calendar arithmetic, timezone-free). */
export function addDays(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d + n);
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function dowOf(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Sat Sep 5" */
export function fmtShort(ymd) {
  const [, m, d] = ymd.split('-').map(Number);
  return `${DOW[dowOf(ymd)]} ${MONTHS[m - 1]} ${d}`;
}
/** "Saturday, Sep 5" */
export function fmtLong(ymd) {
  const [, m, d] = ymd.split('-').map(Number);
  return `${DAYS_LONG[dowOf(ymd)]}, ${MONTHS[m - 1]} ${d}`;
}
/** "Saturday, Sep 5, 2026" */
export function fmtFull(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${DAYS_LONG[dowOf(ymd)]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

function minutesLabel(minutes) {
  const h24 = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? 'am' : 'pm';
  return mm ? `${h12}:${String(mm).padStart(2, '0')} ${ampm}` : `${h12} ${ampm}`;
}

function inAnnouncement(now) {
  const a = SITE.announcement;
  if (!a || !a.from || !a.to) return null;
  return now.ymd >= a.from && now.ymd <= a.to ? a : null;
}

/**
 * The order window for "now": which weekend the request is for, whether the
 * cut-off has passed, and the sentence the status line prints.
 *
 * Six branches (Eastern time):
 *   Mon–Wed any           → open for this Sat/Sun
 *   Thu  00:00–17:59      → open for this Sat/Sun
 *   Thu  18:00–cut-off    → closing tonight
 *   Thu  after cut-off    → closed; next weekend (LATE)
 *   Fri  any              → next weekend, smoking now
 *   Sat–Sun any           → next weekend
 */
export function orderWindow(now = nowET()) {
  const cutoffMinutes = SITE.cutoff.minutes;
  const cutoffLabel = minutesLabel(cutoffMinutes);
  const announcement = inAnnouncement(now);

  // Next Saturday strictly after `now.ymd` (if today is Saturday, that's today's week only if before... we treat Sat/Sun as "next weekend").
  const daysToSat = (6 - now.dow + 7) % 7 || 7; // 1..7, never 0
  let sat = addDays(now.ymd, daysToSat);
  let late = false;
  let state = 'open';

  if (now.dow === SITE.cutoff.dow && now.minutes >= cutoffMinutes) { state = 'closed-late'; late = true; sat = addDays(sat, 7); }
  else if (now.dow === SITE.cutoff.dow && now.minutes >= 18 * 60) state = 'closing';
  else if (now.dow === 5) { state = 'smoking'; }            // Friday: daysToSat already = 1 → this Sat is tomorrow's smoke → next weekend
  else if (now.dow === 6 || now.dow === 0) { state = 'weekend'; }

  // On Friday the trays being smoked tonight are for tomorrow; new requests are for next weekend.
  if (now.dow === 5) sat = addDays(sat, 7);
  // On Saturday, daysToSat = 7 → next Saturday (correct). On Sunday, daysToSat = 6 → next Saturday (correct).

  const sun = addDays(sat, 1);
  const thu = addDays(sat, -2);
  const dates = [
    { ymd: sat, short: fmtShort(sat), long: fmtLong(sat), full: fmtFull(sat) },
    { ymd: sun, short: fmtShort(sun), long: fmtLong(sun), full: fmtFull(sun) },
  ];
  const pair = `${dates[0].short} · ${dates[1].short}`;

  let sentence;
  switch (state) {
    case 'closing':     sentence = `Ordering closes tonight at ${cutoffLabel} for ${pair}`; break;
    case 'closed-late': sentence = `This weekend’s requests closed at ${cutoffLabel}. Taking requests for next weekend, ${pair}`; break;
    case 'smoking':     sentence = `Taking requests for next weekend, ${pair} — this weekend’s trays are spoken for`; break;
    case 'weekend':     sentence = `Taking requests for next weekend, ${pair} — closes Thu ${cutoffLabel}`; break;
    default:            sentence = `Ordering open for ${pair} — closes Thu ${cutoffLabel}`;
  }

  let result = {
    state, late, dates, pair, cutoffLabel, cutoffYmd: thu,
    cutoffFull: `Thu ${MONTHS[Number(thu.split('-')[1]) - 1]} ${Number(thu.split('-')[2])}, ${cutoffLabel} ET`,
    sentence, nextWeekend: state !== 'open' && state !== 'closing', closed: false, holiday: false,
  };

  if (announcement) {
    result = {
      ...result,
      holiday: true,
      closed: Boolean(announcement.closed),
      sentence: announcement.text || result.sentence,
      dates: announcement.dates?.length
        ? announcement.dates.map(d => ({ ymd: d.ymd, short: d.label, long: d.label, full: d.label }))
        : result.dates,
      cutoffFull: announcement.cutoff ? `${fmtShort(announcement.cutoff.ymd)}, ${minutesLabel(announcement.cutoff.minutes)} ET` : result.cutoffFull,
    };
  }
  return result;
}

/** Does the visitor's device sit outside Eastern time? Then we say "ET" more often. */
export function visitorOutsideET() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone !== TZ; } catch { return false; }
}

const stampFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
function stampParts(d) {
  const p = Object.fromEntries(stampFmt.formatToParts(d).map(x => [x.type, x.value]));
  return { ...p, ampm: String(p.dayPeriod || '').toLowerCase() };
}
/** "Thu Sep 3, 4:26 pm ET" — the on-screen style (no year, lower-case meridian). */
export function stampET(d = new Date()) {
  const p = stampParts(d);
  return `${p.weekday} ${p.month} ${p.day}, ${p.hour}:${p.minute} ${p.ampm} ET`;
}
/** "Thu Sep 3, 2026, 4:26 pm ET" — for the email. */
export function stampETFull(d = new Date()) {
  const p = stampParts(d);
  return `${p.weekday} ${p.month} ${p.day}, ${p.year}, ${p.hour}:${p.minute} ${p.ampm} ET`;
}

/** Request reference: 202-YYMMDD-XXXX, date part in ET, charset [A-Z0-9-] only (Stripe drops anything else). */
export function makeRef(now = nowET()) {
  const [y, m, d] = now.ymd.split('-');
  let rand = '';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 4; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `202-${y.slice(2)}${m}${d}-${rand}`;
}
export const REF_PATTERN = /^202-\d{6}-[A-Z0-9]{4}$/;

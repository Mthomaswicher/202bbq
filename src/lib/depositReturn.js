// The Stripe deposit handoff.
//
// The Payment Link is configured (in the Stripe dashboard) to redirect to
//   https://202barbecue.com/?deposit=paid&session_id={CHECKOUT_SESSION_ID}
// Stripe appends the utm_* codes we put on the outgoing link, so the order
// reference rides back in `utm_content`. Nothing here can verify a payment
// (that needs a server); the screen it produces is display-only, and Stripe's
// own receipt + dashboard are the source of truth.

import { SITE } from '../data/site.js';
import { REF_PATTERN } from './time.js';
import { local, session, KEYS, WEEK } from './storage.js';

export function buildDepositUrl(ref, email) {
  if (!SITE.stripeDepositUrl) return null;
  const u = new URL(SITE.stripeDepositUrl);
  u.searchParams.set('client_reference_id', ref);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) u.searchParams.set('prefilled_email', email);
  u.searchParams.set('utm_source', '202barbecue.com');
  u.searchParams.set('utm_medium', 'deposit');
  u.searchParams.set('utm_content', ref);
  return u.toString();
}

/** Read `?deposit=paid…` once, strip it from the URL, return { ref, sessionId } or null. */
export function readDepositReturn() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  if (q.get('deposit') !== 'paid') return null;
  const utm = q.get('utm_content') || '';
  const ref = REF_PATTERN.test(utm) ? utm : null;
  try { window.history.replaceState(null, '', window.location.pathname + '#order'); } catch { /* ignore */ }
  return { ref, sessionId: q.get('session_id') || null };
}

export function saveRequest(req) {
  session.set(KEYS.request, req);
  local.set(KEYS.lastRequest, req);
}

export function clearRequest() {
  session.remove(KEYS.request);
  local.remove(KEYS.lastRequest);
}

/** sessionStorage first (same tab), then localStorage (reopened within 7 days). */
export function loadRequest(ref = null) {
  for (const store of [session, local]) {
    const r = store.get(KEYS.request) || store.get(KEYS.lastRequest);
    if (r && r.ref && (!ref || r.ref === ref) && Date.now() - (r.submittedAt || 0) < WEEK) return r;
  }
  return null;
}

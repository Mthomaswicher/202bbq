// Shared Formspree helpers.
//
// Endpoints are injected at build time from GitHub Secrets (see
// .github/workflows/deploy.yml) and resolved in data/site.js. If one is
// missing we FAIL LOUDLY: a form that quietly shows a success screen and drops
// the submission loses real orders without anyone noticing.

import { SITE } from '../data/site.js';

export const NOT_CONFIGURED_MESSAGE =
  `We couldn't send this from the site. Call or text ${SITE.phone} and we'll take it by phone.`;
export const FAILED_MESSAGE =
  `We couldn't send this. Try again, or call ${SITE.phone} and we'll take it by phone.`;

/**
 * POST the payload as JSON with a 12-second timeout. Never throws.
 * Returns { ok } or { ok:false, error, notConfigured?, network?, timeout? }.
 */
export async function submitToFormspree(endpoint, payload, { timeoutMs = 12000 } = {}) {
  if (!endpoint) {
    console.error('202BBQ: no Formspree endpoint configured; submission not sent.', payload);
    return { ok: false, notConfigured: true, error: NOT_CONFIGURED_MESSAGE };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = data?.error || data?.errors?.[0]?.message;
      return { ok: false, error: detail ? `${detail}. ${FAILED_MESSAGE}` : FAILED_MESSAGE };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, network: true, timeout: err?.name === 'AbortError', error: FAILED_MESSAGE };
  } finally {
    clearTimeout(timer);
  }
}

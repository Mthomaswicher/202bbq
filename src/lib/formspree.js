// Shared Formspree helpers.
//
// Endpoints are injected at build time from GitHub Secrets (see
// .github/workflows/deploy.yml). If a secret is missing, Vite inlines
// `undefined` and the form has nowhere to send to. When that happens we must
// FAIL LOUDLY: a form that quietly shows a success screen and drops the
// submission loses real orders without anyone noticing.

const PLACEHOLDERS = ['REPLACE_ME', 'YOUR_', 'undefined', 'null'];

const clean = raw => String(raw ?? '').replace(/^<|>$/g, '').trim();

const isUsable = value =>
  Boolean(value) && !PLACEHOLDERS.some(p => value.includes(p));

// Returns the first usable endpoint from the candidates, or '' if none is
// configured. Later candidates act as fallbacks so a single missing secret
// degrades to another inbox instead of silently discarding the submission.
export function resolveEndpoint(...candidates) {
  for (const candidate of candidates) {
    const value = clean(candidate);
    if (isUsable(value)) return value;
  }
  return '';
}

export const FALLBACK_PHONE = '202-734-5621';

export const NOT_CONFIGURED_MESSAGE =
  `We couldn't send that from the site. Please call or text ${FALLBACK_PHONE} so we don't miss your request.`;

// POSTs the payload and reports the outcome. Never throws.
export async function submitToFormspree(endpoint, payload) {
  if (!endpoint) {
    console.error('202BBQ: no Formspree endpoint configured; submission not sent.', payload);
    return { ok: false, notConfigured: true, error: NOT_CONFIGURED_MESSAGE };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = data?.error || data?.errors?.[0]?.message;
      return {
        ok: false,
        error: detail || `Submit failed. Please try again or call ${FALLBACK_PHONE} to reach us directly.`,
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      network: true,
      error: `Couldn't reach our server — an ad blocker or your connection may be blocking it. Try again, or call/text ${FALLBACK_PHONE}.`,
    };
  }
}

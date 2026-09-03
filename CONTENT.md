# Keeping 202barbecue.com up to date

Everything time-bound on the site is computed, and every business fact lives in one
file, so nothing goes stale between edits. A push to `main` rebuilds and redeploys
(GitHub Actions → GitHub Pages) in about a minute.

## What you edit, and where

| You want to… | Edit | Notes |
|---|---|---|
| Change a price, description, add or hide a dish | `src/data/menu.js` | Each item has `options` (Full tray / Half tray / Per steak). Delete an option to hide it — never write "N/A". `pricing: 'quote'` = market price. Set `available: false` to hide an item temporarily. |
| Add a popup, market or competition | `src/data/events.js` | Add an entry with ISO `start`/`end` dates. It shows under "Where to find us" until the `end` date passes, then moves to "Past popups" by itself. Only confirmed dates belong here. |
| Change the phone, email, pickup area, delivery fee, cut-off, deposit, Cash App/Venmo/Zelle handles, licence name, call hours | `src/data/site.js` | A `null` value hides the sentence that would have used it — the site never shows a placeholder. Fill in a value and the sentence appears. |
| Holiday week (different cut-off or pickup day) | `src/data/site.js` → `announcement` | Set `from`/`to` dates, the sentence to show, and optionally a one-off `cutoff` and `dates`. It replaces the weekly rule only while today is inside the range. |
| Oxtail Softballs facts (ship days, transit, weight) or prices/links | `src/data/products.js` | Each fact renders only once it is filled in. |
| Add or edit a customer review | `src/data/reviews.json` | Newest first is automatic (sorted by `date`). The 4.8 ★ average and the review count update themselves, on the page and in the structured data. |
| Add or edit a question in "Questions" | `src/data/faqs.js` | Also regenerates the FAQ structured data. |
| Replace or add a photo | put the original in `assets/photos/`, add a line to `scripts/optimize-images.mjs`, run `npm run images` | Produces AVIF/WebP/JPEG renditions in `public/img/` and updates `src/data/images.json`. Then reference the key from `menu.js` (`image: 'key'`). Originals in `assets/` are never served. |

Suggested cadence: a monthly glance at `events.js` and `menu.js`. The order window,
weekend dates, "today" in the week strip and the events list all compute themselves.

## Secrets (GitHub → Settings → Secrets → Actions)

The forms and the deposit button are wired at build time from these secrets. If one is
missing, that form shows a clear "call us" error instead of pretending to send.

| Secret | Used by |
|---|---|
| `VITE_FORMSPREE_ORDERS` | Order requests (`#order`) |
| `VITE_FORMSPREE_CATERING` | Event requests (`#catering`) — falls back to `VITE_FORMSPREE_CONTACT` if unset |
| `VITE_FORMSPREE_CONTACT` | Fallback inbox for event requests |
| `VITE_FORMSPREE_REVIEWS` | Reviews |
| `VITE_STRIPE_DEPOSIT_LINK` | The "Pay the $20 deposit" button on the confirmation. While unset, the confirmation says Matt will text a payment link. |

## One-time dashboard setup

**Stripe — deposit Payment Link (`VITE_STRIPE_DEPOSIT_LINK`)**
1. Products → new one-time product "202BBQ order deposit — $20, refundable if we can't fill your order", $20.00.
2. Payment Links → new link for it. Do **not** enable "Let customers adjust quantity".
3. Collect customer name (required) and phone number; addresses off.
4. Custom text above the Pay button: "This $20 holds your trays for the weekend you requested. Fully refunded if 202BBQ can't fill your request. Balance due at pickup or delivery."
5. After the payment → "Don't show confirmation page" → redirect to
   `https://202barbecue.com/?deposit=paid&session_id={CHECKOUT_SESSION_ID}` (type the braces literally). The site reads the order reference back from the `utm_content` code it adds to the outgoing link.
6. Settings → Customer emails → Successful payments **on**. Settings → Checkout → enable Contact information (202-734-5621) and a Return/refund policy.
7. Personal settings → notifications → email for every successful payment (this is your "deposit received" signal).
8. Paste the link into the `VITE_STRIPE_DEPOSIT_LINK` secret; push any commit to rebuild.

**Stripe — the two Oxtail Softball links**
- Enable adjustable quantity (1–10), collect shipping address (US) and phone, add a shipping rate.
- Add a required dropdown custom field "Flavour" with Candy Red · Caribbean · Honey Garlic · Lemon Pepper. (The site also passes the chosen flavour as the Checkout Session's client reference id, e.g. `honey-garlic-10-pack`.)

**Formspree**
- Three forms (orders, events, reviews) linked to your email. Turn **reCAPTCHA off** on each (the site submits JSON and uses a honeypot instead). Free plan = 50 submissions per month per form — turn on the usage emails.
- Reply-To is the customer's email when they gave one.

## Owner questions the site is waiting on

Each of these is a `null` in `src/data/site.js`; the site simply omits the sentence until you fill it in:
pickup neighbourhood (currently "Northeast DC"), delivery fees, call hours, an email address,
Cash App / Venmo / Zelle handles, licence name, catering notice period, ribeye minimum (ships as 6),
Softball ship days / transit / weight, and a real Softballs photo.

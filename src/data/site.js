// Business facts, in one place.
//
// In the browser Vite inlines import.meta.env; in Node (build-time scripts) it is undefined.
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// Rule: a `null` here means "the owner hasn't told us yet". Every component that
// reads a null field must drop the sentence that would have used it. Nothing on
// the site ever renders a bracketed placeholder.

export const SITE = {
  name: '202BBQ',
  tagline: 'Where the Grill Meets the Hill',
  owner: 'Matt',
  url: 'https://202barbecue.com/',

  phone: '202-734-5621',
  phoneHref: 'tel:+12027345621',
  smsHref: 'sms:+12027345621',
  email: null,                       // ContactCard row + JSON-LD email appear when set
  instagram: '202_bbq',
  instagramUrl: 'https://www.instagram.com/202_bbq',

  callHours: null,                   // e.g. 'Mon–Fri 10 am–7 pm · leave a message any time'
  pickupArea: null,                  // renders "Northeast DC" (the site's own wording) while null
  deliveryFees: null,                // { dc: 15, beltway: 25 } → sentence; null → "fee confirmed with your order"
  serviceArea: 'DC, Maryland and Virginia',

  // Weekly rhythm. Requests Mon–Thu, smoked Friday night, pickup/delivery Sat–Sun.
  cutoff: { dow: 4, minutes: 21 * 60, tz: 'America/New_York' },   // Thursday 9:00 pm ET
  fulfilHours: { open: '10 am', close: '8 pm' },

  depositAmount: 20,
  depositRefundDays: 30,
  stripeDepositUrl: cleanEnv(ENV.VITE_STRIPE_DEPOSIT_LINK),   // null hides the Pay button
  paymentHandles: { cashapp: null, venmo: null, zelle: null },            // rows hidden while null
  cancelTerms: null,                 // default copy used while null (see copy.js)

  licence: null,                     // "A fully licensed DC food business" while null
  eventNoticeHours: null,            // catering notice line hidden while null
  autoresponse: false,               // true only on Formspree Professional

  // Holiday override for the order window. See lib/time.js.
  // { from:'2026-11-23', to:'2026-11-29', text:'…', cutoff:{ ymd:'2026-11-24', minutes:21*60 },
  //   dates:[{ ymd:'2026-11-25', label:'Wednesday, Nov 25' }], closed:false }
  announcement: null,

  forms: {
    orders:   cleanEnv(ENV.VITE_FORMSPREE_ORDERS),
    events:   cleanEnv(ENV.VITE_FORMSPREE_CATERING) || cleanEnv(ENV.VITE_FORMSPREE_CONTACT),
    reviews:  cleanEnv(ENV.VITE_FORMSPREE_REVIEWS),
    contact:  cleanEnv(ENV.VITE_FORMSPREE_CONTACT),
  },

  ga4: 'G-2XL1HLJML0',
};

function cleanEnv(raw) {
  const v = String(raw ?? '').replace(/^<|>$/g, '').trim();
  if (!v || /REPLACE_ME|YOUR_|undefined|null/.test(v)) return null;
  return v;
}

// Derived, so copy never disagrees with the facts above.
export const PICKUP_AREA = SITE.pickupArea ?? 'Northeast DC';

export const DELIVERY_FEE_SENTENCE = SITE.deliveryFees
  ? `$${SITE.deliveryFees.dc} in DC · $${SITE.deliveryFees.beltway} in Maryland and Virginia inside the Beltway · beyond that, call`
  : 'fee confirmed with your order';

// The one deposit sentence. Byte-identical wherever it appears.
export const DEPOSIT_SENTENCE =
  `Nothing is charged automatically. A $${SITE.depositAmount} deposit holds your trays — pay it after you send this, or when ${SITE.owner} calls. It's refunded in full if we can't fill your request; the rest is due at pickup or delivery.`;

export const CANCEL_TERMS = SITE.cancelTerms ??
  `Change or cancel free of charge until Thursday 9 pm ET — call or text ${SITE.phone} and we'll refund the $${SITE.depositAmount}. After that the meat is already bought and smoking, so the deposit is kept.`;

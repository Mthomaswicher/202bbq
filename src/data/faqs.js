import { SITE, DEPOSIT_SENTENCE, CANCEL_TERMS } from './site.js';

// Questions not answered inline elsewhere on the page. An entry whose answer is
// null is excluded from both the page and the FAQ structured data.

export const FAQS = [
  {
    id: 'how-much',
    q: 'How much should I order?',
    a: 'A full tray feeds 30–40 people and a half tray feeds 15–20. For 40 people, one full tray of a meat plus one full tray of a side is plenty. Two half trays equal one full. Use the headcount helper above the menu, or call ' + SITE.phone + ' and we will work it out together.',
  },
  {
    id: 'market-price',
    q: 'What does "market price" mean?',
    a: 'Beef Ribs and Lamb Chops cost us a different amount each week, so we quote them after you send your request and before anything is confirmed. You are never committed to a market-price item until you have heard the number.',
  },
  {
    id: 'allergens',
    q: 'Are any dishes vegetarian or allergen-free?',
    a: 'There is no vegetarian main. Among the sides, the mac and cheese has brisket in it, the collard greens are cooked with smoked turkey, the coleslaw has jalapeño, and the seafood salad has shrimp and crab. Tell us about allergies in the note on your order and we will call you about it.',
  },
  {
    id: 'deposit',
    q: `How does the $${SITE.depositAmount} deposit work?`,
    a: DEPOSIT_SENTENCE + ' ' + CANCEL_TERMS,
  },
  {
    id: 'balance',
    q: 'How do I pay the rest?',
    a: `The balance is due at pickup or delivery. ${SITE.owner} confirms the method with you when he calls.`,
  },
  {
    id: 'shipping',
    q: 'Do you ship?',
    a: 'Only Oxtail Softballs, anywhere in the US. Trays are pickup or local delivery in DC, Maryland and Virginia.',
  },
  {
    id: 'in-person',
    q: 'Where can I find you in person?',
    a: `We do popups and markets around DC. Upcoming dates are listed under "Where to find us" and go up on Instagram first — @${SITE.instagram}.`,
  },
].filter(f => f.a);

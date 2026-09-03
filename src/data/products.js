// Shipped products. Checkout happens on Stripe Payment Links; the site only
// describes the product and links out. `null` facts are hidden until the owner
// supplies them.

export const OXTAIL_SOFTBALLS = {
  id: 'oxtail-softballs',
  name: 'Oxtail Softballs',
  desc: 'Our oxtails, slow-smoked until they fall off the bone, packed into softball-sized portions, vacuum-sealed and shipped frozen.',
  flavours: [
    { id: 'candy-red',    name: 'Candy Red',    line: 'Sweet, sticky, classic barbecue.' },
    { id: 'caribbean',    name: 'Caribbean',    line: 'Allspice, thyme and a little heat.' },
    { id: 'honey-garlic', name: 'Honey Garlic', line: 'Rich, mellow and sweet.' },
    { id: 'lemon-pepper', name: 'Lemon Pepper', line: 'Bright and peppery.' },
  ],
  packs: [
    { id: '5-pack',  label: '5-pack',  price: 100, stripeLink: 'https://buy.stripe.com/5kQcN47g3eViggtcrT7IY03' },
    { id: '10-pack', label: '10-pack', price: 190, stripeLink: 'https://buy.stripe.com/3cIbJ06bZ28w3tH63v7IY02', tag: 'Best value' },
  ],
  facts: {
    packaging: 'Ships frozen in insulated packaging',
    sealed: 'Vacuum-sealed',
    reheatMinutes: 20,
    shipDays: null,        // e.g. 'Ships Monday–Wednesday'
    transitDays: null,     // e.g. 2
    weightPerBall: null,   // e.g. '6 oz'
    freeShipping: null,    // true once the owner confirms; a flat rate is an open question
  },
  image: null,             // images.json key once a real photo is shot
};

import { useState } from 'react';
import { OXTAIL_SOFTBALLS as P } from '../data/products.js';
import { SITE } from '../data/site.js';
import { money } from '../lib/format.js';
import { track } from '../lib/analytics.js';
import { RadioCardGroup } from './ui/Field.jsx';
import Picture from './ui/Picture.jsx';
import Icon from './ui/Icon.jsx';
import { PhoneLink } from './ui/Bits.jsx';

// Checkout is on Stripe. The flavour chosen here rides along as
// client_reference_id (Stripe accepts [A-Za-z0-9_-]); the owner checklist also
// adds a required "Flavour" dropdown on the Payment Link for redundancy.

export default function ShippingSection() {
  const [flavour, setFlavour] = useState('');
  const [error, setError] = useState('');
  const facts = [
    P.facts.freeShipping && 'Free shipping on every order',
    P.facts.packaging,
    P.facts.sealed,
    P.facts.reheatMinutes && `Reheats in under ${P.facts.reheatMinutes} minutes`,
    P.facts.shipDays,
    P.facts.transitDays && `Arrives in about ${P.facts.transitDays} days`,
    P.facts.weightPerBall && `${P.facts.weightPerBall} per softball`,
  ].filter(Boolean);

  const buyUrl = pack => {
    const u = new URL(pack.stripeLink);
    if (flavour) u.searchParams.set('client_reference_id', `${flavour}-${pack.id}`);
    u.searchParams.set('utm_source', '202barbecue.com');
    u.searchParams.set('utm_medium', 'softballs');
    return u.toString();
  };
  const onBuy = (e, pack) => {
    if (!flavour) { e.preventDefault(); setError('Choose a flavour first.'); document.getElementById('flavour')?.focus(); return; }
    track('begin_checkout', { currency: 'USD', value: pack.price, items: [{ item_id: `${P.id}-${pack.id}`, item_name: `${P.name} ${pack.label}`, item_variant: flavour, price: pack.price, quantity: 1 }] });
  };

  return (
    <section id="shipping" className="section shipping" aria-labelledby="shipping-heading">
      <p className="band bridge"><span className="container">Not in DC? {P.name} ship nationwide.</span></p>
      <div className="container">
        <div className="shipping-grid">
          <div className="shipping-text">
            <div className="section-head">
              <h2 id="shipping-heading" tabIndex={-1}>{P.name}</h2>
              <p className="lede">{P.desc}</p>
            </div>
            {P.image && <Picture name={P.image} alt={`${P.name} on the smoker`} sizes="(min-width: 1024px) 40vw, 100vw" />}
            <ul className="facts mono">
              {facts.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}
            </ul>
          </div>

          <div className="buy-panel">
            <RadioCardGroup id="flavour" name="flavour" legend="Pick a flavour" value={flavour} onChange={v => { setFlavour(v); setError(''); }}
              options={P.flavours.map(f => ({ value: f.id, title: f.name, sub: f.line }))} cols={2} error={error} />
            <div className="packs">
              {P.packs.map(pack => (
                <div key={pack.id} className="pack">
                  {pack.tag && <span className="pack-tag">{pack.tag} — {Math.round((1 - pack.price / (P.packs[0].price * (parseInt(pack.label, 10) / parseInt(P.packs[0].label, 10)))) * 100)}% less per softball</span>}
                  <a href={buyUrl(pack)} className="btn btn-primary btn-lg btn-full" onClick={e => onBuy(e, pack)}>
                    Buy {pack.label} · {money(pack.price)}
                  </a>
                </div>
              ))}
            </div>
            <p className="small muted">You'll confirm the quantity and enter your delivery address on the next screen (Stripe). Card, Apple Pay or Google Pay.</p>
            <p className="small">Questions? Call <PhoneLink location="shipping" />.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

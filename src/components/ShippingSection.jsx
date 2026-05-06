import { useState } from 'react';
import { SHIPPING_PRODUCTS } from '../data/menu.js';

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function validate(name, value) {
  if (!value.trim()) return 'Required.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email.';
  if (name === 'phone' && !/^[\d\s().+\-]{7,}$/.test(value)) return 'Enter a valid phone number.';
  return '';
}

function makeShipRef() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `202S-${yy}${mm}${dd}-${rand}`;
}

export default function ShippingSection() {
  const product = SHIPPING_PRODUCTS[0];
  const [pack, setPack] = useState(product.packs[1]);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [fields, setFields] = useState({ fname: '', lname: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const total = pack.price * qty;

  const setField = (name, val) => {
    setFields(f => ({ ...f, [name]: val }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validate(name, val) }));
  };

  const blur = name => {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validate(name, fields[name]) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const required = ['fname', 'lname', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    const newErrors = {};
    let hasError = false;
    for (const n of required) {
      const err = validate(n, fields[n]);
      if (err) { newErrors[n] = err; hasError = true; }
    }
    if (hasError) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(required.map(n => [n, true])));
      return;
    }

    setSubmitting(true);
    const ref = makeShipRef();

    const payload = {
      _subject: `🚚 Shipping Order — ${fields.fname} ${fields.lname} (${ref})`,
      _replyto: fields.email,
      OrderRef: ref,
      Type: 'NATIONWIDE SHIPPING',
      Name: `${fields.fname} ${fields.lname}`,
      Email: fields.email,
      Phone: fields.phone,
      Item: `${qty}× ${product.name} — ${pack.label}`,
      Subtotal: `$${total.toFixed(2)} + shipping (to be confirmed)`,
      ShipTo: `${fields.address}, ${fields.city}, ${fields.state} ${fields.zip}`,
      Notes: fields.notes || 'None',
      Submitted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const endpoint = (import.meta.env.VITE_FORMSPREE_ORDERS || '').replace(/^<|>$/g, '').trim();

    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      console.log('202BBQ Shipping Order:', payload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { setSubmitting(false); return; }
      } catch { setSubmitting(false); return; }
    }

    setOrderRef(ref);
    setSubmittedEmail(fields.email);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="shipping-section" id="shipping">
        <div className="container">
          <div className="ship-success">
            <div className="ship-success-icon" aria-hidden="true">📦</div>
            <h2>Order Request Received!</h2>
            <p>We'll reach out to <strong>{submittedEmail}</strong> within 24 hours to confirm and collect payment.</p>
            <p className="ship-ref">Order ref: <code>{orderRef}</code></p>
            <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setFields({ fname: '', lname: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' }); setErrors({}); setTouched({}); }}>
              Order More
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shipping-section" id="shipping" aria-labelledby="shipping-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow shipping-eyebrow">Now Shipping Nationwide</p>
          <h2 className="section-title" id="shipping-heading">Oxtail Softballs. Delivered to Your Door.</h2>
          <p className="section-sub">
            Our most-requested item, vacuum-sealed and shipped frozen anywhere in the US.
          </p>
        </div>

        <div className="shipping-layout">
          <div className="ship-product-panel">
            <div className="ship-product-emoji" aria-hidden="true">🍲</div>
            <h3 className="ship-product-name">{product.name}</h3>
            <p className="ship-product-desc">{product.desc}</p>

            <div className="ship-pack-grid" role="radiogroup" aria-label="Select a pack size">
              {product.packs.map(p => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={pack.id === p.id}
                  className={`ship-pack-btn${pack.id === p.id ? ' active' : ''}`}
                  onClick={() => setPack(p)}
                >
                  {p.tag && <span className="ship-pack-tag">{p.tag}</span>}
                  <span className="ship-pack-label">{p.label}</span>
                  <span className="ship-pack-price">${p.price}</span>
                </button>
              ))}
            </div>

            <div className="ship-qty-row">
              <span className="ship-qty-label">Qty</span>
              <div className="ship-qty-ctrl" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span aria-live="polite" aria-atomic="true">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
              </div>
              <span className="ship-running-total" aria-live="polite">${total.toFixed(2)}</span>
            </div>

            <ul className="ship-trust-list" aria-label="Shipping details">
              <li><TruckIcon /> Ships in insulated, frozen packaging</li>
              <li><ShieldIcon /> Vacuum-sealed for freshness</li>
              <li><ClockIcon /> Reheats in under 20 minutes</li>
              <li><GlobeIcon /> Delivered anywhere in the US</li>
            </ul>
          </div>

          <form className="ship-form" onSubmit={handleSubmit} noValidate aria-label="Shipping order form">
            <div className="form-section">
              <p className="form-legend"><span className="form-legend-icon">👤</span> Your Info</p>
              <div className="form-row">
                <SField id="sfname" label="First Name" autoComplete="given-name"  value={fields.fname} onChange={v => setField('fname', v)} onBlur={() => blur('fname')} error={errors.fname} required />
                <SField id="slname" label="Last Name"  autoComplete="family-name" value={fields.lname} onChange={v => setField('lname', v)} onBlur={() => blur('lname')} error={errors.lname} required />
              </div>
              <SField id="semail" label="Email" type="email" inputMode="email" autoComplete="email" hint="Confirmation sent here." value={fields.email} onChange={v => setField('email', v)} onBlur={() => blur('email')} error={errors.email} required />
              <SField id="sphone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={fields.phone} onChange={v => setField('phone', v)} onBlur={() => blur('phone')} error={errors.phone} required />
            </div>

            <div className="form-section">
              <p className="form-legend"><span className="form-legend-icon">📦</span> Ship To</p>
              <SField id="saddr"  label="Street Address" autoComplete="street-address" value={fields.address} onChange={v => setField('address', v)} onBlur={() => blur('address')} error={errors.address} required />
              <div className="form-row form-row--city">
                <SField id="scity"  label="City"  autoComplete="address-level2" value={fields.city}  onChange={v => setField('city',  v)} onBlur={() => blur('city')}  error={errors.city}  required />
                <SField id="sstate" label="State" autoComplete="address-level1" placeholder="DC"    value={fields.state} onChange={v => setField('state', v)} onBlur={() => blur('state')} error={errors.state} required />
                <SField id="szip"   label="ZIP"   autoComplete="postal-code"    inputMode="numeric" value={fields.zip}   onChange={v => setField('zip',   v)} onBlur={() => blur('zip')}   error={errors.zip}   required />
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="snotes">Notes <span className="field-optional">(optional)</span></label>
                <textarea id="snotes" rows={2} placeholder="Gift message, allergies, anything else…" value={fields.notes} onChange={e => setField('notes', e.target.value)} />
              </div>
            </div>

            <div className="submit-area">
              <div className="ship-order-line">
                <span>{qty}× {pack.label} — {product.name}</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <p className="submit-disclaimer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                We'll confirm your shipping cost and collect payment within 24 hours.
              </p>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Sending…' : `Place Order — $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function SField({ id, label, type = 'text', placeholder, hint, value, onChange, onBlur, error, required, autoComplete, inputMode }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      <input
        type={type} id={id} name={id} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
        required={required} autoComplete={autoComplete} inputMode={inputMode}
        aria-required={required} aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hint ? `sh-${id} ` : ''}${error ? `se-${id}` : ''}`}
      />
      {hint  && <span className="fhint" id={`sh-${id}`}>{hint}</span>}
      {error && <span className="ferr"  id={`se-${id}`} role="alert">{error}</span>}
    </div>
  );
}

import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { track } from '../lib/analytics.js';

const fmt = n => (typeof n === 'number' ? `$${n.toFixed(2)}` : String(n));

function AvailabilityBadge() {
  const day = new Date().getDay();
  const isOpen   = day >= 1 && day <= 4;
  const isFriday = day === 5;
  const isSat    = day === 6;

  let msg, cls;
  if (isOpen) {
    msg = '✔ Orders are open! Submit your request below for this weekend.';
    cls = 'open';
  } else if (isFriday) {
    msg = '⏰ Order window closed. We\'re smoking tonight! Orders reopen Monday.';
    cls = 'closed';
  } else {
    msg = `🔥 Happy ${isSat ? 'Saturday' : 'Sunday'}! Enjoy. Orders for next weekend open Monday.`;
    cls = 'closed';
  }

  return <div className={`avail-badge ${cls}`} role="status" aria-live="polite">{msg}</div>;
}

function OrderSummary() {
  const { cart, cartTotal, hasMpItems } = useCart();
  const entries = Object.values(cart);
  const hasItems = entries.length > 0;

  return (
    <aside className="order-summary" aria-label="Order summary">
      <h3>Your Selections</h3>
      {!hasItems ? (
        <div className="os-empty">
          <p>No items yet. <a href="#menu" className="inline-link">Browse the menu</a> to add trays.</p>
        </div>
      ) : (
        <>
          <ul className="os-list" role="list">
            {entries.map(({ item, size, price, qty }) => {
              const sizeLabel = size === 'full' ? 'Full' : size === 'half' ? 'Half' : size === 'each' ? 'ea.' : 'MP';
              return (
                <li key={`${item.id}::${size}`} className="os-item">
                  <span className="os-item-name">
                    {qty}× {item.name}{' '}
                    <em style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'normal' }}>({sizeLabel})</em>
                  </span>
                  <span className="os-item-price">
                    {typeof price === 'number' ? fmt(price * qty) : 'MP*'}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="os-total">
            <span>Subtotal</span>
            <span>{fmt(cartTotal)}</span>
          </div>
          {hasMpItems && <p className="os-mp-note">* Market price items will be quoted on confirmation.</p>}
        </>
      )}
      <div className="os-tray-note">Full Tray ≈ 30–40 people &nbsp;·&nbsp; Half Tray ≈ 15–20</div>
    </aside>
  );
}

function validate(name, value, isDelivery) {
  if (!value.trim()) return 'This field is required.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
  if (name === 'phone' && !/^[\d\s().+\-]{7,}$/.test(value)) return 'Enter a valid phone number.';
  if (name === 'address' && isDelivery && !value.trim()) return 'Delivery address is required.';
  return '';
}

function makeOrderRef() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `202-${yy}${mm}${dd}-${rand}`;
}

export default function OrderSection() {
  const { cart, cartCount, cartTotal, hasMpItems, clearCart } = useCart();
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const [fields, setFields] = useState({ fname: '', lname: '', email: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fulfillment, setFulfillment] = useState('');
  const [day, setDay] = useState('');

  const successRef = useRef(null);

  const setField = (name, value) => {
    setFields(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      const err = (name === 'address' && !isDelivery) ? '' : validate(name, value, isDelivery);
      setErrors(e => ({ ...e, [name]: err }));
    }
  };

  const blur = (name) => {
    setTouched(t => ({ ...t, [name]: true }));
    const err = (name === 'address' && !isDelivery) ? '' : validate(name, fields[name], isDelivery);
    setErrors(e => ({ ...e, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartCount === 0) { addToast('Add items to your order first.', 'error'); return; }
    if (!fulfillment)    { addToast('Please choose pickup or delivery.', 'error'); return; }
    if (!day)            { addToast('Please choose Saturday or Sunday.', 'error'); return; }

    // Validate all required fields
    const requiredFields = ['fname', 'lname', 'email', 'phone', ...(isDelivery ? ['address'] : [])];
    const newErrors = {};
    let hasError = false;
    for (const name of requiredFields) {
      const err = validate(name, fields[name], isDelivery);
      if (err) { newErrors[name] = err; hasError = true; }
    }
    if (hasError) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(requiredFields.map(n => [n, true])));
      addToast('Please fix the errors below.', 'error');
      return;
    }

    setSubmitting(true);

    // Format cart items as a readable list for the email
    const itemLines = Object.values(cart).map(({ item, size, price, qty }) => {
      const sizeLabel = size === 'full' ? 'Full Tray' : size === 'half' ? 'Half Tray' : size === 'each' ? 'Per Steak' : 'Market Price';
      const lineTotal = typeof price === 'number' ? `$${(price * qty).toFixed(2)}` : 'MP (to be quoted)';
      return `${qty}× ${item.name} (${sizeLabel}): ${lineTotal}`;
    }).join('\n');

    const thisOrderRef = makeOrderRef();

    const formspreePayload = {
      _subject: `New Order Request from ${fields.fname} ${fields.lname} (${thisOrderRef})`,
      _replyto: fields.email,
      OrderRef:    thisOrderRef,
      Name:        `${fields.fname} ${fields.lname}`,
      Email:       fields.email,
      Phone:       fields.phone,
      Fulfillment: fulfillment === 'delivery' ? `Delivery to ${fields.address}` : 'Pickup',
      Day:         day.charAt(0).toUpperCase() + day.slice(1),
      Items:       itemLines,
      Subtotal:    hasMpItems
                     ? `$${cartTotal.toFixed(2)} + market price items (to be quoted)`
                     : `$${cartTotal.toFixed(2)}`,
      Notes:       fields.notes || 'None',
      Submitted:   new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const endpoint = import.meta.env.VITE_FORMSPREE_ORDERS;

    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      console.log('202BBQ Order (Formspree not configured):', formspreePayload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formspreePayload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubmitting(false);
          addToast(data?.error || "Submit failed. Please try again or call 202-997-8912 to order by phone.", 'error');
          return;
        }
      } catch (err) {
        setSubmitting(false);
        addToast("Blocked by an ad blocker or browser extension. Try disabling it, or call/text 202-997-8912 to order.", 'error');
        return;
      }
    }

    track('generate_lead', {
      currency: 'USD',
      value: Number(cartTotal.toFixed(2)),
      fulfillment,
      day,
      item_count: cartCount,
      has_market_price_items: hasMpItems,
      order_ref: thisOrderRef,
    });

    setOrderRef(thisOrderRef);
    setSubmittedEmail(fields.email);
    setSubmitting(false);
    setSubmitted(true);
    clearCart();
    setTimeout(() => successRef.current?.focus(), 100);
  };

  const stripeDepositLink = import.meta.env.VITE_STRIPE_DEPOSIT_LINK;
  const stripeConfigured = stripeDepositLink && !stripeDepositLink.includes('REPLACE_ME');
  const stripeUrl = stripeConfigured
    ? `${stripeDepositLink}${stripeDepositLink.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(submittedEmail)}&client_reference_id=${encodeURIComponent(orderRef)}`
    : '';

  const handleDepositClick = () => {
    track('begin_checkout', {
      currency: 'USD',
      value: 20,
      payment_method: 'stripe',
      order_ref: orderRef,
    });
  };

  if (submitted) {
    return (
      <section className="order-section" id="order">
        <div className="container">
          <div className="order-success" role="alert" aria-live="assertive">
            <h2 ref={successRef} tabIndex={-1}>Order Request Received!</h2>
            <p>We got it! Expect a confirmation to your email shortly. Get ready for some serious BBQ this weekend.</p>

            <div className="deposit-notice">
              <p className="deposit-notice-heading">One more step: secure your order with a $20 deposit</p>
              <p className="deposit-notice-sub">
                Your $20 deposit holds your spot. The remainder is paid at pickup or delivery. Orders without a deposit are not guaranteed.
              </p>

              {orderRef && (
                <p className="deposit-order-ref">
                  <span>Order reference</span>
                  <code>{orderRef}</code>
                </p>
              )}

              {stripeConfigured ? (
                <>
                  <a
                    href={stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg btn-full deposit-pay-btn"
                    onClick={handleDepositClick}
                  >
                    Pay $20 Deposit Securely
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: 8 }}>
                      <path d="M7 17L17 7M17 7H8M17 7v9"/>
                    </svg>
                  </a>
                  <p className="deposit-secure-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Secure payment powered by Stripe · Card, Apple Pay, Google Pay
                  </p>
                  <details className="deposit-alt-methods">
                    <summary>Prefer to pay another way?</summary>
                    <ul className="deposit-methods" aria-label="Alternate payment options">
                      <li>
                        <span className="deposit-method-label">CashApp</span>
                        <span className="deposit-method-value">202-997-8912</span>
                      </li>
                      <li>
                        <span className="deposit-method-label">Venmo</span>
                        <span className="deposit-method-value">202-997-8912</span>
                      </li>
                      <li>
                        <span className="deposit-method-label">Zelle</span>
                        <span className="deposit-method-value">202-997-8912</span>
                      </li>
                    </ul>
                    <p className="deposit-notice-note">Include your order reference in the payment note so we can match it to your order.</p>
                  </details>
                </>
              ) : (
                <>
                  <ul className="deposit-methods" aria-label="Payment options">
                    <li>
                      <span className="deposit-method-label">CashApp</span>
                      <span className="deposit-method-value">202-997-8912</span>
                    </li>
                    <li>
                      <span className="deposit-method-label">Venmo</span>
                      <span className="deposit-method-value">202-997-8912</span>
                    </li>
                    <li>
                      <span className="deposit-method-label">Zelle</span>
                      <span className="deposit-method-value">202-997-8912</span>
                    </li>
                  </ul>
                  <p className="deposit-notice-note">Include your name in the payment note so we can match it to your order.</p>
                </>
              )}
            </div>

            <div className="success-actions">
              <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>Place Another Order</button>
              <a href="https://www.instagram.com/202_bbq" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Follow @202_bbq
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-section" id="order" aria-labelledby="order-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Place Your Order</p>
          <h2 className="section-title" id="order-heading">Order for This Weekend</h2>
          <p className="section-sub">
            Orders accepted <strong>Monday–Thursday</strong>. Pickup or delivery <strong>Saturday &amp; Sunday</strong> in the DMV.{' '}
            Questions? Call <a href="tel:2029978912" className="inline-link">202-997-8912</a>.
          </p>
        </div>

        <AvailabilityBadge />

        <div className="order-layout">
          <OrderSummary />

          <form className="order-form" id="order-form" noValidate onSubmit={handleSubmit} aria-label="Order request form">

            {/* Personal Info */}
            <div className="form-section">
              <p className="form-legend"><span className="form-legend-icon">👤</span> Your Information</p>
              <div className="form-row">
                <Field id="fname" label="First Name" placeholder="Sam"   autoComplete="given-name"  value={fields.fname} onChange={v => setField('fname', v)} onBlur={() => blur('fname')} error={errors.fname} required />
                <Field id="lname" label="Last Name"  placeholder="Smith" autoComplete="family-name" value={fields.lname} onChange={v => setField('lname', v)} onBlur={() => blur('lname')} error={errors.lname} required />
              </div>
              <Field id="email" label="Email Address" type="email" placeholder="sam@email.com" hint="Order confirmation sent here." autoComplete="email" inputMode="email"
                value={fields.email} onChange={v => setField('email', v)} onBlur={() => blur('email')} error={errors.email} required />
              <Field id="phone" label="Phone Number"  type="tel"   placeholder="(202) 555-0100" hint="For updates and delivery coordination." autoComplete="tel" inputMode="tel"
                value={fields.phone} onChange={v => setField('phone', v)} onBlur={() => blur('phone')} error={errors.phone} required />
            </div>

            {/* Fulfillment */}
            <div className="form-section">
              <p className="form-legend"><span className="form-legend-icon">🚗</span> Fulfillment</p>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                  How would you like your order? <span style={{ color: 'var(--ember)' }}>*</span>
                </p>
                <div className="radio-group">
                  {[{ v: 'pickup', label: 'Pickup', sub: 'Free · Address confirmed on order' }, { v: 'delivery', label: 'Delivery', sub: 'DMV area · Delivery fee may apply' }].map(opt => (
                    <label key={opt.v} className="radio-card">
                      <input type="radio" name="fulfillment" value={opt.v} checked={fulfillment === opt.v}
                        onChange={() => { setFulfillment(opt.v); setIsDelivery(opt.v === 'delivery'); }} />
                      <span className="radio-dot" aria-hidden="true" />
                      <div className="radio-text">
                        <strong>{opt.label}</strong>
                        <span>{opt.sub}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {isDelivery && (
                <Field id="address" label="Delivery Address" placeholder="1600 Pennsylvania Ave NW, Washington, DC" autoComplete="street-address"
                  value={fields.address} onChange={v => setField('address', v)} onBlur={() => blur('address')} error={errors.address} required />
              )}

              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Preferred day <span style={{ color: 'var(--ember)' }}>*</span>
                </p>
                <div className="radio-group">
                  {[{ v: 'saturday', label: 'Saturday', sub: 'Time window confirmed on order' }, { v: 'sunday', label: 'Sunday', sub: 'Time window confirmed on order' }].map(opt => (
                    <label key={opt.v} className="radio-card">
                      <input type="radio" name="day" value={opt.v} checked={day === opt.v} onChange={() => setDay(opt.v)} />
                      <span className="radio-dot" aria-hidden="true" />
                      <div className="radio-text">
                        <strong>{opt.label}</strong>
                        <span>{opt.sub}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <p className="form-legend"><span className="form-legend-icon">📝</span> Anything else?</p>
              <div className="form-group">
                <label htmlFor="notes">Special Requests / Allergies</label>
                <textarea id="notes" name="notes" rows={3} maxLength={500}
                  placeholder="e.g. extra sauce, no pork, leave at door, gate code…"
                  value={fields.notes} onChange={e => setField('notes', e.target.value)}
                />
                <span className="fhint">Up to 500 characters.</span>
              </div>
            </div>

            {/* Submit */}
            <div className="submit-area">
              <p className="submit-disclaimer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Your order isn't final until we confirm it. We'll reach out within a few hours.
              </p>
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? 'Sending…' : 'Submit Order Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ id, label, type = 'text', placeholder, hint, value, onChange, onBlur, error, required, autoComplete, inputMode }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hint ? `h-${id} ` : ''}${error ? `e-${id}` : ''}`}
      />
      {hint  && <span className="fhint" id={`h-${id}`}>{hint}</span>}
      {error && <span className="ferr"  id={`e-${id}`} role="alert">{error}</span>}
    </div>
  );
}

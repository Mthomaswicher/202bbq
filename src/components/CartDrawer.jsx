import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const fmt = n => (typeof n === 'number' ? `$${n.toFixed(2)}` : String(n));

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const bar    = document.querySelector('.announcement-bar');
  const offset = (header?.offsetHeight || 0) + (bar?.offsetHeight || 0) + 12;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

function makeShipRef() {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const dd  = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `202S-${yy}${mm}${dd}-${rand}`;
}

function validate(name, value) {
  if (!value.trim()) return 'Required.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email.';
  if (name === 'phone' && !/^[\d\s().+\-]{7,}$/.test(value)) return 'Enter a valid phone number.';
  return '';
}

const EMPTY_FIELDS = { fname: '', lname: '', email: '', phone: '', address: '', city: '', state: '', zip: '' };

export default function CartDrawer() {
  const {
    cart, cartCount, cartTotal, hasMpItems,
    hasLocalItems, hasShippingItems,
    adjustQty, removeFromCart,
    clearShippingItems,
    cartOpen, cartInitialStep, closeCart,
  } = useCart();
  const { addToast } = useToast();

  const [step, setStep]           = useState('cart');   // 'cart' | 'checkout'
  const [fields, setFields]       = useState(EMPTY_FIELDS);
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const closeRef    = useRef(null);
  const lastFocusRef = useRef(null);

  const entries     = Object.entries(cart);
  const hasItems    = entries.length > 0;
  const shippingEntries = Object.values(cart).filter(e => e.type === 'shipping');
  const shippingTotal   = shippingEntries.reduce((s, { price, qty }) => s + (price || 0) * qty, 0);

  // Sync step with context when drawer opens/closes
  useEffect(() => {
    if (cartOpen) {
      setStep(cartInitialStep);
    } else {
      setTimeout(() => { setStep('cart'); setFields(EMPTY_FIELDS); setErrors({}); setTouched({}); }, 300);
    }
  }, [cartOpen, cartInitialStep]);

  useEffect(() => {
    if (cartOpen) {
      lastFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      lastFocusRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && cartOpen) closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cartOpen, closeCart]);

  const handleRemove = (key, name) => {
    removeFromCart(key);
    addToast(`${name} removed`, 'info');
  };

  const handleLocalCheckout = () => { closeCart(); smoothScrollTo('order'); };

  const setField = (name, val) => {
    setFields(f => ({ ...f, [name]: val }));
    if (touched[name]) setErrors(e => ({ ...e, [name]: validate(name, val) }));
  };

  const blur = name => {
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(e => ({ ...e, [name]: validate(name, fields[name]) }));
  };

  const handleCheckoutSubmit = async (ev) => {
    ev.preventDefault();
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

    const itemLines = shippingEntries.map(({ item, size, flavor, price, qty }) =>
      `${qty}x ${item.name}, ${size}, ${flavor}: $${(price * qty).toFixed(2)}`
    ).join('\n');

    const payload = {
      _subject:  `🚚 NEW Oxtail Order: ${fields.fname} ${fields.lname}, $${shippingTotal.toFixed(2)} (${ref})`,
      _replyto:  fields.email,
      '--- ORDER ---': '---',
      OrderRef:  ref,
      Items:     itemLines,
      Subtotal:  `$${shippingTotal.toFixed(2)}`,
      '--- CUSTOMER ---': '---',
      Name:      `${fields.fname} ${fields.lname}`,
      Email:     fields.email,
      Phone:     fields.phone,
      '--- SHIP TO ---': '---',
      Address:   fields.address,
      City:      fields.city,
      State:     fields.state,
      ZIP:       fields.zip,
      '--- META ---': '---',
      Submitted: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    const shippingEndpoint = (import.meta.env.VITE_FORMSPREE_SHIPPING || '').replace(/^<|>$/g, '').trim();
    const fallbackEndpoint = (import.meta.env.VITE_FORMSPREE_ORDERS  || '').replace(/^<|>$/g, '').trim();
    const endpoint = (shippingEndpoint && !shippingEndpoint.includes('REPLACE_ME'))
      ? shippingEndpoint
      : fallbackEndpoint;

    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      console.warn('202BBQ: VITE_FORMSPREE_SHIPPING not configured in GitHub Secrets.');
      await new Promise(r => setTimeout(r, 600));
    } else {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { setSubmitting(false); addToast('Submit failed. Please try again.', 'error'); return; }
      } catch {
        setSubmitting(false);
        addToast('Network error. Please try again.', 'error');
        return;
      }
    }

    // Open Stripe link(s) grouped by pack type
    const byLink = {};
    for (const entry of shippingEntries) {
      if (!entry.stripeLink) continue;
      byLink[entry.stripeLink] = (byLink[entry.stripeLink] || 0) + entry.qty;
    }
    for (const [link, qty] of Object.entries(byLink)) {
      window.open(`${link}?quantity=${qty}`, '_blank', 'noopener,noreferrer');
    }

    clearShippingItems();
    setSubmitting(false);
    closeCart();
    addToast(`Order received! Check your email at ${fields.email}.`, 'success');
  };

  const sizeLabel = (size, type) => {
    if (size === 'full')  return 'Full Tray';
    if (size === 'half')  return 'Half Tray';
    if (size === 'each')  return 'Per Steak';
    if (type === 'shipping') return size.charAt(0).toUpperCase() + size.slice(1);
    return 'Market Price';
  };

  return (
    <>
      <div
        className={`cart-overlay${cartOpen ? ' visible' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
        style={{ pointerEvents: cartOpen ? 'auto' : 'none' }}
      />

      <div
        id="cart-drawer"
        className={`cart-drawer${cartOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={step === 'checkout' ? 'Shipping information' : 'Your cart'}
        aria-hidden={!cartOpen}
      >
        {/* ── Header ── */}
        <div className={`cart-header${step === 'checkout' ? ' cart-header--checkout' : ''}`}>
          {step === 'checkout' ? (
            <button className="cart-back-btn" onClick={() => setStep('cart')} aria-label="Back to cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>
          ) : (
            <h2>Your Cart {cartCount > 0 && <span style={{ color: 'var(--ember)', fontSize: '1.1rem' }}>({cartCount})</span>}</h2>
          )}
          {step === 'checkout' && <h2 className="cart-checkout-title">Shipping Info</h2>}
          <button ref={closeRef} className="cart-close" onClick={closeCart} aria-label="Close cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cart-body">

          {/* STEP 1: Cart items */}
          {step === 'cart' && (
            !hasItems ? (
              <div className="cart-empty">
                <span className="cart-empty-icon" aria-hidden="true">🍖</span>
                <p>Your cart is empty.</p>
                <button className="btn btn-primary" onClick={() => { closeCart(); smoothScrollTo('menu'); }}>
                  Browse the Menu
                </button>
              </div>
            ) : (
              <ul className="cart-items" role="list" aria-label="Items in cart">
                {entries.map(([key, { item, size, price, qty, type, flavor }]) => {
                  const isShipping = type === 'shipping';
                  const priceStr   = typeof price === 'number' ? fmt(price * qty) : 'MP*';
                  return (
                    <li key={key} className={`cart-item${isShipping ? ' cart-item--ship' : ''}`}>
                      <span className="cart-item-emoji" aria-hidden="true">{item.emoji}</span>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-size">
                          {sizeLabel(size, type)}
                          {isShipping && flavor && <span className="cart-item-flavor"> · {flavor}</span>}
                        </div>
                        {isShipping && <span className="cart-item-ship-badge">Ships Nationwide 🚚</span>}
                        <div className="cart-item-controls">
                          <button className="qty-btn" onClick={() => adjustQty(key, -1)} aria-label={`Decrease ${item.name}`}>−</button>
                          <span className="qty-display">{qty}</span>
                          <button className="qty-btn" onClick={() => adjustQty(key, 1)}  aria-label={`Increase ${item.name}`}>+</button>
                          <button className="remove-btn" onClick={() => handleRemove(key, item.name)}>Remove</button>
                        </div>
                      </div>
                      <span className="cart-item-price">{priceStr}</span>
                    </li>
                  );
                })}
              </ul>
            )
          )}

          {/* STEP 2: Shipping checkout form */}
          {step === 'checkout' && (
            <form id="ship-checkout-form" onSubmit={handleCheckoutSubmit} noValidate>
              {/* Order recap */}
              <div className="checkout-recap">
                {shippingEntries.map(({ item, size, flavor, price, qty }, i) => (
                  <div key={i} className="checkout-recap-row">
                    <span>{qty}× {size.charAt(0).toUpperCase() + size.slice(1)}, {flavor}</span>
                    <span>${(price * qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="checkout-recap-total">
                  <span>Total</span>
                  <strong>${shippingTotal.toFixed(2)}</strong>
                </div>
              </div>

              <div className="checkout-form-fields">
                <p className="checkout-section-label">Your Info</p>
                <div className="form-row">
                  <CField id="co-fname" label="First Name" autoComplete="given-name"  value={fields.fname} onChange={v => setField('fname', v)} onBlur={() => blur('fname')} error={errors.fname} required />
                  <CField id="co-lname" label="Last Name"  autoComplete="family-name" value={fields.lname} onChange={v => setField('lname', v)} onBlur={() => blur('lname')} error={errors.lname} required />
                </div>
                <CField id="co-email" label="Email" type="email" inputMode="email" autoComplete="email" hint="Order confirmation sent here." value={fields.email} onChange={v => setField('email', v)} onBlur={() => blur('email')} error={errors.email} required />
                <CField id="co-phone" label="Phone" type="tel"   inputMode="tel"   autoComplete="tel"   value={fields.phone} onChange={v => setField('phone', v)} onBlur={() => blur('phone')} error={errors.phone} required />

                <p className="checkout-section-label" style={{ marginTop: 20 }}>Ship To</p>
                <CField id="co-addr"  label="Street Address" autoComplete="street-address" value={fields.address} onChange={v => setField('address', v)} onBlur={() => blur('address')} error={errors.address} required />
                <div className="form-row co-city-row">
                  <CField id="co-city"  label="City"  autoComplete="address-level2" value={fields.city}  onChange={v => setField('city',  v)} onBlur={() => blur('city')}  error={errors.city}  required />
                  <CField id="co-state" label="State" autoComplete="address-level1" placeholder="DC"    value={fields.state} onChange={v => setField('state', v)} onBlur={() => blur('state')} error={errors.state} required />
                  <CField id="co-zip"   label="ZIP"   autoComplete="postal-code"    inputMode="numeric" value={fields.zip}   onChange={v => setField('zip',   v)} onBlur={() => blur('zip')}   error={errors.zip}   required />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {hasItems && step === 'cart' && (
          <div className="cart-footer">
            {!hasShippingItems && (
              <div className="cart-tray-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Full Tray serves ≈ 30–40 people
              </div>
            )}
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            {hasMpItems && <p className="cart-mp-note">* Market price items quoted on confirmation.</p>}
            {hasLocalItems && hasShippingItems && (
              <div className="cart-mixed-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Local catering and shipped items check out separately.
              </div>
            )}
            {hasLocalItems && (
              <button className="btn btn-primary btn-full" onClick={handleLocalCheckout}>
                {hasShippingItems ? 'Order Local Catering →' : 'Proceed to Order Form'}
              </button>
            )}
            {hasShippingItems && (
              <button className="btn btn-full cart-ship-pay-btn" onClick={() => setStep('checkout')}>
                {hasLocalItems ? 'Checkout Shipped Items →' : 'Checkout: Enter Shipping Info'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: 8 }}>
                  <path d="M7 17L17 7M17 7H8M17 7v9"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="cart-footer">
            <p className="submit-disclaimer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Your info is saved, then you'll complete payment on Stripe.
            </p>
            <button
              type="submit"
              form="ship-checkout-form"
              className="btn btn-full cart-ship-pay-btn"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'Saving…' : `Continue to Payment: $${shippingTotal.toFixed(2)}`}
              {!submitting && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: 8 }}>
                  <path d="M7 17L17 7M17 7H8M17 7v9"/>
                </svg>
              )}
            </button>
            <p className="ship-secure-note" style={{ justifyContent: 'center', marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure checkout · Card, Apple Pay, Google Pay
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function CField({ id, label, type = 'text', placeholder, hint, value, onChange, onBlur, error, required, autoComplete, inputMode }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      <input
        type={type} id={id} name={id} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
        required={required} autoComplete={autoComplete} inputMode={inputMode}
        aria-required={required} aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${hint ? `ch-${id} ` : ''}${error ? `ce-${id}` : ''}`}
      />
      {hint  && <span className="fhint" id={`ch-${id}`}>{hint}</span>}
      {error && <span className="ferr"  id={`ce-${id}`} role="alert">{error}</span>}
    </div>
  );
}

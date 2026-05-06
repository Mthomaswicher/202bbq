import { useEffect, useRef } from 'react';
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

export default function CartDrawer() {
  const {
    cart, cartCount, cartTotal, hasMpItems,
    hasLocalItems, hasShippingItems,
    adjustQty, removeFromCart, cartOpen, closeCart,
  } = useCart();
  const { addToast } = useToast();
  const closeRef = useRef(null);
  const lastFocusRef = useRef(null);

  const entries = Object.entries(cart);
  const hasItems = entries.length > 0;

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

  const handleLocalCheckout = () => {
    closeCart();
    smoothScrollTo('order');
  };

  const handleStripeCheckout = () => {
    const shippingEntries = Object.values(cart).filter(e => e.type === 'shipping');
    // Group by stripeLink so each pack type opens the correct link
    const byLink = {};
    for (const entry of shippingEntries) {
      if (!entry.stripeLink) continue;
      byLink[entry.stripeLink] = (byLink[entry.stripeLink] || 0) + entry.qty;
    }
    for (const [link, qty] of Object.entries(byLink)) {
      window.open(`${link}?quantity=${qty}`, '_blank', 'noopener,noreferrer');
    }
  };

  const sizeLabel = (size, type) => {
    if (size === 'full')  return 'Full Tray';
    if (size === 'half')  return 'Half Tray';
    if (size === 'each')  return 'Per Steak';
    if (type === 'shipping') return size.replace('-p', '-P'); // "5-Pack"
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
        aria-label="Your order"
        aria-hidden={!cartOpen}
      >
        {/* Header */}
        <div className="cart-header">
          <h2>Your Cart {cartCount > 0 && <span style={{ color: 'var(--ember)', fontSize: '1.1rem' }}>({cartCount})</span>}</h2>
          <button ref={closeRef} className="cart-close" onClick={closeCart} aria-label="Close cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {!hasItems ? (
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
                      {isShipping && (
                        <span className="cart-item-ship-badge">Ships Nationwide 🚚</span>
                      )}
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => adjustQty(key, -1)} aria-label={`Decrease ${item.name}`}>−</button>
                        <span className="qty-display" aria-label={`${qty} of ${item.name}`}>{qty}</span>
                        <button className="qty-btn" onClick={() => adjustQty(key, 1)}  aria-label={`Increase ${item.name}`}>+</button>
                        <button className="remove-btn" onClick={() => handleRemove(key, item.name)} aria-label={`Remove ${item.name}`}>Remove</button>
                      </div>
                    </div>
                    <span className="cart-item-price">{priceStr}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
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

            {/* Mixed cart notice */}
            {hasLocalItems && hasShippingItems && (
              <div className="cart-mixed-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Local catering and shipped items check out separately.
              </div>
            )}

            {/* Local order CTA */}
            {hasLocalItems && (
              <button className="btn btn-primary btn-full" onClick={handleLocalCheckout}>
                {hasShippingItems
                  ? 'Order Local Catering →'
                  : 'Proceed to Order Form'}
              </button>
            )}

            {/* Stripe CTA for shipped items */}
            {hasShippingItems && (
              <button className="btn btn-full cart-ship-pay-btn" onClick={handleStripeCheckout}>
                {hasLocalItems ? 'Pay for Shipped Items' : 'Checkout — Pay Now'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ marginLeft: 8 }}>
                  <path d="M7 17L17 7M17 7H8M17 7v9"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

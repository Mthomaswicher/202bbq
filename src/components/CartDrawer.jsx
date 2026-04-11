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
  const { cart, cartCount, cartTotal, hasMpItems, adjustQty, removeFromCart, cartOpen, closeCart } = useCart();
  const { addToast } = useToast();
  const closeRef = useRef(null);
  const lastFocusRef = useRef(null);

  const entries = Object.entries(cart);
  const hasItems = entries.length > 0;

  // Focus trap
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

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && cartOpen) closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cartOpen, closeCart]);

  const handleRemove = (key, name) => {
    removeFromCart(key);
    addToast(`${name} removed`, 'info');
  };

  const handleProceed = () => {
    closeCart();
    smoothScrollTo('order');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay${cartOpen ? ' visible' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
        style={{ pointerEvents: cartOpen ? 'auto' : 'none' }}
      />

      {/* Drawer */}
      <div
        className={`cart-drawer${cartOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        aria-hidden={!cartOpen}
      >
        {/* Header */}
        <div className="cart-header">
          <h2>Your Order {cartCount > 0 && <span style={{ color: 'var(--ember)', fontSize: '1.1rem' }}>({cartCount})</span>}</h2>
          <button ref={closeRef} className="cart-close" onClick={closeCart} aria-label="Close cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
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
              {entries.map(([key, { item, size, price, qty }]) => {
                const sizeLabel = size === 'full' ? 'Full Tray' : size === 'half' ? 'Half Tray' : size === 'each' ? 'Per Steak' : 'Market Price';
                const priceStr  = typeof price === 'number' ? fmt(price * qty) : 'MP*';
                return (
                  <li key={key} className="cart-item">
                    <span className="cart-item-emoji" aria-hidden="true">{item.emoji}</span>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-size">{sizeLabel}</div>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => adjustQty(key, -1)} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                        <span className="qty-display" aria-label={`${qty} of ${item.name}`}>{qty}</span>
                        <button className="qty-btn" onClick={() => adjustQty(key, 1)}  aria-label={`Increase quantity of ${item.name}`}>+</button>
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
            <div className="cart-tray-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Full Tray serves ≈ 30–40 people
            </div>
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            {hasMpItems && <p className="cart-mp-note">* Market price items will be quoted on confirmation.</p>}
            <button className="btn btn-primary btn-full" onClick={handleProceed}>
              Proceed to Order Form
            </button>
          </div>
        )}
      </div>
    </>
  );
}

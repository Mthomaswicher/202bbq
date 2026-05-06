import { useState } from 'react';
import { SHIPPING_PRODUCTS } from '../data/menu.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ShippingSection() {
  const product = SHIPPING_PRODUCTS[0];
  const [pack, setPack]     = useState(product.packs[0]);
  const [flavor, setFlavor] = useState(product.flavors[0]);
  const [qty, setQty]       = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  const total = pack.price * qty;

  const handleAddToCart = () => {
    addToCart(
      { id: product.id, name: product.name, emoji: '🍲' },
      pack.id,
      { type: 'shipping', flavor, price: pack.price, stripeLink: pack.stripeLink, qty }
    );
    addToast(`${product.name} — ${pack.label} (${flavor}) added to cart`, 'success');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    openCart();
  };

  return (
    <section className="shipping-section" id="shipping" aria-labelledby="shipping-heading">
      <div className="container">
        <div className="shipping-layout">

          {/* Left: product info */}
          <div className="ship-product-panel">
            <p className="ship-eyebrow">Now Shipping Nationwide 🚚</p>
            <h2 className="ship-product-title" id="shipping-heading">{product.name}</h2>
            <p className="ship-product-desc">{product.desc}</p>
            <ul className="ship-trust-list">
              <li>🧊 Ships in insulated, frozen packaging</li>
              <li>🔒 Vacuum-sealed for freshness</li>
              <li>⏱️ Reheats in under 20 minutes</li>
              <li>🌎 Delivered anywhere in the US</li>
            </ul>
          </div>

          {/* Right: selector panel */}
          <div className="ship-selector-panel">
            <div className="ship-free-shipping-badge">✓ FREE Shipping on Every Order</div>
            <div className="ship-price" aria-live="polite">${total.toFixed(2)}</div>
            <hr className="ship-divider" />

            <div className="ship-selector-group">
              <p className="ship-selector-label">
                Pack: <span className="ship-selector-value">{pack.label}</span>
              </p>
              <div className="ship-pill-grid" role="radiogroup" aria-label="Pack size">
                {product.packs.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={pack.id === p.id}
                    className={`ship-pill${pack.id === p.id ? ' active' : ''}`}
                    onClick={() => setPack(p)}
                  >
                    {p.label}
                    {p.tag && <span className="ship-pill-tag">{p.tag}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="ship-selector-group">
              <p className="ship-selector-label">
                Flavor: <span className="ship-selector-value">{flavor}</span>
              </p>
              <div className="ship-pill-grid" role="radiogroup" aria-label="Flavor">
                {product.flavors.map(f => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={flavor === f}
                    className={`ship-pill${flavor === f ? ' active' : ''}`}
                    onClick={() => setFlavor(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="ship-selector-group">
              <p className="ship-selector-label">Quantity:</p>
              <div className="ship-qty-pill" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span aria-live="polite" aria-atomic="true">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)} aria-label="Increase">+</button>
              </div>
            </div>

            <button
              className={`btn btn-lg btn-full ship-atc-btn${justAdded ? ' added' : ''}`}
              onClick={handleAddToCart}
            >
              {justAdded ? '✔ Added to Cart' : 'Add to Cart'}
            </button>

            <p className="ship-secure-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure checkout · Card, Apple Pay, Google Pay
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

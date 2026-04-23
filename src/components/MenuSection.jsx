import { useState, useCallback, useEffect, useRef } from 'react';
import { MENU, MENU_CATEGORIES } from '../data/menu.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { burstEmbers } from '../lib/emberBurst.js';

const fmt = n => (typeof n === 'number' ? `$${n.toFixed(0)}` : String(n));

function useTilt() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) return;
    const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;
    if (!canHover) return;
    let raf = 0;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return ref;
}

function MenuCard({ item }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState('');
  const tiltRef = useTilt();

  const isRibeyes  = Boolean(item.unit);
  const fullAvail  = item.full !== null;
  const halfAvail  = item.half !== null;
  const fullIsMp   = item.full === 'MP';
  const halfIsMp   = item.half === 'MP';

  const handleAdd = useCallback((size, e) => {
    const name = addToCart(item, size);
    const label = size === 'full' ? 'Full Tray' : size === 'half' ? 'Half Tray' : size === 'each' ? 'per steak' : 'Market Price';
    addToast(`${name} (${label}) added to cart`, 'success');
    setAdded(size);
    setTimeout(() => setAdded(''), 1400);
    if (e && size !== 'mp') {
      burstEmbers(e.clientX, e.clientY);
    }
  }, [item, addToCart, addToast]);

  return (
    <article className="menu-card" aria-label={item.name} ref={tiltRef}>
      <div className="menu-card-top">
        <h3 className="menu-card-name">
          {item.name}
          {item.unit && <span className="menu-card-unit">(per steak)</span>}
        </h3>
      </div>

      <div className="menu-card-prices">
        {/* Full / Per-steak column */}
        <div className="price-col">
          <span className="price-label">{isRibeyes ? 'Per Steak' : 'Full Tray*'}</span>
          {!fullAvail
            ? <span className="price-na">—</span>
            : fullIsMp
              ? <span className="price-value is-mp">Call</span>
              : <span className="price-value">{fmt(item.full)}</span>
          }
          {fullAvail && !fullIsMp && <span className="price-serves">≈ 30–40 people</span>}
        </div>

        {/* Half column (not for ribeyes) */}
        {!isRibeyes && (
          <div className="price-col">
            <span className="price-label">Half Tray</span>
            {!halfAvail
              ? <span className="price-na">—</span>
              : halfIsMp
                ? <span className="price-value is-mp">Call</span>
                : <span className="price-value">{fmt(item.half)}</span>
            }
            {halfAvail && !halfIsMp && <span className="price-serves">≈ 15–20 people</span>}
          </div>
        )}
      </div>

      <div className="menu-card-actions">
        {isRibeyes && (
          <button
            className={`add-btn${added === 'each' ? ' added' : ''}`}
            onClick={(e) => handleAdd('each', e)}
            aria-label={`Add ${item.name} per steak to cart`}
          >
            {added === 'each' ? '✔ Added' : '+ Add (per steak)'}
          </button>
        )}

        {!isRibeyes && fullAvail && (
          fullIsMp
            ? <button className="add-btn is-mp" onClick={(e) => handleAdd('mp', e)} aria-label={`Request full tray of ${item.name}`}>Request Full Tray</button>
            : <button className={`add-btn${added === 'full' ? ' added' : ''}`} onClick={(e) => handleAdd('full', e)} aria-label={`Add full tray of ${item.name} for ${fmt(item.full)}`}>
                {added === 'full' ? '✔ Added' : '+ Full Tray'}
              </button>
        )}

        {!isRibeyes && halfAvail && (
          halfIsMp
            ? <button className="add-btn is-mp" onClick={(e) => handleAdd('mp', e)} aria-label={`Request half tray of ${item.name}`}>Request Half Tray</button>
            : <button className={`add-btn${added === 'half' ? ' added' : ''}`} onClick={(e) => handleAdd('half', e)} aria-label={`Add half tray of ${item.name} for ${fmt(item.half)}`}>
                {added === 'half' ? '✔ Added' : '+ Half Tray'}
              </button>
        )}

        {/* MP-only with no half */}
        {!isRibeyes && fullIsMp && !halfAvail && (
          <button className="add-btn is-mp" onClick={(e) => handleAdd('mp', e)}>Request a Quote</button>
        )}
      </div>
    </article>
  );
}

export default function MenuSection() {
  const [activeTab, setActiveTab] = useState('beef');

  return (
    <section className="menu-section" id="menu" aria-labelledby="menu-heading">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">The Menu</p>
          <h2 className="section-title" id="menu-heading">Order by the Tray</h2>
          <p className="section-sub">
            Everything smoked low and slow over hardwood. Full trays serve ≈ 30–40 people. Half trays serve ≈ 15–20.
          </p>
        </div>

        {/* Tabs */}
        <div className="menu-tabs" role="tablist" aria-label="Menu categories">
          {MENU_CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              className={`menu-tab${activeTab === key ? ' active' : ''}`}
              aria-selected={activeTab === key}
              aria-controls={`panel-${key}`}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {MENU_CATEGORIES.map(({ key }) => (
          <div
            key={key}
            id={`panel-${key}`}
            role="tabpanel"
            aria-labelledby={`tab-${key}`}
            hidden={activeTab !== key}
          >
            {activeTab === key && (
              <div className="menu-grid">
                {MENU[key].map(item => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="menu-note">
          * Full Tray serves ≈ 30–40 people &nbsp;·&nbsp; MP = Market Price, call{' '}
          <a href="tel:2029978912" className="inline-link">202-997-8912</a> to quote
        </p>
      </div>
    </section>
  );
}

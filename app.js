/* =============================================
   202BBQ App Logic
   ============================================= */
'use strict';

// ---- Real Menu Data (from 202BBQ menu) ----
// full / half prices in dollars. null = not available. 'MP' = market price.
// ribeyes: priced per steak (full col = per steak, no half tray)
const MENU = {
  beef: [
    {
      id: 'chuck-burnt-ends',
      name: 'Chuck Roast Burnt Ends',
      desc: 'Chuck roast smoked to melt-in-your-mouth perfection, cut into burnt end cubes and finished in our house sauce.',
      full: 150, half: null,
    },
    {
      id: 'brisket',
      name: 'Brisket',
      desc: '17–18 lb whole brisket smoked overnight over hardwood. Bark for days. Sliced or chopped on order.',
      full: 235, half: null,
    },
    {
      id: 'ox-tails',
      name: 'Ox Tails',
      desc: 'Slow-smoked then braised until fall-off-the-bone tender. A DC classic, done the 202 way.',
      full: 185, half: 130,
    },
    {
      id: 'beef-ribs',
      name: 'Beef Ribs',
      desc: 'Dinosaur-sized beef short ribs smoked over oak for 10+ hours. Pricing varies by market. Call to quote.',
      full: 'MP', half: 'MP',
    },
    {
      id: 'smoked-burgers',
      name: 'Smoked Burgers',
      desc: 'Hand-pressed beef patties smoked low and slow before a hot finish. Served with all the fixings.',
      full: 130, half: 90,
    },
    {
      id: 'ribeyes',
      name: 'Ribeyes',
      desc: 'Thick-cut ribeyes seasoned with our Hill Rub and smoked to a perfect medium-rare finish.',
      full: 30, half: null,
      unit: 'per steak',
    },
  ],
  pork: [
    {
      id: 'pulled-pork',
      name: 'Pulled Pork',
      desc: 'Bone-in pork shoulder smoked for 14+ hours until it pulls apart with two fingers. Served with house vinegar sauce.',
      full: 165, half: 120,
    },
    {
      id: 'pork-ribs',
      name: 'Pork Ribs',
      desc: 'St. Louis spare ribs rubbed and smoked until they hit that perfect bend test. Glazed to order.',
      full: 175, half: 120,
    },
  ],
  chicken: [
    {
      id: 'wings',
      name: 'Wings',
      desc: 'Whole wings seasoned with our Hill Rub and smoked until the skin crisps up and the meat stays juicy.',
      full: 150, half: 90,
    },
    {
      id: 'thighs',
      name: 'Thighs',
      desc: 'Bone-in, skin-on chicken thighs smoked low and slow. Consistently the most-requested cut we make.',
      full: 140, half: 90,
    },
    {
      id: 'drumsticks',
      name: 'Drumsticks',
      desc: 'Smoked drumsticks with a crispy seasoned skin. Great for crowds. Finger food done right.',
      full: 140, half: 90,
    },
  ],
  sides: [
    {
      id: 'smoked-salmon',
      name: 'Smoked Salmon',
      desc: 'Atlantic salmon cold-smoked over cherry wood. Silky, rich, and impossible not to double-dip.',
      full: 330, half: 200,
    },
    {
      id: 'half-smokes',
      name: 'Half Smokes',
      desc: "DC's own. Beef and pork half-smoke sausages smoked until the casing snaps. A Capitol Hill tradition.",
      full: 150, half: 110,
    },
    {
      id: 'half-smoke-burnt-ends',
      name: 'Half Smoke Burnt Ends',
      desc: 'Half smokes re-cut into burnt end bites and finished low and slow in our smoky glaze. A 202 original.',
      full: 165, half: 125,
    },
    {
      id: 'lamb-chops',
      name: 'Lamb Chops',
      desc: 'Frenched lamb chops seasoned with herbs and smoked. Priced at market. Contact us for availability and quote.',
      full: 'MP', half: null,
    },
    {
      id: 'collard-greens',
      name: 'Collard Greens',
      desc: 'Slow-braised Southern-style collard greens with smoked turkey neck, apple cider vinegar, and brown sugar.',
      full: 150, half: 125,
    },
    {
      id: 'mac-cheese',
      name: 'Mac and Cheese',
      desc: 'Three-cheese baked mac and cheese topped with smoked brisket bits and a golden breadcrumb crust.',
      full: 175, half: 145,
    },
    {
      id: 'mashed-potatoes',
      name: 'Mashed Potatoes',
      desc: 'Buttery, creamy mashed potatoes made with real butter and cream. Simple, perfect, crowd-pleasing.',
      full: 130, half: 100,
    },
    {
      id: 'kickin-coleslaw',
      name: "Kickin' Coleslaw",
      desc: 'Creamy vinegar slaw with jalapeño, celery seed, and a kick of heat. The essential BBQ counterpart.',
      full: 120, half: 85,
    },
    {
      id: 'seafood-salad',
      name: 'Seafood Salad',
      desc: 'Fresh mixed seafood salad with shrimp, crab, and more, tossed in a light, herbed dressing.',
      full: 250, half: null,
    },
  ],
};

// Category display names
const CAT_NAMES = { beef: 'Beef', pork: 'Pork', chicken: 'Chicken', sides: 'Sides & More' };

// ---- Cart State ----
// key = `${itemId}::${size}` where size = 'full' | 'half' | 'each' | 'mp'
const cart = {};

// ---- Utility ----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = n => (typeof n === 'number') ? `$${n.toFixed(2)}` : String(n);

function findItem(id) {
  for (const items of Object.values(MENU)) {
    const m = items.find(i => i.id === id);
    if (m) return m;
  }
  return null;
}

function cartTotal() {
  return Object.values(cart).reduce((s, { price, qty }) => {
    return typeof price === 'number' ? s + price * qty : s;
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((s, { qty }) => s + qty, 0);
}

function hasMpItems() {
  return Object.values(cart).some(({ price }) => price === 'MP');
}

// ---- Toasts ----
function toast(msg, type = 'info', ms = 3200) {
  const icons = { success: '✔', error: '✘', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span aria-hidden="true">${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, ms);
}

// ---- Cart Rendering ----
function renderCart() {
  const count  = cartCount();
  const total  = cartTotal();
  const hasItems = count > 0;
  const hasMp  = hasMpItems();

  // Badge
  const badge = $('#cart-count');
  badge.textContent = count > 0 ? count : '';

  // Aria label on cart button
  $('#cart-toggle')?.setAttribute('aria-label', `View cart, ${count} item${count !== 1 ? 's' : ''}`);

  // Empty / items
  $('#cart-empty').hidden = hasItems;
  const itemsList = $('#cart-items');
  itemsList.innerHTML = '';
  const footer = $('#cart-footer');
  footer.hidden = !hasItems;

  if (hasItems) {
    Object.entries(cart).forEach(([key, { item, size, price, qty }]) => {
      const sizeLabel = size === 'full' ? 'Full Tray' : size === 'half' ? 'Half Tray' : size === 'each' ? 'Per Steak' : 'Market Price';
      const priceStr = typeof price === 'number' ? fmt(price * qty) : 'MP*';
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">${sizeLabel}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" data-key="${key}" aria-label="Decrease quantity">−</button>
            <span class="qty-display" aria-label="${qty} of ${item.name}">${qty}</span>
            <button class="qty-btn" data-action="inc" data-key="${key}" aria-label="Increase quantity">+</button>
            <button class="remove-btn" data-action="remove" data-key="${key}" aria-label="Remove ${item.name}">Remove</button>
          </div>
        </div>
        <span class="cart-item-price">${priceStr}</span>
      `;
      itemsList.appendChild(li);
    });

    $('#cart-subtotal').textContent = fmt(total);
    const mpNote = $('#cart-mp-note');
    if (mpNote) mpNote.hidden = !hasMp;
  }

  // Sync order summary sidebar
  syncOrderSummary();
}

function syncOrderSummary() {
  const hasItems = cartCount() > 0;
  const hasMp = hasMpItems();
  const total = cartTotal();

  const emptyEl = $('#os-empty');
  const listEl  = $('#os-list');
  const totalEl = $('#os-total');
  const totalVal = $('#os-total-val');
  const mpNote   = $('#os-mp-note');
  if (!emptyEl) return;

  emptyEl.hidden = hasItems;
  listEl.innerHTML = '';

  if (hasItems) {
    Object.values(cart).forEach(({ item, size, price, qty }) => {
      const sizeLabel = size === 'full' ? 'Full' : size === 'half' ? 'Half' : size === 'each' ? 'ea.' : 'MP';
      const priceStr = typeof price === 'number' ? fmt(price * qty) : 'MP*';
      const li = document.createElement('li');
      li.className = 'os-item';
      li.innerHTML = `<span class="os-item-name">${qty}× ${item.name} <em style="font-size:.72rem;color:var(--ash);font-style:normal">(${sizeLabel})</em></span><span class="os-item-price">${priceStr}</span>`;
      listEl.appendChild(li);
    });
    totalEl.hidden = false;
    totalVal.textContent = fmt(total);
    if (mpNote) mpNote.hidden = !hasMp;
  } else {
    totalEl.hidden = true;
    if (mpNote) mpNote.hidden = true;
  }
}

// ---- Cart Actions ----
function addToCart(itemId, size) {
  const item = findItem(itemId);
  if (!item) return;

  let price;
  if (size === 'full')  price = item.full;
  else if (size === 'half')  price = item.half;
  else if (size === 'each')  price = item.full;   // ribeyes priced per steak
  else if (size === 'mp')    price = 'MP';

  const key = `${itemId}::${size}`;
  if (cart[key]) {
    cart[key].qty += 1;
  } else {
    cart[key] = { item, size, price, qty: 1 };
  }

  renderCart();
  const sizeLabel = size === 'full' ? 'Full Tray' : size === 'half' ? 'Half Tray' : size === 'each' ? 'per steak' : 'Market Price';
  toast(`${item.name} (${sizeLabel}) added`, 'success');
}

function adjustQty(key, delta) {
  if (!cart[key]) return;
  cart[key].qty += delta;
  if (cart[key].qty <= 0) delete cart[key];
  renderCart();
}

function removeFromCart(key) {
  if (!cart[key]) return;
  const name = cart[key].item.name;
  delete cart[key];
  renderCart();
  toast(`${name} removed`, 'info');
}

// ---- Cart Drawer ----
let _lastFocus = null;

function openCart() {
  _lastFocus = document.activeElement;
  $('#cart-drawer').hidden = false;
  $('#cart-overlay').hidden = false;
  $('#cart-overlay').removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  $('#cart-toggle').setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => $('#cart-close')?.focus());
}

function closeCart() {
  $('#cart-drawer').hidden = true;
  $('#cart-overlay').hidden = true;
  $('#cart-overlay').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  $('#cart-toggle').setAttribute('aria-expanded', 'false');
  _lastFocus?.focus();
}

function trapFocus(e) {
  const drawer = $('#cart-drawer');
  if (!drawer || drawer.hidden) return;
  if (e.key === 'Escape') { closeCart(); return; }
  if (e.key !== 'Tab') return;
  const els = $$('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])', drawer).filter(el => !el.closest('[hidden]'));
  if (!els.length) return;
  const first = els[0], last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// ---- Menu Card Builder ----
function buildCard(item) {
  const isRibeyes = Boolean(item.unit); // ribeyes priced per steak

  const fullAvail  = item.full !== null;
  const halfAvail  = item.half !== null;
  const fullIsMp   = item.full === 'MP';
  const halfIsMp   = item.half === 'MP';

  const fullPriceHtml = !fullAvail ? '<span class="price-unavail">N/A</span>' :
    fullIsMp ? '<span class="price-value is-mp">Call</span>' :
    `<span class="price-value">${fmt(item.full)}</span>`;

  const halfPriceHtml = !halfAvail ? '<span class="price-unavail">N/A</span>' :
    halfIsMp ? '<span class="price-value is-mp">Call</span>' :
    `<span class="price-value">${fmt(item.half)}</span>`;

  // Action buttons
  let actionsHtml = '';
  if (isRibeyes) {
    actionsHtml = `<button class="add-btn" data-id="${item.id}" data-size="each" aria-label="Add ${item.name} per steak to cart">+ Add (per steak)</button>`;
  } else {
    if (fullAvail) {
      if (fullIsMp) {
        actionsHtml += `<button class="add-btn is-mp" data-id="${item.id}" data-size="mp" aria-label="Request market price for full tray of ${item.name}">Request Full Tray</button>`;
      } else {
        actionsHtml += `<button class="add-btn" data-id="${item.id}" data-size="full" aria-label="Add full tray of ${item.name} for ${fmt(item.full)} to cart">+ Full Tray</button>`;
      }
    }
    if (halfAvail) {
      if (halfIsMp) {
        actionsHtml += `<button class="add-btn is-mp" data-id="${item.id}" data-size="mp" aria-label="Request market price for half tray of ${item.name}">Request Half Tray</button>`;
      } else {
        actionsHtml += `<button class="add-btn" data-id="${item.id}" data-size="half" aria-label="Add half tray of ${item.name} for ${fmt(item.half)} to cart">+ Half Tray</button>`;
      }
    }
    // MP-only items with no half
    if (fullIsMp && !halfAvail) {
      actionsHtml = `<button class="add-btn is-mp" data-id="${item.id}" data-size="mp" aria-label="Request market price for ${item.name}">Request a Quote</button>`;
    }
  }

  // Serves label
  const fullServesHtml = fullAvail && !fullIsMp
    ? `<span class="price-serves">≈30–40 people</span>` : '';
  const halfServesHtml = halfAvail && !halfIsMp
    ? `<span class="price-serves">≈15–20 people</span>` : '';

  const colLabel = isRibeyes ? 'Per Steak' : 'Full Tray*';
  const col2Label = isRibeyes ? '' : 'Half Tray';

  const card = document.createElement('article');
  card.className = 'menu-card';
  card.setAttribute('aria-label', item.name);
  card.innerHTML = `
    <div class="menu-card-top">
      <h3 class="menu-card-name">${item.name}${item.unit ? ` <small style="font-size:.7em;color:var(--ash);font-weight:500">(per steak)</small>` : ''}</h3>
      <p class="menu-card-desc">${item.desc}</p>
    </div>
    <div class="menu-card-prices">
      <div class="price-col">
        <span class="price-label">${colLabel}</span>
        ${fullPriceHtml}
        ${fullServesHtml}
      </div>
      ${!isRibeyes ? `<div class="price-col">
        <span class="price-label">${col2Label}</span>
        ${halfPriceHtml}
        ${halfServesHtml}
      </div>` : ''}
    </div>
    <div class="menu-card-actions">${actionsHtml}</div>
  `;
  return card;
}

function renderMenus() {
  Object.entries(MENU).forEach(([cat, items]) => {
    const grid = $(`#grid-${cat}`);
    if (!grid) return;
    const frag = document.createDocumentFragment();
    items.forEach(item => frag.appendChild(buildCard(item)));
    grid.appendChild(frag);
  });
}

// ---- Menu Tabs ----
function initTabs() {
  const tabs = $$('.menu-tab');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      $$('.menu-panel').forEach(p => { p.hidden = true; });
      const panel = $(`#panel-${tab.dataset.cat}`);
      if (panel) panel.hidden = false;
    });
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { tabs[(i + 1) % tabs.length].focus(); tabs[(i + 1) % tabs.length].click(); }
      if (e.key === 'ArrowLeft')  { tabs[(i - 1 + tabs.length) % tabs.length].focus(); tabs[(i - 1 + tabs.length) % tabs.length].click(); }
    });
  });
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const btn = $('#mobile-menu-btn');
  const nav = $('#mobile-nav');
  let open = false;
  btn?.addEventListener('click', () => {
    open = !open;
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('.mnl').forEach(link => link.addEventListener('click', () => {
    open = false; nav.hidden = true;
    btn?.setAttribute('aria-expanded', 'false');
    btn?.setAttribute('aria-label', 'Open menu');
  }));
}

// ---- Order Availability ----
function renderAvailability() {
  const el = $('#avail-badge');
  if (!el) return;
  const d = new Date().getDay(); // 0=Sun … 6=Sat
  if (d >= 1 && d <= 4) {
    el.className = 'availability-badge open';
    el.textContent = '✔ Orders are open! Submit your request below for this weekend.';
  } else if (d === 5) {
    el.className = 'availability-badge closed';
    el.textContent = '⏰ Order window closed (Mon–Thu only). Check back Monday!';
  } else {
    el.className = 'availability-badge closed';
    el.textContent = `🔥 Happy ${d === 6 ? 'Saturday' : 'Sunday'}! Enjoy. Orders for next weekend open Monday.`;
  }
}

// ---- Form Validation ----
function validateInput(input) {
  const errId = `e-${input.id}`;
  const errEl = $(`#${errId}`);
  let msg = '';
  if (input.required && !input.value.trim()) msg = 'This field is required.';
  else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = 'Enter a valid email address.';
  else if (input.type === 'tel'   && input.value && !/^[\d\s().+\-]{7,}$/.test(input.value)) msg = 'Enter a valid phone number.';
  if (errEl) errEl.textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

function validateForm(form) {
  let ok = true;
  $$('input[required], textarea[required]', form).filter(f => !f.closest('[hidden]')).forEach(f => { if (!validateInput(f)) ok = false; });
  if (!$$('input[name="fulfillment"]', form).some(r => r.checked)) { toast('Please choose pickup or delivery.', 'error'); ok = false; }
  if (!$$('input[name="day"]', form).some(r => r.checked))         { toast('Please choose Saturday or Sunday.', 'error'); ok = false; }
  return ok;
}

// ---- Order Form ----
function initOrderForm() {
  const form = $('#order-form');
  if (!form) return;

  // Live validation on blur
  $$('input, textarea', form).forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateInput(input); });
  });

  // Delivery address toggle
  $$('input[name="fulfillment"]').forEach(r => {
    r.addEventListener('change', () => {
      const ag = $('#addr-group');
      const ai = $('#address');
      const isDelivery = r.value === 'delivery' && r.checked;
      ag.hidden = !isDelivery;
      ai.required = isDelivery;
      ai.setAttribute('aria-required', isDelivery.toString());
      if (!isDelivery) { ai.value = ''; ai.setAttribute('aria-invalid', 'false'); }
    });
  });

  // Cart checkout button closes drawer first
  $('#cart-checkout-btn')?.addEventListener('click', closeCart);

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (cartCount() === 0) { toast('Add items to your order first.', 'error'); return; }
    if (!validateForm(form)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const fd = new FormData(form);
    const payload = {
      customer: { firstName: fd.get('fname'), lastName: fd.get('lname'), email: fd.get('email'), phone: fd.get('phone') },
      fulfillment: fd.get('fulfillment'),
      address: fd.get('address') || null,
      day: fd.get('day'),
      notes: fd.get('notes') || null,
      items: Object.values(cart).map(({ item, size, price, qty }) => ({
        id: item.id, name: item.name, size, qty,
        unitPrice: price, lineTotal: typeof price === 'number' ? price * qty : 'MP',
      })),
      subtotal: cartTotal(),
      hasMpItems: hasMpItems(),
      submittedAt: new Date().toISOString(),
    };

    // Log for now. Swap in fetch() to your backend / Formspree / Netlify Forms
    console.log('202BBQ Order Request:', JSON.stringify(payload, null, 2));
    // Example backend call:
    // fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    // Show success screen
    form.closest('.order-section').hidden = true;
    const success = $('#order-success');
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    success.querySelector('h2')?.focus();

    // Clear cart
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
  });
}

// ---- Smooth Scroll ----
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const hh = $('.site-header')?.offsetHeight || 0;
      const bh = $('.announcement-bar')?.offsetHeight || 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - hh - bh - 12, behavior: 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });
}

// ---- Event Delegation ----
function initEvents() {
  // Cart toggle / close
  $('#cart-toggle')?.addEventListener('click', openCart);
  $('#cart-close')?.addEventListener('click', closeCart);
  $('#cart-overlay')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', trapFocus);

  // Cart item controls (qty, remove)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, key } = btn.dataset;
    if (action === 'inc')    adjustQty(key, 1);
    if (action === 'dec')    adjustQty(key, -1);
    if (action === 'remove') removeFromCart(key);
  });

  // Add to cart (menu cards)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn[data-id]');
    if (!btn || btn.dataset.action) return; // skip cart action buttons
    const { id, size } = btn.dataset;
    addToCart(id, size);
    // Visual feedback
    const orig = btn.innerHTML;
    btn.classList.add('added');
    btn.textContent = '✔ Added';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = orig; }, 1300);
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderMenus();
  initTabs();
  initMobileMenu();
  initEvents();
  initOrderForm();
  initSmoothScroll();
  renderAvailability();
  renderCart();
  // Footer year
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
});

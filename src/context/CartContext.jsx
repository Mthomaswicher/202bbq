import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getItem, getOption } from '../data/menu.js';
import { summarise } from '../lib/format.js';
import { local, KEYS, WEEK } from '../lib/storage.js';
import { track } from '../lib/analytics.js';

// The order in progress: tray lines, the headcount helper, the customer's
// details and the draft of the order form. Persisted for 7 days so a phone
// call or a reload never loses it (WCAG 3.3.7).

const CartContext = createContext(null);

const EMPTY = {
  lines: {},          // key `${itemId}::${optionId}` → { itemId, optionId, qty }
  headcount: null,    // number or null
  customer: { name: '', phone: '', email: '' },
  draft: { day: '', window: '', method: '', address: '', address2: '', notes: '' },
  savedAt: null,
};

function load() {
  const saved = local.get(KEYS.cart);
  if (!saved || !saved.savedAt || Date.now() - saved.savedAt > WEEK) return { ...EMPTY };
  // Drop lines whose item/option no longer exists in the menu.
  const lines = {};
  for (const [key, line] of Object.entries(saved.lines || {})) {
    if (getOption(line.itemId, line.optionId)) lines[key] = line;
  }
  return { ...EMPTY, ...saved, lines, customer: { ...EMPTY.customer, ...saved.customer }, draft: { ...EMPTY.draft, ...saved.draft } };
}

export function CartProvider({ children }) {
  const [state, setState] = useState(load);
  const [announcement, setAnnouncement] = useState('');
  const restoredAt = useRef(state.savedAt);   // when the restored cart was saved (for the RestoreLine)
  const [restoreDismissed, setRestoreDismissed] = useState(false);

  // Persist on every change.
  useEffect(() => {
    const hasAnything = Object.keys(state.lines).length || state.customer.name || state.customer.phone || state.draft.notes;
    if (!hasAnything) { local.remove(KEYS.cart); return; }
    local.set(KEYS.cart, { ...state, savedAt: state.savedAt ?? Date.now() });
  }, [state]);

  const announce = useCallback(msg => {
    setAnnouncement('');
    // let the live region clear so identical messages are re-announced
    requestAnimationFrame(() => setAnnouncement(msg));
  }, []);

  const lines = useMemo(() => Object.entries(state.lines).map(([key, l]) => {
    const item = getItem(l.itemId);
    const option = getOption(l.itemId, l.optionId);
    return item && option ? { key, item, option, qty: l.qty } : null;
  }).filter(Boolean), [state.lines]);

  const summary = useMemo(() => summarise(lines), [lines]);
  const lineCount = lines.length;

  const setQty = useCallback((itemId, optionId, qty, { announceIt = true } = {}) => {
    const item = getItem(itemId); const option = getOption(itemId, optionId);
    if (!item || !option) return;
    const key = `${itemId}::${optionId}`;
    const min = option.minQty ?? 1;
    setState(prev => {
      const next = { ...prev, lines: { ...prev.lines }, savedAt: Date.now() };
      if (qty < min) delete next.lines[key];
      else next.lines[key] = { itemId, optionId, qty };
      return next;
    });
    if (announceIt) {
      const label = option.unit ? `${qty} ${option.unit}${qty === 1 ? '' : 's'}` : `${option.label.toLowerCase()}`;
      announce(qty < min ? `${item.name} removed from your order.` : `${item.name}, ${label}, quantity ${qty}.`);
    }
  }, [announce]);

  const add = useCallback((itemId, optionId) => {
    const item = getItem(itemId); const option = getOption(itemId, optionId);
    if (!item || !option) return;
    const key = `${itemId}::${optionId}`;
    const qty = (state.lines[key]?.qty ?? 0) + (state.lines[key] ? 1 : (option.minQty ?? 1));
    setQty(itemId, optionId, qty, { announceIt: false });
    const price = typeof option.price === 'number' ? option.price : 0;
    track('add_to_cart', { currency: 'USD', value: price, items: [{ item_id: item.id, item_name: item.name, item_variant: option.id, price, quantity: 1 }] });
    announce(`${item.name}, ${option.label.toLowerCase()}, added to your order.`);
  }, [state.lines, setQty, announce]);

  const remove = useCallback((itemId, optionId) => {
    const key = `${itemId}::${optionId}`;
    const line = state.lines[key];
    setState(prev => { const next = { ...prev, lines: { ...prev.lines }, savedAt: Date.now() }; delete next.lines[key]; return next; });
    const item = getItem(itemId);
    if (item) announce(`${item.name} removed from your order.`);
    return line; // for undo
  }, [state.lines, announce]);

  const restoreLine = useCallback(line => {
    if (!line) return;
    setState(prev => ({ ...prev, lines: { ...prev.lines, [`${line.itemId}::${line.optionId}`]: line }, savedAt: Date.now() }));
  }, []);

  const clearLines = useCallback(() => setState(prev => ({ ...prev, lines: {}, savedAt: Date.now() })), []);
  const clearAll = useCallback(() => { setState({ ...EMPTY }); local.remove(KEYS.cart); }, []);

  const setHeadcount = useCallback(n => setState(prev => ({ ...prev, headcount: n, savedAt: Date.now() })), []);
  const setCustomer = useCallback(patch => setState(prev => ({ ...prev, customer: { ...prev.customer, ...patch }, savedAt: Date.now() })), []);
  const setDraft = useCallback(patch => setState(prev => ({ ...prev, draft: { ...prev.draft, ...patch }, savedAt: Date.now() })), []);

  const qtyOf = useCallback((itemId, optionId) => state.lines[`${itemId}::${optionId}`]?.qty ?? 0, [state.lines]);

  // The restore line shows when the restored cart is older than an hour.
  const restoredOld = Boolean(restoredAt.current && Date.now() - restoredAt.current > 60 * 60 * 1000 && lineCount > 0 && !restoreDismissed);

  const value = useMemo(() => ({
    lines, lineCount, summary, qtyOf, add, setQty, remove, restoreLine, clearLines, clearAll,
    headcount: state.headcount, setHeadcount,
    customer: state.customer, setCustomer,
    draft: state.draft, setDraft,
    restoredOld, restoredAt: restoredAt.current, dismissRestore: () => setRestoreDismissed(true),
    announcement, announce,
  }), [lines, lineCount, summary, qtyOf, add, setQty, remove, restoreLine, clearLines, clearAll, state.headcount, setHeadcount, state.customer, setCustomer, state.draft, setDraft, restoredOld, announcement, announce]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

// localStorage / sessionStorage that never throws (private mode, blocked storage).

function safe(store) {
  return {
    get(key, fallback = null) {
      try { const raw = store.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; }
    },
    set(key, value) {
      try { store.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key) { try { store.removeItem(key); } catch { /* ignore */ } },
  };
}

export const local = safe(typeof localStorage !== 'undefined' ? localStorage : { getItem() { return null; }, setItem() {}, removeItem() {} });
export const session = safe(typeof sessionStorage !== 'undefined' ? sessionStorage : { getItem() { return null; }, setItem() {}, removeItem() {} });

export const KEYS = {
  cart: '202bbq.order.v2',
  request: '202bbq.req',
  lastRequest: '202bbq.lastRequest',
  theme: '202bbq.theme',
  customer: '202bbq.customer',
};

export const WEEK = 7 * 24 * 60 * 60 * 1000;

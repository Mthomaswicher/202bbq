import { createContext, useContext, useState, useCallback } from 'react';
import { track } from '../lib/analytics.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState('cart');

  const entries = Object.values(cart);

  const cartCount        = entries.reduce((s, { qty }) => s + qty, 0);
  const cartTotal        = entries.reduce((s, { price, qty }) => typeof price === 'number' ? s + price * qty : s, 0);
  const hasMpItems       = entries.some(({ price }) => price === 'MP');
  const hasLocalItems    = entries.some(e => e.type !== 'shipping');
  const hasShippingItems = entries.some(e => e.type === 'shipping');

  // options: { type='local', flavor=null, stripeLink=null, price (shipping only), qty=1 }
  const addToCart = useCallback((item, size, options = {}) => {
    const { type = 'local', flavor = null, stripeLink = null, qty: addQty = 1 } = options;

    let price;
    if (type === 'shipping') {
      price = options.price;
    } else {
      if (size === 'full')  price = item.full;
      else if (size === 'half') price = item.half;
      else if (size === 'each') price = item.full;
      else if (size === 'mp')   price = 'MP';
    }

    const key = flavor ? `${item.id}::${size}::${flavor}` : `${item.id}::${size}`;

    setCart(prev => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], qty: prev[key].qty + addQty }
        : { item, size, price, qty: addQty, type, flavor, stripeLink },
    }));

    track('add_to_cart', {
      currency: 'USD',
      value: typeof price === 'number' ? price : 0,
      items: [{ item_id: item.id, item_name: item.name, item_variant: size, price: typeof price === 'number' ? price : 0, quantity: addQty }],
    });

    return item.name;
  }, []);

  const adjustQty = useCallback((key, delta) => {
    setCart(prev => {
      const entry = prev[key];
      if (!entry) return prev;
      const next = { ...prev };
      if (entry.qty + delta <= 0) delete next[key];
      else next[key] = { ...entry, qty: entry.qty + delta };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart(prev => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const clearCart          = useCallback(() => setCart({}), []);
  const clearShippingItems = useCallback(() =>
    setCart(prev => Object.fromEntries(Object.entries(prev).filter(([, e]) => e.type !== 'shipping'))),
  []);
  const openCart         = useCallback(() => { setCartInitialStep('cart');     setCartOpen(true); }, []);
  const openCartCheckout = useCallback(() => { setCartInitialStep('checkout'); setCartOpen(true); }, []);
  const closeCart        = useCallback(() => setCartOpen(false), []);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal, hasMpItems,
      hasLocalItems, hasShippingItems,
      addToCart, adjustQty, removeFromCart, clearCart, clearShippingItems,
      cartOpen, cartInitialStep, openCart, openCartCheckout, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

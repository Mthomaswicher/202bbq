import { createContext, useContext, useState, useCallback } from 'react';
import { track } from '../lib/analytics.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = Object.values(cart).reduce((s, { qty }) => s + qty, 0);

  const cartTotal = Object.values(cart).reduce((s, { price, qty }) =>
    typeof price === 'number' ? s + price * qty : s, 0);

  const hasMpItems = Object.values(cart).some(({ price }) => price === 'MP');

  const addToCart = useCallback((item, size) => {
    let price;
    if (size === 'full')  price = item.full;
    else if (size === 'half') price = item.half;
    else if (size === 'each') price = item.full;
    else if (size === 'mp')   price = 'MP';

    const key = `${item.id}::${size}`;
    setCart(prev => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], qty: prev[key].qty + 1 }
        : { item, size, price, qty: 1 },
    }));

    track('add_to_cart', {
      currency: 'USD',
      value: typeof price === 'number' ? price : 0,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_variant: size,
        price: typeof price === 'number' ? price : 0,
        quantity: 1,
      }],
    });

    return item.name;
  }, []);

  const adjustQty = useCallback((key, delta) => {
    setCart(prev => {
      const entry = prev[key];
      if (!entry) return prev;
      const next = { ...prev };
      if (entry.qty + delta <= 0) {
        delete next[key];
      } else {
        next[key] = { ...entry, qty: entry.qty + delta };
      }
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const openCart  = useCallback(() => setCartOpen(true),  []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal, hasMpItems,
      addToCart, adjustQty, removeFromCart, clearCart,
      cartOpen, openCart, closeCart,
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

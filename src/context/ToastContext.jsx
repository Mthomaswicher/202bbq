import { createContext, useContext, useState, useCallback, useRef } from 'react';

// Toasts are for undo and non-blocking notices only. They stay ≥ 8 seconds,
// pause while hovered or focused, and always have a Dismiss button. Anything
// that blocks a task is shown inline instead.

const ToastContext = createContext(null);
let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t.handle); timers.current.delete(id); }
  }, []);

  const schedule = useCallback((id, ms) => {
    const handle = setTimeout(() => removeToast(id), ms);
    timers.current.set(id, { handle, remaining: ms, startedAt: Date.now() });
  }, [removeToast]);

  const addToast = useCallback((message, { duration = 8000, action } = {}) => {
    const id = ++_id;
    setToasts(prev => [...prev.slice(-2), { id, message, action }]);
    schedule(id, duration);
    return id;
  }, [schedule]);

  const pause = useCallback(id => {
    const t = timers.current.get(id);
    if (!t) return;
    clearTimeout(t.handle);
    t.remaining = Math.max(2000, t.remaining - (Date.now() - t.startedAt));
  }, []);
  const resume = useCallback(id => {
    const t = timers.current.get(id);
    if (!t) return;
    schedule(id, t.remaining);
  }, [schedule]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, pause, resume }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

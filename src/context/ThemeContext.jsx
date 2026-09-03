import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { local, KEYS } from '../lib/storage.js';

// Light is the default for everyone, regardless of OS setting: positive
// polarity reads better for older eyes and the cream is the brand's paper.
// Dark is an opt-in switch in the footer. The boot script in index.html sets
// data-theme before first paint; this context keeps it in sync afterwards.

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => (local.get(KEYS.theme) === 'dark' ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    local.set(KEYS.theme, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#171310' : '#F4ECE0');
  }, [theme]);

  const setTheme = useCallback(t => setThemeState(t === 'dark' ? 'dark' : 'light'), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

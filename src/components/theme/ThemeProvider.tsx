'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'white' | 'onyx' | 'system';
export type ResolvedTheme = 'dark' | 'light' | 'white' | 'onyx';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'white',
  setTheme: () => {},
  resolvedTheme: 'white',
  mounted: false,
});

const STORAGE_KEY = 'server-rack-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const VALID_THEMES: Theme[] = ['dark', 'light', 'white', 'onyx', 'system'];
const THEME_CLASSES: ResolvedTheme[] = ['dark', 'light', 'white', 'onyx'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('white');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('white');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && VALID_THEMES.includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Update resolved theme and apply to document
  useEffect(() => {
    if (!mounted) return;

    const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    // Remove all theme classes
    THEME_CLASSES.forEach(cls => root.classList.remove(cls));
    root.classList.add(resolved);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      const root = document.documentElement;
      THEME_CLASSES.forEach(cls => root.classList.remove(cls));
      root.classList.add(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

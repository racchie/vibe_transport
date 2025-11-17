import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Custom hook for theme management with system preference detection
 * 
 * Features:
 * - Auto-detect system color scheme preference
 * - Persist user choice to localStorage
 * - Apply 'dark' class to document element
 * 
 * @returns {object} Theme state and setter
 */
export function useTheme() {
  // Initialize with 'system' to avoid hydration mismatch
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved theme preference from localStorage after mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, [mounted]);

  // Resolve 'system' to actual light/dark and apply to DOM
  useEffect(() => {
    if (!mounted) return;
    
    const updateTheme = () => {
      let effectiveTheme: 'light' | 'dark';

      if (theme === 'system') {
        // Detect system preference
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        effectiveTheme = theme;
      }

      setResolvedTheme(effectiveTheme);

      // Apply or remove 'dark' class on <html> element
      const root = document.documentElement;
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, mounted]);

  // Persist theme choice to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (mounted) {
      localStorage.setItem('theme', newTheme);
    }
  };

  return { theme, setTheme, resolvedTheme, mounted };
}

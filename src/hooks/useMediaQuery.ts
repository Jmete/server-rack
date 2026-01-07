'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

/**
 * SSR-safe media query hook using useSyncExternalStore
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    // Return false on server to match initial client render
    return false;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns true when viewport is mobile-sized (< 768px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

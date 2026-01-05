'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from '@/components/three/Scene';
import { RackDropZones } from '@/components/dnd/RackDropZones';
import { RackEquipmentOverlay } from '@/components/dnd/RackEquipmentOverlay';
import { ConnectionModeFAB } from '@/components/viewport/ConnectionModeFAB';
import { ViewportBackgroundToggle } from '@/components/viewport/ViewportBackgroundToggle';
import { useTheme } from '@/components/theme';

const VIEWPORT_BG_KEY = 'server-rack-viewport-bg';

export function Viewport() {
  const { resolvedTheme, mounted } = useTheme();
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Set default based on theme and load from localStorage
  useEffect(() => {
    if (!mounted) return;

    const stored = localStorage.getItem(VIEWPORT_BG_KEY);
    if (stored !== null) {
      setIsDarkBackground(stored === 'dark');
    } else {
      // Default: dark background for dark/onyx themes, light background for light/white themes
      const isDarkTheme = resolvedTheme === 'dark' || resolvedTheme === 'onyx';
      setIsDarkBackground(isDarkTheme);
    }
    setInitialized(true);
  }, [mounted, resolvedTheme]);

  const handleToggle = () => {
    const newValue = !isDarkBackground;
    setIsDarkBackground(newValue);
    localStorage.setItem(VIEWPORT_BG_KEY, newValue ? 'dark' : 'light');
  };

  const bgClass = isDarkBackground
    ? 'bg-[#0a0908]'
    : 'bg-[#f5f5f4]';

  return (
    <div className={`relative w-full h-full ${bgClass} ${isDarkBackground ? 'crt-scanlines' : ''}`}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      >
        <Scene isDarkBackground={isDarkBackground} />
      </Canvas>
      <RackEquipmentOverlay />
      <RackDropZones />
      {initialized && (
        <ViewportBackgroundToggle isDark={isDarkBackground} onToggle={handleToggle} />
      )}
      <ConnectionModeFAB />
    </div>
  );
}

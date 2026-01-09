'use client';

import { useState, useEffect, useCallback, useRef, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from '@/components/three/Scene';
import { useUIStore, usePerformanceStore, getPerformanceConfig } from '@/stores';
import { RackDropZones } from '@/components/dnd/RackDropZones';
import { RackEquipmentOverlay } from '@/components/dnd/RackEquipmentOverlay';
import { ConnectionModeFAB } from '@/components/viewport/ConnectionModeFAB';
import { ViewportBackgroundToggle } from '@/components/viewport/ViewportBackgroundToggle';
import { LabelOverlayToggle } from '@/components/viewport/LabelOverlayToggle';
import { PerformanceToggle } from '@/components/viewport/PerformanceToggle';
import { ViewModeToggle } from '@/components/viewport/ViewModeToggle';
import { useTheme } from '@/components/theme';
import { Button } from '@/components/ui/button';
import { Viewport2D } from '@/components/fallback/Viewport2D';

const VIEWPORT_BG_KEY = 'server-rack-viewport-bg';
const LABELS_KEY = 'server-rack-labels';
const VIEW_MODE_KEY = 'server-rack-view-mode';

type WebGLStatus = 'checking' | 'available' | 'unavailable';

type WebGLErrorBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
  resetKey: number;
};

type WebGLErrorBoundaryState = {
  hasError: boolean;
};

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: WebGLErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function canCreateWebGLContext(attributes: WebGLContextAttributes): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  const context =
    canvas.getContext('webgl2', attributes) ||
    canvas.getContext('webgl', attributes) ||
    canvas.getContext('experimental-webgl', attributes);
  if (!context) return false;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

function resolveWebGLAttributes(
  preferred: WebGLContextAttributes
): WebGLContextAttributes | null {
  const candidates: WebGLContextAttributes[] = [
    preferred,
    { ...preferred, preserveDrawingBuffer: false },
    { ...preferred, antialias: false, preserveDrawingBuffer: false },
  ];
  const tried = new Set<string>();

  for (const candidate of candidates) {
    const key = JSON.stringify(candidate);
    if (tried.has(key)) continue;
    tried.add(key);
    if (canCreateWebGLContext(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function Viewport() {
  const { resolvedTheme, mounted } = useTheme();
  const clearSelection = useUIStore((state) => state.clearSelection);
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [force2D, setForce2D] = useState(false);
  const [webglStatus, setWebglStatus] = useState<WebGLStatus>('checking');
  const [webglAttributes, setWebglAttributes] = useState<WebGLContextAttributes | null>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [show3DWarning, setShow3DWarning] = useState(false);
  const warningTimeoutRef = useRef<number | null>(null);

  // Performance tier settings
  const tier = usePerformanceStore((state) => state.tier);
  const performanceConfig = getPerformanceConfig(tier);

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

    // Load label overlay preference
    const storedLabels = localStorage.getItem(LABELS_KEY);
    if (storedLabels !== null) {
      setShowLabels(storedLabels === 'true');
    }

    const storedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (storedViewMode === '2d') {
      setForce2D(true);
    }

    setInitialized(true);
  }, [mounted, resolvedTheme]);

  const detectWebGL = useCallback((): WebGLContextAttributes | null => {
    if (!mounted) return null;
    setWebglStatus('checking');
    const preferred: WebGLContextAttributes = {
      antialias: performanceConfig.antialias,
      preserveDrawingBuffer: true,
      alpha: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: tier === 'high' ? 'high-performance' : 'low-power',
    };
    const attrs = resolveWebGLAttributes(preferred);
    setWebglAttributes(attrs);
    setWebglStatus(attrs ? 'available' : 'unavailable');
    return attrs;
  }, [mounted, performanceConfig.antialias, tier]);

  useEffect(() => {
    detectWebGL();
  }, [detectWebGL]);

  const handleWebGLError = useCallback(() => {
    setWebglAttributes(null);
    setWebglStatus('unavailable');
  }, []);

  const handleToggle = () => {
    const newValue = !isDarkBackground;
    setIsDarkBackground(newValue);
    localStorage.setItem(VIEWPORT_BG_KEY, newValue ? 'dark' : 'light');
  };

  const handleLabelToggle = () => {
    const newValue = !showLabels;
    setShowLabels(newValue);
    localStorage.setItem(LABELS_KEY, newValue ? 'true' : 'false');
  };

  const trigger3DWarning = useCallback(() => {
    setShow3DWarning(true);
    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
    }
    warningTimeoutRef.current = window.setTimeout(() => {
      setShow3DWarning(false);
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        window.clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const handleViewToggle = () => {
    if (useFallbackView) {
      setForce2D(false);
      localStorage.setItem(VIEW_MODE_KEY, '3d');
      const attrs = detectWebGL();
      if (!attrs) {
        trigger3DWarning();
      } else {
        setShow3DWarning(false);
      }
      return;
    }

    setForce2D(true);
    localStorage.setItem(VIEW_MODE_KEY, '2d');
    setShow3DWarning(false);
  };

  const bgClass = isDarkBackground
    ? 'bg-[#0a0908]'
    : 'bg-[#f5f5f4]';
  const fallbackPanelClass = isDarkBackground
    ? 'bg-black/50 border border-zinc-700 text-zinc-100'
    : 'bg-white/80 border border-zinc-300 text-zinc-900';
  const fallbackHintClass = isDarkBackground ? 'text-zinc-300' : 'text-zinc-600';
  const canRenderCanvas = webglStatus === 'available' && webglAttributes !== null;
  const useFallbackView = force2D || !canRenderCanvas;
  const canUse3D = canRenderCanvas;
  const handleRetry = () => {
    setCanvasKey((prev) => prev + 1);
    detectWebGL();
  };

  return (
    <div className={`relative w-full h-full ${bgClass} ${isDarkBackground ? 'crt-scanlines' : ''}`}>
      {useFallbackView ? (
        <Viewport2D isDarkBackground={isDarkBackground} showLabelOverlays={showLabels}>
          <RackEquipmentOverlay />
          <RackDropZones />
        </Viewport2D>
      ) : (
        <WebGLErrorBoundary onError={handleWebGLError} resetKey={canvasKey}>
          <Canvas
            key={canvasKey}
            camera={{ position: [5, 5, 5], fov: 50 }}
            dpr={performanceConfig.dpr}
            gl={webglAttributes!}
            onPointerMissed={clearSelection}
          >
            <Scene isDarkBackground={isDarkBackground} showLabelOverlays={showLabels} />
          </Canvas>
        </WebGLErrorBoundary>
      )}
      {!useFallbackView && (
        <>
          <RackEquipmentOverlay />
          <RackDropZones />
        </>
      )}
      {initialized && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <ViewModeToggle
            isDark={isDarkBackground}
            is2D={useFallbackView}
            canUse3D={canUse3D}
            onToggle={handleViewToggle}
          />
          <PerformanceToggle isDark={isDarkBackground} />
          <LabelOverlayToggle showLabels={showLabels} onToggle={handleLabelToggle} isDark={isDarkBackground} />
          <ViewportBackgroundToggle isDark={isDarkBackground} onToggle={handleToggle} />
        </div>
      )}
      <ConnectionModeFAB />
      {show3DWarning && (
        <div className={`absolute left-3 top-3 z-20 rounded-md px-3 py-2 text-xs ${fallbackPanelClass}`}>
          <div className="font-medium">3D unavailable</div>
          <div className={`mt-1 ${fallbackHintClass}`}>
            WebGL couldn&apos;t initialize. Enable 3D acceleration and try again.
          </div>
          <Button size="sm" variant="outline" className="mt-2" onClick={handleRetry}>
            Retry 3D
          </Button>
        </div>
      )}
    </div>
  );
}

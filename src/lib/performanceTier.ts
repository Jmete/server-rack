export type PerformanceTier = 'high' | 'medium' | 'low';

export interface TierConfig {
  dpr: [number, number];
  antialias: boolean;
  shadowMapSize: number;
  shadows: boolean;
  environment: boolean;
  cableSegments: number;
  cableRadialSegments: number;
  materialQuality: 'pbr' | 'basic';
  gridEnabled: boolean;
}

export const TIER_CONFIGS: Record<PerformanceTier, TierConfig> = {
  high: {
    dpr: [1, 2],
    antialias: true,
    shadowMapSize: 2048,
    shadows: true,
    environment: true,
    cableSegments: 48,
    cableRadialSegments: 8,
    materialQuality: 'pbr',
    gridEnabled: true,
  },
  medium: {
    dpr: [1, 1.5],
    antialias: true,
    shadowMapSize: 1024,
    shadows: true,
    environment: false,
    cableSegments: 24,
    cableRadialSegments: 6,
    materialQuality: 'pbr',
    gridEnabled: true,
  },
  low: {
    dpr: [1, 1],
    antialias: false,
    shadowMapSize: 512,
    shadows: false,
    environment: false,
    cableSegments: 12,
    cableRadialSegments: 4,
    materialQuality: 'basic',
    gridEnabled: false,
  },
};

type WebGLProbeResult = 'ok' | 'low' | 'unsupported';

function probeWebGLPerformance(): WebGLProbeResult {
  if (typeof document === 'undefined') return 'ok';

  const canvas = document.createElement('canvas');
  const cautiousOptions: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
  const cautiousContext =
    canvas.getContext('webgl2', cautiousOptions) ||
    canvas.getContext('webgl', cautiousOptions) ||
    canvas.getContext('experimental-webgl', cautiousOptions);
  const context =
    cautiousContext ||
    canvas.getContext('webgl2') ||
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl');

  if (!context) return 'unsupported';

  const debugInfo = context.getExtension('WEBGL_debug_renderer_info') as { UNMASKED_RENDERER_WEBGL: number } | null;
  const renderer = debugInfo ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
  const isSoftwareRenderer =
    typeof renderer === 'string' && /swiftshader|llvmpipe|software/i.test(renderer);

  context.getExtension('WEBGL_lose_context')?.loseContext();

  if (!cautiousContext || isSoftwareRenderer) return 'low';
  return 'ok';
}

// Lightweight performance detection with a short-lived WebGL probe to spot software renderers.
export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'medium';

  try {
    // Check for mobile devices - use medium tier
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) return 'medium';

    // Detect major performance caveats (software WebGL) before CPU checks.
    const webglProbe = probeWebGLPerformance();
    if (webglProbe !== 'ok') return 'low';

    // Check hardware concurrency (CPU cores) as a rough proxy for system capability
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return 'low';
    if (cores <= 4) return 'medium';

    // Check device memory if available (Chrome only)
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (deviceMemory !== undefined) {
      if (deviceMemory <= 2) return 'low';
      if (deviceMemory <= 4) return 'medium';
    }

    // Default to high for desktop with good specs
    return 'high';
  } catch {
    // If detection fails, default to medium
    return 'medium';
  }
}

export function getTierLabel(tier: PerformanceTier): string {
  switch (tier) {
    case 'high':
      return 'High (Best Quality)';
    case 'medium':
      return 'Medium (Balanced)';
    case 'low':
      return 'Low (Performance)';
  }
}

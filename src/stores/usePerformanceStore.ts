import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PerformanceTier,
  TierConfig,
  detectPerformanceTier,
  TIER_CONFIGS,
} from '@/lib/performanceTier';

interface PerformanceState {
  tier: PerformanceTier;
  isAutoMode: boolean;

  // Actions
  setTier: (tier: PerformanceTier) => void;
  setAutoMode: (auto: boolean) => void;
}

// Detect tier once at module load (client-side only)
let detectedTier: PerformanceTier = 'medium';
if (typeof window !== 'undefined') {
  detectedTier = detectPerformanceTier();
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      tier: detectedTier,
      isAutoMode: true,

      setTier: (tier: PerformanceTier) => {
        set({ tier, isAutoMode: false });
      },

      setAutoMode: (auto: boolean) => {
        set({
          isAutoMode: auto,
          tier: auto ? detectedTier : get().tier,
        });
      },
    }),
    {
      name: 'server-rack-performance',
      partialize: (state) => ({
        tier: state.tier,
        isAutoMode: state.isAutoMode,
      }),
      // On rehydration, respect auto mode
      onRehydrateStorage: () => (state) => {
        if (state?.isAutoMode) {
          state.tier = detectedTier;
        }
      },
    }
  )
);

// Helper function to get config from tier (use outside of store)
export function getPerformanceConfig(tier: PerformanceTier): TierConfig {
  return TIER_CONFIGS[tier];
}

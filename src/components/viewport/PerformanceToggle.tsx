'use client';

import { Zap, ZapOff, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePerformanceStore } from '@/stores';
import { PerformanceTier, getTierLabel } from '@/lib/performanceTier';

interface PerformanceToggleProps {
  isDark: boolean;
}

const TIER_ORDER: PerformanceTier[] = ['high', 'medium', 'low'];

export function PerformanceToggle({ isDark }: PerformanceToggleProps) {
  const tier = usePerformanceStore((state) => state.tier);
  const setTier = usePerformanceStore((state) => state.setTier);

  const getTierIcon = () => {
    switch (tier) {
      case 'high':
        return <Zap className="h-4 w-4" />;
      case 'low':
        return <ZapOff className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'high':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'low':
        return isDark ? 'text-orange-400' : 'text-orange-600';
      default:
        return isDark ? 'text-blue-400' : 'text-blue-600';
    }
  };

  const cycleTier = () => {
    const currentIndex = TIER_ORDER.indexOf(tier);
    const nextIndex = (currentIndex + 1) % TIER_ORDER.length;
    setTier(TIER_ORDER[nextIndex]);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        'h-8 px-2 rounded-full shadow-md border-2 gap-1',
        isDark
          ? 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-300'
          : 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700'
      )}
      onClick={cycleTier}
      title={`Graphics: ${getTierLabel(tier)} (click to change)`}
    >
      <span className={getTierColor()}>{getTierIcon()}</span>
    </Button>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  isDark: boolean;
  is2D: boolean;
  canUse3D: boolean;
  onToggle: () => void;
}

export function ViewModeToggle({ isDark, is2D, canUse3D, onToggle }: ViewModeToggleProps) {
  const label = is2D ? '2D' : '3D';
  const title = !canUse3D
    ? '3D view unavailable - click to retry'
    : is2D
    ? 'Switch to 3D view'
    : 'Switch to 2D view';

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        'h-8 w-8 p-0 rounded-full shadow-md border-2 text-[11px] font-semibold',
        isDark
          ? 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-200'
          : 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700',
        !canUse3D && is2D && 'opacity-70',
        is2D && 'border-blue-500'
      )}
      onClick={onToggle}
      aria-disabled={!canUse3D && is2D}
      title={title}
    >
      {label}
    </Button>
  );
}

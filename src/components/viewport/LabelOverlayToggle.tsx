'use client';

import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LabelOverlayToggleProps {
  showLabels: boolean;
  onToggle: () => void;
  isDark: boolean;
}

export function LabelOverlayToggle({ showLabels, onToggle, isDark }: LabelOverlayToggleProps) {
  return (
    <div className="absolute top-3 right-14 z-20">
      <Button
        size="sm"
        variant="outline"
        className={cn(
          'h-8 w-8 p-0 rounded-full shadow-md border-2',
          isDark
            ? 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-300'
            : 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700',
          showLabels && (isDark ? 'border-blue-500' : 'border-blue-500')
        )}
        onClick={onToggle}
        title={showLabels ? 'Hide equipment labels' : 'Show equipment labels'}
      >
        <Tag className="h-4 w-4" />
      </Button>
    </div>
  );
}

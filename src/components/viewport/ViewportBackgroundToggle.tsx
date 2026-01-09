'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewportBackgroundToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ViewportBackgroundToggle({ isDark, onToggle }: ViewportBackgroundToggleProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        'h-8 w-8 p-0 rounded-full shadow-md border-2',
        isDark
          ? 'bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-300'
          : 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700'
      )}
      onClick={onToggle}
      title={isDark ? 'Switch to light background' : 'Switch to dark background'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

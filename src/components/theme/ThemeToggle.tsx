'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-[130px] h-8 rounded-md border border-border bg-background animate-pulse" />
    );
  }

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
      <SelectTrigger className="w-[130px] h-8 text-xs border-border bg-background">
        <SelectValue>
          <span className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
            <span className="capitalize">{theme}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5" />
            Light
          </span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5" />
            Dark
          </span>
        </SelectItem>
        <SelectItem value="system">
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" />
            System
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md bg-background animate-pulse" />
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8"
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

'use client';

import { Moon, Sun, Monitor, Leaf, Gem, type LucideIcon } from 'lucide-react';
import { useTheme, type Theme, type ResolvedTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const themeIcons: Record<ResolvedTheme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  white: Leaf,
  onyx: Gem,
};

const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  white: 'White',
  onyx: 'Onyx',
  system: 'System',
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-[130px] h-8 rounded-md border border-border bg-background animate-pulse" />
    );
  }

  const ResolvedIcon = themeIcons[resolvedTheme] || Sun;

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <SelectTrigger className="w-[130px] h-8 text-xs border-border bg-background">
        <SelectValue>
          <span className="flex items-center gap-2">
            <ResolvedIcon className="h-3.5 w-3.5" />
            <span className="capitalize">{themeLabels[theme]}</span>
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
        <SelectItem value="white">
          <span className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" />
            White
          </span>
        </SelectItem>
        <SelectItem value="onyx">
          <span className="flex items-center gap-2">
            <Gem className="h-3.5 w-3.5" />
            Onyx
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

const themeCycle: ResolvedTheme[] = ['light', 'dark', 'white', 'onyx'];

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md bg-background animate-pulse" />
    );
  }

  const toggleTheme = () => {
    const currentIndex = themeCycle.indexOf(resolvedTheme);
    const nextIndex = (currentIndex + 1) % themeCycle.length;
    setTheme(themeCycle[nextIndex]);
  };

  const Icon = themeIcons[resolvedTheme] || Sun;
  const nextTheme = themeCycle[(themeCycle.indexOf(resolvedTheme) + 1) % themeCycle.length];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8"
      title={`Switch to ${themeLabels[nextTheme]} mode`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

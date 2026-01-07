'use client';

import { Download, Settings, Moon, Sun, Monitor, Leaf, Gem, ChevronRight } from 'lucide-react';
import { MobileSheet } from './MobileSheet';
import { useUIStore } from '@/stores';
import { useTheme, type Theme, type ResolvedTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'white', label: 'White', icon: Leaf },
  { value: 'onyx', label: 'Onyx', icon: Gem },
  { value: 'system', label: 'System', icon: Monitor },
];

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}

function MenuItem({ icon, label, description, onClick, trailing }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors touch-target"
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      {trailing || <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

export function MobileMoreMenu() {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const setExportModalOpen = useUIStore((state) => state.setExportModalOpen);
  const setRackSettingsModalOpen = useUIStore((state) => state.setRackSettingsModalOpen);

  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  const handleExport = () => {
    setActivePanel('none');
    setExportModalOpen(true);
  };

  const handleRackSettings = () => {
    setActivePanel('none');
    setRackSettingsModalOpen(true);
  };

  const currentThemeOption = themeOptions.find((t) => t.value === theme);

  return (
    <MobileSheet
      open={activePanel === 'more'}
      onOpenChange={(open) => setActivePanel(open ? 'more' : 'none')}
      title="More Options"
    >
      <div className="divide-y divide-border">
        {/* Actions Section */}
        <div className="py-2">
          <MenuItem
            icon={<Download className="h-5 w-5" />}
            label="Export"
            description="Save as JSON, PDF, CSV, or PNG"
            onClick={handleExport}
          />
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            label="Rack Settings"
            description="Configure rack dimensions"
            onClick={handleRackSettings}
          />
        </div>

        {/* Theme Section */}
        <div className="py-3 px-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Theme
          </div>
          {mounted && (
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((option) => {
                const isActive = theme === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/50 active:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileSheet>
  );
}

'use client';

import { Server, Info, Cable, MoreHorizontal } from 'lucide-react';
import { useUIStore, type MobilePanel } from '@/stores/useUIStore';
import { useConnectionStore } from '@/stores';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  hasIndicator?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, hasIndicator, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-target transition-colors',
        isActive ? 'mobile-nav-active' : 'text-muted-foreground'
      )}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative">
        {icon}
        {hasIndicator && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function MobileBottomNav() {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const connectionMode = useConnectionStore((state) => state.connectionMode);

  const handlePanelToggle = (panel: MobilePanel) => {
    if (activePanel === panel) {
      setActivePanel('none');
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border pb-safe md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center h-16">
        <NavItem
          icon={<Server className="h-5 w-5" />}
          label="Catalog"
          isActive={activePanel === 'catalog'}
          onClick={() => handlePanelToggle('catalog')}
        />
        <NavItem
          icon={<Info className="h-5 w-5" />}
          label="Properties"
          isActive={activePanel === 'properties'}
          onClick={() => handlePanelToggle('properties')}
        />
        <NavItem
          icon={<Cable className="h-5 w-5" />}
          label="Connect"
          isActive={activePanel === 'connections' || connectionMode.active}
          hasIndicator={connectionMode.active}
          onClick={() => handlePanelToggle('connections')}
        />
        <NavItem
          icon={<MoreHorizontal className="h-5 w-5" />}
          label="More"
          isActive={activePanel === 'more'}
          onClick={() => handlePanelToggle('more')}
        />
      </div>
    </nav>
  );
}

'use client';

import { ReactNode } from 'react';
import {
  MobileBottomNav,
  MobileCatalogSheet,
  MobilePropertiesSheet,
  MobileConnectionSheet,
  MobileMoreMenu,
} from '@/components/mobile';

interface AppLayoutProps {
  header: ReactNode;
  leftPanel: ReactNode;
  viewport: ReactNode;
  rightPanel: ReactNode;
}

export function AppLayout({ header, leftPanel, viewport, rightPanel }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Header */}
      {header}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Equipment Catalog (hidden on mobile) */}
        <div className="hidden md:block">
          {leftPanel}
        </div>

        {/* Viewport - 3D Canvas */}
        <div className="flex-1 h-full overflow-hidden relative pb-16 md:pb-0">
          {viewport}
        </div>

        {/* Right Panel - Properties/Summary (hidden on mobile) */}
        <div className="hidden md:block">
          {rightPanel}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Sheet Panels */}
      <MobileCatalogSheet />
      <MobilePropertiesSheet />
      <MobileConnectionSheet />
      <MobileMoreMenu />
    </div>
  );
}

'use client';

import { ReactNode } from 'react';

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
        {/* Left Panel - Equipment Catalog */}
        {leftPanel}

        {/* Viewport - 3D Canvas */}
        <div className="flex-1 h-full overflow-hidden relative">
          {viewport}
        </div>

        {/* Right Panel - Properties/Summary */}
        {rightPanel}
      </div>
    </div>
  );
}

'use client';

import { ReactNode } from 'react';

interface AppLayoutProps {
  viewport: ReactNode;
  sidebar: ReactNode;
}

export function AppLayout({ viewport, sidebar }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Viewport - 70% */}
      <div className="flex-[7] h-full border-r border-border">
        {viewport}
      </div>

      {/* Sidebar - 30% */}
      <div className="flex-[3] h-full overflow-y-auto">
        {sidebar}
      </div>
    </div>
  );
}

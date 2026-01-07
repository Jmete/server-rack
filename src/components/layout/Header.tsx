"use client";

import { Download } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { useRackStore, useUIStore } from "@/stores";

export function Header() {
  const rackName = useRackStore((state) => state.rack.config.name);
  const setExportModalOpen = useUIStore((state) => state.setExportModalOpen);

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 md:px-4 shrink-0">
      {/* Left: App title */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2">
          <Logo className="h-10 w-10 md:h-14 md:w-14 text-primary" />
          <span className="hidden md:inline font-bold text-sm tracking-wide crt-glow">
            RACK CONFIG
          </span>
        </div>
      </div>

      {/* Center: Rack name */}
      <div className="absolute left-1/2 transform -translate-x-1/2 max-w-[40%] md:max-w-none">
        <span className="text-xs md:text-sm font-medium text-muted-foreground truncate block">
          {rackName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Theme toggle - desktop only */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Export button - icon only on mobile */}
        <Button
          size="icon-sm"
          variant="outline"
          className="md:hidden h-8 w-8"
          onClick={() => setExportModalOpen(true)}
          aria-label="Export"
        >
          <Download className="h-4 w-4" />
        </Button>

        {/* Export button - with text on desktop */}
        <Button
          size="sm"
          variant="outline"
          className="hidden md:flex h-8 gap-2"
          onClick={() => setExportModalOpen(true)}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </header>
  );
}

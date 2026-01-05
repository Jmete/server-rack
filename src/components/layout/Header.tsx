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
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left: App title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Logo className="h-14 w-14 text-primary" />
          <span className="font-bold text-sm tracking-wide crt-glow">
            RACK CONFIG
          </span>
        </div>
      </div>

      {/* Center: Rack name */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <span className="text-sm font-medium text-muted-foreground">
          {rackName}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-2"
          onClick={() => setExportModalOpen(true)}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </header>
  );
}

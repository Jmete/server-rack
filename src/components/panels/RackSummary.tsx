'use client';

import { Cable, HardDrive, Layers, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectionStore, useRackStore, useUIStore } from '@/stores';
import { INCH_TO_MM } from '@/constants';
import { CABLE_TYPE_LABELS } from '@/types/cable';

export function RackSummary() {
  const rackConfig = useRackStore((state) => state.rack.config);
  const equipment = useRackStore((state) => state.equipment);
  const cables = useConnectionStore((state) => state.cables);
  const setRackSettingsModalOpen = useUIStore((state) => state.setRackSettingsModalOpen);
  const selectCable = useUIStore((state) => state.selectCable);
  const selectedCableId = useUIStore((state) => state.selectedCableId);

  // Calculate used U slots
  const usedSlots = equipment.reduce((total, eq) => total + eq.heightU, 0);
  const availableSlots = rackConfig.size - usedSlots;

  // Convert depth from mm to inches
  const depthInches = Math.round(rackConfig.depth / INCH_TO_MM);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Layers className="h-4 w-4 text-primary" />
            Rack Summary
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => setRackSettingsModalOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-3 space-y-3 border-b border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-md p-2.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Height</div>
            <div className="text-lg font-bold">{rackConfig.size}U</div>
          </div>
          <div className="bg-muted/50 rounded-md p-2.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Depth</div>
            <div className="text-lg font-bold">{depthInches}"</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-md p-2.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Used</div>
            <div className="text-lg font-bold text-primary">{usedSlots}U</div>
          </div>
          <div className="bg-muted/50 rounded-md p-2.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</div>
            <div className="text-lg font-bold text-muted-foreground">{availableSlots}U</div>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(usedSlots / rackConfig.size) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground text-right">
            {Math.round((usedSlots / rackConfig.size) * 100)}% utilized
          </div>
        </div>
      </div>

      {/* Equipment Summary */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium mb-2">
          <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
          Equipment ({equipment.length})
        </div>
        {equipment.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No equipment installed. Add from the catalog.
          </p>
        ) : (
          <div className="space-y-1 max-h-[150px] overflow-y-auto">
            {equipment
              .slice()
              .sort((a, b) => a.slotPosition - b.slotPosition)
              .map((eq) => (
                <div key={eq.instanceId} className="text-[11px] flex justify-between">
                  <span className="text-muted-foreground">U{eq.slotPosition}</span>
                  <span className="truncate ml-2">{eq.customLabel || eq.name}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Cables Summary */}
      <div className="p-3 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 text-xs font-medium mb-2">
          <Cable className="h-3.5 w-3.5 text-muted-foreground" />
          Cables ({cables.length})
        </div>
        {cables.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No cables connected. Use the connection button to add cables.
          </p>
        ) : (
          <div className="space-y-1 flex-1 overflow-y-auto">
            {cables.map((cable) => (
              <button
                key={cable.id}
                type="button"
                className={`w-full flex items-center gap-2 text-[11px] py-1.5 px-2 rounded transition-colors text-left ${
                  cable.id === selectedCableId
                    ? 'bg-primary/20 text-foreground'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => selectCable(cable.id)}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cable.color.hex }}
                />
                <span className="truncate">
                  {cable.label || CABLE_TYPE_LABELS[cable.type]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

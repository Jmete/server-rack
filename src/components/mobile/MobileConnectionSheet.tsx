'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { MobileSheet } from './MobileSheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionStore, usePortStore, useUIStore } from '@/stores';
import { CABLE_COLORS, CABLE_TYPE_LABELS, CableType, resolveCableType } from '@/types/cable';
import { cn } from '@/lib/utils';

export function MobileConnectionSheet() {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const hoveredPortId = useUIStore((state) => state.hoveredPortId);

  const connectionMode = useConnectionStore((state) => state.connectionMode);
  const setConnectionActive = useConnectionStore((state) => state.setConnectionActive);
  const cancelConnection = useConnectionStore((state) => state.cancelConnection);
  const setCableType = useConnectionStore((state) => state.setCableType);
  const setCableColor = useConnectionStore((state) => state.setCableColor);

  const portTypes = usePortStore((state) => state.types);

  const isActive = connectionMode.active;

  const autoCableType = useMemo(() => {
    if (!connectionMode.active || !connectionMode.sourcePortId || !hoveredPortId) return null;
    if (connectionMode.sourcePortId === hoveredPortId) return null;

    const sourceType = portTypes[connectionMode.sourcePortId];
    const targetType = portTypes[hoveredPortId];
    if (!sourceType || !targetType) return null;

    const resolvedType = resolveCableType(sourceType, targetType, connectionMode.cableType);
    if (!resolvedType || resolvedType === connectionMode.cableType) return null;

    return resolvedType;
  }, [
    connectionMode.active,
    connectionMode.sourcePortId,
    connectionMode.cableType,
    hoveredPortId,
    portTypes,
  ]);

  const handleToggle = () => {
    if (isActive) {
      cancelConnection();
    } else {
      setConnectionActive(true);
    }
  };

  const handleClose = () => {
    if (isActive) {
      cancelConnection();
    }
    setActivePanel('none');
  };

  return (
    <MobileSheet
      open={activePanel === 'connections'}
      onOpenChange={(open) => {
        if (!open) handleClose();
        else setActivePanel('connections');
      }}
      title="Cable Connection"
    >
      <div className="px-4 pb-4 space-y-5">
        {/* Status */}
        <div
          className={cn(
            'text-sm px-4 py-3 rounded-lg text-center',
            isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          )}
        >
          <div className="font-medium">
            {isActive
              ? connectionMode.sourcePortId
                ? 'Tap target port to connect'
                : 'Tap source port to start'
              : 'Configure cable and tap Connect'}
          </div>
          {autoCableType && (
            <div className="mt-1 text-xs text-muted-foreground">
              Auto-select: {CABLE_TYPE_LABELS[autoCableType]}
            </div>
          )}
        </div>

        {/* Cable Type */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Cable Type</div>
          <Select
            value={connectionMode.cableType}
            onValueChange={(value) => setCableType(value as CableType)}
          >
            <SelectTrigger className="w-full h-11 text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CABLE_TYPE_LABELS).map(([type, label]) => (
                <SelectItem key={type} value={type} className="text-sm py-2">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cable Color */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Cable Color</div>
          <div className="flex flex-wrap gap-3">
            {CABLE_COLORS.map((color) => {
              const isSelected = connectionMode.cableColor.name === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  className={cn(
                    'h-10 w-10 rounded-full border-2 transition-all touch-target',
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-primary border-primary scale-110'
                      : 'border-transparent hover:border-muted-foreground/50 active:scale-95'
                  )}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setCableColor(color)}
                  aria-label={color.name}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="lg"
          className={cn(
            'w-full h-12 text-base',
            isActive && 'bg-destructive hover:bg-destructive/90'
          )}
          onClick={handleToggle}
        >
          {isActive ? (
            <>
              <X className="h-5 w-5 mr-2" />
              Cancel Connection
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Start Connecting
            </>
          )}
        </Button>

        {isActive && (
          <p className="text-xs text-center text-muted-foreground">
            Close this panel and tap on ports in the 3D view to create connections
          </p>
        )}
      </div>
    </MobileSheet>
  );
}

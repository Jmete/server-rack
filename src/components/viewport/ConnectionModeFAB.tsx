'use client';

import { useState } from 'react';
import { Cable, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionStore } from '@/stores';
import { CABLE_COLORS, CABLE_TYPE_LABELS, CableType } from '@/types/cable';
import { cn } from '@/lib/utils';

export function ConnectionModeFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const connectionMode = useConnectionStore((state) => state.connectionMode);
  const setConnectionActive = useConnectionStore((state) => state.setConnectionActive);
  const cancelConnection = useConnectionStore((state) => state.cancelConnection);
  const setCableType = useConnectionStore((state) => state.setCableType);
  const setCableColor = useConnectionStore((state) => state.setCableColor);

  const isActive = connectionMode.active;

  const handleToggle = () => {
    if (isActive) {
      cancelConnection();
      setIsExpanded(false);
    } else {
      setConnectionActive(true);
      setIsExpanded(true);
    }
  };

  const handleFABClick = () => {
    if (!isActive && !isExpanded) {
      setIsExpanded(true);
    } else if (!isActive && isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-20">
      {/* Expanded Panel */}
      <div
        className={cn(
          'absolute bottom-14 right-0 w-64 bg-card border border-border rounded-lg shadow-lg transition-all duration-200 origin-bottom-right',
          isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cable Connection</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                if (isActive) {
                  cancelConnection();
                }
                setIsExpanded(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Status */}
          <div
            className={cn(
              'text-xs px-2 py-1 rounded-md text-center',
              isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            {isActive
              ? connectionMode.sourcePortId
                ? 'Click target port to connect'
                : 'Click source port to start'
              : 'Configure and click Connect'}
          </div>

          {/* Cable Type */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Cable Type</div>
            <Select
              value={connectionMode.cableType}
              onValueChange={(value) => setCableType(value as CableType)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CABLE_TYPE_LABELS).map(([type, label]) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cable Color */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Cable Color</div>
            <div className="flex flex-wrap gap-1.5">
              {CABLE_COLORS.map((color) => {
                const isSelected = connectionMode.cableColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-all',
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-primary border-primary'
                        : 'border-transparent hover:border-muted-foreground/50'
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
            size="sm"
            className={cn(
              'w-full',
              isActive && 'bg-destructive hover:bg-destructive/90'
            )}
            onClick={handleToggle}
          >
            {isActive ? (
              <>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Connect
              </>
            )}
          </Button>
        </div>
      </div>

      {/* FAB Button */}
      <Button
        size="icon"
        className={cn(
          'h-12 w-12 rounded-full shadow-lg transition-all duration-200',
          isActive && 'animate-pulse crt-border-glow bg-primary'
        )}
        onClick={handleFABClick}
      >
        <Cable className="h-5 w-5" />
      </Button>
    </div>
  );
}

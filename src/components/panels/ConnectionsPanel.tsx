'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionStore, useUIStore } from '@/stores';
import { CABLE_COLORS, CABLE_TYPE_LABELS, CableType } from '@/types/cable';

export function ConnectionsPanel() {
  const cables = useConnectionStore((state) => state.cables);
  const connectionMode = useConnectionStore((state) => state.connectionMode);
  const setConnectionActive = useConnectionStore((state) => state.setConnectionActive);
  const cancelConnection = useConnectionStore((state) => state.cancelConnection);
  const setCableType = useConnectionStore((state) => state.setCableType);
  const setCableColor = useConnectionStore((state) => state.setCableColor);
  const removeCable = useConnectionStore((state) => state.removeCable);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const selectCable = useUIStore((state) => state.selectCable);
  const selectedCable = cables.find((cable) => cable.id === selectedCableId) ?? null;

  const handleToggle = () => {
    if (connectionMode.active) {
      cancelConnection();
      return;
    }
    setConnectionActive(true);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Cable Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Connection Mode
          </div>
          <Button size="sm" onClick={handleToggle}>
            {connectionMode.active ? 'Cancel' : 'Connect'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Cable Type</div>
          <Select
            value={connectionMode.cableType}
            onValueChange={(value) => setCableType(value as CableType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select cable type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CABLE_TYPE_LABELS).map(([type, label]) => (
                <SelectItem key={type} value={type}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Cable Color</div>
          <div className="flex flex-wrap gap-2">
            {CABLE_COLORS.map((color) => {
              const isSelected = connectionMode.cableColor.name === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  className={`h-6 w-6 rounded-full border ${isSelected ? 'ring-2 ring-offset-2 ring-foreground' : 'border-border'}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setCableColor(color)}
                  aria-label={color.name}
                />
              );
            })}
          </div>
        </div>

        {selectedCable && (
          <div className="rounded-md border border-border p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Selected Cable</div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  removeCable(selectedCable.id);
                  selectCable(null);
                }}
              >
                Delete
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: selectedCable.color.hex }}
              />
              <span>{CABLE_TYPE_LABELS[selectedCable.type]}</span>
            </div>
            <div className="text-muted-foreground">
              {selectedCable.sourcePortId} → {selectedCable.targetPortId}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Cables ({cables.length})
          </div>
          <div className="space-y-2">
            {cables.length === 0 && (
              <div className="text-xs text-muted-foreground">
                No cables connected yet.
              </div>
            )}
            {cables.map((cable) => (
              <div
                key={cable.id}
                role="button"
                tabIndex={0}
                className={`flex w-full items-center justify-between text-xs rounded-md px-2 py-1 ${cable.id === selectedCableId ? 'bg-muted' : 'hover:bg-muted/50'}`}
                onClick={() => selectCable(cable.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectCable(cable.id);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: cable.color.hex }}
                  />
                  <span>{CABLE_TYPE_LABELS[cable.type]}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeCable(cable.id);
                    if (cable.id === selectedCableId) {
                      selectCable(null);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

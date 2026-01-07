'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ChevronDown, ChevronRight, Info, Plug, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useConnectionStore, usePortStore, useRackStore, useUIStore } from '@/stores';
import { PORT_TYPE_LABELS } from '@/types/port';
import { ShelfItemsPanel } from './ShelfItemsPanel';

export function PropertiesPanel() {
  const equipment = useRackStore((state) => state.equipment);
  const updateEquipment = useRackStore((state) => state.updateEquipment);
  const removeEquipment = useRackStore((state) => state.removeEquipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const cables = useConnectionStore((state) => state.cables);
  const updateCable = useConnectionStore((state) => state.updateCable);
  const removeCable = useConnectionStore((state) => state.removeCable);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const selectedPortId = useUIStore((state) => state.selectedPortId);
  const selectCable = useUIStore((state) => state.selectCable);

  const [portsExpanded, setPortsExpanded] = useState(true);

  const selected = useMemo(
    () => equipment.find((item) => item.instanceId === selectedEquipmentId) ?? null,
    [equipment, selectedEquipmentId]
  );

  const selectedCable = useMemo(
    () => cables.find((cable) => cable.id === selectedCableId) ?? null,
    [cables, selectedCableId]
  );

  const portPositions = usePortStore((state) => state.positions);
  const portRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!selectedPortId) return;
    setPortsExpanded(true);
  }, [selectedPortId]);

  useEffect(() => {
    if (!portsExpanded || !selectedPortId) return;
    const input = portRefs.current[selectedPortId];
    if (input) {
      input.focus();
      input.select();
    }
  }, [portsExpanded, selectedPortId]);

  // Cable selected view
  if (selectedCable) {
    const sourcePos = portPositions[selectedCable.sourcePortId];
    const targetPos = portPositions[selectedCable.targetPortId];
    const directLength = sourcePos && targetPos
      ? new THREE.Vector3(...sourcePos).distanceTo(new THREE.Vector3(...targetPos))
      : 0;
    const directMm = directLength / 0.01;
    const currentLength = selectedCable.length ?? directMm;
    const maxMm = Math.max(directMm * 2.5, directMm + 150);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCable.color.hex }}
              />
              Cable Properties
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => {
                removeCable(selectedCable.id);
                selectCable(null);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="cableLabel" className="text-xs text-muted-foreground">
              Cable Label
            </Label>
            <Input
              id="cableLabel"
              value={selectedCable.label ?? ''}
              placeholder="Optional label"
              className="h-8"
              onChange={(event) =>
                updateCable(selectedCable.id, { label: event.target.value })
              }
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{selectedCable.type}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Color</span>
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCable.color.hex }}
                />
                {selectedCable.color.name}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cableLength" className="text-xs text-muted-foreground">
              Cable Length (mm)
            </Label>
            <Input
              id="cableLength"
              type="number"
              min={Math.round(directMm)}
              max={Math.round(maxMm)}
              value={Math.round(currentLength)}
              className="h-8"
              onChange={(event) => {
                const value = Number.parseFloat(event.target.value);
                if (Number.isFinite(value)) {
                  updateCable(selectedCable.id, { length: value });
                }
              }}
            />
            <div className="text-[10px] text-muted-foreground">
              Min {Math.round(directMm)}mm · Max {Math.round(maxMm)}mm
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Equipment selected view
  if (!selected) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 text-primary" />
            Equipment Properties
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => removeEquipment(selected.instanceId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-4">
          {/* Custom Label */}
          <div className="space-y-2">
            <Label htmlFor="customLabel" className="text-xs text-muted-foreground">
              Custom Label
            </Label>
            <Input
              id="customLabel"
              value={selected.customLabel ?? ''}
              placeholder="Optional label"
              className="h-8"
              onChange={(event) =>
                updateEquipment(selected.instanceId, { customLabel: event.target.value })
              }
            />
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{selected.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{selected.model}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Position</span>
              <span className="font-medium">U{selected.slotPosition}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Height</span>
              <span className="font-medium">{selected.heightU}U</span>
            </div>
          </div>
        </div>

        {/* Ports Section */}
        <div className="border-t border-border">
          <button
            type="button"
            className="w-full p-3 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors"
            onClick={() => setPortsExpanded(!portsExpanded)}
          >
            <span className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-muted-foreground" />
              Ports ({selected.ports.length})
            </span>
            {portsExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {portsExpanded && (
            <div className="px-3 pb-3 space-y-2">
              {selected.ports.map((port) => {
                const globalId = `${selected.instanceId}-${port.id}`;
                const isSelected = selectedPortId === globalId;
                return (
                  <div
                    key={port.id}
                    className={`text-xs rounded-md p-2 ${isSelected ? 'bg-primary/10 ring-1 ring-primary/50' : 'bg-muted/50'}`}
                  >
                    <div className="flex justify-between text-muted-foreground mb-1.5">
                      <span>{port.label}</span>
                      <span>
                        {PORT_TYPE_LABELS[port.type]}
                        {port.speed ? ` · ${port.speed}` : ''}
                      </span>
                    </div>
                    <Input
                      value={port.customLabel ?? ''}
                      placeholder="Custom label"
                      className="h-7 text-xs"
                      ref={(el) => {
                        portRefs.current[globalId] = el;
                      }}
                      onChange={(event) => {
                        const nextPorts = selected.ports.map((item) =>
                          item.id === port.id ? { ...item, customLabel: event.target.value } : item
                        );
                        updateEquipment(selected.instanceId, { ports: nextPorts });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shelf Items Section - only shown for shelf equipment */}
        {selected.type === 'shelf' && (
          <ShelfItemsPanel shelf={selected} />
        )}
      </div>
    </div>
  );
}

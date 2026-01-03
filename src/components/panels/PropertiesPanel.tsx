'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectionStore, usePortStore, useRackStore, useUIStore } from '@/stores';
import { PORT_TYPE_LABELS } from '@/types/port';

export function PropertiesPanel() {
  const equipment = useRackStore((state) => state.equipment);
  const updateEquipment = useRackStore((state) => state.updateEquipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const cables = useConnectionStore((state) => state.cables);
  const updateCable = useConnectionStore((state) => state.updateCable);
  const selectedCableId = useUIStore((state) => state.selectedCableId);

  const selected = useMemo(
    () => equipment.find((item) => item.instanceId === selectedEquipmentId) ?? null,
    [equipment, selectedEquipmentId]
  );

  const selectedCable = useMemo(
    () => cables.find((cable) => cable.id === selectedCableId) ?? null,
    [cables, selectedCableId]
  );

  const portPositions = usePortStore((state) => state.positions);

  if (!selected && !selectedCable) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an item to view its properties.
          </p>
        </CardContent>
      </Card>
    );
  }

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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cableLabel" className="text-xs text-muted-foreground">
              Cable Label
            </Label>
            <Input
              id="cableLabel"
              value={selectedCable.label ?? ''}
              placeholder="Optional label"
              onChange={(event) =>
                updateCable(selectedCable.id, { label: event.target.value })
              }
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cable Type</span>
              <span>{selectedCable.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color</span>
              <span>{selectedCable.color.name}</span>
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
                onChange={(event) => {
                  const value = Number.parseFloat(event.target.value);
                  if (Number.isFinite(value)) {
                    updateCable(selectedCable.id, { length: value });
                  }
                }}
              />
              <div className="text-xs text-muted-foreground">
                Min {Math.round(directMm)}mm · Max {Math.round(maxMm)}mm
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customLabel" className="text-xs text-muted-foreground">
            Custom Label
          </Label>
          <Input
            id="customLabel"
            value={selected.customLabel ?? ''}
            placeholder="Optional label"
            onChange={(event) =>
              updateEquipment(selected.instanceId, { customLabel: event.target.value })
            }
          />
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{selected.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span>{selected.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">U Position</span>
              <span>U{selected.slotPosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height</span>
              <span>{selected.heightU}U</span>
            </div>
          </TabsContent>

          <TabsContent value="ports" className="mt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              {selected.ports.length} ports
            </div>
            <div className="space-y-2">
              {selected.ports.map((port) => (
                <div key={port.id} className="flex justify-between text-xs">
                  <span>{port.label}</span>
                  <span className="text-muted-foreground">
                    {PORT_TYPE_LABELS[port.type]}
                    {port.speed ? ` · ${port.speed}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

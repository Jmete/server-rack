'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRackStore, useUIStore } from '@/stores';
import { PORT_TYPE_LABELS } from '@/types/port';

export function PropertiesPanel() {
  const equipment = useRackStore((state) => state.equipment);
  const updateEquipment = useRackStore((state) => state.updateEquipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);

  const selected = useMemo(
    () => equipment.find((item) => item.instanceId === selectedEquipmentId) ?? null,
    [equipment, selectedEquipmentId]
  );

  if (!selected) {
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

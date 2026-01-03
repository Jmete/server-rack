'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DraggableEquipment } from '@/components/dnd/DraggableEquipment';
import { useRackStore } from '@/stores';
import { EQUIPMENT_CATALOG } from '@/constants';
import { useEquipmentDrag } from '@/hooks/useEquipmentDrag';

export function EquipmentCatalog() {
  const rack = useRackStore((state) => state.rack);
  const equipment = useRackStore((state) => state.equipment);
  const removeEquipment = useRackStore((state) => state.removeEquipment);
  const { findNextAvailableSlot, addEquipmentById } = useEquipmentDrag();

  const handleAddEquipment = (equipmentId: string) => {
    const definition = EQUIPMENT_CATALOG.find((eq) => eq.id === equipmentId);
    if (!definition) return;
    const slot = findNextAvailableSlot(definition.heightU);
    if (slot === null) {
      alert('No available slot for this equipment');
      return;
    }

    addEquipmentById(equipmentId, slot);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Equipment Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click to add equipment to the next available slot or drag onto the rack.
        </p>
        <div className="space-y-2">
          {EQUIPMENT_CATALOG.map((eq) => (
            <DraggableEquipment key={eq.id} equipmentId={eq.id}>
              <div
                className="p-3 border border-border rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleAddEquipment(eq.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{eq.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {eq.heightU}U - {eq.ports.length} ports
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Add
                  </Button>
                </div>
              </div>
            </DraggableEquipment>
          ))}
        </div>

        {equipment.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">
              Installed ({equipment.length}) - use Remove to delete
            </div>
            {equipment.map((eq) => (
              <div key={eq.instanceId} className="flex items-center justify-between text-xs py-1">
                <div>
                  U{eq.slotPosition}: {eq.name}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => removeEquipment(eq.instanceId)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

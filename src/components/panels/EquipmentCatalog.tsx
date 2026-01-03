'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRackStore } from '@/stores';
import { EQUIPMENT_CATALOG, getEquipmentById } from '@/constants';

export function EquipmentCatalog() {
  const addEquipment = useRackStore((state) => state.addEquipment);
  const rack = useRackStore((state) => state.rack);
  const equipment = useRackStore((state) => state.equipment);

  // Find next available slot for equipment
  const findNextAvailableSlot = (heightU: number): number | null => {
    for (let i = 1; i <= rack.config.size - heightU + 1; i++) {
      let available = true;
      for (let j = 0; j < heightU; j++) {
        const slot = rack.slots[i - 1 + j];
        if (slot.occupied) {
          available = false;
          break;
        }
      }
      if (available) return i;
    }
    return null;
  };

  const handleAddEquipment = (equipmentId: string) => {
    const definition = getEquipmentById(equipmentId);
    if (!definition) return;

    const slot = findNextAvailableSlot(definition.heightU);
    if (slot === null) {
      alert('No available slot for this equipment');
      return;
    }

    addEquipment(definition, slot);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Equipment Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Click to add equipment to the next available slot.
        </p>
        <div className="space-y-2">
          {EQUIPMENT_CATALOG.map((eq) => (
            <div
              key={eq.id}
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
          ))}
        </div>

        {equipment.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">
              Installed ({equipment.length})
            </div>
            {equipment.map((eq) => (
              <div key={eq.instanceId} className="text-xs py-1">
                U{eq.slotPosition}: {eq.name}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

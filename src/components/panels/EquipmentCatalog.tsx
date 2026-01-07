'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DraggableEquipment } from '@/components/dnd/DraggableEquipment';
import { useRackStore } from '@/stores';
import { EQUIPMENT_CATALOG } from '@/constants';
import { useEquipmentDrag } from '@/hooks/useEquipmentDrag';
import { groupByManufacturer } from '@/lib/catalog';

export function EquipmentCatalog() {
  const rack = useRackStore((state) => state.rack);
  const equipment = useRackStore((state) => state.equipment);
  const removeEquipment = useRackStore((state) => state.removeEquipment);
  const { findNextAvailableSlot, addEquipmentById } = useEquipmentDrag();
  const groupedEquipment = useMemo(
    () => groupByManufacturer(EQUIPMENT_CATALOG),
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedManufacturers, setCollapsedManufacturers] = useState<
    Record<string, boolean>
  >({});
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) {
      return groupedEquipment;
    }

    return groupedEquipment.reduce((acc, group) => {
      const manufacturerMatch = group.manufacturer
        .toLowerCase()
        .includes(normalizedQuery);
      const items = manufacturerMatch
        ? group.items
        : group.items.filter((item) => {
            const haystack = `${item.name} ${item.model} ${item.manufacturer} ${item.type}`.toLowerCase();
            return haystack.includes(normalizedQuery);
          });

      if (items.length > 0) {
        acc.push({
          manufacturer: group.manufacturer,
          items,
        });
      }

      return acc;
    }, [] as typeof groupedEquipment);
  }, [groupedEquipment, normalizedQuery]);
  const hasQuery = normalizedQuery.length > 0;

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
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search equipment"
          className="mb-3 h-8 text-xs"
        />
        <div className="space-y-3">
          {filteredGroups.length === 0 && (
            <div className="py-4 text-xs text-muted-foreground text-center">
              No matches found
            </div>
          )}
          {filteredGroups.map((group) => (
            <div key={group.manufacturer} className="space-y-2">
              <button
                type="button"
                className="w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between"
                onClick={() =>
                  setCollapsedManufacturers((prev) => ({
                    ...prev,
                    [group.manufacturer]: !(prev[group.manufacturer] ?? false),
                  }))
                }
              >
                <span>{group.manufacturer}</span>
                {collapsedManufacturers[group.manufacturer] && !hasQuery ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {(!collapsedManufacturers[group.manufacturer] || hasQuery) &&
                group.items.map((eq) => (
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

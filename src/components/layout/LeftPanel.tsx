'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Server, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableEquipment } from '@/components/dnd/DraggableEquipment';
import { useRackStore } from '@/stores';
import { EQUIPMENT_CATALOG } from '@/constants';
import { useEquipmentDrag } from '@/hooks/useEquipmentDrag';
import { groupByManufacturer } from '@/lib/catalog';

export function LeftPanel() {
  const equipment = useRackStore((state) => state.equipment);
  const removeEquipment = useRackStore((state) => state.removeEquipment);
  const { findNextAvailableSlot, addEquipmentById } = useEquipmentDrag();
  const groupedEquipment = groupByManufacturer(EQUIPMENT_CATALOG);
  const [collapsedManufacturers, setCollapsedManufacturers] = useState<
    Record<string, boolean>
  >({});

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
    <div className="w-[260px] h-full border-r border-border bg-card flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Server className="h-4 w-4 text-primary" />
          Equipment Catalog
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Click or drag to add equipment
        </p>
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {groupedEquipment.map((group) => (
          <div key={group.manufacturer} className="space-y-1.5">
            <button
              type="button"
              className="w-full px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between"
              onClick={() =>
                setCollapsedManufacturers((prev) => ({
                  ...prev,
                  [group.manufacturer]: !(prev[group.manufacturer] ?? false),
                }))
              }
            >
              <span>{group.manufacturer}</span>
              {collapsedManufacturers[group.manufacturer] ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {!collapsedManufacturers[group.manufacturer] &&
              group.items.map((eq) => (
                <DraggableEquipment key={eq.id} equipmentId={eq.id}>
                  <div
                    className="p-2.5 border border-border rounded-md bg-background hover:bg-accent/50 cursor-pointer transition-colors group"
                    onClick={() => handleAddEquipment(eq.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{eq.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {eq.heightU}U · {eq.ports.length} ports
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </DraggableEquipment>
              ))}
          </div>
        ))}
      </div>

      {/* Installed Equipment */}
      {equipment.length > 0 && (
        <div className="border-t border-border">
          <div className="p-2 text-xs text-muted-foreground font-medium">
            Installed ({equipment.length})
          </div>
          <div className="max-h-[200px] overflow-y-auto px-2 pb-2 space-y-1">
            {equipment
              .slice()
              .sort((a, b) => a.slotPosition - b.slotPosition)
              .map((eq) => (
                <div
                  key={eq.instanceId}
                  className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded bg-muted/50 group"
                >
                  <div className="truncate flex-1">
                    <span className="text-muted-foreground">U{eq.slotPosition}:</span>{' '}
                    {eq.customLabel || eq.name}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => removeEquipment(eq.instanceId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

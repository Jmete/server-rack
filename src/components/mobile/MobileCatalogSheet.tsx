'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { MobileSheet } from './MobileSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DraggableEquipment } from '@/components/dnd/DraggableEquipment';
import { useRackStore, useUIStore } from '@/stores';
import { EQUIPMENT_CATALOG } from '@/constants';
import { useEquipmentDrag } from '@/hooks/useEquipmentDrag';
import { groupByManufacturer } from '@/lib/catalog';

export function MobileCatalogSheet() {
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
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
    // Close the sheet after adding
    setActivePanel('none');
  };

  return (
    <MobileSheet
      open={activePanel === 'catalog'}
      onOpenChange={(open) => setActivePanel(open ? 'catalog' : 'none')}
      title="Equipment Catalog"
    >
      <div className="flex flex-col h-full">
        {/* Search */}
        <div className="px-4 pb-3">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search equipment..."
            className="h-10 text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tap to add equipment to rack
          </p>
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {filteredGroups.length === 0 && (
            <div className="py-8 text-sm text-muted-foreground text-center">
              No matches found
            </div>
          )}
          {filteredGroups.map((group) => (
            <div key={group.manufacturer} className="space-y-2">
              <button
                type="button"
                className="w-full text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between py-1"
                onClick={() =>
                  setCollapsedManufacturers((prev) => ({
                    ...prev,
                    [group.manufacturer]: !(prev[group.manufacturer] ?? false),
                  }))
                }
              >
                <span>{group.manufacturer}</span>
                {collapsedManufacturers[group.manufacturer] && !hasQuery ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {(!collapsedManufacturers[group.manufacturer] || hasQuery) &&
                group.items.map((eq) => (
                  <DraggableEquipment key={eq.id} equipmentId={eq.id}>
                    <div
                      className="p-3 border border-border rounded-lg bg-background active:bg-accent/50 transition-colors"
                      onClick={() => handleAddEquipment(eq.id)}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{eq.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {eq.heightU}U · {eq.ports.length} ports
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
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
          <div className="border-t border-border px-4 py-3">
            <div className="text-xs text-muted-foreground font-medium mb-2">
              Installed ({equipment.length})
            </div>
            <div className="max-h-[150px] overflow-y-auto space-y-1.5">
              {equipment
                .slice()
                .sort((a, b) => a.slotPosition - b.slotPosition)
                .map((eq) => (
                  <div
                    key={eq.instanceId}
                    className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/50"
                  >
                    <div className="truncate flex-1">
                      <span className="text-muted-foreground">U{eq.slotPosition}:</span>{' '}
                      {eq.customLabel || eq.name}
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeEquipment(eq.instanceId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </MobileSheet>
  );
}

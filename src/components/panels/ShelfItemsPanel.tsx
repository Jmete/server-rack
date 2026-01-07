'use client';

import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, ChevronRight, Package, Plus, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Equipment } from '@/types';
import { ShelfItem, ShelfItemDefinition, ShelfItemPosition } from '@/types/shelf';
import { useShelfStore } from '@/stores/useShelfStore';
import { SHELF_ITEM_CATALOG } from '@/constants/shelfItems';
import { groupByManufacturer } from '@/lib/catalog';

interface ShelfItemsPanelProps {
  shelf: Equipment;
}

const MOVE_STEP_MM = 10;

export function ShelfItemsPanel({ shelf }: ShelfItemsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [collapsedManufacturers, setCollapsedManufacturers] = useState<
    Record<string, boolean>
  >({});

  // Select raw data and derive from it to avoid infinite loops
  const shelfItemsMap = useShelfStore((state) => state.shelfItems);
  const shelfItems = shelfItemsMap[shelf.instanceId] || [];
  const addItemToShelf = useShelfStore((state) => state.addItemToShelf);
  const removeItemFromShelf = useShelfStore((state) => state.removeItemFromShelf);
  const rotateItem = useShelfStore((state) => state.rotateItem);
  const moveItemOnShelf = useShelfStore((state) => state.moveItemOnShelf);
  const getUsableShelfArea = useShelfStore((state) => state.getUsableShelfArea);
  const findAvailablePositionOnShelf = useShelfStore((state) => state.findAvailablePositionOnShelf);
  const usableArea = getUsableShelfArea(shelf);
  const groupedShelfItems = groupByManufacturer(SHELF_ITEM_CATALOG);

  const handleAddItem = (definition: ShelfItemDefinition) => {
    const position = findAvailablePositionOnShelf(
      shelf.instanceId,
      definition,
      shelf
    );

    if (!position) {
      return;
    }

    // Try to add the item
    const result = addItemToShelf(shelf.instanceId, definition, position, shelf);
    if (result) {
      setAddDialogOpen(false);
    }
  };

  const handleRotateItem = (itemId: string) => {
    rotateItem(shelf.instanceId, itemId, shelf);
  };

  const handleMoveItem = (item: ShelfItem, deltaX: number, deltaZ: number) => {
    const nextPosition: ShelfItemPosition = {
      ...item.position,
      x: item.position.x + deltaX,
      z: item.position.z + deltaZ,
    };

    moveItemOnShelf(shelf.instanceId, item.instanceId, nextPosition, shelf);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemFromShelf(shelf.instanceId, itemId);
  };

  return (
    <div className="border-t border-border">
      <button
        type="button"
        className="w-full p-3 flex items-center justify-between text-sm font-medium hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          Shelf Items ({shelfItems.length})
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Add Item Button */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full h-8">
                <Plus className="h-4 w-4 mr-2" />
                Add Item to Shelf
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Item to Shelf</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {groupedShelfItems.map((group) => (
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
                      {collapsedManufacturers[group.manufacturer] ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {!collapsedManufacturers[group.manufacturer] &&
                      group.items.map((item) => {
                        const canPlace = Boolean(
                          findAvailablePositionOnShelf(shelf.instanceId, item, shelf)
                        );

                        return (
                          <ShelfItemCatalogCard
                            key={item.id}
                            item={item}
                            usableArea={usableArea}
                            canPlace={canPlace}
                            onAdd={() => handleAddItem(item)}
                          />
                        );
                      })}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Shelf Area Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            Usable area: {Math.round(usableArea.width)}mm x {Math.round(usableArea.depth)}mm
          </div>

          {/* Existing Items */}
          {shelfItems.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-2">
              No items on this shelf
            </div>
          ) : (
            shelfItems.map((item) => (
              <ShelfItemCard
                key={item.instanceId}
                item={item}
                onRotate={() => handleRotateItem(item.instanceId)}
                onRemove={() => handleRemoveItem(item.instanceId)}
                onMove={(deltaX, deltaZ) => handleMoveItem(item, deltaX, deltaZ)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ShelfItemCatalogCardProps {
  item: ShelfItemDefinition;
  usableArea: { width: number; depth: number };
  canPlace: boolean;
  onAdd: () => void;
}

function ShelfItemCatalogCard({ item, usableArea, canPlace, onAdd }: ShelfItemCatalogCardProps) {
  const fitsInArea =
    (item.width <= usableArea.width && item.depth <= usableArea.depth) ||
    (item.depth <= usableArea.width && item.width <= usableArea.depth);
  const statusLabel = fitsInArea ? 'No space' : 'Too large';

  return (
    <div
      className={`p-2 rounded-md border ${canPlace ? 'border-border hover:border-primary cursor-pointer' : 'border-border opacity-50'}`}
      onClick={canPlace ? onAdd : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.manufacturer}</div>
        </div>
        {canPlace ? (
          <Button size="sm" variant="ghost" className="h-7">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs text-destructive">{statusLabel}</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {item.width}mm x {item.depth}mm x {item.heightMm}mm
      </div>
    </div>
  );
}

interface ShelfItemCardProps {
  item: ShelfItem;
  onRotate: () => void;
  onRemove: () => void;
  onMove: (deltaX: number, deltaZ: number) => void;
}

function ShelfItemCard({ item, onRotate, onRemove, onMove }: ShelfItemCardProps) {
  return (
    <div className="p-2 rounded-md bg-muted/50 text-xs">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">{item.name}</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            title="Rotate 90°"
            onClick={onRotate}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            title="Remove"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-muted-foreground mb-1.5">
        <span>Nudge</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            title="Move left"
            onClick={() => onMove(-MOVE_STEP_MM, 0)}
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            title="Move right"
            onClick={() => onMove(MOVE_STEP_MM, 0)}
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            title="Move front"
            onClick={() => onMove(0, -MOVE_STEP_MM)}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            title="Move back"
            onClick={() => onMove(0, MOVE_STEP_MM)}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground">
        Position: ({Math.round(item.position.x)}, {Math.round(item.position.z)})mm · {item.position.rotation}°
      </div>
      <div className="text-muted-foreground">
        {item.width}mm x {item.depth}mm x {item.heightMm}mm
      </div>
    </div>
  );
}

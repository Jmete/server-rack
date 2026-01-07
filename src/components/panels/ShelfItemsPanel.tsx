'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Plus, RotateCw, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Equipment } from '@/types';
import { ShelfItem, ShelfItemDefinition, ShelfItemPosition } from '@/types/shelf';
import { useShelfStore } from '@/stores/useShelfStore';
import { useRackStore } from '@/stores';
import { SHELF_ITEM_CATALOG } from '@/constants/shelfItems';

interface ShelfItemsPanelProps {
  shelf: Equipment;
}

export function ShelfItemsPanel({ shelf }: ShelfItemsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Select raw data and derive from it to avoid infinite loops
  const shelfItemsMap = useShelfStore((state) => state.shelfItems);
  const shelfItems = shelfItemsMap[shelf.instanceId] || [];
  const addItemToShelf = useShelfStore((state) => state.addItemToShelf);
  const removeItemFromShelf = useShelfStore((state) => state.removeItemFromShelf);
  const rotateItem = useShelfStore((state) => state.rotateItem);
  const getUsableShelfArea = useShelfStore((state) => state.getUsableShelfArea);
  const usableArea = getUsableShelfArea(shelf);

  const handleAddItem = (definition: ShelfItemDefinition) => {
    // Find an available position on the shelf
    const position: ShelfItemPosition = {
      x: 10, // Start near left edge
      z: 10, // Start near front
      rotation: 0,
    };

    // Try to add the item
    const result = addItemToShelf(shelf.instanceId, definition, position, shelf);
    if (result) {
      setAddDialogOpen(false);
    }
  };

  const handleRotateItem = (itemId: string) => {
    rotateItem(shelf.instanceId, itemId, shelf);
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {SHELF_ITEM_CATALOG.map((item) => (
                  <ShelfItemCatalogCard
                    key={item.id}
                    item={item}
                    usableArea={usableArea}
                    onAdd={() => handleAddItem(item)}
                  />
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
  onAdd: () => void;
}

function ShelfItemCatalogCard({ item, usableArea, onAdd }: ShelfItemCatalogCardProps) {
  const fitsWidth = item.width <= usableArea.width;
  const fitsDepth = item.depth <= usableArea.depth;
  const fits = fitsWidth && fitsDepth;

  return (
    <div
      className={`p-2 rounded-md border ${fits ? 'border-border hover:border-primary cursor-pointer' : 'border-border opacity-50'}`}
      onClick={fits ? onAdd : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.manufacturer}</div>
        </div>
        {fits ? (
          <Button size="sm" variant="ghost" className="h-7">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs text-destructive">Too large</span>
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
}

function ShelfItemCard({ item, onRotate, onRemove }: ShelfItemCardProps) {
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
      <div className="text-muted-foreground">
        Position: ({Math.round(item.position.x)}, {Math.round(item.position.z)})mm · {item.position.rotation}°
      </div>
      <div className="text-muted-foreground">
        {item.width}mm x {item.depth}mm x {item.heightMm}mm
      </div>
    </div>
  );
}

import { create } from 'zustand';
import {
  ShelfItem,
  ShelfItemDefinition,
  ShelfItemPosition,
  ShelfItemRotation,
  createShelfItemInstance,
  getRotatedDimensions,
  getShelfItemBounds,
  shelfItemsOverlap,
  getNextRotation,
} from '@/types/shelf';
import { Equipment } from '@/types/equipment';
import { useConnectionStore } from './useConnectionStore';

// Margin for mounting rails on each side of shelf (mm)
const SHELF_RAIL_MARGIN_MM = 20;
// Front lip margin (mm)
const SHELF_FRONT_MARGIN_MM = 10;

interface ShelfState {
  // Map of shelf instance ID to array of items on that shelf
  shelfItems: Record<string, ShelfItem[]>;

  // Import/Export
  importShelfItems: (shelfItems: Record<string, ShelfItem[]>) => void;
  exportShelfItems: () => Record<string, ShelfItem[]>;

  // Actions
  addItemToShelf: (
    shelfInstanceId: string,
    definition: ShelfItemDefinition,
    position: ShelfItemPosition,
    shelfEquipment: Equipment
  ) => ShelfItem | null;

  removeItemFromShelf: (shelfInstanceId: string, itemInstanceId: string) => void;

  removeAllItemsFromShelf: (shelfInstanceId: string) => void;

  moveItemOnShelf: (
    shelfInstanceId: string,
    itemInstanceId: string,
    newPosition: ShelfItemPosition,
    shelfEquipment: Equipment
  ) => boolean;

  rotateItem: (
    shelfInstanceId: string,
    itemInstanceId: string,
    shelfEquipment: Equipment
  ) => boolean;

  // Queries
  canPlaceItemOnShelf: (
    shelfInstanceId: string,
    width: number,
    depth: number,
    position: ShelfItemPosition,
    shelfEquipment: Equipment,
    excludeItemId?: string
  ) => boolean;

  findAvailablePositionOnShelf: (
    shelfInstanceId: string,
    definition: ShelfItemDefinition,
    shelfEquipment: Equipment
  ) => ShelfItemPosition | null;

  getMaxHeightOnShelf: (shelfInstanceId: string) => number;

  getItemsOnShelf: (shelfInstanceId: string) => ShelfItem[];

  getItemById: (shelfInstanceId: string, itemInstanceId: string) => ShelfItem | undefined;

  // Calculate usable shelf area (accounting for rails and margins)
  getUsableShelfArea: (shelfEquipment: Equipment) => {
    width: number;
    depth: number;
  };
}

export const useShelfStore = create<ShelfState>((set, get) => ({
  shelfItems: {},

  importShelfItems: (shelfItems) => {
    set({ shelfItems });
  },

  exportShelfItems: () => {
    return get().shelfItems;
  },

  addItemToShelf: (shelfInstanceId, definition, position, shelfEquipment) => {
    const state = get();

    // Validate placement
    if (
      !state.canPlaceItemOnShelf(
        shelfInstanceId,
        definition.width,
        definition.depth,
        position,
        shelfEquipment
      )
    ) {
      return null;
    }

    // Check minimum shelf depth requirement
    if (definition.minShelfDepth && shelfEquipment.depth < definition.minShelfDepth) {
      return null;
    }

    const newItem = createShelfItemInstance(definition, shelfInstanceId, position);

    set((state) => {
      const currentItems = state.shelfItems[shelfInstanceId] || [];
      return {
        shelfItems: {
          ...state.shelfItems,
          [shelfInstanceId]: [...currentItems, newItem],
        },
      };
    });

    return newItem;
  },

  removeItemFromShelf: (shelfInstanceId, itemInstanceId) => {
    // Remove any cables connected to this item's ports
    useConnectionStore.getState().removeCablesForEquipment(itemInstanceId);

    set((state) => {
      const currentItems = state.shelfItems[shelfInstanceId] || [];
      return {
        shelfItems: {
          ...state.shelfItems,
          [shelfInstanceId]: currentItems.filter(
            (item) => item.instanceId !== itemInstanceId
          ),
        },
      };
    });
  },

  removeAllItemsFromShelf: (shelfInstanceId) => {
    const state = get();
    const items = state.shelfItems[shelfInstanceId] || [];

    // Remove cables for all items
    items.forEach((item) => {
      useConnectionStore.getState().removeCablesForEquipment(item.instanceId);
    });

    set((state) => {
      const newShelfItems = { ...state.shelfItems };
      delete newShelfItems[shelfInstanceId];
      return { shelfItems: newShelfItems };
    });
  },

  moveItemOnShelf: (shelfInstanceId, itemInstanceId, newPosition, shelfEquipment) => {
    const state = get();
    const item = state.getItemById(shelfInstanceId, itemInstanceId);

    if (!item) return false;

    // Validate new position
    if (
      !state.canPlaceItemOnShelf(
        shelfInstanceId,
        item.width,
        item.depth,
        newPosition,
        shelfEquipment,
        itemInstanceId
      )
    ) {
      return false;
    }

    set((state) => {
      const currentItems = state.shelfItems[shelfInstanceId] || [];
      return {
        shelfItems: {
          ...state.shelfItems,
          [shelfInstanceId]: currentItems.map((i) =>
            i.instanceId === itemInstanceId
              ? { ...i, position: newPosition }
              : i
          ),
        },
      };
    });

    return true;
  },

  rotateItem: (shelfInstanceId, itemInstanceId, shelfEquipment) => {
    const state = get();
    const item = state.getItemById(shelfInstanceId, itemInstanceId);

    if (!item) return false;

    const newRotation = getNextRotation(item.position.rotation);
    const newPosition: ShelfItemPosition = {
      ...item.position,
      rotation: newRotation,
    };

    // Check if rotated item still fits
    if (
      !state.canPlaceItemOnShelf(
        shelfInstanceId,
        item.width,
        item.depth,
        newPosition,
        shelfEquipment,
        itemInstanceId
      )
    ) {
      return false;
    }

    set((state) => {
      const currentItems = state.shelfItems[shelfInstanceId] || [];
      return {
        shelfItems: {
          ...state.shelfItems,
          [shelfInstanceId]: currentItems.map((i) =>
            i.instanceId === itemInstanceId
              ? { ...i, position: newPosition }
              : i
          ),
        },
      };
    });

    return true;
  },

  canPlaceItemOnShelf: (
    shelfInstanceId,
    width,
    depth,
    position,
    shelfEquipment,
    excludeItemId
  ) => {
    const state = get();
    const { width: usableWidth, depth: usableDepth } =
      state.getUsableShelfArea(shelfEquipment);

    // Get rotated dimensions
    const rotated = getRotatedDimensions(width, depth, position.rotation);

    // Check bounds
    if (
      position.x < 0 ||
      position.z < 0 ||
      position.x + rotated.width > usableWidth ||
      position.z + rotated.depth > usableDepth
    ) {
      return false;
    }

    // Create bounds for the item being placed
    const newItemBounds = {
      left: position.x,
      right: position.x + rotated.width,
      front: position.z,
      back: position.z + rotated.depth,
    };

    // Check overlap with existing items
    const existingItems = state.shelfItems[shelfInstanceId] || [];
    for (const item of existingItems) {
      if (excludeItemId && item.instanceId === excludeItemId) {
        continue;
      }

      const existingBounds = getShelfItemBounds(item);
      if (shelfItemsOverlap(newItemBounds, existingBounds)) {
        return false;
      }
    }

    return true;
  },

  findAvailablePositionOnShelf: (shelfInstanceId, definition, shelfEquipment) => {
    const state = get();
    const { width: usableWidth, depth: usableDepth } =
      state.getUsableShelfArea(shelfEquipment);

    if (usableWidth <= 0 || usableDepth <= 0) {
      return null;
    }

    if (definition.minShelfDepth && shelfEquipment.depth < definition.minShelfDepth) {
      return null;
    }

    const existingItems = state.shelfItems[shelfInstanceId] || [];
    const xCandidates = new Set<number>([0]);
    const zCandidates = new Set<number>([0]);

    for (const item of existingItems) {
      const bounds = getShelfItemBounds(item);
      xCandidates.add(bounds.right);
      zCandidates.add(bounds.back);
    }

    const sortedX = Array.from(xCandidates).sort((a, b) => a - b);
    const sortedZ = Array.from(zCandidates).sort((a, b) => a - b);
    const rotations: ShelfItemRotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      const rotated = getRotatedDimensions(definition.width, definition.depth, rotation);

      for (const z of sortedZ) {
        if (z + rotated.depth > usableDepth) continue;

        for (const x of sortedX) {
          if (x + rotated.width > usableWidth) continue;

          const position: ShelfItemPosition = { x, z, rotation };
          if (
            state.canPlaceItemOnShelf(
              shelfInstanceId,
              definition.width,
              definition.depth,
              position,
              shelfEquipment
            )
          ) {
            return position;
          }
        }
      }
    }

    return null;
  },

  getMaxHeightOnShelf: (shelfInstanceId) => {
    const state = get();
    const items = state.shelfItems[shelfInstanceId] || [];

    if (items.length === 0) return 0;

    return Math.max(...items.map((item) => item.heightMm));
  },

  getItemsOnShelf: (shelfInstanceId) => {
    return get().shelfItems[shelfInstanceId] || [];
  },

  getItemById: (shelfInstanceId, itemInstanceId) => {
    const items = get().shelfItems[shelfInstanceId] || [];
    return items.find((item) => item.instanceId === itemInstanceId);
  },

  getUsableShelfArea: (shelfEquipment) => {
    // Standard 19" rack width minus rail margins on each side
    const usableWidth = shelfEquipment.width - SHELF_RAIL_MARGIN_MM * 2;
    // Shelf depth minus front margin
    const usableDepth = shelfEquipment.depth - SHELF_FRONT_MARGIN_MM;

    return { width: usableWidth, depth: usableDepth };
  },
}));

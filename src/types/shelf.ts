import { PortDefinition, Port, createPortInstances } from './port';
import { EquipmentFeature } from './equipment';

// Rotation values for items placed on shelves (degrees)
export type ShelfItemRotation = 0 | 90 | 180 | 270;

// Position of an item on a shelf (in mm from shelf front-left corner)
export interface ShelfItemPosition {
  x: number; // mm from left edge of usable shelf area
  z: number; // mm from front edge of shelf (depth into rack)
  rotation: ShelfItemRotation;
}

// Definition for items that can be placed on shelves (catalog entry)
export interface ShelfItemDefinition {
  id: string;
  type: string; // Category like 'dvr', 'router', 'appliance'
  name: string;
  model: string;
  manufacturer: string;
  width: number; // mm
  depth: number; // mm
  heightMm: number; // Height in mm (not U units)
  color: string;
  ports: PortDefinition[];
  features: EquipmentFeature[];
  isShelfItem: true; // Discriminator flag
  minShelfDepth?: number; // Minimum shelf depth required (mm)
}

// Instance of a shelf item placed on a specific shelf
export interface ShelfItem extends ShelfItemDefinition {
  instanceId: string;
  shelfInstanceId: string; // Reference to parent shelf equipment
  position: ShelfItemPosition;
  customLabel?: string;
  notes?: string;
}

// Port instance for shelf items (similar to equipment ports)
export interface ShelfItemPort extends Port {
  shelfItemInstanceId: string;
}

// Type guard to check if a definition is a shelf item
export function isShelfItemDefinition(
  def: unknown
): def is ShelfItemDefinition {
  return (
    typeof def === 'object' &&
    def !== null &&
    'isShelfItem' in def &&
    (def as ShelfItemDefinition).isShelfItem === true
  );
}

// Helper to create a shelf item instance from a definition
export function createShelfItemInstance(
  definition: ShelfItemDefinition,
  shelfInstanceId: string,
  position: ShelfItemPosition
): ShelfItem {
  return {
    ...definition,
    instanceId: `shelf-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shelfInstanceId,
    position,
  };
}

// Helper to create port instances for a shelf item
export function createShelfItemPortInstances(
  definitions: PortDefinition[],
  shelfItemInstanceId: string
): ShelfItemPort[] {
  const basePorts = createPortInstances(definitions, shelfItemInstanceId);
  return basePorts.map((port) => ({
    ...port,
    shelfItemInstanceId,
  }));
}

// Calculate dimensions after rotation
export function getRotatedDimensions(
  width: number,
  depth: number,
  rotation: ShelfItemRotation
): { width: number; depth: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: depth, depth: width };
  }
  return { width, depth };
}

// Get next rotation value (cycles through 0 -> 90 -> 180 -> 270 -> 0)
export function getNextRotation(
  current: ShelfItemRotation
): ShelfItemRotation {
  const rotations: ShelfItemRotation[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(current);
  return rotations[(currentIndex + 1) % 4];
}

// Calculate bounding box for a shelf item (in mm, relative to shelf origin)
export interface ShelfItemBounds {
  left: number;
  right: number;
  front: number;
  back: number;
}

export function getShelfItemBounds(item: ShelfItem): ShelfItemBounds {
  const { width, depth } = getRotatedDimensions(
    item.width,
    item.depth,
    item.position.rotation
  );

  return {
    left: item.position.x,
    right: item.position.x + width,
    front: item.position.z,
    back: item.position.z + depth,
  };
}

// Check if two shelf items overlap
export function shelfItemsOverlap(
  item1: ShelfItem | ShelfItemBounds,
  item2: ShelfItem | ShelfItemBounds
): boolean {
  const bounds1 = 'left' in item1 ? item1 : getShelfItemBounds(item1);
  const bounds2 = 'left' in item2 ? item2 : getShelfItemBounds(item2);

  // No overlap if one is completely to the left/right/front/back of the other
  return !(
    bounds1.right <= bounds2.left ||
    bounds1.left >= bounds2.right ||
    bounds1.back <= bounds2.front ||
    bounds1.front >= bounds2.back
  );
}

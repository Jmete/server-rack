'use client';

import { Html } from '@react-three/drei';
import { Equipment } from '@/types';
import { ShelfItem } from '@/types/shelf';
import { mmToScene, uToScene, FRAME_THICKNESS_MM } from '@/constants';
import { useRackStore } from '@/stores';

interface ShelfItemLabelOverlayProps {
  item: ShelfItem;
  parentShelf: Equipment;
}

const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;
const SHELF_THICKNESS_MM = 2;
const BRACKET_WIDTH_MM = 20;

export function ShelfItemLabelOverlay({ item, parentShelf }: ShelfItemLabelOverlayProps) {
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const RACK_DEPTH = mmToScene(rackDepthMm);

  // Calculate parent shelf position
  const shelfHeight = uToScene(parentShelf.heightU);
  const shelfDepthMm = Math.min(parentShelf.depth, rackDepthMm - 50);
  const SHELF_DEPTH = mmToScene(shelfDepthMm);
  const SHELF_WIDTH = mmToScene(parentShelf.width);
  const SHELF_THICKNESS = mmToScene(SHELF_THICKNESS_MM);
  const BRACKET_WIDTH = mmToScene(BRACKET_WIDTH_MM);

  const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
  const shelfYPosition = SLOT_START_OFFSET + uToScene(parentShelf.slotPosition - 1) + shelfHeight - SHELF_THICKNESS / 2;
  const shelfZPosition = RAIL_FRONT_Z - SHELF_DEPTH / 2;

  // Calculate usable shelf area origin (same as RackShelf)
  const usableStartX = -SHELF_WIDTH / 2 + BRACKET_WIDTH;
  const usableStartZ = SHELF_DEPTH / 2 - mmToScene(10);

  // Calculate item dimensions accounting for rotation
  const itemWidth = item.position.rotation === 90 || item.position.rotation === 270
    ? mmToScene(item.depth)
    : mmToScene(item.width);
  const itemDepth = item.position.rotation === 90 || item.position.rotation === 270
    ? mmToScene(item.width)
    : mmToScene(item.depth);
  const itemHeight = mmToScene(item.heightMm);

  // Calculate item position relative to shelf (same as ShelfItemOnShelf)
  const itemXPos = usableStartX + mmToScene(item.position.x) + itemWidth / 2;
  const itemYPos = SHELF_THICKNESS / 2 + itemHeight / 2;
  const itemZPos = usableStartZ - mmToScene(item.position.z) - itemDepth / 2;

  // World position of the item's front face center
  const worldX = itemXPos;
  const worldY = shelfYPosition + itemYPos;
  const worldZ = shelfZPosition + itemZPos + itemDepth / 2 + 0.02; // Front face + offset

  // Use distanceFactor to scale with camera distance
  const distanceFactor = 8;

  // Calculate overlay dimensions to match item size
  const widthPx = itemWidth * 52;
  const heightPx = itemHeight * 130;

  // Format type for display
  const displayType = item.type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get label to display
  const displayLabel = item.customLabel || item.name;

  // Determine if we need smaller text for longer labels
  const isLongLabel = displayLabel.length > 20;

  return (
    <Html
      center
      position={[worldX, worldY, worldZ]}
      distanceFactor={distanceFactor}
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex flex-col items-center justify-center h-full w-full bg-black/90 text-white rounded border border-white/40 px-1 py-0.5 overflow-hidden text-center"
      >
        <span className="text-[8px] font-medium opacity-70 uppercase tracking-wider mb-0.5">
          {displayType}
        </span>
        <span
          className={`font-semibold leading-tight w-full ${
            isLongLabel ? 'text-[9px]' : 'text-[10px]'
          }`}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {displayLabel}
        </span>
      </div>
    </Html>
  );
}

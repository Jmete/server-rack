'use client';

import { Html } from '@react-three/drei';
import { Equipment } from '@/types';
import { mmToScene, uToScene, FRAME_THICKNESS_MM } from '@/constants';
import { useRackStore } from '@/stores';

interface EquipmentLabelOverlayProps {
  equipment: Equipment;
}

const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function EquipmentLabelOverlay({ equipment }: EquipmentLabelOverlayProps) {
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const RACK_DEPTH = mmToScene(rackDepthMm);

  // Calculate equipment dimensions in scene units
  const equipmentWidth = mmToScene(equipment.width);
  const equipmentHeight = uToScene(equipment.heightU);

  // Calculate position (same as equipment components)
  const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
  const yPosition = SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + equipmentHeight / 2;
  const zPosition = RAIL_FRONT_Z + 0.02; // Slightly in front of equipment face

  // Use distanceFactor to scale with camera distance
  const distanceFactor = 8;

  // Calculate overlay dimensions to match equipment size
  // These multipliers are calibrated to match the visual size with distanceFactor=8
  const widthPx = equipmentWidth * 52;
  const heightPx = equipmentHeight * 130;

  // Format type for display
  const displayType = equipment.type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get label to display
  const displayLabel = equipment.customLabel || equipment.name;

  // Determine if we need smaller text for longer labels
  const isLongLabel = displayLabel.length > 25;

  return (
    <Html
      center
      position={[0, yPosition, zPosition]}
      distanceFactor={distanceFactor}
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex flex-col items-center justify-center h-full w-full bg-black/90 text-white rounded border border-white/40 px-2 py-1 overflow-hidden text-center"
      >
        <span className="text-[9px] font-medium opacity-70 uppercase tracking-widest mb-0.5">
          {displayType}
        </span>
        <span
          className={`font-semibold leading-tight w-full ${
            isLongLabel ? 'text-[10px]' : 'text-xs'
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

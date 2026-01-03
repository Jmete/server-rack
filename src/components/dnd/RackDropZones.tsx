'use client';

import { useMemo, type CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { getEquipmentById } from '@/constants';
import { useRackStore, useUIStore } from '@/stores';

interface RackSlotDropZoneProps {
  slotNumber: number;
  canDrop: boolean;
  isOccupied: boolean;
  style: CSSProperties;
}

function RackSlotDropZone({ slotNumber, canDrop, isOccupied, style }: RackSlotDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotNumber}`,
    data: { slotNumber },
  });

  const base = 'absolute transition-colors';
  const idle = isOccupied ? 'bg-zinc-900/20' : 'bg-transparent';
  const state = isOver ? (canDrop ? 'bg-emerald-500/20' : 'bg-rose-500/20') : idle;

  return <div ref={setNodeRef} className={`${base} ${state}`} style={style} />;
}

export function RackDropZones() {
  const rack = useRackStore((state) => state.rack);
  const canPlaceEquipment = useRackStore((state) => state.canPlaceEquipment);
  const isDragging = useUIStore((state) => state.isDragging);
  const draggedEquipmentType = useUIStore((state) => state.draggedEquipmentType);
  const rackSlotBounds = useUIStore((state) => state.rackSlotBounds);

  const draggedDefinition = useMemo(
    () => (draggedEquipmentType ? getEquipmentById(draggedEquipmentType) : undefined),
    [draggedEquipmentType]
  );

  if (!isDragging || !rackSlotBounds || rackSlotBounds.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-auto">
      {rackSlotBounds.map((slotBounds) => {
        const slotNumber = slotBounds.slotNumber;
        const slot = rack.slots[slotNumber - 1];
        const canDrop = draggedDefinition
          ? canPlaceEquipment(draggedDefinition.heightU, slotNumber)
          : false;

        return (
          <RackSlotDropZone
            key={slotNumber}
            slotNumber={slotNumber}
            canDrop={canDrop}
            isOccupied={slot?.occupied ?? false}
            style={{
              left: slotBounds.left,
              top: slotBounds.top,
              width: slotBounds.width,
              height: slotBounds.height,
            }}
          />
        );
      })}
    </div>
  );
}

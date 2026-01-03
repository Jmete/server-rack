'use client';

import { useMemo, type CSSProperties } from 'react';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import { getEquipmentById } from '@/constants';
import { useRackStore, useUIStore } from '@/stores';

interface RackSlotDropZoneProps {
  slotNumber: number;
  highlight: 'valid' | 'invalid' | 'idle';
  isOccupied: boolean;
  style: CSSProperties;
}

function RackSlotDropZone({ slotNumber, highlight, isOccupied, style }: RackSlotDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotNumber}`,
    data: { slotNumber },
  });

  const base = 'absolute transition-colors';
  const idle = isOccupied ? 'bg-zinc-900/20' : 'bg-transparent';
  const state =
    highlight === 'valid'
      ? 'bg-emerald-500/20'
      : highlight === 'invalid'
      ? 'bg-rose-500/20'
      : isOver
      ? 'bg-emerald-500/10'
      : idle;

  return <div ref={setNodeRef} className={`${base} ${state}`} style={style} />;
}

export function RackDropZones() {
  const rack = useRackStore((state) => state.rack);
  const canPlaceEquipment = useRackStore((state) => state.canPlaceEquipment);
  const getEquipmentAtSlot = useRackStore((state) => state.getEquipmentAtSlot);
  const isDragging = useUIStore((state) => state.isDragging);
  const draggedEquipmentType = useUIStore((state) => state.draggedEquipmentType);
  const rackSlotBounds = useUIStore((state) => state.rackSlotBounds);
  const { active, over } = useDndContext();

  const dragData = active?.data.current as
    | { type: 'catalog'; equipmentId: string }
    | { type: 'rack'; instanceId: string; heightU: number }
    | undefined;

  const draggedDefinition = useMemo(() => {
    if (dragData?.type === 'catalog') {
      return getEquipmentById(dragData.equipmentId);
    }
    if (draggedEquipmentType) {
      return getEquipmentById(draggedEquipmentType);
    }
    return undefined;
  }, [dragData, draggedEquipmentType]);

  const draggedHeight = dragData?.type === 'rack'
    ? dragData.heightU
    : draggedDefinition?.heightU ?? 1;
  const excludeInstanceId = dragData?.type === 'rack' ? dragData.instanceId : undefined;
  const sourceSlot = dragData?.type === 'rack' ? dragData.slotPosition : null;

  const overSlotNumber = over?.id?.toString().startsWith('slot-')
    ? Number.parseInt(over.id.toString().replace('slot-', ''), 10)
    : null;
  let canDropRange = false;
  if (overSlotNumber && Number.isFinite(overSlotNumber)) {
    const canMoveDirect = canPlaceEquipment(draggedHeight, overSlotNumber, excludeInstanceId);
    if (canMoveDirect) {
      canDropRange = true;
    } else if (dragData?.type === 'rack' && sourceSlot !== null) {
      const target = getEquipmentAtSlot(overSlotNumber);
      if (target && target.instanceId !== dragData.instanceId) {
        const dragRange = {
          start: overSlotNumber,
          end: overSlotNumber + draggedHeight - 1,
        };
        const targetRange = {
          start: sourceSlot,
          end: sourceSlot + target.heightU - 1,
        };
        const rangesOverlap = !(dragRange.end < targetRange.start || targetRange.end < dragRange.start);
        if (!rangesOverlap) {
          const excludeIds = [dragData.instanceId, target.instanceId];
          const canMoveDragged = canPlaceEquipment(draggedHeight, overSlotNumber, excludeIds);
          const canMoveTarget = canPlaceEquipment(target.heightU, sourceSlot, excludeIds);
          canDropRange = canMoveDragged && canMoveTarget;
        }
      }
    }
  }

  if (!isDragging || !rackSlotBounds || rackSlotBounds.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-auto">
      {rackSlotBounds.map((slotBounds) => {
        const slotNumber = slotBounds.slotNumber;
        const slot = rack.slots[slotNumber - 1];
        const inRange =
          overSlotNumber !== null &&
          slotNumber >= overSlotNumber &&
          slotNumber < overSlotNumber + draggedHeight;
        const highlight = inRange ? (canDropRange ? 'valid' : 'invalid') : 'idle';

        return (
          <RackSlotDropZone
            key={slotNumber}
            slotNumber={slotNumber}
            highlight={highlight}
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

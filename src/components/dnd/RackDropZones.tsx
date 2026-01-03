'use client';

import { useEffect, useMemo, type CSSProperties } from 'react';
import { useDndContext, useDroppable } from '@dnd-kit/core';
import { getEquipmentById } from '@/constants';
import { useRackStore, useUIStore } from '@/stores';

interface RackSlotDropZoneProps {
  slotNumber: number;
  style: CSSProperties;
}

function RackSlotDropZone({ slotNumber, style }: RackSlotDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: `slot-${slotNumber}`,
    data: { slotNumber },
  });

  return <div ref={setNodeRef} className="absolute" style={style} />;
}

export function RackDropZones() {
  const rack = useRackStore((state) => state.rack);
  const canPlaceEquipment = useRackStore((state) => state.canPlaceEquipment);
  const getEquipmentAtSlot = useRackStore((state) => state.getEquipmentAtSlot);
  const isDragging = useUIStore((state) => state.isDragging);
  const draggedEquipmentType = useUIStore((state) => state.draggedEquipmentType);
  const rackSlotBounds = useUIStore((state) => state.rackSlotBounds);
  const setRackHover = useUIStore((state) => state.setRackHover);
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
  const overTarget =
    overSlotNumber && Number.isFinite(overSlotNumber) ? getEquipmentAtSlot(overSlotNumber) : undefined;
  const isSwapTarget =
    dragData?.type === 'rack' &&
    overTarget &&
    overTarget.instanceId !== dragData.instanceId;
  const intendedStart = isSwapTarget ? overTarget?.slotPosition ?? null : overSlotNumber;

  let canDropRange = false;
  if (intendedStart && Number.isFinite(intendedStart)) {
    const canMoveDirect = canPlaceEquipment(draggedHeight, intendedStart, excludeInstanceId);
    if (canMoveDirect) {
      canDropRange = true;
    } else if (dragData?.type === 'rack' && sourceSlot !== null && overTarget) {
      if (overTarget.instanceId !== dragData.instanceId) {
        const dragRange = {
          start: intendedStart,
          end: intendedStart + draggedHeight - 1,
        };
        const targetRange = {
          start: sourceSlot,
          end: sourceSlot + overTarget.heightU - 1,
        };
        const rangesOverlap = !(dragRange.end < targetRange.start || targetRange.end < dragRange.start);
        if (!rangesOverlap) {
          const excludeIds = [dragData.instanceId, overTarget.instanceId];
          const canMoveDragged = canPlaceEquipment(draggedHeight, intendedStart, excludeIds);
          const canMoveTarget = canPlaceEquipment(overTarget.heightU, sourceSlot, excludeIds);
          canDropRange = canMoveDragged && canMoveTarget;
        }
      }
    }
  }

  useEffect(() => {
    if (!isDragging || !intendedStart || !Number.isFinite(intendedStart)) {
      setRackHover(null);
      return;
    }
    setRackHover({
      start: intendedStart,
      count: draggedHeight,
      valid: canDropRange,
    });
  }, [isDragging, intendedStart, draggedHeight, canDropRange, setRackHover]);

  if (!isDragging || !rackSlotBounds || rackSlotBounds.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-auto">
      {rackSlotBounds.map((slotBounds) => {
        const slotNumber = slotBounds.slotNumber;
        return (
          <RackSlotDropZone
            key={slotNumber}
            slotNumber={slotNumber}
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

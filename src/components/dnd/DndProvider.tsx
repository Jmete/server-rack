'use client';

import { ReactNode } from 'react';
import {
  DndContext,
  type CollisionDetection,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { getEquipmentById } from '@/constants';
import { useRackStore, useUIStore } from '@/stores';

interface DndProviderProps {
  children: ReactNode;
}

interface DragPayload {
  type: 'catalog';
  equipmentId: string;
}

interface DragRackPayload {
  type: 'rack';
  instanceId: string;
  heightU: number;
  slotPosition: number;
}

export function DndProvider({ children }: DndProviderProps) {
  const addEquipment = useRackStore((state) => state.addEquipment);
  const canPlaceEquipment = useRackStore((state) => state.canPlaceEquipment);
  const moveEquipment = useRackStore((state) => state.moveEquipment);
  const swapEquipment = useRackStore((state) => state.swapEquipment);
  const getEquipmentAtSlot = useRackStore((state) => state.getEquipmentAtSlot);
  const setIsDragging = useUIStore((state) => state.setIsDragging);
  const setDraggedEquipmentType = useUIStore((state) => state.setDraggedEquipmentType);
  const draggedEquipmentType = useUIStore((state) => state.draggedEquipmentType);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current as DragPayload | DragRackPayload | undefined;
    setIsDragging(true);
    if (payload?.type === 'catalog') {
      setDraggedEquipmentType(payload.equipmentId);
      return;
    }
    setDraggedEquipmentType(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = event.active.data.current as DragPayload | DragRackPayload | undefined;
    const overId = event.over?.id?.toString() ?? '';

    setIsDragging(false);
    setDraggedEquipmentType(null);

    if (!payload || payload.type !== 'catalog' || !overId.startsWith('slot-')) {
      if (!payload || payload.type !== 'rack' || !overId.startsWith('slot-')) {
        return;
      }
      const slotPosition = Number.parseInt(overId.replace('slot-', ''), 10);
      if (!Number.isFinite(slotPosition)) return;

      const targetAtOver = getEquipmentAtSlot(slotPosition);
      const dropSlot =
        targetAtOver && targetAtOver.instanceId !== payload.instanceId
          ? targetAtOver.slotPosition
          : slotPosition;

      if (dropSlot === payload.slotPosition) return;
      if (canPlaceEquipment(payload.heightU, dropSlot, payload.instanceId)) {
        moveEquipment(payload.instanceId, dropSlot);
        return;
      }

      const target = targetAtOver;
      if (!target || target.instanceId === payload.instanceId) return;

      const dragRange = {
        start: dropSlot,
        end: dropSlot + payload.heightU - 1,
      };
      const targetRange = {
        start: payload.slotPosition,
        end: payload.slotPosition + target.heightU - 1,
      };
      const rangesOverlap = !(dragRange.end < targetRange.start || targetRange.end < dragRange.start);
      if (rangesOverlap) return;

      const excludeIds = [payload.instanceId, target.instanceId];
      const canMoveDragged = canPlaceEquipment(payload.heightU, slotPosition, excludeIds);
      const canMoveTarget = canPlaceEquipment(target.heightU, payload.slotPosition, excludeIds);

      if (canMoveDragged && canMoveTarget) {
        swapEquipment(payload.instanceId, target.instanceId);
      }
      return;
    }

    const definition = getEquipmentById(payload.equipmentId);
    if (!definition) return;

    const slotPosition = Number.parseInt(overId.replace('slot-', ''), 10);
    if (!Number.isFinite(slotPosition)) return;

    if (canPlaceEquipment(definition.heightU, slotPosition)) {
      addEquipment(definition, slotPosition);
    }
  };

  const handleDragCancel = () => {
    setIsDragging(false);
    setDraggedEquipmentType(null);
  };

  const previewLabel = draggedEquipmentType
    ? getEquipmentById(draggedEquipmentType)?.name ?? 'Equipment'
    : null;

  const collisionDetection: CollisionDetection = (args) => {
    const payload = args.active?.data?.current as DragPayload | DragRackPayload | undefined;
    if (payload?.type === 'rack') {
      const pointerHits = pointerWithin(args);
      if (pointerHits.length > 0) {
        return pointerHits;
      }
    }
    return rectIntersection(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay>
        {previewLabel ? (
          <div className="px-3 py-2 rounded-md bg-background border border-border text-sm shadow-md">
            {previewLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

'use client';

import { ReactNode } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
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

export function DndProvider({ children }: DndProviderProps) {
  const addEquipment = useRackStore((state) => state.addEquipment);
  const canPlaceEquipment = useRackStore((state) => state.canPlaceEquipment);
  const setIsDragging = useUIStore((state) => state.setIsDragging);
  const setDraggedEquipmentType = useUIStore((state) => state.setDraggedEquipmentType);
  const draggedEquipmentType = useUIStore((state) => state.draggedEquipmentType);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current as DragPayload | undefined;
    if (payload?.type === 'catalog') {
      setIsDragging(true);
      setDraggedEquipmentType(payload.equipmentId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = event.active.data.current as DragPayload | undefined;
    const overId = event.over?.id?.toString() ?? '';

    setIsDragging(false);
    setDraggedEquipmentType(null);

    if (!payload || payload.type !== 'catalog' || !overId.startsWith('slot-')) {
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
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

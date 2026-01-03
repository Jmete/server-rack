'use client';

import { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableEquipmentProps {
  equipmentId: string;
  children: ReactNode;
}

export function DraggableEquipment({ equipmentId, children }: DraggableEquipmentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `catalog-${equipmentId}`,
    data: {
      type: 'catalog',
      equipmentId,
    },
  });
  const { 'aria-describedby': _ariaDescribedBy, ...safeAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      {...safeAttributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : undefined}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
}

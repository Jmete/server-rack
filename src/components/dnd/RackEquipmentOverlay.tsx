'use client';

import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useRackStore, useUIStore } from '@/stores';

interface RackEquipmentHandleProps {
  instanceId: string;
  name: string;
  heightU: number;
  bounds: { left: number; top: number; width: number; height: number };
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function RackEquipmentHandle({
  instanceId,
  name,
  heightU,
  bounds,
  isSelected,
  onSelect,
  onRemove,
}: RackEquipmentHandleProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `rack-${instanceId}`,
    data: {
      type: 'rack',
      instanceId,
      heightU,
    },
  });

  const { 'aria-describedby': _ariaDescribedBy, ...safeAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      {...safeAttributes}
      {...listeners}
      className={`absolute group ${isDragging ? 'opacity-50' : ''}`}
      style={{ ...bounds, touchAction: 'none', pointerEvents: 'auto' }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      title={name}
    >
      {isSelected && (
        <button
          type="button"
          className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-rose-600/90 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${name}`}
        >
          x
        </button>
      )}
    </div>
  );
}

export function RackEquipmentOverlay() {
  const equipment = useRackStore((state) => state.equipment);
  const removeEquipment = useRackStore((state) => state.removeEquipment);
  const selectEquipment = useUIStore((state) => state.selectEquipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const equipmentBounds = useUIStore((state) => state.equipmentScreenBounds);

  const equipmentMap = useMemo(
    () => new Map(equipment.map((eq) => [eq.instanceId, eq])),
    [equipment]
  );

  if (!equipmentBounds || equipmentBounds.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {equipmentBounds.map((bounds) => {
        const eq = equipmentMap.get(bounds.instanceId);
        if (!eq) return null;

        return (
          <RackEquipmentHandle
            key={eq.instanceId}
            instanceId={eq.instanceId}
            name={eq.name}
            heightU={eq.heightU}
            bounds={bounds}
            isSelected={eq.instanceId === selectedEquipmentId}
            onSelect={() => selectEquipment(eq.instanceId)}
            onRemove={() => removeEquipment(eq.instanceId)}
          />
        );
      })}
    </div>
  );
}

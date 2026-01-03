'use client';

import { useMemo } from 'react';
import { useConnectionStore, usePortStore, useUIStore } from '@/stores';
import { mmToScene } from '@/constants';
import { Cable } from './Cable';

export function CableManager() {
  const cables = useConnectionStore((state) => state.cables);
  const portPositions = usePortStore((state) => state.positions);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const selectCable = useUIStore((state) => state.selectCable);

  const resolved = useMemo(() => {
    const frontOffset = mmToScene(2.5);
    return cables
      .map((cable) => {
        const start = portPositions[cable.sourcePortId];
        const end = portPositions[cable.targetPortId];
        if (!start || !end) return null;
        return {
          id: cable.id,
          color: cable.color.hex,
          start: [start[0], start[1], start[2] + frontOffset],
          end: [end[0], end[1], end[2] + frontOffset],
        };
      })
      .filter(Boolean) as { id: string; color: string; start: [number, number, number]; end: [number, number, number] }[];
  }, [cables, portPositions]);

  return (
    <group>
      {resolved.map((cable) => (
        <Cable
          key={cable.id}
          id={cable.id}
          start={cable.start}
          end={cable.end}
          color={cable.color}
          isSelected={cable.id === selectedCableId}
          onSelect={selectCable}
        />
      ))}
    </group>
  );
}

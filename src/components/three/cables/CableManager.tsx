'use client';

import { useMemo } from 'react';
import { useConnectionStore, usePortStore, useUIStore } from '@/stores';
import { mmToScene } from '@/constants';
import { Cable } from './Cable';
import * as THREE from 'three';

export function CableManager() {
  const cables = useConnectionStore((state) => state.cables);
  const portPositions = usePortStore((state) => state.positions);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const selectCable = useUIStore((state) => state.selectCable);

  const resolved = useMemo(() => {
    return cables
      .map((cable) => {
        const start = portPositions[cable.sourcePortId];
        const end = portPositions[cable.targetPortId];
        if (!start || !end) return null;
        const startVec = new THREE.Vector3(...start);
        const endVec = new THREE.Vector3(...end);
        const directLength = startVec.distanceTo(endVec);
        return {
          id: cable.id,
          color: cable.color.hex,
          start,
          end,
          directLength,
          length: cable.length ? mmToScene(cable.length) : undefined,
        };
      })
      .filter(Boolean) as {
        id: string;
        color: string;
        start: [number, number, number];
        end: [number, number, number];
        directLength: number;
        length?: number;
      }[];
  }, [cables, portPositions]);

  const cableTension = mmToScene(120);
  const cableFrontOffset = mmToScene(6);

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
          tension={cableTension}
          frontOffset={cableFrontOffset}
          directLength={cable.directLength}
          length={cable.length}
        />
      ))}
    </group>
  );
}

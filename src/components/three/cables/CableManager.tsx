'use client';

import { useMemo } from 'react';
import { useConnectionStore, usePortStore, useRackStore, useUIStore } from '@/stores';
import { mmToScene } from '@/constants';
import { Cable } from './Cable';
import * as THREE from 'three';
import { buildEquipmentBounds, computeCableRoute } from '@/lib/cableRouting';

export function CableManager() {
  const cables = useConnectionStore((state) => state.cables);
  const portPositions = usePortStore((state) => state.positions);
  const rack = useRackStore((state) => state.rack);
  const equipment = useRackStore((state) => state.equipment);
  const selectedCableId = useUIStore((state) => state.selectedCableId);
  const selectCable = useUIStore((state) => state.selectCable);

  const equipmentBounds = useMemo(() => {
    return buildEquipmentBounds(equipment, rack.config.depth);
  }, [equipment, rack.config.depth]);

  const resolved = useMemo(() => {
    return cables
      .map((cable) => {
        const start = portPositions[cable.sourcePortId];
        const end = portPositions[cable.targetPortId];
        if (!start || !end) return null;
        const startVec = new THREE.Vector3(...start);
        const endVec = new THREE.Vector3(...end);
        const directLength = startVec.distanceTo(endVec);
        const startBounds = equipmentBounds.find((box) =>
          cable.sourcePortId.startsWith(`${box.id}-`)
        );
        const endBounds = equipmentBounds.find((box) =>
          cable.targetPortId.startsWith(`${box.id}-`)
        );
        const startCenterZ = startBounds ? (startBounds.min.z + startBounds.max.z) / 2 : 0;
        const endCenterZ = endBounds ? (endBounds.min.z + endBounds.max.z) / 2 : 0;
        const startSide = startBounds ? (startVec.z >= startCenterZ ? 'front' : 'back') : undefined;
        const endSide = endBounds ? (endVec.z >= endCenterZ ? 'front' : 'back') : undefined;
        const route = computeCableRoute({
          start,
          end,
          equipmentBounds,
          rackDepthMm: rack.config.depth,
          rackSize: rack.config.size,
          rackSlots: rack.slots,
          clearance: mmToScene(10),
          exitClearance: mmToScene(8),
          startSide,
          endSide,
        });
        return {
          id: cable.id,
          color: cable.color.hex,
          start,
          end,
          route,
          directLength,
          length: cable.length ? mmToScene(cable.length) : undefined,
        };
      })
      .filter(Boolean) as {
        id: string;
        color: string;
        start: [number, number, number];
        end: [number, number, number];
        route: [number, number, number][];
        directLength: number;
        length?: number;
      }[];
  }, [cables, equipmentBounds, portPositions, rack.config.depth, rack.config.size, rack.slots]);

  const cableTension = mmToScene(120);

  return (
    <group>
      {resolved.map((cable) => (
        <Cable
          key={cable.id}
          id={cable.id}
          start={cable.start}
          end={cable.end}
          route={cable.route}
          color={cable.color}
          isSelected={cable.id === selectedCableId}
          onSelect={selectCable}
          tension={cableTension}
          directLength={cable.directLength}
          length={cable.length}
        />
      ))}
    </group>
  );
}

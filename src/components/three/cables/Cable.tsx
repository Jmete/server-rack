'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { mmToScene } from '@/constants';

interface CableProps {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function lightenColor(hex: string, amount: number) {
  const base = new THREE.Color(hex);
  const target = new THREE.Color('#ffffff');
  return base.lerp(target, amount).getStyle();
}

export function Cable({ id, start, end, color, isSelected, onSelect }: CableProps) {
  const { geometry, startPlug, endPlug, quaternion } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
    mid.z += mmToScene(8);

    const curve = new THREE.CatmullRomCurve3([startVec, mid, endVec]);
    const radius = mmToScene(1.2);
    const tube = new THREE.TubeGeometry(curve, 16, radius, 8, false);

    const direction = endVec.clone().sub(startVec);
    const axis = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(axis, direction.clone().normalize());

    const plugLength = mmToScene(6);
    const plugOffset = direction.clone().normalize().multiplyScalar(plugLength / 2);
    const startPlugPos = startVec.clone().add(plugOffset);
    const endPlugPos = endVec.clone().sub(plugOffset);

    return {
      geometry: tube,
      quaternion: quat,
      startPlug: { position: startPlugPos, length: plugLength },
      endPlug: { position: endPlugPos, length: plugLength },
    };
  }, [start, end]);

  const displayColor = isSelected ? lightenColor(color, 0.35) : color;

  return (
    <group
      renderOrder={10}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial color={displayColor} roughness={0.6} metalness={0.2} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={startPlug.position} quaternion={quaternion}>
        <boxGeometry args={[mmToScene(2.6), startPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={endPlug.position} quaternion={quaternion}>
        <boxGeometry args={[mmToScene(2.6), endPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

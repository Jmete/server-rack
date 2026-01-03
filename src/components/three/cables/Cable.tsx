'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { mmToScene } from '@/constants';
import { createCatenaryPoints } from '@/lib/catenary';

interface CableProps {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  tension?: number;
  frontOffset?: number;
}

function lightenColor(hex: string, amount: number) {
  const base = new THREE.Color(hex);
  const target = new THREE.Color('#ffffff');
  return base.lerp(target, amount).getStyle();
}

export function Cable({ id, start, end, color, isSelected, onSelect, tension, frontOffset }: CableProps) {
  const { geometry, startPlug, endPlug, startQuaternion, endQuaternion } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const points = createCatenaryPoints(start, end, {
      segments: 48,
      tension: tension ?? mmToScene(120),
      frontOffset: frontOffset ?? mmToScene(6),
    });
    const curve = new THREE.CatmullRomCurve3(points);
    const radius = mmToScene(1.2);
    const tube = new THREE.TubeGeometry(curve, 48, radius, 8, false);

    const axis = new THREE.Vector3(0, 1, 0);
    const startTangent = curve.getTangent(0).normalize();
    const endTangent = curve.getTangent(1).normalize();
    const startQuat = new THREE.Quaternion().setFromUnitVectors(axis, startTangent);
    const endQuat = new THREE.Quaternion().setFromUnitVectors(axis, endTangent);

    const plugLength = mmToScene(6);
    const startPlugPos = startVec.clone().add(startTangent.clone().multiplyScalar(plugLength / 2));
    const endPlugPos = endVec.clone().sub(endTangent.clone().multiplyScalar(plugLength / 2));

    return {
      geometry: tube,
      startQuaternion: startQuat,
      endQuaternion: endQuat,
      startPlug: { position: startPlugPos, length: plugLength },
      endPlug: { position: endPlugPos, length: plugLength },
    };
  }, [start, end, tension, frontOffset]);

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
      <mesh position={startPlug.position} quaternion={startQuaternion}>
        <boxGeometry args={[mmToScene(2.6), startPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={endPlug.position} quaternion={endQuaternion}>
        <boxGeometry args={[mmToScene(2.6), endPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

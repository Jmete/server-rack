'use client';

import { useMemo, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PortInstance } from '@/types/port';
import { mmToScene } from '@/constants';

interface PowerPortProps {
  port: PortInstance;
  position: [number, number, number];
}

// IEC C13 outlet dimensions (approximately)
const PORT_WIDTH = mmToScene(10);
const PORT_HEIGHT = mmToScene(12);
const PORT_DEPTH = mmToScene(2);

export function PowerPort({ port, position }: PowerPortProps) {
  const [isHovered, setIsHovered] = useState(false);

  const housingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.3,
        roughness: 0.7,
      }),
    []
  );

  const connectorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        metalness: 0.4,
        roughness: 0.6,
      }),
    []
  );

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Port housing */}
      <mesh material={housingMaterial}>
        <boxGeometry args={[PORT_WIDTH + mmToScene(2), PORT_HEIGHT + mmToScene(2), PORT_DEPTH]} />
      </mesh>

      {/* Port opening (IEC C13 shape - trapezoid-ish rectangle) */}
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]} material={connectorMaterial}>
        <boxGeometry args={[PORT_WIDTH, PORT_HEIGHT, mmToScene(1)]} />
      </mesh>

      {/* Three horizontal slots representing the IEC connector pins */}
      {/* Top slot (ground) */}
      <mesh position={[0, PORT_HEIGHT / 3, PORT_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[PORT_WIDTH * 0.7, mmToScene(1.5), mmToScene(0.5)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Bottom left slot (live) */}
      <mesh position={[-PORT_WIDTH / 4, -PORT_HEIGHT / 4, PORT_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[mmToScene(3), mmToScene(1.5), mmToScene(0.5)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Bottom right slot (neutral) */}
      <mesh position={[PORT_WIDTH / 4, -PORT_HEIGHT / 4, PORT_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[mmToScene(3), mmToScene(1.5), mmToScene(0.5)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Hover highlight */}
      {isHovered && (
        <mesh>
          <boxGeometry args={[PORT_WIDTH + mmToScene(4), PORT_HEIGHT + mmToScene(4), PORT_DEPTH + 0.01]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

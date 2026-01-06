'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Port as PortType } from '@/types';
import { mmToScene } from '@/constants';
import { Port } from './Port';

interface PowerPortProps {
  port: PortType;
  position: [number, number, number];
}

// IEC C13 outlet dimensions (approximately)
const PORT_WIDTH = mmToScene(10);
const PORT_HEIGHT = mmToScene(12);
const PORT_DEPTH = mmToScene(2);
const HOUSING_WIDTH = PORT_WIDTH + mmToScene(2);
const HOUSING_HEIGHT = PORT_HEIGHT + mmToScene(2);

export function PowerPort({ port, position }: PowerPortProps) {
  const connectorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a0a0a',
        metalness: 0.4,
        roughness: 0.6,
      }),
    []
  );

  return (
    <Port
      port={port}
      position={position}
      size={[HOUSING_WIDTH, HOUSING_HEIGHT, PORT_DEPTH]}
      color="#1a1a1a"
    >
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
    </Port>
  );
}

'use client';

import { Port as PortType } from '@/types';
import { mmToScene } from '@/constants';
import { Port } from './Port';

interface UKOutletProps {
  port: PortType;
  position: [number, number, number];
}

// UK BS1363 outlet dimensions
const OUTLET_WIDTH = mmToScene(42);
const OUTLET_HEIGHT = mmToScene(35);
const OUTLET_DEPTH = mmToScene(3);

export function UKOutlet({ port, position }: UKOutletProps) {
  // UK plug has 3 rectangular pins in a specific pattern
  const pinWidth = mmToScene(6.35);
  const pinHeight = mmToScene(3.5);

  return (
    <Port
      port={port}
      position={position}
      size={[OUTLET_WIDTH, OUTLET_HEIGHT, OUTLET_DEPTH]}
      color="#f5f5f5"
    >
      {/* Face plate inner (slightly recessed) */}
      <mesh position={[0, 0, OUTLET_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[OUTLET_WIDTH - mmToScene(4), OUTLET_HEIGHT - mmToScene(4), mmToScene(0.5)]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Earth pin slot (top, horizontal, longer) */}
      <mesh position={[0, mmToScene(8), OUTLET_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[pinWidth * 1.2, pinHeight, mmToScene(1)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Live pin slot (bottom left, vertical) */}
      <mesh position={[-mmToScene(11), -mmToScene(5), OUTLET_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[pinHeight, pinWidth, mmToScene(1)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Neutral pin slot (bottom right, vertical) */}
      <mesh position={[mmToScene(11), -mmToScene(5), OUTLET_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[pinHeight, pinWidth, mmToScene(1)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* On/Off switch indicator (small circle/neon) - optional */}
      <mesh position={[mmToScene(15), mmToScene(10), OUTLET_DEPTH / 2 + 0.003]}>
        <circleGeometry args={[mmToScene(2), 16]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
    </Port>
  );
}

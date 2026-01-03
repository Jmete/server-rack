'use client';

import { Port } from './Port';
import { Port as PortType } from '@/types';
import { PORT_TYPE_COLORS } from '@/types/port';
import { mmToScene } from '@/constants';

interface RJ45PortProps {
  port: PortType;
  position: [number, number, number];
}

// RJ45 port dimensions (approximately 12mm x 10mm x 14mm deep)
const PORT_WIDTH = mmToScene(6);
const PORT_HEIGHT = mmToScene(5);
const PORT_DEPTH = mmToScene(3);

export function RJ45Port({ port, position }: RJ45PortProps) {
  const isWan = port.type === 'rj45-wan';
  const baseColor = isWan ? PORT_TYPE_COLORS['rj45-wan'] : PORT_TYPE_COLORS['rj45-lan'];

  return (
    <Port
      port={port}
      position={position}
      size={[PORT_WIDTH, PORT_HEIGHT, PORT_DEPTH]}
      color={baseColor}
    >
      {/* Port opening (darker inset) */}
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[PORT_WIDTH * 0.7, PORT_HEIGHT * 0.6, 0.002]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </Port>
  );
}

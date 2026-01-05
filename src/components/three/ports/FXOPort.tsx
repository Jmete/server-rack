'use client';

import { Port } from './Port';
import { Port as PortType } from '@/types';
import { PORT_TYPE_COLORS } from '@/types/port';
import { mmToScene } from '@/constants';

interface FXOPortProps {
  port: PortType;
  position: [number, number, number];
}

// RJ11 port dimensions (smaller than RJ45 - approximately 10mm x 8mm)
const PORT_WIDTH = mmToScene(5);
const PORT_HEIGHT = mmToScene(4);
const PORT_DEPTH = mmToScene(3);

export function FXOPort({ port, position }: FXOPortProps) {
  const isFxs = port.type === 'fxs';
  const baseColor = isFxs ? PORT_TYPE_COLORS['fxs'] : PORT_TYPE_COLORS['fxo'];

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

'use client';

import { Port } from './Port';
import { Port as PortType } from '@/types';
import { PORT_TYPE_COLORS } from '@/types/port';
import { mmToScene } from '@/constants';

interface SFPPortProps {
  port: PortType;
  position: [number, number, number];
}

// SFP+ port dimensions (approximately 14mm x 6mm x 56mm deep, but we show front face)
const PORT_WIDTH = mmToScene(7);
const PORT_HEIGHT = mmToScene(4);
const PORT_DEPTH = mmToScene(3);

export function SFPPort({ port, position }: SFPPortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[PORT_WIDTH, PORT_HEIGHT, PORT_DEPTH]}
      color={PORT_TYPE_COLORS['sfp-plus']}
    >
      {/* SFP cage slot indicator */}
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[PORT_WIDTH * 0.8, PORT_HEIGHT * 0.5, 0.002]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </Port>
  );
}

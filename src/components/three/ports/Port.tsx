'use client';

import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useConnectionStore, useUIStore } from '@/stores';
import { Port as PortType } from '@/types';
import { UI_COLORS } from '@/constants';

interface PortProps {
  port: PortType;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  hoverColor?: string;
  children?: React.ReactNode;
}

export function Port({
  port,
  position,
  size,
  color,
  hoverColor = UI_COLORS.HOVER,
  children,
}: PortProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const connectionMode = useConnectionStore((state) => state.connectionMode);
  const startConnection = useConnectionStore((state) => state.startConnection);
  const completeConnection = useConnectionStore((state) => state.completeConnection);
  const setHoveredPort = useUIStore((state) => state.setHoveredPort);

  const isSource = connectionMode.sourcePortId === port.globalId;
  const isConnected = port.connectedTo !== null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    if (!connectionMode.active) return;

    if (!connectionMode.sourcePortId) {
      startConnection(port.globalId);
    } else {
      completeConnection(port.globalId);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    setHoveredPort(port.globalId);
    document.body.style.cursor = connectionMode.active ? 'crosshair' : 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    setHoveredPort(null);
    document.body.style.cursor = 'auto';
  };

  // Determine port color based on state
  let displayColor = color;
  if (isSource) {
    displayColor = UI_COLORS.CONNECTION_SOURCE;
  } else if (isHovered) {
    displayColor = hoverColor;
  } else if (isConnected) {
    displayColor = UI_COLORS.SELECTION;
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={displayColor}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      {children}
    </group>
  );
}

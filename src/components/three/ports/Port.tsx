'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConnectionStore, usePortStore, useUIStore } from '@/stores';
import { Port as PortType } from '@/types';
import { UI_COLORS } from '@/constants';
import { canConnect } from '@/types/cable';

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
  const setCableType = useConnectionStore((state) => state.setCableType);
  const setHoveredPort = useUIStore((state) => state.setHoveredPort);
  const selectPort = useUIStore((state) => state.selectPort);
  const selectEquipment = useUIStore((state) => state.selectEquipment);
  const registerPort = usePortStore((state) => state.registerPort);
  const unregisterPort = usePortStore((state) => state.unregisterPort);
  const setPortPosition = usePortStore((state) => state.setPortPosition);
  const portTypes = usePortStore((state) => state.types);

  const isSource = connectionMode.sourcePortId === port.globalId;
  const isConnected = useConnectionStore((state) =>
    state.cables.some(
      (cable) => cable.sourcePortId === port.globalId || cable.targetPortId === port.globalId
    )
  );

  const isCompatible = useMemo(() => {
    if (!connectionMode.active || !connectionMode.sourcePortId) return true;
    if (connectionMode.sourcePortId === port.globalId) return true;
    const sourceType = portTypes[connectionMode.sourcePortId];
    if (!sourceType) return true;
    return canConnect(sourceType, port.type, connectionMode.cableType);
  }, [connectionMode.active, connectionMode.sourcePortId, connectionMode.cableType, port.globalId, port.type, portTypes]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    selectEquipment(port.equipmentInstanceId);
    selectPort(port.globalId);

    if (!connectionMode.active) return;

    if (!connectionMode.sourcePortId) {
      if (port.type === 'sfp-plus') {
        setCableType('fiber-lc');
      } else if (port.type === 'rj45-lan' || port.type === 'rj45-wan') {
        setCableType('ethernet-cat6');
      } else if (port.type === 'uk-outlet-bs1363') {
        setCableType('power-uk');
      } else if (port.type === 'power-iec-c13' || port.type === 'power-iec-c14') {
        setCableType('power-iec');
      }
      startConnection(port.globalId);
      return;
    }

    if (connectionMode.sourcePortId === port.globalId) {
      return;
    }

    if (!isCompatible) {
      return;
    }

    completeConnection(port.globalId);
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
    displayColor = connectionMode.active && !isCompatible ? UI_COLORS.INVALID_DROP : hoverColor;
  } else if (isConnected) {
    displayColor = UI_COLORS.SELECTION;
  }

  useEffect(() => {
    registerPort(port.globalId, port.type);
    return () => unregisterPort(port.globalId);
  }, [port.globalId, port.type, registerPort, unregisterPort]);

  const lastPosition = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!meshRef.current) return;
    const next = new THREE.Vector3();
    meshRef.current.getWorldPosition(next);
    if (!next.equals(lastPosition.current)) {
      lastPosition.current.copy(next);
      setPortPosition(port.globalId, [next.x, next.y, next.z]);
    }
  });

  return (
    <group position={position}>
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <boxGeometry args={[size[0] * 1.6, size[1] * 1.6, Math.max(size[2] * 2, size[2] + 0.01)]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
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

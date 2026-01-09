'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useConnectionStore, usePortStore, useUIStore } from '@/stores';
import { Port as PortType } from '@/types';
import { UI_COLORS } from '@/constants';
import { CABLE_PORT_COMPATIBILITY, resolveCableType } from '@/types/cable';

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

  const resolvedCableType = useMemo(() => {
    if (!connectionMode.active || !connectionMode.sourcePortId) return null;
    if (connectionMode.sourcePortId === port.globalId) {
      return connectionMode.cableType;
    }

    const sourceType = portTypes[connectionMode.sourcePortId];
    if (!sourceType) return null;

    return resolveCableType(sourceType, port.type, connectionMode.cableType);
  }, [
    connectionMode.active,
    connectionMode.sourcePortId,
    connectionMode.cableType,
    port.globalId,
    port.type,
    portTypes,
  ]);

  const isCompatible = useMemo(() => {
    if (!connectionMode.active || !connectionMode.sourcePortId) return true;
    if (connectionMode.sourcePortId === port.globalId) return true;
    return resolvedCableType !== null;
  }, [connectionMode.active, connectionMode.sourcePortId, port.globalId, resolvedCableType]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    selectEquipment(port.equipmentInstanceId);
    selectPort(port.globalId);

    if (!connectionMode.active) return;

    if (!connectionMode.sourcePortId) {
      if (port.type === 'rj45-console') {
        return;
      }

      const currentCable = connectionMode.cableType;
      const supportsPort = CABLE_PORT_COMPATIBILITY[currentCable]?.includes(port.type) ?? false;

      if (!supportsPort) {
        if (port.type === 'sfp-plus') {
          setCableType('fiber-lc');
        } else if (port.type === 'rj45-lan' || port.type === 'rj45-wan') {
          setCableType('ethernet-cat6');
        } else if (port.type === 'fxo' || port.type === 'fxs') {
          setCableType('phone-rj11');
        } else if (port.type === 'uk-outlet-bs1363') {
          setCableType('power-uk');
        } else if (port.type === 'power-iec-c13' || port.type === 'power-iec-c14') {
          setCableType('power-iec');
        }
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

    if (resolvedCableType && resolvedCableType !== connectionMode.cableType) {
      setCableType(resolvedCableType);
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

  // Calculate world position once when mounted and when position changes
  // This replaces the per-frame useFrame hook for massive performance improvement
  const updateWorldPosition = useCallback(() => {
    if (!meshRef.current) return;
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    setPortPosition(port.globalId, [worldPos.x, worldPos.y, worldPos.z]);
  }, [port.globalId, setPortPosition]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure parent transforms are applied
    const frameId = requestAnimationFrame(() => {
      updateWorldPosition();
    });
    return () => cancelAnimationFrame(frameId);
  }, [position, updateWorldPosition]);

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

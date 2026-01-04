'use client';

import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '@/types';
import { createPortInstances } from '@/types/port';
import { mmToScene, uToScene, EQUIPMENT_COLORS, FRAME_THICKNESS_MM } from '@/constants';
import { useRackStore } from '@/stores';
import { RJ45Port } from '../ports';

interface PatchPanelProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// Patch Panel dimensions
const FACEPLATE_WIDTH = mmToScene(442.4);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(50); // Shallow depth for patch panel
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function PatchPanel({ equipment, onClick, isSelected }: PatchPanelProps) {
  // Get dynamic rack depth from store
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const RACK_DEPTH = mmToScene(rackDepthMm);

  const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
  const yPosition = SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + HEIGHT / 2;
  const zPosition = RAIL_FRONT_Z - DEPTH / 2;

  const ports = useMemo(() => {
    return createPortInstances(equipment.ports, equipment.instanceId);
  }, [equipment.ports, equipment.instanceId]);

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: EQUIPMENT_COLORS.BLACK,
        metalness: 0.5,
        roughness: 0.6,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  // 24 ports evenly spaced across the panel
  const portCount = Math.min(ports.filter((p) => p.type === 'rj45-lan').length, 24);
  const portAreaWidth = FACEPLATE_WIDTH - mmToScene(40); // Leave margin on sides
  const portSpacing = portAreaWidth / portCount;
  const portStartX = -portAreaWidth / 2 + portSpacing / 2;

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main body */}
      <mesh material={bodyMaterial}>
        <boxGeometry args={[FACEPLATE_WIDTH, HEIGHT * 0.85, DEPTH]} />
      </mesh>

      {/* Port number labels bar (top) */}
      <mesh position={[0, HEIGHT * 0.35, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[FACEPLATE_WIDTH - mmToScene(30), mmToScene(6), mmToScene(1)]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* Keystone port housings */}
      {ports
        .filter((p) => p.type === 'rj45-lan')
        .slice(0, 24)
        .map((port, index) => {
          const x = portStartX + index * portSpacing;
          return (
            <group key={port.globalId}>
              {/* Port housing cutout (darker area) */}
              <mesh position={[x, -mmToScene(2), frontZ - mmToScene(0.5)]}>
                <boxGeometry args={[mmToScene(14), mmToScene(18), mmToScene(1)]} />
                <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <RJ45Port
                port={port}
                position={[x, -mmToScene(2), frontZ + 0.001]}
              />
            </group>
          );
        })}

      {/* Mounting ears (visual detail) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(8), 0, frontZ - mmToScene(1)]}>
        <boxGeometry args={[mmToScene(15), HEIGHT * 0.7, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(8), 0, frontZ - mmToScene(1)]}>
        <boxGeometry args={[mmToScene(15), HEIGHT * 0.7, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[FACEPLATE_WIDTH + 0.01, HEIGHT + 0.01, DEPTH + 0.01]} />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
}

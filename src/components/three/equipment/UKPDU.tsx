'use client';

import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '@/types';
import { createPortInstances } from '@/types/port';
import { mmToScene, uToScene, EQUIPMENT_COLORS, FRAME_THICKNESS_MM } from '@/constants';
import { useRackStore } from '@/stores';
import { UKOutlet } from '../ports';

interface UKPDUProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// UK PDU dimensions (1U)
const FACEPLATE_WIDTH = mmToScene(442.4);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(44.5); // Shallow depth
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function UKPDU({ equipment, onClick, isSelected }: UKPDUProps) {
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
        metalness: 0.4,
        roughness: 0.6,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  // 8 UK outlets evenly spaced
  const outletCount = 8;
  const outletAreaWidth = FACEPLATE_WIDTH - mmToScene(80); // Leave space for power switch and LED
  const outletSpacing = outletAreaWidth / outletCount;
  const outletStartX = -FACEPLATE_WIDTH / 2 + mmToScene(60) + outletSpacing / 2;

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main body */}
      <mesh material={bodyMaterial}>
        <boxGeometry args={[FACEPLATE_WIDTH, HEIGHT * 0.85, DEPTH]} />
      </mesh>

      {/* Front faceplate (slightly raised) */}
      <mesh position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]}>
        <boxGeometry args={[FACEPLATE_WIDTH, HEIGHT * 0.82, FACEPLATE_THICKNESS]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* === LEFT SECTION - POWER SWITCH === */}

      {/* Power switch housing */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(25), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(30), mmToScene(25), mmToScene(2)]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Switch rocker (red) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(25), 0, frontZ + 0.001]}>
        <boxGeometry args={[mmToScene(18), mmToScene(12), mmToScene(2)]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.2} />
      </mesh>

      {/* === UK OUTLETS (8) === */}
      {ports
        .filter((p) => p.type === 'uk-outlet-bs1363')
        .slice(0, 8)
        .map((port, index) => {
          const x = outletStartX + index * outletSpacing;
          return (
            <UKOutlet
              key={port.globalId}
              port={port}
              position={[x, 0, frontZ + 0.001]}
            />
          );
        })}

      {/* === RIGHT SECTION - POWER LED === */}

      {/* Power LED housing */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(25), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(20), mmToScene(15), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Power LED (green) */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(25), 0, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(4), 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      {/* Mounting ears */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(8), 0, frontZ - mmToScene(1)]}>
        <boxGeometry args={[mmToScene(12), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(8), 0, frontZ - mmToScene(1)]}>
        <boxGeometry args={[mmToScene(12), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
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

'use client';

import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '@/types';
import { createPortInstances } from '@/types/port';
import { mmToScene, uToScene, EQUIPMENT_COLORS, FRAME_THICKNESS_MM, RACK_DEPTH_MM } from '@/constants';
import { PowerPort } from '../ports';

interface RackUPSProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// Rack UPS dimensions (2U)
const FACEPLATE_WIDTH = mmToScene(432);
const HEIGHT = uToScene(2); // 2U height
const DEPTH = mmToScene(438);
const FACEPLATE_THICKNESS = mmToScene(5);

// Rack positioning constants
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RACK_DEPTH = mmToScene(RACK_DEPTH_MM);

const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function RackUPS({ equipment, onClick, isSelected }: RackUPSProps) {
  // For 2U equipment, we use heightU from the equipment definition
  const equipmentHeight = uToScene(equipment.heightU);
  const yPosition = SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + equipmentHeight / 2;
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

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main body */}
      <mesh material={bodyMaterial}>
        <boxGeometry args={[FACEPLATE_WIDTH, equipmentHeight * 0.92, DEPTH]} />
      </mesh>

      {/* Front panel (slightly raised) */}
      <mesh position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]}>
        <boxGeometry args={[FACEPLATE_WIDTH, equipmentHeight * 0.88, FACEPLATE_THICKNESS]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* === LEFT SECTION - STATUS LEDs === */}

      {/* Online LED */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(40), equipmentHeight / 4, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(4), 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      {/* Battery LED */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(60), equipmentHeight / 4, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(4), 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>

      {/* Overload LED */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(80), equipmentHeight / 4, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(4), 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* LED labels bar */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(60), equipmentHeight / 4 - mmToScene(12), frontZ + 0.001]}>
        <boxGeometry args={[mmToScene(70), mmToScene(8), mmToScene(0.5)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* === CENTER - LCD DISPLAY === */}

      {/* Display bezel */}
      <mesh position={[0, equipmentHeight / 6, frontZ - mmToScene(1)]}>
        <boxGeometry args={[mmToScene(80), mmToScene(45), mmToScene(3)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* LCD Screen */}
      <mesh position={[0, equipmentHeight / 6, frontZ + 0.001]}>
        <planeGeometry args={[mmToScene(65), mmToScene(35)]} />
        <meshStandardMaterial color="#001122" emissive="#003366" emissiveIntensity={0.4} />
      </mesh>

      {/* Control buttons (below display) */}
      {[-1, 0, 1].map((offset) => (
        <mesh key={offset} position={[offset * mmToScene(25), -equipmentHeight / 4, frontZ + 0.001]}>
          <boxGeometry args={[mmToScene(15), mmToScene(10), mmToScene(1)]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      ))}

      {/* === RIGHT SECTION - POWER BUTTON === */}

      {/* Power button */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(50), 0, frontZ + 0.001]}>
        <cylinderGeometry args={[mmToScene(12), mmToScene(12), mmToScene(3), 32]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Power symbol on button */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(50), 0, frontZ + mmToScene(2)]}>
        <ringGeometry args={[mmToScene(5), mmToScene(7), 32]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* === VENTILATION GRILLE (right side) === */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(100), -equipmentHeight / 4, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(60), mmToScene(25), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Grille lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[
          FACEPLATE_WIDTH / 2 - mmToScene(100),
          -equipmentHeight / 4 - mmToScene(8) + i * mmToScene(4),
          frontZ + 0.001
        ]}>
          <boxGeometry args={[mmToScene(50), mmToScene(1.5), mmToScene(0.5)]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[FACEPLATE_WIDTH + 0.01, equipmentHeight + 0.01, DEPTH + 0.01]} />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
}

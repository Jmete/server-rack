'use client';

import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '@/types';
import { createPortInstances } from '@/types/port';
import { mmToScene, uToScene, RACK_CONSTANTS, EQUIPMENT_COLORS, FRAME_THICKNESS_MM, RACK_DEPTH_MM } from '@/constants';
import { RJ45Port, SFPPort } from '../ports';

interface UDMProRouterProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// UDM Pro dimensions (actual device specs)
const FACEPLATE_WIDTH = mmToScene(442.4); // Full 19" rack width faceplate
const CHASSIS_WIDTH = mmToScene(430); // Main body slightly narrower
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(285.6);
const FACEPLATE_THICKNESS = mmToScene(3); // Thin faceplate at front

// Rack positioning constants
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RACK_WIDTH = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
const RACK_DEPTH = mmToScene(RACK_DEPTH_MM);
const RAIL_WIDTH = mmToScene(RACK_CONSTANTS.RAIL_WIDTH_MM);

// Calculate where equipment front should be (flush with front of rails)
// Rails are at z = RACK_DEPTH/2 - FRAME_THICKNESS/2 with depth FRAME_THICKNESS * 0.8
// Rail front face = RACK_DEPTH/2 - FRAME_THICKNESS/2 + (FRAME_THICKNESS * 0.8)/2
const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;

// Equipment starts above the bottom frame
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function UDMProRouter({ equipment, onClick, isSelected }: UDMProRouterProps) {
  // Calculate Y position - starts at SLOT_START_OFFSET, positioned in center of slot
  const yPosition = SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + HEIGHT / 2;

  // Z position - front face of equipment flush with front of rails
  // Equipment center is at: RAIL_FRONT_Z - DEPTH/2
  const zPosition = RAIL_FRONT_Z - DEPTH / 2;

  // Create port instances
  const ports = useMemo(() => {
    return createPortInstances(equipment.ports, equipment.instanceId);
  }, [equipment.ports, equipment.instanceId]);

  // Body material (silver)
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
        metalness: 0.7,
        roughness: 0.3,
      }),
    []
  );

  // Faceplate material (slightly different shade)
  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b8b8b8',
        metalness: 0.6,
        roughness: 0.35,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  // Layout based on actual UDM Pro (left to right):
  // 1. Display (far left)
  // 2. HDD Bay (large gray area)
  // 3. 8x RJ45 LAN ports (4 top, 4 bottom)
  // 4. 1x RJ45 WAN port
  // 5. 2x SFP+ ports (stacked)

  // Front face Z position (relative to equipment center)
  const frontZ = DEPTH / 2;

  // Port positioning (from right side, matching real device)
  const portsAreaStart = FACEPLATE_WIDTH / 2 - mmToScene(140); // Right side area for ports
  const rj45Spacing = mmToScene(14); // Spacing between RJ45 ports
  const rowOffset = mmToScene(8); // Vertical offset between rows

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body (narrower, extends back) */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry args={[CHASSIS_WIDTH, HEIGHT * 0.88, DEPTH - FACEPLATE_THICKNESS]} />
      </mesh>

      {/* Front faceplate (full width, thin) */}
      <mesh position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]} material={faceplateMaterial}>
        <boxGeometry args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]} />
      </mesh>

      {/* === LEFT SIDE === */}

      {/* Display bezel (black square on far left) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(25), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(35), mmToScene(35), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Display screen (blue glow) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(25), 0, frontZ + 0.001]}>
        <planeGeometry args={[mmToScene(28), mmToScene(28)]} />
        <meshStandardMaterial color="#001428" emissive="#0055aa" emissiveIntensity={0.4} />
      </mesh>

      {/* === MIDDLE - HDD BAY === */}

      {/* HDD Bay area (large gray rectangle) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(130), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(120), HEIGHT * 0.7, mmToScene(2)]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* HDD slot indicator */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(130), 0, frontZ + 0.001]}>
        <planeGeometry args={[mmToScene(100), mmToScene(25)]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* === RIGHT SIDE - PORTS AREA === */}

      {/* Dark panel behind ports */}
      <mesh position={[portsAreaStart + mmToScene(40), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(130), HEIGHT * 0.8, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* RJ45 LAN Ports - 4x2 grid (4 on top, 4 on bottom) */}
      {ports
        .filter((p) => p.type === 'rj45-lan')
        .slice(0, 8)
        .map((port, index) => {
          const col = index % 4; // 0-3 columns
          const row = Math.floor(index / 4); // 0-1 rows
          const x = portsAreaStart + col * rj45Spacing;
          const y = row === 0 ? rowOffset / 2 : -rowOffset / 2; // Top row higher
          return (
            <RJ45Port
              key={port.globalId}
              port={port}
              position={[x, y, frontZ + 0.001]}
            />
          );
        })}

      {/* RJ45 WAN Port (to the right of LAN ports) */}
      {ports
        .filter((p) => p.type === 'rj45-wan')
        .map((port) => (
          <RJ45Port
            key={port.globalId}
            port={port}
            position={[portsAreaStart + 4 * rj45Spacing + mmToScene(8), 0, frontZ + 0.001]}
          />
        ))}

      {/* SFP+ Ports (stacked vertically on far right) */}
      {ports
        .filter((p) => p.type === 'sfp-plus')
        .map((port, index) => (
          <SFPPort
            key={port.globalId}
            port={port}
            position={[
              portsAreaStart + 5 * rj45Spacing + mmToScene(15),
              index === 0 ? rowOffset / 2 : -rowOffset / 2, // Stack vertically
              frontZ + 0.001,
            ]}
          />
        ))}

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

'use client';

import { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Equipment } from '@/types';
import { createPortInstances } from '@/types/port';
import { mmToScene, uToScene, EQUIPMENT_COLORS, FRAME_THICKNESS_MM, RACK_DEPTH_MM } from '@/constants';
import { RJ45Port, SFPPort } from '../ports';

interface USWProSwitchProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// USW Pro 48 PoE dimensions
const FACEPLATE_WIDTH = mmToScene(442.4);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(399.6);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RACK_DEPTH = mmToScene(RACK_DEPTH_MM);

const RAIL_FRONT_Z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function USWProSwitch({ equipment, onClick, isSelected }: USWProSwitchProps) {
  const yPosition = SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + HEIGHT / 2;
  const zPosition = RAIL_FRONT_Z - DEPTH / 2;

  const ports = useMemo(() => {
    return createPortInstances(equipment.ports, equipment.instanceId);
  }, [equipment.ports, equipment.instanceId]);

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
        metalness: 0.7,
        roughness: 0.3,
      }),
    []
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c0c0c0',
        metalness: 0.65,
        roughness: 0.35,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  // Port layout matching real USW Pro 48 PoE
  // 48 RJ45 ports: 24 on top row, 24 on bottom row
  const portAreaStart = -FACEPLATE_WIDTH / 2 + mmToScene(55); // Start after display
  const rj45Spacing = mmToScene(7.2); // Tighter spacing for 24 ports per row
  const rowSpacing = mmToScene(10); // Vertical spacing between rows

  // SFP+ ports on far right - 2x2 grid
  const sfpAreaStart = FACEPLATE_WIDTH / 2 - mmToScene(38);
  const sfpSpacingX = mmToScene(14);
  const sfpSpacingY = mmToScene(10);

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry args={[CHASSIS_WIDTH, HEIGHT * 0.88, DEPTH - FACEPLATE_THICKNESS]} />
      </mesh>

      {/* Front faceplate (silver) */}
      <mesh position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]} material={faceplateMaterial}>
        <boxGeometry args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]} />
      </mesh>

      {/* === LEFT SECTION - DISPLAY === */}

      {/* Display bezel (dark area around screen) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(22), mmToScene(2), frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(28), mmToScene(28), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 1.3" Touchscreen display */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(22), mmToScene(2), frontZ + 0.001]}>
        <planeGeometry args={[mmToScene(22), mmToScene(22)]} />
        <meshStandardMaterial color="#001428" emissive="#0066cc" emissiveIntensity={0.4} />
      </mesh>

      {/* Ubiquiti logo area (small circle to the left of display) */}
      <mesh position={[-FACEPLATE_WIDTH / 2 + mmToScene(8), mmToScene(2), frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(3), 16]} />
        <meshStandardMaterial color="#0077cc" emissive="#0099ff" emissiveIntensity={0.5} />
      </mesh>

      {/* === CENTER - RJ45 PORTS AREA === */}

      {/* Dark panel behind all RJ45 ports */}
      <mesh position={[portAreaStart + mmToScene(90), 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(185), HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Port number labels bar (above ports) */}
      <mesh position={[portAreaStart + mmToScene(90), HEIGHT * 0.38, frontZ + 0.001]}>
        <boxGeometry args={[mmToScene(180), mmToScene(4), mmToScene(0.5)]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* RJ45 LAN Ports - 48 ports in 2 rows of 24 */}
      {ports
        .filter((p) => p.type === 'rj45-lan')
        .slice(0, 48)
        .map((port, index) => {
          // Real layout: ports 1-24 on top row, ports 25-48 on bottom row
          const isTopRow = index < 24;
          const col = isTopRow ? index : index - 24;
          const x = portAreaStart + col * rj45Spacing;
          const y = isTopRow ? rowSpacing / 2 : -rowSpacing / 2;
          return (
            <RJ45Port
              key={port.globalId}
              port={port}
              position={[x, y, frontZ + 0.001]}
            />
          );
        })}

      {/* LED indicator strip below ports (simulated) */}
      <mesh position={[portAreaStart + mmToScene(90), -HEIGHT * 0.32, frontZ + 0.001]}>
        <boxGeometry args={[mmToScene(175), mmToScene(3), mmToScene(0.5)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Individual LED indicators (simplified - show a few green dots) */}
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={`led-${i}`} position={[portAreaStart + i * rj45Spacing, -HEIGHT * 0.32, frontZ + 0.002]}>
          <circleGeometry args={[mmToScene(1), 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#22c55e' : '#1a3a1a'}
            emissive={i % 3 === 0 ? '#22c55e' : '#000000'}
            emissiveIntensity={i % 3 === 0 ? 0.5 : 0}
          />
        </mesh>
      ))}

      {/* === RIGHT SECTION - SFP+ PORTS === */}

      {/* SFP+ dark panel */}
      <mesh position={[sfpAreaStart, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(32), HEIGHT * 0.65, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* SFP+ Ports - 4 ports in 2x2 grid */}
      {ports
        .filter((p) => p.type === 'sfp-plus')
        .map((port, index) => {
          // 2x2 grid: top-left, bottom-left, top-right, bottom-right
          const col = Math.floor(index / 2);
          const row = index % 2;
          return (
            <SFPPort
              key={port.globalId}
              port={port}
              position={[
                sfpAreaStart - mmToScene(6) + col * sfpSpacingX,
                row === 0 ? sfpSpacingY / 2 : -sfpSpacingY / 2,
                frontZ + 0.001,
              ]}
            />
          );
        })}

      {/* === FAR RIGHT - RESET BUTTON AREA === */}

      {/* Small reset button area */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(10), -mmToScene(5), frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(2), 8]} />
        <meshStandardMaterial color="#333333" />
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

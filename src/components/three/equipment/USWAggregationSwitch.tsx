"use client";

import { useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Equipment } from "@/types";
import { createPortInstances } from "@/types/port";
import {
  mmToScene,
  uToScene,
  EQUIPMENT_COLORS,
  FRAME_THICKNESS_MM,
} from "@/constants";
import { useRackStore } from "@/stores";
import { SFPPort } from "../ports";

interface USWAggregationSwitchProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// USW Aggregation dimensions (same chassis as other USW models)
const FACEPLATE_WIDTH = mmToScene(442.4);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(399.6);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function USWAggregationSwitch({
  equipment,
  onClick,
  isSelected,
}: USWAggregationSwitchProps) {
  // Get dynamic rack depth from store
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  const RACK_DEPTH = mmToScene(rackDepthMm);

  const RAIL_FRONT_Z =
    RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
  const yPosition =
    SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + HEIGHT / 2;
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
        color: "#c0c0c0",
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

  // SFP+ port layout for USW Aggregation
  // 8 SFP+ ports in 2 rows of 4, positioned on the right side
  const sfpAreaStart = FACEPLATE_WIDTH / 2 - mmToScene(85);
  const sfpSpacingX = mmToScene(18);
  const sfpSpacingY = mmToScene(10);
  const sfpPanelWidth = sfpSpacingX * 3 + mmToScene(28);
  const sfpPanelCenterX = sfpAreaStart + (sfpSpacingX * 3) / 2;

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry
          args={[CHASSIS_WIDTH, HEIGHT * 0.88, DEPTH - FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Front faceplate (silver) */}
      <mesh
        position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* === LEFT SECTION - DISPLAY === */}

      {/* Display bezel (dark area around screen) */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(22),
          mmToScene(2),
          frontZ - mmToScene(0.5),
        ]}
      >
        <boxGeometry args={[mmToScene(28), mmToScene(28), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 1.3" Touchscreen display */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(22),
          mmToScene(2),
          frontZ + 0.001,
        ]}
      >
        <planeGeometry args={[mmToScene(22), mmToScene(22)]} />
        <meshStandardMaterial
          color="#001428"
          emissive="#0066cc"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Ubiquiti logo area (small circle to the left of display) */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(8),
          mmToScene(2),
          frontZ + 0.001,
        ]}
      >
        <circleGeometry args={[mmToScene(3), 16]} />
        <meshStandardMaterial
          color="#0077cc"
          emissive="#0099ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* === RIGHT SECTION - SFP+ PORTS === */}

      {/* SFP+ dark panel - larger panel for 8 ports in 2x4 grid */}
      <mesh position={[sfpPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[sfpPanelWidth, HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* SFP+ Ports - 8 ports in 2 rows of 4 */}
      {ports
        .filter((p) => p.type === "sfp-plus")
        .map((port, index) => {
          // Layout: 2 rows of 4
          // Top row: ports 0, 2, 4, 6 (even indices)
          // Bottom row: ports 1, 3, 5, 7 (odd indices)
          const col = Math.floor(index / 2);
          const isTopRow = index % 2 === 0;
          return (
            <SFPPort
              key={port.globalId}
              port={port}
              position={[
                sfpAreaStart + col * sfpSpacingX,
                isTopRow ? sfpSpacingY / 2 : -sfpSpacingY / 2,
                frontZ + 0.001,
              ]}
            />
          );
        })}

      {/* === FAR RIGHT - RESET BUTTON AREA === */}

      {/* Small reset button area */}
      <mesh
        position={[
          FACEPLATE_WIDTH / 2 - mmToScene(10),
          -mmToScene(5),
          frontZ + 0.001,
        ]}
      >
        <circleGeometry args={[mmToScene(2), 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry
            args={[FACEPLATE_WIDTH + 0.01, HEIGHT + 0.01, DEPTH + 0.01]}
          />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
}

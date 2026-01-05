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
import { PowerPort, RJ45Port, SFPPort } from "../ports";

interface T1600G52PSProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// TP-Link T1600G-52PS dimensions (approximate)
const FACEPLATE_WIDTH = mmToScene(442.4);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(294);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function T1600G52PS({
  equipment,
  onClick,
  isSelected,
}: T1600G52PSProps) {
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
        color: EQUIPMENT_COLORS.DARK_GRAY,
        metalness: 0.35,
        roughness: 0.65,
      }),
    []
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        metalness: 0.25,
        roughness: 0.75,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  // Port layout for T1600G-52PS
  const portAreaStart = -FACEPLATE_WIDTH / 2 + mmToScene(50);
  const rj45Spacing = mmToScene(15);
  const rowSpacing = mmToScene(10);
  const rj45Span = rj45Spacing * 23;
  const rj45PanelWidth = rj45Span + mmToScene(24);
  const rj45PanelCenterX = portAreaStart + rj45Span / 2;

  // 4 SFP ports on right in a 2x2 block
  const sfpAreaStart = FACEPLATE_WIDTH / 2 - mmToScene(36);
  const sfpSpacingX = mmToScene(12);
  const sfpSpacingY = mmToScene(10);
  const sfpPanelWidth = sfpSpacingX + mmToScene(24);
  const sfpPanelCenterX = sfpAreaStart + sfpSpacingX / 2;

  const rj45Ports = ports.filter((p) => p.type === "rj45-lan").slice(0, 48);
  const sfpPorts = ports.filter((p) => p.type === "sfp-plus").slice(0, 4);
  const powerPorts = ports.filter((p) => p.type === "power-iec-c14");

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry
          args={[CHASSIS_WIDTH, HEIGHT * 0.88, DEPTH - FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Front faceplate */}
      <mesh
        position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* === LEFT SECTION - LOGO AND STATUS === */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(32),
          0,
          frontZ - mmToScene(0.5),
        ]}
      >
        <boxGeometry args={[mmToScene(52), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1d1d1d" />
      </mesh>

      {/* Logo mark */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(18),
          mmToScene(6),
          frontZ + 0.001,
        ]}
      >
        <circleGeometry args={[mmToScene(5), 16]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* Status LEDs */}
      {["#22c55e", "#22c55e", "#f59e0b", "#1f2937"].map((color, index) => (
        <mesh
          key={`status-led-${index}`}
          position={[
            -FACEPLATE_WIDTH / 2 + mmToScene(42),
            mmToScene(8) - index * mmToScene(6),
            frontZ + 0.001,
          ]}
        >
          <circleGeometry args={[mmToScene(1.6), 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={index < 2 ? 0.5 : 0.2}
          />
        </mesh>
      ))}

      {/* === CENTER - RJ45 PORTS AREA === */}

      <mesh position={[rj45PanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[rj45PanelWidth, HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Port number labels bar */}
      <mesh position={[rj45PanelCenterX, HEIGHT * 0.38, frontZ + 0.001]}>
        <boxGeometry
          args={[rj45PanelWidth - mmToScene(6), mmToScene(4), mmToScene(0.5)]}
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* RJ45 LAN Ports - 48 ports in 2 rows of 24 */}
      {rj45Ports.map((port, index) => {
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

      {/* LED indicator strip below ports */}
      <mesh position={[rj45PanelCenterX, -HEIGHT * 0.32, frontZ + 0.001]}>
        <boxGeometry
          args={[rj45PanelWidth - mmToScene(12), mmToScene(3), mmToScene(0.5)]}
        />
        <meshStandardMaterial color="#141414" />
      </mesh>

      {/* === RIGHT SECTION - SFP PORTS === */}
      <mesh position={[sfpPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[sfpPanelWidth, HEIGHT * 0.65, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {sfpPorts.map((port, index) => {
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

      {/* === BACK PANEL - POWER PORT === */}
      <mesh
        position={[0, 0, -DEPTH / 2 + FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH * 0.97, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Power inlet panel (back, far right) */}
      <mesh
        position={[
          FACEPLATE_WIDTH / 2 - mmToScene(400),
          0,
          -DEPTH / 2 + mmToScene(0.5),
        ]}
      >
        <boxGeometry args={[mmToScene(28), mmToScene(18), mmToScene(2)]} />
        <meshStandardMaterial color="#151515" />
      </mesh>

      {powerPorts.map((port) => (
        <PowerPort
          key={port.globalId}
          port={port}
          position={[
            FACEPLATE_WIDTH / 2 - mmToScene(400),
            0,
            -DEPTH / 2 - 0.001,
          ]}
        />
      ))}

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

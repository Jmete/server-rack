"use client";

import { useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Equipment } from "@/types";
import { createPortInstances, PORT_TYPE_COLORS } from "@/types/port";
import {
  mmToScene,
  uToScene,
  EQUIPMENT_COLORS,
  FRAME_THICKNESS_MM,
} from "@/constants";
import { useRackStore } from "@/stores";
import { Port, PowerPort, RJ45Port, SFPPort } from "../ports";

interface MA5822S16POTSProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// Huawei SmartAX MA5822S (16 GE + 16 POTS) dimensions
const FACEPLATE_WIDTH = mmToScene(442.4);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(220);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function MA5822S16POTS({
  equipment,
  onClick,
  isSelected,
}: MA5822S16POTSProps) {
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
        color: EQUIPMENT_COLORS.STEEL,
        metalness: 0.45,
        roughness: 0.55,
      }),
    []
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d0d0d0",
        metalness: 0.35,
        roughness: 0.6,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;
  const leftEdge = -FACEPLATE_WIDTH / 2;
  const rightEdge = FACEPLATE_WIDTH / 2;

  const powerX = leftEdge + mmToScene(30);
  const groundX = leftEdge + mmToScene(60);

  const managementPanelCenterX = leftEdge + mmToScene(130);
  const sfpX = leftEdge + mmToScene(130);
  const serialX = leftEdge + mmToScene(145);

  const geStartX = leftEdge + mmToScene(170);
  const geSpacingX = mmToScene(13);
  const geSpacingY = mmToScene(10);
  const geGroupGap = mmToScene(14);
  const geGroupSpan = geSpacingX * 3;
  const geTotalSpan = geGroupSpan * 2 + geGroupGap;
  const gePanelWidth = geTotalSpan + mmToScene(20);
  const gePanelCenterX = geStartX + geTotalSpan / 2;

  const potsCenterX = rightEdge - mmToScene(50);
  const potsPortWidth = mmToScene(36);
  const potsPortHeight = mmToScene(8);
  const potsPortDepth = mmToScene(3);
  const potsScrewOffset = potsPortWidth / 2 - mmToScene(4);

  const powerPorts = ports.filter((p) => p.type === "power-iec-c14");
  const sfpPorts = ports.filter((p) => p.type === "sfp-plus").slice(0, 1);
  const serialPorts = ports
    .filter((p) => p.type === "rj45-console")
    .slice(0, 1);
  const gePorts = ports.filter((p) => p.type === "rj45-lan").slice(0, 16);
  const potsPorts = ports.filter((p) => p.type === "fxs").slice(0, 1);

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

      {/* === LEFT SECTION - POWER + GROUND === */}
      <mesh position={[powerX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(24), mmToScene(18), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {powerPorts.map((port) => (
        <PowerPort
          key={port.globalId}
          port={port}
          position={[powerX, 0, frontZ + 0.001]}
        />
      ))}

      <mesh position={[groundX, 0, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(3), 12]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === MANAGEMENT PORTS (SFP + SERIAL) === */}
      <mesh
        position={[
          managementPanelCenterX + mmToScene(7),
          0,
          frontZ - mmToScene(0.5),
        ]}
      >
        <boxGeometry args={[mmToScene(40), HEIGHT * 0.55, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {sfpPorts.map((port) => (
        <SFPPort
          key={port.globalId}
          port={port}
          position={[sfpX, 0, frontZ + 0.001]}
        />
      ))}

      {serialPorts.map((port) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[serialX, 0, frontZ + 0.001]}
        />
      ))}

      {/* === GE PORTS (16) === */}
      <mesh position={[gePanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[gePanelWidth, HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {gePorts.map((port, index) => {
        const group = Math.floor(index / 8);
        const groupIndex = index % 8;
        const row = groupIndex < 4 ? 0 : 1;
        const col = groupIndex % 4;
        const x =
          geStartX + group * (geGroupSpan + geGroupGap) + col * geSpacingX;
        const y = row === 0 ? geSpacingY / 2 : -geSpacingY / 2;
        return (
          <RJ45Port
            key={port.globalId}
            port={port}
            position={[x, y, frontZ + 0.001]}
          />
        );
      })}

      {/* === POTS PORT BLOCK === */}
      <mesh position={[potsCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(48), HEIGHT * 0.55, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {potsPorts.map((port) => (
        <Port
          key={port.globalId}
          port={port}
          position={[potsCenterX, 0, frontZ + 0.001]}
          size={[potsPortWidth, potsPortHeight, potsPortDepth]}
          color={PORT_TYPE_COLORS.fxs}
        >
          <mesh position={[0, 0, potsPortDepth / 2 + 0.001]}>
            <boxGeometry
              args={[potsPortWidth * 0.85, potsPortHeight * 0.55, 0.002]}
            />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-potsScrewOffset, 0, potsPortDepth / 2 + 0.002]}>
            <circleGeometry args={[mmToScene(1.2), 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          <mesh position={[potsScrewOffset, 0, potsPortDepth / 2 + 0.002]}>
            <circleGeometry args={[mmToScene(1.2), 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        </Port>
      ))}

      {/* === BACK PANEL === */}
      <mesh
        position={[0, 0, -DEPTH / 2 + FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH * 0.98, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
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

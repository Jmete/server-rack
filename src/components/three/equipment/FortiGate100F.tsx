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

interface FortiGate100FProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// FortiGate 100F dimensions (approximate)
const FACEPLATE_WIDTH = mmToScene(442.4);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(330);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function FortiGate100F({
  equipment,
  onClick,
  isSelected,
}: FortiGate100FProps) {
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
        color: "#d5d5d5",
        metalness: 0.45,
        roughness: 0.45,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  const rj45Spacing = mmToScene(15);
  const rowSpacing = mmToScene(10);
  const sfpSpacingX = mmToScene(12);
  const sfpSpacingY = mmToScene(10);
  const groupGap = mmToScene(10);

  const portAreaStart = -FACEPLATE_WIDTH / 2 + mmToScene(100);
  const consoleX = portAreaStart;
  const mgmtX = consoleX + rj45Spacing + groupGap;
  const blockAStartX = mgmtX + rj45Spacing + groupGap;
  const blockBStartX =
    blockAStartX + rj45Spacing * 3 + groupGap + mmToScene(15);
  const sfpPlusX = blockBStartX + rj45Spacing * 3 + groupGap + mmToScene(15);
  const sfpBlockStartX = sfpPlusX + sfpSpacingX + groupGap + mmToScene(3);
  const sharedBlockStartX =
    sfpBlockStartX + sfpSpacingX * 3 + groupGap + mmToScene(15);
  const sharedBlockGap = groupGap - mmToScene(6);
  const sharedBlock2X = sharedBlockStartX + rj45Spacing + sharedBlockGap;

  const blockSpan = rj45Spacing * 3;
  const blockPanelWidth = blockSpan + mmToScene(24);
  const blockAPanelCenterX = blockAStartX + blockSpan / 2;
  const blockBPanelCenterX = blockBStartX + blockSpan / 2;
  const sfpSpan = sfpSpacingX * 3;
  const sfpPanelWidth = sfpSpan + mmToScene(24);
  const sfpPanelCenterX = sfpBlockStartX + sfpSpan / 2;
  const narrowPanelWidth = mmToScene(18);

  const usbPorts = ports.filter((port) => port.type === "usb");
  const consolePorts = ports.filter((port) => port.id.startsWith("console"));
  const mgmtPorts = ports
    .filter((port) => port.id === "dmz-1" || port.id === "mgmt-1")
    .sort((a, b) => (a.id === "dmz-1" ? -1 : 1));
  const wanPorts = ports
    .filter((port) => port.id.startsWith("wan"))
    .sort((a, b) => a.id.localeCompare(b.id));
  const haPorts = ports
    .filter((port) => port.id.startsWith("ha"))
    .sort((a, b) => a.id.localeCompare(b.id));
  const lanPorts = ports.filter((port) => port.id.startsWith("lan-"));
  const blockARj45Ports = [...wanPorts, ...haPorts, ...lanPorts.slice(0, 4)];
  const blockBRj45Ports = lanPorts.slice(4, 12);
  const fortiLinkPorts = ports.filter((port) =>
    port.id.startsWith("fortilink")
  );
  const dedicatedSfpPorts = ports.filter((port) => port.id.startsWith("sfp-"));
  const sharedSfpPorts = ports.filter((port) =>
    port.id.startsWith("shared-sfp")
  );
  const sfpPorts = [...dedicatedSfpPorts, ...sharedSfpPorts].slice(0, 8);
  const sharedRj45Ports = ports
    .filter((port) => port.id.startsWith("shared-rj45"))
    .sort((a, b) => a.id.localeCompare(b.id));
  const sharedGroupA = sharedRj45Ports.slice(0, 2);
  const sharedGroupB = sharedRj45Ports.slice(2, 4);
  const powerPorts = ports.filter((port) => port.type === "power-iec-c14");

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

      {/* === LEFT SECTION - LOGO/STATUS/USB === */}
      <mesh
        position={[
          -FACEPLATE_WIDTH / 2 + mmToScene(38),
          0,
          frontZ - mmToScene(0.5),
        ]}
      >
        <boxGeometry args={[mmToScene(70), HEIGHT * 0.75, mmToScene(2)]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>

      {/* Fortinet green bars */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={`fg-bar-${i}`}
          position={[
            -FACEPLATE_WIDTH / 2 + mmToScene(10),
            mmToScene(8) - i * mmToScene(6),
            frontZ + 0.001,
          ]}
        >
          <boxGeometry args={[mmToScene(3), mmToScene(8), mmToScene(0.5)]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}

      {/* Status LEDs */}
      {["#22c55e", "#f59e0b", "#22c55e"].map((color, index) => (
        <mesh
          key={`fg-led-${index}`}
          position={[
            -FACEPLATE_WIDTH / 2 + mmToScene(50),
            mmToScene(8) - index * mmToScene(6),
            frontZ + 0.001,
          ]}
        >
          <circleGeometry args={[mmToScene(1.5), 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* USB port (visual only) */}
      {usbPorts.map((port) => (
        <mesh
          key={port.globalId}
          position={[
            -FACEPLATE_WIDTH / 2 + mmToScene(68),
            mmToScene(6),
            frontZ + 0.001,
          ]}
        >
          <boxGeometry args={[mmToScene(6), mmToScene(10), mmToScene(2)]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}

      {/* Console RJ45 port */}
      <mesh position={[consoleX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[narrowPanelWidth, mmToScene(16), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {consolePorts.slice(0, 1).map((port) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[consoleX, 0, frontZ + 0.001]}
        />
      ))}

      {/* === MGMT/DMZ (2x RJ45) === */}
      <mesh position={[mgmtX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[narrowPanelWidth, HEIGHT * 0.65, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {mgmtPorts.map((port, index) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[
            mgmtX,
            index === 0 ? rowSpacing / 2 : -rowSpacing / 2,
            frontZ + 0.001,
          ]}
        />
      ))}

      {/* === 8x RJ45 BLOCK A === */}
      <mesh position={[blockAPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[blockPanelWidth, HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[blockAPanelCenterX, HEIGHT * 0.38, frontZ + 0.001]}>
        <boxGeometry
          args={[blockPanelWidth - mmToScene(6), mmToScene(4), mmToScene(0.5)]}
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {blockARj45Ports.slice(0, 8).map((port, index) => {
        const col = Math.floor(index / 2);
        const isTopRow = index % 2 === 0;
        return (
          <RJ45Port
            key={port.globalId}
            port={port}
            position={[
              blockAStartX + col * rj45Spacing,
              isTopRow ? rowSpacing / 2 : -rowSpacing / 2,
              frontZ + 0.001,
            ]}
          />
        );
      })}

      {/* === 8x RJ45 BLOCK B === */}
      <mesh position={[blockBPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[blockPanelWidth, HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[blockBPanelCenterX, HEIGHT * 0.38, frontZ + 0.001]}>
        <boxGeometry
          args={[blockPanelWidth - mmToScene(6), mmToScene(4), mmToScene(0.5)]}
        />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {blockBRj45Ports.slice(0, 8).map((port, index) => {
        const col = Math.floor(index / 2);
        const isTopRow = index % 2 === 0;
        return (
          <RJ45Port
            key={port.globalId}
            port={port}
            position={[
              blockBStartX + col * rj45Spacing,
              isTopRow ? rowSpacing / 2 : -rowSpacing / 2,
              frontZ + 0.001,
            ]}
          />
        );
      })}

      {/* === 2x 10G SFP+ FORTILINK === */}
      <mesh position={[sfpPlusX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(18), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {fortiLinkPorts.slice(0, 2).map((port, index) => (
        <SFPPort
          key={port.globalId}
          port={port}
          position={[
            sfpPlusX,
            index === 0 ? sfpSpacingY / 2 : -sfpSpacingY / 2,
            frontZ + 0.001,
          ]}
        />
      ))}

      {/* === 8x GE SFP PORTS === */}
      <mesh position={[sfpPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[sfpPanelWidth, HEIGHT * 0.6, mmToScene(2)]} />
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
              sfpBlockStartX + col * sfpSpacingX,
              isTopRow ? sfpSpacingY / 2 : -sfpSpacingY / 2,
              frontZ + 0.001,
            ]}
          />
        );
      })}

      {/* === SHARED RJ45 PAIRS === */}
      <mesh position={[sharedBlockStartX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[narrowPanelWidth, HEIGHT * 0.65, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {sharedGroupA.map((port, index) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[
            sharedBlockStartX,
            index === 0 ? rowSpacing / 2 : -rowSpacing / 2,
            frontZ + 0.001,
          ]}
        />
      ))}

      <mesh position={[sharedBlock2X, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[narrowPanelWidth, HEIGHT * 0.65, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {sharedGroupB.map((port, index) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[
            sharedBlock2X,
            index === 0 ? rowSpacing / 2 : -rowSpacing / 2,
            frontZ + 0.001,
          ]}
        />
      ))}

      {/* === BACK PANEL === */}
      <mesh
        position={[0, 0, -DEPTH / 2 + FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Power inlet panels */}
      {[-1, 1].map((side) => (
        <mesh
          key={`psu-panel-${side}`}
          position={[
            side * (FACEPLATE_WIDTH / 2 - mmToScene(32)),
            0,
            -DEPTH / 2 + mmToScene(0.5),
          ]}
        >
          <boxGeometry args={[mmToScene(28), mmToScene(18), mmToScene(2)]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {powerPorts.slice(0, 2).map((port, index) => (
        <PowerPort
          key={port.globalId}
          port={port}
          position={[
            index === 0
              ? -FACEPLATE_WIDTH / 2 + mmToScene(32)
              : FACEPLATE_WIDTH / 2 - mmToScene(32),
            0,
            -DEPTH / 2 - 0.001,
          ]}
        />
      ))}

      {/* Fan grill */}
      <mesh position={[0, 0, -DEPTH / 2 + mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(120), mmToScene(26), mmToScene(2)]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {Array.from({ length: 24 }).map((_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = -mmToScene(42) + col * mmToScene(12);
        const y = mmToScene(8) - row * mmToScene(8);
        return (
          <mesh key={`grill-${i}`} position={[x, y, -DEPTH / 2 + 0.002]}>
            <circleGeometry args={[mmToScene(3), 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        );
      })}

      {/* Caution label */}
      <mesh position={[mmToScene(90), 0, -DEPTH / 2 + 0.002]}>
        <boxGeometry args={[mmToScene(28), mmToScene(8), mmToScene(0.5)]} />
        <meshStandardMaterial color="#eab308" />
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

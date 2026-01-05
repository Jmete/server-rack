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
import { FXOPort, RJ45Port } from "../ports";

interface UCM6208Props {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// UCM6208 dimensions
const FACEPLATE_WIDTH = mmToScene(440);
const CHASSIS_WIDTH = mmToScene(430);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(292);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function UCM6208({ equipment, onClick, isSelected }: UCM6208Props) {
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
        color: EQUIPMENT_COLORS.BLACK,
        metalness: 0.4,
        roughness: 0.6,
      }),
    []
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        metalness: 0.3,
        roughness: 0.7,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;

  // Port layout for UCM6208
  // USB port on far left
  const usbAreaX = -FACEPLATE_WIDTH / 2 + mmToScene(25);

  // FXS ports (2 ports, single row)
  const fxsAreaStart = -FACEPLATE_WIDTH / 2 + mmToScene(75);
  const fxsSpacing = mmToScene(18);

  // FXO ports (8 ports, 2 rows of 4)
  const fxoAreaStart = -FACEPLATE_WIDTH / 2 + mmToScene(140);
  const fxoSpacingX = mmToScene(18);
  const fxoSpacingY = mmToScene(10);
  const fxoPanelWidth = fxoSpacingX * 3 + mmToScene(24);
  const fxoPanelCenterX = fxoAreaStart + (fxoSpacingX * 3) / 2;

  // LED indicators area
  const ledAreaStart = fxoAreaStart + fxoSpacingX * 4 + mmToScene(20);

  // LCD display on right side
  const lcdAreaX = FACEPLATE_WIDTH / 2 - mmToScene(70);

  // Filter ports by type
  const usbPorts = ports.filter((p) => p.type === "usb");
  const fxsPorts = ports.filter((p) => p.type === "fxs");
  const fxoPorts = ports.filter((p) => p.type === "fxo");
  const lanPorts = ports.filter((p) => p.type === "rj45-lan");
  const wanPorts = ports.filter((p) => p.type === "rj45-wan");

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry
          args={[CHASSIS_WIDTH, HEIGHT * 0.88, DEPTH - FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Front faceplate (dark gray/black) */}
      <mesh
        position={[0, 0, frontZ - FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* === LEFT SECTION - USB PORT === */}

      {/* USB port area (dark panel) */}
      <mesh position={[usbAreaX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(15), mmToScene(18), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* USB Port - rendered as a simple box since we don't have USB component */}
      {usbPorts.map((port) => (
        <mesh key={port.globalId} position={[usbAreaX, 0, frontZ + 0.001]}>
          <boxGeometry args={[mmToScene(5), mmToScene(12), mmToScene(2)]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* SD Card slot indicator */}
      <mesh position={[usbAreaX + mmToScene(18), mmToScene(2), frontZ + 0.001]}>
        <boxGeometry args={[mmToScene(8), mmToScene(2), mmToScene(1)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* === FXS PORTS SECTION (2 ports) === */}

      {/* FXS ports panel */}
      <mesh
        position={[fxsAreaStart + fxsSpacing / 2, 0, frontZ - mmToScene(0.5)]}
      >
        <boxGeometry args={[mmToScene(45), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* FXS Ports */}
      {fxsPorts.map((port, index) => (
        <FXOPort
          key={port.globalId}
          port={port}
          position={[fxsAreaStart + index * fxsSpacing, 0, frontZ + 0.001]}
        />
      ))}

      {/* === FXO PORTS SECTION (8 ports in 2 rows of 4) === */}

      {/* FXO ports panel */}
      <mesh position={[fxoPanelCenterX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[fxoPanelWidth, HEIGHT * 0.72, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* FXO Ports - 8 ports in 2 rows of 4 */}
      {fxoPorts.map((port, index) => {
        const col = Math.floor(index / 2);
        const isTopRow = index % 2 === 0;
        return (
          <FXOPort
            key={port.globalId}
            port={port}
            position={[
              fxoAreaStart + col * fxoSpacingX,
              isTopRow ? fxoSpacingY / 2 : -fxoSpacingY / 2,
              frontZ + 0.001,
            ]}
          />
        );
      })}

      {/* === LED INDICATORS SECTION === */}

      {/* LED panel background */}
      <mesh
        position={[ledAreaStart + mmToScene(30), 0, frontZ - mmToScene(0.5)]}
      >
        <boxGeometry args={[mmToScene(70), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* LED indicators (simplified - a few colored dots) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`led-${i}`}
          position={[
            ledAreaStart + mmToScene(10) + (i % 4) * mmToScene(14),
            i < 4 ? mmToScene(5) : -mmToScene(5),
            frontZ + 0.002,
          ]}
        >
          <circleGeometry args={[mmToScene(2), 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#22c55e" : "#1a3a1a"}
            emissive={i % 3 === 0 ? "#22c55e" : "#000000"}
            emissiveIntensity={i % 3 === 0 ? 0.5 : 0}
          />
        </mesh>
      ))}

      {/* === RIGHT SECTION - LCD DISPLAY === */}

      {/* LCD bezel (dark frame around screen) */}
      <mesh position={[lcdAreaX, 0, frontZ - mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(65), mmToScene(28), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* LCD screen (greenish display typical of Grandstream) */}
      <mesh position={[lcdAreaX, 0, frontZ + 0.001]}>
        <planeGeometry args={[mmToScene(55), mmToScene(22)]} />
        <meshStandardMaterial
          color="#1a3020"
          emissive="#2a5030"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Navigation buttons area (right of LCD) */}
      <mesh position={[FACEPLATE_WIDTH / 2 - mmToScene(20), 0, frontZ + 0.001]}>
        <circleGeometry args={[mmToScene(8), 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* === BACK PANEL === */}
      {/* Back panel faceplate */}
      <mesh
        position={[0, 0, -DEPTH / 2 + FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* Back panel port area background (right side when looking from back) */}
      <mesh position={[-mmToScene(170), 0, -DEPTH / 2 + mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(50), HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* DC Power input area (to the left of LAN/WAN when looking from back) */}
      <mesh position={[-mmToScene(130), 0, -DEPTH / 2 + mmToScene(0.5)]}>
        <boxGeometry args={[mmToScene(25), mmToScene(12), mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* DC connector */}
      <mesh position={[-mmToScene(100), 0, -DEPTH / 2 + 0.002]}>
        <circleGeometry args={[mmToScene(4), 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Reset button (between power and LAN) */}
      <mesh position={[-mmToScene(50), 0, -DEPTH / 2 + 0.002]}>
        <circleGeometry args={[mmToScene(2), 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* LAN Port (right side of back, facing negative Z) */}
      {lanPorts.map((port) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[-mmToScene(160), 0, -DEPTH / 2 - 0.001]}
        />
      ))}

      {/* WAN Port (right side of back, next to LAN, facing negative Z) */}
      {wanPorts.map((port) => (
        <RJ45Port
          key={port.globalId}
          port={port}
          position={[-mmToScene(180), 0, -DEPTH / 2 - 0.001]}
        />
      ))}

      {/* Ground terminal (far right of back) */}
      <mesh position={[-mmToScene(150), 0, -DEPTH / 2 + 0.002]}>
        <circleGeometry args={[mmToScene(5), 12]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
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

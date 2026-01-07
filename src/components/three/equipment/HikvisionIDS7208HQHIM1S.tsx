"use client";

import { useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Equipment, Port as PortType } from "@/types";
import { createPortInstances, PORT_TYPE_COLORS } from "@/types/port";
import {
  mmToScene,
  uToScene,
  EQUIPMENT_COLORS,
  FRAME_THICKNESS_MM,
} from "@/constants";
import { useRackStore } from "@/stores";
import { Port, RJ45Port } from "../ports";

interface HikvisionIDS7208HQHIM1SProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// Hikvision iDS-7208HQHI-M1/S dimensions
const FACEPLATE_WIDTH = mmToScene(315);
const CHASSIS_WIDTH = mmToScene(300);
const HEIGHT = uToScene(1);
const DEPTH = mmToScene(242);
const FACEPLATE_THICKNESS = mmToScene(3);

// Rack positioning constants (static)
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

const PORT_DEPTH = mmToScene(2);
const BNC_DIAM = mmToScene(6);
const RCA_DIAM = mmToScene(5);
const USB_WIDTH = mmToScene(6);
const USB_HEIGHT = mmToScene(3.5);
const HDMI_WIDTH = mmToScene(10);
const HDMI_HEIGHT = mmToScene(4);
const VGA_WIDTH = mmToScene(14);
const VGA_HEIGHT = mmToScene(7);
const RS485_WIDTH = mmToScene(8);
const RS485_HEIGHT = mmToScene(6);
const DC_DIAM = mmToScene(6);

interface SimplePortProps {
  port: PortType;
  position: [number, number, number];
}

function BncPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[BNC_DIAM, BNC_DIAM, PORT_DEPTH]}
      color={PORT_TYPE_COLORS["bnc-video"]}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <circleGeometry args={[BNC_DIAM * 0.35, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.002]}>
        <circleGeometry args={[BNC_DIAM * 0.2, 12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </Port>
  );
}

function RcaPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[RCA_DIAM, RCA_DIAM, PORT_DEPTH]}
      color={PORT_TYPE_COLORS["rca-audio"]}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <circleGeometry args={[RCA_DIAM * 0.35, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </Port>
  );
}

function UsbPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[USB_WIDTH, USB_HEIGHT, PORT_DEPTH]}
      color={PORT_TYPE_COLORS.usb}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[USB_WIDTH * 0.7, USB_HEIGHT * 0.45, 0.002]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </Port>
  );
}

function HdmiPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[HDMI_WIDTH, HDMI_HEIGHT, PORT_DEPTH]}
      color={PORT_TYPE_COLORS.hdmi}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[HDMI_WIDTH * 0.8, HDMI_HEIGHT * 0.5, 0.002]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </Port>
  );
}

function VgaPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[VGA_WIDTH, VGA_HEIGHT, PORT_DEPTH]}
      color={PORT_TYPE_COLORS.vga}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[VGA_WIDTH * 0.75, VGA_HEIGHT * 0.5, 0.002]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[-VGA_WIDTH * 0.35, 0, PORT_DEPTH / 2 + 0.002]}>
        <circleGeometry args={[mmToScene(0.8), 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[VGA_WIDTH * 0.35, 0, PORT_DEPTH / 2 + 0.002]}>
        <circleGeometry args={[mmToScene(0.8), 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </Port>
  );
}

function Rs485Port({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[RS485_WIDTH, RS485_HEIGHT, PORT_DEPTH]}
      color={PORT_TYPE_COLORS.rs485}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[RS485_WIDTH * 0.7, RS485_HEIGHT * 0.4, 0.002]} />
        <meshStandardMaterial color="#0b1120" />
      </mesh>
      <mesh position={[-RS485_WIDTH * 0.2, 0, PORT_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[mmToScene(1.2), mmToScene(1.2), 0.002]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[RS485_WIDTH * 0.2, 0, PORT_DEPTH / 2 + 0.002]}>
        <boxGeometry args={[mmToScene(1.2), mmToScene(1.2), 0.002]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </Port>
  );
}

function DcPort({ port, position }: SimplePortProps) {
  return (
    <Port
      port={port}
      position={position}
      size={[DC_DIAM, DC_DIAM, PORT_DEPTH]}
      color={PORT_TYPE_COLORS["power-dc"]}
    >
      <mesh position={[0, 0, PORT_DEPTH / 2 + 0.001]}>
        <circleGeometry args={[DC_DIAM * 0.35, 12]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </Port>
  );
}

export function HikvisionIDS7208HQHIM1S({
  equipment,
  onClick,
  isSelected,
}: HikvisionIDS7208HQHIM1SProps) {
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
        metalness: 0.25,
        roughness: 0.75,
      }),
    []
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2b2b2b",
        metalness: 0.2,
        roughness: 0.8,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  const frontZ = DEPTH / 2;
  const backZ = -DEPTH / 2;
  const rightEdge = FACEPLATE_WIDTH / 2;

  const toBackX = (mmFromLeft: number) => rightEdge - mmToScene(mmFromLeft);

  const bncStartMm = 25;
  const bncSpacingMm = 16;
  const bncSpacingY = mmToScene(12);
  const bncSpanMm = bncSpacingMm * 3;
  const bncPanelWidth = mmToScene(bncSpanMm + 22);
  const bncPanelCenterX = toBackX(bncStartMm + bncSpanMm / 2);

  const videoOutX = toBackX(95);
  const usbX = toBackX(95);
  const hdmiX = toBackX(110);
  const vgaX = toBackX(130);
  const audioX = toBackX(150);
  const audioSpacingY = mmToScene(14);
  const lanX = toBackX(165);
  const rs485X = toBackX(180);
  const dcX = toBackX(195);
  const groundX = toBackX(300);

  const videoInPorts = ports.filter((p) => p.id.startsWith("video-in-"));
  const videoOutPort = ports.find((p) => p.id === "video-out-1");
  const usbPort = ports.find((p) => p.type === "usb");
  const hdmiPort = ports.find((p) => p.type === "hdmi");
  const vgaPort = ports.find((p) => p.type === "vga");
  const audioInPort = ports.find((p) => p.id === "audio-in-1");
  const audioOutPort = ports.find((p) => p.id === "audio-out-1");
  const lanPort = ports.find((p) => p.type === "rj45-lan");
  const rs485Port = ports.find((p) => p.type === "rs485");
  const dcPort = ports.find((p) => p.type === "power-dc");

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main chassis body */}
      <mesh position={[0, 0, -FACEPLATE_THICKNESS / 2]} material={bodyMaterial}>
        <boxGeometry
          args={[CHASSIS_WIDTH, HEIGHT * 0.82, DEPTH - FACEPLATE_THICKNESS]}
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

      {/* Back faceplate */}
      <mesh
        position={[0, 0, backZ + FACEPLATE_THICKNESS / 2]}
        material={faceplateMaterial}
      >
        <boxGeometry
          args={[FACEPLATE_WIDTH, HEIGHT * 0.9, FACEPLATE_THICKNESS]}
        />
      </mesh>

      {/* BNC block panel */}
      <mesh position={[bncPanelCenterX, 0, backZ + mmToScene(0.5)]}>
        <boxGeometry args={[bncPanelWidth, HEIGHT * 0.6, mmToScene(2)]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* BNC video inputs (8) */}
      {videoInPorts.map((port, index) => {
        const isTopRow = index < 4;
        const col = isTopRow ? index : index - 4;
        return (
          <BncPort
            key={port.globalId}
            port={port}
            position={[
              toBackX(bncStartMm + col * bncSpacingMm),
              isTopRow ? bncSpacingY / 2 : -bncSpacingY / 2,
              backZ - 0.001,
            ]}
          />
        );
      })}

      {/* Video out */}
      {videoOutPort && (
        <BncPort
          port={videoOutPort}
          position={[videoOutX, bncSpacingY / 2, backZ - 0.001]}
        />
      )}

      {/* USB port */}
      {usbPort && (
        <UsbPort
          port={usbPort}
          position={[usbX, -bncSpacingY / 2, backZ - 0.001]}
        />
      )}

      {/* HDMI */}
      {hdmiPort && (
        <HdmiPort
          port={hdmiPort}
          position={[hdmiX, -bncSpacingY / 2, backZ - 0.001]}
        />
      )}

      {/* VGA */}
      {vgaPort && (
        <VgaPort
          port={vgaPort}
          position={[vgaX, -bncSpacingY / 2, backZ - 0.001]}
        />
      )}

      {/* Audio in/out */}
      {audioInPort && (
        <RcaPort
          port={audioInPort}
          position={[audioX, audioSpacingY / 2, backZ - 0.001]}
        />
      )}
      {audioOutPort && (
        <RcaPort
          port={audioOutPort}
          position={[audioX, -audioSpacingY / 2, backZ - 0.001]}
        />
      )}

      {/* LAN */}
      {lanPort && (
        <RJ45Port port={lanPort} position={[lanX, 0, backZ - 0.001]} />
      )}

      {/* RS-485 */}
      {rs485Port && (
        <Rs485Port port={rs485Port} position={[rs485X, 0, backZ - 0.001]} />
      )}

      {/* 12V DC */}
      {dcPort && <DcPort port={dcPort} position={[dcX, 0, backZ - 0.001]} />}

      {/* Ground lug */}
      <mesh position={[groundX, 0, backZ + 0.002]}>
        <circleGeometry args={[mmToScene(3), 12]} />
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

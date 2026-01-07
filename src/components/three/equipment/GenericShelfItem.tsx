"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ShelfItem } from "@/types/shelf";
import { createPortInstances, PORT_TYPE_COLORS } from "@/types/port";
import { mmToScene } from "@/constants";
import { Port, RJ45Port, SFPPort } from "../ports";
import { getShelfItemById } from "@/constants/shelfItems";

interface GenericShelfItemProps {
  item: ShelfItem;
  isSelected?: boolean;
  onClick?: () => void;
}

const PORT_DEPTH = mmToScene(2);
const BNC_DIAM = mmToScene(6);
const RCA_DIAM = mmToScene(5);
const USB_WIDTH = mmToScene(6);
const USB_HEIGHT = mmToScene(3.5);
const HDMI_WIDTH = mmToScene(10);
const HDMI_HEIGHT = mmToScene(4);
const VGA_WIDTH = mmToScene(14);
const VGA_HEIGHT = mmToScene(7);
const DC_DIAM = mmToScene(6);

interface SimplePortProps {
  port: ReturnType<typeof createPortInstances>[number];
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
    />
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

export function GenericShelfItem({
  item,
  isSelected,
  onClick,
}: GenericShelfItemProps) {
  // Look up the current definition to get fresh values on hot reload
  const definition = useMemo(() => getShelfItemById(item.id), [item.id]);

  // Use dimensions and color from definition if available (updates on hot reload)
  const width = mmToScene(definition?.width ?? item.width);
  const depth = mmToScene(definition?.depth ?? item.depth);
  const height = mmToScene(definition?.heightMm ?? item.heightMm);
  const color = definition?.color ?? item.color ?? "#2a2a2a";

  const ports = useMemo(() => {
    // Use ports from the definition (which updates on hot reload) rather than the instance
    const portDefs = definition?.ports || item.ports;
    return createPortInstances(portDefs, item.instanceId);
  }, [definition, item.ports, item.instanceId]);

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7,
      }),
    [color]
  );

  const faceplateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.8,
      }),
    [color]
  );

  // Port position calculations (relative to item center)
  const backZ = -depth / 2;
  const frontZ = depth / 2;

  // Helper to convert port position (mm from item origin) to 3D position
  const getPortPosition = (portPosX: number, portPosY: number, portPosZ: number): [number, number, number] => {
    // Port positions are in mm from the left edge (X), bottom edge (Y), and front face (Z)
    // For back-facing ports, mirror the X coordinate since left/right are reversed when viewing from behind
    const itemDepthMm = definition?.depth ?? item.depth;
    const isBackFace = portPosZ >= itemDepthMm;
    const x = isBackFace
      ? width / 2 - mmToScene(portPosX)   // Mirror X for back face
      : -width / 2 + mmToScene(portPosX); // Normal X for front face
    const y = -height / 2 + mmToScene(portPosY);
    // Z: 0 = front, depth = back
    const z = portPosZ === 0 ? frontZ : (isBackFace ? backZ : frontZ - mmToScene(portPosZ));

    return [x, y, z - 0.001]; // Slight offset to prevent z-fighting
  };

  const renderPort = (port: ReturnType<typeof createPortInstances>[number]) => {
    const position = getPortPosition(port.position.x, port.position.y, port.position.z);

    switch (port.type) {
      case "bnc-video":
        return <BncPort key={port.globalId} port={port} position={position} />;
      case "rca-audio":
        return <RcaPort key={port.globalId} port={port} position={position} />;
      case "usb":
        return <UsbPort key={port.globalId} port={port} position={position} />;
      case "hdmi":
        return <HdmiPort key={port.globalId} port={port} position={position} />;
      case "vga":
        return <VgaPort key={port.globalId} port={port} position={position} />;
      case "power-dc":
        return <DcPort key={port.globalId} port={port} position={position} />;
      case "rj45-lan":
      case "rj45-wan":
      case "rj45-console":
        return <RJ45Port key={port.globalId} port={port} position={position} />;
      case "sfp-plus":
        return <SFPPort key={port.globalId} port={port} position={position} />;
      default:
        // Generic port rendering
        return (
          <Port
            key={port.globalId}
            port={port}
            position={position}
            size={[mmToScene(8), mmToScene(6), PORT_DEPTH]}
            color={PORT_TYPE_COLORS[port.type] || "#666666"}
          />
        );
    }
  };

  return (
    <group onClick={onClick}>
      {/* Main body */}
      <mesh material={bodyMaterial}>
        <boxGeometry args={[width * 0.95, height * 0.9, depth * 0.95]} />
      </mesh>

      {/* Front faceplate */}
      <mesh position={[0, 0, frontZ - mmToScene(1.5)]} material={faceplateMaterial}>
        <boxGeometry args={[width, height * 0.95, mmToScene(3)]} />
      </mesh>

      {/* Back faceplate */}
      <mesh position={[0, 0, backZ + mmToScene(1.5)]} material={faceplateMaterial}>
        <boxGeometry args={[width, height * 0.95, mmToScene(3)]} />
      </mesh>

      {/* Item label (on front) */}
      {/* TODO: Add 3D text label if needed */}

      {/* Render all ports */}
      {ports.map(renderPort)}

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[width + 0.01, height + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#22c55e" wireframe />
        </mesh>
      )}
    </group>
  );
}

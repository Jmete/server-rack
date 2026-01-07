"use client";

import { useMemo } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Equipment } from "@/types";
import { ShelfItem } from "@/types/shelf";
import {
  mmToScene,
  uToScene,
  FRAME_THICKNESS_MM,
} from "@/constants";
import { useRackStore } from "@/stores";
import { useShelfStore } from "@/stores/useShelfStore";
import { GenericShelfItem } from "./GenericShelfItem";

interface RackShelfProps {
  equipment: Equipment;
  onClick?: () => void;
  isSelected?: boolean;
}

// Shelf dimensions
const SHELF_THICKNESS_MM = 2; // Thin metal shelf
const BRACKET_WIDTH_MM = 20; // Mounting bracket width
const BRACKET_HEIGHT_MM = 40; // Bracket extends down from shelf
const BRACKET_THICKNESS_MM = 3;
const LIP_HEIGHT_MM = 8; // Front lip to prevent items from sliding off

// Rack positioning constants
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const SLOT_START_OFFSET = FRAME_THICKNESS;

export function RackShelf({
  equipment,
  onClick,
  isSelected,
}: RackShelfProps) {
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);
  // Select the raw shelf items map and derive items for this shelf
  const shelfItemsMap = useShelfStore((state) => state.shelfItems);
  const shelfItems = shelfItemsMap[equipment.instanceId] || [];

  const RACK_DEPTH = mmToScene(rackDepthMm);
  const HEIGHT = uToScene(equipment.heightU);

  // Use rack depth for shelf depth (minus some clearance)
  const shelfDepthMm = Math.min(equipment.depth, rackDepthMm - 50);
  const SHELF_DEPTH = mmToScene(shelfDepthMm);
  const SHELF_WIDTH = mmToScene(equipment.width);
  const SHELF_THICKNESS = mmToScene(SHELF_THICKNESS_MM);
  const BRACKET_WIDTH = mmToScene(BRACKET_WIDTH_MM);
  const BRACKET_HEIGHT = mmToScene(BRACKET_HEIGHT_MM);
  const BRACKET_THICKNESS = mmToScene(BRACKET_THICKNESS_MM);
  const LIP_HEIGHT = mmToScene(LIP_HEIGHT_MM);

  const RAIL_FRONT_Z =
    RACK_DEPTH / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;

  // Position shelf at the TOP of the U slot (items sit on top)
  const yPosition =
    SLOT_START_OFFSET + uToScene(equipment.slotPosition - 1) + HEIGHT - SHELF_THICKNESS / 2;
  const zPosition = RAIL_FRONT_Z - SHELF_DEPTH / 2;

  const shelfMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: equipment.color || "#1a1a1a",
        metalness: 0.6,
        roughness: 0.4,
      }),
    [equipment.color]
  );

  const bracketMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        metalness: 0.5,
        roughness: 0.5,
      }),
    []
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  // Calculate usable shelf area (for positioning items)
  const usableStartX = -SHELF_WIDTH / 2 + BRACKET_WIDTH;
  const usableStartZ = SHELF_DEPTH / 2 - mmToScene(10); // Front lip offset

  return (
    <group position={[0, yPosition, zPosition]} onClick={handleClick}>
      {/* Main shelf platform */}
      <mesh material={shelfMaterial}>
        <boxGeometry args={[SHELF_WIDTH - BRACKET_WIDTH * 2, SHELF_THICKNESS, SHELF_DEPTH]} />
      </mesh>

      {/* Front lip */}
      <mesh
        position={[0, LIP_HEIGHT / 2 + SHELF_THICKNESS / 2, SHELF_DEPTH / 2 - mmToScene(2)]}
        material={shelfMaterial}
      >
        <boxGeometry args={[SHELF_WIDTH - BRACKET_WIDTH * 2, LIP_HEIGHT, mmToScene(4)]} />
      </mesh>

      {/* Left mounting bracket */}
      <group position={[-SHELF_WIDTH / 2 + BRACKET_WIDTH / 2, 0, 0]}>
        {/* Vertical bracket */}
        <mesh
          position={[0, -BRACKET_HEIGHT / 2, SHELF_DEPTH / 2 - BRACKET_THICKNESS / 2]}
          material={bracketMaterial}
        >
          <boxGeometry args={[BRACKET_WIDTH, BRACKET_HEIGHT, BRACKET_THICKNESS]} />
        </mesh>
        {/* Horizontal bracket shelf support */}
        <mesh
          position={[0, 0, 0]}
          material={bracketMaterial}
        >
          <boxGeometry args={[BRACKET_WIDTH, SHELF_THICKNESS * 2, SHELF_DEPTH]} />
        </mesh>
      </group>

      {/* Right mounting bracket */}
      <group position={[SHELF_WIDTH / 2 - BRACKET_WIDTH / 2, 0, 0]}>
        {/* Vertical bracket */}
        <mesh
          position={[0, -BRACKET_HEIGHT / 2, SHELF_DEPTH / 2 - BRACKET_THICKNESS / 2]}
          material={bracketMaterial}
        >
          <boxGeometry args={[BRACKET_WIDTH, BRACKET_HEIGHT, BRACKET_THICKNESS]} />
        </mesh>
        {/* Horizontal bracket shelf support */}
        <mesh
          position={[0, 0, 0]}
          material={bracketMaterial}
        >
          <boxGeometry args={[BRACKET_WIDTH, SHELF_THICKNESS * 2, SHELF_DEPTH]} />
        </mesh>
      </group>

      {/* Ventilation holes pattern (optional visual detail) */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <mesh
            key={`vent-${row}-${col}`}
            position={[
              -SHELF_WIDTH / 4 + col * (SHELF_WIDTH / 10),
              SHELF_THICKNESS / 2 + 0.001,
              -SHELF_DEPTH / 4 + row * (SHELF_DEPTH / 6),
            ]}
          >
            <circleGeometry args={[mmToScene(3), 8]} />
            <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
          </mesh>
        ))
      )}

      {/* Render shelf items */}
      {shelfItems.map((item) => (
        <ShelfItemOnShelf
          key={item.instanceId}
          item={item}
          shelfEquipment={equipment}
          usableStartX={usableStartX}
          usableStartZ={usableStartZ}
          shelfTopY={SHELF_THICKNESS / 2}
        />
      ))}

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[SHELF_WIDTH + 0.01, HEIGHT + 0.01, SHELF_DEPTH + 0.01]}
          />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
}

// Component to render a single shelf item positioned on the shelf
interface ShelfItemOnShelfProps {
  item: ShelfItem;
  shelfEquipment: Equipment;
  usableStartX: number;
  usableStartZ: number;
  shelfTopY: number;
}

function ShelfItemOnShelf({
  item,
  usableStartX,
  usableStartZ,
  shelfTopY,
}: ShelfItemOnShelfProps) {
  // Calculate position based on item.position (in mm from shelf usable area origin)
  const itemWidth = item.position.rotation === 90 || item.position.rotation === 270
    ? mmToScene(item.depth)
    : mmToScene(item.width);
  const itemDepth = item.position.rotation === 90 || item.position.rotation === 270
    ? mmToScene(item.width)
    : mmToScene(item.depth);
  const itemHeight = mmToScene(item.heightMm);

  // Position: item.position is in mm from the front-left of usable shelf area
  const xPos = usableStartX + mmToScene(item.position.x) + itemWidth / 2;
  const yPos = shelfTopY + itemHeight / 2;
  const zPos = usableStartZ - mmToScene(item.position.z) - itemDepth / 2;

  // Rotation in radians
  const rotationY = (item.position.rotation * Math.PI) / 180;

  return (
    <group position={[xPos, yPos, zPos]} rotation={[0, rotationY, 0]}>
      <GenericShelfItem item={item} />
    </group>
  );
}

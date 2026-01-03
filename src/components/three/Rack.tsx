'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRackStore } from '@/stores';
import { RACK_CONSTANTS, mmToScene, uToScene, RACK_COLORS, FRAME_THICKNESS_MM, RACK_DEPTH_MM } from '@/constants';

// Rack frame dimensions
const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RAIL_WIDTH = mmToScene(RACK_CONSTANTS.RAIL_WIDTH_MM);
const RACK_WIDTH = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
const RACK_DEPTH = mmToScene(RACK_DEPTH_MM);

// Export for equipment positioning - slots start above bottom frame
export const SLOT_START_OFFSET = FRAME_THICKNESS;

interface RackProps {
  showSlotNumbers?: boolean;
}

export function Rack({ showSlotNumbers = true }: RackProps) {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const slotsHeight = uToScene(rackSize);
  const totalRackHeight = slotsHeight + FRAME_THICKNESS * 2; // Add top and bottom frame

  // Create materials
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: RACK_COLORS.FRAME,
        metalness: 0.8,
        roughness: 0.3,
      }),
    []
  );

  const railMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: RACK_COLORS.RAILS,
        metalness: 0.7,
        roughness: 0.4,
      }),
    []
  );

  // Generate slot indicators - offset by FRAME_THICKNESS
  const slotIndicators = useMemo(() => {
    const indicators = [];
    const slotHeight = uToScene(1);

    for (let i = 0; i < rackSize; i++) {
      // Slots start above the bottom frame
      const y = SLOT_START_OFFSET + i * slotHeight + slotHeight / 2;
      const uNumber = i + 1;

      indicators.push(
        <group key={`slot-${uNumber}`} position={[0, y, RACK_DEPTH / 2 + 0.001]}>
          {/* Slot divider line */}
          <mesh position={[0, slotHeight / 2 - 0.002, 0]}>
            <boxGeometry args={[RACK_WIDTH - FRAME_THICKNESS * 2 - RAIL_WIDTH * 2, 0.002, 0.001]} />
            <meshBasicMaterial color="#333333" />
          </mesh>

          {/* U number label on left rail */}
          {showSlotNumbers && (
            <Text
              position={[-(RACK_WIDTH / 2) - 0.03, 0, 0]}
              fontSize={0.02}
              color="#666666"
              anchorX="right"
              anchorY="middle"
            >
              {uNumber}U
            </Text>
          )}
        </group>
      );
    }

    return indicators;
  }, [rackSize, showSlotNumbers]);

  return (
    <group position={[0, 0, 0]}>
      {/* Rack Frame - 4 vertical posts */}
      {/* Front Left Post */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, totalRackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, totalRackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Front Right Post */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, totalRackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, totalRackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Left Post */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, totalRackHeight / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, totalRackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Right Post */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, totalRackHeight / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, totalRackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Front Mounting Rails - only in the slots area */}
      {/* Left Rail */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS + RAIL_WIDTH / 2, SLOT_START_OFFSET + slotsHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={railMaterial}
      >
        <boxGeometry args={[RAIL_WIDTH, slotsHeight, FRAME_THICKNESS * 0.8]} />
      </mesh>

      {/* Right Rail */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS - RAIL_WIDTH / 2, SLOT_START_OFFSET + slotsHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={railMaterial}
      >
        <boxGeometry args={[RAIL_WIDTH, slotsHeight, FRAME_THICKNESS * 0.8]} />
      </mesh>

      {/* Top Cross Beams */}
      {/* Front Top */}
      <mesh
        position={[0, totalRackHeight - FRAME_THICKNESS / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Top */}
      <mesh
        position={[0, totalRackHeight - FRAME_THICKNESS / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Side Top Beams */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, totalRackHeight - FRAME_THICKNESS / 2, 0]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, FRAME_THICKNESS, RACK_DEPTH - FRAME_THICKNESS * 2]} />
      </mesh>

      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, totalRackHeight - FRAME_THICKNESS / 2, 0]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, FRAME_THICKNESS, RACK_DEPTH - FRAME_THICKNESS * 2]} />
      </mesh>

      {/* Bottom Cross Beams */}
      {/* Front Bottom */}
      <mesh
        position={[0, FRAME_THICKNESS / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Bottom */}
      <mesh
        position={[0, FRAME_THICKNESS / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Slot Indicators */}
      {slotIndicators}

      {/* Back panel (semi-transparent for visibility) */}
      <mesh position={[0, SLOT_START_OFFSET + slotsHeight / 2, -(RACK_DEPTH / 2) + 0.005]}>
        <planeGeometry args={[RACK_WIDTH - FRAME_THICKNESS * 2, slotsHeight]} />
        <meshStandardMaterial
          color="#0a0a0a"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

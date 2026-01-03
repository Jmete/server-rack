'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRackStore } from '@/stores';
import { RACK_CONSTANTS, mmToScene, uToScene, RACK_COLORS } from '@/constants';

// Rack frame dimensions
const FRAME_THICKNESS = mmToScene(40); // 40mm thick frame
const RAIL_WIDTH = mmToScene(RACK_CONSTANTS.RAIL_WIDTH_MM);
const RACK_WIDTH = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
const RACK_DEPTH = mmToScene(600); // Default depth for visualization

interface RackProps {
  showSlotNumbers?: boolean;
}

export function Rack({ showSlotNumbers = true }: RackProps) {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const rackHeight = uToScene(rackSize);

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

  // Generate slot indicators
  const slotIndicators = useMemo(() => {
    const indicators = [];
    const slotHeight = uToScene(1);

    for (let i = 0; i < rackSize; i++) {
      const y = i * slotHeight + slotHeight / 2;
      const uNumber = i + 1;

      indicators.push(
        <group key={`slot-${uNumber}`} position={[0, y, RACK_DEPTH / 2 + 0.001]}>
          {/* Slot divider line */}
          <mesh position={[0, slotHeight / 2 - 0.002, 0]}>
            <boxGeometry args={[RACK_WIDTH - RAIL_WIDTH * 2, 0.002, 0.001]} />
            <meshBasicMaterial color="#333333" />
          </mesh>

          {/* U number label on left rail */}
          {showSlotNumbers && (
            <Text
              position={[-(RACK_WIDTH / 2) - 0.03, 0, 0]}
              fontSize={0.025}
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
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, rackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, rackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Front Right Post */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, rackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, rackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Left Post */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, rackHeight / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, rackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Right Post */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, rackHeight / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, rackHeight, FRAME_THICKNESS]} />
      </mesh>

      {/* Front Mounting Rails */}
      {/* Left Rail */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS + RAIL_WIDTH / 2, rackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={railMaterial}
      >
        <boxGeometry args={[RAIL_WIDTH, rackHeight, FRAME_THICKNESS * 0.8]} />
      </mesh>

      {/* Right Rail */}
      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS - RAIL_WIDTH / 2, rackHeight / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={railMaterial}
      >
        <boxGeometry args={[RAIL_WIDTH, rackHeight, FRAME_THICKNESS * 0.8]} />
      </mesh>

      {/* Top Cross Beams */}
      {/* Front Top */}
      <mesh
        position={[0, rackHeight - FRAME_THICKNESS / 2, RACK_DEPTH / 2 - FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Rear Top */}
      <mesh
        position={[0, rackHeight - FRAME_THICKNESS / 2, -(RACK_DEPTH / 2) + FRAME_THICKNESS / 2]}
        material={frameMaterial}
      >
        <boxGeometry args={[RACK_WIDTH, FRAME_THICKNESS, FRAME_THICKNESS]} />
      </mesh>

      {/* Side Top Beams */}
      <mesh
        position={[-(RACK_WIDTH / 2) + FRAME_THICKNESS / 2, rackHeight - FRAME_THICKNESS / 2, 0]}
        material={frameMaterial}
      >
        <boxGeometry args={[FRAME_THICKNESS, FRAME_THICKNESS, RACK_DEPTH - FRAME_THICKNESS * 2]} />
      </mesh>

      <mesh
        position={[(RACK_WIDTH / 2) - FRAME_THICKNESS / 2, rackHeight - FRAME_THICKNESS / 2, 0]}
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
      <mesh position={[0, rackHeight / 2, -(RACK_DEPTH / 2) + 0.005]}>
        <planeGeometry args={[RACK_WIDTH - FRAME_THICKNESS * 2, rackHeight - FRAME_THICKNESS]} />
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

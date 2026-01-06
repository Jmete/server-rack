'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useRackStore, useUIStore } from '@/stores';
import { RACK_CONSTANTS, FRAME_THICKNESS_MM, mmToScene, uToScene } from '@/constants';
import { SLOT_START_OFFSET } from './Rack';

const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RAIL_WIDTH = mmToScene(RACK_CONSTANTS.RAIL_WIDTH_MM);
const RACK_WIDTH = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);

export function RackHoverHighlight() {
  const rackHover = useUIStore((state) => state.rackHover);
  const rackDepthMm = useRackStore((state) => state.rack.config.depth);

  const highlight = useMemo(() => {
    if (!rackHover) return null;

    const rackDepth = mmToScene(rackDepthMm);
    const railFrontZ = rackDepth / 2 - FRAME_THICKNESS / 2 + (FRAME_THICKNESS * 0.8) / 2;
    const width = RACK_WIDTH - FRAME_THICKNESS * 2 - RAIL_WIDTH * 2;
    const height = uToScene(rackHover.count);
    const y = SLOT_START_OFFSET + uToScene(rackHover.start - 1) + height / 2;
    const z = railFrontZ + mmToScene(0.4);
    const color = rackHover.valid ? '#22c55e' : '#ef4444';

    return { width, height, y, z, color };
  }, [rackHover, rackDepthMm]);

  if (!highlight) return null;

  return (
    <mesh position={[0, highlight.y, highlight.z]} renderOrder={2}>
      <planeGeometry args={[highlight.width, highlight.height]} />
      <meshBasicMaterial
        color={highlight.color}
        transparent
        opacity={0.28}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

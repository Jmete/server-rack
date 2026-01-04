'use client';

import { Canvas } from '@react-three/fiber';
import { Scene } from '@/components/three/Scene';
import { RackDropZones } from '@/components/dnd/RackDropZones';
import { RackEquipmentOverlay } from '@/components/dnd/RackEquipmentOverlay';

export function Viewport() {
  return (
    <div className="relative w-full h-full bg-zinc-900">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      <RackEquipmentOverlay />
      <RackDropZones />
    </div>
  );
}

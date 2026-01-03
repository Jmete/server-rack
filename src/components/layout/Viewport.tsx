'use client';

import { Canvas } from '@react-three/fiber';
import { Scene } from '@/components/three/Scene';

export function Viewport() {
  return (
    <div className="w-full h-full bg-zinc-900">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

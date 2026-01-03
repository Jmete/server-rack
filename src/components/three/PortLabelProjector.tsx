'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortStore, useUIStore } from '@/stores';

export function PortLabelProjector() {
  const portPositions = usePortStore((state) => state.positions);
  const setPortScreenPositions = useUIStore((state) => state.setPortScreenPositions);
  const exportGeneration = useUIStore((state) => state.exportGeneration);
  const { camera, size } = useThree();
  const last = useRef<{ id: string; x: number; y: number }[] | null>(null);
  const lastExportGeneration = useRef(exportGeneration);

  useFrame(() => {
    const entries = Object.entries(portPositions);
    if (entries.length === 0) {
      if (last.current !== null) {
        last.current = null;
        setPortScreenPositions(null);
      }
      return;
    }

    const next = entries.map(([id, position]) => {
      const point = new THREE.Vector3(...position).project(camera);
      return {
        id,
        x: (point.x * 0.5 + 0.5) * size.width,
        y: (-point.y * 0.5 + 0.5) * size.height,
      };
    });

    const prev = last.current;
    let changed = !prev || prev.length !== next.length;
    if (!changed && prev) {
      for (let i = 0; i < next.length; i++) {
        const a = prev[i];
        const b = next[i];
        if (a.id !== b.id || Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5) {
          changed = true;
          break;
        }
      }
    }

    const generationChanged = exportGeneration !== lastExportGeneration.current;
    if (generationChanged || changed) {
      last.current = next;
      lastExportGeneration.current = exportGeneration;
      setPortScreenPositions(next);
    }
  });

  return null;
}

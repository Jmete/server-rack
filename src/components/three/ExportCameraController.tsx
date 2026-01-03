'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRackStore, useUIStore } from '@/stores';
import { FRAME_THICKNESS_MM, RACK_CONSTANTS, RACK_DEPTH_MM, mmToScene, uToScene } from '@/constants';

export function ExportCameraController() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const isExporting = useUIStore((state) => state.isExporting);
  const setExportCameraReady = useUIStore((state) => state.setExportCameraReady);
  const bumpExportGeneration = useUIStore((state) => state.bumpExportGeneration);
  const { camera, size } = useThree();
  const controls = useThree((state) => state.controls) as { target?: THREE.Vector3; update?: () => void } | undefined;
  const previous = useRef<{ position: THREE.Vector3; target?: THREE.Vector3 } | null>(null);
  const framesSinceExport = useRef(0);

  useEffect(() => {
    if (!isExporting) {
      setExportCameraReady(false);
      if (previous.current) {
        const { position, target } = previous.current;
        camera.position.copy(position);
        if (controls?.target && target) {
          controls.target.copy(target);
          controls.update?.();
        } else {
          camera.lookAt(target ?? new THREE.Vector3());
        }
        previous.current = null;
      }
      return;
    }

    setExportCameraReady(false);
    framesSinceExport.current = 0;

    const frameThickness = mmToScene(FRAME_THICKNESS_MM);
    const rackWidth = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
    const slotsHeight = uToScene(rackSize);
    const totalHeight = slotsHeight + frameThickness * 2;
    const target = new THREE.Vector3(0, totalHeight / 2, 0);

    const perspective = camera as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(perspective.fov);
    const aspect = size.width / size.height;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const viewportFill = 0.75;
    const heightDistance = (totalHeight / 2) / (Math.tan(vFov / 2) * viewportFill);
    const widthDistance = (rackWidth / 2) / (Math.tan(hFov / 2) * viewportFill);
    const rackDepth = mmToScene(RACK_DEPTH_MM);
    const distance = (Math.max(heightDistance, widthDistance) + rackDepth / 2) * 1.05;

    previous.current = {
      position: camera.position.clone(),
      target: controls?.target?.clone(),
    };

    camera.position.set(0, target.y, distance);
    camera.lookAt(target);
    if (controls?.target) {
      controls.target.copy(target);
      controls.update?.();
    }

    bumpExportGeneration();
  }, [camera, controls, isExporting, rackSize, size.height, size.width]);

  useFrame(() => {
    if (!isExporting) return;
    framesSinceExport.current += 1;
    if (framesSinceExport.current === 3) {
      setExportCameraReady(true);
    }
  });

  return null;
}

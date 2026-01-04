'use client';

import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Rack } from './Rack';
import { Equipment } from './Equipment';
import { RackDropBounds } from './RackDropBounds';
import { RackHoverHighlight } from './RackHoverHighlight';
import { CableManager } from './cables/CableManager';
import { PortLabelProjector } from './PortLabelProjector';
import { ExportCameraController } from './ExportCameraController';
import { useRackStore, useUIStore } from '@/stores';
import { FRAME_THICKNESS_MM, RACK_CONSTANTS, RACK_DEPTH_MM, mmToScene, uToScene } from '@/constants';

function InitialCameraSetup() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const { camera, size } = useThree();
  const controls = useThree((state) => state.controls) as { target?: THREE.Vector3; update?: () => void } | undefined;
  const initialized = useRef(false);

  // Use useFrame to wait for controls to be ready
  useFrame(() => {
    if (initialized.current) return;
    if (!controls?.target) return; // Wait for controls to be available

    initialized.current = true;

    // Calculate front view position (same logic as export)
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

    camera.position.set(0, target.y, distance);
    camera.lookAt(target);
    controls.target.copy(target);
    controls.update?.();
  });

  return null;
}

export function Scene() {
  const equipment = useRackStore((state) => state.equipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const selectEquipment = useUIStore((state) => state.selectEquipment);
  const clearSelection = useUIStore((state) => state.clearSelection);
  const isExporting = useUIStore((state) => state.isExporting);

  const handleBackgroundClick = () => {
    clearSelection();
  };

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.5}
        maxDistance={30}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.9, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Grid Floor - click to deselect */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={handleBackgroundClick}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {!isExporting && (
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}

      {/* Server Rack */}
      <Rack />
      <RackDropBounds />
      <RackHoverHighlight />
      <PortLabelProjector />
      <ExportCameraController />
      <InitialCameraSetup />

      {/* Equipment in Rack */}
      {equipment.map((eq) => (
        <Equipment
          key={eq.instanceId}
          equipment={eq}
          isSelected={eq.instanceId === selectedEquipmentId}
          onClick={() => selectEquipment(eq.instanceId)}
        />
      ))}

      {/* Cables */}
      <CableManager />
    </>
  );
}

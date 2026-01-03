'use client';

import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Rack } from './Rack';
import { Equipment } from './Equipment';
import { RackDropBounds } from './RackDropBounds';
import { RackHoverHighlight } from './RackHoverHighlight';
import { useRackStore, useUIStore } from '@/stores';

export function Scene() {
  const equipment = useRackStore((state) => state.equipment);
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const selectEquipment = useUIStore((state) => state.selectEquipment);

  const handleBackgroundClick = () => {
    selectEquipment(null);
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

      {/* Server Rack */}
      <Rack />
      <RackDropBounds />
      <RackHoverHighlight />

      {/* Equipment in Rack */}
      {equipment.map((eq) => (
        <Equipment
          key={eq.instanceId}
          equipment={eq}
          isSelected={eq.instanceId === selectedEquipmentId}
          onClick={() => selectEquipment(eq.instanceId)}
        />
      ))}
    </>
  );
}

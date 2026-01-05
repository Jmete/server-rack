'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { mmToScene } from '@/constants';
import { createCatenaryPoints } from '@/lib/catenary';

interface CableProps {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  route?: [number, number, number][];
  color: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  tension?: number;
  directLength?: number;
  length?: number;
}

function lightenColor(hex: string, amount: number) {
  const base = new THREE.Color(hex);
  const target = new THREE.Color('#ffffff');
  return base.lerp(target, amount).getStyle();
}

export function Cable({
  id,
  start,
  end,
  route,
  color,
  isSelected,
  onSelect,
  tension,
  directLength,
  length,
}: CableProps) {
  const { geometry, startPlug, endPlug, startQuaternion, endQuaternion } = useMemo(() => {
    const segments = 48;
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const fallbackDirect = startVec.distanceTo(endVec);
    const direct = directLength ?? fallbackDirect;
    const routePoints = (route ?? [start, end]).map((point) => new THREE.Vector3(...point));
    const pathLength = routePoints.reduce((total, point, index) => {
      if (index === 0) return 0;
      return total + point.distanceTo(routePoints[index - 1]);
    }, 0);
    const desired = Math.max(length ?? direct, pathLength);
    const slackFactor = pathLength > 0 ? desired / pathLength : 1;
    const sagWeight = Math.max(0, Math.min(1, (slackFactor - 1) * 1.6));
    const effectiveTension = (tension ?? mmToScene(120)) / Math.max(0.35, slackFactor);

    const totalPath = Math.max(pathLength, 0.0001);
    const segmentLengths = routePoints.slice(1).map((point, index) =>
      point.distanceTo(routePoints[index])
    );
    let remainingSegments = segments;

    const points: THREE.Vector3[] = [];
    routePoints.slice(1).forEach((endPoint, index) => {
      const startPoint = routePoints[index];
      const segLength = segmentLengths[index];
      const segShare = Math.max(2, Math.round((segLength / totalPath) * segments));
      const segCount = index === routePoints.length - 2 ? remainingSegments : segShare;
      remainingSegments = Math.max(0, remainingSegments - segCount);

      const sagPoints = createCatenaryPoints(
        [startPoint.x, startPoint.y, startPoint.z],
        [endPoint.x, endPoint.y, endPoint.z],
        {
          segments: segCount,
          tension: effectiveTension,
          frontOffset: 0,
        }
      );

      const straightPoints = Array.from({ length: segCount + 1 }, (_, i) => {
        const t = i / segCount;
        return new THREE.Vector3(
          THREE.MathUtils.lerp(startPoint.x, endPoint.x, t),
          THREE.MathUtils.lerp(startPoint.y, endPoint.y, t),
          THREE.MathUtils.lerp(startPoint.z, endPoint.z, t)
        );
      });

      const blended = straightPoints.map((point, idx) =>
        point.clone().lerp(sagPoints[idx] ?? point, sagWeight)
      );

      blended.forEach((point, idx) => {
        if (points.length === 0 || idx > 0) {
          points.push(point);
        }
      });
    });

    if (points.length === 0) {
      points.push(startVec, endVec);
    }

    const curveSegments = Math.max(segments, points.length * 2);
    const curve = new THREE.CatmullRomCurve3(points);
    const radius = mmToScene(1.2);
    const tube = new THREE.TubeGeometry(curve, curveSegments, radius, 8, false);

    const axis = new THREE.Vector3(0, 1, 0);
    const startTangent = curve.getTangent(0).normalize();
    const endTangent = curve.getTangent(1).normalize();
    const startQuat = new THREE.Quaternion().setFromUnitVectors(axis, startTangent);
    const endQuat = new THREE.Quaternion().setFromUnitVectors(axis, endTangent);

    const plugLength = mmToScene(6);
    const startPlugPos = startVec.clone().add(startTangent.clone().multiplyScalar(plugLength / 2));
    const endPlugPos = endVec.clone().sub(endTangent.clone().multiplyScalar(plugLength / 2));

    return {
      geometry: tube,
      startQuaternion: startQuat,
      endQuaternion: endQuat,
      startPlug: { position: startPlugPos, length: plugLength },
      endPlug: { position: endPlugPos, length: plugLength },
    };
  }, [start, end, route, tension, directLength, length]);

  const displayColor = isSelected ? lightenColor(color, 0.35) : color;

  return (
    <group
      renderOrder={10}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial color={displayColor} roughness={0.6} metalness={0.2} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={startPlug.position} quaternion={startQuaternion}>
        <boxGeometry args={[mmToScene(2.6), startPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={endPlug.position} quaternion={endQuaternion}>
        <boxGeometry args={[mmToScene(2.6), endPlug.length, mmToScene(3.2)]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

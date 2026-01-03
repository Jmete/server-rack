'use client';

import * as THREE from 'three';

interface CatenaryOptions {
  segments?: number;
  tension?: number;
  frontOffset?: number;
}

export function createCatenaryPoints(
  start: [number, number, number],
  end: [number, number, number],
  { segments = 48, tension = 0.6, frontOffset = 0 }: CatenaryOptions = {}
): THREE.Vector3[] {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const horizontal = new THREE.Vector3(endVec.x - startVec.x, 0, endVec.z - startVec.z);
  const horizontalDist = horizontal.length();

  if (horizontalDist < 0.0001) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      points.push(
        new THREE.Vector3(
          THREE.MathUtils.lerp(startVec.x, endVec.x, t),
          THREE.MathUtils.lerp(startVec.y, endVec.y, t),
          THREE.MathUtils.lerp(startVec.z, endVec.z, t)
        )
      );
    }
    return points;
  }

  const direction = horizontal.normalize();
  const verticalDelta = endVec.y - startVec.y;
  const a = Math.max(tension, 0.0001);
  const midCosh = Math.cosh(horizontalDist / (2 * a));

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = horizontalDist * t;
    const baseY = startVec.y + verticalDelta * t;
    const sag = a * Math.cosh((x - horizontalDist / 2) / a) - a * midCosh;
    const point = startVec.clone().add(direction.clone().multiplyScalar(x));
    point.y = baseY - Math.abs(sag);
    if (frontOffset > 0) {
      point.z += frontOffset * Math.sin(Math.PI * t);
    }
    points.push(point);
  }

  return points;
}

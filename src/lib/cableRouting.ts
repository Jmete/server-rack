'use client';

import * as THREE from 'three';
import { FRAME_THICKNESS_MM, mmToScene, uToScene } from '@/constants';
import type { Equipment, RackSlot } from '@/types';
import type { ShelfItem } from '@/types/shelf';
import { getRotatedDimensions } from '@/types/shelf';

interface EquipmentBounds {
  id: string;
  min: THREE.Vector3;
  max: THREE.Vector3;
}

const EPSILON = 1e-6;

function getRailFrontZ(rackDepthMm: number) {
  const rackDepth = mmToScene(rackDepthMm);
  const frameThickness = mmToScene(FRAME_THICKNESS_MM);
  return rackDepth / 2 - frameThickness / 2 + (frameThickness * 0.8) / 2;
}

function containsPoint(bounds: EquipmentBounds, point: THREE.Vector3) {
  return (
    point.x >= bounds.min.x - EPSILON &&
    point.x <= bounds.max.x + EPSILON &&
    point.y >= bounds.min.y - EPSILON &&
    point.y <= bounds.max.y + EPSILON &&
    point.z >= bounds.min.z - EPSILON &&
    point.z <= bounds.max.z + EPSILON
  );
}

function segmentIntersectsBox(
  start: THREE.Vector3,
  end: THREE.Vector3,
  bounds: EquipmentBounds
) {
  let tMin = 0;
  let tMax = 1;
  const delta = new THREE.Vector3().subVectors(end, start);
  const min = bounds.min;
  const max = bounds.max;

  for (const axis of ['x', 'y', 'z'] as const) {
    const origin = start[axis];
    const direction = delta[axis];
    if (Math.abs(direction) < EPSILON) {
      if (origin < min[axis] || origin > max[axis]) {
        return false;
      }
      continue;
    }
    const inv = 1 / direction;
    let t1 = (min[axis] - origin) * inv;
    let t2 = (max[axis] - origin) * inv;
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
    }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }

  return true;
}

function pushPoint(points: THREE.Vector3[], point: THREE.Vector3) {
  const last = points[points.length - 1];
  if (!last || last.distanceToSquared(point) > EPSILON) {
    points.push(point);
  }
}

function computeExitPoint(
  point: THREE.Vector3,
  direction: number,
  bounds: EquipmentBounds[],
  clearance: number
) {
  const containing = bounds.find((box) => containsPoint(box, point));
  if (containing) {
    const z = direction > 0 ? containing.max.z + clearance : containing.min.z - clearance;
    return new THREE.Vector3(point.x, point.y, z);
  }
  return new THREE.Vector3(point.x, point.y, point.z + direction * clearance);
}

function getEmptyLaneCandidates(slots: RackSlot[], rackSize: number, preferredYs: number[] = []) {
  const slotHeight = uToScene(1);
  const startOffset = mmToScene(FRAME_THICKNESS_MM);
  const candidates: number[] = [];
  let runStart: number | null = null;

  const addRunCandidates = (startIndex: number, endIndex: number) => {
    const startY = startOffset + (startIndex + 0.5) * slotHeight;
    const endY = startOffset + (endIndex + 0.5) * slotHeight;
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    const midY = (startY + endY) / 2;

    candidates.push(startY, endY, midY);

    preferredYs.forEach((prefY) => {
      const clamped = Math.min(maxY, Math.max(minY, prefY));
      candidates.push(clamped);
    });
  };

  for (let i = 0; i < slots.length; i++) {
    if (!slots[i].occupied) {
      if (runStart === null) runStart = i;
      continue;
    }
    if (runStart !== null) {
      addRunCandidates(runStart, i - 1);
      runStart = null;
    }
  }

  if (runStart !== null) {
    addRunCandidates(runStart, slots.length - 1);
  }

  const topLane = startOffset + rackSize * slotHeight + slotHeight * 0.75;
  const bottomLane = startOffset - slotHeight * 0.75;
  candidates.push(topLane, bottomLane);

  return Array.from(new Set(candidates));
}

export function buildEquipmentBounds(
  equipment: Equipment[],
  rackDepthMm: number,
  padding = mmToScene(2)
): EquipmentBounds[] {
  const rackDepth = mmToScene(rackDepthMm);
  const frameThickness = mmToScene(FRAME_THICKNESS_MM);
  const slotStart = frameThickness;
  const railFrontZ = getRailFrontZ(rackDepthMm);

  return equipment.map((item) => {
    const width = mmToScene(item.width);
    const height = uToScene(item.heightU);
    const depth = mmToScene(item.depth);
    const centerY = slotStart + uToScene(item.slotPosition - 1) + height / 2;
    const centerZ = railFrontZ - depth / 2;
    const min = new THREE.Vector3(
      -width / 2 - padding,
      centerY - height / 2 - padding,
      centerZ - depth / 2 - padding
    );
    const max = new THREE.Vector3(
      width / 2 + padding,
      centerY + height / 2 + padding,
      centerZ + depth / 2 + padding
    );
    return { id: item.instanceId, min, max };
  });
}

// Build equipment bounds including shelf items for cable routing
export function buildEquipmentBoundsWithShelfItems(
  equipment: Equipment[],
  shelfItemsMap: Record<string, ShelfItem[]>,
  rackDepthMm: number,
  padding = mmToScene(2)
): EquipmentBounds[] {
  // Start with standard equipment bounds
  const bounds = buildEquipmentBounds(equipment, rackDepthMm, padding);

  const frameThickness = mmToScene(FRAME_THICKNESS_MM);
  const slotStart = frameThickness;
  const railFrontZ = getRailFrontZ(rackDepthMm);

  // Add bounds for each shelf item
  for (const shelf of equipment) {
    if (shelf.type !== 'shelf') continue;

    const shelfItems = shelfItemsMap[shelf.instanceId] || [];
    if (shelfItems.length === 0) continue;

    // Calculate shelf position
    const shelfDepthMm = Math.min(shelf.depth, rackDepthMm - 50);
    const shelfWidth = mmToScene(shelf.width);
    const shelfHeight = uToScene(shelf.heightU);
    const shelfTopY = slotStart + uToScene(shelf.slotPosition - 1) + shelfHeight;
    const shelfCenterZ = railFrontZ - mmToScene(shelfDepthMm) / 2;
    const shelfFrontZ = shelfCenterZ + mmToScene(shelfDepthMm) / 2;

    // Usable area offsets (matching RackShelf.tsx)
    const railMargin = mmToScene(20); // SHELF_RAIL_MARGIN_MM
    const frontMargin = mmToScene(10); // SHELF_FRONT_MARGIN_MM
    const usableStartX = -shelfWidth / 2 + railMargin;
    const usableStartZ = shelfFrontZ - frontMargin;

    for (const item of shelfItems) {
      // Get rotated dimensions
      const rotated = getRotatedDimensions(item.width, item.depth, item.position.rotation);
      const itemWidth = mmToScene(rotated.width);
      const itemDepth = mmToScene(rotated.depth);
      const itemHeight = mmToScene(item.heightMm);

      // Calculate item world position
      const itemX = usableStartX + mmToScene(item.position.x) + itemWidth / 2;
      const itemY = shelfTopY + itemHeight / 2;
      const itemZ = usableStartZ - mmToScene(item.position.z) - itemDepth / 2;

      const min = new THREE.Vector3(
        itemX - itemWidth / 2 - padding,
        itemY - itemHeight / 2 - padding,
        itemZ - itemDepth / 2 - padding
      );
      const max = new THREE.Vector3(
        itemX + itemWidth / 2 + padding,
        itemY + itemHeight / 2 + padding,
        itemZ + itemDepth / 2 + padding
      );

      bounds.push({ id: item.instanceId, min, max });
    }
  }

  return bounds;
}

function computeRouteLength(points: THREE.Vector3[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += points[i].distanceTo(points[i - 1]);
  }
  return total;
}

export function computeCableRoute({
  start,
  end,
  equipmentBounds,
  rackDepthMm,
  rackSize,
  rackSlots,
  clearance = mmToScene(6),
  exitClearance = mmToScene(8),
  startSide,
  endSide,
}: {
  start: [number, number, number];
  end: [number, number, number];
  equipmentBounds: EquipmentBounds[];
  rackDepthMm: number;
  rackSize: number;
  rackSlots: RackSlot[];
  clearance?: number;
  exitClearance?: number;
  startSide?: 'front' | 'back';
  endSide?: 'front' | 'back';
}): [number, number, number][] {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const rackDepth = mmToScene(rackDepthMm);
  const rackBackZ = -rackDepth / 2;
  const railFrontZ = getRailFrontZ(rackDepthMm);

  const maxZ =
    equipmentBounds.length > 0
      ? Math.max(...equipmentBounds.map((b) => b.max.z))
      : railFrontZ;
  const minZ =
    equipmentBounds.length > 0
      ? Math.min(...equipmentBounds.map((b) => b.min.z))
      : rackBackZ;

  const frontLaneZ = maxZ + clearance;
  const backLaneZ = minZ - clearance;

  const resolvedStartSide = startSide ?? (startVec.z >= 0 ? 'front' : 'back');
  const resolvedEndSide = endSide ?? (endVec.z >= 0 ? 'front' : 'back');
  const startLaneZ = resolvedStartSide === 'front' ? frontLaneZ : backLaneZ;
  const endLaneZ = resolvedEndSide === 'front' ? frontLaneZ : backLaneZ;

  const startExit = computeExitPoint(
    startVec,
    resolvedStartSide === 'front' ? 1 : -1,
    equipmentBounds,
    exitClearance
  );
  const endExit = computeExitPoint(
    endVec,
    resolvedEndSide === 'front' ? 1 : -1,
    equipmentBounds,
    exitClearance
  );

  const ignored = equipmentBounds.filter(
    (box) => containsPoint(box, startVec) || containsPoint(box, endVec)
  );

  const preferredYs = [startVec.y, endVec.y, (startVec.y + endVec.y) / 2];
  const candidates = getEmptyLaneCandidates(rackSlots, rackSize, preferredYs);
  const midX = (startVec.x + endVec.x) / 2;
  let bestRoute: THREE.Vector3[] | null = null;
  let bestLength = Infinity;

  const isRouteClear = (points: THREE.Vector3[]) => {
    for (let i = 0; i < points.length - 1; i++) {
      const segStart = points[i];
      const segEnd = points[i + 1];
      for (const box of equipmentBounds) {
        if (ignored.includes(box)) continue;
        if (segmentIntersectsBox(segStart, segEnd, box)) {
          return false;
        }
      }
    }
    return true;
  };

  if (resolvedStartSide === resolvedEndSide) {
    const direct: THREE.Vector3[] = [];
    pushPoint(direct, startVec);
    pushPoint(direct, startExit);
    pushPoint(direct, new THREE.Vector3(startExit.x, startExit.y, startLaneZ));
    pushPoint(direct, new THREE.Vector3(endExit.x, endExit.y, endLaneZ));
    pushPoint(direct, endExit);
    pushPoint(direct, endVec);

    if (isRouteClear(direct)) {
      return direct.map((point) => [point.x, point.y, point.z]);
    }
  }

  for (const yLane of candidates) {
    const points: THREE.Vector3[] = [];
    pushPoint(points, startVec);
    pushPoint(points, startExit);
    pushPoint(points, new THREE.Vector3(startExit.x, startExit.y, startLaneZ));
    pushPoint(points, new THREE.Vector3(startExit.x, yLane, startLaneZ));

    if (startLaneZ !== endLaneZ) {
      pushPoint(points, new THREE.Vector3(midX, yLane, startLaneZ));
      pushPoint(points, new THREE.Vector3(midX, yLane, endLaneZ));
    }

    pushPoint(points, new THREE.Vector3(endExit.x, yLane, endLaneZ));
    pushPoint(points, new THREE.Vector3(endExit.x, endExit.y, endLaneZ));
    pushPoint(points, endExit);
    pushPoint(points, endVec);

    if (!isRouteClear(points)) continue;
    const length = computeRouteLength(points);
    if (length < bestLength) {
      bestLength = length;
      bestRoute = points;
    }
  }

  const route =
    bestRoute ??
    [
      startVec,
      startExit,
      new THREE.Vector3(startExit.x, startExit.y, startLaneZ),
      new THREE.Vector3(endExit.x, endExit.y, endLaneZ),
      endExit,
      endVec,
    ];

  return route.map((point) => [point.x, point.y, point.z]);
}

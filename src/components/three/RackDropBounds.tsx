'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRackStore, useUIStore } from '@/stores';
import { RACK_CONSTANTS, FRAME_THICKNESS_MM, RACK_DEPTH_MM, mmToScene, uToScene } from '@/constants';
import { SLOT_START_OFFSET } from './Rack';

const FRAME_THICKNESS = mmToScene(FRAME_THICKNESS_MM);
const RAIL_WIDTH = mmToScene(RACK_CONSTANTS.RAIL_WIDTH_MM);
const RACK_WIDTH = mmToScene(RACK_CONSTANTS.STANDARD_WIDTH_MM);
const RACK_DEPTH = mmToScene(RACK_DEPTH_MM);

export function RackDropBounds() {
  const rackSize = useRackStore((state) => state.rack.config.size);
  const setRackScreenBounds = useUIStore((state) => state.setRackScreenBounds);
  const setRackSlotBounds = useUIStore((state) => state.setRackSlotBounds);
  const { camera, size } = useThree();
  const lastBounds = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const lastSlotBounds = useRef<{ slotNumber: number; left: number; top: number; width: number; height: number }[] | null>(null);

  useFrame(() => {
    const slotsHeight = uToScene(rackSize);
    const slotHeight = uToScene(1);
    const left = -(RACK_WIDTH / 2) + FRAME_THICKNESS + RAIL_WIDTH;
    const right = (RACK_WIDTH / 2) - FRAME_THICKNESS - RAIL_WIDTH;
    const bottom = SLOT_START_OFFSET;
    const top = SLOT_START_OFFSET + slotsHeight;
    const z = RACK_DEPTH / 2 - FRAME_THICKNESS / 2;

    const boundaryYs: number[] = [];
    for (let i = 0; i <= rackSize; i++) {
      const y = SLOT_START_OFFSET + i * slotHeight;
      const point = new THREE.Vector3(0, y, z).project(camera);
      boundaryYs.push((-point.y * 0.5 + 0.5) * size.height);
    }

    const slotBounds = [];
    for (let slotNumber = 1; slotNumber <= rackSize; slotNumber++) {
      const bottomY = boundaryYs[slotNumber - 1];
      const topY = boundaryYs[slotNumber];
      const yCenter = SLOT_START_OFFSET + (slotNumber - 0.5) * slotHeight;
      const leftPoint = new THREE.Vector3(left, yCenter, z).project(camera);
      const rightPoint = new THREE.Vector3(right, yCenter, z).project(camera);
      const leftX = (leftPoint.x * 0.5 + 0.5) * size.width;
      const rightX = (rightPoint.x * 0.5 + 0.5) * size.width;
      const slotLeft = Math.min(leftX, rightX);
      const slotWidth = Math.max(0, Math.abs(rightX - leftX));
      const slotTop = Math.min(bottomY, topY);
      const slotHeightPx = Math.max(0, Math.abs(bottomY - topY));

      slotBounds.push({
        slotNumber,
        left: slotLeft,
        top: slotTop,
        width: slotWidth,
        height: slotHeightPx,
      });
    }

    const nextBounds = {
      left: Math.min(...slotBounds.map((b) => b.left)),
      top: Math.min(...slotBounds.map((b) => b.top)),
      width: Math.max(...slotBounds.map((b) => b.left + b.width)) - Math.min(...slotBounds.map((b) => b.left)),
      height: Math.max(...slotBounds.map((b) => b.top + b.height)) - Math.min(...slotBounds.map((b) => b.top)),
    };

    const prev = lastBounds.current;
    if (
      !prev ||
      Math.abs(prev.left - nextBounds.left) > 0.5 ||
      Math.abs(prev.top - nextBounds.top) > 0.5 ||
      Math.abs(prev.width - nextBounds.width) > 0.5 ||
      Math.abs(prev.height - nextBounds.height) > 0.5
    ) {
      lastBounds.current = nextBounds;
      setRackScreenBounds(nextBounds);
    }

    const prevSlots = lastSlotBounds.current;
    let slotChanged = !prevSlots || prevSlots.length !== slotBounds.length;
    if (!slotChanged && prevSlots) {
      for (let i = 0; i < slotBounds.length; i++) {
        const prevSlot = prevSlots[i];
        const nextSlot = slotBounds[i];
        if (
          Math.abs(prevSlot.left - nextSlot.left) > 0.5 ||
          Math.abs(prevSlot.top - nextSlot.top) > 0.5 ||
          Math.abs(prevSlot.width - nextSlot.width) > 0.5 ||
          Math.abs(prevSlot.height - nextSlot.height) > 0.5
        ) {
          slotChanged = true;
          break;
        }
      }
    }

    if (slotChanged) {
      lastSlotBounds.current = slotBounds;
      setRackSlotBounds(slotBounds);
    }
  });

  return null;
}

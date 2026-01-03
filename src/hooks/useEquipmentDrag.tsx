'use client';

import { useCallback } from 'react';
import { getEquipmentById } from '@/constants';
import { useRackStore } from '@/stores';

export function useEquipmentDrag() {
  const rack = useRackStore((state) => state.rack);
  const addEquipment = useRackStore((state) => state.addEquipment);

  const findNextAvailableSlot = useCallback(
    (heightU: number): number | null => {
      for (let i = 1; i <= rack.config.size - heightU + 1; i++) {
        let available = true;
        for (let j = 0; j < heightU; j++) {
          const slot = rack.slots[i - 1 + j];
          if (slot.occupied) {
            available = false;
            break;
          }
        }
        if (available) return i;
      }
      return null;
    },
    [rack]
  );

  const addEquipmentById = useCallback(
    (equipmentId: string, slotPosition: number) => {
      const definition = getEquipmentById(equipmentId);
      if (!definition) return false;
      return addEquipment(definition, slotPosition);
    },
    [addEquipment]
  );

  return { findNextAvailableSlot, addEquipmentById };
}

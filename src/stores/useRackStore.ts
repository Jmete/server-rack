import { create } from 'zustand';
import {
  Rack,
  RackConfig,
  Equipment,
  EquipmentDefinition,
  createDefaultRack,
  createRackSlots,
  createEquipmentInstance,
} from '@/types';
import { useConnectionStore } from './useConnectionStore';
import { MIN_RACK_SIZE, MAX_RACK_SIZE, MIN_DEPTH_INCHES, MAX_DEPTH_INCHES, INCH_TO_MM } from '@/constants';

interface RackState {
  rack: Rack;
  equipment: Equipment[];

  // Rack configuration actions
  setRackSize: (size: number) => void;
  setRackDepth: (depthInches: number) => void;
  setRackName: (name: string) => void;
  setRackConfig: (config: Partial<RackConfig>) => void;

  // Equipment actions
  addEquipment: (definition: EquipmentDefinition, slotPosition: number) => boolean;
  removeEquipment: (instanceId: string) => void;
  moveEquipment: (instanceId: string, newPosition: number) => boolean;
  updateEquipment: (instanceId: string, updates: Partial<Equipment>) => void;
  swapEquipment: (firstId: string, secondId: string) => boolean;

  // Utility actions
  clearRack: () => void;
  canPlaceEquipment: (
    heightU: number,
    slotPosition: number,
    excludeInstanceIds?: string | string[]
  ) => boolean;
  getEquipmentAtSlot: (slotPosition: number) => Equipment | undefined;

  // Import/Export
  importConfig: (rack: Rack, equipment: Equipment[]) => void;
  exportConfig: () => { rack: Rack; equipment: Equipment[] };
}

export const useRackStore = create<RackState>((set, get) => ({
  rack: createDefaultRack(),
  equipment: [],

  setRackSize: (size: number) => {
    // Clamp size to valid range
    const clampedSize = Math.max(MIN_RACK_SIZE, Math.min(MAX_RACK_SIZE, Math.round(size)));
    set((state) => ({
      rack: {
        ...state.rack,
        config: { ...state.rack.config, size: clampedSize },
        slots: createRackSlots(clampedSize),
      },
      // Remove equipment that no longer fits
      equipment: state.equipment.filter(
        (eq) => eq.slotPosition + eq.heightU - 1 <= clampedSize
      ),
    }));
  },

  setRackDepth: (depthInches: number) => {
    // Clamp depth to valid range and convert to mm
    const clampedDepth = Math.max(MIN_DEPTH_INCHES, Math.min(MAX_DEPTH_INCHES, depthInches));
    const depthMm = Math.round(clampedDepth * INCH_TO_MM);
    set((state) => ({
      rack: {
        ...state.rack,
        config: { ...state.rack.config, depth: depthMm },
      },
    }));
  },

  setRackName: (name: string) => {
    set((state) => ({
      rack: {
        ...state.rack,
        config: { ...state.rack.config, name },
      },
    }));
  },

  setRackConfig: (config: Partial<RackConfig>) => {
    set((state) => ({
      rack: {
        ...state.rack,
        config: { ...state.rack.config, ...config },
      },
    }));
  },

  addEquipment: (definition: EquipmentDefinition, slotPosition: number) => {
    const state = get();

    // Check if equipment can be placed
    if (!state.canPlaceEquipment(definition.heightU, slotPosition)) {
      return false;
    }

    const instance = createEquipmentInstance(definition, slotPosition);

    set((state) => {
      // Update slots
      const newSlots = [...state.rack.slots];
      for (let i = 0; i < definition.heightU; i++) {
        const slotIndex = slotPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            occupied: true,
            equipmentId: instance.instanceId,
          };
        }
      }

      return {
        rack: { ...state.rack, slots: newSlots },
        equipment: [...state.equipment, instance],
      };
    });

    return true;
  },

  removeEquipment: (instanceId: string) => {
    useConnectionStore.getState().removeCablesForEquipment(instanceId);
    set((state) => {
      const equipment = state.equipment.find((e) => e.instanceId === instanceId);
      if (!equipment) return state;

      // Update slots
      const newSlots = [...state.rack.slots];
      for (let i = 0; i < equipment.heightU; i++) {
        const slotIndex = equipment.slotPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            occupied: false,
            equipmentId: null,
          };
        }
      }

      return {
        rack: { ...state.rack, slots: newSlots },
        equipment: state.equipment.filter((e) => e.instanceId !== instanceId),
      };
    });
  },

  moveEquipment: (instanceId: string, newPosition: number) => {
    const state = get();
    const equipment = state.equipment.find((e) => e.instanceId === instanceId);

    if (!equipment) return false;
    if (!state.canPlaceEquipment(equipment.heightU, newPosition, instanceId)) {
      return false;
    }

    set((state) => {
      const eq = state.equipment.find((e) => e.instanceId === instanceId)!;

      // Clear old slots
      const newSlots = [...state.rack.slots];
      for (let i = 0; i < eq.heightU; i++) {
        const slotIndex = eq.slotPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            occupied: false,
            equipmentId: null,
          };
        }
      }

      // Set new slots
      for (let i = 0; i < eq.heightU; i++) {
        const slotIndex = newPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            occupied: true,
            equipmentId: instanceId,
          };
        }
      }

      return {
        rack: { ...state.rack, slots: newSlots },
        equipment: state.equipment.map((e) =>
          e.instanceId === instanceId
            ? { ...e, slotPosition: newPosition }
            : e
        ),
      };
    });

    return true;
  },

  updateEquipment: (instanceId: string, updates: Partial<Equipment>) => {
    set((state) => ({
      equipment: state.equipment.map((e) =>
        e.instanceId === instanceId ? { ...e, ...updates } : e
      ),
    }));
  },

  swapEquipment: (firstId: string, secondId: string) => {
    const state = get();
    if (firstId === secondId) return false;

    const first = state.equipment.find((e) => e.instanceId === firstId);
    const second = state.equipment.find((e) => e.instanceId === secondId);
    if (!first || !second) return false;

    const firstNewPosition = second.slotPosition;
    const secondNewPosition = first.slotPosition;
    const firstRange = {
      start: firstNewPosition,
      end: firstNewPosition + first.heightU - 1,
    };
    const secondRange = {
      start: secondNewPosition,
      end: secondNewPosition + second.heightU - 1,
    };

    const rangesOverlap = !(firstRange.end < secondRange.start || secondRange.end < firstRange.start);
    if (rangesOverlap) return false;

    const excludeIds = [first.instanceId, second.instanceId];
    if (!state.canPlaceEquipment(first.heightU, firstNewPosition, excludeIds)) return false;
    if (!state.canPlaceEquipment(second.heightU, secondNewPosition, excludeIds)) return false;

    set((state) => {
      const newSlots = [...state.rack.slots];

      for (let i = 0; i < first.heightU; i++) {
        const slotIndex = first.slotPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = { ...newSlots[slotIndex], occupied: false, equipmentId: null };
        }
      }
      for (let i = 0; i < second.heightU; i++) {
        const slotIndex = second.slotPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = { ...newSlots[slotIndex], occupied: false, equipmentId: null };
        }
      }

      for (let i = 0; i < first.heightU; i++) {
        const slotIndex = firstNewPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = { ...newSlots[slotIndex], occupied: true, equipmentId: first.instanceId };
        }
      }
      for (let i = 0; i < second.heightU; i++) {
        const slotIndex = secondNewPosition - 1 + i;
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = { ...newSlots[slotIndex], occupied: true, equipmentId: second.instanceId };
        }
      }

      return {
        rack: { ...state.rack, slots: newSlots },
        equipment: state.equipment.map((e) => {
          if (e.instanceId === first.instanceId) {
            return { ...e, slotPosition: firstNewPosition };
          }
          if (e.instanceId === second.instanceId) {
            return { ...e, slotPosition: secondNewPosition };
          }
          return e;
        }),
      };
    });

    return true;
  },

  clearRack: () => {
    set((state) => ({
      rack: {
        ...state.rack,
        slots: createRackSlots(state.rack.config.size),
      },
      equipment: [],
    }));
  },

  canPlaceEquipment: (heightU: number, slotPosition: number, excludeInstanceIds?: string | string[]) => {
    const state = get();
    const { rack } = state;
    const excludeList = Array.isArray(excludeInstanceIds)
      ? excludeInstanceIds
      : excludeInstanceIds
      ? [excludeInstanceIds]
      : [];

    // Check bounds
    if (slotPosition < 1 || slotPosition + heightU - 1 > rack.config.size) {
      return false;
    }

    // Check for overlapping equipment
    for (let i = 0; i < heightU; i++) {
      const slot = rack.slots[slotPosition - 1 + i];
      if (slot.occupied && !excludeList.includes(slot.equipmentId ?? '')) {
        return false;
      }
    }

    return true;
  },

  getEquipmentAtSlot: (slotPosition: number) => {
    const state = get();
    const slot = state.rack.slots[slotPosition - 1];
    if (!slot || !slot.equipmentId) return undefined;
    return state.equipment.find((e) => e.instanceId === slot.equipmentId);
  },

  importConfig: (rack: Rack, equipment: Equipment[]) => {
    set({ rack, equipment });
  },

  exportConfig: () => {
    const state = get();
    return {
      rack: state.rack,
      equipment: state.equipment,
    };
  },
}));

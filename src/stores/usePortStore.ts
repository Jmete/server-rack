import { create } from 'zustand';
import type { PortType } from '@/types';

interface PortState {
  positions: Record<string, [number, number, number]>;
  types: Record<string, PortType>;
  setPortPosition: (id: string, position: [number, number, number]) => void;
  registerPort: (id: string, type: PortType) => void;
  unregisterPort: (id: string) => void;
}

export const usePortStore = create<PortState>((set) => ({
  positions: {},
  types: {},
  setPortPosition: (id, position) => {
    set((state) => ({
      positions: { ...state.positions, [id]: position },
    }));
  },
  registerPort: (id, type) => {
    set((state) => ({
      types: { ...state.types, [id]: type },
    }));
  },
  unregisterPort: (id) => {
    set((state) => {
      const { [id]: _pos, ...positions } = state.positions;
      const { [id]: _type, ...types } = state.types;
      return { positions, types };
    });
  },
}));

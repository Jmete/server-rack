import { create } from 'zustand';
import {
  Cable,
  CableType,
  CableColor,
  CABLE_COLORS,
  canConnect,
  createCable,
  ConnectionMode,
} from '@/types';
import { usePortStore } from './usePortStore';

interface ConnectionState {
  cables: Cable[];
  connectionMode: ConnectionMode;

  // Connection mode actions
  startConnection: (portId: string) => void;
  completeConnection: (portId: string) => Cable | null;
  cancelConnection: () => void;
  setConnectionActive: (active: boolean) => void;
  setCableType: (type: CableType) => void;
  setCableColor: (color: CableColor) => void;

  // Cable actions
  addCable: (cable: Cable) => void;
  removeCable: (cableId: string) => void;
  removeCablesForEquipment: (equipmentInstanceId: string) => void;
  updateCable: (cableId: string, updates: Partial<Cable>) => void;
  getCablesForPort: (portId: string) => Cable[];

  // Import/Export
  importCables: (cables: Cable[]) => void;
  exportCables: () => Cable[];
  clearCables: () => void;
}

const defaultConnectionMode: ConnectionMode = {
  active: false,
  sourcePortId: null,
  cableType: 'ethernet-cat6',
  cableColor: CABLE_COLORS[0], // Blue
};

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  cables: [],
  connectionMode: defaultConnectionMode,

  startConnection: (portId: string) => {
    set((state) => ({
      connectionMode: {
        ...state.connectionMode,
        active: true,
        sourcePortId: portId,
      },
    }));
  },

  completeConnection: (portId: string) => {
    const state = get();
    const { connectionMode } = state;

    if (!connectionMode.active || !connectionMode.sourcePortId) {
      return null;
    }

    // Don't connect to self
    if (connectionMode.sourcePortId === portId) {
      return null;
    }

    const portStore = usePortStore.getState();
    const portTypes = portStore.types;
    const sourceType = portTypes[connectionMode.sourcePortId];
    const targetType = portTypes[portId];
    if (!sourceType || !targetType) {
      return null;
    }

    if (!canConnect(sourceType, targetType, connectionMode.cableType)) {
      return null;
    }

    const filteredCables = state.cables.filter(
      (c) =>
        c.sourcePortId !== connectionMode.sourcePortId &&
        c.targetPortId !== connectionMode.sourcePortId &&
        c.sourcePortId !== portId &&
        c.targetPortId !== portId
    );

    const sourcePos = portStore.positions[connectionMode.sourcePortId];
    const targetPos = portStore.positions[portId];
    const directMm =
      sourcePos && targetPos
        ? Math.hypot(
            sourcePos[0] - targetPos[0],
            sourcePos[1] - targetPos[1],
            sourcePos[2] - targetPos[2]
          ) / 0.01
        : null;

    // Create the cable
    const cable = {
      ...createCable(
        connectionMode.sourcePortId,
        portId,
        connectionMode.cableType,
        connectionMode.cableColor
      ),
      length: directMm ? Math.round(directMm * 1.1) : undefined,
    };

    set((state) => ({
      cables: [...filteredCables, cable],
      connectionMode: {
        ...state.connectionMode,
        active: true,
        sourcePortId: null,
      },
    }));

    return cable;
  },

  cancelConnection: () => {
    set((state) => ({
      connectionMode: {
        ...state.connectionMode,
        active: false,
        sourcePortId: null,
      },
    }));
  },

  setConnectionActive: (active: boolean) => {
    set((state) => ({
      connectionMode: {
        ...state.connectionMode,
        active,
        sourcePortId: active ? state.connectionMode.sourcePortId : null,
      },
    }));
  },

  setCableType: (type: CableType) => {
    set((state) => ({
      connectionMode: {
        ...state.connectionMode,
        cableType: type,
      },
    }));
  },

  setCableColor: (color: CableColor) => {
    set((state) => ({
      connectionMode: {
        ...state.connectionMode,
        cableColor: color,
      },
    }));
  },

  addCable: (cable: Cable) => {
    set((state) => ({
      cables: [...state.cables, cable],
    }));
  },

  removeCable: (cableId: string) => {
    set((state) => ({
      cables: state.cables.filter((c) => c.id !== cableId),
    }));
  },

  removeCablesForEquipment: (equipmentInstanceId: string) => {
    set((state) => ({
      cables: state.cables.filter(
        (c) =>
          !c.sourcePortId.startsWith(equipmentInstanceId) &&
          !c.targetPortId.startsWith(equipmentInstanceId)
      ),
    }));
  },

  updateCable: (cableId: string, updates: Partial<Cable>) => {
    set((state) => ({
      cables: state.cables.map((c) =>
        c.id === cableId ? { ...c, ...updates } : c
      ),
    }));
  },

  getCablesForPort: (portId: string) => {
    return get().cables.filter(
      (c) => c.sourcePortId === portId || c.targetPortId === portId
    );
  },

  importCables: (cables: Cable[]) => {
    set({ cables });
  },

  exportCables: () => {
    return get().cables;
  },

  clearCables: () => {
    set({ cables: [] });
  },
}));

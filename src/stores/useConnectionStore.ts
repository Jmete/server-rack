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
import { useRackStore } from './useRackStore';
import { buildEquipmentBoundsWithShelfItems, computeCableRoute } from '@/lib/cableRouting';
import { useShelfStore } from './useShelfStore';
import { mmToScene } from '@/constants';

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

    const rackState = useRackStore.getState();
    const shelfItemsMap = useShelfStore.getState().shelfItems;
    const equipmentBounds = buildEquipmentBoundsWithShelfItems(
      rackState.equipment,
      shelfItemsMap,
      rackState.rack.config.depth
    );
    const startBounds = connectionMode.sourcePortId
      ? equipmentBounds.find((box) =>
          connectionMode.sourcePortId!.startsWith(`${box.id}-`)
        )
      : undefined;
    const endBounds = equipmentBounds.find((box) =>
      portId.startsWith(`${box.id}-`)
    );
    const startCenterZ = startBounds ? (startBounds.min.z + startBounds.max.z) / 2 : 0;
    const endCenterZ = endBounds ? (endBounds.min.z + endBounds.max.z) / 2 : 0;
    const startSide = startBounds && sourcePos
      ? (sourcePos[2] >= startCenterZ ? 'front' : 'back')
      : undefined;
    const endSide = endBounds && targetPos
      ? (targetPos[2] >= endCenterZ ? 'front' : 'back')
      : undefined;
    const route = sourcePos && targetPos
      ? computeCableRoute({
          start: sourcePos,
          end: targetPos,
          equipmentBounds,
          rackDepthMm: rackState.rack.config.depth,
          rackSize: rackState.rack.config.size,
          rackSlots: rackState.rack.slots,
          clearance: mmToScene(10),
          exitClearance: mmToScene(8),
          startSide,
          endSide,
        })
      : null;
    const sceneToMm = 1 / mmToScene(1);
    const routeMm = route
      ? route.reduce((total, point, index) => {
          if (index === 0) return 0;
          const prev = route[index - 1];
          return total + Math.hypot(
            point[0] - prev[0],
            point[1] - prev[1],
            point[2] - prev[2]
          );
        }, 0) * sceneToMm
      : null;

    // Create the cable
    const cable = {
      ...createCable(
        connectionMode.sourcePortId,
        portId,
        connectionMode.cableType,
        connectionMode.cableColor
      ),
      length: routeMm
        ? Math.round(routeMm * 1.1)
        : directMm
        ? Math.round(directMm * 1.1)
        : undefined,
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

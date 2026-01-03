import { create } from 'zustand';

export type SidebarTab = 'catalog' | 'properties' | 'connections' | 'export';

interface UIState {
  // Selection state
  selectedEquipmentId: string | null;
  selectedCableId: string | null;
  hoveredPortId: string | null;
  selectedPortId: string | null;
  hoveredEquipmentId: string | null;

  // Sidebar state
  sidebarTab: SidebarTab;

  // Camera state
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];

  // Drag state
  isDragging: boolean;
  draggedEquipmentType: string | null;
  rackScreenBounds: { left: number; top: number; width: number; height: number } | null;
  rackSlotBounds: { slotNumber: number; left: number; top: number; width: number; height: number }[] | null;
  equipmentScreenBounds: { instanceId: string; left: number; top: number; width: number; height: number }[] | null;
  rackHover: { start: number; count: number; valid: boolean } | null;

  // Selection actions
  selectEquipment: (id: string | null) => void;
  selectCable: (id: string | null) => void;
  setHoveredPort: (id: string | null) => void;
  selectPort: (id: string | null) => void;
  setHoveredEquipment: (id: string | null) => void;

  // Sidebar actions
  setSidebarTab: (tab: SidebarTab) => void;

  // Camera actions
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  resetCamera: () => void;

  // Drag actions
  setIsDragging: (isDragging: boolean) => void;
  setDraggedEquipmentType: (type: string | null) => void;
  setRackScreenBounds: (bounds: { left: number; top: number; width: number; height: number } | null) => void;
  setRackSlotBounds: (
    bounds: { slotNumber: number; left: number; top: number; width: number; height: number }[] | null
  ) => void;
  setEquipmentScreenBounds: (
    bounds: { instanceId: string; left: number; top: number; width: number; height: number }[] | null
  ) => void;
  setRackHover: (hover: { start: number; count: number; valid: boolean } | null) => void;

  // Utility
  clearSelection: () => void;
}

const defaultCameraPosition: [number, number, number] = [3, 4, 5];
const defaultCameraTarget: [number, number, number] = [0, 1.5, 0];

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  selectedEquipmentId: null,
  selectedCableId: null,
  hoveredPortId: null,
  selectedPortId: null,
  hoveredEquipmentId: null,
  sidebarTab: 'catalog',
  cameraPosition: defaultCameraPosition,
  cameraTarget: defaultCameraTarget,
  isDragging: false,
  draggedEquipmentType: null,
  rackScreenBounds: null,
  rackSlotBounds: null,
  equipmentScreenBounds: null,
  rackHover: null,

  // Selection actions
  selectEquipment: (id: string | null) => {
    set({
      selectedEquipmentId: id,
      selectedCableId: null, // Clear cable selection when selecting equipment
      selectedPortId: null,
    });
  },

  selectCable: (id: string | null) => {
    set({
      selectedCableId: id,
      selectedEquipmentId: null, // Clear equipment selection when selecting cable
      selectedPortId: null,
    });
  },

  setHoveredPort: (id: string | null) => {
    set({ hoveredPortId: id });
  },

  selectPort: (id: string | null) => {
    set({ selectedPortId: id });
  },

  setHoveredEquipment: (id: string | null) => {
    set({ hoveredEquipmentId: id });
  },

  // Sidebar actions
  setSidebarTab: (tab: SidebarTab) => {
    set({ sidebarTab: tab });
  },

  // Camera actions
  setCameraPosition: (position: [number, number, number]) => {
    set({ cameraPosition: position });
  },

  setCameraTarget: (target: [number, number, number]) => {
    set({ cameraTarget: target });
  },

  resetCamera: () => {
    set({
      cameraPosition: defaultCameraPosition,
      cameraTarget: defaultCameraTarget,
    });
  },

  // Drag actions
  setIsDragging: (isDragging: boolean) => {
    set({ isDragging });
  },

  setDraggedEquipmentType: (type: string | null) => {
    set({ draggedEquipmentType: type });
  },

  setRackScreenBounds: (bounds) => {
    set({ rackScreenBounds: bounds });
  },

  setRackSlotBounds: (bounds) => {
    set({ rackSlotBounds: bounds });
  },

  setEquipmentScreenBounds: (bounds) => {
    set({ equipmentScreenBounds: bounds });
  },

  setRackHover: (hover) => {
    set({ rackHover: hover });
  },

  // Utility
  clearSelection: () => {
    set({
      selectedEquipmentId: null,
      selectedCableId: null,
      selectedPortId: null,
    });
  },
}));

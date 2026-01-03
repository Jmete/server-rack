import { create } from 'zustand';

export type SidebarTab = 'catalog' | 'properties' | 'connections' | 'export';

interface UIState {
  // Selection state
  selectedEquipmentId: string | null;
  selectedCableId: string | null;
  hoveredPortId: string | null;
  hoveredEquipmentId: string | null;

  // Sidebar state
  sidebarTab: SidebarTab;

  // Camera state
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];

  // Drag state
  isDragging: boolean;
  draggedEquipmentType: string | null;

  // Selection actions
  selectEquipment: (id: string | null) => void;
  selectCable: (id: string | null) => void;
  setHoveredPort: (id: string | null) => void;
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
  hoveredEquipmentId: null,
  sidebarTab: 'catalog',
  cameraPosition: defaultCameraPosition,
  cameraTarget: defaultCameraTarget,
  isDragging: false,
  draggedEquipmentType: null,

  // Selection actions
  selectEquipment: (id: string | null) => {
    set({
      selectedEquipmentId: id,
      selectedCableId: null, // Clear cable selection when selecting equipment
    });
  },

  selectCable: (id: string | null) => {
    set({
      selectedCableId: id,
      selectedEquipmentId: null, // Clear equipment selection when selecting cable
    });
  },

  setHoveredPort: (id: string | null) => {
    set({ hoveredPortId: id });
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

  // Utility
  clearSelection: () => {
    set({
      selectedEquipmentId: null,
      selectedCableId: null,
    });
  },
}));

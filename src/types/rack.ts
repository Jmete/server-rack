export type RackSize = 42 | 48;
export type RackWidth = 19; // inches, standard

export interface RackConfig {
  id: string;
  name: string;
  size: RackSize;
  width: RackWidth;
  depth: number; // in mm (600-1200 typical)
}

export interface RackSlot {
  position: number; // U position (1-42 or 1-48)
  occupied: boolean;
  equipmentId: string | null;
}

export interface Rack {
  config: RackConfig;
  slots: RackSlot[];
}

// Helper to create initial slots for a rack
export function createRackSlots(size: RackSize): RackSlot[] {
  return Array.from({ length: size }, (_, i) => ({
    position: i + 1,
    occupied: false,
    equipmentId: null,
  }));
}

// Default rack configuration
export function createDefaultRack(): Rack {
  return {
    config: {
      id: 'rack-1',
      name: 'Server Rack 1',
      size: 42,
      width: 19,
      depth: 1000,
    },
    slots: createRackSlots(42),
  };
}

export type RackSize = number; // 1-48 U
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
export function createRackSlots(size: number): RackSlot[] {
  return Array.from({ length: size }, (_, i) => ({
    position: i + 1,
    occupied: false,
    equipmentId: null,
  }));
}

// Default rack configuration
// Default depth: 32 inches (~800mm Ubiquiti standard)
export function createDefaultRack(): Rack {
  return {
    config: {
      id: 'rack-1',
      name: 'Server Rack 1',
      size: 42,
      width: 19,
      depth: 813, // 32 inches in mm (32 * 25.4 ≈ 813mm)
    },
    slots: createRackSlots(42),
  };
}

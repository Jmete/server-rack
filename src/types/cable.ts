export type CableType =
  | 'ethernet-cat5e'
  | 'ethernet-cat6'
  | 'ethernet-cat6a'
  | 'fiber-lc'
  | 'fiber-sc'
  | 'power-iec'
  | 'power-uk';

export interface CableColor {
  name: string;
  hex: string;
}

export interface Cable {
  id: string;
  type: CableType;
  color: CableColor;
  sourcePortId: string; // Global port ID
  targetPortId: string; // Global port ID
  label?: string;
  length?: number; // mm of cable length for slack control
}

// Predefined cable colors
export const CABLE_COLORS: CableColor[] = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Black', hex: '#1f2937' },
];

// Cable type display names
export const CABLE_TYPE_LABELS: Record<CableType, string> = {
  'ethernet-cat5e': 'Cat5e Ethernet',
  'ethernet-cat6': 'Cat6 Ethernet',
  'ethernet-cat6a': 'Cat6a Ethernet',
  'fiber-lc': 'Fiber LC',
  'fiber-sc': 'Fiber SC',
  'power-iec': 'IEC Power',
  'power-uk': 'UK Power',
};

// Cable type to compatible port types mapping
export const CABLE_PORT_COMPATIBILITY: Record<CableType, string[]> = {
  'ethernet-cat5e': ['rj45-lan', 'rj45-wan'],
  'ethernet-cat6': ['rj45-lan', 'rj45-wan'],
  'ethernet-cat6a': ['rj45-lan', 'rj45-wan'],
  'fiber-lc': ['sfp-plus'],
  'fiber-sc': ['sfp-plus'],
  'power-iec': ['power-iec-c13', 'power-iec-c14'],
  'power-uk': ['uk-outlet-bs1363'],
};

// Helper to check if two ports can be connected with a given cable type
export function canConnect(
  sourcePortType: string,
  targetPortType: string,
  cableType: CableType
): boolean {
  const compatiblePorts = CABLE_PORT_COMPATIBILITY[cableType];
  return (
    compatiblePorts.includes(sourcePortType) &&
    compatiblePorts.includes(targetPortType)
  );
}

// Helper to create a cable
export function createCable(
  sourcePortId: string,
  targetPortId: string,
  type: CableType,
  color: CableColor
): Cable {
  return {
    id: `cable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    color,
    sourcePortId,
    targetPortId,
  };
}

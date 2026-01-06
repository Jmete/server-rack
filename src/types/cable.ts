export type CableType =
  | 'ethernet-cat5e'
  | 'ethernet-cat6'
  | 'ethernet-cat6a'
  | 'fiber-lc'
  | 'fiber-sc'
  | 'phone-rj11'
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
  'phone-rj11': 'RJ11 Phone',
  'power-iec': 'IEC Power',
  'power-uk': 'UK to IEC',
};

// Cable type to compatible port types mapping
export const CABLE_PORT_COMPATIBILITY: Record<CableType, string[]> = {
  'ethernet-cat5e': ['rj45-lan', 'rj45-wan'],
  'ethernet-cat6': ['rj45-lan', 'rj45-wan'],
  'ethernet-cat6a': ['rj45-lan', 'rj45-wan'],
  'fiber-lc': ['sfp-plus'],
  'fiber-sc': ['sfp-plus'],
  'phone-rj11': ['fxo', 'fxs'],
  'power-iec': ['power-iec-c13', 'power-iec-c14'],
  'power-uk': ['uk-outlet-bs1363', 'power-iec-c14'],
};

// Helper to check if two ports can be connected with a given cable type
export function canConnect(
  sourcePortType: string,
  targetPortType: string,
  cableType: CableType
): boolean {
  if (cableType === 'phone-rj11') {
    return (
      (sourcePortType === 'fxo' && targetPortType === 'fxs') ||
      (sourcePortType === 'fxs' && targetPortType === 'fxo') ||
      (sourcePortType === 'fxo' && targetPortType === 'fxo') ||
      (sourcePortType === 'fxs' && targetPortType === 'fxs')
    );
  }
  if (cableType === 'power-iec') {
    return (
      (sourcePortType === 'power-iec-c13' && targetPortType === 'power-iec-c14') ||
      (sourcePortType === 'power-iec-c14' && targetPortType === 'power-iec-c13')
    );
  }
  if (cableType === 'power-uk') {
    return (
      (sourcePortType === 'uk-outlet-bs1363' && targetPortType === 'power-iec-c14') ||
      (sourcePortType === 'power-iec-c14' && targetPortType === 'uk-outlet-bs1363')
    );
  }
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

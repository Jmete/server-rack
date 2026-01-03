export type PortType =
  | 'rj45-lan'
  | 'rj45-wan'
  | 'sfp-plus'
  | 'usb'
  | 'power-iec-c13'
  | 'power-iec-c14'
  | 'uk-outlet-bs1363';

export type PortSpeed =
  | '100M'
  | '1G'
  | '2.5G'
  | '10G'
  | '25G'
  | 'power'
  | 'n/a';

export type PortStatus = 'disconnected' | 'connected' | 'active';

export interface PortPosition {
  x: number; // horizontal position from left edge (mm)
  y: number; // vertical position from bottom edge (mm)
  z: number; // depth from front face (mm)
}

export interface PortDefinition {
  id: string;
  type: PortType;
  label: string;
  customLabel?: string;
  position: PortPosition;
  speed?: PortSpeed;
  poe?: boolean;
  row?: number; // For multi-row layouts (e.g., switches)
  column?: number;
}

export interface Port extends PortDefinition {
  equipmentInstanceId: string;
  globalId: string; // Unique across all equipment: `${equipmentInstanceId}-${id}`
  connectedTo: string | null; // globalId of connected port
  status: PortStatus;
}

// Helper to create port instances from definitions
export function createPortInstances(
  definitions: PortDefinition[],
  equipmentInstanceId: string
): Port[] {
  return definitions.map((def) => ({
    ...def,
    equipmentInstanceId,
    globalId: `${equipmentInstanceId}-${def.id}`,
    connectedTo: null,
    status: 'disconnected' as PortStatus,
  }));
}

// Port type display names
export const PORT_TYPE_LABELS: Record<PortType, string> = {
  'rj45-lan': 'RJ45 LAN',
  'rj45-wan': 'RJ45 WAN',
  'sfp-plus': 'SFP+',
  'usb': 'USB',
  'power-iec-c13': 'IEC C13',
  'power-iec-c14': 'IEC C14',
  'uk-outlet-bs1363': 'UK BS1363',
};

// Port type colors for visualization
export const PORT_TYPE_COLORS: Record<PortType, string> = {
  'rj45-lan': '#22c55e', // green
  'rj45-wan': '#f59e0b', // amber
  'sfp-plus': '#3b82f6', // blue
  'usb': '#6b7280', // gray
  'power-iec-c13': '#ef4444', // red
  'power-iec-c14': '#ef4444', // red
  'uk-outlet-bs1363': '#ef4444', // red
};

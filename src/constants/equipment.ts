import { EquipmentDefinition, PortDefinition } from '@/types';
import { EQUIPMENT_COLORS } from './colors';

// Helper to generate RJ45 port positions for a switch
function generateSwitchPorts(
  count: number,
  startX: number,
  spacing: number,
  rows: 1 | 2 = 1
): PortDefinition[] {
  const ports: PortDefinition[] = [];
  const portsPerRow = rows === 2 ? count / 2 : count;

  for (let i = 0; i < count; i++) {
    const row = rows === 2 ? (i % 2) : 0;
    const col = rows === 2 ? Math.floor(i / 2) : i;
    const portNum = i + 1;

    ports.push({
      id: `port-${portNum}`,
      type: 'rj45-lan',
      label: `${portNum}`,
      position: {
        x: startX + col * spacing,
        y: row === 0 ? 28 : 16, // Top row higher, bottom row lower
        z: 0,
      },
      speed: '1G',
      poe: true,
      row,
      column: col,
    });
  }

  return ports;
}

// UDM Pro Router
export const UDM_PRO: EquipmentDefinition = {
  id: 'udm-pro',
  type: 'router',
  name: 'UDM Pro',
  model: 'UDM-Pro',
  manufacturer: 'Ubiquiti',
  heightU: 1,
  width: 442.4,
  depth: 285.6,
  color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
  ports: [
    // WAN Port
    {
      id: 'wan-1',
      type: 'rj45-wan',
      label: 'WAN',
      position: { x: 280, y: 22, z: 0 },
      speed: '1G',
    },
    // LAN Ports 1-8
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `lan-${i + 1}`,
      type: 'rj45-lan' as const,
      label: `LAN ${i + 1}`,
      position: { x: 120 + i * 18, y: 22, z: 0 },
      speed: '1G' as const,
    })),
    // SFP+ Ports
    {
      id: 'sfp-1',
      type: 'sfp-plus',
      label: 'SFP+ 1',
      position: { x: 320, y: 22, z: 0 },
      speed: '10G',
    },
    {
      id: 'sfp-2',
      type: 'sfp-plus',
      label: 'SFP+ 2',
      position: { x: 350, y: 22, z: 0 },
      speed: '10G',
    },
  ],
  features: [
    {
      type: 'display',
      position: { x: 40, y: 22, z: 0 },
      size: { width: 33, height: 33 },
      label: 'LCD',
    },
  ],
};

// USW Pro 48 PoE Switch
export const USW_PRO_48_POE: EquipmentDefinition = {
  id: 'usw-pro-48-poe',
  type: 'switch',
  name: 'USW Pro 48 PoE',
  model: 'USW-Pro-48-POE',
  manufacturer: 'Ubiquiti',
  heightU: 1,
  width: 442.4,
  depth: 399.6,
  color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
  ports: [
    // 48 RJ45 ports in 2 rows
    ...generateSwitchPorts(48, 60, 7.5, 2),
    // SFP+ Ports
    {
      id: 'sfp-49',
      type: 'sfp-plus',
      label: 'SFP+ 49',
      position: { x: 400, y: 28, z: 0 },
      speed: '10G',
    },
    {
      id: 'sfp-50',
      type: 'sfp-plus',
      label: 'SFP+ 50',
      position: { x: 400, y: 16, z: 0 },
      speed: '10G',
    },
    {
      id: 'sfp-51',
      type: 'sfp-plus',
      label: 'SFP+ 51',
      position: { x: 420, y: 28, z: 0 },
      speed: '10G',
    },
    {
      id: 'sfp-52',
      type: 'sfp-plus',
      label: 'SFP+ 52',
      position: { x: 420, y: 16, z: 0 },
      speed: '10G',
    },
  ],
  features: [
    {
      type: 'display',
      position: { x: 25, y: 22, z: 0 },
      size: { width: 33, height: 33 },
      label: 'LCD',
    },
  ],
};

// USW Pro 24 PoE Switch (400W)
export const USW_PRO_24_POE: EquipmentDefinition = {
  id: 'usw-pro-24-poe',
  type: 'switch',
  name: 'USW Pro 24 PoE',
  model: 'USW-Pro-24-POE',
  manufacturer: 'Ubiquiti',
  heightU: 1,
  width: 442.4,
  depth: 399.6,
  color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
  ports: [
    // 24 RJ45 ports in 2 rows of 12
    ...generateSwitchPorts(24, 110, 7.5, 2),
    // 2 SFP+ Ports (stacked vertically)
    {
      id: 'sfp-25',
      type: 'sfp-plus',
      label: 'SFP+ 1',
      position: { x: 408, y: 28, z: 0 },
      speed: '10G',
    },
    {
      id: 'sfp-26',
      type: 'sfp-plus',
      label: 'SFP+ 2',
      position: { x: 408, y: 16, z: 0 },
      speed: '10G',
    },
  ],
  features: [
    {
      type: 'display',
      position: { x: 25, y: 22, z: 0 },
      size: { width: 33, height: 33 },
      label: 'LCD',
    },
  ],
};

// 24-Port Patch Panel
export const PATCH_PANEL_24: EquipmentDefinition = {
  id: 'patch-panel-24',
  type: 'patch-panel',
  name: '24-Port Patch Panel',
  model: 'Keystone 24',
  manufacturer: 'Generic',
  heightU: 1,
  width: 482.6,
  depth: 50,
  color: EQUIPMENT_COLORS.BLACK,
  ports: Array.from({ length: 24 }, (_, i) => ({
    id: `port-${i + 1}`,
    type: 'rj45-lan' as const,
    label: `${i + 1}`,
    position: { x: 30 + i * 18, y: 22, z: 0 },
    speed: '1G' as const,
    column: i,
  })),
  features: [],
};

// Rack UPS (2U)
export const RACK_UPS: EquipmentDefinition = {
  id: 'rack-ups-2u',
  type: 'ups',
  name: 'Rack UPS 1500VA',
  model: 'Smart-UPS 1500',
  manufacturer: 'Generic',
  heightU: 2,
  width: 432,
  depth: 438,
  color: EQUIPMENT_COLORS.BLACK,
  ports: [
    // Power outlets (typically on rear, but shown for visualization)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `outlet-${i + 1}`,
      type: 'power-iec-c13' as const,
      label: `Out ${i + 1}`,
      position: { x: 100 + i * 50, y: 44, z: 0 },
      speed: 'power' as const,
    })),
  ],
  features: [
    {
      type: 'display',
      position: { x: 216, y: 55, z: 0 },
      size: { width: 60, height: 35 },
      label: 'LCD Status',
    },
    {
      type: 'led',
      position: { x: 50, y: 60, z: 0 },
      label: 'Online',
      color: '#22c55e',
    },
    {
      type: 'led',
      position: { x: 70, y: 60, z: 0 },
      label: 'Battery',
      color: '#f59e0b',
    },
    {
      type: 'power-button',
      position: { x: 380, y: 55, z: 0 },
    },
  ],
};

// UK PDU
export const UK_PDU: EquipmentDefinition = {
  id: 'pdu-uk',
  type: 'pdu',
  name: 'UK PDU 8-Way',
  model: '8-Way BS1363',
  manufacturer: 'Generic',
  heightU: 1,
  width: 482.6,
  depth: 44.5,
  color: EQUIPMENT_COLORS.BLACK,
  ports: Array.from({ length: 8 }, (_, i) => ({
    id: `outlet-${i + 1}`,
    type: 'uk-outlet-bs1363' as const,
    label: `${i + 1}`,
    position: { x: 50 + i * 52, y: 22, z: 0 },
    speed: 'power' as const,
    column: i,
  })),
  features: [
    {
      type: 'power-button',
      position: { x: 20, y: 22, z: 0 },
    },
    {
      type: 'led',
      position: { x: 460, y: 22, z: 0 },
      label: 'Power',
      color: '#22c55e',
    },
  ],
};

// Export all equipment as catalog
export const EQUIPMENT_CATALOG: EquipmentDefinition[] = [
  UDM_PRO,
  USW_PRO_48_POE,
  USW_PRO_24_POE,
  PATCH_PANEL_24,
  RACK_UPS,
  UK_PDU,
];

// Get equipment by ID
export function getEquipmentById(id: string): EquipmentDefinition | undefined {
  return EQUIPMENT_CATALOG.find((eq) => eq.id === id);
}

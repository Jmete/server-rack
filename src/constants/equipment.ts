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

// FortiGate 100F Firewall
export const FORTIGATE_100F: EquipmentDefinition = {
  id: 'fortigate-100f',
  type: 'router',
  name: 'FortiGate 100F',
  model: 'FortiGate 100F',
  manufacturer: 'Fortinet',
  heightU: 1,
  width: 442.4,
  depth: 330,
  color: EQUIPMENT_COLORS.STEEL,
  ports: [
    // USB port (front)
    {
      id: 'usb-1',
      type: 'usb',
      label: 'USB',
      position: { x: 60, y: 22, z: 0 },
      speed: 'n/a',
    },
    // Console RJ45 port
    {
      id: 'console-1',
      type: 'rj45-console',
      label: 'Console',
      position: { x: 115, y: 22, z: 0 },
      speed: 'n/a',
    },
    // MGMT/DMZ ports (2x RJ45)
    {
      id: 'dmz-1',
      type: 'rj45-lan',
      label: 'DMZ',
      position: { x: 138, y: 28, z: 0 },
      speed: '1G',
    },
    {
      id: 'mgmt-1',
      type: 'rj45-lan',
      label: 'MGMT',
      position: { x: 138, y: 16, z: 0 },
      speed: '1G',
    },
    // WAN ports (2x RJ45)
    {
      id: 'wan-1',
      type: 'rj45-wan',
      label: 'WAN1',
      position: { x: 161, y: 28, z: 0 },
      speed: '1G',
    },
    {
      id: 'wan-2',
      type: 'rj45-wan',
      label: 'WAN2',
      position: { x: 161, y: 16, z: 0 },
      speed: '1G',
    },
    // HA ports (2x RJ45)
    {
      id: 'ha-1',
      type: 'rj45-lan',
      label: 'HA1',
      position: { x: 176, y: 28, z: 0 },
      speed: '1G',
    },
    {
      id: 'ha-2',
      type: 'rj45-lan',
      label: 'HA2',
      position: { x: 176, y: 16, z: 0 },
      speed: '1G',
    },
    // LAN ports 1-4 (part of the first 8x RJ45 block)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `lan-${i + 1}`,
      type: 'rj45-lan' as const,
      label: `${i + 1}`,
      position: {
        x: 191 + Math.floor(i / 2) * 15,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '1G' as const,
      row: i % 2,
      column: Math.floor(i / 2),
    })),
    // LAN ports 5-12 (second 8x RJ45 block)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `lan-${i + 5}`,
      type: 'rj45-lan' as const,
      label: `${i + 5}`,
      position: {
        x: 214 + Math.floor(i / 2) * 15,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '1G' as const,
      row: i % 2,
      column: Math.floor(i / 2),
    })),
    // 2x 10G SFP+ FortiLink
    {
      id: 'fortilink-1',
      type: 'sfp-plus',
      label: 'X1',
      position: { x: 267, y: 28, z: 0 },
      speed: '10G',
    },
    {
      id: 'fortilink-2',
      type: 'sfp-plus',
      label: 'X2',
      position: { x: 267, y: 16, z: 0 },
      speed: '10G',
    },
    // 4x GE SFP ports (13-16)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `sfp-${i + 13}`,
      type: 'sfp-plus' as const,
      label: `${i + 13}`,
      position: {
        x: 287 + Math.floor(i / 2) * 12,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '1G' as const,
    })),
    // 4x GE SFP shared media pairs (17-20)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `shared-sfp-${i + 17}`,
      type: 'sfp-plus' as const,
      label: `${i + 17}`,
      position: {
        x: 311 + Math.floor(i / 2) * 12,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '1G' as const,
    })),
    // 4x GE RJ45 shared media pairs (17-20)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `shared-rj45-${i + 17}`,
      type: 'rj45-lan' as const,
      label: `${i + 17}`,
      position: {
        x: 331 + Math.floor(i / 2) * 23,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '1G' as const,
    })),
    // Dual AC power inlets (rear)
    {
      id: 'power-1',
      type: 'power-iec-c14',
      label: 'PSU 1',
      position: { x: 30, y: 22, z: 330 },
      speed: 'power',
    },
    {
      id: 'power-2',
      type: 'power-iec-c14',
      label: 'PSU 2',
      position: { x: 412, y: 22, z: 330 },
      speed: 'power',
    },
  ],
  features: [],
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

// TP-Link T1600G-52PS Switch
export const TPLINK_T1600G_52PS: EquipmentDefinition = {
  id: 'tplink-t1600g-52ps',
  type: 'switch',
  name: 'TP-Link T1600G-52PS',
  model: 'T1600G-52PS',
  manufacturer: 'TP-Link',
  heightU: 1,
  width: 442.4,
  depth: 294,
  color: EQUIPMENT_COLORS.BLACK,
  ports: [
    // 48 RJ45 PoE ports in 2 rows
    ...generateSwitchPorts(48, 70, 7.5, 2),
    // 4 SFP ports (2x2 block)
    {
      id: 'sfp-49',
      type: 'sfp-plus',
      label: 'SFP 49',
      position: { x: 395, y: 28, z: 0 },
      speed: '1G',
    },
    {
      id: 'sfp-50',
      type: 'sfp-plus',
      label: 'SFP 50',
      position: { x: 395, y: 16, z: 0 },
      speed: '1G',
    },
    {
      id: 'sfp-51',
      type: 'sfp-plus',
      label: 'SFP 51',
      position: { x: 415, y: 28, z: 0 },
      speed: '1G',
    },
    {
      id: 'sfp-52',
      type: 'sfp-plus',
      label: 'SFP 52',
      position: { x: 415, y: 16, z: 0 },
      speed: '1G',
    },
    // Back power inlet
    {
      id: 'power-1',
      type: 'power-iec-c14',
      label: 'Power',
      position: { x: 420, y: 22, z: 294 },
      speed: 'power',
    },
  ],
  features: [],
};

// TP-Link T1600G-28PS Switch
export const TPLINK_T1600G_28PS: EquipmentDefinition = {
  id: 'tplink-t1600g-28ps',
  type: 'switch',
  name: 'TP-Link T1600G-28PS',
  model: 'T1600G-28PS',
  manufacturer: 'TP-Link',
  heightU: 1,
  width: 442.4,
  depth: 294,
  color: EQUIPMENT_COLORS.BLACK,
  ports: [
    // 24 RJ45 PoE+ ports in 2 rows
    ...generateSwitchPorts(24, 150, 7.5, 2),
    // 4 SFP ports
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `sfp-${i + 25}`,
      type: 'sfp-plus' as const,
      label: `SFP ${i + 25}`,
      position: { x: 380 + i * 12, y: 22, z: 0 },
      speed: '1G' as const,
    })),
    // Back power inlet
    {
      id: 'power-1',
      type: 'power-iec-c14',
      label: 'Power',
      position: { x: 420, y: 22, z: 294 },
      speed: 'power',
    },
  ],
  features: [],
};

// Huawei SmartAX MA5822S (16 GE + 16 POTS)
export const HUAWEI_MA5822S_16GE_16POTS: EquipmentDefinition = {
  id: 'huawei-ma5822s-16ge-16pots',
  type: 'switch',
  name: 'Huawei SmartAX MA5822S',
  model: 'MA5822S (16GE + 16POTS)',
  manufacturer: 'Huawei',
  heightU: 1,
  width: 442.4,
  depth: 220,
  color: EQUIPMENT_COLORS.STEEL,
  ports: [
    // AC power port (front left)
    {
      id: 'power-1',
      type: 'power-iec-c14',
      label: 'AC',
      position: { x: 30, y: 22, z: 0 },
      speed: 'power',
    },
    // Uplink optical port (SFP)
    {
      id: 'sfp-1',
      type: 'sfp-plus',
      label: 'Uplink',
      position: { x: 100, y: 22, z: 0 },
      speed: '10G',
    },
    // Serial console port
    {
      id: 'console-1',
      type: 'rj45-console',
      label: 'Console',
      position: { x: 124, y: 22, z: 0 },
      speed: 'n/a',
    },
    // 16 GE electrical ports
    ...Array.from({ length: 16 }, (_, i) => ({
      id: `ge-${i + 1}`,
      type: 'rj45-lan' as const,
      label: `${i + 1}`,
      position: { x: 150 + i * 13, y: 22, z: 0 },
      speed: '1G' as const,
      column: i,
    })),
    // POTS port block (16 lines)
    {
      id: 'pots-1',
      type: 'fxs',
      label: 'POTS 1-16',
      position: { x: 410, y: 22, z: 0 },
      speed: 'n/a',
    },
  ],
  features: [],
};

// USW Aggregation Switch (8x 10G SFP+)
export const USW_AGGREGATION: EquipmentDefinition = {
  id: 'usw-aggregation',
  type: 'switch',
  name: 'USW Aggregation',
  model: 'USW-Aggregation',
  manufacturer: 'Ubiquiti',
  heightU: 1,
  width: 442.4,
  depth: 399.6,
  color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
  ports: [
    // 8 SFP+ Ports in 2 rows of 4
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `sfp-${i + 1}`,
      type: 'sfp-plus' as const,
      label: `${i + 1}`,
      position: {
        x: 320 + Math.floor(i / 2) * 18,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '10G' as const,
    })),
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

// USW Pro Aggregation Switch (28x 10G SFP+ + 4x 25G SFP28)
export const USW_PRO_AGGREGATION: EquipmentDefinition = {
  id: 'usw-pro-aggregation',
  type: 'switch',
  name: 'USW Pro Aggregation',
  model: 'USW-Pro-Aggregation',
  manufacturer: 'Ubiquiti',
  heightU: 1,
  width: 442.4,
  depth: 399.6,
  color: EQUIPMENT_COLORS.UBIQUITI_SILVER,
  ports: [
    // 28 SFP+ Ports (10G) in 2 rows of 14
    ...Array.from({ length: 28 }, (_, i) => ({
      id: `sfp-${i + 1}`,
      type: 'sfp-plus' as const,
      label: `${i + 1}`,
      position: {
        x: 95 + Math.floor(i / 2) * 14,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '10G' as const,
    })),
    // 4 SFP28 Ports (25G) in 2x2 grid
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `sfp28-${i + 1}`,
      type: 'sfp-plus' as const,
      label: `${29 + i}`,
      position: {
        x: 395 + Math.floor(i / 2) * 18,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: '25G' as const,
    })),
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

// Grandstream UCM6208 PBX
export const UCM6208: EquipmentDefinition = {
  id: 'ucm6208',
  type: 'pbx',
  name: 'UCM6208',
  model: 'UCM6208',
  manufacturer: 'Grandstream',
  heightU: 1,
  width: 440,
  depth: 292,
  color: EQUIPMENT_COLORS.BLACK,
  ports: [
    // === FRONT PORTS ===
    // USB Port (front left)
    {
      id: 'usb-1',
      type: 'usb',
      label: 'USB',
      position: { x: 25, y: 22, z: 0 },
      speed: 'n/a',
    },
    // 2x FXS Ports (for analog phones)
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `fxs-${i + 1}`,
      type: 'fxs' as const,
      label: `${i + 1}`,
      position: { x: 95 + i * 18, y: 22, z: 0 },
      speed: 'n/a' as const,
    })),
    // 8x FXO Ports (2 rows of 4, for phone lines)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `fxo-${i + 1}`,
      type: 'fxo' as const,
      label: `${i + 1}`,
      position: {
        x: 160 + Math.floor(i / 2) * 18,
        y: i % 2 === 0 ? 28 : 16,
        z: 0,
      },
      speed: 'n/a' as const,
    })),
    // === BACK PORTS ===
    // LAN Port (RJ45) - for network connection
    {
      id: 'lan-1',
      type: 'rj45-lan',
      label: 'LAN',
      position: { x: 200, y: 22, z: 292 },
      speed: '1G',
    },
    // WAN Port (RJ45) - for external network/internet
    {
      id: 'wan-1',
      type: 'rj45-wan',
      label: 'WAN',
      position: { x: 230, y: 22, z: 292 },
      speed: '1G',
    },
  ],
  features: [
    {
      type: 'display',
      position: { x: 370, y: 22, z: 0 },
      size: { width: 55, height: 22 },
      label: 'LCD',
    },
  ],
};

// Hikvision iDS-7208HQHI-M1/S DVR
export const HIKVISION_IDS_7208HQHI_M1S: EquipmentDefinition = {
  id: 'hikvision-ids-7208hqhi-m1s',
  type: 'dvr',
  name: 'Hikvision iDS-7208HQHI-M1/S',
  model: 'iDS-7208HQHI-M1/S',
  manufacturer: 'Hikvision',
  heightU: 1,
  width: 315,
  depth: 242,
  color: EQUIPMENT_COLORS.BLACK,
  ports: [
    // 8x BNC video inputs (2 rows of 4)
    ...Array.from({ length: 8 }, (_, i) => {
      const isTopRow = i < 4;
      const col = isTopRow ? i : i - 4;
      return {
        id: `video-in-${i + 1}`,
        type: 'bnc-video' as const,
        label: `${i + 1}`,
        position: {
          x: 25 + col * 16,
          y: isTopRow ? 28 : 16,
          z: 242,
        },
        speed: 'n/a' as const,
        row: isTopRow ? 0 : 1,
        column: col,
      };
    }),
    // Video out (CVBS)
    {
      id: 'video-out-1',
      type: 'bnc-video',
      label: 'Video Out',
      position: { x: 95, y: 28, z: 242 },
      speed: 'n/a',
    },
    // USB interface
    {
      id: 'usb-1',
      type: 'usb',
      label: 'USB',
      position: { x: 112, y: 16, z: 242 },
      speed: 'n/a',
    },
    // HDMI output
    {
      id: 'hdmi-1',
      type: 'hdmi',
      label: 'HDMI',
      position: { x: 145, y: 22, z: 242 },
      speed: 'n/a',
    },
    // VGA output
    {
      id: 'vga-1',
      type: 'vga',
      label: 'VGA',
      position: { x: 170, y: 22, z: 242 },
      speed: 'n/a',
    },
    // Audio out (RCA)
    {
      id: 'audio-out-1',
      type: 'rca-audio',
      label: 'Audio Out',
      position: { x: 198, y: 16, z: 242 },
      speed: 'n/a',
    },
    // Audio in (RCA)
    {
      id: 'audio-in-1',
      type: 'rca-audio',
      label: 'Audio In',
      position: { x: 198, y: 28, z: 242 },
      speed: 'n/a',
    },
    // LAN network interface
    {
      id: 'lan-1',
      type: 'rj45-lan',
      label: 'LAN',
      position: { x: 222, y: 22, z: 242 },
      speed: '100M',
    },
    // RS-485 serial interface
    {
      id: 'rs485-1',
      type: 'rs485',
      label: 'RS-485',
      position: { x: 244, y: 22, z: 242 },
      speed: 'n/a',
    },
    // 12V DC power input
    {
      id: 'power-1',
      type: 'power-dc',
      label: '12V DC',
      position: { x: 266, y: 22, z: 242 },
      speed: 'power',
    },
  ],
  features: [],
};

// Export all equipment as catalog
export const EQUIPMENT_CATALOG: EquipmentDefinition[] = [
  UDM_PRO,
  FORTIGATE_100F,
  USW_PRO_48_POE,
  USW_PRO_24_POE,
  TPLINK_T1600G_52PS,
  TPLINK_T1600G_28PS,
  HUAWEI_MA5822S_16GE_16POTS,
  USW_AGGREGATION,
  USW_PRO_AGGREGATION,
  PATCH_PANEL_24,
  RACK_UPS,
  UK_PDU,
  UCM6208,
  HIKVISION_IDS_7208HQHI_M1S,
];

// Get equipment by ID
export function getEquipmentById(id: string): EquipmentDefinition | undefined {
  return EQUIPMENT_CATALOG.find((eq) => eq.id === id);
}

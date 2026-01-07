import { ShelfItemDefinition } from '@/types/shelf';
import { EQUIPMENT_COLORS } from './colors';

// Hikvision DVR as a shelf item (non-rack-mount equipment)
export const HIKVISION_DVR_SHELF_ITEM: ShelfItemDefinition = {
  id: 'hikvision-dvr-shelf-item',
  type: 'dvr',
  name: 'Hikvision DVR',
  model: 'iDS-7208HQHI-M1/S',
  manufacturer: 'Hikvision',
  width: 315,
  depth: 242,
  heightMm: 45, // Approximately 1U height
  color: EQUIPMENT_COLORS.BLACK,
  isShelfItem: true,
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
          z: 242, // Back of device
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

// Small network appliance placeholder
export const SMALL_ROUTER_SHELF_ITEM: ShelfItemDefinition = {
  id: 'small-router-shelf-item',
  type: 'router',
  name: 'Small Router',
  model: 'Mini Router',
  manufacturer: 'Generic',
  width: 150,
  depth: 100,
  heightMm: 30,
  color: '#2a2a2a',
  isShelfItem: true,
  ports: [
    {
      id: 'wan-1',
      type: 'rj45-wan',
      label: 'WAN',
      position: { x: 20, y: 15, z: 100 },
      speed: '1G',
    },
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `lan-${i + 1}`,
      type: 'rj45-lan' as const,
      label: `LAN ${i + 1}`,
      position: { x: 45 + i * 22, y: 15, z: 100 },
      speed: '1G' as const,
    })),
    {
      id: 'power-1',
      type: 'power-dc',
      label: '12V DC',
      position: { x: 135, y: 15, z: 100 },
      speed: 'power',
    },
  ],
  features: [],
};

// Export all shelf items as catalog
export const SHELF_ITEM_CATALOG: ShelfItemDefinition[] = [
  HIKVISION_DVR_SHELF_ITEM,
  SMALL_ROUTER_SHELF_ITEM,
];

// Get shelf item by ID
export function getShelfItemById(id: string): ShelfItemDefinition | undefined {
  return SHELF_ITEM_CATALOG.find((item) => item.id === id);
}

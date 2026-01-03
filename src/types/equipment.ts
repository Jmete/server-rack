import { PortDefinition } from './port';

export type EquipmentType =
  | 'router'
  | 'switch'
  | 'patch-panel'
  | 'ups'
  | 'pdu';

export interface EquipmentFeature {
  type: 'display' | 'led' | 'power-button';
  position: { x: number; y: number; z: number };
  size?: { width: number; height: number };
  label?: string;
  color?: string;
}

export interface EquipmentDefinition {
  id: string;
  type: EquipmentType;
  name: string;
  model: string;
  manufacturer: string;
  heightU: number;
  width: number; // mm
  depth: number; // mm
  color: string; // hex color for the equipment body
  ports: PortDefinition[];
  features: EquipmentFeature[];
}

export interface Equipment extends EquipmentDefinition {
  instanceId: string;
  slotPosition: number; // Starting U position (bottom of equipment)
  customLabel?: string;
  notes?: string;
}

// Helper to create an equipment instance from a definition
export function createEquipmentInstance(
  definition: EquipmentDefinition,
  slotPosition: number
): Equipment {
  return {
    ...definition,
    instanceId: `${definition.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    slotPosition,
  };
}

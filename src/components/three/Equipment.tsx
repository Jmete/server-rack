'use client';

import { Equipment as EquipmentType } from '@/types';
import { UDMProRouter, USWProSwitch, PatchPanel, RackUPS, UKPDU } from './equipment';

interface EquipmentProps {
  equipment: EquipmentType;
  onClick?: () => void;
  isSelected?: boolean;
}

// Equipment component factory - renders the correct 3D model based on equipment type
export function Equipment({ equipment, onClick, isSelected }: EquipmentProps) {
  switch (equipment.type) {
    case 'router':
      return (
        <UDMProRouter
          equipment={equipment}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    case 'switch':
      return (
        <USWProSwitch
          equipment={equipment}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    case 'patch-panel':
      return (
        <PatchPanel
          equipment={equipment}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    case 'ups':
      return (
        <RackUPS
          equipment={equipment}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    case 'pdu':
      return (
        <UKPDU
          equipment={equipment}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    default:
      // Fallback for unknown equipment types
      console.warn(`Unknown equipment type: ${equipment.type}`);
      return null;
  }
}

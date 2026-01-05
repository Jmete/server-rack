'use client';

import { Equipment as EquipmentType } from '@/types';
import { UDMProRouter, USWProSwitch, USWPro24Switch, USWAggregationSwitch, USWProAggregationSwitch, PatchPanel, RackUPS, UKPDU } from './equipment';

interface EquipmentRendererProps {
  equipment: EquipmentType;
  onClick?: () => void;
  isSelected?: boolean;
}

// Equipment component factory - renders the correct 3D model based on equipment type
export function EquipmentRenderer({ equipment, onClick, isSelected }: EquipmentRendererProps) {
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
      if (equipment.id === 'usw-pro-24-poe') {
        return (
          <USWPro24Switch
            equipment={equipment}
            onClick={onClick}
            isSelected={isSelected}
          />
        );
      }
      if (equipment.id === 'usw-aggregation') {
        return (
          <USWAggregationSwitch
            equipment={equipment}
            onClick={onClick}
            isSelected={isSelected}
          />
        );
      }
      if (equipment.id === 'usw-pro-aggregation') {
        return (
          <USWProAggregationSwitch
            equipment={equipment}
            onClick={onClick}
            isSelected={isSelected}
          />
        );
      }
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

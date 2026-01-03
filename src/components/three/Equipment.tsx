'use client';

import { Equipment as EquipmentType } from '@/types';
import { UDMProRouter } from './equipment/UDMProRouter';

interface EquipmentProps {
  equipment: EquipmentType;
  onClick?: () => void;
  isSelected?: boolean;
}

// Equipment component factory
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
    // Other equipment types will be added in Section 5
    default:
      return null;
  }
}

'use client';

import { useUIStore } from '@/stores';
import { RackSummary } from '@/components/panels/RackSummary';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';

export function RightPanel() {
  const selectedEquipmentId = useUIStore((state) => state.selectedEquipmentId);
  const selectedCableId = useUIStore((state) => state.selectedCableId);

  const hasSelection = selectedEquipmentId !== null || selectedCableId !== null;

  return (
    <div className="w-[300px] h-full border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
      {hasSelection ? (
        <PropertiesPanel />
      ) : (
        <RackSummary />
      )}
    </div>
  );
}
